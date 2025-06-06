<?php

class Logger
{
    private static string $logDir = __DIR__ . '/../logs';

    /**
     * Enregistre un message dans le fichier de log journalier
     * @param $message Message à logguer
     * @param $level Niveau de gravité (ex: ERROR, INFO, WARNING)
     */
    public static function log(string $message, string $level = 'ERROR')
    {
        // Contrôle que le dossier de logs existe
        if (!file_exists(self::$logDir)) {
            mkdir(self::$logDir, 0775, true);
        }

        // Nom du fichier, ex : logs/error_logs_2025-06-06.log
        switch ($level) {
            case 'ERROR':
                $filename = self::$logDir . '/error_logs_' . date('Y-m-d') . '.log';
                break;
            case 'INFO':
                $filename = self::$logDir . '/info_logs_' . date('Y-m-d') . '.log';
                break;
            case 'WARNING':
                $filename = self::$logDir . '/warning_logs_' . date('Y-m-d') . '.log';
                break;
        }

        // Format : [2025-06-06 14:55:02] [ERROR] Message
        $date = date('Y-m-d H:i:s');
        $formatted = "[$date] [$level] $message\n";

        error_log($formatted, 3, $filename);
    }
}
