import { useContext, useEffect } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { GiTwoCoins } from 'react-icons/gi';
import { PiUserListFill } from 'react-icons/pi';

import UserRole from '../../enums/UserRole';

import { AuthContext } from '../../utils/AuthContext';
import Message from '../Message/Message';

const PlayerModal = ({ formData, setFormData, modalOptions, message, setMessage, onClose, onSubmit, isSubmitting }) => {
    // Contexte
    const { auth } = useContext(AuthContext);

    // Traductions
    const { t } = useTranslation();

    /**
     * Réinitialise le message à l'ouverture de la modale
     */
    useEffect(() => {
        if (modalOptions?.isOpen) {
            // Réinitialisation du message
            setMessage(null);
        }
    }, [modalOptions?.isOpen]);

    /**
     * Met à jour le formulaire à la saisie
     * @param {*} e Evènement
     */
    const handleChange = (e) => {
        // Autorise uniquement les chiffres
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // TODO : à voir si toujours nécessaire avec les +/-
    /**
     * Met à jour le formulaire à la saisie d'un numérique
     * @param {*} e Evènement
     */
    const handleChangeNumeric = (e) => {
        // Autorise uniquement les chiffres (négatifs compris)
        const { name, value } = e.target;

        if (/^-?\d*$/.test(value)) {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    /**
     * Gère le comportement du formulaire à la soumission
     * @param {*} e Evènement
     * @param {*} action Action à réaliser
     */
    const handleSubmit = (e, action) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Contrôles si pas de suppression
        if (action !== 'delete') {
            // Contrôle que les points sont > 0
            const points = parseInt(formData.points, 10);

            if (!formData.points || isNaN(points) || (auth.level < UserRole.SUPERADMIN && points < 0)) {
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
        onSubmit(action);
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
                <Form onSubmit={(event) => handleSubmit(event, modalOptions.action)}>
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
                                {/* TODO : adapter avec des +/-, réafficher le nombre de points courant, initialiser la saisie à 0, le min doit être 0 sauf pour un super admin qui peut retirer des points */}
                                <Form.Group controlId="points" className="d-flex align-items-center">
                                    <GiTwoCoins size={30} className="me-3" />
                                    <Form.Control
                                        type="text"
                                        name="points"
                                        placeholder={t('edition.points')}
                                        value={formData.points}
                                        onChange={handleChangeNumeric}
                                        inputMode="numeric"
                                        pattern="-?[0-9]*"
                                        required
                                    />
                                </Form.Group>
                            </Modal.Body>

                            <Modal.Header>
                                <Modal.Title>{t('edition.editPlayer')}</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {/* Formulaire */}
                                <Form.Group controlId="name" className="d-flex align-items-center">
                                    <PiUserListFill size={30} className="me-3" />
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
