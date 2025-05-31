import { useEffect, useRef } from 'react';

import { Button, Form, Modal } from 'react-bootstrap';

import Error from '../../components/Error/Error';

// TODO : voir si je ramène l'ouverture/fermeture dans la modale

const EditionModal = ({ formData, setFormData, isOpen, error, onClose, onSubmit }) => {
    // Local states
    const yearInputRef = useRef(null);

    /**
     * Met le focus sur le champ "année" à l'ouverture de la modale quand on est pas connecté
     */
    useEffect(() => {
        if (isOpen && yearInputRef.current) {
            yearInputRef.current.focus();
        }
    }, [isOpen]);

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
     * Met à jour le formulaire à la saisie d'un numérique (création)
     * @param {*} e Evènement
     */
    const handleChangeNumeric = (e) => {
        // Autorise uniquement les chiffres
        const { name, value } = e.target;

        if (/^\d*$/.test(value)) {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    /**
     * Gère le comportement du formulaire
     * @param {*} e Evènement
     */
    const handleSubmit = (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Soumets le formulaire
        onSubmit();
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Ajouter une nouvelle édition</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* Erreur */}
                    {error && <Error message={error} />}

                    <div className="d-flex align-items-end">
                        <Form.Group className="me-2" controlId="year">
                            <Form.Label>Année</Form.Label>
                            {/* TODO : côté back il faut vérifier que c'est entre 1901 et 2155 */}
                            <Form.Control
                                ref={yearInputRef}
                                type="text"
                                name="year"
                                placeholder="Année"
                                value={formData.year}
                                onChange={handleChangeNumeric}
                                maxLength={4}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="me-2" controlId="place">
                            <Form.Label>Lieu</Form.Label>
                            <Form.Control
                                type="text"
                                name="place"
                                placeholder="Lieu"
                                value={formData.place}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Fermer
                    </Button>
                    <Button type="submit" variant="primary">
                        Ajouter
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditionModal;
