<?php

/** @var PDO $db */

// Imports
require_once 'controllers/PlayersController.php';

/**
 * Lecture des enregistrements d'une édition
 */
$router->get('/players/edition/:idEdition', function (array $params) use ($db): void {
    // Paramètres
    $idEdition = DataHelper::parseIntParam($params['idEdition']);

    // Appel contrôleur
    (new PlayersController($db))->getEditionPlayers($idEdition);
});

/**
 * Insertion d'un enregistrement
 */
$router->post('/players/create/edition/:idEdition', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $idEdition = DataHelper::parseIntParam($params['idEdition']);

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new PlayersController($db))->createPlayer($token, $idEdition, $data);
});

/**
 * Modification d'un enregistrement
 */
$router->patch('/players/update/:idPlayer', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $idPlayer = DataHelper::parseIntParam($params['idPlayer']);

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new PlayersController($db))->updatePlayer($token, $idPlayer, $data);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/players/delete/:idPlayer', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $idPlayer = DataHelper::parseIntParam($params['idPlayer']);

    // Appel contrôleur
    (new PlayersController($db))->deletePlayer($token, $idPlayer);
});
