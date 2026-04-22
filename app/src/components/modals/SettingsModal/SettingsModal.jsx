import { useEffect, useRef, useState } from 'react';

import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaUserCircle } from 'react-icons/fa';
import { HiIdentification, HiKey } from 'react-icons/hi';

import { PasswordInput, SelectInput, TextInput } from '../../../components/inputs';
import { Message } from '../../../components/shared';

import { EnumAction } from '../../../enums';

import './SettingsModal.css';

/**
 * Modale utilisateur
 */
const SettingsModal = ({ user, formData, setFormData, modalOptions, setModalOptions, onReset, onClose, onSubmit }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const loginInputRef = useRef(null);
    const [confirmReset, setConfirmReset] = useState(false);

    /**
     * Réinitialise le message à l'ouverture de la modale
     */
    useEffect(() => {
        if (modalOptions?.isOpen) {
            // Réinitialisation du message
            setMessage(null);

            // Focus à la création
            modalOptions.action === EnumAction.CREATE && loginInputRef.current?.focus();
        }
    }, [modalOptions?.isOpen]);

    /**
     * Définit le message affiché
     * @param {*} message Message à afficher
     */
    const setMessage = (message) => {
        setModalOptions((prev) => ({ ...prev, message: message }));
    };

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
     * Gère le comportement du formulaire à la soumission (réinitialisation mot de passe)
     * @param {*} e Evènement
     */
    const handleReset = (e) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Remise en place des boutons de confirmation de réinitialisation de mot de passe
        setConfirmReset(false);

        // Soumets le formulaire
        onReset(user.id);
    };

    /**
     * Gère le comportement du formulaire à la soumission (création/modification utilisateur)
     * @param {*} e Evènement
     * @param {*} action Action à réaliser
     */
    const handleSubmit = (e, action) => {
        // Empêche le rechargement de la page
        e.preventDefault();

        // Contrôle que les données sont renseignées (création)
        if (action === EnumAction.CREATE && (!formData.login || !formData.password || !formData.confirmPassword)) {
            setMessage({ code: 'errors.invalidUserData', type: 'error' });
            return;
        }

        // Contrôle que le niveau est correct
        if (formData.level === '' || isNaN(formData.level) || formData.level < 0 || formData.level > 2) {
            setMessage({ code: 'errors.invalidLevel', type: 'error' });
            return;
        }

        // Contrôle que les mots de passe correspondent (création)
        if (action === EnumAction.CREATE && formData.password !== formData.confirmPassword) {
            setMessage({ code: 'errors.passwordMatch', type: 'error' });
            return;
        }

        // Soumets le formulaire
        onSubmit(action);
    };

    /**
     * Renvoie une liste de rôles sélectionnables
     */
    const getLevelOptions = () => {
        return [0, 1, 2].map((r) => ({
            key: r,
            value: r,
            label: t(`settings.level${r}`)
        }));
    };

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <fieldset disabled={modalOptions.isSubmitting}>
                <Form onSubmit={(event) => handleSubmit(event, modalOptions.action)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {modalOptions.action === EnumAction.CREATE ? t('settings.createUser') : t('settings.manageUser')}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {/* Utilisateur */}
                        {modalOptions.action === EnumAction.UPDATE && (
                            <div className="d-flex align-items-center gap-2 p-2 settings-modal-user">
                                {/* Icône */}
                                <div className="d-flex align-items-center justify-content-center settings-modal-icon">
                                    {user.role?.icon}
                                </div>

                                {/* Identifiant et rôle */}
                                <div className="d-flex flex-column flex-grow-1 settings-modal-name">
                                    <span className="settings-modal-ellipsis-text">{user.login}</span>
                                    <div className="d-flex align-items-center gap-2 settings-modal-role">{user.role?.label}</div>
                                </div>
                            </div>
                        )}

                        {/* Saisies */}
                        <div className="modal-group">
                            <div className="modal-group-content gap-2">
                                {/* Identifiant */}
                                {modalOptions.action === EnumAction.CREATE && (
                                    <TextInput
                                        title={t('settings.login')}
                                        icon={<FaUserCircle />}
                                        name={'login'}
                                        ref={loginInputRef}
                                        placeholder={t('settings.login')}
                                        value={formData.login}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required={true}
                                    />
                                )}

                                {/* Rôle */}
                                <SelectInput
                                    title={
                                        modalOptions.action === EnumAction.CREATE ? t('settings.chooseLevel') : t('settings.updateLevel')
                                    }
                                    icon={<HiIdentification />}
                                    name={'level'}
                                    defaultOption={{ key: 0, value: '', label: t('settings.chooseLevel') }}
                                    options={getLevelOptions()}
                                    value={formData.level}
                                    onChange={handleChangeSelect}
                                    required={true}
                                />

                                {/* Description du niveau sélectionné */}
                                {formData.level !== '' && (
                                    <div className="text-muted px-2 py-1 settings-modal-description">
                                        {t(`settings.levelDescription${formData.level}`)}
                                    </div>
                                )}

                                {modalOptions.action === EnumAction.CREATE && (
                                    <>
                                        {/* Mot de passe */}
                                        <PasswordInput
                                            title={t('settings.password')}
                                            icon={<HiKey />}
                                            name={'password'}
                                            placeholder={t('settings.password')}
                                            value={formData.password}
                                            onChange={handleChange}
                                            maxLength={100}
                                            required={true}
                                        />

                                        {/* Confirmation mot de passe */}
                                        <PasswordInput
                                            title={t('settings.confirmPassword')}
                                            icon={<HiKey />}
                                            name={'confirmPassword'}
                                            placeholder={t('settings.confirmPassword')}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            maxLength={100}
                                            required={true}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Réinitialiser le mot de passe */}
                        {modalOptions.action === EnumAction.UPDATE && (
                            <div className="modal-group">
                                <div className="modal-group-content">
                                    <div className="modal-section-title mt-3">{t('settings.resetPassword')}</div>

                                    {/* Confirmation de réinitialisation */}
                                    {!confirmReset ? (
                                        <Button type="button" className="settings-button mt-2" onClick={() => setConfirmReset(true)}>
                                            {t('common.reset')}
                                        </Button>
                                    ) : (
                                        <div className="d-flex gap-2 mt-2">
                                            <Button type="button" variant="secondary" onClick={() => setConfirmReset(false)}>
                                                {t('common.cancel')}
                                            </Button>

                                            <Button type="button" variant="danger" onClick={(event) => handleReset(event)}>
                                                {t('common.confirm')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Modal.Body>

                    <Modal.Footer>
                        {/* Message */}
                        {modalOptions.message && (
                            <div className="modal-message">
                                <Message
                                    code={modalOptions.message.code}
                                    params={modalOptions.message.params}
                                    type={modalOptions.message.type}
                                    setMessage={setMessage}
                                />
                            </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="modal-footer-actions">
                            <Button type="button" variant="modal-outline-action" onClick={() => onClose()}>
                                {t('common.close')}
                            </Button>

                            <Button type="submit" variant="modal-action">
                                {t('common.validate')}
                                {modalOptions.isSubmitting && <Spinner animation="border" role="status" size="sm ms-2" />}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </fieldset>
        </Modal>
    );
};

export default SettingsModal;
