import { useEffect, useRef } from 'react';

import { Button, Form, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import Error from '../Error/Error';

const ConnectionModal = ({ formData, setFormData, isOpen, isLoggedIn, error, onClose, onSubmit }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const loginInputRef = useRef(null);

    /**
     * Met le focus sur le champ "login" à l'ouverture de la modale quand on est pas connecté
     */
    useEffect(() => {
        if (isOpen && !isLoggedIn && loginInputRef.current) {
            loginInputRef.current.focus();
        }
    }, [isOpen, isLoggedIn]);

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

        // Soumets le formulaire
        onSubmit();
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{isLoggedIn ? <>{t('navbar.disconnect')}</> : <>{t('navbar.connect')}</>}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {error && <Error code={error} />}
                    {isLoggedIn ? (
                        <>{t('navbar.disconnectMessage')}</>
                    ) : (
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
                                    required
                                />
                            </Form.Group>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t('common.close')}
                    </Button>
                    <Button type="submit" variant="primary">
                        {isLoggedIn ? <>{t('navbar.disconnect')}</> : <>{t('navbar.connect')}</>}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ConnectionModal;
