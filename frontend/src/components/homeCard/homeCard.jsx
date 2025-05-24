import { useState } from 'react';

import { Button, Card } from 'react-bootstrap';

import ndiConnectLogo from '../../assets/images/ndi-connect.png';

import './homeCard.css';

const HomeCard = ({ test, formUpdate, setFormUpdate, onUpdate, onDelete }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const onClickUpdating = () => {
        setFormUpdate({ name: test.name, description: test.description });
        setIsUpdating(!isUpdating);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormUpdate((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateClick = () => {
        onUpdate(test.test_id);
        setIsUpdating(false);
    };

    return (
        <Card style={{ width: '18rem' }} bg="danger" text="white">
            <Card.Img
                variant="top"
                src={ndiConnectLogo}
                style={{ background: 'white' }}
            />
            <Card.Body>
                {isUpdating ? (
                    <div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nom"
                            value={formUpdate.name}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={formUpdate.description}
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
                        <Card.Title>{test.name}</Card.Title>
                        <Card.Text>{test.description}</Card.Text>
                        {formUpdate && (
                            <button onClick={() => onClickUpdating()}>
                                Modifier
                            </button>
                        )}
                    </div>
                )}
            </Card.Body>
            {onDelete && (
                <Button
                    variant="primary"
                    onClick={() => onDelete(test.test_id)}
                >
                    Supprimer
                </Button>
            )}
        </Card>
    );
};

export default HomeCard;
