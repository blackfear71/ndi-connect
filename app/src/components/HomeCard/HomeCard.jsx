import { useState } from 'react';

import { Button, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import ndiConnectLogo from '../../assets/images/ndi-connect.png';

import './HomeCard.css';

/**
 * Composant carte accueil
 * @param {*} param0
 * @returns
 */
const HomeCard = ({ edition, formUpdate, setFormUpdate, onUpdate, onDelete }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [isUpdating, setIsUpdating] = useState(false);

    /**
     * Permet la modification
     */
    const onClickUpdating = () => {
        setFormUpdate({ year: edition.year, place: edition.place });
        setIsUpdating(!isUpdating);
    };

    /**
     * Met à jour le formulaire à la saisie (modification)
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
                <Card.Img variant="top" src={ndiConnectLogo} style={{ background: 'white' }} />
            </Link>
            <Card.Body>
                {isUpdating ? (
                    <div>
                        <input
                            type="text"
                            name="year"
                            placeholder={t('edition.year')}
                            value={formUpdate.year}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="place"
                            placeholder={t('edition.place')}
                            value={formUpdate.place}
                            onChange={handleChange}
                        />
                        <button onClick={() => handleUpdateClick()}>Valider</button>
                        <button onClick={() => setIsUpdating(!isUpdating)}>Annuler</button>
                    </div>
                ) : (
                    <div>
                        <Card.Title>{edition.year}</Card.Title>
                        <Card.Text>{edition.place}</Card.Text>
                        {formUpdate && <button onClick={() => onClickUpdating()}>{t('common.update')}</button>}
                    </div>
                )}
            </Card.Body>
            {onDelete && (
                <Button variant="primary" onClick={() => onDelete(edition.id)}>
                    {t('common.delete')}
                </Button>
            )}
        </Card>
    );
};

export default HomeCard;
