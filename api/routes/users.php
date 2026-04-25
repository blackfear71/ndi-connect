<?php
// Imports
require_once 'controllers/UsersController.php';

/**
 * Contrôle authentification
 */
$router->get('/users/checkAuth', function () use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres URL
    $initLoad = isset($_GET['initLoad']) && $_GET['initLoad'] === 'true';

    // Appel contrôleur
    (new UsersController($db))->checkAuth($token, $initLoad);
});

/**
 * Lecture de tous les enregistrements
 */
$router->get('/users/all', function () use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new UsersController($db))->getAllUsers($token);
});

/**
 * Connexion utilisateur
 */
$router->post('/users/connect', function () use ($db): void {
    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new UsersController($db))->connect($data);
});

/**
 * Déconnexion utilisateur
 */
$router->post('/users/disconnect', function () use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new UsersController($db))->disconnect($token);
});

/**
 * Insertion d'un enregistrement
 */
$router->post('/users/create', function () use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new UsersController($db))->createUser($token, $data);
});

/**
 * Modification d'un enregistrement
 */
$router->patch('/users/password', function () use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new UsersController($db))->updatePassword($token, $data);
});

/**
 * Modification d'un enregistrement
 */
$router->patch('/users/reset/:id', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new UsersController($db))->resetPassword($token, $params['id']);
});

/**
 * Modification d'un enregistrement
 */
$router->patch('/users/update', function () use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new UsersController($db))->updateUser($token, $data);
});

/**
 * Suppression logique d'un enregistrement
 */
$router->delete('/users/delete/:id', function (array $params) use ($db): void {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new UsersController($db))->deleteUser($token, $params['id']);
});
