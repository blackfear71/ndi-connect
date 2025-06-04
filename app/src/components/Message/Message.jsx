import { useEffect, useState } from 'react';

import i18next from 'i18next';
import Alert from 'react-bootstrap/Alert';
import { useTranslation } from 'react-i18next';

import { getMessageTranslationKey } from '../../utils/messageMapper';

const Message = ({ code, type = 'danger', setMessage, autoClose = false, duration = 10000 }) => {
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
                setMessage && setMessage(null);
            }, duration);

            // Nettoyage si le composant est démonté avant
            return () => clearTimeout(timer);
        }
    }, [autoClose, show, duration, setMessage]);

    /**
     * Fermeture manuelle du message
     */
    const handleClose = () => {
        setShow(false);
        setMessage && setMessage(null);
    };

    return (
        <>
            {show && (
                <Alert variant={type} onClose={!autoClose && handleClose} dismissible={!autoClose}>
                    {i18next.exists(code) ? t(code) : t(getMessageTranslationKey(code))}
                </Alert>
            )}
        </>
    );
};

export default Message;
