import { useTranslation } from 'react-i18next';

import flagEn from '../../assets/icons/flag-en.svg';
import flagFr from '../../assets/icons/flag-fr.svg';

import packageJson from '../../../package.json';

import './Footer.css';

const Footer = () => {
    // Traductions
    const { i18n, t } = useTranslation();

    /**
     * Gère le changement de langue
     */
    const handleToggleLanguage = () => {
        const newLang = i18n.language === 'fr' ? 'en' : 'fr';
        i18n.changeLanguage(newLang);
    };

    return (
        <footer className="footer d-flex align-items-center justify-content-between">
            <span className="footer-text mx-auto">© 2025, NDI-Connect - v{packageJson.version}</span>
            <button className="footer-language-toggle" onClick={handleToggleLanguage}>
                <img
                    src={i18n.language === 'fr' ? flagFr : flagEn}
                    alt={i18n.language === 'fr' ? t('common.french') : t('common.english')}
                    className="footer-language-flag"
                />
            </button>
        </footer>
    );
};

export default Footer;
