import { FaUserCircle } from 'react-icons/fa';

import ndiConnectLogo from '../../assets/images/ndi-connect.png';

import SearchBar from '../SearchBar1/SearchBar1';

import './NavBar.css';

/**
 * Barre de navigation
 * @returns
 */
const NavBar = () => {
    return (
        <nav className="navbar-container">
            {/* Logo */}
            <img
                src={ndiConnectLogo}
                alt="ndi-connect"
                className="navbar-logo"
            />

            {/* Barre de recherche */}
            <SearchBar />

            {/* Utilisateur */}
            <FaUserCircle size={40} color="#000000" className="navbar-user" />
        </nav>
    );
};

export default NavBar;
