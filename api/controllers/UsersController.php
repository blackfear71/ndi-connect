<?php
require_once 'core/ResponseHelper.php';

require_once 'services/UsersService.php';

class UsersController
{
    private $db;
    private $service;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->db = $db;
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
                ResponseHelper::error('ERR_INVALID_AUTH', 401, 'Authentification incorrecte');
                exit;
            }

            // Autorisation valide & token
            $user['authorized'] = true;
            $user['token'] = $token;

            ResponseHelper::success($user);
        } catch (Exception $e) {
            // Exception levée
            Logger::log('Exception levée dans checkAuth de UsersController : ' . $e->getMessage(), 'ERROR');
            ResponseHelper::error($e->getMessage(), 500);
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
                ResponseHelper::error('ERR_LOGIN_FAILED', 401, 'Utilisateur non trouvé (connect) : ' . $data['login']);
                exit;
            }

            ResponseHelper::success($user);
        } catch (Exception $e) {
            // Exception levée
            Logger::log('Exception levée dans connect de UsersController : ' . $e->getMessage(), 'ERROR');
            ResponseHelper::error($e->getMessage(), 500);
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
                ResponseHelper::error('ERR_UNAUTHORIZED_ACTION', 401, 'Utilisateur non trouvé (disconnect)');
                exit;
            }

            // Déconnexion utilisateur
            $disconnected = $this->service->disconnect($user['login']);

            if ($disconnected) {
                ResponseHelper::success(['disconnected' => $disconnected]);
            } else {
                // Échec de la déconnexion
                ResponseHelper::error('ERR_LOGOUT_FAILED', 401, 'Erreur lors de la déconnexion de : ' . $user['login']);
            }
        } catch (Exception $e) {
            // Exception levée
            Logger::log('Exception levée dans disconnect de UsersController : ' . $e->getMessage(), 'ERROR');
            ResponseHelper::error($e->getMessage(), 500);
        }
    }
}
