import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaAngleRight, FaTrashCan } from 'react-icons/fa6';
import { IoAddCircleOutline } from 'react-icons/io5';

import { UserRole } from '../../../enums';

/**
 * Gestion des utilisateurs
 */
const SettingsUserList = ({ login, users, setFormData, modalOptions, setModalOptions, onConfirm }) => {
    // Traductions
    const { t } = useTranslation();

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
            {/* TODO : ajouter un bouton de création d'utilisateur qui ouvre la modale de création/modification */}
            {/* Ajout */}
            <div className="d-grid mb-2">
                <Button variant="outline-action" onClick={() => showHidePlayerEntry(true)}>
                    <IoAddCircleOutline size={25} />
                    {t('settings.addUser')}
                </Button>
            </div>

            {/* TODO : faire un composant pour la liste comme pour les participants/cadeaux ? */}
            {/* Liste */}
            {users && users.length > 0 ? (
                users.map((u) => (
                    <div key={u.id} className="d-flex align-items-center gap-2 p-2 mt-2 settings-item">
                        {/* Icône */}
                        <div className="d-flex align-items-center justify-content-center settings-item-icon">{u.role?.icon}</div>

                        {/* Identifiant et rôle */}
                        <div className="d-flex flex-column flex-grow-1 settings-item-name">
                            <span className="settings-item-ellipsis-text">{u.login}</span>
                            <div className="d-flex align-items-center gap-2 settings-item-role">{u.role?.label}</div>
                        </div>

                        {/* Supression */}
                        {(u.level !== UserRole.SUPERADMIN || u.login !== login) && (
                            <Button
                                onClick={() => handleDelete(u)}
                                className="settings-item-button"
                                style={{ cursor: modalOptions.isSubmitting ? 'not-allowed' : 'pointer' }}
                                disabled={modalOptions.isSubmitting}
                            >
                                <FaTrashCan color={modalOptions.isSubmitting ? 'gray' : 'white'} />
                            </Button>
                        )}

                        {/* Modification */}
                        <Button
                            onClick={() => showUpdateUserModal(u)}
                            className="settings-item-button"
                            style={{ cursor: modalOptions.isSubmitting ? 'not-allowed' : 'pointer' }}
                            disabled={modalOptions.isSubmitting}
                        >
                            <FaAngleRight color={modalOptions.isSubmitting ? 'gray' : 'white'} />
                        </Button>
                    </div>
                ))
            ) : (
                // TODO : vérifier qu'il n'y a pas des "edition-" dans settings
                <div className="px-2 py-3 mt-2 edition-empty">{t('settings.noUsers')}</div>
            )}
        </>
    );
};

export default SettingsUserList;
