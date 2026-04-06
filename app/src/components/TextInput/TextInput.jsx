import { Form } from 'react-bootstrap';

/**
 * Saisie ligne de texte
 */
const TextInput = ({ title, icon, name, ref, type = 'text', value, onChange, maxLength, inputMode, pattern, required = false }) => {
    return (
        <div className="d-flex flex-column gap-1">
            {/* Titre */}
            {title && (
                <div className="modal-group-content-title">
                    {title}
                    {required && <span className="required-star">*</span>}
                </div>
            )}

            <div className="d-flex align-items-center gap-2">
                {/* Icône */}
                {icon && <div className="modal-input-icon">{icon}</div>}

                {/* Saisie */}
                <Form.Group className="d-flex flex-column w-100" controlId={name}>
                    <Form.Label className="visually-hidden">{title ?? name}</Form.Label>

                    <Form.Control
                        ref={ref}
                        type={type}
                        name={name}
                        placeholder={title}
                        value={value}
                        onChange={onChange}
                        maxLength={maxLength}
                        inputMode={inputMode}
                        pattern={pattern}
                        required={required}
                    />
                </Form.Group>
            </div>
        </div>
    );
};

export default TextInput;
