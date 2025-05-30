import { Button, Form, Modal } from 'react-bootstrap';

import Error from '../../components/Error/Error';

// TODO : voir si je ramène l'ouverture/fermeture dans la modale

const EditionModal = ({ formData, setFormData, onClose, onSubmit, error }) => {
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

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Ajouter une nouvelle édition</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Erreur */}
                {error && <Error message={error} />}

                <Form className="d-flex align-items-end">
                    <Form.Group className="me-2" controlId="year">
                        <Form.Label>Année</Form.Label>
                        <Form.Control
                            type="text"
                            name="year"
                            placeholder="Année"
                            value={formData.year}
                            onChange={handleChangeNumeric}
                            maxLength={4}
                            inputMode="numeric"
                            pattern="[0-9]*"
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
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Fermer
                </Button>
                <Button variant="primary" onClick={() => onSubmit(formData)}>
                    Ajouter
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditionModal;
