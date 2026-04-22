import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { IoAddCircleOutline } from 'react-icons/io5';

import UserList from './UserList/UserList';

/**
 * Gestion des utilisateurs
 */
const SettingsUsers = ({ users, setFormData, setModalOptions, onConfirm, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    /**
     * Affiche la modale de modification d'un utilisateur
     * @param {*} user Données utilisateur
     */
    const showUserModal = (user) => {
        if (user) {
            setFormData({
                id: user.id,
                level: user.level
            });

            setModalOptions((prev) => ({
                ...prev,
                isOpen: !prev.isOpen
            }));
        }
    };

    return (
        <>
            {/* Ajout */}
            <div className="d-grid mb-2">
                {/* TODO : ouvrir la modale de création/modification */}
                <Button variant="outline-action" onClick={() => showHidePlayerEntry(true)}>
                    <IoAddCircleOutline size={25} />
                    {t('settings.addUser')}
                </Button>
            </div>

            {/* Liste */}
            {users && users.length > 0 ? (
                <div className="mt-3">
                    <UserList
                        users={users}
                        onConfirm={onConfirm}
                        showUserModal={showUserModal}
                        isSubmitting={isSubmitting}
                    />
                </div>
            ) : (
                <div className="px-2 py-3 mt-2 page-empty">{t('settings.noUsers')}</div>
            )}
        </>
    );
};

export default SettingsUsers;
