<?php
require_once 'controllers/SseController.php';

$database = new Database();
$db = $database->getConnection();

$router->get('/sse/edition/:id', function ($params) use($db) {
    // Appel contrôleur
    (new SseController($db))->getSseEdition($params['id']);
});
