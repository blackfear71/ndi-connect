import { createContext, useEffect, useState } from 'react';

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
    // TODO : gérer un utilisateur super admin (le compte admin qui peut en plus faire des suppression... les autres non), il lui faut un indicateur et des contrôles spécifiques
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authError, setAuthError] = useState('');
    const [loading, setLoading] = useState(true);

    /**
     * Contrôle de la connexion au lancement de l'application
     */
    useEffect(() => {
        const userLogin = localStorage.getItem('login');
        const userToken = localStorage.getItem('token');

        // Vérification token présent
        if (!userLogin || !userToken) {
            setLoading(false);
            setIsLoggedIn(false);
        } else {
            const usersService = new UsersService(userLogin, userToken);

            const subscriptionUser = usersService.checkAuth();

            combineLatest([subscriptionUser])
                .pipe(
                    map(([dataUser]) => {
                        if (dataUser.response.authorized) {
                            setIsLoggedIn(true);
                        } else {
                            localStorage.removeItem('login');
                            localStorage.removeItem('token');
                            setIsLoggedIn(false);
                        }
                    }),
                    take(1),
                    catchError(() => {
                        localStorage.removeItem('login');
                        localStorage.removeItem('token');
                        setIsLoggedIn(false);

                        return of({
                            error: true,
                            message: 'Erreur de vérification du token'
                        });
                    }),
                    finalize(() => {
                        setLoading(false);
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
            setAuthError('');

            const usersService = new UsersService();

            // TODO : contrôler les champs obligatoires

            const subscriptionUser = usersService.connect(formData);

            combineLatest([subscriptionUser])
                .pipe(
                    map(([dataUser]) => {
                        if (dataUser.response.error) {
                            setAuthError(dataUser.response.error);
                            reject(dataUser.response.error);
                        } else {
                            localStorage.setItem('login', formData.login);
                            localStorage.setItem('token', dataUser.response.token);
                            setIsLoggedIn(true);
                            resolve();
                        }
                    }),
                    take(1),
                    catchError(() => {
                        setAuthError('Erreur de connexion');
                        reject('Erreur de connexion');
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
            setAuthError('');

            const usersService = new UsersService(localStorage.getItem('login'), localStorage.getItem('token'));

            const subscriptionUser = usersService.disconnect();

            combineLatest([subscriptionUser])
                .pipe(
                    map(([dataUser]) => {
                        if (dataUser.response.disconnected) {
                            localStorage.removeItem('login');
                            localStorage.removeItem('token');
                            setIsLoggedIn(false);
                            resolve();
                        } else {
                            setAuthError(dataUser.response.error);
                            reject(dataUser.response.error);
                        }
                    }),
                    take(1),
                    catchError(() => {
                        // Peut-être que les erreurs 401 et autres du back forcent à passer dans le catch...
                        setAuthError('Erreur de déconnexion');
                        reject('Erreur de déconnexion');
                        return of();
                    })
                )
                .subscribe();
        });
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, authError, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
