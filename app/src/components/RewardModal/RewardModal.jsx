import { useContext, useEffect } from 'react';

import { Badge, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaTrashCan } from 'react-icons/fa6';
import { PiListStarBold } from 'react-icons/pi';

import UserRole from '../../enums/UserRole';

import { AuthContext } from '../../utils/AuthContext';
import Message from '../Message/Message';

import './RewardModal.css';

const RewardModal = ({ player, gifts, formData, setFormData, modalOptions, setModalOptions, onClose, onSubmit, onConfirm }) => {
    // Contexte
    const { auth } = useContext(AuthContext);

    // Traductions
    const { t } = useTranslation();

    // Constantes
    const obtainableGifts = gifts.filter((g) => g.remainingQuantity > 0 && g.value <= player.points);

    /**
     * Réinitialise le message à l'ouverture de la modale
     */
    useEffect(() => {
        if (modalOptions?.isOpen) {
            // Réinitialisation du message
            setMessage(null);
        }
    }, [modalOptions?.isOpen]);

    /**
     * Définit le message affiché
     * @param {*} message Message à afficher
     */
    const setMessage = (message) => {
        setModalOptions((prev) => ({ ...prev, message: message }));
    };

    /**
     * Met à jour le formulaire à la saisie
     * @param {*} e Evènement
     */
    const handleChangeSelect = (e) => {
        setFormData((prev) => ({
            ...prev,
            idGift: parseInt(e.target.value)
        }));
    };

    /**
     * Gère le comportement du formulaire à la soumission
     * @param {*} e Evènement
     */
    const handleSubmit = (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Contrôle cadeau sélectionné
        if (!formData.idGift) {
            setMessage({ code: 'errors.invalidGift', type: 'error' });
            return;
        } else {
            // Contrôle que les points sont >= valeur du cadeau
            const selectedGift = obtainableGifts.find((g) => g.id === formData.idGift);

            if (!selectedGift || player.points < selectedGift.value) {
                setMessage({ code: 'errors.invalidGiftPoints', type: 'error' });
                return;
            }
        }

        // Soumets le formulaire
        onSubmit();
    };

    /**
     * Ouvre la modale de suppression d'attribution de cadeau
     * @param {*} reward Cadeau du participant
     */
    const handleDelete = (reward) => {
        // Fermeture de la modale des cadeaux du joueur
        onClose();

        // Ouverture de la modale de confirmation
        onConfirm({
            content: t('edition.deleteReward', { gift: reward.name, player: player.name }),
            action: 'deleteReward',
            data: reward.id
        });
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <fieldset disabled={modalOptions.isSubmitting}>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {auth.isLoggedIn && auth.level >= UserRole.ADMIN ? t('edition.manageGifts') : t('edition.informations')}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Message */}
                        {modalOptions.message && (
                            <Message
                                code={modalOptions.message.code}
                                params={modalOptions.message.params}
                                type={modalOptions.message.type}
                                setMessage={setMessage}
                            />
                        )}

                        {/* Attribuer un cadeau / Informations */}
                        <div className="modal-section-title">
                            {auth.isLoggedIn && auth.level >= UserRole.ADMIN ? t('edition.giveGift') : t('edition.player')}
                        </div>

                        {/* Participant */}
                        <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mt-3">
                            <Badge className="reward-modal-badge bg-warning fs-6 me-2">{t('edition.player')}</Badge>
                            <span className="me-1">{player.name}</span>
                        </div>

                        {/* Nombre de points */}
                        <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mt-2">
                            <Badge className="reward-modal-badge bg-warning fs-6 me-2">{t('edition.points')}</Badge>
                            <Badge className="reward-modal-count bg-danger">{player?.points ?? 0}</Badge>
                        </div>

                        {/* Formulaire */}
                        {auth.isLoggedIn && auth.level >= UserRole.ADMIN && (
                            <>
                                {gifts.length > 0 ? (
                                    obtainableGifts.length > 0 ? (
                                        <Form.Group controlId="name" className="d-flex align-items-center mt-2">
                                            <PiListStarBold className="input-icon me-3" />
                                            <Form.Select value={formData.idGift} onChange={handleChangeSelect} required>
                                                <option key={0} value={0} disabled>
                                                    {t('edition.chooseGift')}
                                                </option>
                                                {obtainableGifts.map((g) => (
                                                    <option key={g.id} value={g.id}>
                                                        {g.name} - {g.value} {t('edition.points').toLowerCase()} ({g.remainingQuantity}{' '}
                                                        {g.remainingQuantity === 1 ? t('edition.remaining') : t('edition.remainings')})
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    ) : (
                                        <div className="bg-light rounded p-2 mt-2">{t('edition.notEnoughPoints')}</div>
                                    )
                                ) : (
                                    <div className="bg-light rounded p-2 mt-2">{t('edition.noAvailableGifts')}</div>
                                )}
                            </>
                        )}

                        {/* Cadeaux obtenus */}
                        <div className="modal-section-title mt-3 d-flex align-items-center justify-content-between">
                            {t('edition.obtainedGifts')}
                            <Badge className="reward-modal-count bg-danger">{player?.rewards.length ?? 0}</Badge>
                        </div>

                        {/* Cadeaux obtenus */}
                        {player?.rewards.length > 0 ? (
                            <div className="d-flex flex-column gap-2 mt-3">
                                {player.rewards.map((r) => (
                                    <div key={r.id} className="d-flex align-items-center gap-2">
                                        <div className="d-flex align-items-center flex-grow-1 bg-light rounded p-2">{r.name}</div>
                                        {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && (
                                            <Button
                                                onClick={modalOptions.isSubmitting ? null : () => handleDelete(r)}
                                                className="reward-modal-button"
                                            >
                                                <FaTrashCan />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-light rounded p-2 mt-3">{t('edition.noObtainedGifts')}</div>
                        )}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button type="button" variant="secondary" onClick={() => onClose()}>
                            {t('common.close')}
                        </Button>
                        {auth.isLoggedIn && auth.level >= UserRole.ADMIN && obtainableGifts.length > 0 && (
                            <Button type="submit" variant="primary">
                                {t('common.validate')}
                                {modalOptions.isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
                            </Button>
                        )}
                    </Modal.Footer>
                </Form>
            </fieldset>
        </Modal>
    );
};

export default RewardModal;
