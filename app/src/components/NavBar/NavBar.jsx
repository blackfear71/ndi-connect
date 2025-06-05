import { useContext, useState } from 'react';

import { FaUserCircle } from 'react-icons/fa';

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
    const [isOpenConnectionModal, setIsOpenConnectionModal] = useState(false);
    const [formConnection, setFormConnection] = useState({
        login: '',
        password: ''
    });

    /**
     * Ouverture/fermeture de la modale de connexion
     */
    const openCloseConnectionModal = () => {
        setFormConnection({
            login: '',
            password: ''
        });
        setIsOpenConnectionModal(!isOpenConnectionModal);
    };

    /**
     * Connexion ou déconnexion selon le cas
     */
    const handleSubmit = () => {
        setMessage(null);

        const action = auth.isLoggedIn ? logout : () => login(formConnection);

        // On attend la promesse de connexion/déconnexion pour fermer la modale
        action()
            .then(() => {
                openCloseConnectionModal();
            })
            .catch(() => {});
    };

    return (
        <nav className="navbar-container">
            {/* Logo */}
            <img src={ndiConnectLogo} alt="ndi-connect" className="navbar-logo" />

            {/* Barre de recherche */}
            <SearchBar />

            {/* Utilisateur */}
            <FaUserCircle size={40} color="black" className="navbar-user" onClick={() => openCloseConnectionModal()} />

            {/* Modale de connexion */}
            {isOpenConnectionModal && (
                <ConnectionModal
                    formData={formConnection}
                    setFormData={setFormConnection}
                    isOpen={isOpenConnectionModal}
                    isLoggedIn={auth.isLoggedIn}
                    message={message || authError}
                    setMessage={setMessage}
                    onClose={openCloseConnectionModal}
                    onSubmit={handleSubmit}
                />
            )}
        </nav>
    );
};

export default NavBar;
