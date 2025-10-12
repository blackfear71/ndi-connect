import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaQuestionCircle } from 'react-icons/fa';
import { FaAngleRight, FaStar, FaTrashCan, FaUser, FaUserPlus } from 'react-icons/fa6';

import UserRole from '../../enums/UserRole';

import './SettingsUsers.css';

/**
 * Liste des participants
 */
const SettingsUsers = ({ login, users, formUpdateUser, setFormUpdateUser, setModalOptionsUpdateUser, onConfirm, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    /**
     * Affiche l'icône du rôle
     * @param {*} level Niveau utilisateur
     * @returns Icône
     */
    const getUserRoleIcon = (level) => {
        switch (level) {
            case UserRole.USER:
                return <FaUser size={18} className="ms-1 me-2" />;
            case UserRole.ADMIN:
                return <FaUserPlus size={18} className="ms-1 me-2" />;
            case UserRole.SUPERADMIN:
                return <FaStar size={18} className="ms-1 me-2" />;
            default:
                return <FaQuestionCircle size={18} className="ms-1 me-2" />;
        }
    };

    /**
     * Ouvre la modale de suppression d'utilisateur
     * @param {*} user Utilisateur
     */
    const handleDelete = (user) => {
        // Ouverture de la modale de confirmation
        onConfirm({
            content: t('settings.deleteUser', { name: user.login }),
            data: user.id
        });
    };

    /**
     * Affiche la modale de modification d'un utilisateur
     * @param {*} user Données utilisateur
     */
    const showUpdateUserModal = (user) => {
        if (user) {
            setFormUpdateUser({
                ...formUpdateUser,
                id: user.id,
                level: user.level
            });
        }

        setModalOptionsUpdateUser({
            isOpen: true
        });
    };

    return (
        <>
            {/* Titre */}
            <h1>{t('settings.manageUsers')}</h1>

            {/* Liste */}
            {users && users.length > 0 ? (
                users.map((u) => (
                    <div key={u.id} className="d-flex align-items-center gap-2 mt-2">
                        {/* Identifiant */}
                        <div className="d-flex align-items-center flex-grow-1 settings-users-name">
                            {getUserRoleIcon(u.level)}
                            <span className="d-inline-block flex-grow-1 settings-users-ellipsis-text">{u.login}</span>
                        </div>

                        {/* Supression */}
                        {(u.level !== UserRole.SUPERADMIN || u.login !== login) && (
                            <Button
                                onClick={isSubmitting ? null : () => handleDelete(u)}
                                className="settings-users-button"
                                style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            >
                                <FaTrashCan color={isSubmitting ? 'gray' : 'white'} />
                            </Button>
                        )}

                        {/* Modification */}
                        <Button
                            onClick={isSubmitting ? null : () => showUpdateUserModal(u)}
                            className="settings-users-button"
                            style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                        >
                            <FaAngleRight color={isSubmitting ? 'gray' : 'white'} />
                        </Button>
                    </div>
                ))
            ) : (
                <div className="settings-users-empty mt-2">{t('settings.noUsers')}</div>
            )}
        </>
    );
};

export default SettingsUsers;
