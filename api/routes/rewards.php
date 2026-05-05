<?php
/** @var PDO $db */

// Imports
require_once 'controllers/RewardsController.php';

/**
 * Insertion d'un enregistrement
 */
$router->post('/rewards/create/gift/:idGift/player/:idPlayer', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $idGift = DataHelper::parseIntParam($params['idGift']);
    $idPlayer = DataHelper::parseIntParam($params['idPlayer']);

    // Appel contrôleur
    (new RewardsController($db))->createReward($token, $idGift, $idPlayer);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/rewards/delete/:idReward', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $idReward = DataHelper::parseIntParam($params['idReward']);

    // Appel contrôleur
    (new RewardsController($db))->deleteReward($token, $idReward);
});
