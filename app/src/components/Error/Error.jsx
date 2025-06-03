import { useState } from 'react';

import i18next from 'i18next';
import Alert from 'react-bootstrap/Alert';
import { useTranslation } from 'react-i18next';

import { getErrorTranslationKey } from '../../utils/errorMapper';

const Error = ({ code }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [show, setShow] = useState(true);

    return (
        <>
            {show && (
                <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                    {i18next.exists(code) ? t(code) : t(getErrorTranslationKey(code))}
                </Alert>
            )}
        </>
    );
};

export default Error;
