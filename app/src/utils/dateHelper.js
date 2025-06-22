/**
 * Récupère le jour d'une date au format yyyy-MM-dd
 * @param {*} date Date à convertir
 * @returns Jour
 */
export const getDayFromDate = (date) => {
    const jsDate = new Date(date.replace(' ', 'T'));

    const year = jsDate.getFullYear();
    const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
    const day = jsDate.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Récupère le jour d'une date au format français dd/MM/yyyy
 * @param {*} date Date à convertir
 * @returns Jour français
 */
export const getFrenchDate = (date) => {
    const jsDate = new Date(date.replace(' ', 'T'));

    const year = jsDate.getFullYear();
    const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
    const day = jsDate.getDate().toString().padStart(2, '0');

    return `${day}/${month}/${year}`;
};

/**
 * Récupère l'heure d'une date au format HH:mm
 * @param {*} date Date à convertir
 * @returns Heure
 */
export const getTimeFromDate = (date) => {
    const jsDate = new Date(date.replace(' ', 'T'));

    const hours = jsDate.getHours().toString().padStart(2, '0');
    const minutes = jsDate.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
};
