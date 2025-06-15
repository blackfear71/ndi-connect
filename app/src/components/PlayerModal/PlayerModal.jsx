import { useEffect, useRef } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import Message from '../Message/Message';

const PlayerModal = ({ formData, setFormData, modalOptions, message, setMessage, onClose, onSubmit, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    /**
     * Met à jour le formulaire à la saisie (création)
     * @param {*} e Evènement
     */
    const handleChange = (e) => {
        // Autorise uniquement les chiffres
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // TODO : à voir si toujours nécessaire avec les +/-
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

        // Contrôles si pas de suppression
        if (modalOptions.action !== 'delete') {
            // TODO : adapter pour le superadmin
            // Contrôle que les points sont > 0
            const points = parseInt(formData.points, 10);

            if (!formData.points || isNaN(points) || points < 0) {
                setMessage({ code: 'errors.invalidPoints', type: 'error' });
                return;
            }

            // Contrôle le nom renseigné
            if (!formData.name) {
                setMessage({ code: 'errors.invalidName', type: 'error' });
                return;
            }
        }

        // Soumets le formulaire
        onSubmit();
    };

    /**
     * Détermination du bouton selon l'action à réaliser
     */
    const getButtonFromAction = (action) =>
        ({
            delete: 'common.delete',
            update: 'common.validate'
        })[action] || 'common.unknownLabel';

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <fieldset disabled={isSubmitting}>
                <Form onSubmit={handleSubmit}>
                    {modalOptions.action === 'delete' ? (
                        <>
                            <Modal.Header closeButton>
                                <Modal.Title>{t('edition.deletePlayer')}</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>{t('edition.deletePlayerMessage', { name: formData.name })}</Modal.Body>
                        </>
                    ) : (
                        <>
                            <Modal.Header closeButton>
                                <Modal.Title>{t('edition.givePoints')}</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {/* Message */}
                                {message && <Message code={message.code} type={message.type} setMessage={setMessage} />}

                                {/* Formulaire */}
                                {/* TODO : adapter avec des +/-, le min doit être 0 sauf pour un super admin qui peut retirer des points */}
                                <Form.Group controlId="points">
                                    <Form.Label>{t('edition.points')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="points"
                                        placeholder={t('edition.points')}
                                        value={formData.points}
                                        onChange={handleChangeNumeric}
                                        maxLength={4}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        required
                                    />
                                </Form.Group>
                            </Modal.Body>

                            <Modal.Header>
                                <Modal.Title>{t('edition.editPlayer')}</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {/* Formulaire */}
                                <Form.Group controlId="name">
                                    <Form.Label>{t('edition.name')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        placeholder={t('edition.name')}
                                        value={formData.name}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required
                                    />
                                </Form.Group>
                            </Modal.Body>
                        </>
                    )}

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

export default PlayerModal;
