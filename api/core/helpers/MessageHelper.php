<?php
class MessageHelper
{
    // TODO : ici, voir s'il est possible de tout réunir (code, http code et message) en un pour éviter les oublis
    // TODO : il y a pleins d'erreurs qui ne sont plus utilisées, ex : ERR_GIFTS_NOT_FOUND
    // TODO : vérifier que chaque erreur est dans le bon groupe
    // TODO : transférer les nouveaux codes dans le messageHelper front
    // TODO : tout tester dont les logs

    /*****************/
    /* Codes erreurs */
    /*****************/
    // Commun
    const ERR_CREATION_FAILED        = 'ERR_CREATION_FAILED';
    const ERR_CREATION_FOLDER_FAILED = 'ERR_CREATION_FOLDER_FAILED';
    const ERR_CREATION_IMAGE_FAILED  = 'ERR_CREATION_IMAGE_FAILED';
    const ERR_DB_CONNECTION          = 'ERR_DB_CONNECTION';
    const ERR_DELETION_FAILED        = 'ERR_DELETION_FAILED';
    const ERR_DELETION_FILE_FAILED   = 'ERR_DELETION_FILE_FAILED';
    const ERR_ENV_FILES_DIR_MISSING  = 'ERR_ENV_FILES_DIR_MISSING';
    const ERR_FILE_NOT_FOUND         = 'ERR_FILE_NOT_FOUND';
    const ERR_FILE_TOO_LARGE         = 'ERR_FILE_TOO_LARGE';
    const ERR_INVALID_DATE           = 'ERR_INVALID_DATE';
    const ERR_INVALID_FILE           = 'ERR_INVALID_FILE';
    const ERR_INVALID_FILE_FORMAT    = 'ERR_INVALID_FILE_FORMAT';
    const ERR_INVALID_ID             = 'ERR_INVALID_ID';
    const ERR_INVALID_IMAGE          = 'ERR_INVALID_IMAGE';
    const ERR_INVALID_LEVEL          = 'ERR_INVALID_LEVEL';
    const ERR_INVALID_LOCATION       = 'ERR_INVALID_LOCATION';
    const ERR_INVALID_NAME           = 'ERR_INVALID_NAME';
    const ERR_INVALID_PARAMETER      = 'ERR_INVALID_PARAMETER';
    const ERR_INVALID_PASSWORD       = 'ERR_INVALID_PASSWORD';
    const ERR_INVALID_PASSWORD_MATCH = 'ERR_INVALID_PASSWORD_MATCH';
    const ERR_INVALID_TIME           = 'ERR_INVALID_TIME';
    const ERR_INVALID_TOKEN          = 'ERR_INVALID_TOKEN';
    const ERR_MISSING_PARAMS         = 'ERR_MISSING_PARAMS';
    const ERR_ORIGIN_NOT_ALLOWED     = 'ERR_ORIGIN_NOT_ALLOWED';
    const ERR_POSITIVE_QUANTITY      = 'ERR_POSITIVE_QUANTITY';
    const ERR_POSITIVE_VALUE         = 'ERR_POSITIVE_VALUE';
    const ERR_ROUTE_NOT_FOUND        = 'ERR_ROUTE_NOT_FOUND';
    const ERR_UNKNOWN_ENDPOINT       = 'ERR_UNKNOWN_ENDPOINT';
    const ERR_UPDATE_FAILED          = 'ERR_UPDATE_FAILED';
    const ERR_UPLOAD_FAILED          = 'ERR_UPLOAD_FAILED';
    const ERR_WEBP_CONVERSION_FAILED = 'ERR_WEBP_CONVERSION_FAILED';

    const MSG_CREATION_SUCCESS = 'MSG_CREATION_SUCCESS';
    const MSG_DELETION_SUCCESS = 'MSG_DELETION_SUCCESS';
    const MSG_UPDATE_SUCCESS   = 'MSG_UPDATE_SUCCESS';

    // Editions
    const ERR_EDITION_NOT_FOUND  = 'ERR_EDITION_NOT_FOUND';
    const ERR_EDITION_FINISHED   = 'ERR_EDITION_FINISHED';
    const ERR_EDITIONS_NOT_FOUND = 'ERR_EDITIONS_NOT_FOUND';
    const ERR_EDITIONS_SEARCH    = 'ERR_EDITIONS_SEARCH';

    // Participants
    const ERR_PLAYER_GIVEAWAY   = 'ERR_PLAYER_GIVEAWAY';
    const ERR_PLAYER_NOT_FOUND  = 'ERR_PLAYER_NOT_FOUND';
    const ERR_PLAYER_POINTS     = 'ERR_PLAYER_POINTS';
    const ERR_PLAYERS_NOT_FOUND = 'ERR_PLAYERS_NOT_FOUND';

    // Cadeaux
    const ERR_GIFT_NOT_FOUND    = 'ERR_GIFT_NOT_FOUND';
    const ERR_GIFT_REWARD_COUNT = 'ERR_GIFT_REWARD_COUNT';
    const ERR_GIFTS_NOT_FOUND   = 'ERR_GIFTS_NOT_FOUND';

    // Récompenses
    const ERR_REWARD_NOT_FOUND = 'ERR_REWARD_NOT_FOUND';
    const ERR_REWARD_POINTS    = 'ERR_REWARD_POINTS';

    const MSG_REWARD_SUCCESS = 'MSG_REWARD_SUCCESS';

    // Utilisateurs
    const ERR_INVALID_ID_MATCH       = 'ERR_INVALID_ID_MATCH';
    const ERR_INVALID_AUTH           = 'ERR_INVALID_AUTH';
    const ERR_LOGIN_FAILED           = 'ERR_LOGIN_FAILED';
    const ERR_LOGOUT_FAILED          = 'ERR_LOGOUT_FAILED';
    const ERR_RESET_PASSWORD_FAILED  = 'ERR_RESET_PASSWORD_FAILED';
    const ERR_UNAUTHORIZED_ACTION    = 'ERR_UNAUTHORIZED_ACTION';
    const ERR_UPDATE_PASSWORD_FAILED = 'ERR_UPDATE_PASSWORD_FAILED';
    const ERR_USER_NOT_FOUND         = 'ERR_USER_NOT_FOUND';
    const ERR_USER_PASSWORD_INVALID  = 'ERR_USER_PASSWORD_INVALID';
    const ERR_USERS_NOT_FOUND        = 'ERR_USERS_NOT_FOUND';

    const MSG_LOGIN_SUCCESS          = 'MSG_LOGIN_SUCCESS';
    const MSG_LOGOUT_SUCCESS         = 'MSG_LOGOUT_SUCCESS';
    const MSG_RESET_PASSWORD_SUCCESS = 'MSG_RESET_PASSWORD_SUCCESS';

    const WRN_LAST_ADMIN  = 'WRN_LAST_ADMIN';
    const WRN_USER_EXISTS = 'WRN_USER_EXISTS';

    // SSE
    const ERR_SSE_GIFTS     = 'ERR_SSE_GIFTS';
    const ERR_SSE_PLAYERS   = 'ERR_SSE_PLAYERS';
    const ERR_UNKNOWN_ERROR = 'ERR_UNKNOWN_ERROR';

    /**************/
    /* Codes HTTP */
    /**************/
    private static array $httpCodes = [
        // Commun
        self::ERR_CREATION_FAILED        => 400,
        self::ERR_CREATION_FOLDER_FAILED => 500,
        self::ERR_CREATION_IMAGE_FAILED  => 400,
        self::ERR_DB_CONNECTION          => 500,
        self::ERR_DELETION_FAILED        => 400,
        self::ERR_DELETION_FILE_FAILED   => 500,
        self::ERR_ENV_FILES_DIR_MISSING  => 500,
        self::ERR_FILE_NOT_FOUND         => 404,
        self::ERR_FILE_TOO_LARGE         => 400,
        self::ERR_INVALID_DATE           => 400,
        self::ERR_INVALID_FILE           => 400,
        self::ERR_INVALID_FILE_FORMAT    => 400,
        self::ERR_INVALID_ID             => 400,
        self::ERR_INVALID_IMAGE          => 400,
        self::ERR_INVALID_LEVEL          => 400,
        self::ERR_INVALID_LOCATION       => 400,
        self::ERR_INVALID_NAME           => 400,
        self::ERR_INVALID_PARAMETER      => 400,
        self::ERR_INVALID_PASSWORD       => 400,
        self::ERR_INVALID_PASSWORD_MATCH => 400,
        self::ERR_INVALID_TIME           => 400,
        self::ERR_INVALID_TOKEN          => 401,
        self::ERR_MISSING_PARAMS         => 400,
        self::ERR_ORIGIN_NOT_ALLOWED     => 403,
        self::ERR_POSITIVE_QUANTITY      => 400,
        self::ERR_POSITIVE_VALUE         => 400,
        self::ERR_ROUTE_NOT_FOUND        => 404,
        self::ERR_UNKNOWN_ENDPOINT       => 404,
        self::ERR_UNKNOWN_ERROR          => 500,
        self::ERR_UPDATE_FAILED          => 400,
        self::ERR_UPLOAD_FAILED          => 400,
        self::ERR_WEBP_CONVERSION_FAILED => 400,

        // Editions
        self::ERR_EDITION_NOT_FOUND  => 404,
        self::ERR_EDITION_FINISHED   => 403,
        self::ERR_EDITIONS_NOT_FOUND => 400,
        self::ERR_EDITIONS_SEARCH    => 400,

        // Participants
        self::ERR_PLAYER_GIVEAWAY   => 400,
        self::ERR_PLAYER_NOT_FOUND  => 400,
        self::ERR_PLAYER_POINTS     => 400,
        self::ERR_PLAYERS_NOT_FOUND => 400,

        // Cadeaux
        self::ERR_GIFT_NOT_FOUND    => 400,
        self::ERR_GIFT_REWARD_COUNT => 400,
        self::ERR_GIFTS_NOT_FOUND   => 400,

        // Récompenses
        self::ERR_REWARD_NOT_FOUND => 400,
        self::ERR_REWARD_POINTS    => 400,

        // Utilisateurs
        self::ERR_INVALID_ID_MATCH       => 400,
        self::ERR_INVALID_AUTH           => 401,
        self::ERR_LOGIN_FAILED           => 401,
        self::ERR_LOGOUT_FAILED          => 401,
        self::ERR_RESET_PASSWORD_FAILED  => 400,
        self::ERR_UNAUTHORIZED_ACTION    => 403,
        self::ERR_UPDATE_PASSWORD_FAILED => 400,
        self::ERR_USER_NOT_FOUND         => 400,
        self::ERR_USER_PASSWORD_INVALID  => 401,
        self::ERR_USERS_NOT_FOUND        => 400,

        self::WRN_LAST_ADMIN  => 403,
        self::WRN_USER_EXISTS => 409,

        // SSE
        self::ERR_SSE_GIFTS   => 500,
        self::ERR_SSE_PLAYERS => 500
    ];

    /*****************/
    /* Messages logs */
    /*****************/
    private static array $messages = [
        // Commun
        self::ERR_CREATION_FAILED        => 'Erreur lors de la création en base de données',
        self::ERR_CREATION_FOLDER_FAILED => 'Erreur lors de la création du dossier des images',
        self::ERR_CREATION_IMAGE_FAILED  => 'Erreur lors de la création de l\'image',
        self::ERR_DB_CONNECTION          => 'Connexion impossible à la base de données',
        self::ERR_DELETION_FAILED        => 'Erreur lors de la suppression en base de données',
        self::ERR_DELETION_FILE_FAILED   => 'Erreur lors de la suppression du fichier sur le serveur',
        self::ERR_ENV_FILES_DIR_MISSING  => 'Dossier serveur introuvable dans le fichier d\'environnement',
        self::ERR_FILE_NOT_FOUND         => 'Le fichier est introuvable',
        self::ERR_FILE_TOO_LARGE         => 'Le fichier est trop volumineux',
        self::ERR_INVALID_FILE           => 'Le fichier est invalide',
        self::ERR_INVALID_DATE           => 'Le format de la date est invalide',
        self::ERR_INVALID_FILE_FORMAT    => 'Le type MIME est invalide',
        self::ERR_INVALID_ID             => 'L\'identifiant est obligatoire',
        self::ERR_INVALID_IMAGE          => 'L\'image est invalide',
        self::ERR_INVALID_LOCATION       => 'Le lieu est obligatoire',
        self::ERR_INVALID_LEVEL          => 'Le niveau est invalide',
        self::ERR_INVALID_NAME           => 'Le nom est obligatoire',
        self::ERR_INVALID_PARAMETER      => 'Paramètre d\'entrée invalide',
        self::ERR_INVALID_PASSWORD       => 'Le mot de passe est obligatoire',
        self::ERR_INVALID_PASSWORD_MATCH => 'Les mots de passe ne correspondent pas',
        self::ERR_INVALID_TIME           => 'Le format de l\'heure est invalide',
        self::ERR_INVALID_TOKEN          => 'Le token de connexion est invalide',
        self::ERR_MISSING_PARAMS         => 'Paramètres manquants',
        self::ERR_ORIGIN_NOT_ALLOWED     => 'Origine non autorisée',
        self::ERR_POSITIVE_QUANTITY      => 'La quantité doit être supérieure à 0',
        self::ERR_POSITIVE_VALUE         => 'La valeur doit être supérieure à 0',
        self::ERR_ROUTE_NOT_FOUND        => 'Route non trouvée',
        self::ERR_UNKNOWN_ENDPOINT       => 'Endpoint inconnu',
        self::ERR_UNKNOWN_ERROR          => 'Erreur inconnue',
        self::ERR_UPDATE_FAILED          => 'Erreur lors de la modification en base de données',
        self::ERR_UPLOAD_FAILED          => 'Envoi échoué dans le dossier de destination',
        self::ERR_WEBP_CONVERSION_FAILED => 'Conversion WebP échouée',

        // Editions
        self::ERR_EDITION_NOT_FOUND  => 'Edition lors de la récupération de l\'édition',
        self::ERR_EDITION_FINISHED   => 'Edition terminée ou introuvable',
        self::ERR_EDITIONS_NOT_FOUND => 'Erreur lors de la récupération des éditions',
        self::ERR_EDITIONS_SEARCH    => 'Erreur lors de la recherche des éditions',

        // Participants
        self::ERR_PLAYER_GIVEAWAY   => 'Le don de points n\'est pas correctement renseigné',
        self::ERR_PLAYER_NOT_FOUND  => 'Erreur lors de la récupération du participant',
        self::ERR_PLAYER_POINTS     => 'Le nombre de points doit être supérieur ou égal à 0',
        self::ERR_PLAYERS_NOT_FOUND => 'Erreur lors de la récupération des participants',

        // Cadeaux
        self::ERR_GIFT_NOT_FOUND    => 'Erreur lors de la récupération du cadeau',
        self::ERR_GIFT_REWARD_COUNT => 'La quantité doit être supérieure ou égale au nombre de cadeaux déjà attribués',
        self::ERR_GIFTS_NOT_FOUND   => 'Erreur lors de la récupération des cadeaux',

        // Récompenses
        self::ERR_REWARD_NOT_FOUND => 'Erreur lors de la récupération de la récompense',
        self::ERR_REWARD_POINTS    => 'Le nombre de points est insuffisant pour le cadeau',

        // Utilisateurs
        self::ERR_INVALID_AUTH           => 'Authentification invalide',
        self::ERR_INVALID_ID_MATCH       => 'Un utilisateur ne peut pas se supprimer',
        self::ERR_LOGIN_FAILED           => 'Échec d\'authentification',
        self::ERR_LOGOUT_FAILED          => 'Erreur lors de la déconnexion',
        self::ERR_RESET_PASSWORD_FAILED  => 'Erreur lors de la réinitialisation du mot de passe',
        self::ERR_UNAUTHORIZED_ACTION    => 'Action non autorisée',
        self::ERR_UPDATE_PASSWORD_FAILED => 'Erreur lors de la modification du mot de passe',
        self::ERR_USER_NOT_FOUND         => 'Erreur lors de la récupération de l\'utilisateur',
        self::ERR_USER_PASSWORD_INVALID  => 'Le mot de passe saisi est incorrect',
        self::ERR_USERS_NOT_FOUND        => 'Erreur lors de la récupération des utilisateurs',

        self::WRN_LAST_ADMIN  => 'Il doit rester au moins un Super Administrateur actif',
        self::WRN_USER_EXISTS => 'L\'identifiant existe déjà',

        // SSE
        self::ERR_SSE_GIFTS   => 'Erreur SSE lors de la récupération des cadeaux',
        self::ERR_SSE_PLAYERS => 'Erreur SSE lors de la récupération des participants'
    ];

    /**
     * Récupère le message avec ses arguments
     */
    public static function message(string $code, string $class, string $function, array $data): string
    {
        $template = self::$messages[$code] ?? self::$messages[self::ERR_UNKNOWN_ERROR];
        $context = count($data) ? ' : [' . implode(', ', $data) . ']' : '';
        $location = match (true) {
            $class && $function => " [{$class} > {$function}]",
            $class              => " [{$class}]",
            default             => '',
        };

        return sprintf('[%s]%s %s%s', $code, $location, $template, $context);
    }

    /**
     * Récupère le code d'erreur HTTP
     */
    public static function httpCode(string $code): int
    {
        return self::$httpCodes[$code] ?? 500;
    }
}
