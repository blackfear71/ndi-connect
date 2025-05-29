import { Outlet } from 'react-router-dom';

import NavBar from '../NavBar1/NavBar1';

import './Layout.css';

/**
 * Composant zone d'affichage globale
 * @returns
 */
const Layout = () => {
    return (
        <div>
            {/* Barre de navigation */}
            <NavBar />

            {/* Contenu */}
            <div className="layout-outlet-container">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
