import { useContext, useEffect, useRef, useState } from 'react';

import { Badge, Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaUserCircle } from 'react-icons/fa';
import { FcApproval } from 'react-icons/fc';
import { Link } from 'react-router-dom';

import ndiConnectLogo from '../../assets/images/ndi-connect.png';

import { AuthContext } from '../../utils/AuthContext';
import ConnectionModal from '../ConnectionModal/ConnectionModal';
import SearchBar from '../SearchBar/SearchBar';

import './NavBar.css';

/**
 * Barre de navigation
 * @returns
 */
const NavBar = () => {
    // Contexte
    const { auth, authError, login, logout } = useContext(AuthContext);

    // Traductions
    const { t } = useTranslation();

    // Local states
    const dropdownRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formConnection, setFormConnection] = useState({
        login: '',
        password: ''
    });
    const [message, setMessage] = useState(null);
    const [modalOptions, setModalOptions] = useState({ isOpen: false });
    const [showDropdown, setShowDropdown] = useState(false);

    /**
     * Affecte un évènement lors du clic en dehors de la zone
     */
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /**
     * Ferme la zone de recherche au clic en dehors
     * @param {*} e Evènement
     */
    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setShowDropdown(false);
        }
    };

    /**
     * Ouverture/fermeture de la modale de connexion
     */
    const openCloseConnectionModal = () => {
        // Ouverture ou fermeture
        setModalOptions({ isOpen: !modalOptions.isOpen });

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptions.isOpen && resetFormConnection();
    };

    /**
     * Réinitialisation formulaire
     */
    const resetFormConnection = () => {
        setFormConnection({
            login: '',
            password: ''
        });
    };

    /**
     * Connexion ou déconnexion selon le cas
     */
    const handleSubmit = () => {
        setMessage(null);
        setIsSubmitting(true);

        // On attend la promesse de connexion/déconnexion pour fermer la modale
        login(formConnection)
            .then(() => {
                openCloseConnectionModal();
            })
            .catch(() => {})
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <nav className="navbar-container">
            {/* Logo */}
            <Link to="/">
                <img src={ndiConnectLogo} alt="ndi-connect" className="navbar-logo" />
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
                    {auth.isLoggedIn && <FcApproval className="navbar-user-connected" />}
                </div>

                {auth.isLoggedIn && (
                    <Dropdown show={showDropdown} align="end">
                        <Dropdown.Menu className="navbar-dropdown">
                            <Dropdown.Item className="navbar-dropdown-item navbar-dropdown-item-first" style={{ cursor: 'inherit' }}>
                                {t('navbar.connectedMessage')}
                                <Badge pill bg="success" className="navbar-dropdown-badge ms-1">
                                    {auth.login}
                                </Badge>
                            </Dropdown.Item>
                            <Dropdown.Item className="navbar-dropdown-item" onClick={logout}>
                                {t('navbar.disconnect')}
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
            </div>

            {/* Modale de connexion */}
            {modalOptions.isOpen && (
                <ConnectionModal
                    formData={formConnection}
                    setFormData={setFormConnection}
                    modalOptions={modalOptions}
                    message={message || authError}
                    setMessage={setMessage}
                    onClose={openCloseConnectionModal}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
        </nav>
    );
};

export default NavBar;
