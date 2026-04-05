import { Form } from 'react-bootstrap';

/**
 * Saisie liste déroulante
 */
const SelectInput = ({ title, icon, name, defaultOption, options, value, onChange, required = false }) => {
    return (
        <div className="d-flex flex-column gap-1">
            {/* Titre */}
            {title && <div className="modal-group-content-title">{title}</div>}

            {/* Saisie */}
            <div className="d-flex align-items-center gap-2">
                {/* Icône */}
                <div className="modal-input-icon">{icon}</div>

                {/* Titre & saisie */}
                <Form.Group className="w-100" controlId={name}>
                    <Form.Label className="visually-hidden">{title ?? name}</Form.Label>

                    <Form.Select value={value} onChange={onChange} required={required}>
                        {defaultOption && (
                            <option key={defaultOption.key} value={defaultOption.value} disabled>
                                {defaultOption.label}
                            </option>
                        )}
                        {options.map((o) => (
                            <option key={o.key} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </div>
        </div>
    );
};

export default SelectInput;
