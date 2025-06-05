import { useEffect, useState } from 'react';

import i18next from 'i18next';
import Alert from 'react-bootstrap/Alert';
import { useTranslation } from 'react-i18next';

import { getMessageTranslationKey } from '../../utils/messageMapper';

const Message = ({ code, type, setMessage }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [show, setShow] = useState(true);

    // Constantes
    const autoClose = type === 'success';

    /**
     * Fermeture automatique du message
     */
    useEffect(() => {
        if (autoClose && show) {
            const timer = setTimeout(() => {
                setShow(false);
                setMessage?.(null);
            }, 10000);

            // Nettoyage si le composant est démonté avant
            return () => clearTimeout(timer);
        }
    }, [autoClose, show, setMessage]);

    /**
     * Fermeture manuelle du message
     */
    const handleClose = () => {
        setShow(false);
        setMessage?.(null);
    };

    /**
     * Détermination de la couleur selon le type de message
     */
    const getVariantFromType = (messageType) =>
        ({
            success: 'success',
            error: 'danger',
            warning: 'warning',
            info: 'info'
        })[messageType] || 'info';

    return (
        show && (
            <Alert variant={getVariantFromType(type)} onClose={!autoClose && handleClose} dismissible={!autoClose}>
                {i18next.exists(code) ? t(code) : t(getMessageTranslationKey(code))}
            </Alert>
        )
    );
};

export default Message;
