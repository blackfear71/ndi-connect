<?php
/** @var PDO $db */

// Imports
require_once 'controllers/RewardsController.php';

/**
 * Insertion d'un enregistrement
 */
$router->post('/rewards/create', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    // TODO : j'ai supprimer $params['idEdition'] en 2ème param, nettoyer le react et s'assurer que c'est bon
    (new RewardsController($db))->createReward($token, $data);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/rewards/delete/:idReward', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    // TODO : j'ai supprimer $params['idEdition'] en 2ème param, nettoyer le react et s'assurer que c'est bon
    (new RewardsController($db))->deleteReward($token, $params['idReward']);
});
