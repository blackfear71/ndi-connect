<?php
// ini_set('display_errors', 0);                                                    // Ne pas afficher les erreurs à l'écran
// ini_set('log_errors', 1);                                                        // Activer le logging
// ini_set('error_log', __DIR__ . '/../logs/error_logs_' . date('Y-m-d') . '.log'); // Chemin vers le fichier de log
// error_reporting(E_ALL);                                                          // Reporter toutes les erreurs

// Paramètres CORS
$allowedOrigins = [
    'http://localhost:3000', // CRA
    'http://localhost:5173', // Vite
    'http://ndi-connect.ddns.net',
    'https://ndi-connect.ddns.net',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Préparation de l'URI
$basePath = dirname($_SERVER['SCRIPT_NAME']); // "/api"
$uri = substr($_SERVER['REQUEST_URI'], strlen($basePath));

if (str_starts_with($uri, '/sse')) {
    // CORS pour SSE
    header("Access-Control-Allow-Origin: $origin");
    header("Content-Type: text/event-stream");
    header("Cache-Control: no-cache");
    header("Connection: keep-alive");
    header("X-Accel-Buffering: no");
} else if (in_array($origin, $allowedOrigins)) {
    // CORS complet API classique
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
}

// Gestion du preflight OPTIONS global
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Imports
require_once __DIR__ . '/core/functions/Database.php';
require_once __DIR__ . '/core/functions/Router.php';
require_once __DIR__ . '/core/helpers/EnvironmentHelper.php';
require_once __DIR__ . '/core/helpers/FileHelper.php';
require_once __DIR__ . '/core/helpers/LoggerHelper.php';
require_once __DIR__ . '/core/helpers/ResponseHelper.php';

$router = new Router();

// Dispatch vers le bon groupe de routes
if (str_starts_with($uri, '/editions')) {
    require_once __DIR__ . '/routes/editions.php';
} else if (str_starts_with($uri, '/gifts')) {
    require_once __DIR__ . '/routes/gifts.php';
} else if (str_starts_with($uri, '/players')) {
    require_once __DIR__ . '/routes/players.php';
} else if (str_starts_with($uri, '/rewards')) {
    require_once __DIR__ . '/routes/rewards.php';
} else if (str_starts_with($uri, '/serve-file')) {
    require_once __DIR__ . '/routes/serve-file.php';
} else if (str_starts_with($uri, '/sse')) {
    require_once __DIR__ . '/routes/sse.php';
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
