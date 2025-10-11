import { Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import PasswordInput from '../PasswordInput/PasswordInput';

import './SettingsCreateUser.css';

/**
 * Liste des participants
 */
const SettingsCreateUser = ({ formCreateUser, setFormCreateUser, setMessage, onSubmit, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

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
            <fieldset disabled={isSubmitting}>
                <Form onSubmit={(event) => handleSubmit(event)}>
                    <Form.Control
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
                    <Button
                        type="submit"
                        className="settings-create-user-button mt-2"
                        style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                        Valider
                    </Button>
                </Form>
            </fieldset>
        </>
    );
};

export default SettingsCreateUser;
