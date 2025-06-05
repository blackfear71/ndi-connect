<?php
require_once 'enums/UserRole.php';

require_once 'services/EditionsService.php';
require_once 'services/UsersService.php';

class EditionsController
{
    private $service;
    private $usersService;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->service = new EditionsService($db);
        $this->usersService = new UsersService($db);
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllEditions()
    {
        try {
            $editions = $this->service->getAllEditions();

            echo json_encode([
                'status' => 'success',
                'message' => '',
                'data' => $editions
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ]);
        }
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getEdition($id)
    {
        try {
            $edition = $this->service->getEdition($id);

            if ($edition) {
                echo json_encode([
                    'status' => 'success',
                    'message' => '',
                    'data' => $edition
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ERR_EDITION_NOT_FOUND',
                    'data' => null
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ]);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createEdition($token, $data)
    {
        try {
            // Contrôle autorisation
            $user = $this->usersService->checkAuth($token);

            if (!$user || $user['level'] < UserRole::SUPERADMIN) {
                http_response_code(401);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ERR_UNAUTHORIZED_ACTION',
                    'data' => null
                ]);
                exit;
            }

            // Insertion d'un enregistrement
            $created = $this->service->createEdition($user['login'], $data);

            if ($created) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'MSG_CREATION_SUCCESS',
                    'data' => null
                ]);
            } else {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ERR_CREATION_FAILED',
                    'data' => null
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateEdition($token, $id, $data)
    {
        try {
            // Contrôle autorisation
            $user = $this->usersService->checkAuth($token);

            if (!$user || $user['level'] < UserRole::SUPERADMIN) {
                http_response_code(401);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ERR_UNAUTHORIZED_ACTION',
                    'data' => null
                ]);
                exit;
            }

            // Modification d'un enregistrement
            $edition = $this->service->updateEdition($id, $user['login'], $data);

            if ($edition) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'MSG_UPDATE_SUCCESS',
                    'data' => $edition
                ]);
            } else {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ERR_UPDATE_FAILED',
                    'data' => null
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteEdition($token, $id)
    {
        try {
            // Contrôle autorisation
            $user = $this->usersService->checkAuth($token);

            if (!$user || $user['level'] < UserRole::SUPERADMIN) {
                http_response_code(401);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ERR_UNAUTHORIZED_ACTION',
                    'data' => null
                ]);
                exit;
            }

            // Suppression logique d'un enregistrement
            $deleted = $this->service->deleteEdition($id, $user['login']);

            if ($deleted) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'MSG_DELETION_SUCCESS',
                    'data' => null
                ]);
            } else {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ERR_DELETION_FAILED',
                    'data' => null
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ]);
        }
    }
}
