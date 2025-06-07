import { useContext, useState } from 'react';

import { FaUserCircle } from 'react-icons/fa';
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

    // Local states
    const [message, setMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formConnection, setFormConnection] = useState({
        login: '',
        password: ''
    });
    const [modalOptions, setModalOptions] = useState({ isOpen: false });

    /**
     * Ouverture/fermeture de la modale de connexion
     */
    const openCloseConnectionModal = () => {
        setFormConnection({
            login: '',
            password: ''
        });
        setModalOptions({ isOpen: !modalOptions.isOpen });
    };

    /**
     * Connexion ou déconnexion selon le cas
     */
    const handleSubmit = () => {
        setMessage(null);
        setIsSubmitting(true);

        const action = auth.isLoggedIn ? logout : () => login(formConnection);

        // On attend la promesse de connexion/déconnexion pour fermer la modale
        action()
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

            {/* Utilisateur */}
            <FaUserCircle className="navbar-user" onClick={() => openCloseConnectionModal()} />

            {/* Modale de connexion */}
            {modalOptions.isOpen && (
                <ConnectionModal
                    formData={formConnection}
                    setFormData={setFormConnection}
                    isOpen={modalOptions.isOpen}
                    isLoggedIn={auth.isLoggedIn}
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
