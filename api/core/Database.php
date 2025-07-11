<?php
class Database
{
    public $conn;

    /**
     * Connexion à la base de données
     */
    public function getConnection()
    {
        $this->conn = null;

        // Charger le fichier .env
        $env = $this->loadEnv(__DIR__ . '/../.env');

        $sql = [
            'host'     => $env['DB_HOST'] ?? 'localhost',
            'port'     => $env['DB_PORT'] ?? '',
            'database' => $env['DB_NAME'] ?? 'ndi_connect_db',
            'username' => $env['DB_USER'] ?? 'root',
            'password' => $env['DB_PASS'] ?? '',
        ];

        try {
            $this->conn = new PDO(
                "mysql:host=" . $sql['host'] . ";port=" . $sql['port'] . ";dbname=" . $sql['database'] . ";charset=utf8mb4",
                $sql['username'],
                $sql['password']
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $exception) {
            echo "Erreur de connexion : " . $exception->getMessage();
        }

        return $this->conn;
    }

    /**
     * Chargement du fichier d'environnement
     */
    public function loadEnv($path)
    {
        if (!file_exists($path)) {
            return [];
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $env = [];

        foreach ($lines as $line) {
            // Ignorer les commentaires
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            $parts = explode('=', $line, 2);

            if (count($parts) == 2) {
                $key = trim($parts[0]);
                $value = trim($parts[1]);
                $env[$key] = $value;
            }
        }

        return $env;
    }
}
