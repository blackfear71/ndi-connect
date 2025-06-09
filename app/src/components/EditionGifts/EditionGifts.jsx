import { useTranslation } from 'react-i18next';

/**
 * Liste des cadeaux
 */
const EditionGifts = ({ gifts }) => {
    // Traductions
    const { t } = useTranslation();

    // TODO : ajouter des actions pour ajouter/modifier/supprimer un cadeau
    // TODO : ajouter des actions pour donner des points/cadeaux à un participant
    // TODO : ajouter une action pour rayer un cadeau si plus disponible

    return (
        <div style={{ color: 'white' }}>
            {gifts && gifts.length > 0 ? gifts.map((gift) => <div key={gift.id}>{gift.name}</div>) : 'Aucun cadeau'}
        </div>
    );
};

export default EditionGifts;
