import { useEffect, useRef } from 'react';

import { Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import PasswordInput from '../PasswordInput/PasswordInput';

import './SettingsCreateUser.css';

/**
 * Liste des participants
 */
const SettingsCreateUser = ({ formCreateUser, setFormCreateUser, showForm, showFormMethod, setMessage, onSubmit, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const createUserInputRef = useRef(null);

    /**
     * Met le curseur sur la zone de saisie à l'ouverture
     */
    useEffect(() => {
        showForm && createUserInputRef.current?.focus();
    }, [showForm]);

    /**
     * Met à jour le formulaire à la saisie
     * @param {*} e Evènement
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormCreateUser((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Met à jour le formulaire à la saisie
     * @param {*} e Evènement
     */
    const handleChangeSelect = (e) => {
        setFormCreateUser((prev) => ({
            ...prev,
            level: parseInt(e.target.value)
        }));
    };

    /**
     * Gère le comportement du formulaire à la soumission
     * @param {*} e Evènement
     */
    const handleSubmit = (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Contrôle que les données sont renseignées
        if (
            !formCreateUser.login ||
            !formCreateUser.password ||
            !formCreateUser.confirmPassword ||
            formCreateUser.level === '' ||
            isNaN(formCreateUser.level)
        ) {
            setMessage({ code: 'errors.invalidUserData', type: 'error' });
            return;
        }

        // Contrôle que les nouveaux mots de passe correspondent
        if (formCreateUser.password !== formCreateUser.confirmPassword) {
            setMessage({ code: 'errors.passwordMatch', type: 'error' });
            return;
        }

        // Contrôle que le niveau est correct
        if (formCreateUser.level < 0 || formCreateUser.level > 2) {
            setMessage({ code: 'errors.invalidLevel', type: 'error' });
            return;
        }

        // Soumets le formulaire
        onSubmit();
    };

    return (
        <>
            {/* Titre */}
            <h1>{t('settings.createUser')}</h1>

            {/* Saisie */}
            {!showForm ? (
                <Button className="settings-create-user-button me-2" onClick={showFormMethod}>
                    {t('settings.showCreateUserForm')}
                </Button>
            ) : (
                <fieldset disabled={isSubmitting}>
                    <Form onSubmit={(event) => handleSubmit(event)}>
                        <Form.Control
                            ref={createUserInputRef}
                            type="text"
                            name="login"
                            placeholder={t('settings.login')}
                            className="mt-2"
                            value={formCreateUser.login}
                            onChange={handleChange}
                            maxLength={100}
                            required
                        />
                        <PasswordInput
                            name={'password'}
                            placeholder={t('settings.password')}
                            value={formCreateUser.password}
                            handleChange={handleChange}
                        />
                        <PasswordInput
                            name={'confirmPassword'}
                            placeholder={t('settings.confirmPassword')}
                            value={formCreateUser.confirmPassword}
                            handleChange={handleChange}
                        />
                        <Form.Select value={formCreateUser.level} onChange={handleChangeSelect} className="mt-2" required>
                            <option key="" value="" disabled>
                                {t('settings.chooseLevel')}
                            </option>
                            {[0, 1, 2].map((level) => (
                                <option key={level} value={level}>
                                    {t(`settings.level${level}`)}
                                </option>
                            ))}
                        </Form.Select>
                        <div className="d-flex align-items-center mt-2">
                            <Button type="button" className="settings-password-button me-2" onClick={showFormMethod}>
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" className="settings-create-user-button">
                                {t('common.validate')}
                            </Button>
                        </div>
                    </Form>
                </fieldset>
            )}
        </>
    );
};

export default SettingsCreateUser;
