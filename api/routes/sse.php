<?php
require_once 'controllers/SseController.php';

$database = new Database();
$db = $database->getConnection();

$router->get('/sse/edition', function () use($db) {
    // Appel contrôleur
    (new SseController($db))->getSseEdition($_GET['id'] ?? null);
});
