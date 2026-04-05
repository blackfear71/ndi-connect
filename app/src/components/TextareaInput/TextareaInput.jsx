import { Form } from 'react-bootstrap';

const TextareaInput = ({ icon, name, title, placeholder, value, onChange }) => {
    return (
        <div className="d-flex align-items-center gap-2">
            {/* Icône */}
            <div className="d-flex align-items-center justify-content-center modal-input-icon">{icon}</div>

            {/* Titre & saisie */}
            <Form.Group className="d-flex flex-column w-100" controlId={name}>
                <Form.Label className="mb-1 modal-zone-content-label">{title}</Form.Label>
                <Form.Control as="textarea" name={name} placeholder={placeholder} value={value} onChange={onChange} />
            </Form.Group>
        </div>
    );
};

export default TextareaInput;
