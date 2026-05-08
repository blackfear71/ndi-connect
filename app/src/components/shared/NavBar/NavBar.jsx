import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { Badge, Dropdown, Image } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';

import ndiConnectLogo from '../../../assets/images/ndi-connect.webp';

import { ConnectionModal } from '../../../components/modals';
import { SearchBar } from '../../../components/shared';

import { useAuth } from '../../../utils/context/AuthContext';

import './NavBar.css';

// Valeurs initiales du formulaire
const initialConnectionValues = {
    login: '',
    password: ''
};

// Schémas de validation Yup
const connectionValidationSchema = Yup.object({
    login: Yup.string().required('errors.invalidLogin'),
    password: Yup.string().required('errors.invalidPassword')
});

/**
 * Barre de navigation
 */
const NavBar = () => {
    // Router
    const navigate = useNavigate();

    // Contexte
    const { auth, authMessage, login, logout } = useAuth();

    // Traductions
    const { t } = useTranslation();

    // Local states
    const dropdownRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [modalOptions, setModalOptions] = useState({ isOpen: false });
    const [showDropdown, setShowDropdown] = useState(false);

    // Formik
    const formConnection = useFormik({
        initialValues: initialConnectionValues,
        validationSchema: connectionValidationSchema,
        onSubmit: () => handleSubmit()
    });

    /**
     * Affecte un évènement lors du clic en dehors de la zone
     */
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /**
     * Ferme le menu utilisateur au clic en dehors
     * @param {*} e Evènement
     */
    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setShowDropdown(false);
        }
    };

    /**
     * Ferme le menu utilisateur à la redirection
     */
    const handleRedirect = (page) => {
        setShowDropdown(false);
        navigate(`/${page}`);
    };

    /**
     * Ouverture/fermeture de la modale de connexion
     */
    const openCloseConnectionModal = () => {
        // Ouverture ou fermeture
        setModalOptions({ isOpen: !modalOptions.isOpen });

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptions.isOpen && formConnection.resetForm();
    };

    /**
     * Connexion ou déconnexion selon le cas
     */
    const handleSubmit = () => {
        setMessage(null);
        setIsSubmitting(true);

        // On attend la promesse de connexion/déconnexion pour fermer la modale
        login(formConnection.values)
            .then(() => {
                openCloseConnectionModal();
            })
            .catch(() => {})
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <nav className="d-flex align-items-center jusitfy-content-between gap-3 navbar-container">
            {/* Logo */}
            <Link to="/">
                <Image src={ndiConnectLogo} alt="ndi-connect" title={t('common.home')} className="navbar-logo" />
            </Link>

            {/* Barre de recherche */}
            <SearchBar />

            {/* Connexion / menu déroulant */}
            <div ref={dropdownRef}>
                <div
                    className="navbar-user-wrapper"
                    onClick={() => (auth.isLoggedIn ? setShowDropdown(!showDropdown) : openCloseConnectionModal())}
                >
                    <FaUserCircle className="navbar-user" />
                    {auth.isLoggedIn && <div className="navbar-user-connected"></div>}
                </div>

                {auth.isLoggedIn && (
                    <Dropdown show={showDropdown} align="end">
                        {showDropdown && <div className="navbar-dropdown-triangle"></div>}

                        <Dropdown.Menu className="p-0 navbar-dropdown">
                            {/* Identifiant connecté */}
                            <Dropdown.Item className="p-2 navbar-dropdown-item">
                                {t('navbar.connectedMessage')}

                                <Badge pill bg="success" className="fs-6 ms-1">
                                    {auth.login}
                                </Badge>
                            </Dropdown.Item>

                            {/* Paramètres */}
                            <Dropdown.Item
                                className="p-2 navbar-dropdown-item d-flex align-items-center"
                                onClick={() => handleRedirect('settings')}
                            >
                                <IoSettingsOutline className="me-2" /> {t('navbar.settings')}
                            </Dropdown.Item>

                            {/* Déconnexion */}
                            <Dropdown.Item className="p-2 navbar-dropdown-item d-flex align-items-center" onClick={logout}>
                                <IoLogOutOutline className="me-2" /> {t('navbar.disconnect')}
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
            </div>

            {/* Modale de connexion */}
            {modalOptions.isOpen && (
                <ConnectionModal
                    formData={formConnection}
                    modalOptions={modalOptions}
                    message={message || authMessage}
                    setMessage={setMessage}
                    onClose={openCloseConnectionModal}
                    isSubmitting={isSubmitting}
                />
            )}
        </nav>
    );
};

export default NavBar;
