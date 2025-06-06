import { useEffect, useRef } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import Message from '../Message/Message';

const EditionModal = ({ formData, setFormData, modalOptions, message, setMessage, onClose, onSubmit, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const yearInputRef = useRef(null);

    /**
     * Met le focus sur le champ "année" à l'ouverture de la modale quand on est pas connecté
     */
    useEffect(() => {
        if (modalOptions.isOpen && yearInputRef.current) {
            yearInputRef.current.focus();
        }
    }, [modalOptions.isOpen]);

    /**
     * Met à jour le formulaire à la saisie (création)
     * @param {*} e Evènement
     */
    const handleChange = (e) => {
        // Autorise uniquement les chiffres
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Met à jour le formulaire à la saisie d'un numérique (création)
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
     * Gère le comportement du formulaire
     * @param {*} e Evènement
     */
    const handleSubmit = (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Contrôle que la valeur de l'année est comprise entre 1901 et 2155
        const year = parseInt(formData.year, 10);

        if (!formData.year || isNaN(year) || year < 1901 || year > 2155) {
            setMessage({ code: 'errors.invalidYear', type: 'error' });
            return;
        }

        // Contrôle le lieu renseigné
        if (!formData.place) {
            setMessage({ code: 'errors.invalidPlace', type: 'error' });
            return;
        }

        // Soumets le formulaire
        onSubmit();
    };

    /**
     * Détermination du titre selon l'action à réaliser
     */
    const getTitleFromAction = (action) =>
        ({
            create: 'home.addEdition',
            delete: 'edition.deleteEdition',
            update: 'edition.updateEdition'
        })[action] || 'common.unknownLabel';

    /**
     * Détermination du bouton selon l'action à réaliser
     */
    const getButtonFromAction = (action) =>
        ({
            create: 'common.add',
            delete: 'common.delete',
            update: 'common.update'
        })[action] || 'common.unknownLabel';

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <fieldset disabled={isSubmitting}>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{t(getTitleFromAction(modalOptions.action))}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Message */}
                        {message && <Message code={message.code} type={message.type} setMessage={setMessage} />}

                        {/* Formulaire */}
                        {modalOptions.action === 'delete' ? (
                            <>{t('edition.deleteEditionMessage')}</>
                        ) : (
                            <div className="d-flex align-items-end">
                                <Form.Group className="me-2" controlId="year">
                                    <Form.Label>{t('edition.year')}</Form.Label>
                                    <Form.Control
                                        ref={yearInputRef}
                                        type="text"
                                        name="year"
                                        placeholder={t('edition.year')}
                                        value={formData.year}
                                        onChange={handleChangeNumeric}
                                        maxLength={4}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="me-2" controlId="place">
                                    <Form.Label>{t('edition.place')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="place"
                                        placeholder={t('edition.place')}
                                        value={formData.place}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </div>
                        )}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button type="button" variant="secondary" onClick={() => onClose()}>
                            {t('common.close')}
                        </Button>
                        <Button type="submit" variant="primary">
                            {t(getButtonFromAction(modalOptions.action))}
                            {isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
                        </Button>
                    </Modal.Footer>
                </Form>
            </fieldset>
        </Modal>
    );
};

export default EditionModal;
