import { Image } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import flagEn from '../../../assets/icons/flag-en.svg';
import flagFr from '../../../assets/icons/flag-fr.svg';

import './Footer.css';

/**
 * Pied de page
 */
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

    /**
     * Retourne le copyright
     * @returns Copyright à afficher
     */
    const getCopyright = () => {
        const currentYear = new Date().getFullYear();
        const yearDisplay = currentYear > 2025 ? `2025–${currentYear}` : '2025';

        return `© ${yearDisplay}, NDI-Connect • v${__APP_VERSION__}`;
    };

    return (
        <footer className="footer d-flex align-items-center justify-content-between">
            <span className="footer-text mx-auto">{getCopyright()}</span>
            <button className="d-flex footer-language-toggle" onClick={handleToggleLanguage}>
                <Image
                    src={i18n.language === 'fr' ? flagFr : flagEn}
                    alt={i18n.language === 'fr' ? t('common.french') : t('common.english')}
                    title={i18n.language === 'fr' ? t('common.french') : t('common.english')}
                    className="footer-language-flag"
                />
            </button>
        </footer>
    );
};

export default Footer;
