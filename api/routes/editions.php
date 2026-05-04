<?php

/** @var PDO $db */

// Imports
require_once 'controllers/EditionsController.php';

/**
 * Lecture de tous les enregistrements
 */
$router->get('/editions/all', function () use ($db): void {
    // Appel contrôleur
    (new EditionsController($db))->getAllEditions();
});

/**
 * Lecture d'un enregistrement
 */
$router->get('/editions/edition/:idEdition', function (array $params) use ($db): void {
    // Paramètres
    $idEdition = DataHelper::parseIntParam($params['idEdition']);

    // Appel contrôleur
    (new EditionsController($db))->getEdition($idEdition);
});

/**
 * Lecture des éditions recherchées
 */
$router->post('/editions/search', function () use ($db): void {
    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new EditionsController($db))->getSearchEditions($data['search']);
});

/**
 * Insertion d'un enregistrement
 */
$router->post('/editions/create', function () use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new EditionsController($db))->createEdition($token, $_POST, $_FILES);
});

/**
 * Modification d'un enregistrement
 */
$router->post('/editions/update/:idEdition', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $idEdition = DataHelper::parseIntParam($params['idEdition']);

    // Appel contrôleur
    (new EditionsController($db))->updateEdition($token, $idEdition, $_POST, $_FILES);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/editions/delete/:idEdition', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres
    $idEdition = DataHelper::parseIntParam($params['idEdition']);

    // Appel contrôleur
    (new EditionsController($db))->deleteEdition($token, $idEdition);
});
