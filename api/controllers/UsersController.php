<?php
require_once 'services/UsersService.php';

class UsersController
{
    private $service;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
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
                http_response_code(401);
                echo json_encode(['error' => 'ERR_INVALID_AUTH']);
                exit;
            }

            // Autorisation valide & token
            $user['authorized'] = true;
            $user['token'] = $token;

            echo json_encode($user);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Connexion utilisateur
     */
    public function connect($data)
    {
        try {
            $user = $this->service->connect($data);

            if ($user) {
                echo json_encode($user);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'ERR_LOGIN_FAILED']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
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
                http_response_code(401);
                echo json_encode(['error' => 'ERR_UNAUTHORIZED_ACTION']);
                exit;
            }

            // Déconnexion utilisateur
            $disconnected = $this->service->disconnect($user['login']);

            if ($disconnected) {
                echo json_encode(['disconnected' => $disconnected]);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'ERR_LOGOUT_FAILED']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
