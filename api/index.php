<?php
// ini_set('display_errors', 0);                                                    // Ne pas afficher les erreurs à l'écran
// ini_set('log_errors', 1);                                                        // Activer le logging
// ini_set('error_log', __DIR__ . '/../logs/error_logs_' . date('Y-m-d') . '.log'); // Chemin vers le fichier de log
// error_reporting(E_ALL);                                                          // Reporter toutes les erreurs

$allowedOrigins = [
    'http://localhost:3000',
    'http://ndi-connect.ddns.net',
    'https://ndi-connect.ddns.net',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}

require_once __DIR__ . '/core/functions/Database.php';
require_once __DIR__ . '/core/functions/Router.php';
require_once __DIR__ . '/core/helpers/EnvironmentHelper.php';
require_once __DIR__ . '/core/helpers/LoggerHelper.php';
require_once __DIR__ . '/core/helpers/ResponseHelper.php';

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
} else if (str_starts_with($uri, '/rewards')) {
    require_once __DIR__ . '/routes/rewards.php';    
} else if (str_starts_with($uri, '/users')) {
    require_once __DIR__ . '/routes/users.php';
} else {
    ResponseHelper::error(
        'ERR_UNKNOWN_ENDPOINT',
        404,
        "Endpoint inconnu dans index.php : $uri"
    );
    exit;
}

$router->run();
