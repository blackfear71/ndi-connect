<?php
require_once 'core/functions/Auth.php';

require_once 'enums/UserRole.php';

require_once 'services/UsersService.php';

class UsersController
{
    private const controllerName = 'UsersController';

    private $db;
    private $auth;
    private $service;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->db = $db;
        $this->auth = new Auth($db);
        $this->service = new UsersService($db);
    }

    /**
     * Contrôle authentification
     */
    public function checkAuth($token)
    {
        try {
            // Contrôle autorisation
            $user = $this->service->checkAuth($token);

            if (!$user) {
                // Authentification incorrecte
                ResponseHelper::error(
                    'ERR_INVALID_AUTH',
                    401,
                    'Authentification incorrecte'
                );
                exit;
            }

            // Autorisation valide & token
            $user['authorized'] = true;
            $user['token'] = $token;

            ResponseHelper::success($user);
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllUsers($token)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $this->auth->checkAuthAndLevel($token, UserRole::SUPERADMIN->value, __FUNCTION__, self::controllerName);

            // Lecture de tous les enregistrements
            $users = $this->service->getAllUsers();

            if ($users !== null) {
                // Succès
                ResponseHelper::success($users);
            } else {
                // Échec de la lecture
                ResponseHelper::error(
                    'ERR_USERS_NOT_FOUND',
                    400,
                    'Erreur lors de la récupération des utilisateurs'
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Connexion utilisateur
     */
    public function connect($data)
    {
        try {
            // Connexion utilisateur
            $user = $this->service->connect($data);

            if (!$user) {
                // Utilisateur non trouvé
                ResponseHelper::error(
                    'ERR_LOGIN_FAILED',
                    401,
                    'Utilisateur non trouvé (connect) : ' . $data['login']
                );
                exit;
            }

            ResponseHelper::success($user);
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Déconnexion utilisateur
     */
    public function disconnect($token)
    {
        try {
            // Contrôle autorisation
            $user = $this->service->checkAuth($token);

            if (!$user) {
                // Utilisateur non trouvé
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    401,
                    'Utilisateur non trouvé (disconnect)'
                );
                exit;
            }

            // Déconnexion utilisateur
            $disconnected = $this->service->disconnect($user['login']);

            if ($disconnected) {
                ResponseHelper::success(['disconnected' => $disconnected]);
            } else {
                // Échec de la déconnexion
                ResponseHelper::error(
                    'ERR_LOGOUT_FAILED',
                    401,
                    'Erreur lors de la déconnexion de : ' . $user['login']
                );
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }
}
