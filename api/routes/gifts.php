<?php
require_once 'core/Database.php';

require_once 'controllers/GiftsController.php';

$database = new Database();
$db = $database->getConnection();

$router->post('/gifts/create/:idEdition', function ($params) use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? null));

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new GiftsController($db))->createGift($token, $params['idEdition'], $data);
});

$router->patch('/gifts/update/:idEdition/:idGift', function ($params) use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? null));

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new GiftsController($db))->updateGift($token, $params['idEdition'], $params['idGift'], $data);
});

$router->delete('/gifts/delete/:idEdition/:idGift', function ($params) use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? null));

    // Appel contrôleur
    (new GiftsController($db))->deleteGift($token, $params['idEdition'], $params['idGift']);
});
