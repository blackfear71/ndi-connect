import packageJson from '../../../package.json';

import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <span>© 2025, NDI-Connect - v{packageJson.version}</span>
        </footer>
    );
};

export default Footer;
