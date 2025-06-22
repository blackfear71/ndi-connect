import { useContext, useEffect, useRef, useState } from 'react';

import { Badge, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { FaAngleRight, FaTrashCan } from 'react-icons/fa6';
import { GiTwoCoins } from 'react-icons/gi';

import UserRole from '../../enums/UserRole';

import { AuthContext } from '../../utils/AuthContext';

import './EditionPlayers.css';

// TODO : - ajouter des actions pour donner des cadeaux à un participant (que si quantité > 0 et si le participant est dans l'édition)
//        - nouvelle modale pour donner un cadeau à un participant
//        - passer la liste des cadeaux en param de la nouvelle modale
//        - nombre de cadeaux à attribuer avec +/- (initialisé à 1 et impossible de saisir moins que 1 ou plus que la quantité totale) => récupérer le cadeau dans le back, contrôler que c'est possible et calculer la valeur en points
//        - possibilité pour un participant de faire un don de points
//        - prévoir de pouvoir diminuer la quantité d'un cadeau donné comme ça (utiliser un player_id générique dans la table d'assignement ?)

/**
 * Liste des participants
 */
const EditionPlayers = ({ players, formData, setFormData, resetFormPlayer, setModalOptions, setMessage, onSubmit, isSubmitting }) => {
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
     * Affiche la saisie de participant
     */
    const showPlayerEntry = () => {
        setShowEntry(true);
    };

    /**
     * Met à jour le formulaire à la saisie (création)
     * @param {*} e Evènement
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Annule la création d'un participant
     */
    const handleCancel = () => {
        // Masque la saisie
        setShowEntry(false);

        // Réinitialise le formulaire
        resetFormPlayer();
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
        if (!formData.name) {
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
            setFormData({
                id: player.id,
                name: player.name,
                delta: 0
            });
        }

        setModalOptions({
            action: action,
            isOpen: true
        });
    };

    return (
        <>
            {auth.isLoggedIn && auth.level >= UserRole.ADMIN && (
                <>
                    {/* Ajout */}
                    <div className="d-grid mb-2">
                        <Button variant="outline-edition" onClick={showPlayerEntry}>
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
                                    value={formData.name}
                                    onChange={handleChange}
                                    maxLength={100}
                                    required
                                />
                                <Button
                                    onClick={handleCancel}
                                    className="edition-players-button"
                                    style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                                >
                                    <FaTimes color={isSubmitting ? 'gray' : 'white'} />
                                </Button>
                                <Button
                                    type="submit"
                                    className="edition-players-button"
                                    style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                                >
                                    <FaCheck color={isSubmitting ? 'gray' : 'white'} />
                                </Button>
                            </Form>
                        </fieldset>
                    )}
                </>
            )}

            {/* Liste */}
            {players && players.length > 0 ? (
                players.map((player) => (
                    <div key={player.id} className="d-flex align-items-center gap-2 mt-2">
                        {/* Participant */}
                        <div className="d-flex align-items-center flex-grow-1 edition-players-name">
                            <Badge bg="success" className="me-1 d-flex align-items-center">
                                <GiTwoCoins size={18} className="me-1" />
                                {player.points}
                            </Badge>
                            <span className="d-inline-block flex-grow-1 edition-players-ellipsis-text">{player.name}</span>
                        </div>

                        {/* Supression */}
                        {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && (
                            <Button
                                onClick={isSubmitting ? null : () => showPlayerModal(player, 'delete')}
                                className="edition-players-button"
                                style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            >
                                <FaTrashCan color={isSubmitting ? 'gray' : 'white'} />
                            </Button>
                        )}

                        {/* Modification */}
                        {auth.isLoggedIn && auth.level >= UserRole.ADMIN && (
                            <Button
                                onClick={isSubmitting ? null : () => showPlayerModal(player, 'update')}
                                className="edition-players-button"
                                style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            >
                                <FaAngleRight color={isSubmitting ? 'gray' : 'white'} />
                            </Button>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-white">{t('edition.noPlayers')}</div>
            )}
        </>
    );
};

export default EditionPlayers;
