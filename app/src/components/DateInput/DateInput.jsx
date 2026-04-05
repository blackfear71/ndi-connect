import { Form } from 'react-bootstrap';

/**
 * Saisie date
 */
const DateInput = ({ title, icon, name, value, onChange, required = false }) => {
    return (
        <div className="d-flex flex-column gap-1">
            {/* Titre */}
            {title && <div className="modal-group-content-title">{title}</div>}

            <div className="d-flex align-items-center gap-2">
                {/* Icône */}
                <div className="modal-input-icon">{icon}</div>

                {/* Saisie */}
                <Form.Group className="d-flex flex-column w-100" controlId={name}>
                    <Form.Label className="visually-hidden">{title ?? name}</Form.Label>

                    <Form.Control type="date" name={name} value={value || ''} onChange={onChange} required={required} />
                </Form.Group>
            </div>
        </div>
    );
};

export default DateInput;
