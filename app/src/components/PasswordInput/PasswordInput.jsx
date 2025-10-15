import { useState } from 'react';

import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import './PasswordInput.css';

/**
 * Saisie de mot de passe
 */
const PasswordInput = ({ ref = null, name, placeholder, value, handleChange }) => {
    // Local states
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Affiche ou masque le mot de passe
     */
    const toggleVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <InputGroup className="mt-2">
            <Form.Control
                ref={ref}
                type={showPassword ? 'text' : 'password'}
                name={name}
                placeholder={placeholder}
                className="password-input"
                value={value}
                onChange={handleChange}
                maxLength={100}
                required
            />
            <Button onClick={() => toggleVisibility()} tabIndex={-1} className="password-input-button">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
        </InputGroup>
    );
};

export default PasswordInput;
