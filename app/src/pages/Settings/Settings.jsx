import { useContext, useEffect, useMemo, useState } from 'react';

import { Badge, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import UsersService from '../../api/usersService';

import Message from '../../components/Message/Message';
import SettingsCreateUser from '../../components/SettingsCreateUser/SettingsCreateUser';
import SettingsPassword from '../../components/SettingsPassword/SettingsPassword';

import UserRole from '../../enums/UserRole';

import { combineLatest, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { AuthContext } from '../../utils/AuthContext';

import './Settings.css';

/**
 * Page d'accueil
 * @returns
 */
const Settings = () => {
    // Router
    const navigate = useNavigate();

    // Contexte
    const { auth } = useContext(AuthContext);

    // Traductions
    const { t } = useTranslation();

    // Local states
    const [formPassword, setFormPassword] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [formCreateUser, setFormCreateUser] = useState({
        login: '',
        password: '',
        confirmPassword: '',
        level: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmittingCreateUser, setIsSubmittingCreateUser] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [messagePage, setMessagePage] = useState(null);

    /**
     * Lancement initial de la page
     */
    useEffect(() => {
        if (!auth.isLoggedIn) {
            navigate('/');
        } else {
            setIsLoading(false);
        }
    }, []);

    /**
     * Contrôle soumission en cours
     */
    const isSubmitting = useMemo(() => {
        return isSubmittingPassword || isSubmittingCreateUser;
    }, [isSubmittingPassword, isSubmittingCreateUser]);

    /**
     * Modification du mot de passe
     */
    const handleSubmitPassword = () => {
        setMessagePage(null);
        setIsSubmittingPassword(true);

        const usersService = new UsersService(localStorage.getItem('token'));

        const subscriptionUsers = usersService.updatePassword(formPassword);

        combineLatest([subscriptionUsers])
            .pipe(
                map(([dataUsers]) => {
                    setMessagePage({ code: dataUsers.response.message, type: dataUsers.response.status });
                }),
                take(1),
                catchError((err) => {
                    setMessagePage({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsSubmittingPassword(false);
                })
            )
            .subscribe();
    };

    /**
     * Création d'un utilisateur
     */
    const handleSubmitCreateUser = () => {
        setMessagePage(null);
        setIsSubmittingCreateUser(true);

        const usersService = new UsersService(localStorage.getItem('token'));

        const subscriptionUsers = usersService.createUser(formCreateUser);

        combineLatest([subscriptionUsers])
            .pipe(
                map(([dataUsers]) => {
                    setMessagePage({ code: dataUsers.response.message, type: dataUsers.response.status });
                }),
                take(1),
                catchError((err) => {
                    setMessagePage({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsSubmittingCreateUser(false);
                })
            )
            .subscribe();
    };

    return (
        <>
            {isLoading ? (
                <div className="layout-spinner-centered">
                    <Spinner animation="border" role="status" variant="light" />
                </div>
            ) : (
                <>
                    {/* Message */}
                    {messagePage && <Message code={messagePage.code} type={messagePage.type} setMessage={setMessagePage} />}

                    {/* Paramètres */}
                    {auth.isLoggedIn && (
                        <>
                            {/* Niveau */}
                            <Badge bg="warning" text="dark" className="fs-6 p-2 d-inline-flex align-items-center">
                                <FaStar size={18} className="me-2" /> {t(`settings.level${auth.level}`)}
                            </Badge>

                            {/* Gestion mot de passe */}
                            <div className="settings-form mt-3">
                                <SettingsPassword
                                    formPassword={formPassword}
                                    setFormPassword={setFormPassword}
                                    setMessage={setMessagePage}
                                    onSubmit={handleSubmitPassword}
                                    isSubmitting={isSubmitting}
                                />
                            </div>

                            {/* Utilisateurs */}
                            {auth.level >= UserRole.SUPERADMIN && (
                                <>
                                    {/* Création utilisateur */}
                                    <div className="settings-form mt-3">
                                        <SettingsCreateUser
                                            formCreateUser={formCreateUser}
                                            setFormCreateUser={setFormCreateUser}
                                            setMessage={setMessagePage}
                                            onSubmit={handleSubmitCreateUser}
                                            isSubmitting={isSubmitting}
                                        />
                                    </div>

                                    {/* Gestion utilisateurs */}
                                    <div className="settings-form mt-3">
                                        <h1>{t('settings.manageUsers')}</h1>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default Settings;
