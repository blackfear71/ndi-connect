import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaAngleRight, FaGift, FaTrashCan } from 'react-icons/fa6';
import { GiTwoCoins } from 'react-icons/gi';
import { IoGiftSharp } from 'react-icons/io5';

import { useAuth } from '../../../../utils/context/AuthContext';

import { EnumAction, EnumUserRole } from '../../../../enums';

/**
 * Liste des participants
 */
const PlayerList = ({ players, onConfirm, showRewardModal, showPlayerModal, isSubmitting }) => {
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
                        style={{ backgroundColor: p.color }}
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
                                {p?.rewards?.length ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Supression */}
                    {auth.isLoggedIn && auth.level >= EnumUserRole.SUPERADMIN && (
                        <Button
                            onClick={() => handleDelete(p)}
                            className="edition-item-button"
                            style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            disabled={isSubmitting}
                        >
                            <FaTrashCan color={isSubmitting ? 'gray' : 'white'} />
                        </Button>
                    )}

                    {/* Cadeaux */}
                    <Button
                        onClick={() => showRewardModal(p)}
                        className="edition-item-button"
                        style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                        disabled={isSubmitting}
                    >
                        <FaGift color={isSubmitting ? 'gray' : 'white'} />
                    </Button>

                    {/* Modification */}
                    {auth.isLoggedIn && auth.level >= EnumUserRole.ADMIN && (
                        <Button
                            onClick={() => showPlayerModal(p, EnumAction.UPDATE)}
                            className="edition-item-button"
                            style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            disabled={isSubmitting}
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
