<?php
require_once 'config/database.php';
require_once 'controllers/TestController.php';

$database = new Database();
$db = $database->getConnection();

$router->get('/tests/all', function () use ($db) {
    (new TestController($db))->index();
});

$router->get('/tests/find/:id', function ($params) use ($db) {
    (new TestController($db))->show($params['id']);
});

$router->post('/tests/create', function () use ($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    (new TestController($db))->create($data);
});

$router->patch('/tests/update/:id', function ($params) use ($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    (new TestController($db))->update($params['id'], $data);
});

$router->delete('/tests/delete/:id', function ($params) use ($db) {
    (new TestController($db))->delete($params['id']);
});
