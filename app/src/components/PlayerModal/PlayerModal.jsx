import { useContext, useEffect } from 'react';

import { Badge, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { GiTwoCoins } from 'react-icons/gi';
import { PiUserListFill } from 'react-icons/pi';

import UserRole from '../../enums/UserRole';

import { AuthContext } from '../../utils/AuthContext';
import Message from '../Message/Message';

const PlayerModal = ({ players, player, formData, setFormData, modalOptions, message, setMessage, onClose, onSubmit, isSubmitting }) => {
    // Contexte
    const { auth } = useContext(AuthContext);

    // Traductions
    const { t } = useTranslation();

    // Constantes
    const availablePlayers = players.filter((p) => p.id !== player.id);

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
     * Met à jour le formulaire à la saisie d'un numérique
     * @param {*} e Evènement
     */
    const handleChangeGiveaway = (action) => {
        // Donne des points à un autre participant
        switch (action) {
            case 'add':
                setFormData((prev) => {
                    const currentGiveaway = parseInt(prev.giveaway) || 0;

                    return {
                        ...prev,
                        giveaway: currentGiveaway >= player.points ? currentGiveaway : currentGiveaway + 1
                    };
                });
                break;
            case 'remove':
                setFormData((prev) => {
                    const currentGiveaway = parseInt(prev.giveaway) || 0;

                    return {
                        ...prev,
                        giveaway: currentGiveaway <= 0 ? 0 : currentGiveaway - 1
                    };
                });
                break;
        }
    };

    /**
     * Met à jour le formulaire à la saisie
     * @param {*} e Evènement
     */
    const handleChangeSelect = (e) => {
        setFormData((prev) => ({
            ...prev,
            giveawayId: parseInt(e.target.value)
        }));
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

            // Contrôle le don de points
            if (
                (formData.giveawayId !== null && formData.giveawayId !== undefined && formData.giveawayId !== 0 && !formData.giveaway) ||
                (formData.giveaway !== null && formData.giveaway !== undefined && formData.giveaway !== 0 && !formData.giveawayId)
            ) {
                setMessage({ code: 'errors.invalidGiveaway', type: 'error' });
                return;
            }

            // Contrôle les points restants
            const giveaway = parseInt(formData.giveaway, 10);

            if (player.points + delta - giveaway < 0) {
                setMessage({ code: 'errors.invalidGiveawayRemaining', type: 'error' });
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
                            <Modal.Header className="modal-header" closeButton>
                                <Modal.Title>{t('edition.deletePlayer')}</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>{t('edition.deletePlayerMessage', { name: formData.name })}</Modal.Body>
                        </>
                    ) : (
                        <>
                            <Modal.Header closeButton>
                                <Modal.Title>{t('edition.managePlayer')}</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {/* Message */}
                                {message && <Message code={message.code} type={message.type} setMessage={setMessage} />}

                                {/* Attribuer des points */}
                                <div className="modal-section-title">{t('edition.givePoints')}</div>

                                {/* Nombre de points */}
                                <div className="d-flex align-items-center bg-light rounded p-2 mt-3">
                                    <Badge className="bg-warning fs-6 me-2">{t('edition.points')}</Badge>
                                    {player.points}
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

                                {/* Modifier le participant */}
                                <div className="modal-section-title mt-3">{t('edition.editPlayer')}</div>

                                {/* Formulaire */}
                                <Form.Group controlId="name" className="d-flex align-items-center mt-3">
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

                                {/* Donner des points */}
                                <div className="modal-section-title mt-3">{t('edition.giveParticipant')}</div>

                                {/* Formulaire */}
                                <Form.Group controlId="points" className="d-flex align-items-center gap-3 mt-3">
                                    <GiTwoCoins size={30} />

                                    <div className="d-flex align-items-center w-100">
                                        <Button
                                            className="flex-fill"
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => handleChangeGiveaway('remove')}
                                        >
                                            –
                                        </Button>

                                        <div className="flex-fill px-3 text-center">{formData.giveaway || 0}</div>

                                        <Button
                                            className="flex-fill"
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => handleChangeGiveaway('add')}
                                        >
                                            +
                                        </Button>
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="name" className="d-flex align-items-center mt-3">
                                    <PiUserListFill size={30} className="me-3" />

                                    <Form.Select value={formData.giveawayId} onChange={handleChangeSelect}>
                                        <option key={0} value={0}>
                                            {t('edition.chooseParticipant')}
                                        </option>
                                        {availablePlayers.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} - {p.points} {t('edition.points').toLowerCase()}
                                            </option>
                                        ))}
                                    </Form.Select>
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
