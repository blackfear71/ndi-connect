import { useEffect } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import Message from '../Message/Message';

const ConfirmModal = ({ modalOptions, setModalOptions, onClose, onConfirmAction }) => {
    // Traductions
    const { t } = useTranslation();

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
     * Gère le comportement du formulaire à la soumission
     * @param {*} e Evènement
     */
    const handleSubmit = (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Soumets le formulaire
        onConfirmAction();
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <fieldset disabled={modalOptions.isSubmitting}>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('common.confirm')}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Texte */}
                        {modalOptions.content}
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
                                {t('common.cancel')}
                            </Button>

                            {onConfirmAction && (
                                <Button type="submit" variant="modal-action">
                                    {t('common.validate')}
                                    {modalOptions.isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
                                </Button>
                            )}
                        </div>
                    </Modal.Footer>
                </Form>
            </fieldset>
        </Modal>
    );
};

export default ConfirmModal;
