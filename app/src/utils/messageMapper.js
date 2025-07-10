/**
 * Fonction de conversion des messages back vers front
 * @param {*} code Code du message back
 * @returns Code du message front
 */
export const getMessageTranslationKey = (code) => {
    const map = {
        ERR_CREATION_FAILED: 'errors.creationFailed',
        ERR_DELETION_FAILED: 'errors.deletionFailed',
        ERR_EDITION_NOT_FOUND: 'errors.editionNotFound',
        ERR_EDITIONS_NOT_FOUND: 'errors.editionsNotFound',
        ERR_INVALID_AUTH: 'errors.invalidAuth',
        ERR_LOGIN_FAILED: 'errors.loginFailed',
        ERR_LOGOUT_FAILED: 'errors.logoutFailed',
        ERR_ROUTE_NOT_FOUND: 'errors.routeNotFound',
        ERR_UNAUTHORIZED_ACTION: 'errors.unauthorizedAction',
        ERR_UNKNOWN_ENDPOINT: 'errors.unknownEndpoint',
        ERR_UPDATE_FAILED: 'errors.updateFailed',
        MSG_CREATION_SUCCESS: 'messages.creationSuccess',
        MSG_DELETION_SUCCESS: 'messages.deletionSuccess',
        MSG_REWARD_SUCCESS: 'messages.rewardSuccess',
        MSG_UPDATE_SUCCESS: 'messages.updateSuccess'
    };

    return map[code] || 'errors.unknownError'; // clé fallback
};
