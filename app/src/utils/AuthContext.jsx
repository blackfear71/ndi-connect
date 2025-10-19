import { createContext, useEffect, useState } from 'react';

import { Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

import UsersService from '../api/usersService';

import { of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

export const AuthContext = createContext(null);

const redirectPages = ['/settings'];

/**
 * Contexte d'authentification global
 */
export const AuthProvider = ({ children }) => {
    // Router
    const { pathname } = useLocation();
    const navigate = useNavigate();

    // Local states
    const [auth, setAuth] = useState({
        isLoggedIn: false,
        login: null,
        level: 0
    });
    const [authLoading, setAuthLoading] = useState(true);
    const [authMessage, setAuthMessage] = useState(null);

    /**
     * Contrôle de la connexion au lancement de l'application
     */
    useEffect(() => {
        refreshAuth(true);
    }, []);

    /**
     * Vérifie l'authentification de l'utilisateur
     * @param {*} initLoad Indicateur chargement initial de la page
     */
    const refreshAuth = (initLoad = false) => {
        setAuthMessage(null);

        const usersService = new UsersService();

        usersService
            .checkAuth(initLoad)
            .pipe(
                map((dataUser) => {
                    dataUser?.response?.data ? persistAuth(dataUser.response.data) : resetAuth();
                }),
                take(1),
                catchError((err) => {
                    // Vérification requête abandonnée
                    if (isAbortedAjaxError(err)) {
                        return of();
                    }

                    resetAuth();
                    setAuthMessage({ code: err?.response?.message, type: err?.response?.status, target: 'page' });
                    return of();
                }),
                finalize(() => {
                    setAuthLoading(false);
                })
            )
            .subscribe();
    };

    /**
     * Connexion de l'utilisateur
     * @param {*} formData Données de connexion
     */
    const login = (formData) => {
        return new Promise((resolve, reject) => {
            setAuthMessage(null);

            const usersService = new UsersService();

            usersService
                .connect(formData)
                .pipe(
                    map((dataUser) => {
                        persistAuth(dataUser.response.data);
                        setAuthMessage({ code: dataUser.response.message, type: dataUser.response.status, target: 'page' });
                        resolve();
                    }),
                    take(1),
                    catchError((err) => {
                        resetAuth();
                        setAuthMessage({ code: err?.response?.message, type: err?.response?.status, target: 'modal' });
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
            setAuthMessage(null);

            const usersService = new UsersService();

            usersService
                .disconnect()
                .pipe(
                    map((dataUser) => {
                        const message = {
                            code: dataUser.response.message,
                            type: dataUser.response.status,
                            target: 'page'
                        };
                        resolve();

                        // Redirection avec message ou affichage du message selon la page d'origine
                        if (redirectPages.includes(pathname)) {
                            navigate('/', {
                                state: {
                                    navMessage: message
                                }
                            });
                        } else {
                            setAuthMessage(message);
                        }
                    }),
                    take(1),
                    catchError((err) => {
                        setAuthMessage({ code: err?.response?.message, type: err?.response?.status, target: 'page' });
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
        <AuthContext.Provider value={{ auth, authMessage, setAuthMessage, refreshAuth, login, logout }}>
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
