import { useEffect } from 'react';

import { Badge, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { GiTwoCoins } from 'react-icons/gi';
import { PiListStarBold, PiUserListFill } from 'react-icons/pi';

import Message from '../Message/Message';

import './RewardModal.css';

const RewardModal = ({ player, gifts, formData, setFormData, modalOptions, message, setMessage, onClose, onSubmit, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Constants
    const obtainableGifts = gifts.filter((g) => g.remainingQuantity > 0 && g.value <= player.points);

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
    const handleChangeSelect = (e) => {
        setFormData((prev) => ({
            ...prev,
            idGift: parseInt(e.target.value)
        }));
    };

    /**
     * Met à jour le formulaire à la saisie d'un numérique
     * @param {*} e Evènement
     */
    const handleChangeIncrement = (action) => {
        // Donne des points à un autre participant
        switch (action) {
            case 'add':
                setFormData((prev) => {
                    const currentPoints = parseInt(prev.points) || 0;

                    return {
                        ...prev,
                        points: currentPoints >= player.points ? currentPoints : currentPoints + 1
                    };
                });
                break;
            case 'remove':
                setFormData((prev) => {
                    const currentPoints = parseInt(prev.points) || 0;

                    return {
                        ...prev,
                        points: currentPoints <= 0 ? 0 : currentPoints - 1
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
    const handleSubmit = (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Contrôle cadeau sélectionné
        if (!formData.idGift) {
            setMessage({ code: 'errors.invalidGift', type: 'error' });
            return;
        } else {
            // Contrôle que les points sont >= valeur du cadeau
            const selectedGift = obtainableGifts.find((g) => g.id === formData.idGift);

            if (!selectedGift || player.points < selectedGift.value) {
                setMessage({ code: 'errors.invalidGiftPoints', type: 'error' });
                return;
            }
        }

        // Soumets le formulaire
        onSubmit();
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <fieldset disabled={isSubmitting}>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('edition.giveGift')}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Message */}
                        {message && <Message code={message.code} type={message.type} setMessage={setMessage} />}

                        {/* Participant */}
                        <div className="d-flex align-items-center bg-light rounded p-2">
                            <Badge className="reward-modal-badge bg-warning fs-6 me-2">{t('edition.player')}</Badge>
                            {player.name}
                        </div>

                        {/* Nombre de points */}
                        <div className="d-flex align-items-center bg-light rounded p-2 mt-2">
                            <Badge className="reward-modal-badge bg-warning fs-6 me-2">{t('edition.points')}</Badge>
                            {player.points}
                        </div>

                        {/* Formulaire */}
                        {obtainableGifts.length > 0 ? (
                            <Form.Group controlId="name" className="d-flex align-items-center mt-2">
                                <PiListStarBold size={30} className="me-3" />
                                <Form.Select value={formData.idGift} onChange={handleChangeSelect} required>
                                    <option key={0} value={0} disabled>
                                        {t('edition.chooseGift')}
                                    </option>
                                    {obtainableGifts.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.name} - {g.value} {t('edition.points').toLowerCase()} ({g.remainingQuantity}{' '}
                                            {g.remainingQuantity === 1 ? t('edition.remaining') : t('edition.remainings')})
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        ) : (
                            <div>{t('edition.noAvailableGifts')}</div>
                        )}
                    </Modal.Body>

                    <div className="reward-modal-separator"></div>

                    <Modal.Header>
                        <Modal.Title>{t('edition.giveParticipant')}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Formulaire */}
                        <Form.Group controlId="name" className="d-flex align-items-center">
                            <PiUserListFill size={30} className="me-3" />
                            {/* TODO : possibilité pour un participant de faire un don de points via la modale */}
                            {/* TODO : select avec autres participants de l'édition (filtrer le participant courant) */}
                            {/* TODO : attention, la quantité doit être contrôlée si un participant est choisi, pareil pour l'inverse et possibilité de choisir du vide + bien gérer le handle Select avec le formulaire en commun */}
                            {/* <Form.Select value={formData.idGift} onChange={handleChangeSelect}>
                                <option key={0} value={0} disabled>
                                    {t('edition.chooseGift')}
                                </option>
                                {obtainableGifts.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name} - {g.value} {t('edition.points').toLowerCase()} ({g.remainingQuantity}{' '}
                                        {g.remainingQuantity === 1 ? t('edition.remaining') : t('edition.remainings')})
                                    </option>
                                ))}
                            </Form.Select> */}
                        </Form.Group>

                        <Form.Group controlId="points" className="d-flex align-items-center gap-3">
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

                                <div className="flex-fill px-3 text-center">{formData.points || 0}</div>

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

                    <Modal.Footer>
                        <Button type="button" variant="secondary" onClick={() => onClose()}>
                            {t('common.close')}
                        </Button>
                        {obtainableGifts.length > 0 && (
                            <Button type="submit" variant="primary">
                                {t('common.validate')}
                                {isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
                            </Button>
                        )}
                    </Modal.Footer>
                </Form>
            </fieldset>
        </Modal>
    );
};

export default RewardModal;
