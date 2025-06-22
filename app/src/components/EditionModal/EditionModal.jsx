import { useEffect, useRef } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import Message from '../Message/Message';

const EditionModal = ({ formData, setFormData, modalOptions, message, setMessage, onClose, onSubmit, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const locationInputRef = useRef(null);

    /**
     * Met le focus sur le champ "lieu" à l'ouverture de la modale
     */
    useEffect(() => {
        if (modalOptions?.isOpen) {
            // Réinitialisation du message
            setMessage(null);

            // Focus
            locationInputRef.current?.focus();
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

        // Contrôles si pas de suppression
        if (modalOptions.action !== 'delete') {
            // Contrôle la date renseignée
            if (!formData.startDate) {
                setMessage({ code: 'errors.invalidStartDate', type: 'error' });
                return;
            }

            // Contrôle l'heure de début renseignée
            if (!formData.startTime) {
                setMessage({ code: 'errors.invalidStartTime', type: 'error' });
                return;
            }

            // Contrôle l'heure de fin renseignée
            if (!formData.endTime) {
                setMessage({ code: 'errors.invalidEndTime', type: 'error' });
                return;
            }

            // Contrôle le lieu renseigné
            if (!formData.location) {
                setMessage({ code: 'errors.invalidLocation', type: 'error' });
                return;
            }
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
                            <>
                                {/* Lieu */}
                                <Form.Group className="me-2 w-100" controlId="location">
                                    <Form.Label>{t('edition.location')}</Form.Label>
                                    <Form.Control
                                        ref={locationInputRef}
                                        type="text"
                                        name="location"
                                        placeholder={t('edition.location')}
                                        value={formData.location}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required
                                    />
                                </Form.Group>

                                {/* Date */}
                                <Form.Group className="mt-2" controlId="startDate">
                                    <Form.Label>{t('edition.startDate')}</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="startDate"
                                        placeholder="JJ/MM/AAAA"
                                        value={formData.startDate || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                {/* Heures */}
                                <div className="d-flex align-items-end mt-2">
                                    <Form.Group className="flex-fill me-2" controlId="startTime">
                                        <Form.Label>{t('edition.startTime')}</Form.Label>
                                        <Form.Control
                                            type="time"
                                            name="startTime"
                                            placeholder="HH:MM"
                                            value={formData.startTime || ''}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="flex-fill" controlId="endTime">
                                        <Form.Label>{t('edition.endTime')}</Form.Label>
                                        <Form.Control
                                            type="time"
                                            name="endTime"
                                            placeholder="HH:MM"
                                            value={formData.endTime || ''}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </div>

                                {/* Thème */}
                                <Form.Group className="mt-2" controlId="theme">
                                    <Form.Label>{t('edition.theme')}</Form.Label>
                                    <Form.Control as="textarea" name="theme" value={formData.theme} onChange={handleChange} />
                                </Form.Group>

                                {/* Challenge */}
                                <Form.Group className="mt-2" controlId="challenge">
                                    <Form.Label>{t('edition.challenge')}</Form.Label>
                                    <Form.Control as="textarea" name="challenge" value={formData.challenge} onChange={handleChange} />
                                </Form.Group>
                            </>
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
