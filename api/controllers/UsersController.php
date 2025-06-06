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
                Logger::log('Authentification incorrecte', 'WARNING');
                http_response_code(401);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ERR_INVALID_AUTH',
                    'data' => null
                ]);
                exit;
            }

            // Autorisation valide & token
            $user['authorized'] = true;
            $user['token'] = $token;

            echo json_encode([
                'status' => 'success',
                'message' => '',
                'data' => $user
            ]);
        } catch (Exception $e) {
            Logger::log('Exception levée dans checkAuth de UsersController : ' . $e->getMessage(), 'ERROR');
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ]);
        }
    }

    /**
     * Connexion utilisateur
     */
    public function connect($data)
    {
        try {
            $user = $this->service->connect($data);

            if (!$user) {
                Logger::log('Utilisateur non trouvé (connect) : ' . json_encode($data), 'ERROR');
                http_response_code(401);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ERR_LOGIN_FAILED',
                    'data' => null
                ]);
                exit;
            }

            echo json_encode([
                'status' => 'success',
                'message' => '',
                'data' => $user
            ]);
        } catch (Exception $e) {
            Logger::log('Exception levée dans connect de UsersController : ' . $e->getMessage(), 'ERROR');
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ]);
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
                Logger::log('Utilisateur non trouvé (disconnect)', 'ERROR');
                http_response_code(401);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ERR_UNAUTHORIZED_ACTION',
                    'data' => null
                ]);
                exit;
            }

            // Déconnexion utilisateur
            $disconnected = $this->service->disconnect($user['login']);

            if ($disconnected) {
                echo json_encode([
                    'status' => 'success',
                    'message' => '',
                    'data' => ['disconnected' => $disconnected]
                ]);
            } else {
                Logger::log('Erreur lors de la déconnexion de : ' . $user['login'], 'ERROR');
                http_response_code(401);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ERR_LOGOUT_FAILED',
                    'data' => null
                ]);
            }
        } catch (Exception $e) {
            Logger::log('Exception levée dans disconnect de UsersController : ' . $e->getMessage(), 'ERROR');
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ]);
        }
    }
}
