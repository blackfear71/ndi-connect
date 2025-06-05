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
    public function index()
    {
        try {
            $index = $this->service->index();

            echo json_encode([
                'status' => 'success',
                'message' => '',
                'data' => $index
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
    public function show($id)
    {
        try {
            $show = $this->service->show($id);

            if ($show) {
                echo json_encode([
                    'status' => 'success',
                    'message' => '',
                    'data' => $show
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
    public function create($token, $data)
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
            $created = $this->service->create($user['login'], $data);

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
    public function update($token, $id, $data)
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
            $updated = $this->service->update($id, $user['login'], $data);

            if ($updated) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'MSG_UPDATE_SUCCESS',
                    'data' => null
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
    public function delete($token, $id)
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
            $deleted = $this->service->delete($id, $user['login']);

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
