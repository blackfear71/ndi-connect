import { useContext, useEffect } from 'react';

import { Badge, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';
import { PiListStarBold } from 'react-icons/pi';

import UserRole from '../../enums/UserRole';

import { AuthContext } from '../../utils/AuthContext';
import Message from '../Message/Message';

import './RewardModal.css';

const RewardModal = ({ player, gifts, formData, setFormData, modalOptions, message, setMessage, onClose, onSubmit, isSubmitting }) => {
    // Contexte
    const { auth } = useContext(AuthContext);

    // Traductions
    const { t } = useTranslation();

    // Constantes
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

    /**
     * TODO
     */
    const handleDelete = () => {};

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <fieldset disabled={isSubmitting}>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {auth.isLoggedIn && auth.level >= UserRole.ADMIN ? t('edition.giveGift') : t('edition.informations')}
                        </Modal.Title>
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
                        {auth.isLoggedIn && auth.level >= UserRole.ADMIN && (
                            <>
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
                                    <div className="bg-light rounded p-2 mt-2">{t('edition.noAvailableGifts')}</div>
                                )}
                            </>
                        )}
                    </Modal.Body>

                    <div className="reward-modal-separator"></div>

                    <Modal.Header>
                        <Modal.Title className="w-100 d-flex align-items-center justify-content-between">
                            {t('edition.obtainedGifts')}{' '}
                            <Badge
                                className="rounded-circle bg-danger text-white d-flex justify-content-center align-items-center"
                                style={{ width: '30px', height: '30px', fontSize: '14px' }}
                            >
                                {player?.gifts.length ?? 0}
                            </Badge>
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Cadeaux obtenus */}
                        {/* TODO : pour un super admin, afficher une croix qui ouvre une modale de confirmation (composant générique à faire) */}
                        {player?.gifts.length > 0 ? (
                            <div className="d-flex flex-column gap-2">
                                {player.gifts.map((g) => (
                                    <div key={g.id} className="d-flex align-items-center gap-2">
                                        <div className="d-flex align-items-center flex-grow-1 bg-light rounded p-2">{g.name}</div>
                                        {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && (
                                            <Button
                                                onClick={handleDelete}
                                                className="reward-modal-button"
                                                style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                                            >
                                                <FaTimes color={isSubmitting ? 'gray' : 'white'} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-light rounded p-2">{t('edition.noObtainedGifts')}</div>
                        )}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button type="button" variant="secondary" onClick={() => onClose()}>
                            {t('common.close')}
                        </Button>
                        {auth.isLoggedIn && auth.level >= UserRole.ADMIN && obtainableGifts.length > 0 && (
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
