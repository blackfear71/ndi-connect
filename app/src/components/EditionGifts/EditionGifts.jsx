import { useContext } from 'react';

import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import GiftList from '../../components/GiftList/GiftList';

import UserRole from '../../enums/UserRole';

import { AuthContext } from '../../utils/AuthContext';

import './EditionGifts.css';

/**
 * Liste des cadeaux
 */
const EditionGifts = ({ gifts, formData, setFormData, setModalOptions, onConfirm, isSubmitting }) => {
    // Contexte
    const { auth } = useContext(AuthContext);

    // Traductions
    const { t } = useTranslation();

    // Constantes
    const availableGifts = gifts.filter((g) => g.remainingQuantity > 0);
    const unavailableGifts = gifts.filter((g) => g.remainingQuantity <= 0);

    /**
     * Affiche la modale de création/modification d'un cadeau
     * @param {*} gift Données cadeau
     * @param {*} action Action à réaliser
     */
    const showGiftModal = (gift, action) => {
        if (gift) {
            setFormData({
                ...formData,
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
            {auth.isLoggedIn && auth.level >= UserRole.ADMIN && (
                <div className="d-grid">
                    <Button variant="outline-action" onClick={() => showGiftModal(null, 'create')}>
                        {t('edition.addGift')}
                    </Button>
                </div>
            )}

            {/* Liste */}
            {(availableGifts && availableGifts.length > 0) || (unavailableGifts && unavailableGifts.length > 0) ? (
                <>
                    {/* Cadeaux à gagner */}
                    {availableGifts && availableGifts.length > 0 && (
                        <div className="mt-2">
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
                        <div className="mt-2">
                            <GiftList
                                gifts={unavailableGifts}
                                title={t('edition.unavailableGifts')}
                                onConfirm={onConfirm}
                                showGiftModal={showGiftModal}
                                isSubmitting={isSubmitting}
                                className="mt-2"
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="edition-empty mt-2">{t('edition.noGifts')}</div>
            )}
        </>
    );
};

export default EditionGifts;
