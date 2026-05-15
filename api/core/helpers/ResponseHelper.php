<?php
class ResponseHelper
{
    // TODO : 
    // - gifts      => OK
    // - players    => OK
    // - rewards    => OK
    // - serve-file => OK
    // - editions   => OK
    // - users      => ??
    // - sse        => ??

    /**
     * Gestion du retour en cas d'erreur
     */
    public static function error(string $code, array $args = []): void
    {
        // Message et code HTTP
        $logMessage = MessageHelper::message_old($code, ...$args);
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

    // TODO : surcharge en attendant de gérer mieux les erreur
    /**
     * Gestion du retour en cas d'erreur
     */
    public static function error2(string $code, string $class, string $function, array $datas = []): void
    {
        // Message et code HTTP
        // TODO : renommer message2 en message
        $logMessage = MessageHelper::message_new($code, $class, $function, $datas);
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
        // TODO : à faire
        // Message
        $logMessage = MessageHelper::message_old($code, ...$args);

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
        // TODO : à faire

        // Message et code HTTP
        $logMessage = MessageHelper::message_old($code, ...$args);
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
