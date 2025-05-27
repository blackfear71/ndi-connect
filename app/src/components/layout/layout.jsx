import { Outlet } from 'react-router-dom';

import Navbar from '../navbar/navbar';

import './layout.css';

/**
 * Composant zone d'affichage globale
 * @returns
 */
const Layout = () => {
    return (
        <div>
            {/* Barre de navigation */}
            <Navbar />

            {/* Contenu */}
            <div className="layout-outlet-container">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
