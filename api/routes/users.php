<?php
require_once 'controllers/UsersController.php';

$database = new Database();
$db = $database->getConnection();

$router->get('/users/checkAuth', function () use ($db) {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Paramètres URL
    $initLoad = isset($_GET['initLoad']) && $_GET['initLoad'] === 'true';

    // Appel contrôleur
    (new UsersController($db))->checkAuth($token, $initLoad);
});

$router->get('/users/all', function () use ($db) {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new UsersController($db))->getAllUsers($token);
});

$router->post('/users/connect', function () use ($db) {
    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new UsersController($db))->connect($data);
});

$router->post('/users/disconnect', function () use ($db) {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new UsersController($db))->disconnect($token);
});

$router->post('/users/create', function () use ($db) {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new UsersController($db))->createUser($token, $data);
});

$router->patch('/users/password', function () use ($db) {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new UsersController($db))->updatePassword($token, $data);
});

$router->patch('/users/reset/:id', function ($params) use ($db) {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new UsersController($db))->resetPassword($token, $params['id']);
});

$router->patch('/users/update', function () use ($db) {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Données d'entrée
    $data = json_decode(file_get_contents('php://input'), true);

    // Appel contrôleur
    (new UsersController($db))->updateUser($token, $data);
});

$router->delete('/users/delete/:id', function ($params) use ($db) {
    // Token
    $token = $_COOKIE['token'] ?? null;

    // Appel contrôleur
    (new UsersController($db))->deleteUser($token, $params['id']);
});
