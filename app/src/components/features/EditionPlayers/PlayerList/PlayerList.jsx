import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaAngleRight, FaGift, FaTrashCan } from 'react-icons/fa6';
import { GiTwoCoins } from 'react-icons/gi';
import { IoGiftSharp } from 'react-icons/io5';

import { useAuth } from '../../../../utils/context/AuthContext';

import { UserRole } from '../../../../enums';

/**
 * Liste des participants
 */
const PlayerList = ({ players, getIconColor, onConfirm, showRewardModal, showPlayerModal, isSubmitting }) => {
    // Contexte
    const { auth } = useAuth();

    // Traductions
    const { t } = useTranslation();

    /**
     * Ouvre la modale de suppression de participant
     * @param {*} player Participant
     */
    const handleDelete = (player) => {
        // Ouverture de la modale de confirmation
        onConfirm({
            content: t('edition.deletePlayer', { name: player.name }),
            action: 'deletePlayer',
            data: player.id
        });
    };

    return (
        <>
            {/* Liste */}
            {players?.map((p) => (
                <div key={p.id} className="d-flex align-items-center gap-2 p-2 mt-2 edition-item">
                    {/* Icône */}
                    <div
                        className="d-flex align-items-center justify-content-center edition-item-icon"
                        style={{ backgroundColor: getIconColor(p.name) }}
                    >
                        {p.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Participant */}
                    <div className="d-flex flex-column flex-grow-1 edition-item-name">
                        <span className="edition-item-ellipsis-text">{p.name}</span>

                        <div className="d-flex align-items-center gap-2">
                            <span className="d-flex align-items-center gap-1 edition-item-counter">
                                <GiTwoCoins size={18} />
                                {p.points}
                            </span>
                            <span className="d-flex align-items-center gap-1 edition-item-counter">
                                <IoGiftSharp size={15} />
                                {p?.rewards.length}
                            </span>
                        </div>
                    </div>

                    {/* Supression */}
                    {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && (
                        <Button
                            onClick={isSubmitting ? null : () => handleDelete(p)}
                            className="edition-button"
                            style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                        >
                            <FaTrashCan color={isSubmitting ? 'gray' : 'white'} />
                        </Button>
                    )}

                    {/* Cadeaux */}
                    <Button
                        onClick={isSubmitting ? null : () => showRewardModal(p)}
                        className="edition-button"
                        style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                        <FaGift color={isSubmitting ? 'gray' : 'white'} />
                    </Button>

                    {/* Modification */}
                    {auth.isLoggedIn && auth.level >= UserRole.ADMIN && (
                        <Button
                            onClick={isSubmitting ? null : () => showPlayerModal(p, 'update')}
                            className="edition-button"
                            style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                        >
                            <FaAngleRight color={isSubmitting ? 'gray' : 'white'} />
                        </Button>
                    )}
                </div>
            ))}
        </>
    );
};

export default PlayerList;
