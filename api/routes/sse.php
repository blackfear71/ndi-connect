<?php
/** @var PDO $db */

// Imports
require_once 'controllers/SseController.php';

/**
 * Flux SSE de récupération des participants et cadeaux d'une édition
 */
$router->get('/sse/edition/:id', function (array $params) use ($db): void {
    // Appel contrôleur
    (new SseController($db))->getSseEdition($params['id']);
});
