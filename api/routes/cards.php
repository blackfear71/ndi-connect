<?php

/** @var PDO $db */

// Imports
require_once 'controllers/CardsController.php';

/**
 * Lecture des enregistrements des éditions non terminées
 */
$router->get('/cards/all', function () use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new CardsController($db))->getAllCards($token);
});

/**
 * Lecture de l'état d'un code de carte d'une édition
 */
$router->get('/cards/edition/:editionId/code/:code', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $editionId = DataHelper::parseIntParam($params['editionId']);
    $code = $params['code'];

    // Appel contrôleur
    (new CardsController($db))->getCardStatus($token, $editionId, $code);
});

/**
 * Suppression physique d'un enregistrement
 */
$router->delete('/cards/delete/:cardId', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $cardId = DataHelper::parseIntParam($params['cardId']);

    // Appel contrôleur
    (new CardsController($db))->deleteCard($token, $cardId);
});
