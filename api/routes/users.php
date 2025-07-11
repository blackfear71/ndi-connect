<?php
require_once 'core/Database.php';

require_once 'controllers/UsersController.php';

$database = new Database();
$db = $database->getConnection();

$router->get('/users/checkAuth', function () use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? null));

    // Appel contrôleur
    (new UsersController($db))->checkAuth($token);
});

$router->post('/users/connect', function () use ($db) {
    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new UsersController($db))->connect($data);
});

$router->post('/users/disconnect', function () use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? null));

    // Appel contrôleur
    (new UsersController($db))->disconnect($token);
});
