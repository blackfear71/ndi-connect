import { Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import PasswordInput from '../PasswordInput/PasswordInput';

import './SettingsPassword.css';

/**
 * Liste des participants
 */
const SettingsPassword = ({ formPassword, setFormPassword, setMessage, onSubmit, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

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

        // Contrôle que les nouveaux mots de passe correspondent
        if (formPassword.newPassword !== formPassword.confirmPassword) {
            setMessage({ code: 'errors.passwordMatch', type: 'error' });
            return;
        }

        // Contrôle que le nouveau mot de passe est différent de l'ancien
        if (formPassword.oldPassword === formPassword.newPassword) {
            setMessage({ code: 'errors.passwordIdentical', type: 'error' });
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
            <fieldset disabled={isSubmitting}>
                <Form onSubmit={(event) => handleSubmit(event)}>
                    <PasswordInput
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
                    <Button
                        type="submit"
                        className="settings-password-button mt-2"
                        style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                        Valider
                    </Button>
                </Form>
            </fieldset>
        </>
    );
};

export default SettingsPassword;
