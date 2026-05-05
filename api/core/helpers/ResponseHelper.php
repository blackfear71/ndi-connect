<?php
class ResponseHelper
{
    /**
     * Gestion du retour en cas d'erreur
     */
    public static function error(string $code, array $args = []): void
    {
        // Message et code HTTP
        $logMessage = MessageHelper::message($code, ...$args);
        $httpCode = MessageHelper::httpCode($code);

        // Log
        LoggerHelper::log($logMessage, 'ERROR');

        // Réponse
        http_response_code($httpCode);
        echo json_encode(new ApiResponseDTO(
            status: 'error',
            data: null,
            message: $code,
        ));
    }

    /**
     * Gestion du retour en cas d'info
     */
    public static function info(mixed $data = null, string $code = ''): void
    {
        // Réponse
        http_response_code(200);
        echo json_encode(new ApiResponseDTO(
            status: 'info',
            data: $data,
            message: $code,
        ));
    }

    /**
     * Gestion du retour SSE
     */
    public static function sse(string $code, array $args = []): void
    {
        // Message
        $logMessage = MessageHelper::message($code, ...$args);

        // Log
        LoggerHelper::log($logMessage, 'SSE');
    }

    /**
     * Gestion du retour en cas de succès
     */
    public static function success(mixed $data = null, string $code = ''): void
    {
        // Réponse
        http_response_code(200);
        echo json_encode(new ApiResponseDTO(
            status: 'success',
            data: $data,
            message: $code,
        ));
    }

    /**
     * Gestion du retour en cas d'alerte
     */
    public static function warning(string $code = '', array $args = []): void
    {
        // Message et code HTTP
        $logMessage = MessageHelper::message($code, ...$args);
        $httpCode = MessageHelper::httpCode($code);

        // Log
        LoggerHelper::log($logMessage, 'ERROR');

        // Réponse
        http_response_code($httpCode);
        echo json_encode(new ApiResponseDTO(
            status: 'warning',
            data: null,
            message: $code,
        ));
    }
}
