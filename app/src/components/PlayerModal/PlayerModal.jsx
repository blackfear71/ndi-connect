import { useContext, useEffect } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { GiTwoCoins } from 'react-icons/gi';
import { PiUserListFill } from 'react-icons/pi';

import UserRole from '../../enums/UserRole';

import { AuthContext } from '../../utils/AuthContext';
import Message from '../Message/Message';

const PlayerModal = ({ player, formData, setFormData, modalOptions, message, setMessage, onClose, onSubmit, isSubmitting }) => {
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
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Met à jour le formulaire à la saisie d'un numérique
     * @param {*} e Evènement
     */
    const handleChangeIncrement = (action) => {
        // Ajoute ou retire des points selon les droits
        switch (action) {
            case 'add':
                setFormData((prev) => {
                    const currentDelta = parseInt(prev.delta) || 0;
                    const nextDelta = currentDelta < 0 ? (auth.level >= UserRole.SUPERADMIN ? currentDelta + 1 : 0) : currentDelta + 1;

                    return {
                        ...prev,
                        delta: nextDelta
                    };
                });
                break;
            case 'remove':
                setFormData((prev) => {
                    const currentDelta = parseInt(prev.delta) || 0;
                    const nextDelta =
                        auth.level >= UserRole.SUPERADMIN && currentDelta <= 0 ? currentDelta - 1 : Math.max(0, currentDelta - 1);

                    return {
                        ...prev,
                        delta: Math.max(-player.points, nextDelta)
                    };
                });
                break;
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
            const delta = parseInt(formData.delta, 10);

            if (
                formData.delta === null ||
                formData.delta === undefined ||
                isNaN(delta) ||
                (auth.level < UserRole.SUPERADMIN && delta < 0)
            ) {
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

                                {/* Nombre de points */}
                                <div>
                                    {t('edition.currentPoints')} {player.points}
                                </div>

                                {/* Formulaire */}
                                <Form.Group controlId="points" className="d-flex align-items-center mt-3 gap-3">
                                    <GiTwoCoins size={30} />

                                    <div className="d-flex align-items-center w-100">
                                        <Button
                                            className="flex-fill"
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => handleChangeIncrement('remove')}
                                        >
                                            –
                                        </Button>

                                        <div className="flex-fill px-3 text-center">{formData.delta || 0}</div>

                                        <Button
                                            className="flex-fill"
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => handleChangeIncrement('add')}
                                        >
                                            +
                                        </Button>
                                    </div>
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
