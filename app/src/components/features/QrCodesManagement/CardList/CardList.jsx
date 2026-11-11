import { useTranslation } from 'react-i18next';

import { Badge } from 'react-bootstrap';
import { FaTrashCan } from 'react-icons/fa6';
import { LuQrCode } from 'react-icons/lu';

import { TooltipButton } from '../../../../components/shared';

/**
 * Liste des QR codes enregistrés
 */
const CardList = ({ edition, cards, onConfirm, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    /**
     * Ouvre la modale de suppression de carte
     * @param {*} card Carte
     */
    const handleDelete = (card) => {
        // Ouverture de la modale de confirmation
        onConfirm({
            content: t('qrCodes.deleteCard', {
                name: card.playerName,
                year: new Date(edition.startDate).getFullYear(),
                location: edition.location
            }),
            action: 'deleteCard',
            data: card.id
        });
    };

    return (
        <>
            {/* Titre */}
            <div className="d-flex mt-3">
                <Badge pill bg="warning" className="edition-subtitle-badge">
                    {t('qrCodes.registeredCards')}
                </Badge>
            </div>

            {/* Liste */}
            {cards?.map((c) => (
                <div key={c.id} className="d-flex align-items-center gap-2 p-2 mt-2 qrcodes-item">
                    {/* Icône */}
                    <div className="d-flex align-items-center justify-content-center qrcodes-item-icon">
                        <LuQrCode size={20} />
                    </div>

                    {/* Participant et QR code */}
                    <div className="d-flex flex-column flex-grow-1 qrcodes-item-name">
                        <span className="qrcodes-item-ellipsis-text">{c.playerName}</span>

                        <div className="qrcodes-item-details">{c.code}</div>
                    </div>

                    {/* Suppression */}
                    <TooltipButton
                        tooltip={t('common.delete')}
                        content={<FaTrashCan color={isSubmitting ? 'gray' : 'white'} />}
                        className="qrcodes-item-button"
                        onClick={() => handleDelete(c)}
                        isSubmitting={isSubmitting}
                    />
                </div>
            ))}
        </>
    );
};

export default CardList;
