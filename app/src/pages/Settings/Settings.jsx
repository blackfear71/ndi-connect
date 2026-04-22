import { useEffect, useState } from 'react';

import { Spinner, Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaQuestionCircle } from 'react-icons/fa';
import { FaStar, FaUser, FaUserPlus } from 'react-icons/fa6';
import { IoSettingsOutline } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';

import { of } from 'rxjs';
import { catchError, finalize, map, switchMap, take } from 'rxjs/operators';

import { UsersService } from '../../api';

import { SettingsCreateUser, SettingsUser, SettingsUsers } from '../../components/features';
import { ConfirmModal, PasswordModal, SettingsModal } from '../../components/modals';
import { Message } from '../../components/shared';

import { useAuth } from '../../utils/context/AuthContext';

import { EnumUserRole } from '../../enums';

import './Settings.css';

/**
 * Paramètres
 */
const Settings = () => {
    // Router
    const { pathname } = useLocation();
    const navigate = useNavigate();

    // Contexte
    const { auth, authMessage, setAuthMessage, refreshAuth } = useAuth();

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
    const [modalOptionsPassword, setModalOptionsPassword] = useState({
        isOpen: false,
        message: null,
        isSubmitting: false
    });
    const [modalOptionsUser, setModalOptionsUser] = useState({
        action: '', // TODO à gérer entre création/update
        isOpen: false,
        message: null,
        isSubmitting: false
    });
    const [showCreateUserForm, setShowCreateUserForm] = useState(false);

    // API states
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

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
            if (pathname === '/settings') {
                navigate('/');
            }
            return;
        }

        // Récupération des données utilisateurs
        if (auth.level >= EnumUserRole.SUPERADMIN) {
            const usersService = new UsersService();

            const subscriptionUsers = usersService.getAllUsers();

            subscriptionUsers
                .pipe(
                    map((dataUsers) => {
                        const processedUsers = processUserDatas(dataUsers.response.data);

                        setUsers(processedUsers);
                        setCurrentUser(processedUsers.find((u) => u.id === auth.id));
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
            setCurrentUser({
                id: auth.id,
                login: auth.login,
                level: auth.level,
                role: getUserRole(auth.level)
            });
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
     * Enrichit les données utilisateurs avec les informations de rôle
     * @param {*} usersData Données utilisateurs
     * @returns Données utilisateurs enrichies
     */
    const processUserDatas = (usersData) => {
        return usersData.map((user) => ({
            ...user,
            role: getUserRole(user.level)
        }));
    };

    /**
     * Récupère les données du rôle de l'utilisateur
     * @param {*} level Niveau utilisateur
     * @returns Données du rôle
     */
    const getUserRole = (level) => {
        switch (level) {
            case EnumUserRole.USER:
                return { label: t(`settings.level${level}`), icon: <FaUser size={18} /> };
            case EnumUserRole.ADMIN:
                return { label: t(`settings.level${level}`), icon: <FaUserPlus size={18} /> };
            case EnumUserRole.SUPERADMIN:
                return { label: t(`settings.level${level}`), icon: <FaStar size={18} /> };
            default:
                return { label: t('settings.unknownLevel'), icon: <FaQuestionCircle size={18} /> };
        }
    };

    /**
     * Ouverture/fermeture de la modale de modification mot de passe
     */
    const openClosePasswordModal = () => {
        // Ouverture ou fermeture
        setModalOptionsPassword((prev) => ({
            ...prev,
            isOpen: !prev.isOpen,
            message: null,
            isSubmitting: false
        }));

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsPassword.isOpen && resetFormPassword();
    };

    /**
     * Modification du mot de passe
     */
    const handleSubmitPassword = () => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsPassword((prev) => ({ ...prev, message: null, isSubmitting: true }));

        const usersService = new UsersService();

        const subscriptionUsers = usersService.updatePassword(formPassword);

        subscriptionUsers
            .pipe(
                map((dataUsers) => {
                    openClosePasswordModal();
                    setMessage({ code: dataUsers.response.message, type: dataUsers.response.status });
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsPassword((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setModalOptionsPassword((prev) => ({ ...prev, isSubmitting: false }));
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

        // Réinitialisation du formulaire à la fermeture (c'est-à-dire si le formulaire était précédemment ouvert)
        showCreateUserForm.isOpen && resetFormCreateUser();
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
                    setUsers(processUserDatas(dataUsers.response.data));
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
        setModalOptionsUser((prev) => ({
            ...prev,
            isOpen: !prev.isOpen,
            message: null,
            isSubmitting: false
        }));

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsUser.isOpen && resetFormUpdateUser();
    };

    /**
     * Réinitialisation du mot de passe
     * @param {*} id Identifiant utilisateur
     */
    const handleResetPassword = (id) => {
        setMessage(null);
        setModalOptionsUser((prev) => ({ ...prev, message: null, isSubmitting: true }));

        const usersService = new UsersService();

        const subscriptionUsers = usersService.resetPassword(id);

        subscriptionUsers
            .pipe(
                map((dataUsers) => {
                    setModalOptionsUser((prev) => ({
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
                    setModalOptionsUser((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setModalOptionsUser((prev) => ({ ...prev, isSubmitting: false }));
                })
            )
            .subscribe();
    };

    /**
     * Modification d'un utilisateur
     */
    const handleSubmitUpdateUser = () => {
        setMessage(null);
        setModalOptionsUser((prev) => ({ ...prev, message: null, isSubmitting: true }));

        const usersService = new UsersService();

        const subscriptionUsers = usersService.updateUser(formUpdateUser);

        subscriptionUsers
            .pipe(
                map((dataUsers) => {
                    openCloseUpdateUserModal();
                    setUsers(processUserDatas(dataUsers.response.data));
                    setMessage({ code: dataUsers.response.message, type: dataUsers.response.status });

                    // Rafraichissement du contexte d'authentification si l'utilisateur modifié est l'utilisateur courant
                    if (auth.id === dataUsers.response.data.find((u) => u.id === formUpdateUser.id)?.id) {
                        refreshAuth(false);
                    }
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsUser((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setModalOptionsUser((prev) => ({ ...prev, isSubmitting: false }));
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

        subscriptionUsers
            .pipe(
                map((dataUsers) => {
                    openCloseConfirmModal();
                    setUsers(processUserDatas(dataUsers.response.data));
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
                <div className="d-flex align-items-center justify-content-center layout-spinner-centered">
                    <Spinner animation="border" role="status" variant="light" />
                </div>
            ) : (
                <>
                    {/* Message */}
                    {message && <Message code={message.code} params={message.params} type={message.type} setMessage={setMessage} />}

                    {/* Paramètres */}
                    {auth.isLoggedIn && (
                        <>
                            {/* Titre */}
                            <h1 className="d-flex align-items-center gap-2">
                                <IoSettingsOutline size={30} />
                                {t('settings.settingsTitle')}
                            </h1>

                            {auth.level >= EnumUserRole.SUPERADMIN ? (
                                <Tabs
                                    variant="underline"
                                    defaultActiveKey="user"
                                    id="justify-tab-example"
                                    className="mb-3 page-tabs"
                                    justify
                                >
                                    {/* Utilisateur connecté */}
                                    <Tab eventKey="user" title={t('settings.level0')}>
                                        <SettingsUser
                                            user={currentUser}
                                            formPassword={formPassword}
                                            setFormPassword={setFormPassword}
                                            setModalOptionsPassword={setModalOptionsPassword}
                                            isSubmitting={isSubmitting}
                                        />
                                    </Tab>

                                    {/* Gestion utilisateurs */}
                                    <Tab eventKey="users" title={t('settings.manageUsers')}>
                                        {/* Création utilisateur */}
                                        {/* TODO : à remplacer par une modale */}
                                        <SettingsCreateUser
                                            formData={formCreateUser}
                                            setFormData={setFormCreateUser}
                                            showForm={showCreateUserForm}
                                            showFormMethod={showHideCreateUserForm}
                                            setMessage={setMessage}
                                            onSubmit={handleSubmitCreateUser}
                                            isSubmitting={isSubmitting}
                                        />

                                        {/* Gestion utilisateurs */}
                                        <SettingsUsers
                                            users={users}
                                            setFormData={setFormUpdateUser}
                                            setModalOptions={setModalOptionsUser}
                                            onConfirm={openCloseConfirmModal}
                                            isSubmitting={isSubmitting}
                                        />
                                    </Tab>
                                </Tabs>
                            ) : (
                                <>
                                    {/* Utilisateur connecté */}
                                    <SettingsUser
                                        user={currentUser}
                                        formPassword={formPassword}
                                        setFormPassword={setFormPassword}
                                        setModalOptionsPassword={setModalOptionsPassword}
                                        isSubmitting={isSubmitting}
                                    />
                                </>
                            )}
                        </>
                    )}

                    {/* Modale de modification de mot de passe */}
                    {auth.isLoggedIn && modalOptionsPassword.isOpen && (
                        <PasswordModal
                            formData={formPassword}
                            setFormData={setFormPassword}
                            modalOptions={modalOptionsPassword}
                            setModalOptions={setModalOptionsPassword}
                            onClose={openClosePasswordModal}
                            onSubmit={handleSubmitPassword}
                        />
                    )}

                    {/* Modale de modification d'utilisateur */}
                    {auth.isLoggedIn && auth.level >= EnumUserRole.SUPERADMIN && modalOptionsUser.isOpen && (
                        <SettingsModal
                            user={users.find((u) => u.id === formUpdateUser.id)}
                            formData={formUpdateUser}
                            setFormData={setFormUpdateUser}
                            modalOptions={modalOptionsUser}
                            setModalOptions={setModalOptionsUser}
                            onReset={handleResetPassword}
                            onClose={openCloseUpdateUserModal}
                            onSubmit={handleSubmitUpdateUser}
                        />
                    )}

                    {/* Modale de confirmation */}
                    {auth.isLoggedIn && auth.level >= EnumUserRole.SUPERADMIN && modalOptionsConfirm.isOpen && (
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
