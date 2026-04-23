import { useEffect, useRef } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { HiKey, HiOutlineKey } from 'react-icons/hi2';

import { PasswordInput } from '../../inputs';
import { Message } from '../../shared';

/**
 * Modale mot de passe
 */
const PasswordModal = ({ formData, setFormData, modalOptions, setModalOptions, onClose, onSubmit, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const passwordInputRef = useRef(null);

    /**
     * Réinitialise le message à l'ouverture de la modale
     */
    useEffect(() => {
        if (modalOptions?.isOpen) {
            // Réinitialisation du message
            setMessage(null);

            // Focus
            passwordInputRef.current?.focus();
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
     * Gère le comportement du formulaire à la soumission
     * @param {*} e Evènement
     */
    const handleSubmit = (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Contrôle que les mots de passe sont renseignés
        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
            setMessage({ code: 'errors.invalidPassword', type: 'error' });
            return;
        }

        // Contrôle que le nouveau mot de passe est différent de l'ancien
        if (formData.oldPassword === formData.newPassword) {
            setMessage({ code: 'errors.passwordIdentical', type: 'error' });
            return;
        }

        // Contrôle que les nouveaux mots de passe correspondent
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ code: 'errors.passwordMatch', type: 'error' });
            return;
        }

        // Soumets le formulaire
        onSubmit();
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <fieldset disabled={isSubmitting}>
                <Form onSubmit={(event) => handleSubmit(event)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <HiKey />
                            {t('settings.password')}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div className="modal-group">
                            <div className="modal-group-content gap-2">
                                {/* Ancien mot de passe */}
                                <PasswordInput
                                    title={t('settings.oldPassword')}
                                    icon={<HiOutlineKey />}
                                    name={'oldPassword'}
                                    ref={passwordInputRef}
                                    placeholder={t('settings.oldPassword')}
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required={true}
                                />

                                {/* Nouveau mot de passe */}
                                <PasswordInput
                                    title={t('settings.newPassword')}
                                    icon={<HiKey />}
                                    name={'newPassword'}
                                    placeholder={t('settings.newPassword')}
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required={true}
                                />

                                {/* Confirmation nouveau mot de passe */}
                                <PasswordInput
                                    title={t('settings.confirmPassword')}
                                    icon={<HiKey />}
                                    name={'confirmPassword'}
                                    placeholder={t('settings.confirmPassword')}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    maxLength={100}
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
                            <Button type="button" variant="modal-outline-action" onClick={() => onClose()} disabled={isSubmitting}>
                                {t('common.close')}
                            </Button>

                            <Button type="submit" variant="modal-action" disabled={isSubmitting}>
                                {t('common.validate')}
                                {isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </fieldset>
        </Modal>
    );
};

export default PasswordModal;
