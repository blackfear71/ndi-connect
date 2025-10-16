import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

const version = import.meta.env.VITE_VERSION || Date.now(); // fallback si absent

/**
 * Charge les fichiers de traduction, détecte la langue du navigateur et connecte à React
 */
i18n.use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'fr', // langue par défaut
        debug: false,
        interpolation: {
            escapeValue: false
        },
        backend: {
            loadPath: `/locales/{{lng}}/{{ns}}.json?v=${version}`
        }
    });

export default i18n;
