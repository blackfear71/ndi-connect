import { createContext, useEffect, useState } from 'react';

import { Spinner } from 'react-bootstrap';

import UsersService from '../api/usersService';

import { combineLatest, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

export const AuthContext = createContext(null);

/**
 * Contexte d'authentification global
 * @param {*} param0
 * @returns
 */
export const AuthProvider = ({ children }) => {
    // Local states
    const [auth, setAuth] = useState({
        isLoggedIn: false,
        login: null,
        level: 0
    });
    const [authError, setAuthError] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    /**
     * Contrôle de la connexion au lancement de l'application
     */
    useEffect(() => {
        setAuthError(null);

        const userToken = localStorage.getItem('token');

        // Vérification token présent
        if (!userToken) {
            setAuthLoading(false);
            resetAuth();
        } else {
            const usersService = new UsersService(userToken);

            const subscriptionUser = usersService.checkAuth();

            combineLatest([subscriptionUser])
                .pipe(
                    map(([dataUser]) => {
                        dataUser.response.data.authorized ? persistAuth(dataUser.response.data) : resetAuth();
                    }),
                    take(1),
                    catchError((err) => {
                        // Vérification requête abandonnée
                        if (isAbortedAjaxError(err)) {
                            return of();
                        }

                        resetAuth();
                        setAuthError({ code: err?.response?.message, type: err?.response?.status });
                        return of();
                    }),
                    finalize(() => {
                        setAuthLoading(false);
                    })
                )
                .subscribe();
        }
    }, []);

    /**
     * Connexion de l'utilisateur
     * @param {*} formData Données de connexion
     */
    const login = (formData) => {
        return new Promise((resolve, reject) => {
            setAuthError(null);

            const usersService = new UsersService();

            const subscriptionUser = usersService.connect(formData);

            combineLatest([subscriptionUser])
                .pipe(
                    map(([dataUser]) => {
                        persistAuth(dataUser.response.data);
                        resolve();
                    }),
                    take(1),
                    catchError((err) => {
                        resetAuth();
                        setAuthError({ code: err?.response?.message, type: err?.response?.status });
                        reject(err?.response?.message);
                        return of();
                    })
                )
                .subscribe();
        });
    };

    /**
     * Déconnexion de l'utilisateur
     */
    const logout = () => {
        return new Promise((resolve, reject) => {
            setAuthError(null);

            const usersService = new UsersService(localStorage.getItem('token'));

            const subscriptionUser = usersService.disconnect();

            combineLatest([subscriptionUser])
                .pipe(
                    map(([dataUser]) => {
                        resolve();
                    }),
                    take(1),
                    catchError((err) => {
                        setAuthError({ code: err?.response?.message, type: err?.response?.status });
                        reject(err?.response?.message);
                        return of();
                    }),
                    finalize(() => {
                        resetAuth();
                    })
                )
                .subscribe();
        });
    };

    /**
     * Enregistre les informations de connexion
     * @param {*} data Données utilisateur
     */
    const persistAuth = (data) => {
        setAuth({
            isLoggedIn: true,
            login: data.login,
            level: data.level
        });
        localStorage.setItem('token', data.token);
    };
    /**
     * Réinitialise les informations d'authentification
     */
    const resetAuth = () => {
        setAuth({
            isLoggedIn: false,
            login: null,
            level: 0
        });
        localStorage.clear();
    };

    /**
     * Vérification requête abandonnée (par F5 trop rapide, navigation, etc.)
     * @param {*} err Erreur
     * @returns Indicateur requête abandonnée
     */
    const isAbortedAjaxError = (err) => {
        const msg = err?.message?.toLowerCase?.();
        return err?.name === 'AjaxError' && (err?.status === 0 || msg?.includes('abort') || msg?.includes('ns_binding_aborted'));
    };

    return (
        <AuthContext.Provider value={{ auth, authError, login, logout }}>
            {authLoading ? (
                <div className="d-flex justify-content-center align-items-center vh-100">
                    <Spinner animation="border" role="status" variant="light" />
                </div>
            ) : (
                <>{children}</>
            )}
        </AuthContext.Provider>
    );
};
