import i18next from 'i18next';

/**
 * Retourne une date au format YYYY-MM-DD (pour les champs de formulaire)
 * @param {string|Date} date Date à convertir
 * @returns Date formatée
 */
export const getDayFromDate = (date) => {
    if (!date) return '';

    const jsDate = new Date(typeof date === 'string' ? date.replace(' ', 'T') : date);

    const year = jsDate.getUTCFullYear();
    const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(jsDate.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Récupère une date formatée selon la langue active (i18next)
 * @param {string|Date} date Date à convertir
 * @param {Object} [options] Options Intl.DateTimeFormat
 * @returns Date formatée
 */
export const getLocalizedDate = (date, options = {}) => {
    if (!date) {
        return '';
    }

    // Normalisation de la date (utile pour les formats "YYYY-MM-DD HH:mm:ss")
    const jsDate = new Date(typeof date === 'string' ? date.replace(' ', 'T') : date);

    // Récupération de la langue actuelle
    const locale = i18next.language || 'fr';

    // Options par défaut : DD/MM/YYYY
    const defaultOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(jsDate);
};

/**
 * Récupère l'heure d'une date selon la locale active
 * @param {string|Date} date Date à convertir
 * @param {Object} [options] Options Intl.DateTimeFormat
 * @returns Heure formatée
 */
export const getLocalizedTime = (date, options = {}) => {
    if (!date) return '';

    const jsDate = new Date(typeof date === 'string' ? date.replace(' ', 'T') : date);
    const locale = i18next.language || 'fr';

    // Options par défaut : HH:MM
    const defaultOptions = {
        hour: '2-digit',
        minute: '2-digit',
        ...options
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(jsDate);
};
