<?php
class MessageHelper
{
    // Codes
    const ERR_CREATION_FAILED = 'ERR_CREATION_FAILED';
    const ERR_CREATION_IMAGE_FAILED = 'ERR_CREATION_IMAGE_FAILED';
    const ERR_DB_CONNECTION = 'ERR_DB_CONNECTION';
    const ERR_DELETION_FAILED = 'ERR_DELETION_FAILED';
    const ERR_DELETION_FILE_FAILED = 'ERR_DELETION_FILE_FAILED';
    const ERR_EDITION_NOT_FOUND = 'ERR_EDITION_NOT_FOUND';
    const ERR_EDITIONS_NOT_FOUND = 'ERR_EDITIONS_NOT_FOUND';
    const ERR_EDITIONS_SEARCH = 'ERR_EDITIONS_SEARCH';
    const ERR_ENV_FILES_DIR_MISSING = 'ERR_ENV_FILES_DIR_MISSING';
    const ERR_FILE_NOT_FOUND = 'ERR_FILE_NOT_FOUND';
    const ERR_FILE_TOO_LARGE = 'ERR_FILE_TOO_LARGE';
    const ERR_FORBIDDEN_FILE = 'ERR_FORBIDDEN_FILE';
    const ERR_GIFTS_NOT_FOUND = 'ERR_GIFTS_NOT_FOUND';
    const ERR_INVALID_AUTH = 'ERR_INVALID_AUTH';
    const ERR_INVALID_FILE = 'ERR_INVALID_FILE';
    const ERR_INVALID_FORMAT = 'ERR_INVALID_FORMAT';
    const ERR_INVALID_IMAGE = 'ERR_INVALID_IMAGE';
    const ERR_LOGIN_FAILED = 'ERR_LOGIN_FAILED';
    const ERR_LOGOUT_FAILED = 'ERR_LOGOUT_FAILED';
    const ERR_MISSING_PARAMS = 'ERR_MISSING_PARAMS';
    const ERR_ORIGIN_NOT_ALLOWED = 'ERR_ORIGIN_NOT_ALLOWED';
    const ERR_PLAYERS_NOT_FOUND = 'ERR_PLAYERS_NOT_FOUND';
    const ERR_RESET_PASSWORD_FAILED = 'ERR_RESET_PASSWORD_FAILED';
    const ERR_ROUTE_NOT_FOUND = 'ERR_ROUTE_NOT_FOUND';
    const ERR_SSE_GIFTS = 'ERR_SSE_GIFTS';
    const ERR_SSE_PLAYERS = 'ERR_SSE_PLAYERS';
    const ERR_UNAUTHORIZED_ACTION = 'ERR_UNAUTHORIZED_ACTION';
    const ERR_UNKNOWN_ENDPOINT = 'ERR_UNKNOWN_ENDPOINT';
    const ERR_UNKNOWN_ERROR = 'ERR_UNKNOWN_ERROR';
    const ERR_UPDATE_FAILED = 'ERR_UPDATE_FAILED';
    const ERR_UPDATE_PASSWORD_FAILED = 'ERR_UPDATE_PASSWORD_FAILED';
    const ERR_UPLOAD_FAILED = 'ERR_UPLOAD_FAILED';
    const ERR_USERS_NOT_FOUND = 'ERR_USERS_NOT_FOUND';
    const ERR_WEBP_CONVERSION_FAILED = 'ERR_WEBP_CONVERSION_FAILED';

    const MSG_CREATION_SUCCESS = 'MSG_CREATION_SUCCESS';
    const MSG_DELETION_SUCCESS = 'MSG_DELETION_SUCCESS';
    const MSG_LOGIN_SUCCESS = 'MSG_LOGIN_SUCCESS';
    const MSG_LOGOUT_SUCCESS = 'MSG_LOGOUT_SUCCESS';
    const MSG_RESET_PASSWORD_SUCCESS = 'MSG_RESET_PASSWORD_SUCCESS';
    const MSG_REWARD_SUCCESS = 'MSG_REWARD_SUCCESS';
    const MSG_UPDATE_SUCCESS = 'MSG_UPDATE_SUCCESS';

    const WRN_LAST_ADMIN = 'WRN_LAST_ADMIN';
    const WRN_USER_EXISTS = 'WRN_USER_EXISTS';

    // Codes HTTP
    private static array $httpCodes = [
        self::ERR_CREATION_FAILED => 400,
        self::ERR_CREATION_IMAGE_FAILED => 400,
        self::ERR_DB_CONNECTION => 500,
        self::ERR_DELETION_FAILED => 400,
        self::ERR_DELETION_FILE_FAILED => 500,
        self::ERR_EDITION_NOT_FOUND => 404,
        self::ERR_EDITIONS_NOT_FOUND => 400,
        self::ERR_EDITIONS_SEARCH => 400,
        self::ERR_ENV_FILES_DIR_MISSING => 500,
        self::ERR_FILE_NOT_FOUND => 404,
        self::ERR_FILE_TOO_LARGE => 400,
        self::ERR_FORBIDDEN_FILE => 403,
        self::ERR_GIFTS_NOT_FOUND => 400,
        self::ERR_INVALID_AUTH => 401,
        self::ERR_INVALID_FILE => 400,
        self::ERR_INVALID_FORMAT => 400,
        self::ERR_INVALID_IMAGE => 400,
        self::ERR_LOGIN_FAILED => 401,
        self::ERR_LOGOUT_FAILED => 401,
        self::ERR_MISSING_PARAMS => 400,
        self::ERR_ORIGIN_NOT_ALLOWED => 403,
        self::ERR_PLAYERS_NOT_FOUND => 400,
        self::ERR_RESET_PASSWORD_FAILED => 400,
        self::ERR_ROUTE_NOT_FOUND => 404,
        self::ERR_SSE_GIFTS => 500,
        self::ERR_SSE_PLAYERS => 500,
        self::ERR_UNAUTHORIZED_ACTION => 403,
        self::ERR_UNKNOWN_ENDPOINT => 404,
        self::ERR_UNKNOWN_ERROR => 500,
        self::ERR_UPDATE_FAILED => 400,
        self::ERR_UPDATE_PASSWORD_FAILED => 400,
        self::ERR_UPLOAD_FAILED => 400,
        self::ERR_USERS_NOT_FOUND => 400,
        self::ERR_WEBP_CONVERSION_FAILED => 400,

        self::WRN_LAST_ADMIN => 403,
        self::WRN_USER_EXISTS => 409
    ];

    // Messages
    private static array $messages = [
        self::ERR_CREATION_FAILED => 'Erreur lors de la création dans %s de %s : %s',
        self::ERR_CREATION_IMAGE_FAILED => 'Erreur lors de la création de l\'image dans %s de %s',
        self::ERR_DB_CONNECTION => 'Connexion impossible à la base de données',
        self::ERR_DELETION_FAILED => 'Erreur lors de la suppression dans %s de %s pour l\'id : %s',
        self::ERR_DELETION_FILE_FAILED => 'Erreur lors de la suppression du fichier dans %s de %s',
        self::ERR_EDITION_NOT_FOUND => 'Edition non trouvée dans %s de %s pour l\'id : %s',
        self::ERR_EDITIONS_NOT_FOUND => 'Erreur lors de la récupération des éditions dans %s de %s',
        self::ERR_EDITIONS_SEARCH => 'Erreur lors de la récupération des éditions dans %s de %s pour la recherche : %s',
        self::ERR_ENV_FILES_DIR_MISSING => 'Dossier serveur introuvable dans le fichier d\'environnement dans %s de %s',
        self::ERR_FILE_NOT_FOUND => 'Fichier introuvable : %s',
        self::ERR_FILE_TOO_LARGE => 'Fichier trop volumineux dans %s de %s',
        self::ERR_FORBIDDEN_FILE => 'Chemin de fichier non autorisé dans %s de %s',
        self::ERR_GIFTS_NOT_FOUND => 'Erreur lors de la récupération des cadeaux dans %s de %s',
        self::ERR_INVALID_AUTH => 'Authentification invalide dans %s de %s',
        self::ERR_INVALID_FILE => 'Fichier non renseigné dans %s de %s',
        self::ERR_INVALID_FORMAT => 'Type MIME invalide dans %s de %s',
        self::ERR_INVALID_IMAGE => 'Fichier invalide dans %s de %s',
        self::ERR_LOGIN_FAILED => 'Échec d\'authentification dans %s de %s pour le login : %s',
        self::ERR_LOGOUT_FAILED => 'Erreur lors de la déconnexion dans %s de %s pour le login : %s',
        self::ERR_MISSING_PARAMS => 'Paramètres manquants dans %s de %s',
        self::ERR_ORIGIN_NOT_ALLOWED => 'Origine non autorisée : %s',
        self::ERR_PLAYERS_NOT_FOUND => 'Erreur lors de la récupération des participants dans %s de %s',
        self::ERR_RESET_PASSWORD_FAILED => 'Erreur lors de la réinitialisation du mot de passe dans %s de %s pour l\'id : %s',
        self::ERR_ROUTE_NOT_FOUND => 'Route non trouvée : %s',
        self::ERR_SSE_GIFTS => 'Erreur SSE lors de la récupération des cadeaux dans %s de %s : %s',
        self::ERR_SSE_PLAYERS => 'Erreur SSE lors de la récupération des participants dans %s de %s : %s',
        self::ERR_UNAUTHORIZED_ACTION => 'Action non autorisée dans %s de %s',
        self::ERR_UNKNOWN_ENDPOINT => 'Endpoint inconnu : %s',
        self::ERR_UNKNOWN_ERROR => 'Exception levée dans %s de %s : %s',
        self::ERR_UPDATE_FAILED => 'Erreur lors de la modification dans %s de %s pour l\'id : %s - %s',
        self::ERR_UPDATE_PASSWORD_FAILED => 'Erreur lors de la modification du mot de passe dans %s de %s pour le login : %s',
        self::ERR_UPLOAD_FAILED => 'Envoi échoué dans le dossier de destination dans %s de %s',
        self::ERR_USERS_NOT_FOUND => 'Erreur lors de la récupération des utilisateurs dans %s de %s',
        self::ERR_WEBP_CONVERSION_FAILED => 'Conversion WebP échouée dans %s de %s',

        self::WRN_LAST_ADMIN => 'Il doit rester au moins un Super Administrateur actif',
        self::WRN_USER_EXISTS => 'L\'identifiant existe déjà : %s'
    ];

    /**
     * Récupère le message avec ses arguments
     */
    public static function message(string $code, mixed ...$args): string
    {
        $template = self::$messages[$code ?? self::ERR_UNKNOWN_ERROR];
        return empty($args) ? $template : sprintf($template, ...$args);
    }

    /**
     * Récupère le code d'erreur HTTP
     */
    public static function httpCode(string $code): int
    {
        return self::$httpCodes[$code] ?? 500;
    }
}
