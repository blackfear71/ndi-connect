<?php
class ResponseHelper
{
    /**
     * Gestion du retour en cas d'erreur
     */
    public static function error($message, $code = 500, $logMessage = null)
    {
        if ($logMessage) {
            LoggerHelper::log($logMessage, 'ERROR');
        }

        http_response_code($code);
        echo json_encode([
            'status' => 'error',
            'message' => $message,
            'data' => null
        ]);
    }

    /**
     * Gestion du retour en cas d'info
     */
    public static function info($data = null, $message = '')
    {
        echo json_encode([
            'status' => 'info',
            'message' => $message,
            'data' => $data
        ]);
    }

    /**
     * Gestion du retour en cas de succès
     */
    public static function success($data = null, $message = '')
    {
        echo json_encode([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ]);
    }

    /**
     * Gestion du retour en cas d'alerte
     */
    public static function warning($data = null, $message = '')
    {
        echo json_encode([
            'status' => 'warning',
            'message' => $message,
            'data' => $data
        ]);
    }
}
