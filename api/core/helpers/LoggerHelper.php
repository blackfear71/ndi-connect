<?php
class LoggerHelper
{
    private static $env = null;

    /**
     * Enregistre un message dans le fichier de log journalier
     * @param $message Message à logguer
     * @param $level Niveau de gravité (ex: ERROR, INFO, WARNING)
     */
    public static function log(string $message, string $level = 'ERROR')
    {
        // Récupération du dossier de logs depuis le fichier .env
        if (self::$env === null) {
            self::$env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
        }

        if (isset(self::$env['LOG_DIR']) && !empty(self::$env['LOG_DIR'])) {
            $logDir = self::$env['LOG_DIR'];

            // Contrôle que le dossier de logs existe
            if (!is_dir($logDir)) {
                mkdir($logDir, 0775, true);
            }

            // Nom du fichier, ex : logs/error_logs_2025-06-06.log
            switch ($level) {
                case 'ERROR':
                    $filename = $logDir . '/error_logs_' . date('Y-m-d') . '.log';
                    break;
                case 'INFO':
                    $filename = $logDir . '/info_logs_' . date('Y-m-d') . '.log';
                    break;
                case 'WARNING':
                    $filename = $logDir . '/warning_logs_' . date('Y-m-d') . '.log';
                    break;
            }

            // Format : [2025-06-06 14:55:02] [ERROR] Message
            $date = date('Y-m-d H:i:s');
            $formatted = "[$date] [$level] $message\n";

            error_log($formatted, 3, $filename);
        }
    }
}
