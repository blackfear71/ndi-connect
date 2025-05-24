import { Outlet } from 'react-router-dom';

import Navbar from '../navbar/navbar';

import './layout.css';

const Layout = () => {
    return (
        <div>
            <Navbar />

            <div className="layout-outlet-container">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
