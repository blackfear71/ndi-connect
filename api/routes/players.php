<?php
require_once 'core/Database.php';
require_once 'controllers/PlayersController.php';

$database = new Database();
$db = $database->getConnection();

$router->post('/players/create/:idEdition', function ($params) use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? null));

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new PlayersController($db))->createPlayer($token, $params['idEdition'], $data);
});

$router->patch('/players/update/:idEdition/:idPlayer', function ($params) use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? null));

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new PlayersController($db))->updatePlayer($token, $params['idEdition'], $params['idPlayer'], $data);
});

$router->delete('/players/delete/:idEdition/:idPlayer', function ($params) use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? null));

    // Appel contrôleur
    (new PlayersController($db))->deletePlayer($token, $params['idEdition'], $params['idPlayer']);
});
