<?php
require_once 'enums/UserRole.php';

require_once 'services/UsersService.php';

class Auth
{
    private const helperName = 'AuthHelper';

    private $service;

    /**
     * Constructeur
     */
    public function __construct($db)
    {
        $this->service = new UsersService($db);
    }

    /**
     * Contrôle authentification et niveau utilisateur
     */
    public function checkAuthAndLevel($token, $minimumLevel, $method, $controller)
    {
        try {
            // Contrôle authentification
            $user = $this->service->checkAuth($token);

            if (!$user) {
                ResponseHelper::error(
                    'ERR_INVALID_AUTH',
                    401,
                    "Authentification invalide dans $method de $controller"
                );
                exit;
            }

            // Contrôle du niveau utilisateur
            if ($user['level'] < $minimumLevel) {
                // Action non autorisée
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    403,
                    "Action non autorisée dans $method de $controller"
                );
                exit;
            }

            return $user;
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::helperName . ' : ' . $e->getMessage() . '',
            );
        }
    }
}
