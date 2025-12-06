import { useContext, useMemo, useState } from 'react';

import { Badge, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaAngleRight, FaGift, FaSort, FaTrashCan } from 'react-icons/fa6';
import { GiCardboardBox, GiCardboardBoxClosed } from 'react-icons/gi';
import { GrMoney } from 'react-icons/gr';

import UserRole from '../../enums/UserRole';

import { AuthContext } from '../../utils/AuthContext';

/**
 * Liste des cadeaux
 */
const GiftList = ({ gifts, title, onConfirm, showGiftModal, isSubmitting }) => {
    // Contexte
    const { auth } = useContext(AuthContext);

    // Traductions
    const { t } = useTranslation();

    // Local states
    const [sortMode, setSortMode] = useState('name');

    /**
     * Change le mode de tri (nom > valeur > quantité)
     */
    const handleToggleSort = () => {
        setSortMode((prev) => {
            if (prev === 'name') {
                return 'value';
            }

            if (prev === 'value') {
                // Vérifie si toutes les quantités sont à 0
                const allZero = gifts.every((g) => g.remainingQuantity === 0);

                // Si toutes les quantités sont à 0, on passe au nom directement
                return allZero ? 'name' : 'quantity';
            }

            // Si on était sur quantity, on revient toujours à name
            return 'name';
        });
    };

    /**
     * Cadeaux triés
     */
    const sortedGifts = useMemo(() => {
        switch (sortMode) {
            // Tri par valeur
            case 'value':
                return gifts.sort((a, b) => (b.value !== a.value ? b.value - a.value : a.name.localeCompare(b.name)));

            // Tri par quantité
            case 'quantity':
                return gifts.sort((a, b) =>
                    b.remainingQuantity !== a.remainingQuantity ? b.remainingQuantity - a.remainingQuantity : a.name.localeCompare(b.name)
                );

            // Tri par nom (par défaut)
            case 'name':
            default:
                return gifts.sort((a, b) => a.name.localeCompare(b.name));
        }
    }, [gifts, sortMode]);

    /**
     * Ouvre la modale de suppression de cadeau
     * @param {*} gift Cadeau
     */
    const handleDelete = (gift) => {
        // Ouverture de la modale de confirmation
        onConfirm({
            content: t('edition.deleteGift', { name: gift.name }),
            action: 'deleteGift',
            data: gift.id
        });
    };

    return (
        <>
            {/* Titre */}
            <div className="edition-sub-title d-flex align-items-center justify-content-between">
                {title}

                <Button className="edition-gifts-button edition-gifts-sort" onClick={handleToggleSort}>
                    <FaSort size={15} />
                    {sortMode === 'name' && <FaGift size={15} className="ms-2" />}
                    {sortMode === 'value' && <GrMoney size={15} className="ms-2" />}
                    {sortMode === 'quantity' && <GiCardboardBox size={15} className="ms-2" />}
                </Button>
            </div>

            {/* Liste */}
            {sortedGifts.map((g) => (
                <div key={g.id} className="d-flex align-items-center gap-2 mt-2">
                    {/* Cadeau */}
                    <div className="d-flex align-items-center flex-grow-1 edition-gifts-name">
                        <Badge bg="success" className="me-1 d-flex align-items-center">
                            <GrMoney size={18} className="me-1" /> {g.value}
                        </Badge>
                        <Badge bg="primary" className="me-1 d-flex align-items-center">
                            {g.remainingQuantity === 0 ? (
                                <GiCardboardBoxClosed size={18} className="me-1" />
                            ) : (
                                <GiCardboardBox size={18} className="me-1" />
                            )}{' '}
                            {g.remainingQuantity}
                        </Badge>
                        <span
                            className={`d-inline-block flex-grow-1 edition-gifts-ellipsis-text ${g.remainingQuantity === 0 ? 'text-decoration-line-through' : ''}`}
                        >
                            {g.name}
                        </span>
                    </div>

                    {/* Supression */}
                    {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && (
                        <Button
                            onClick={isSubmitting ? null : () => handleDelete(g)}
                            className="edition-gifts-button"
                            style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                        >
                            <FaTrashCan color={isSubmitting ? 'gray' : 'white'} />
                        </Button>
                    )}

                    {/* Modification */}
                    {auth.isLoggedIn && auth.level >= UserRole.ADMIN && (
                        <Button
                            onClick={isSubmitting ? null : () => showGiftModal(g, 'update')}
                            className="edition-gifts-button"
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

export default GiftList;
