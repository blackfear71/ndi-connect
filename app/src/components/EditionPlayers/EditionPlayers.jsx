import { useContext, useEffect, useRef, useState } from 'react';

import { Badge, Button, Form, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { FaAngleRight, FaTrashCan } from 'react-icons/fa6';
import { FaGift } from 'react-icons/fa6';
import { GiTwoCoins } from 'react-icons/gi';
import { IoGiftSharp } from 'react-icons/io5';

import UserRole from '../../enums/UserRole';

import { AuthContext } from '../../utils/AuthContext';

import './EditionPlayers.css';

/**
 * Liste des participants
 */
const EditionPlayers = ({
    players,
    formPlayer,
    setFormPlayer,
    resetFormPlayer,
    setModalOptionsPlayer,
    formReward,
    setFormReward,
    setModalOptionsReward,
    setMessage,
    onSubmit,
    onConfirm,
    isSubmitting
}) => {
    // Contexte
    const { auth } = useContext(AuthContext);

    // Traductions
    const { t } = useTranslation();

    // Local states
    const nameInputRef = useRef(null);
    const [showEntry, setShowEntry] = useState(false);

    /**
     * Met le curseur sur la zone de saisie à l'ouverture
     */
    useEffect(() => {
        showEntry && nameInputRef.current?.focus();
    }, [showEntry]);

    /**
     * Affiche ou masque la saisie de participant
     * @param {*} show Indicateur d'affichage
     */
    const showHidePlayerEntry = (show) => {
        // Affiche ou masque la saisie
        setShowEntry(show);

        // Réinitialise le formulaire
        !show && resetFormPlayer();
    };

    /**
     * Met à jour le formulaire à la saisie (création)
     * @param {*} e Evènement
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormPlayer((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Gère le comportement du formulaire à la soumission
     * @param {*} e Evènement
     * @param {*} action Action à réaliser
     */
    const handleSubmit = (e, action) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Contrôle que le nom est renseigné
        if (!formPlayer.name) {
            setMessage({ code: 'errors.invalidName', type: 'error' });
            return;
        }

        // Masque la saisie
        setShowEntry(false);

        // Soumets le formulaire
        onSubmit(action);
    };

    /**
     * Affiche la modale de modification/suppression d'un participant
     * @param {*} player Données participant
     * @param {*} action Action à réaliser
     */
    const showPlayerModal = (player, action) => {
        setShowEntry(false);

        if (player) {
            setFormPlayer({
                ...formPlayer,
                id: player.id,
                name: player.name,
                delta: 0
            });
        }

        setModalOptionsPlayer((prev) => ({
            ...prev,
            action: action,
            isOpen: !prev.isOpen
        }));
    };

    /**
     * Affiche la modale d'attribution d'un cadeau à un participant
     * @param {*} player Données participant
     */
    const showRewardModal = (player) => {
        setShowEntry(false);

        if (player) {
            setFormReward({
                ...formReward,
                idPlayer: player.id
            });
        }

        setModalOptionsReward((prev) => ({
            ...prev,
            isOpen: !prev.isOpen
        }));
    };

    /**
     * Ouvre la modale de suppression de participant
     * @param {*} player Participant
     */
    const handleDelete = (player) => {
        // Ouverture de la modale de confirmation
        onConfirm({
            content: t('edition.deletePlayer', { name: player.name }),
            action: 'deletePlayer',
            data: player.id
        });
    };

    return (
        <>
            {auth.isLoggedIn && auth.level >= UserRole.ADMIN && (
                <>
                    {/* Ajout */}
                    <div className="d-grid mb-2">
                        <Button variant="outline-action" onClick={() => showHidePlayerEntry(true)}>
                            {t('edition.addPlayer')}
                        </Button>
                    </div>

                    {/* Saisie */}
                    {showEntry && (
                        <fieldset disabled={isSubmitting}>
                            <Form onSubmit={(event) => handleSubmit(event, 'create')} className="d-flex align-items-center gap-2">
                                <Form.Control
                                    ref={nameInputRef}
                                    type="text"
                                    name="name"
                                    placeholder={t('edition.name')}
                                    className="edition-players-entry"
                                    value={formPlayer.name}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required
                                />
                                <Button onClick={() => showHidePlayerEntry(false)} className="edition-players-button">
                                    <FaTimes />
                                </Button>
                                <Button type="submit" className="edition-players-button">
                                    {isSubmitting ? <Spinner animation="border" role="status" variant="light" size="sm" /> : <FaCheck />}
                                </Button>
                            </Form>
                        </fieldset>
                    )}
                </>
            )}

            {/* Liste */}
            {players && players.length > 0 ? (
                players.map((p) => (
                    <div key={p.id} className="d-flex align-items-center gap-2 mt-2">
                        {/* Participant */}
                        <div className="d-flex align-items-center flex-grow-1 edition-players-name">
                            <Badge bg="success" className="me-1 d-flex align-items-center">
                                <GiTwoCoins size={18} className="me-1" />
                                {p.points}
                            </Badge>
                            <Badge bg="primary" className="me-1 d-flex align-items-center">
                                <IoGiftSharp size={16} className="me-1" />
                                {p?.rewards.length}
                            </Badge>
                            <span className="d-inline-block flex-grow-1 edition-players-ellipsis-text">{p.name}</span>
                        </div>

                        {/* Supression */}
                        {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && (
                            <Button
                                onClick={isSubmitting ? null : () => handleDelete(p)}
                                className="edition-players-button"
                                style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            >
                                <FaTrashCan color={isSubmitting ? 'gray' : 'white'} />
                            </Button>
                        )}

                        {/* Cadeaux */}
                        <Button
                            onClick={isSubmitting ? null : () => showRewardModal(p)}
                            className="edition-players-button"
                            style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                        >
                            <FaGift color={isSubmitting ? 'gray' : 'white'} />
                        </Button>

                        {/* Modification */}
                        {auth.isLoggedIn && auth.level >= UserRole.ADMIN && (
                            <Button
                                onClick={isSubmitting ? null : () => showPlayerModal(p, 'update')}
                                className="edition-players-button"
                                style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            >
                                <FaAngleRight color={isSubmitting ? 'gray' : 'white'} />
                            </Button>
                        )}
                    </div>
                ))
            ) : (
                <div className="edition-empty mt-2">{t('edition.noPlayers')}</div>
            )}
        </>
    );
};

export default EditionPlayers;
