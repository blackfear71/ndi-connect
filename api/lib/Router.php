<?php
class Router
{
    private $routes = [];

    public function delete($path, $callback)
    {
        $this->addRoute('DELETE', $path, $callback);
    }

    public function get($path, $callback)
    {
        $this->addRoute('GET', $path, $callback);
    }

    public function options($path, $callback)
    {
        $this->addRoute('OPTIONS', $path, $callback);
    }

    public function patch($path, $callback)
    {
        $this->addRoute('PATCH', $path, $callback);
    }

    public function post($path, $callback)
    {
        $this->addRoute('POST', $path, $callback);
    }

    private function addRoute($method, $path, $callback)
    {
        $pattern = preg_replace('#:([\w]+)#', '(?P<\1>[^/]+)', $path);
        $pattern = '#^' . $pattern . '$#';
        $this->routes[] = compact('method', 'pattern', 'callback');
    }

    public function run()
    {
        $method = $_SERVER['REQUEST_METHOD'];

        // Récupère le chemin brut de l'URL (sans query string)
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // Supprime le dossier du script (ex: "/api")
        $scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');

        if ($scriptDir !== '' && str_starts_with($uri, $scriptDir)) {
            $uri = substr($uri, strlen($scriptDir));
        }

        // Assure que l'URI commence par un /
        $uri = '/' . ltrim($uri, '/');

        foreach ($this->routes as $route) {            
            // DEBUGG
            // $testPatern = preg_match($route['pattern'], $uri, $matches);
            // file_put_contents(__DIR__ . '/debug-router.log', "-->\nRoute method: " . $route['method'] . "\nPattern: " . $route['pattern'] . "\nMatch: $testPatern\n", FILE_APPEND);

            if ($route['method'] === $method && preg_match($route['pattern'], $uri, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                return call_user_func($route['callback'], $params);
            }
        }

        // Si aucune route ne correspond
        http_response_code(404);
        echo json_encode(['error' => 'Not Found']);
    }
}
