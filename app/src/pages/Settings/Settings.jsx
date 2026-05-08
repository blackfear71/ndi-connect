import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { of, switchMap } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { Spinner, Tab, Tabs } from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';
import { FaStar, FaUser, FaUserPlus } from 'react-icons/fa6';
import { IoSettingsOutline } from 'react-icons/io5';

import { SettingsUser, SettingsUsers } from '../../components/features';
import { ConfirmModal, PasswordModal, SettingsModal } from '../../components/modals';
import { Message } from '../../components/shared';

import { useAuth } from '../../utils/context/AuthContext';

import { EnumAction, EnumUserRole } from '../../enums';

import { UsersService } from '../../api';

import './Settings.css';

// Valeurs initiales du formulaire
const initialPasswordValues = {
    password: '',
    oldPassword: '',
    confirmPassword: ''
};

// Schémas de validation Yup
const passwordValidationSchema = Yup.object({
    oldPassword: Yup.string().required('errors.invalidPassword'),
    password: Yup.string()
        .required('errors.invalidPassword')
        .notOneOf([Yup.ref('oldPassword')], 'errors.passwordIdentical'),
    confirmPassword: Yup.string()
        .required('errors.invalidPassword')
        .oneOf([Yup.ref('password')], 'errors.passwordMatch')
});

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
    const [formUser, setFormUser] = useState({
        id: null,
        login: '',
        password: '',
        confirmPassword: '',
        level: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [modalOptionsConfirm, setModalOptionsConfirm] = useState({
        content: '',
        action: null,
        data: null,
        isOpen: false,
        message: null
    });
    const [modalOptionsPassword, setModalOptionsPassword] = useState({
        isOpen: false,
        message: null
    });
    const [modalOptionsUser, setModalOptionsUser] = useState({
        action: null,
        isOpen: false,
        message: null
    });

    // Formik
    const formPassword = useFormik({
        initialValues: initialPasswordValues,
        validationSchema: passwordValidationSchema,
        onSubmit: (values) => handleSubmitPassword(values)
    });

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

            usersService
                .getAllUsers()
                .pipe(
                    map((dataUsers) => {
                        const processedUsers = processUsersData(dataUsers.response.data);

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
     * Mise à jour du formulaire de l'édition aux changements de sa modale
     */
    useEffect(() => {
        // Réinitialisation à l'ouverture/fermeture de la modale
        formPassword.resetForm();
    }, [modalOptionsPassword.isOpen]);

    /**
     * Enrichit les données utilisateurs avec les informations de rôle
     * @param {*} usersData Données utilisateurs
     * @returns Données utilisateurs enrichies
     */
    const processUsersData = (usersData) => {
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
            message: null
        }));
    };

    /**
     * Modification du mot de passe
     */
    const handleSubmitPassword = (values) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsPassword((prev) => ({ ...prev, message: null }));

        const usersService = new UsersService();

        usersService
            .updatePassword(values)
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
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Ouverture/fermeture de la modale de création/modification d'utilisateur
     */
    const openCloseUserModal = (openAction) => {
        // Ouverture ou fermeture
        setModalOptionsUser((prev) => ({
            ...prev,
            action: openAction,
            isOpen: !prev.isOpen,
            message: null
        }));

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsUser.isOpen && resetFormUser();
    };

    /**
     * Réinitialisation du mot de passe
     * @param {*} id Identifiant utilisateur
     */
    const handleResetPassword = (id) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsUser((prev) => ({ ...prev, message: null }));

        const usersService = new UsersService();

        usersService
            .resetPassword(id)
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
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Création/modification d'un utilisateur
     */
    const handleSubmitUser = (action) => {
        setMessage(null);
        setModalOptionsUser((prev) => ({ ...prev, message: null }));

        const usersService = new UsersService();

        let subscriptionUsers = null;

        switch (action) {
            case EnumAction.CREATE:
                setIsSubmitting(true);

                subscriptionUsers = usersService.createUser({
                    login: formUser.login,
                    password: formUser.password,
                    confirmPassword: formUser.confirmPassword,
                    level: formUser.level
                });
                break;
            case EnumAction.UPDATE:
                setIsSubmitting(true);

                subscriptionUsers = usersService.updateUser(formUser.id, {
                    level: formUser.level
                });
                break;
        }

        subscriptionUsers
            ?.pipe(
                map((dataUser) => {
                    setMessage({ code: dataUser.response.message, type: dataUser.response.status });
                }),
                switchMap(() => usersService.getAllUsers()),
                map((dataUsers) => {
                    openCloseUserModal();
                    setUsers(processUsersData(dataUsers.response.data));

                    // Rafraichissement du contexte d'authentification si l'utilisateur modifié est l'utilisateur courant
                    if (auth.id === dataUsers.response.data.find((u) => u.id === formUser.id)?.id) {
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
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Réinitialisation formulaire (création/modification utilisateur)
     */
    const resetFormUser = () => {
        setFormUser({
            id: null,
            login: '',
            password: '',
            confirmPassword: '',
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
                action: confirmOptions.action,
                data: confirmOptions.data,
                isOpen: !modalOptionsConfirm.isOpen,
                message: null
            });
        } else {
            setModalOptionsConfirm({
                content: '',
                action: null,
                data: null,
                isOpen: false,
                message: null
            });
        }
    };

    /**
     * Méthode centralisée d'action à la confirmation
     */
    const handleConfirmAction = () => {
        switch (modalOptionsConfirm.action) {
            case 'deleteUser':
                return handleDeleteUser(modalOptionsConfirm.data);
            default:
                return;
        }
    };

    /**
     * Suppression d'un utilisateur
     */
    const handleDeleteUser = () => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const usersService = new UsersService();

        usersService
            .deleteUser(modalOptionsConfirm.data)
            .pipe(
                map((dataUser) => {
                    setMessage({ code: dataUser.response.message, type: dataUser.response.status });
                }),
                switchMap(() => usersService.getAllUsers()),
                map((dataUsers) => {
                    openCloseConfirmModal();
                    setUsers(processUsersData(dataUsers.response.data));
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsConfirm((prev) => ({ ...prev, message: { code: err?.response?.message, type: err?.response?.status } }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
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

                            {auth.level >= EnumUserRole.SUPERADMIN && currentUser && users ? (
                                <Tabs
                                    variant="underline"
                                    defaultActiveKey="user"
                                    id="justify-tab-example"
                                    className="mb-3 page-tabs"
                                    justify
                                >
                                    {/* Utilisateur connecté */}
                                    <Tab eventKey="user" title={t('settings.level0')}>
                                        <SettingsUser user={currentUser} onOpen={openClosePasswordModal} isSubmitting={isSubmitting} />
                                    </Tab>

                                    {/* Gestion utilisateurs */}
                                    <Tab eventKey="users" title={t('settings.manageUsers')}>
                                        <SettingsUsers
                                            users={users}
                                            formData={formUser}
                                            setFormData={setFormUser}
                                            setModalOptions={setModalOptionsUser}
                                            onConfirm={openCloseConfirmModal}
                                            isSubmitting={isSubmitting}
                                        />
                                    </Tab>
                                </Tabs>
                            ) : (
                                <>
                                    {/* Utilisateur connecté */}
                                    {currentUser && (
                                        <SettingsUser user={currentUser} onOpen={openClosePasswordModal} isSubmitting={isSubmitting} />
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* Modale de modification de mot de passe */}
                    {auth.isLoggedIn && formPassword && modalOptionsPassword.isOpen && (
                        <PasswordModal
                            formData={formPassword}
                            modalOptions={modalOptionsPassword}
                            setModalOptions={setModalOptionsPassword}
                            onClose={openClosePasswordModal}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {/* Modale de modification d'utilisateur */}
                    {auth.isLoggedIn && auth.level >= EnumUserRole.SUPERADMIN && formUser && modalOptionsUser.isOpen && (
                        <SettingsModal
                            user={users.find((u) => u.id === formUser.id)}
                            formData={formUser}
                            setFormData={setFormUser}
                            modalOptions={modalOptionsUser}
                            setModalOptions={setModalOptionsUser}
                            onReset={handleResetPassword}
                            onClose={openCloseUserModal}
                            onSubmit={handleSubmitUser}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {/* Modale de confirmation */}
                    {auth.isLoggedIn && auth.level >= EnumUserRole.SUPERADMIN && modalOptionsConfirm.isOpen && (
                        <ConfirmModal
                            modalOptions={modalOptionsConfirm}
                            setModalOptions={setModalOptionsConfirm}
                            onClose={openCloseConfirmModal}
                            onConfirmAction={handleConfirmAction}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default Settings;
