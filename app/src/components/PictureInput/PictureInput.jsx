import { useEffect, useState } from 'react';

import { Button, Form, Image } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaTrashCan } from 'react-icons/fa6';

import './PictureInput.css';

/**
 * Saisie d'image avec aperçu et suppression
 */
const PictureInput = ({ name, value, setMessage, onChange, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [fileName, setFileName] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    /**
     * Initialise l'image existante si "value" est fourni
     */
    useEffect(() => {
        if (value) {
            // Si c'est le nom d'un fichier existant sur le serveur
            if (typeof value === 'string') {
                setPreviewUrl(`${import.meta.env.VITE_API_URL}/serve-file?destination=images&file=${value}`);
                setFileName(value);
            }
            // Si c'est un fichier saisi (File object)
            else if (value instanceof File) {
                previewUrl && URL.revokeObjectURL(previewUrl);
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
                previewUrl && URL.revokeObjectURL(previewUrl);
                setPreviewUrl(URL.createObjectURL(file));
                setFileName(file.name);

                onChange && onChange(file, 'insert');
            } else {
                setMessage({ code: 'errors.invalidFileType', type: 'error' });

                e.target.value = '';
                setPreviewUrl(null);
                setFileName('');
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
        <div className="d-flex align-items-center gap-2 w-100">
            {/* Parcourir */}
            <Form.Group>
                <Form.Label className="picture-input-button rounded p-3 m-0" style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                    {t('common.browse')}
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
            <div className="picture-input-preview-wrapper">
                {previewUrl ? (
                    <div className="picture-input-preview-content">
                        {/* Aperçu */}
                        <Image key={previewUrl} src={previewUrl} alt={fileName} rounded className="picture-input-preview-image" />

                        {/* Suppression */}
                        <Button onClick={handleFileRemove} className="picture-input-button-small">
                            <FaTrashCan />
                        </Button>
                    </div>
                ) : (
                    t('common.noFilesSelected')
                )}
            </div>
        </div>
    );
};

export default PictureInput;
