import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { IoAddCircleOutline } from 'react-icons/io5';

import { useAuth } from '../../../utils/context/AuthContext';

import { EnumAction, EnumUserRole } from '../../../enums';

import './EditionGifts.css';

import GiftList from './GiftList/GiftList';

/**
 * Liste des cadeaux
 */
const EditionGifts = ({ gifts, setFormData, setModalOptions, onConfirm, isSubmitting }) => {
    // Contexte
    const { auth } = useAuth();

    // Traductions
    const { t } = useTranslation();

    // Constantes
    const availableGifts = gifts?.filter((g) => g.remainingQuantity > 0);
    const unavailableGifts = gifts?.filter((g) => g.remainingQuantity <= 0);

    /**
     * Affiche la modale de création/modification d'un cadeau
     * @param {*} gift Données cadeau
     * @param {*} action Action à réaliser
     */
    const showGiftModal = (gift, action) => {
        if (gift) {
            setFormData({
                id: gift.id,
                name: gift.name,
                value: gift.value,
                quantity: gift.quantity
            });
        }

        setModalOptions((prev) => ({
            ...prev,
            action: action,
            isOpen: !prev.isOpen
        }));
    };

    return (
        <>
            {/* Ajout */}
            {auth.isLoggedIn && auth.level >= EnumUserRole.ADMIN && (
                <div className="d-grid">
                    <Button variant="outline-action" onClick={() => showGiftModal(null, EnumAction.CREATE)} disabled={isSubmitting}>
                        <IoAddCircleOutline size={25} />
                        {t('edition.addGift')}
                    </Button>
                </div>
            )}

            {/* Liste */}
            {(availableGifts && availableGifts.length > 0) || (unavailableGifts && unavailableGifts.length > 0) ? (
                <>
                    {/* Cadeaux à gagner */}
                    {availableGifts && availableGifts.length > 0 && (
                        <div className="mt-3">
                            <GiftList
                                gifts={availableGifts}
                                title={t('edition.availableGifts')}
                                onConfirm={onConfirm}
                                showGiftModal={showGiftModal}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    )}

                    {/* Cadeaux déjà gagnés */}
                    {unavailableGifts && unavailableGifts.length > 0 && (
                        <div className="mt-3">
                            <GiftList
                                gifts={unavailableGifts}
                                title={t('edition.unavailableGifts')}
                                onConfirm={onConfirm}
                                showGiftModal={showGiftModal}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="px-2 py-3 mt-2 page-empty">{t('edition.noGifts')}</div>
            )}
        </>
    );
};

export default EditionGifts;
