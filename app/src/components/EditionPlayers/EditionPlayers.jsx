import { useTranslation } from 'react-i18next';

/**
 * Liste des participants
 */
const EditionPlayers = ({ players }) => {
    // Traductions
    const { t } = useTranslation();

    // TODO : ajouter des actions pour ajouter/modifier/supprimer un participant
    // TODO : ajouter des actions pour donner des points/cadeaux

    return (
        <div style={{ color: 'white' }}>
            {players && players.length > 0
                ? players.map((player) => <div key={player.id}>{player.name}</div>)
                : 'Aucun participant'}
        </div>
    );
};

export default EditionPlayers;
