import { Button, Form } from 'react-bootstrap';
import { FaMinus, FaPlus } from 'react-icons/fa6';

import './IncrementInput.css';

/**
 * Saisie incrément
 */
const IncrementInput = ({ title, icon, name, value, onChangeDown, onChangeUp }) => {
    return (
        <div className="d-flex flex-column gap-1">
            {/* Titre */}
            {title && <div className="modal-group-content-title">{title}</div>}

            {/* Saisie */}
            <div className="d-flex align-items-center gap-2">
                {/* Icône */}
                {icon && <div className="modal-input-icon">{icon}</div>}

                {/* Saisie */}
                <Form.Group className="d-flex align-items-center gap-2 w-100" controlId={name}>
                    <Form.Label className="visually-hidden">{title ?? name}</Form.Label>

                    <Button className="d-flex align-items-center justify-content-center increment-input-button" onClick={onChangeDown}>
                        <FaMinus />
                    </Button>

                    <div
                        className={`d-flex align-items-center justify-content-center increment-input-value ${value > 0 ? 'green' : value < 0 ? 'red' : ''}`}
                    >
                        {value || 0}
                    </div>

                    <Button className="d-flex align-items-center justify-content-center increment-input-button" onClick={onChangeUp}>
                        <FaPlus />
                    </Button>
                </Form.Group>
            </div>
        </div>
    );
};

export default IncrementInput;
