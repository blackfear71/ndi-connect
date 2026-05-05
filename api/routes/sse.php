<?php
/** @var PDO $db */

// Imports
require_once 'controllers/SseController.php';

/**
 * Flux SSE de récupération des participants et cadeaux d'une édition
 */
$router->get('/sse/edition/:idEdition', function (array $params) use ($db): void {
    // Paramètres
    $idEdition = DataHelper::parseIntParam($params['idEdition']);

    // Appel contrôleur
    (new SseController($db))->getSseEdition($idEdition);
});
