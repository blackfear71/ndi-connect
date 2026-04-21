import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { HiKey } from 'react-icons/hi2';

/**
 * Gestion des utilisateurs
 */
const SettingsUser = ({ user, formPassword, setFormPassword, setModalOptionsPassword, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    /**
     * Affiche la modale de modification de mot de passe
     */
    const showPasswordModal = () => {
        if (user) {
            setFormPassword({
                ...formPassword,
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        }

        setModalOptionsPassword((prev) => ({
            ...prev,
            isOpen: !prev.isOpen
        }));
    };

    return (
        <>
            {/* Utilisateur */}
            <div className="d-flex align-items-center gap-2 p-2 mt-3 settings-item">
                {/* Icône */}
                <div className="d-flex align-items-center justify-content-center settings-item-icon">{user.role?.icon}</div>

                {/* Identifiant et rôle */}
                <div className="d-flex flex-column flex-grow-1 settings-item-name">
                    <span className="settings-item-ellipsis-text">{user.login}</span>
                    <div className="d-flex align-items-center gap-2 settings-item-role">{user.role?.label}</div>
                </div>

                {/* Mot de passe */}
                <Button
                    onClick={() => showPasswordModal()}
                    className="settings-item-button"
                    style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    disabled={isSubmitting}
                >
                    <HiKey color={isSubmitting ? 'gray' : 'white'} />
                </Button>
            </div>

            {/* Description */}
            {user.level !== '' && (
                <p className="text-white mt-2 px-2 py-1 settings-description">{t(`settings.levelDescription${user.level}`)}</p>
            )}
        </>
    );
};

export default SettingsUser;
