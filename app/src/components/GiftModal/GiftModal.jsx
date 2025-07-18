import { useEffect, useRef } from 'react';

import { Badge, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { GiCardboardBox } from 'react-icons/gi';
import { GrMoney } from 'react-icons/gr';
import { IoGiftSharp } from 'react-icons/io5';

import Message from '../Message/Message';

import './GiftModal.css';

const GiftModal = ({ gift, formData, setFormData, modalOptions, message, setMessage, onClose, onSubmit, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const nameInputRef = useRef(null);

    /**
     * Réinitialise le message à l'ouverture de la modale
     */
    useEffect(() => {
        if (modalOptions?.isOpen) {
            // Réinitialisation du message
            setMessage(null);

            // Focus à la création
            modalOptions.action === 'create' && nameInputRef.current?.focus();
        }
    }, [modalOptions?.isOpen]);

    /**
     * Met à jour le formulaire à la saisie
     * @param {*} e Evènement
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Met à jour le formulaire à la saisie d'un numérique
     * @param {*} e Evènement
     */
    const handleChangeNumeric = (e) => {
        // Autorise uniquement les chiffres
        const { name, value } = e.target;

        if (/^\d*$/.test(value)) {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    /**
     * Gère le comportement du formulaire à la soumission
     * @param {*} e Evènement
     * @param {*} action Action à réaliser
     */
    const handleSubmit = (e, action) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Contrôle le nom renseigné
        if (!formData.name) {
            setMessage({ code: 'errors.invalidName', type: 'error' });
            return;
        }

        // Contrôle que la valeur est > 0
        const value = parseInt(formData.value, 10);

        if (!formData.value || isNaN(value) || value <= 0) {
            setMessage({ code: 'errors.invalidValue', type: 'error' });
            return;
        }

        // Contrôle que la quantité est > 0
        const quantity = parseInt(formData.quantity, 10);

        if (!formData.quantity || isNaN(quantity) || quantity < 0) {
            setMessage({ code: 'errors.invalidQuantity', type: 'error' });
            return;
        }

        // Contrôle que la quantité est > quantité déjà attribuée (en cas de modification)
        if (gift && quantity < gift.rewardCount) {
            setMessage({ code: 'errors.invalidQuantityAttribution', type: 'error' });
            return;
        }

        // Soumets le formulaire
        onSubmit(action);
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <fieldset disabled={isSubmitting}>
                <Form onSubmit={(event) => handleSubmit(event, modalOptions.action)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('edition.setGift')}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Message */}
                        {message && <Message code={message.code} type={message.type} setMessage={setMessage} />}

                        {/* Formulaire */}
                        <Form.Group controlId="name" className="d-flex align-items-center mb-2">
                            <IoGiftSharp size={30} className="me-3" />
                            <Form.Control
                                ref={nameInputRef}
                                type="text"
                                name="name"
                                placeholder={t('edition.name')}
                                value={formData.name}
                                onChange={handleChange}
                                maxLength={100}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="value" className="d-flex align-items-center mb-2">
                            <GrMoney size={30} className="me-3" />
                            <Form.Control
                                type="text"
                                name="value"
                                placeholder={t('edition.value')}
                                value={formData.value}
                                onChange={handleChangeNumeric}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="quantity" className="d-flex align-items-center">
                            <GiCardboardBox size={30} className="me-3" />
                            <Form.Control
                                type="text"
                                name="quantity"
                                placeholder={t('edition.quantity')}
                                value={formData.quantity}
                                onChange={handleChangeNumeric}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                required
                            />
                        </Form.Group>

                        {/* Cadeaux restants */}
                        {gift && (
                            <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mt-2">
                                <Badge className="bg-warning fs-6 me-2">{t('edition.remainingGifts')}</Badge>
                                <Badge className="gift-modal-count bg-danger">{gift?.remainingQuantity ?? 0}</Badge>
                            </div>
                        )}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button type="button" variant="secondary" onClick={() => onClose()}>
                            {t('common.close')}
                        </Button>
                        <Button type="submit" variant="primary">
                            {t('common.validate')}
                            {isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
                        </Button>
                    </Modal.Footer>
                </Form>
            </fieldset>
        </Modal>
    );
};

export default GiftModal;
