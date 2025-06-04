import { useEffect, useState } from 'react';

import i18next from 'i18next';
import Alert from 'react-bootstrap/Alert';
import { useTranslation } from 'react-i18next';

import { getErrorTranslationKey } from '../../utils/errorMapper';

const Error = ({ variant = 'danger', code, setError, autoClose = false, duration = 10000 }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [show, setShow] = useState(true);

    /**
     * Fermeture automatique du message
     */
    useEffect(() => {
        if (autoClose && show) {
            const timer = setTimeout(() => {
                setShow(false);
                setError && setError('');
            }, duration);

            // Nettoyage si le composant est démonté avant
            return () => clearTimeout(timer);
        }
    }, [autoClose, show, duration, setError]);

    /**
     * Fermeture manuelle du message
     */
    const handleClose = () => {
        setShow(false);
        setError && setError('');
    };

    return (
        <>
            {show && (
                <Alert variant={variant} onClose={!autoClose && handleClose} dismissible={!autoClose}>
                    {i18next.exists(code) ? t(code) : t(getErrorTranslationKey(code))}
                </Alert>
            )}
        </>
    );
};

export default Error;
