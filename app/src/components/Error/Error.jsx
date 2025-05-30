import { useState } from 'react';

import Alert from 'react-bootstrap/Alert';

const Error = ({ message }) => {
    const [show, setShow] = useState(true);

    if (show) {
        return (
            <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                {message}
            </Alert>
        );
    }
};

export default Error;
