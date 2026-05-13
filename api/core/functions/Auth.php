<?php
// Imports
require_once 'enums/EnumUserRole.php';

require_once 'services/UsersService.php';

class Auth
{
    private PDO $db;
    private UsersService $usersService;

    /**
     * Constructeur
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->usersService = new UsersService($db);
    }

    /**
     * Contrôle authentification et niveau utilisateur
     */
    public function checkAuthAndLevel(string $token, int $minimumLevel): UserOutputDTO
    {
        // Contrôle authentification
        $user = $this->usersService->checkAuth($token);

        if (!$user) {
            throw new Exception(MessageHelper::ERR_INVALID_AUTH);
        }

        // Contrôle du niveau utilisateur
        if ($user->level < $minimumLevel) {
            throw new Exception(MessageHelper::ERR_UNAUTHORIZED_ACTION);
        }

        return $user;
    }
}
