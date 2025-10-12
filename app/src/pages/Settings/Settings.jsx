import { useContext, useEffect, useState } from 'react';

import { Badge, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaStar, FaUser, FaUserPlus } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

import UsersService from '../../api/usersService';

import Message from '../../components/Message/Message';
import SettingsCreateUser from '../../components/SettingsCreateUser/SettingsCreateUser';
import SettingsPassword from '../../components/SettingsPassword/SettingsPassword';
import SettingsUsers from '../../components/SettingsUsers/SettingsUsers';

import UserRole from '../../enums/UserRole';

import { combineLatest, of } from 'rxjs';
import { catchError, finalize, map, switchMap, take } from 'rxjs/operators';

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messagePage, setMessagePage] = useState(null);
    const [showCreateUserForm, setShowCreateUserForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    // API states
    const [users, setUsers] = useState([]);

    /**
     * Lancement initial de la page
     */
    useEffect(() => {
        if (!auth.isLoggedIn) {
            navigate('/');
        } else if (auth.level >= UserRole.SUPERADMIN) {
            const usersService = new UsersService(localStorage.getItem('token'));

            const subscriptionUsers = usersService.getAllUsers();

            combineLatest([subscriptionUsers])
                .pipe(
                    map(([dataUsers]) => {
                        setUsers(dataUsers.response.data);
                    }),
                    take(1),
                    catchError((err) => {
                        setMessagePage({ code: err?.response?.message, type: err?.response?.status });
                        return of();
                    }),
                    finalize(() => {
                        setIsLoading(false);
                    })
                )
                .subscribe();
        } else {
            setIsLoading(false);
        }
    }, []);

    /**
     * Affiche ou masque la saisie de mot de passe
     */
    const showHidePasswordForm = () => {
        setShowPasswordForm((prev) => !prev);
    };

    /**
     * Modification du mot de passe
     */
    const handleSubmitPassword = () => {
        setMessagePage(null);
        setIsSubmitting(true);

        const usersService = new UsersService(localStorage.getItem('token'));

        const subscriptionUsers = usersService.updatePassword(formPassword);

        combineLatest([subscriptionUsers])
            .pipe(
                map(([dataUsers]) => {
                    showHidePasswordForm();
                    resetFormPassword();
                    setMessagePage({ code: dataUsers.response.message, type: dataUsers.response.status });
                }),
                take(1),
                catchError((err) => {
                    setMessagePage({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Réinitialisation formulaire (modification mot de passe)
     */
    const resetFormPassword = () => {
        setFormPassword({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    /**
     * Affiche ou masque la saisie de nouvel utilisateur
     */
    const showHideCreateUserForm = () => {
        setShowCreateUserForm((prev) => !prev);
    };

    /**
     * Création d'un utilisateur
     */
    const handleSubmitCreateUser = () => {
        setMessagePage(null);
        setIsSubmitting(true);

        const usersService = new UsersService(localStorage.getItem('token'));

        usersService
            .createUser(formCreateUser)
            .pipe(
                map((dataUser) => {
                    setMessagePage({ code: dataUser.response.message, type: dataUser.response.status });
                }),
                switchMap(() => usersService.getAllUsers()),
                map((dataUsers) => {
                    showHideCreateUserForm();
                    resetFormCreateUser();
                    setUsers(dataUsers.response.data);
                }),
                take(1),
                catchError((err) => {
                    setMessagePage({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Réinitialisation formulaire (création utilisateur)
     */
    const resetFormCreateUser = () => {
        setFormCreateUser({
            login: '',
            password: '',
            confirmPassword: '',
            level: ''
        });
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
                                {auth.level === UserRole.USER && <FaUser size={18} className="me-2" />}
                                {auth.level === UserRole.ADMIN && <FaUserPlus size={18} className="me-2" />}
                                {auth.level === UserRole.SUPERADMIN && <FaStar size={18} className="me-2" />}
                                {t(`settings.level${auth.level}`)}
                            </Badge>

                            {/* Gestion mot de passe */}
                            <div className="settings-form mt-3">
                                <SettingsPassword
                                    formPassword={formPassword}
                                    setFormPassword={setFormPassword}
                                    showForm={showPasswordForm}
                                    showFormMethod={showHidePasswordForm}
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
                                            showForm={showCreateUserForm}
                                            showFormMethod={showHideCreateUserForm}
                                            setMessage={setMessagePage}
                                            onSubmit={handleSubmitCreateUser}
                                            isSubmitting={isSubmitting}
                                        />
                                    </div>

                                    {/* Gestion utilisateurs */}
                                    <div className="settings-form mt-3">
                                        <SettingsUsers users={users} isSubmitting={isSubmitting} />
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
