import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaAngleRight, FaStar, FaUser, FaUserPlus } from 'react-icons/fa6';

import UserRole from '../../enums/UserRole';

import './SettingsUsers.css';

/**
 * Liste des participants
 */
const SettingsUsers = ({ users, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

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
                            {u.level === UserRole.USER && <FaUser size={18} className="ms-1 me-2" />}
                            {u.level === UserRole.ADMIN && <FaUserPlus size={18} className="ms-1 me-2" />}
                            {u.level === UserRole.SUPERADMIN && <FaStar size={18} className="ms-1 me-2" />}
                            <span className="d-inline-block flex-grow-1 settings-users-ellipsis-text">{u.login}</span>
                        </div>

                        {/* Modification */}
                        <Button
                            // onClick={() => showPlayerModal(p, 'update')}
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
