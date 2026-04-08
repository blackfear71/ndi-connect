import { Form } from 'react-bootstrap';

import './TimeInput.css';

/**
 * Saisie date
 */
const TimeInput = ({ title, icon, nameStart, nameEnd, titleStart, titleEnd, valueStart, valueEnd, onChange, required = false }) => {
    return (
        <div className="d-flex flex-column gap-1">
            {/* Titre */}
            {title && (
                <div className="modal-group-content-title">
                    {title}
                    {required && <span className="required-star">*</span>}
                </div>
            )}

            {/* Saisies */}
            <div className="d-flex align-items-center gap-2">
                {/* Icône */}
                {icon && <div className="modal-input-icon">{icon}</div>}

                {/* Début */}
                <Form.Group className="d-flex flex-grow-1 align-items-center w-100 time-input-group" controlId={nameStart}>
                    <span className="px-2 time-input-prefix">{titleStart}</span>

                    <Form.Label className="visually-hidden">{titleStart ?? nameStart}</Form.Label>

                    <Form.Control
                        className="w-100 px-2 time-input-control"
                        type="time"
                        name={nameStart}
                        value={valueStart || ''}
                        onChange={onChange}
                        required={required}
                    />
                </Form.Group>

                {/* Fin */}
                <Form.Group className="d-flex flex-grow-1 align-items-center w-100 time-input-group" controlId={nameEnd}>
                    <span className="px-2 time-input-prefix">{titleEnd}</span>

                    <Form.Label className="visually-hidden">{titleEnd ?? nameEnd}</Form.Label>

                    <Form.Control
                        className="w-100 px-2 time-input-control"
                        type="time"
                        name={nameEnd}
                        value={valueEnd || ''}
                        onChange={onChange}
                        required={required}
                    />
                </Form.Group>
            </div>
        </div>
    );
};

export default TimeInput;
