/**
 * Fonction de conversion des erreurs back vers front
 * @param {*} code Code de l'erreur
 * @returns Code message front
 */
export const getErrorTranslationKey = (code) => {
    const map = {
        ERR_CREATION_FAILED: 'errors.creationFailed',
        ERR_DELETION_FAILED: 'errors.deletionFailed',
        ERR_EDITION_NOT_FOUND: 'errors.editionNotFound',
        ERR_INVALID_AUTH: 'errors.invalidAuth',
        ERR_LOGIN_FAILED: 'errors.loginFailed',
        ERR_LOGOUT_FAILED: 'errors.logoutFailed',
        ERR_ROUTE_NOT_FOUND: 'errors.routeNotFound',
        ERR_UNAUTHORIZED_ACTION: 'errors.unauthorizedAction',
        ERR_UNKNOWN_ENDPOINT: 'errors.unknownEndpoint',
        ERR_UPDATE_FAILED: 'errors.updateFailed'
    };

    return map[code] || 'errors.unknownError'; // clé fallback
};
