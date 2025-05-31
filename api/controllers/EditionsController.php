<?php
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
                echo json_encode(['error' => 'Edition non trouvé']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function create($login, $token, $data)
    {
        try {
            // Contrôle autorisation
            if (!$this->usersService->checkAuth($login, $token)) {
                http_response_code(401);
                echo json_encode(['error' => 'Action non autorisée']);
                exit;
            }

            // Traitement
            $created = $this->service->create($login, $data);

            if ($created) {
                echo json_encode($created);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Edition non créée']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function update($id, $login, $token, $data)
    {
        try {
            // Contrôle autorisation
            if (!$this->usersService->checkAuth($login, $token)) {
                http_response_code(401);
                echo json_encode(['error' => 'Action non autorisée']);
                exit;
            }

            // Traitement
            $updated = $this->service->update($id, $login, $data);

            if ($updated) {
                echo json_encode($updated);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Edition non mise à jour']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function delete($id, $login, $token)
    {
        try {
            // Contrôle autorisation
            if (!$this->usersService->checkAuth($login, $token)) {
                http_response_code(401);
                echo json_encode(['error' => 'Action non autorisée']);
                exit;
            }

            // Traitement
            $deleted = $this->service->delete($id);

            if ($deleted) {
                echo json_encode(['deleted' => $deleted]);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Edition non supprimée']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
