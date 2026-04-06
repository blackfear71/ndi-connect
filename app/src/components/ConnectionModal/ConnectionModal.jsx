import { useContext, useEffect, useRef } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaLock, FaUserCircle } from 'react-icons/fa';

import { AuthContext } from '../../utils/AuthContext';

import Message from '../Message/Message';
import TextInput from '../TextInput/TextInput';

import './ConnectionModal.css';

const ConnectionModal = ({ formData, setFormData, modalOptions, message, setMessage, onClose, onSubmit, isSubmitting }) => {
    // Contexte
    const { setAuthMessage } = useContext(AuthContext);

    // Traductions
    const { t } = useTranslation();

    // Local states
    const loginInputRef = useRef(null);

    /**
     * Met le focus sur le champ "login" à l'ouverture de la modale quand on est pas connecté
     */
    useEffect(() => {
        if (modalOptions?.isOpen) {
            // Réinitialisation du message
            setMessage(null);
            setAuthMessage(null);

            // Focus
            loginInputRef.current?.focus();
        }
    }, [modalOptions?.isOpen]);

    /**
     * Met à jour le formulaire à la saisie (création)
     * @param {*} e Evènement
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Gère le comportement du formulaire
     * @param {*} e Evènement
     */
    const handleSubmit = (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Contrôle que l'identifiant et le mot de passe sont renseignés
        if (!formData.login) {
            setMessage({ code: 'errors.invalidLogin', type: 'error' });
            return;
        }

        if (!formData.password) {
            setMessage({ code: 'errors.invalidPassword', type: 'error' });
            return;
        }

        // Soumets le formulaire
        onSubmit();
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <fieldset disabled={isSubmitting}>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaUserCircle />
                            {t('navbar.connect')}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div className="modal-group">
                            <div className="modal-group-content">
                                {/* Verrou */}
                                <div className="mb-2 text-center">
                                    <div className="connection-modal-lock mb-1">
                                        <FaLock />
                                    </div>
                                    <div className="connection-modal-lock-text">{t('navbar.adminOnly')}</div>
                                </div>

                                {/* Formulaire */}
                                <div className="d-flex align-items-center gap-2">
                                    <TextInput
                                        title={t('navbar.login')}
                                        name={'login'}
                                        ref={loginInputRef}
                                        value={formData.login}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required={true}
                                    />

                                    <TextInput
                                        title={t('navbar.password')}
                                        name={'password'}
                                        type={'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        {/* Message */}
                        {message && (
                            <div className="modal-message">
                                <Message code={message.code} params={message.params} type={message.type} setMessage={setMessage} />
                            </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="modal-footer-actions">
                            <Button type="button" variant="modal-outline-action" onClick={() => onClose()}>
                                {t('common.close')}
                            </Button>

                            <Button type="submit" variant="modal-action">
                                {t('navbar.connect')}
                                {isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </fieldset>
        </Modal>
    );
};

export default ConnectionModal;
