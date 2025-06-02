<?php
require_once 'core/Database.php';
require_once 'controllers/EditionsController.php';

$database = new Database();
$db = $database->getConnection();

$router->get('/editions/all', function () use ($db) {
    // Appel contrôleur
    (new EditionsController($db))->index();
});

$router->get('/editions/find/:id', function ($params) use ($db) {
    // Appel contrôleur
    (new EditionsController($db))->show($params['id']);
});

$router->post('/editions/create', function () use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? null));

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new EditionsController($db))->create($token, $data);
});

$router->patch('/editions/update/:id', function ($params) use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? null));

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new EditionsController($db))->update($token, $params['id'], $data);
});

$router->delete('/editions/delete/:id', function ($params) use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? null));

    // Appel contrôleur
    (new EditionsController($db))->delete($token, $params['id']);
});
