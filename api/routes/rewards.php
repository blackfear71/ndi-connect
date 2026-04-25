<?php
// Imports
require_once 'controllers/RewardsController.php';

/**
 * Insertion d'un enregistrement
 */
$router->post('/rewards/reward/:idEdition', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new RewardsController($db))->createReward($token, $params['idEdition'], $data);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/rewards/delete/:idEdition/:idReward', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new RewardsController($db))->deleteReward($token, $params['idEdition'], $params['idReward']);
});
