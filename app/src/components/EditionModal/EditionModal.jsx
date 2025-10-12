import { useEffect, useRef } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaMapLocationDot } from 'react-icons/fa6';
import { GoGoal } from 'react-icons/go';
import { IoCalendarNumberOutline } from 'react-icons/io5';
import { MdOutlineLightbulb } from 'react-icons/md';
import { WiTime4, WiTime8 } from 'react-icons/wi';

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
            update: 'edition.updateEdition'
        })[action] || 'common.unknownLabel';

    /**
     * Détermination du bouton selon l'action à réaliser
     */
    const getButtonFromAction = (action) =>
        ({
            create: 'common.add',
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
                        {message && <Message code={message.code} params={message.params} type={message.type} setMessage={setMessage} />}

                        {/* Lieu */}
                        <Form.Group className="d-flex align-items-center" controlId="location">
                            <FaMapLocationDot size={30} className="me-3" />
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
                        <Form.Group className="d-flex align-items-center mt-2" controlId="startDate">
                            <IoCalendarNumberOutline size={30} className="me-3" />
                            <Form.Control type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} required />
                        </Form.Group>

                        {/* Heures */}
                        <Form.Group className="d-flex align-items-center flex-fill mt-2" controlId="startTime">
                            <WiTime4 size={30} className="me-3" />
                            <Form.Control type="time" name="startTime" value={formData.startTime || ''} onChange={handleChange} required />
                        </Form.Group>

                        <Form.Group className="d-flex align-items-center flex-fill mt-2" controlId="endTime">
                            <WiTime8 size={30} className="me-3" />
                            <Form.Control type="time" name="endTime" value={formData.endTime || ''} onChange={handleChange} required />
                        </Form.Group>

                        {/* Thème */}
                        <Form.Group className="d-flex align-items-center mt-2" controlId="theme">
                            <MdOutlineLightbulb size={30} className="me-3" />
                            <Form.Control
                                as="textarea"
                                name="theme"
                                placeholder={t('edition.theme')}
                                value={formData.theme}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        {/* Challenge */}
                        <Form.Group className="d-flex align-items-center mt-2" controlId="challenge">
                            <GoGoal size={30} className="me-3" />
                            <Form.Control
                                as="textarea"
                                name="challenge"
                                placeholder={t('edition.challenge')}
                                value={formData.challenge}
                                onChange={handleChange}
                            />
                        </Form.Group>
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
