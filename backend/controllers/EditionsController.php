<?php
require_once 'services/EditionsService.php';

class EditionsController
{
    private $service;

    public function __construct($db)
    {
        $this->service = new EditionsController($db);
        
        file_put_contents(__DIR__ . '/debug-router.log', "-----------------\nCONSTR\n", FILE_APPEND);
    }

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

    public function create($data)
    {
        try {
            $created = $this->service->create($data);

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

    public function update($id, $data)
    {
        try {
            $updated = $this->service->update($id, $data);

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

    public function delete($id)
    {
        try {
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
