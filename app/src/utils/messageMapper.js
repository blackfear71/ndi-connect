/**
 * Fonction de conversion des messages back vers front ou erreur inconnue
 * @param {*} code Code du message back
 * @param {*} params Paramètres optionnels du message back
 * @param {*} t Méthode de traduction
 * @returns Message front convertit
 */
export const getMessageTranslationKey = (code, params, t) => {
    // Mapping des messages entre BACK et FRONT
    const map = {
        // Erreurs
        ERR_CREATION_FAILED: 'errors.creationFailed',
        ERR_DELETION_FAILED: 'errors.deletionFailed',
        ERR_DELETION_FILE_FAILED: 'errors.deletionFileFailed',
        ERR_EDITION_NOT_FOUND: 'errors.editionNotFound',
        ERR_EDITIONS_NOT_FOUND: 'errors.editionsNotFound',
        ERR_ENV_FILES_DIR_MISSING: 'errors.envFilesDirMissing',
        ERR_FILE_NOT_FOUND: 'errors.fileNotFound',
        ERR_FILE_TOO_LARGE: 'errors.fileTooLarge',
        ERR_INVALID_AUTH: 'errors.invalidAuth',
        ERR_INVALID_DIRECTORY: 'errors.invalidDirectory',
        ERR_INVALID_FILE: 'errors.invalidFile',
        ERR_INVALID_FILENAME: 'errors.invalidFilename',
        ERR_INVALID_FORMAT: 'errors.invalidFormat',
        ERR_INVALID_IMAGE: 'errors.invalidImage',
        ERR_LOGIN_FAILED: 'errors.loginFailed',
        ERR_LOGOUT_FAILED: 'errors.logoutFailed',
        ERR_ROUTE_NOT_FOUND: 'errors.routeNotFound',
        ERR_UNAUTHORIZED_ACTION: 'errors.unauthorizedAction',
        ERR_UNKNOWN_ENDPOINT: 'errors.unknownEndpoint',
        ERR_UPDATE_FAILED: 'errors.updateFailed',
        ERR_UPLOAD_FAILED: 'errors.uploadFailed',
        ERR_USERS_NOT_FOUND: 'errors.usersNotFound',
        ERR_WEBP_CONVERSION_FAILED: 'errors.webpConversionFailed',

        // Messages
        MSG_CREATION_SUCCESS: 'messages.creationSuccess',
        MSG_DELETION_SUCCESS: 'messages.deletionSuccess',
        MSG_LOGIN_SUCCESS: 'messages.loginSuccess',
        MSG_LOGOUT_SUCCESS: 'messages.logoutSuccess',
        MSG_RESET_PASSWORD_SUCCESS: 'messages.resetPasswordSuccess',
        MSG_REWARD_SUCCESS: 'messages.rewardSuccess',
        MSG_UPDATE_SUCCESS: 'messages.updateSuccess',

        // Alertes
        WRN_LAST_ADMIN: 'warnings.lastAdmin',
        WRN_USER_EXISTS: 'warnings.userExists'
    };

    // Retourne la traduction
    return t(map[code] || 'errors.unknownError', params || {});
};
