<?php
/** @var PDO $db */

// Imports
require_once 'controllers/PlayersController.php';

/**
 * Lecture des enregistrements d'une édition
 */
$router->get('/players/edition/:idEdition', function (array $params) use ($db): void {
    // Appel contrôleur
    (new PlayersController($db))->getEditionPlayers($params['idEdition']);
});

/**
 * Insertion d'un enregistrement
 */
$router->post('/players/create/:idEdition', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new PlayersController($db))->createPlayer($token, $params['idEdition'], $data);
});

/**
 * Modification d'un enregistrement
 */
$router->patch('/players/update/:idEdition/:idPlayer', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new PlayersController($db))->updatePlayer($token, $params['idEdition'], $params['idPlayer'], $data);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/players/delete/:idEdition/:idPlayer', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new PlayersController($db))->deletePlayer($token, $params['idEdition'], $params['idPlayer']);
});
