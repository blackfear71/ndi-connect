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
    const [formUpdateUser, setFormUpdateUser] = useState({
        id: null,
        level: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageModalConfirm, setMessageModalConfirm] = useState(null);
    const [messageModalUpdateUser, setMessageModalUpdateUser] = useState(null);
    const [messagePage, setMessagePage] = useState(null);
    const [modalOptionsConfirm, setModalOptionsConfirm] = useState({ content: '', data: null, isOpen: false });
    const [modalOptionsUpdateUser, setModalOptionsUpdateUser] = useState({ isOpen: false });
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

    /**
     * Réinitialisation du mot de passe
     * @param {*} id Identifiant utilisateur
     */
    const handleResetPassword = (id) => {
        setMessageModalUpdateUser(null);
        setMessagePage(null);
        setIsSubmitting(true);

        const usersService = new UsersService(localStorage.getItem('token'));

        const subscriptionUsers = usersService.resetPassword(id);

        combineLatest([subscriptionUsers])
            .pipe(
                map(([dataUsers]) => {
                    setMessageModalUpdateUser({
                        code: dataUsers.response.message,
                        params: { password: dataUsers.response.data },
                        type: dataUsers.response.status
                    });
                }),
                take(1),
                catchError((err) => {
                    setMessageModalUpdateUser({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Ouverture/fermeture de la modale de modification d'utilisateur
     */
    const openCloseUpdateUserModal = () => {
        // Ouverture ou fermeture
        setModalOptionsUpdateUser({ isOpen: !modalOptionsUpdateUser.isOpen });

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsUpdateUser.isOpen && resetFormUpdateUser();
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
     * Modification d'un utilisateur
     */
    const handleSubmitUpdateUser = () => {
        setMessageModalUpdateUser(null);
        setMessagePage(null);
        setIsSubmitting(true);

        const usersService = new UsersService(localStorage.getItem('token'));

        const subscriptionUsers = usersService.updateUser(formUpdateUser);

        combineLatest([subscriptionUsers])
            .pipe(
                map(([dataUsers]) => {
                    openCloseUpdateUserModal('');
                    setUsers(dataUsers.response.data);
                    setMessagePage({ code: dataUsers.response.message, type: dataUsers.response.status });
                }),
                take(1),
                catchError((err) => {
                    setMessageModalUpdateUser({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
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
                isOpen: !modalOptionsConfirm.isOpen
            });
        } else {
            setModalOptionsConfirm({
                content: '',
                data: null,
                isOpen: false
            });
        }
    };

    /**
     * Suppression d'un utilisateur
     */
    const handleDeleteUser = () => {
        setMessageModalConfirm(null);
        setMessagePage(null);
        setIsSubmitting(true);

        const usersService = new UsersService(localStorage.getItem('token'));

        const subscriptionUsers = usersService.deleteUser(modalOptionsConfirm.data);

        combineLatest([subscriptionUsers])
            .pipe(
                map(([dataUsers]) => {
                    openCloseConfirmModal();
                    setUsers(dataUsers.response.data);
                    setMessagePage({ code: dataUsers.response.message, type: dataUsers.response.status });
                }),
                take(1),
                catchError((err) => {
                    setMessageModalConfirm({ code: err?.response?.message, type: err?.response?.status });
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
                <div className="layout-spinner-centered">
                    <Spinner animation="border" role="status" variant="light" />
                </div>
            ) : (
                <>
                    {/* Message */}
                    {messagePage && (
                        <Message code={messagePage.code} params={messagePage.params} type={messagePage.type} setMessage={setMessagePage} />
                    )}

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
                                            formData={formCreateUser}
                                            setFormData={setFormCreateUser}
                                            showForm={showCreateUserForm}
                                            showFormMethod={showHideCreateUserForm}
                                            setMessage={setMessagePage}
                                            onSubmit={handleSubmitCreateUser}
                                            isSubmitting={isSubmitting}
                                        />
                                    </div>

                                    {/* Gestion utilisateurs */}
                                    <div className="settings-form mt-3">
                                        <SettingsUsers
                                            login={auth.login}
                                            users={users}
                                            formUpdateUser={formUpdateUser}
                                            setFormUpdateUser={setFormUpdateUser}
                                            setModalOptionsUpdateUser={setModalOptionsUpdateUser}
                                            onConfirm={openCloseConfirmModal}
                                            isSubmitting={isSubmitting}
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
                            message={messageModalUpdateUser}
                            setMessage={setMessageModalUpdateUser}
                            onReset={handleResetPassword}
                            onClose={openCloseUpdateUserModal}
                            onSubmit={handleSubmitUpdateUser}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {/* Modale de confirmation */}
                    {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && modalOptionsConfirm.isOpen && (
                        <ConfirmModal
                            modalOptions={modalOptionsConfirm}
                            message={messageModalConfirm}
                            setMessage={setMessageModalConfirm}
                            onClose={openCloseConfirmModal}
                            onConfirmAction={handleDeleteUser}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default Settings;
