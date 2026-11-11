<?php
class ResponseHelper
{
    /**
     * Gestion du retour en cas d'erreur
     */
    public static function error(string $code, string $class = '', string $function = '', array $data = []): void
    {
        // Message et code HTTP
        $logMessage = MessageHelper::message($code, $class, $function, $data);
        $httpCode = MessageHelper::httpCode($code, 500);

        // Log
        LoggerHelper::log($logMessage, 'ERROR');

        // Réponse
        header('Content-Type: application/json; charset=UTF-8');
        http_response_code($httpCode);
        echo json_encode(new ApiResponseDTO(
            status: EnumMessageType::ERROR->value,
            data: null,
            message: $code,
        ));
    }

    /**
     * Gestion du retour en cas d'info
     */
    public static function info(mixed $data = null, string $code = ''): void
    {
        // Code HTTP
        $httpCode = MessageHelper::httpCode($code, 200);

        // Réponse
        header('Content-Type: application/json; charset=UTF-8');
        http_response_code($httpCode);
        echo json_encode(new ApiResponseDTO(
            status: EnumMessageType::INFO->value,
            data: $data,
            message: $code,
        ));
    }

    /**
     * Gestion du retour SSE
     */
    public static function sse(string $code, string $class = '', string $function = '', array $data = []): void
    {
        // Message
        $logMessage = MessageHelper::message($code, $class, $function, $data);

        // Log
        LoggerHelper::log($logMessage, 'SSE');
    }

    /**
     * Gestion du retour en cas de succès
     */
    public static function success(mixed $data = null, string $code = ''): void
    {
        // Code HTTP
        $httpCode = MessageHelper::httpCode($code, 200);

        // Réponse
        header('Content-Type: application/json; charset=UTF-8');
        http_response_code($httpCode);
        echo json_encode(new ApiResponseDTO(
            status: EnumMessageType::SUCCESS->value,
            data: $data,
            message: $code,
        ));
    }

    /**
     * Gestion du retour en cas d'alerte
     */
    public static function warning(string $code, string $class = '', string $function = '', array $data = []): void
    {
        // Message et code HTTP
        $logMessage = MessageHelper::message($code, $class, $function, $data);
        $httpCode = MessageHelper::httpCode($code, 500);

        // Log
        LoggerHelper::log($logMessage, 'WARNING');

        // Réponse
        header('Content-Type: application/json; charset=UTF-8');
        http_response_code($httpCode);
        echo json_encode(new ApiResponseDTO(
            status: EnumMessageType::WARNING->value,
            data: null,
            message: $code,
        ));
    }
}
