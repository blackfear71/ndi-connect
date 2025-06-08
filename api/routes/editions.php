<?php
require_once 'core/Database.php';
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

$router->post('/editions/search', function () use ($db) {
    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new EditionsController($db))->getSearchEditions($data['search']);
});

$router->post('/editions/create', function () use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? null));

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new EditionsController($db))->createEdition($token, $data);
});

$router->patch('/editions/update/:id', function ($params) use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? null));

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new EditionsController($db))->updateEdition($token, $params['id'], $data);
});

$router->delete('/editions/delete/:id', function ($params) use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? null));

    // Appel contrôleur
    (new EditionsController($db))->deleteEdition($token, $params['id']);
});
