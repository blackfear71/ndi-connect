<?php
class EnvironmentHelper
{
    private static ?array $env = null;

    /**
     * Liste des origines autorisées (CORS) depuis le fichier d'environnement
     */
    public static function getAllowedOrigins(): array
    {
        if (self::$env === null) {
            self::$env = self::loadEnv(__DIR__ . '/../../.env');
        }

        $origins = array_map('trim', explode(',', self::$env['ALLOWED_ORIGINS'] ?? ''));

        return array_values(array_filter($origins, fn($origin) => $origin !== ''));
    }

    /**
     * Chargement du fichier d'environnement
     */
    public static function loadEnv(string $path): array
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
