<?php
require_once 'controllers/EditionsController.php';

$database = new Database();
$db = $database->getConnection();

$router->get('/editions/all', function () use ($db) {
    // Appel contrôleur
    (new EditionsController($db))->getAllEditions();
});

$router->get('/editions/find/:id', function ($params) use ($db) {
    // Appel contrôleur
    (new EditionsController($db))->getEdition($params['id']);
});

$router->get('/editions/events', function () use ($db) {
    // Appel contrôleur
    (new EditionsController($db))->getEditionStream($_GET['id'] ?? null);
});

$router->post('/editions/search', function () use ($db) {
    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new EditionsController($db))->getSearchEditions($data['search']);
});

$router->post('/editions/create', function () use ($db) {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new EditionsController($db))->createEdition($token, $_POST, $_FILES);
});

$router->post('/editions/update/:id', function ($params) use ($db) {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new EditionsController($db))->updateEdition($token, $params['id'], $_POST, $_FILES);
});

$router->delete('/editions/delete/:id', function ($params) use ($db) {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new EditionsController($db))->deleteEdition($token, $params['id']);
});
