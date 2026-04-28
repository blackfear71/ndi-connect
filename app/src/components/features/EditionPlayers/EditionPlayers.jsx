import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { IoAddCircleOutline } from 'react-icons/io5';

import { useAuth } from '../../../utils/context/AuthContext';

import { EnumAction, EnumUserRole } from '../../../enums';

import PlayerList from './PlayerList/PlayerList';

/**
 * Liste des participants
 */
const EditionPlayers = ({
    players,
    setFormPlayer,
    setModalOptionsPlayer,
    setFormReward,
    setModalOptionsReward,
    onConfirm,
    isSubmitting
}) => {
    // Contexte
    const { auth } = useAuth();

    // Traductions
    const { t } = useTranslation();

    /**
     * Affiche la modale de création/modification d'un participant
     * @param {*} player Données participant
     * @param {*} action Action à réaliser
     */
    const showPlayerModal = (player, action) => {
        if (player) {
            setFormPlayer({
                id: player.id,
                name: player.name,
                points: 0,
                giveaway: 0,
                giveawayPlayerId: 0
            });
        }

        setModalOptionsPlayer((prev) => ({
            ...prev,
            action: action,
            isOpen: !prev.isOpen
        }));
    };

    /**
     * Affiche la modale d'attribution d'un cadeau à un participant
     * @param {*} player Données participant
     */
    const showRewardModal = (player) => {
        if (player) {
            setFormReward({
                idReward: null,
                idPlayer: player.id,
                idGift: 0
            });
        }

        setModalOptionsReward((prev) => ({
            ...prev,
            isOpen: !prev.isOpen
        }));
    };

    return (
        <>
            {/* Ajout */}
            {auth.isLoggedIn && auth.level >= EnumUserRole.ADMIN && (
                <div className="d-grid">
                    <Button variant="outline-action" onClick={() => showPlayerModal(null, EnumAction.CREATE)} disabled={isSubmitting}>
                        <IoAddCircleOutline size={25} />
                        {t('edition.addPlayer')}
                    </Button>
                </div>
            )}

            {/* Liste */}
            {players && players.length > 0 ? (
                <div className="mt-3">
                    <PlayerList
                        players={players}
                        onConfirm={onConfirm}
                        showRewardModal={showRewardModal}
                        showPlayerModal={showPlayerModal}
                        isSubmitting={isSubmitting}
                    />
                </div>
            ) : (
                <div className="px-2 py-3 mt-2 page-empty">{t('edition.noPlayers')}</div>
            )}
        </>
    );
};

export default EditionPlayers;
