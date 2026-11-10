/**
 * Expressions régulières communes
 */

// Marques diacritiques (accents) obtenues après normalisation NFD
export const REGEX_DIACRITICS = /[̀-ͯ]/g;

// Caractères non alphanumériques (suite)
export const REGEX_NON_ALPHANUMERIC = /[^a-zA-Z0-9]+/g;

// Tirets en début et fin de chaîne
export const REGEX_EDGE_DASHES = /^-+|-+$/g;

// Chiffres uniquement (ou chaîne vide)
export const REGEX_DIGITS_ONLY = /^\d*$/;
