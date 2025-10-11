<?php
require_once 'core/Database.php';

require_once 'controllers/RewardsController.php';

$database = new Database();
$db = $database->getConnection();

$router->post('/rewards/reward/:idEdition', function ($params) use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? ''));

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new RewardsController($db))->createReward($token, $params['idEdition'], $data);
});

$router->delete('/rewards/delete/:idEdition/:idReward', function ($params) use ($db) {
    // Headers
    $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
    $token = trim(str_replace('Bearer', '', $headers['authorization'] ?? ''));

    // Appel contrôleur
    (new RewardsController($db))->deleteReward($token, $params['idEdition'], $params['idReward']);
});
