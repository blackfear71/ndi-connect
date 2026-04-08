import { useEffect, useRef, useState } from 'react';

import { Button, Form, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { IoAddCircleOutline } from 'react-icons/io5';

import { TextInput } from '../../../components/inputs';

import { useAuth } from '../../../utils/context/AuthContext';

import { UserRole } from '../../../enums';

import './EditionPlayers.css';

import PlayerList from './PlayerList/PlayerList';

/**
 * Liste des participants
 */
const EditionPlayers = ({
    players,
    getIconColor,
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
    const { auth } = useAuth();

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

    return (
        <>
            {auth.isLoggedIn && auth.level >= UserRole.ADMIN && (
                <>
                    {/* Ajout */}
                    <div className="d-grid mb-2">
                        <Button variant="outline-action" onClick={() => showHidePlayerEntry(true)}>
                            <IoAddCircleOutline size={25} />
                            {t('edition.addPlayer')}
                        </Button>
                    </div>

                    {/* Saisie */}
                    {showEntry && (
                        <fieldset disabled={isSubmitting}>
                            <Form onSubmit={(event) => handleSubmit(event, 'create')} className="d-flex align-items-center gap-2">
                                <div className="flex-fill">
                                    <TextInput
                                        name={'name'}
                                        ref={nameInputRef}
                                        className={'edition-players-entry'}
                                        placeholder={t('edition.name')}
                                        value={formPlayer.name}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required={true}
                                    />
                                </div>

                                <Button onClick={() => showHidePlayerEntry(false)} className="edition-button">
                                    <FaTimes />
                                </Button>

                                <Button type="submit" className="edition-button">
                                    {isSubmitting ? <Spinner animation="border" role="status" variant="light" size="sm" /> : <FaCheck />}
                                </Button>
                            </Form>
                        </fieldset>
                    )}
                </>
            )}

            {/* Liste */}
            {players && players.length > 0 ? (
                <div className="mt-3">
                    <PlayerList
                        players={players}
                        getIconColor={getIconColor}
                        onConfirm={onConfirm}
                        showRewardModal={showRewardModal}
                        showPlayerModal={showPlayerModal}
                        isSubmitting={isSubmitting}
                    />
                </div>
            ) : (
                <div className="px-2 py-3 mt-2 edition-empty">{t('edition.noPlayers')}</div>
            )}
        </>
    );
};

export default EditionPlayers;
