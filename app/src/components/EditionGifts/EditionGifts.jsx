import { useContext } from 'react';

import { Badge, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaAngleRight, FaTrashCan } from 'react-icons/fa6';
import { GiCardboardBox, GiCardboardBoxClosed } from 'react-icons/gi';
import { GrMoney } from 'react-icons/gr';

import UserRole from '../../enums/UserRole';

import { AuthContext } from '../../utils/AuthContext';

import './EditionGifts.css';

/**
 * Liste des cadeaux
 */
const EditionGifts = ({ gifts, setFormData, setModalOptions, isSubmitting }) => {
    // Contexte
    const { auth } = useContext(AuthContext);

    // Traductions
    const { t } = useTranslation();

    /**
     * Affiche la modale de création/modification/suppression d'un cadeau
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

        setModalOptions({
            action: action,
            isOpen: true
        });
    };

    return (
        <>
            {/* Ajout */}
            {auth.isLoggedIn && auth.level >= UserRole.ADMIN && (
                <div className="d-grid mb-2">
                    <Button variant="outline-edition" onClick={() => showGiftModal(null, 'create')}>
                        {t('edition.addGift')}
                    </Button>
                </div>
            )}

            {/* Liste */}
            {gifts && gifts.length > 0 ? (
                gifts.map((gift) => (
                    <div key={gift.id} className="d-flex align-items-center gap-2 mt-2">
                        {/* Cadeau */}
                        <div className="d-flex align-items-center flex-grow-1 edition-gifts-name">
                            <Badge bg="success" className="me-1 d-flex align-items-center">
                                <GrMoney size={18} className="me-1" /> {gift.value}
                            </Badge>
                            <Badge bg="primary" className="me-1 d-flex align-items-center">
                                {gift.remainingQuantity === 0 ? (
                                    <GiCardboardBoxClosed size={18} className="me-1" />
                                ) : (
                                    <GiCardboardBox size={18} className="me-1" />
                                )}{' '}
                                {gift.remainingQuantity}
                            </Badge>
                            <span
                                className={`d-inline-block flex-grow-1 edition-gifts-ellipsis-text ${gift.remainingQuantity === 0 ? 'text-decoration-line-through' : ''}`}
                            >
                                {gift.name}
                            </span>
                        </div>

                        {/* Supression */}
                        {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && (
                            <Button
                                onClick={isSubmitting ? null : () => showGiftModal(gift, 'delete')}
                                className="edition-gifts-button"
                                style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            >
                                <FaTrashCan color={isSubmitting ? 'gray' : 'white'} />
                            </Button>
                        )}

                        {/* Modification */}
                        {auth.isLoggedIn && auth.level >= UserRole.ADMIN && (
                            <Button
                                onClick={isSubmitting ? null : () => showGiftModal(gift, 'update')}
                                className="edition-gifts-button"
                                style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            >
                                <FaAngleRight color={isSubmitting ? 'gray' : 'white'} />
                            </Button>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-white">{t('edition.noGifts')}</div>
            )}
        </>
    );
};

export default EditionGifts;
