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
    public function checkAuth($login, $token)
    {
        try {
            $authorized = $this->service->checkAuth($login, $token);

            if ($authorized) {
                echo json_encode(['authorized' => $authorized]);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'ERR_INVALID_AUTH']);
            }
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
            $token = $this->service->connect($data);

            if ($token) {
                echo json_encode(['token' => $token]);
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
    public function disconnect($login)
    {
        try {
            $disconnected = $this->service->disconnect($login);

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
