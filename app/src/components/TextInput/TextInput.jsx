import { Form } from 'react-bootstrap';

const TextInput = ({ icon, ref, name, title, value, onChange, maxLength = null, required }) => {
    return (
        <div className="d-flex align-items-center gap-2">
            {/* Icône */}
            <div className="d-flex align-items-center justify-content-center modal-input-icon">{icon}</div>

            {/* Titre & saisie */}
            <Form.Group className="d-flex flex-column w-100" controlId={name}>
                <Form.Label className="mb-1 modal-zone-content-label">{title}</Form.Label>

                <Form.Control
                    ref={ref}
                    type="text"
                    name={name}
                    placeholder={title}
                    value={value}
                    onChange={onChange}
                    maxLength={maxLength}
                    required={required}
                />
            </Form.Group>
        </div>
    );
};

export default TextInput;
