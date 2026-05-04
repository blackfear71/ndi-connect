<?php

/** @var PDO $db */

// Imports
require_once 'controllers/GiftsController.php';

/**
 * Lecture des enregistrements d'une édition
 */
$router->get('/gifts/edition/:idEdition', function (array $params) use ($db): void {
    // Appel contrôleur
    (new GiftsController($db))->getEditionGifts($params['idEdition']);
});

/**
 * Insertion d'un enregistrement
 */
$router->post('/gifts/create/:idEdition', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $idEdition = DataHelper::parseIntParam($params['idEdition']);

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new GiftsController($db))->createGift($token, $idEdition, $data);
});

/**
 * Modification d'un enregistrement
 */
$router->patch('/gifts/update/:idEdition/:idGift', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $idEdition = DataHelper::parseIntParam($params['idEdition']);
    $idGift = DataHelper::parseIntParam($params['idGift']);

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new GiftsController($db))->updateGift($token, $idEdition, $idGift, $data);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/gifts/delete/:idEdition/:idGift', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $idEdition = DataHelper::parseIntParam($params['idEdition']);
    $idGift = DataHelper::parseIntParam($params['idGift']);

    // Appel contrôleur
    (new GiftsController($db))->deleteGift($token, $idEdition, $idGift);
});
