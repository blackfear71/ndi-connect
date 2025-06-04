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
            echo json_encode($index);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
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
                echo json_encode($show);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'ERR_EDITION_NOT_FOUND']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
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
                echo json_encode(['error' => 'ERR_UNAUTHORIZED_ACTION']);
                exit;
            }

            // Insertion d'un enregistrement
            $created = $this->service->create($user['login'], $data);

            if ($created) {
                echo json_encode(['message' => 'MSG_CREATION_SUCCESS']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ERR_CREATION_FAILED']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
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
                echo json_encode(['error' => 'ERR_UNAUTHORIZED_ACTION']);
                exit;
            }

            // Modification d'un enregistrement
            $updated = $this->service->update($id, $user['login'], $data);

            if ($updated) {
                echo json_encode(['message' => 'MSG_UPDATE_SUCCESS']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ERR_UPDATE_FAILED']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
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
                echo json_encode(['error' => 'ERR_UNAUTHORIZED_ACTION']);
                exit;
            }

            // Suppression logique d'un enregistrement
            $deleted = $this->service->delete($id, $user['login']);

            if ($deleted) {
                echo json_encode(['message' => 'MSG_DELETION_SUCCESS']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'ERR_DELETION_FAILED']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
