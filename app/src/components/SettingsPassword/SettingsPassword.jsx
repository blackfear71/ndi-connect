import { useEffect, useRef } from 'react';

import { Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import PasswordInput from '../PasswordInput/PasswordInput';

import './SettingsPassword.css';

/**
 * Liste des participants
 */
const SettingsPassword = ({ formPassword, setFormPassword, showForm, showFormMethod, setMessage, onSubmit, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const passwordInputRef = useRef(null);

    /**
     * Met le curseur sur la zone de saisie à l'ouverture
     */
    useEffect(() => {
        showForm && passwordInputRef.current?.focus();
    }, [showForm]);

    /**
     * Met à jour le formulaire à la saisie
     * @param {*} e Evènement
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormPassword((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Gère le comportement du formulaire à la soumission
     * @param {*} e Evènement
     */
    const handleSubmit = (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Contrôle que les mots de passe sont renseignés
        if (!formPassword.oldPassword || !formPassword.newPassword || !formPassword.confirmPassword) {
            setMessage({ code: 'errors.invalidPassword', type: 'error' });
            return;
        }

        // Contrôle que le nouveau mot de passe est différent de l'ancien
        if (formPassword.oldPassword === formPassword.newPassword) {
            setMessage({ code: 'errors.passwordIdentical', type: 'error' });
            return;
        }

        // Contrôle que les nouveaux mots de passe correspondent
        if (formPassword.newPassword !== formPassword.confirmPassword) {
            setMessage({ code: 'errors.passwordMatch', type: 'error' });
            return;
        }

        // Soumets le formulaire
        onSubmit();
    };

    return (
        <>
            {/* Titre */}
            <h1>{t('settings.password')}</h1>

            {/* Saisie */}
            {!showForm ? (
                <Button className="settings-password-button me-2" onClick={showFormMethod}>
                    {t('settings.showPasswordForm')}
                </Button>
            ) : (
                <fieldset disabled={isSubmitting}>
                    <Form onSubmit={(event) => handleSubmit(event)}>
                        <PasswordInput
                            ref={passwordInputRef}
                            name={'oldPassword'}
                            placeholder={t('settings.oldPassword')}
                            value={formPassword.oldPassword}
                            handleChange={handleChange}
                        />
                        <PasswordInput
                            name={'newPassword'}
                            placeholder={t('settings.newPassword')}
                            value={formPassword.newPassword}
                            handleChange={handleChange}
                        />
                        <PasswordInput
                            name={'confirmPassword'}
                            placeholder={t('settings.confirmPassword')}
                            value={formPassword.confirmPassword}
                            handleChange={handleChange}
                        />
                        <div className="d-flex align-items-center mt-2">
                            <Button type="button" className="settings-password-button me-2" onClick={showFormMethod}>
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" className="settings-password-button">
                                {t('common.validate')}
                            </Button>
                        </div>
                    </Form>
                </fieldset>
            )}
        </>
    );
};

export default SettingsPassword;
