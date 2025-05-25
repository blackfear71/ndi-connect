<?php
require_once 'config/database.php';
require_once 'controllers/EditionsController.php';

$database = new Database();
$db = $database->getConnection();

$router->get('/editions/all', function () use ($db) {
    (new EditionsController($db))->index();
});

$router->get('/editions/find/:id', function ($params) use ($db) {
    (new EditionsController($db))->show($params['id']);
});

$router->post('/editions/create', function () use ($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    (new EditionsController($db))->create($data);
});

$router->patch('/editions/update/:id', function ($params) use ($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    (new EditionsController($db))->update($params['id'], $data);
});

$router->delete('/editions/delete/:id', function ($params) use ($db) {
    (new EditionsController($db))->delete($params['id']);
});
