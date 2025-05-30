<?php
$allowedOrigins = [
    'http://localhost:3000',
    'http://ndi-connect.ddns.net:8080',
    'https://ndi-connect.ddns.net:8443',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Login, X-Requested-With");
}

require_once __DIR__ . '/core/Router.php';

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
} else if (str_starts_with($uri, '/users')) {
    require_once __DIR__ . '/routes/users.php';
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint inconnu']);
    exit;
}

$router->run();
