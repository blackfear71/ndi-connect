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

    return (
        <>
            {/* TODO : tableau */}
            <div style={{ color: 'white' }}>Lieu : {about.location}</div>
            <div style={{ color: 'white' }}>Date de début : {about.startDate}</div>
            <div style={{ color: 'white' }}>Date de fin : {about.startDate}</div>
        </>
    );
};

export default EditionAbout;
