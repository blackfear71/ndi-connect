import { useEffect, useRef } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaFlagCheckered, FaRegClock, FaScroll, FaWandMagicSparkles } from 'react-icons/fa6';
import { IoCalendarNumberOutline, IoImageOutline, IoLocationOutline } from 'react-icons/io5';

import Message from '../Message/Message';
import PictureInput from '../PictureInput/PictureInput';
import TextareaInput from '../TextareaInput/TextareaInput';
import TextInput from '../TextInput/TextInput';

const EditionModal = ({ formData, setFormData, modalOptions, setModalOptions, onClose, onSubmit }) => {
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
     * Met à jour le formulaire à la saisie d'un fichier
     * @param {*} file Fichier
     * @param {*} action Action à réaliser
     */
    const handleChangeFile = (file, action) => {
        switch (action) {
            case 'delete':
                setFormData((prev) => ({ ...prev, picture: null, pictureAction: action }));
                break;
            case 'insert':
                setFormData((prev) => ({ ...prev, picture: file, pictureAction: action }));
                break;
            default:
                setFormData((prev) => ({ ...prev, picture: null, pictureAction: null }));
                break;
        }
    };

    /**
     * Gère le comportement du formulaire à la soumission
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
            <fieldset disabled={modalOptions.isSubmitting}>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaWandMagicSparkles />
                            {t(getTitleFromAction(modalOptions.action))}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="p-0">
                        {/* Lieu */}
                        <div className="modal-zone">
                            <div className="modal-zone-content">
                                <TextInput
                                    icon={<IoLocationOutline />}
                                    ref={locationInputRef}
                                    name="location"
                                    title={t('edition.location')}
                                    value={formData.location}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required={true}
                                />
                            </div>
                        </div>

                        {/* Date et heures */}
                        <div className="modal-zone">
                            {/* Date */}
                            <div className="modal-zone-content pb-1">
                                <div className="d-flex align-items-center gap-2">
                                    {/* Icône */}
                                    <div className="d-flex align-items-center justify-content-center modal-input-icon">
                                        <IoCalendarNumberOutline />
                                    </div>

                                    {/* Titre & saisie */}
                                    <Form.Group className="d-flex flex-column w-100" controlId="startDate">
                                        <Form.Label className="mb-1 modal-zone-content-label">{t('edition.startDate')}</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate || ''}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            {/* Heures */}
                            <div className="modal-zone-content">
                                <div className="d-flex align-items-center gap-2">
                                    {/* Icône */}
                                    <div className="d-flex align-items-center justify-content-center modal-input-icon">
                                        <FaRegClock />
                                    </div>

                                    {/* Titre & saisies */}
                                    <div className="d-flex flex-column w-100">
                                        <div className="modal-zone-content-label">{t('edition.hours')}</div>

                                        <div className="d-flex flex-row gap-2 modal-input-sublabel-zone">
                                            <Form.Group className="flex-fill" controlId="startTime">
                                                <Form.Label className="mb-1 modal-input-sublabel">{t('edition.start')}</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    name="startTime"
                                                    value={formData.startTime || ''}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Form.Group>

                                            <Form.Group className="flex-fill" controlId="endTime">
                                                <Form.Label className="mb-1 modal-input-sublabel">{t('edition.end')}</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    name="endTime"
                                                    value={formData.endTime || ''}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Form.Group>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="modal-zone">
                            <div className="modal-zone-content">
                                <PictureInput
                                    icon={<IoImageOutline />}
                                    name={'picture'}
                                    value={formData.picture}
                                    setMessage={setMessage}
                                    onChange={handleChangeFile}
                                    isSubmitting={modalOptions.isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Thème & défi*/}
                        <div className="modal-zone">
                            <div className="modal-zone-content">
                                {/* Thème */}
                                <TextareaInput
                                    icon={<FaScroll />}
                                    name={'theme'}
                                    title={t('edition.theme')}
                                    placeholder={t('edition.theme')}
                                    value={formData.theme}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="modal-zone-content">
                                {/* Défi */}
                                <TextareaInput
                                    icon={<FaFlagCheckered />}
                                    name={'challenge'}
                                    title={t('edition.challenge')}
                                    placeholder={t('edition.challenge')}
                                    value={formData.challenge}
                                    onChange={handleChange}
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
                                {t(getButtonFromAction(modalOptions.action))}
                                {modalOptions.isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </fieldset>
        </Modal>
    );
};

export default EditionModal;
