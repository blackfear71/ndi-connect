import { useContext, useEffect, useState } from 'react';

import { Badge, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaQuestionCircle } from 'react-icons/fa';
import { FaStar, FaUser, FaUserPlus } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

import UsersService from '../../api/usersService';

import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import Message from '../../components/Message/Message';
import SettingsCreateUser from '../../components/SettingsCreateUser/SettingsCreateUser';
import SettingsModal from '../../components/SettingsModal/SettingsModal';
import SettingsPassword from '../../components/SettingsPassword/SettingsPassword';
import SettingsUsers from '../../components/SettingsUsers/SettingsUsers';

import UserRole from '../../enums/UserRole';

import { combineLatest, of } from 'rxjs';
import { catchError, finalize, map, switchMap, take } from 'rxjs/operators';

import { AuthContext } from '../../utils/AuthContext';

import './Settings.css';

/**
 * Paramètres
 */
const Settings = () => {
    // Router
    const navigate = useNavigate();

    // Contexte
    const { auth, authMessage, setAuthMessage, refreshAuth } = useContext(AuthContext);

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
    const [formUpdateUser, setFormUpdateUser] = useState({
        id: null,
        level: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [modalOptionsConfirm, setModalOptionsConfirm] = useState({
        content: '',
        data: null,
        isOpen: false,
        message: null,
        isSubmitting: false
    });
    const [modalOptionsUpdateUser, setModalOptionsUpdateUser] = useState({ isOpen: false, message: null, isSubmitting: false });
    const [showCreateUserForm, setShowCreateUserForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    // API states
    const [users, setUsers] = useState([]);

    /**
     * Lancement initial de la page
     */
    useEffect(() => {
        // Rafraichissement du contexte d'authentification si l'utilisateur s'est déconnecté ailleurs
        refreshAuth(false);
    }, []);

    /**
     * Récupération des données après contrôle de l'authentification
     */
    useEffect(() => {
        // Retour à l'accueil si non connecté (on ne fait la navigation que si on n'est pas déjà revenu à l'accueil, après déconnexion par exemple)
        if (!auth.isLoggedIn) {
            if (window.location.pathname === '/settings') {
                navigate('/');
            }
            return;
        }

        // Récupération des données utilisateurs
        if (auth.level >= UserRole.SUPERADMIN) {
            const usersService = new UsersService();

            const subscriptionUsers = usersService.getAllUsers();

            combineLatest([subscriptionUsers])
                .pipe(
                    map(([dataUsers]) => {
                        setUsers(dataUsers.response.data);
                    }),
                    take(1),
                    catchError((err) => {
                        setMessage({ code: err?.response?.message, type: err?.response?.status });
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
    }, [auth]);

    /**
     * Si un message d'authentification est défini on l'affiche
     */
    useEffect(() => {
        // Message venant du AuthContext (connexion / déconnexion)
        if (authMessage && authMessage.target === 'page') {
            setMessage(authMessage);
            setAuthMessage(null);
        }
    }, [authMessage, setAuthMessage]);

    /**
     * Affiche le rôle de utilisateur
     * @param {*} level Niveau utilisateur
     * @returns Rôle utilisateur
     */
    const getUserRole = (level) => {
        switch (level) {
            case UserRole.USER:
                return (
                    <>
                        <FaUser size={18} className="me-2" />
                        {t(`settings.level${level}`)}
                    </>
                );
            case UserRole.ADMIN:
                return (
                    <>
                        <FaUserPlus size={18} className="me-2" />
                        {t(`settings.level${level}`)}
                    </>
                );
            case UserRole.SUPERADMIN:
                return (
                    <>
                        <FaStar size={18} className="me-2" />
                        {t(`settings.level${level}`)}
                    </>
                );
            default:
                return (
                    <>
                        <FaQuestionCircle size={18} className="me-2" />
                        {t('settings.unknownLevel')}
                    </>
                );
        }
    };

    /**
     * Affiche ou masque la saisie de mot de passe
     */
    const showHidePasswordForm = () => {
        // Ouverture ou fermeture
        setShowPasswordForm((prev) => !prev);

        // Réinitialisation du formulaire à la fermeture
        !showPasswordForm && resetFormPassword();
    };

    /**
     * Modification du mot de passe
     */
    const handleSubmitPassword = () => {
        setMessage(null);
        setIsSubmitting(true);

        const usersService = new UsersService();

        const subscriptionUsers = usersService.updatePassword(formPassword);

        combineLatest([subscriptionUsers])
            .pipe(
                map(([dataUsers]) => {
                    showHidePasswordForm();
                    setMessage({ code: dataUsers.response.message, type: dataUsers.response.status });
                }),
                take(1),
                catchError((err) => {
                    setMessage({ code: err?.response?.message, type: err?.response?.status });
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
        // Ouverture ou fermeture
        setShowCreateUserForm((prev) => !prev);

        // Réinitialisation du formulaire à la fermeture
        !showCreateUserForm.isOpen && resetFormCreateUser();
    };

    /**
     * Création d'un utilisateur
     */
    const handleSubmitCreateUser = () => {
        setMessage(null);
        setIsSubmitting(true);

        const usersService = new UsersService();

        usersService
            .createUser(formCreateUser)
            .pipe(
                map((dataUser) => {
                    setMessage({ code: dataUser.response.message, type: dataUser.response.status });
                }),
                switchMap(() => usersService.getAllUsers()),
                map((dataUsers) => {
                    showHideCreateUserForm();
                    setUsers(dataUsers.response.data);
                }),
                take(1),
                catchError((err) => {
                    setMessage({ code: err?.response?.message, type: err?.response?.status });
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

    /**
     * Ouverture/fermeture de la modale de modification d'utilisateur
     */
    const openCloseUpdateUserModal = () => {
        // Ouverture ou fermeture
        setModalOptionsUpdateUser((prev) => ({
            ...prev,
            isOpen: !prev.isOpen,
            message: null,
            isSubmitting: false
        }));

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsUpdateUser.isOpen && resetFormUpdateUser();
    };

    /**
     * Réinitialisation du mot de passe
     * @param {*} id Identifiant utilisateur
     */
    const handleResetPassword = (id) => {
        setMessage(null);
        setModalOptionsUpdateUser((prev) => ({ ...prev, message: null, isSubmitting: true }));

        const usersService = new UsersService();

        const subscriptionUsers = usersService.resetPassword(id);

        combineLatest([subscriptionUsers])
            .pipe(
                map(([dataUsers]) => {
                    setModalOptionsUpdateUser((prev) => ({
                        ...prev,
                        message: {
                            code: dataUsers.response.message,
                            params: { password: dataUsers.response.data },
                            type: dataUsers.response.status
                        }
                    }));
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsUpdateUser((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setModalOptionsUpdateUser((prev) => ({ ...prev, isSubmitting: false }));
                })
            )
            .subscribe();
    };

    /**
     * Modification d'un utilisateur
     */
    const handleSubmitUpdateUser = () => {
        setMessage(null);
        setModalOptionsUpdateUser((prev) => ({ ...prev, message: null, isSubmitting: true }));

        const usersService = new UsersService();

        const subscriptionUsers = usersService.updateUser(formUpdateUser);

        combineLatest([subscriptionUsers])
            .pipe(
                map(([dataUsers]) => {
                    openCloseUpdateUserModal();
                    setUsers(dataUsers.response.data);
                    setMessage({ code: dataUsers.response.message, type: dataUsers.response.status });

                    // Rafraichissement du contexte d'authentification si l'utilisateur modifié est l'utilisateur courant
                    if (auth.login === dataUsers.response.data.find((u) => u.id === formUpdateUser.id)?.login) {
                        refreshAuth(false);
                    }
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsUpdateUser((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setModalOptionsUpdateUser((prev) => ({ ...prev, isSubmitting: false }));
                })
            )
            .subscribe();
    };

    /**
     * Réinitialisation formulaire (modification utilisateur)
     */
    const resetFormUpdateUser = () => {
        setFormUpdateUser({
            id: null,
            level: ''
        });
    };

    /**
     * Ouverture/fermeture de la modale de confirmation
     */
    const openCloseConfirmModal = (confirmOptions) => {
        // Ouverture ou fermeture
        if (confirmOptions) {
            setModalOptionsConfirm({
                content: confirmOptions.content,
                data: confirmOptions.data,
                isOpen: !modalOptionsConfirm.isOpen,
                message: null,
                isSubmitting: false
            });
        } else {
            setModalOptionsConfirm({
                content: '',
                data: null,
                isOpen: false,
                message: null,
                isSubmitting: false
            });
        }
    };

    /**
     * Suppression d'un utilisateur
     */
    const handleDeleteUser = () => {
        setMessage(null);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null, isSubmitting: true }));

        const usersService = new UsersService();

        const subscriptionUsers = usersService.deleteUser(modalOptionsConfirm.data);

        combineLatest([subscriptionUsers])
            .pipe(
                map(([dataUsers]) => {
                    openCloseConfirmModal();
                    setUsers(dataUsers.response.data);
                    setMessage({ code: dataUsers.response.message, type: dataUsers.response.status });
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsConfirm((prev) => ({ ...prev, message: { code: err?.response?.message, type: err?.response?.status } }));
                    return of();
                }),
                finalize(() => {
                    setModalOptionsConfirm((prev) => ({ ...prev, isSubmitting: false }));
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
                    {message && <Message code={message.code} params={message.params} type={message.type} setMessage={setMessage} />}

                    {/* Paramètres */}
                    {auth.isLoggedIn && (
                        <>
                            {/* Niveau */}
                            <Badge bg="warning" text="dark" className="fs-6 p-2 d-inline-flex align-items-center">
                                {getUserRole(auth.level)}
                            </Badge>

                            {/* Gestion mot de passe */}
                            <div className="settings-form mt-3">
                                <SettingsPassword
                                    formData={formPassword}
                                    setFormData={setFormPassword}
                                    showForm={showPasswordForm}
                                    showFormMethod={showHidePasswordForm}
                                    setMessage={setMessage}
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
                                            formData={formCreateUser}
                                            setFormData={setFormCreateUser}
                                            showForm={showCreateUserForm}
                                            showFormMethod={showHideCreateUserForm}
                                            setMessage={setMessage}
                                            onSubmit={handleSubmitCreateUser}
                                            isSubmitting={isSubmitting}
                                        />
                                    </div>

                                    {/* Gestion utilisateurs */}
                                    <div className="settings-form mt-3">
                                        <SettingsUsers
                                            login={auth.login}
                                            users={users}
                                            formData={formUpdateUser}
                                            setFormData={setFormUpdateUser}
                                            modalOptions={modalOptionsUpdateUser}
                                            setModalOptions={setModalOptionsUpdateUser}
                                            onConfirm={openCloseConfirmModal}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {/* Modale de modification d'utilisateur' */}
                    {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && modalOptionsUpdateUser.isOpen && (
                        <SettingsModal
                            user={users.find((u) => u.id === formUpdateUser.id)}
                            getUserRole={getUserRole}
                            formData={formUpdateUser}
                            setFormData={setFormUpdateUser}
                            modalOptions={modalOptionsUpdateUser}
                            setModalOptions={setModalOptionsUpdateUser}
                            onReset={handleResetPassword}
                            onClose={openCloseUpdateUserModal}
                            onSubmit={handleSubmitUpdateUser}
                        />
                    )}

                    {/* Modale de confirmation */}
                    {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && modalOptionsConfirm.isOpen && (
                        <ConfirmModal
                            modalOptions={modalOptionsConfirm}
                            setModalOptions={setModalOptionsConfirm}
                            onClose={openCloseConfirmModal}
                            onConfirmAction={handleDeleteUser}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default Settings;
