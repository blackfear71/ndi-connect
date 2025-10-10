import { useContext, useEffect, useMemo, useState } from 'react';

import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import UsersService from '../../api/usersService';

import Message from '../../components/Message/Message';
import SettingsPassword from '../../components/SettingsPassword/SettingsPassword';

import UserRole from '../../enums/UserRole';

import { combineLatest, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { AuthContext } from '../../utils/AuthContext';

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
    const [isLoading, setIsLoading] = useState(true);
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
        return isSubmittingPassword;
    }, [isSubmittingPassword]);

    /**
     * Gère le comportement du formulaire à la soumission
     * @param {*} e Evènement
     * @param {*} action Action à réaliser
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
                            {/* Gestion mot de passe */}
                            <SettingsPassword
                                formPassword={formPassword}
                                setFormPassword={setFormPassword}
                                setMessage={setMessagePage}
                                onSubmit={handleSubmitPassword}
                                isSubmitting={isSubmitting}
                            />

                            {/* Utilisateurs */}
                            {auth.level >= UserRole.SUPERADMIN && (
                                <>
                                    {/* Création utilisateur */}
                                    <h1 className="mt-3">{t('settings.createUser')}</h1>

                                    {/* Gestion utilisateurs */}
                                    <h1 className="mt-3">{t('settings.manageUsers')}</h1>
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
