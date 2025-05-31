import { Button, Form, Modal } from 'react-bootstrap';

import Error from '../Error/Error';

// TODO : voir si je ramène l'ouverture/fermeture dans la modale

const ConnectionModal = ({ formData, setFormData, onClose, onSubmit, isLoggedIn, error }) => {
    /**
     * Met à jour le formulaire à la saisie (création)
     * @param {*} e Evènement
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
                    <Modal.Title>{isLoggedIn ? <>Déconnexion</> : <>Connexion</>}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {error && <Error message={error} />}
                    {isLoggedIn ? (
                        <>Vous êtes connecté, vous pouvez vous déconnecter avec le bouton ci-dessous</>
                    ) : (
                        <div className="d-flex align-items-end">
                            <Form.Group className="me-2" controlId="login">
                                <Form.Label>Identifiant</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="login"
                                    placeholder="Identifiant"
                                    value={formData.login}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="me-2" controlId="password">
                                <Form.Label>Mot de passe</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    placeholder="Mot de passe"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Fermer
                    </Button>
                    <Button type="submit" variant="primary">
                        {isLoggedIn ? <>Déconnexion</> : <>Connexion</>}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ConnectionModal;
