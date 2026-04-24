import { useEffect, useRef } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaFlagCheckered, FaRegClock, FaScroll, FaWandMagicSparkles } from 'react-icons/fa6';
import { IoCalendarNumberOutline, IoImageOutline, IoLocationOutline } from 'react-icons/io5';

import { DateInput, PictureInput, TextareaInput, TextInput, TimeInput } from '../../../components/inputs';
import { Message } from '../../../components/shared';

import { EnumAction } from '../../../enums';

/**
 * Modale édition
 */
const EditionModal = ({ formData, setFormData, modalOptions, setModalOptions, onClose, onSubmit, isSubmitting }) => {
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
            setModalMessage(null);

            // Focus à la création
            modalOptions.action === EnumAction.CREATE && locationInputRef.current?.focus();
        }
    }, [modalOptions?.isOpen]);

    /**
     * Définit le message affiché
     * @param {*} message Message à afficher
     */
    const setModalMessage = (message) => {
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
            case EnumAction.CREATE:
                setFormData((prev) => ({ ...prev, picture: file, pictureAction: action }));
                break;
            case EnumAction.DELETE:
                setFormData((prev) => ({ ...prev, picture: null, pictureAction: action }));
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
        if (modalOptions.action !== EnumAction.DELETE) {
            // Contrôle la date renseignée
            if (!formData.startDate) {
                setModalMessage({ code: 'errors.invalidStartDate', type: 'error' });
                return;
            }

            // Contrôle l'heure de début renseignée
            if (!formData.startTime) {
                setModalMessage({ code: 'errors.invalidStartTime', type: 'error' });
                return;
            }

            // Contrôle l'heure de fin renseignée
            if (!formData.endTime) {
                setModalMessage({ code: 'errors.invalidEndTime', type: 'error' });
                return;
            }

            // Contrôle le lieu renseigné
            if (!formData.location) {
                setModalMessage({ code: 'errors.invalidLocation', type: 'error' });
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
                        <Modal.Title>
                            <FaWandMagicSparkles />
                            {t(getTitleFromAction(modalOptions.action))}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Lieu */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <TextInput
                                    title={t('edition.location')}
                                    icon={<IoLocationOutline />}
                                    name="location"
                                    ref={locationInputRef}
                                    placeholder={t('edition.location')}
                                    value={formData.location}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required={true}
                                />
                            </div>
                        </div>

                        {/* Date et heures */}
                        <div className="modal-group">
                            <div className="modal-group-content gap-2">
                                {/* Date */}
                                <DateInput
                                    title={t('edition.startDate')}
                                    icon={<IoCalendarNumberOutline />}
                                    name={'startDate'}
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required={true}
                                />

                                {/* Heures */}
                                <TimeInput
                                    title={t('edition.hours')}
                                    icon={<FaRegClock />}
                                    nameStart={'startTime'}
                                    nameEnd={'endTime'}
                                    titleStart={t('edition.start')}
                                    titleEnd={t('edition.end')}
                                    valueStart={formData.startTime}
                                    valueEnd={formData.endTime}
                                    onChange={handleChange}
                                    required={true}
                                />
                            </div>
                        </div>

                        {/* Image */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <PictureInput
                                    title={t('edition.picture')}
                                    icon={<IoImageOutline />}
                                    name={'picture'}
                                    value={formData.picture}
                                    setMessage={setModalMessage}
                                    onChange={handleChangeFile}
                                    isSubmitting={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Thème & défi*/}
                        <div className="modal-group">
                            <div className="modal-group-content gap-2">
                                {/* Thème */}
                                <TextareaInput
                                    title={t('edition.theme')}
                                    icon={<FaScroll />}
                                    name={'theme'}
                                    placeholder={t('edition.theme')}
                                    value={formData.theme}
                                    onChange={handleChange}
                                />

                                {/* Défi */}
                                <TextareaInput
                                    title={t('edition.challenge')}
                                    icon={<FaFlagCheckered />}
                                    name={'challenge'}
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
                                    setMessage={setModalMessage}
                                />
                            </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="modal-footer-actions">
                            <Button type="button" variant="modal-outline-action" onClick={() => onClose()} disabled={isSubmitting}>
                                {t('common.close')}
                            </Button>

                            <Button type="submit" variant="modal-action" disabled={isSubmitting}>
                                {t(getButtonFromAction(modalOptions.action))}
                                {isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </fieldset>
        </Modal>
    );
};

export default EditionModal;
