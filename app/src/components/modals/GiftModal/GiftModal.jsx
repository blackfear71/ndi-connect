import { useEffect, useRef } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaGift } from 'react-icons/fa6';
import { GiCardboardBox } from 'react-icons/gi';
import { GrMoney } from 'react-icons/gr';
import { IoGiftSharp } from 'react-icons/io5';

import { TextInput } from '../../../components/inputs';
import { Message } from '../../../components/shared';

const GiftModal = ({ gift, formData, setFormData, modalOptions, setModalOptions, onClose, onSubmit }) => {
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
            <fieldset disabled={modalOptions.isSubmitting}>
                <Form onSubmit={(event) => handleSubmit(event, modalOptions.action)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaGift />
                            {t('edition.setGift')}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Cadeaux restants */}
                        {gift && (
                            <div className="modal-group">
                                <div className="modal-group-content">
                                    {/* Titre */}
                                    <div className="modal-group-content-title">{t('edition.remainingGifts')}</div>

                                    {/* Valeur */}
                                    <div className={`modal-group-content-value ${gift?.remainingQuantity > 0 ? 'gold' : 'gray'}`}>
                                        {gift?.remainingQuantity ?? 0}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Formulaire */}
                        <div className="modal-group">
                            {/* Nom */}
                            <div className="modal-group-content gap-2">
                                <TextInput
                                    title={t('edition.name')}
                                    icon={<IoGiftSharp />}
                                    name="name"
                                    ref={nameInputRef}
                                    placeholder={t('edition.name')}
                                    value={formData.name}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required={true}
                                />

                                {/* Valeur */}
                                <TextInput
                                    title={t('edition.value')}
                                    icon={<GrMoney />}
                                    name="value"
                                    placeholder={t('edition.value')}
                                    value={formData.value}
                                    onChange={handleChangeNumeric}
                                    maxLength={10}
                                    inputMode={'numeric'}
                                    pattern={'[0-9]*'}
                                    required={true}
                                />

                                {/* Quantité */}
                                <TextInput
                                    title={t('edition.quantity')}
                                    icon={<GiCardboardBox />}
                                    name="quantity"
                                    placeholder={t('edition.quantity')}
                                    value={formData.quantity}
                                    onChange={handleChangeNumeric}
                                    maxLength={10}
                                    inputMode={'numeric'}
                                    pattern={'[0-9]*'}
                                    required={true}
                                />
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        {/* Message */}
                        {modalOptions.message && (
                            <div className="modal-message">
                                <Message
                                    code={modalOptions.message.code}
                                    params={modalOptions.message.params}
                                    type={modalOptions.message.type}
                                    setMessage={setMessage}
                                />
                            </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="modal-footer-actions">
                            <Button type="button" variant="modal-outline-action" onClick={() => onClose()}>
                                {t('common.close')}
                            </Button>

                            <Button type="submit" variant="modal-action">
                                {t('common.validate')}
                                {modalOptions.isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </fieldset>
        </Modal>
    );
};

export default GiftModal;
