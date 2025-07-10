import { useEffect } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { PiListStarBold } from 'react-icons/pi';

import Message from '../Message/Message';

const RewardModal = ({ player, gifts, formData, setFormData, modalOptions, message, setMessage, onClose, onSubmit, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Constants
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
     * @param {*} action Action à réaliser
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

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <fieldset disabled={isSubmitting}>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('edition.giveGift')}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Message */}
                        {message && <Message code={message.code} type={message.type} setMessage={setMessage} />}

                        {/* Participant */}
                        <div>
                            {t('edition.currentPlayer')} {player.name}
                        </div>

                        {/* Nombre de points */}
                        <div>
                            {t('edition.currentPoints')} {player.points}
                        </div>

                        {/* Formulaire */}
                        {obtainableGifts.length > 0 ? (
                            <Form.Group controlId="name" className="d-flex align-items-center">
                                <PiListStarBold size={30} className="me-3" />
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
                            <div>{t('edition.noAvailableGifts')}</div>
                        )}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button type="button" variant="secondary" onClick={() => onClose()}>
                            {t('common.close')}
                        </Button>
                        {obtainableGifts.length > 0 && (
                            <Button type="submit" variant="primary">
                                {t('common.validate')}
                                {isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
                            </Button>
                        )}
                    </Modal.Footer>
                </Form>
            </fieldset>
        </Modal>
    );
};

export default RewardModal;
