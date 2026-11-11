// Caractères autorisés pour un code de carte (36 caractères)
const CARD_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Longueur du code
const CARD_CODE_LENGTH = 8;

// Nombre maximum de QR codes générés en une fois
export const MAX_QR_CODES_COUNT = 100;

/**
 * Génère un code de carte aléatoire
 * @returns Code de la carte
 */
const generateCardCode = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(CARD_CODE_LENGTH));

    return Array.from(bytes, (byte) => CARD_CODE_ALPHABET[byte % CARD_CODE_ALPHABET.length]).join('');
};

/**
 * Génère une liste de codes de carte uniques
 * @param {*} count Nombre de codes à générer
 * @returns Liste de codes
 */
export const generateCardCodes = (count) => {
    const codes = new Set();

    while (codes.size < count) {
        codes.add(generateCardCode());
    }

    return [...codes];
};

/**
 * Construit l'URL d'une carte
 * @param {*} editionId Identifiant édition
 * @param {*} code Code de la carte
 * @returns URL
 */
export const getCardUrl = (editionId, code) => `${import.meta.env.VITE_APP_URL}/edition/${editionId}?card=${code}`;
