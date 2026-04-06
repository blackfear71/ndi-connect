import { useEffect, useState } from 'react';

import { Badge, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { HiIdentification } from 'react-icons/hi';

import { Message } from '../../../components/shared';

import './SettingsModal.css';

const SettingsModal = ({ user, getUserRole, formData, setFormData, modalOptions, setModalOptions, onReset, onClose, onSubmit }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [confirmReset, setConfirmReset] = useState(false);

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
            level: parseInt(e.target.value)
        }));
    };

    /**
     * Gère le comportement du formulaire à la soumission (réinitialisation mot de passe)
     * @param {*} e Evènement
     */
    const handleReset = (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Remise en place des boutons de confirmation de réinitialisation de mot de passe
        setConfirmReset(false);

        // Soumets le formulaire
        onReset(user.id);
    };

    /**
     * Gère le comportement du formulaire à la soumission (modification utilisateur)
     * @param {*} e Evènement
     */
    const handleSubmit = (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Contrôle que le niveau est correct
        if (formData.level < 0 || formData.level > 2) {
            setMessage({ code: 'errors.invalidLevel', type: 'error' });
            return;
        }

        // Soumets le formulaire
        onSubmit();
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <fieldset disabled={modalOptions.isSubmitting}>
                <Form onSubmit={(event) => handleSubmit(event)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('settings.manageUser')}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div className="modal-group">
                            <div className="modal-group-content">
                                {/* Utilisateur */}
                                <div className="settings-modal-badges">
                                    <Badge bg="success" className="fs-6 p-2 settings-modal-ellipsis d-inline-flex align-items-center">
                                        <HiIdentification size={18} className="me-2" />
                                        <span className="settings-modal-ellipsis-text">{user.login}</span>
                                    </Badge>

                                    <Badge bg="warning" text="dark" className="fs-6 p-2 mt-2 d-inline-flex align-items-center">
                                        {getUserRole(user.level)}
                                    </Badge>
                                </div>

                                {/* Modifier le rôle */}
                                <div className="modal-section-title mt-3">{t('settings.updateLevel')}</div>

                                {/* Formulaire */}
                                <Form.Select value={formData.level} onChange={handleChangeSelect} className="mt-2" required>
                                    <option key="" value="" hidden>
                                        {t('settings.chooseLevel')}
                                    </option>
                                    {[0, 1, 2].map((level) => (
                                        <option key={level} value={level}>
                                            {t(`settings.level${level}`)}
                                        </option>
                                    ))}
                                </Form.Select>

                                {/* Description du niveau sélectionné */}
                                {formData.level !== '' && (
                                    <p className="text-muted mt-2 settings-modal-border">
                                        {t(`settings.levelDescription${formData.level}`)}
                                    </p>
                                )}

                                {/* Réinitialiser le mot de passe */}
                                <div className="modal-section-title mt-3">{t('settings.resetPassword')}</div>

                                {/* Confirmation de réinitialisation */}
                                {!confirmReset ? (
                                    <Button type="button" className="settings-button mt-2" onClick={() => setConfirmReset(true)}>
                                        {t('common.reset')}
                                    </Button>
                                ) : (
                                    <div className="d-flex gap-2 mt-2">
                                        <Button type="button" variant="secondary" onClick={() => setConfirmReset(false)}>
                                            {t('common.cancel')}
                                        </Button>

                                        <Button type="button" variant="danger" onClick={(event) => handleReset(event)}>
                                            {t('common.confirm')}
                                        </Button>
                                    </div>
                                )}
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

export default SettingsModal;
