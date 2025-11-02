import { useEffect, useState } from 'react';

import { Button, Form, Image } from 'react-bootstrap';
import { FaTrashCan } from 'react-icons/fa6';

import './PictureInput.css';

/**
 * Saisie d'image avec aperçu et suppression
 */
const PictureInput = ({ name, value, setMessage, onChange, isSubmitting }) => {
    // Local states
    const [fileName, setFileName] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    /**
     * Initialise l'image existante si "value" est fourni
     */
    useEffect(() => {
        if (value) {
            // Si la valeur ressemble à une URL (commence par http ou /), on la garde telle quelle
            if (typeof value === 'string') {
                setPreviewUrl(value);
                setFileName(value.split('/').pop());
            }
            // Si c'est un fichier (File object)
            else if (value instanceof File) {
                setPreviewUrl(URL.createObjectURL(value));
                setFileName(value.name);
            }
        } else {
            setPreviewUrl(null);
            setFileName('');
        }
    }, [value]);

    /**
     * Gère le changement d'image
     * @param {*} e Evènement
     */
    const handleFileChange = (e) => {
        setMessage(null);

        const file = e.target.files[0];

        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

            // Si le type de fichier est autorisé, on met à jour le formulaire
            if (allowedTypes.includes(file.type)) {
                setFileName(file.name);
                setPreviewUrl(URL.createObjectURL(file));

                onChange && onChange(file, 'insert');
            } else {
                setMessage({ code: 'errors.invalidFile', type: 'error' });

                e.target.value = '';
                setFileName('');
                setPreviewUrl(null);
            }
        }
    };

    /**
     * Gère la suppression d'image
     */
    const handleFileRemove = () => {
        setFileName('');
        setPreviewUrl(null);

        onChange && onChange(null, 'delete');
    };

    return (
        <div className="d-flex align-items-center gap-2">
            {/* Parcourir */}
            <Form.Group>
                <Form.Label className="picture-input-button rounded p-3 m-0" style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                    Parcourir
                    <Form.Control
                        type="file"
                        name={name}
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </Form.Label>
            </Form.Group>

            {/* Aperçu et suppression */}
            <div className="d-flex align-items-center">
                {previewUrl && (
                    <>
                        {/* TODO : revoir le style pour que ça prenne l'espace entre les boutons mais avec un max heigth quand même */}
                        {/* TODO : revoir la taille des icônes à gauche pour qu'elle soit identique pour toutes, sinon ça créé des décalages */}

                        {/* Aperçu */}
                        <Image src={previewUrl} alt="Aperçu" rounded style={{ maxHeight: '70px' }} className="max-h-70 me-2" />

                        {/* Suppression */}
                        <Button onClick={handleFileRemove} className="picture-input-button-small">
                            <FaTrashCan />
                        </Button>
                    </>
                )}
                {!fileName && <span>Aucun fichier sélectionné</span>}
            </div>
        </div>
    );
};

export default PictureInput;
