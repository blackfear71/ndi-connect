import { useTranslation } from 'react-i18next';

import { Button } from 'react-bootstrap';
import { IoAddCircleOutline } from 'react-icons/io5';

import { useAuth } from '../../../utils/context/AuthContext';

import { EnumAction, EnumUserRole } from '../../../enums';

import './EditionGifts.css';

import GiftList from './GiftList/GiftList';

/**
 * Liste des cadeaux
 */
const EditionGifts = ({ gifts, onOpen, onConfirm, isSubmitting }) => {
    // Contexte
    const { auth } = useAuth();

    // Traductions
    const { t } = useTranslation();

    // Constantes
    const availableGifts = gifts?.filter((g) => g.remainingQuantity > 0);
    const unavailableGifts = gifts?.filter((g) => g.remainingQuantity <= 0);

    return (
        <>
            {/* Ajout */}
            {auth.isLoggedIn && auth.level >= EnumUserRole.ADMIN && (
                <div className="d-grid">
                    <Button variant="outline-action" onClick={() => onOpen(EnumAction.CREATE)} disabled={isSubmitting}>
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
                                onOpen={onOpen}
                                onConfirm={onConfirm}
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
                                onOpen={onOpen}
                                onConfirm={onConfirm}
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
