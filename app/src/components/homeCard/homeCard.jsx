import { useState } from 'react';

import { Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import ndiConnectLogo from '../../assets/images/ndi-connect.png';

import './homeCard.css';

/**
 * Composant carte accueil
 * @param {*} param0
 * @returns
 */
const HomeCard = ({
    edition,
    formUpdate,
    setFormUpdate,
    onUpdate,
    onDelete,
}) => {
    const [isUpdating, setIsUpdating] = useState(false);

    /**
     * Permet la modification
     */
    const onClickUpdating = () => {
        setFormUpdate({ year: edition.year, place: edition.place });
        setIsUpdating(!isUpdating);
    };

    /**
     * Met à jour le formik à la saisie (modification)
     * @param {*} e Evènement
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormUpdate((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Mise à jour des données
     */
    const handleUpdateClick = () => {
        onUpdate(edition.id);
        setIsUpdating(false);
    };

    return (
        <Card style={{ width: '18rem' }} bg="danger" text="white">
            <Link to={`/edition/${edition.id}`}>
                <Card.Img
                    variant="top"
                    src={ndiConnectLogo}
                    style={{ background: 'white' }}
                />
            </Link>
            <Card.Body>
                {isUpdating ? (
                    <div>
                        <input
                            type="text"
                            name="year"
                            placeholder="Année"
                            value={formUpdate.year}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="place"
                            placeholder="Lieu"
                            value={formUpdate.place}
                            onChange={handleChange}
                        />
                        <button onClick={() => handleUpdateClick()}>
                            Valider
                        </button>
                        <button onClick={() => setIsUpdating(!isUpdating)}>
                            Annuler
                        </button>
                    </div>
                ) : (
                    <div>
                        <Card.Title>{edition.year}</Card.Title>
                        <Card.Text>{edition.place}</Card.Text>
                        {formUpdate && (
                            <button onClick={() => onClickUpdating()}>
                                Modifier
                            </button>
                        )}
                    </div>
                )}
            </Card.Body>
            {onDelete && (
                <Button variant="primary" onClick={() => onDelete(edition.id)}>
                    Supprimer
                </Button>
            )}
        </Card>
    );
};

export default HomeCard;
