import { useContext, useEffect, useRef } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { AuthContext } from '../../utils/AuthContext';
import Message from '../Message/Message';

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
                        <Modal.Title>{t('navbar.connect')}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Message */}
                        {message && <Message code={message.code} params={message.params} type={message.type} setMessage={setMessage} />}

                        {/* Formulaire */}
                        <div className="d-flex align-items-end">
                            <Form.Group className="me-2" controlId="login">
                                <Form.Label>{t('navbar.login')}</Form.Label>
                                <Form.Control
                                    ref={loginInputRef}
                                    type="text"
                                    name="login"
                                    placeholder={t('navbar.login')}
                                    value={formData.login}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="me-2" controlId="password">
                                <Form.Label>{t('navbar.password')}</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    placeholder={t('navbar.password')}
                                    value={formData.password}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required
                                />
                            </Form.Group>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button type="button" variant="secondary" onClick={() => onClose()}>
                            {t('common.close')}
                        </Button>
                        <Button type="submit" variant="primary">
                            {t('navbar.connect')}
                            {isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
                        </Button>
                    </Modal.Footer>
                </Form>
            </fieldset>
        </Modal>
    );
};

export default ConnectionModal;
