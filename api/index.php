<?php
require_once 'core/Logger.php';

ini_set('display_errors', 0);                      // Ne pas afficher les erreurs à l'écran
ini_set('log_errors', 1);                          // Activer le logging
ini_set('error_log', __DIR__ . '/logs/error.log'); // Chemin vers le fichier de log
error_reporting(E_ALL);                            // Reporter toutes les erreurs

$allowedOrigins = [
    'http://localhost:3000',
    'http://ndi-connect.ddns.net:8080',
    'https://ndi-connect.ddns.net:8443',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}

require_once __DIR__ . '/core/Router.php';

$router = new Router();

$basePath = dirname($_SERVER['SCRIPT_NAME']); // "/api"
$uri = substr($_SERVER['REQUEST_URI'], strlen($basePath));

// Dispatch vers le bon groupe de routes
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
} else if (str_starts_with($uri, '/editions')) {
    require_once __DIR__ . '/routes/editions.php';
} else if (str_starts_with($uri, '/gifts')) {
    require_once __DIR__ . '/routes/gifts.php';
} else if (str_starts_with($uri, '/players')) {
    require_once __DIR__ . '/routes/players.php';
} else if (str_starts_with($uri, '/users')) {
    require_once __DIR__ . '/routes/users.php';
} else {
    Logger::log("Endpoint inconnu : " . $uri, 'ERROR');
    http_response_code(404);
    echo json_encode(['error' => 'ERR_UNKNOWN_ENDPOINT']);
    exit;
}

$router->run();
