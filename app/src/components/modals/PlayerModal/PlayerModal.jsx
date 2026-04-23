import { useEffect, useRef } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaPeopleArrows, FaUserFriends } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa6';
import { GiTwoCoins } from 'react-icons/gi';
import { PiUserListFill } from 'react-icons/pi';

import { IncrementInput, SelectInput, TextInput } from '../../../components/inputs';
import { Message } from '../../../components/shared';

import { useAuth } from '../../../utils/context/AuthContext';

import { EnumAction, EnumUserRole } from '../../../enums';

/**
 * Modale participant
 */
const PlayerModal = ({ players, player, formData, setFormData, modalOptions, setModalOptions, onClose, onSubmit, isSubmitting }) => {
    // Contexte
    const { auth } = useAuth();

    // Traductions
    const { t } = useTranslation();

    // Local states
    const nameInputRef = useRef(null);

    // Constantes
    const availablePlayers = player && players.filter((p) => p.id !== player.id);

    /**
     * Réinitialise le message à l'ouverture de la modale
     */
    useEffect(() => {
        if (modalOptions?.isOpen) {
            // Réinitialisation du message
            setMessage(null);

            // Focus à la création
            modalOptions.action === EnumAction.CREATE && nameInputRef.current?.focus();
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
     * Met à jour le formulaire à la saisie d'un numérique
     * @param {*} action Action à réaliser
     */
    const handleChangePoints = (action) => {
        // Ajoute ou retire des points selon les droits
        switch (action) {
            case 'add':
                setFormData((prev) => {
                    const currentDelta = parseInt(prev.delta) || 0;
                    const nextDelta = currentDelta < 0 && auth.level < EnumUserRole.SUPERADMIN ? 0 : currentDelta + 1;

                    return {
                        ...prev,
                        delta: nextDelta
                    };
                });
                break;
            case 'remove':
                setFormData((prev) => {
                    const currentDelta = parseInt(prev.delta) || 0;
                    let nextDelta;

                    if (auth.level >= EnumUserRole.SUPERADMIN) {
                        // SUPERADMIN : peut aller en négatif, limité par les points du joueur
                        nextDelta = player ? Math.max(-player.points, currentDelta - 1) : Math.max(0, currentDelta - 1);
                    } else {
                        // Autres : jamais en dessous de 0
                        nextDelta = Math.max(0, currentDelta - 1);
                    }

                    return {
                        ...prev,
                        delta: nextDelta
                    };
                });
                break;
        }
    };

    /**
     * Met à jour le formulaire à la saisie d'un numérique
     * @param {*} action Action à réaliser
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

        // Contrôle le nom renseigné
        if (!formData.name) {
            setMessage({ code: 'errors.invalidName', type: 'error' });
            return;
        }

        // Contrôle que les points sont >= 0 (sauf SUPERADMIN)
        const delta = parseInt(formData.delta, 10);

        if (
            formData.delta === null ||
            formData.delta === undefined ||
            isNaN(delta) ||
            (auth.level < EnumUserRole.SUPERADMIN && delta < 0)
        ) {
            setMessage({ code: 'errors.invalidPoints', type: 'error' });
            return;
        }

        // Contrôles des points (modification)
        if (action === EnumAction.UPDATE) {
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
     * Renvoie une liste de participants sélectionnables
     */
    const getGivewayOptions = () => {
        return availablePlayers.map((p) => ({
            key: p.id,
            value: p.id,
            label: `${p.name} • ${p.points} ${t('edition.points').toLowerCase()}`
        }));
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <fieldset disabled={isSubmitting}>
                <Form onSubmit={(event) => handleSubmit(event, modalOptions.action)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaUser />
                            {modalOptions.action === EnumAction.CREATE ? t('edition.addPlayer') : t('edition.managePlayer')}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Nombre de points */}
                        {modalOptions.action === EnumAction.UPDATE && (
                            <div className="modal-group">
                                <div className="modal-group-content">
                                    {/* Titre */}
                                    <div className="modal-group-content-title">{t('edition.points')}</div>

                                    {/* Valeur */}
                                    <div className={`modal-group-content-value ${player?.points > 0 ? 'green' : 'gray'}`}>
                                        {player?.points ?? 0}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Modification du participant */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <TextInput
                                    title={modalOptions.action === EnumAction.CREATE ? t('edition.name') : t('edition.updateName')}
                                    icon={<PiUserListFill />}
                                    name="name"
                                    ref={nameInputRef}
                                    placeholder={t('edition.name')}
                                    value={formData.name}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required={true}
                                />
                            </div>
                        </div>

                        {/* Attribution des points */}
                        <div className="modal-group">
                            <div className="modal-group-content">
                                <IncrementInput
                                    title={t('edition.givePoints')}
                                    icon={<GiTwoCoins />}
                                    name={'points'}
                                    value={formData.delta}
                                    onChangeDown={() => handleChangePoints('remove')}
                                    onChangeUp={() => handleChangePoints('add')}
                                />
                            </div>
                        </div>

                        {/* Don de points */}
                        {modalOptions.action === EnumAction.UPDATE && player?.points > 0 && availablePlayers.length > 0 && (
                            <div className="modal-group">
                                <div className="modal-group-content gap-2">
                                    {/* Choix du participant */}
                                    <SelectInput
                                        title={t('edition.giveParticipant')}
                                        icon={<FaUserFriends />}
                                        name={'playerGiveaway'}
                                        defaultOption={{ key: 0, value: 0, label: t('edition.chooseParticipant') }}
                                        options={getGivewayOptions()}
                                        value={formData.giveawayId}
                                        onChange={handleChangeSelect}
                                    />

                                    {/* Nombre de points */}
                                    <IncrementInput
                                        icon={<FaPeopleArrows />}
                                        name={'giftGiveaway'}
                                        value={formData.giveaway}
                                        onChangeDown={() => handleChangeGiveaway('remove')}
                                        onChangeUp={() => handleChangeGiveaway('add')}
                                    />
                                </div>
                            </div>
                        )}
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
                            <Button type="button" variant="modal-outline-action" onClick={() => onClose()} disabled={isSubmitting}>
                                {t('common.close')}
                            </Button>

                            <Button type="submit" variant="modal-action" disabled={isSubmitting}>
                                {t('common.validate')}
                                {isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </fieldset>
        </Modal>
    );
};

export default PlayerModal;
