import { useEffect, useRef } from 'react';

import { Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import PasswordInput from '../PasswordInput/PasswordInput';

/**
 * Liste des participants
 */
const SettingsCreateUser = ({ formData, setFormData, showForm, showFormMethod, setMessage, onSubmit, isSubmitting }) => {
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
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Met à jour le formulaire à la saisie
     * @param {*} e Evènement
     */
    const handleChangeSelect = (e) => {
        setFormData((prev) => ({
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
        if (!formData.login || !formData.password || !formData.confirmPassword || formData.level === '' || isNaN(formData.level)) {
            setMessage({ code: 'errors.invalidUserData', type: 'error' });
            return;
        }

        // Contrôle que les nouveaux mots de passe correspondent
        if (formData.password !== formData.confirmPassword) {
            setMessage({ code: 'errors.passwordMatch', type: 'error' });
            return;
        }

        // Contrôle que le niveau est correct
        if (formData.level < 0 || formData.level > 2) {
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
                <Button className="settings-button" onClick={showFormMethod}>
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
                            value={formData.login}
                            onChange={handleChange}
                            maxLength={100}
                            required
                        />
                        <PasswordInput
                            name={'password'}
                            placeholder={t('settings.password')}
                            value={formData.password}
                            handleChange={handleChange}
                        />
                        <PasswordInput
                            name={'confirmPassword'}
                            placeholder={t('settings.confirmPassword')}
                            value={formData.confirmPassword}
                            handleChange={handleChange}
                        />
                        <Form.Select value={formData.level} onChange={handleChangeSelect} className="mt-2" required>
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
                            <Button type="button" className="settings-button me-2" onClick={showFormMethod}>
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" className="settings-button">
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
