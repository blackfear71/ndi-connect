import { Outlet } from 'react-router-dom';

import Footer from '../Footer/Footer';
import NavBar from '../NavBar/NavBar';

import './Layout.css';

/**
 * Composant zone d'affichage globale
 * @returns
 */
const Layout = () => {
    return (
        <div className="layout-container">
            {/* Barre de navigation */}
            <NavBar />

            {/* Contenu */}
            <main className="layout-main">
                <Outlet />
            </main>

            {/* Pied de page */}
            <Footer />
        </div>
    );
};

export default Layout;
