import { useContext, useEffect, useRef, useState } from 'react';

import { Badge, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { FaAngleRight, FaTrashCan } from 'react-icons/fa6';

import UserRole from '../../enums/UserRole';

import { AuthContext } from '../../utils/AuthContext';

import './EditionPlayers.css';

/**
 * Liste des participants
 */
const EditionPlayers = ({
    players,
    formData,
    setFormData,
    resetFormPlayer,
    setModalOptions,
    setMessage,
    onSubmit,
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
        // Autorise uniquement les chiffres
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Annule la création d'un participant
     */
    const handleDelete = () => {
        // Masque la saisie
        setShowEntry(false);

        // Réinitialise le formulaire
        resetFormPlayer();
    };

    /**
     * Valide la création d'un participant
     */
    const handleSubmit = (e) => {
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
        onSubmit();
    };

    /**
     * Affiche la modale de modification/suppression d'un participant
     * @param {*} player Données participant
     */
    const showPlayerModal = (player, action) => {
        setShowEntry(false);

        setFormData({
            id: player.id,
            name: player.name,
            points: player.points
        });

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
                            <Form onSubmit={handleSubmit} className="d-flex align-items-center gap-2">
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
                                    onClick={handleDelete}
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
            {players && players.length > 0
                ? players.map((player) => (
                      <div key={player.id} className="d-flex align-items-center gap-2 mt-2">
                          {/* Participant */}
                          <div className="d-flex align-items-center flex-grow-1 edition-players-name">
                              <Badge bg="secondary" className="me-1">
                                  {player.points}
                              </Badge>
                              {player.name}
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
                : t('edition.noPlayers')}
        </>
    );
};

export default EditionPlayers;
