<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: DELETE, GET, OPTIONS, PATCH, POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

require_once __DIR__ . '/lib/Router.php';

$router = new Router();

$basePath = dirname($_SERVER['SCRIPT_NAME']); // "/api"
$uri = substr($_SERVER['REQUEST_URI'], strlen($basePath));

// TODO : voir comment afficher des données côté back (var_dump ?) ou s'il existe une autre méthode pour débugger

// Dispatch vers le bon groupe de routes
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
} else if (str_starts_with($uri, '/editions')) {
    require_once __DIR__ . '/routes/editions.php';
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint inconnu']);
    exit;
}

$router->run();
