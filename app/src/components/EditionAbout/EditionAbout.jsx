import { useTranslation } from 'react-i18next';

/**
 * A propos
 */
const EditionAbout = ({ about }) => {
    // Traductions
    const { t } = useTranslation();

    // TODO : compléter avec :
    // - horaires avec barre de progression
    // - thème/sujet des étudiants
    // - défi CGI

    return <div style={{ color: 'white' }}>{about.place}</div>;
};

export default EditionAbout;
