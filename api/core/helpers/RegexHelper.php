<?php
class RegexHelper
{
    /**
     * Code d'une carte : 8 caractères (lettres majuscules et chiffres)
     */
    public const CARD_CODE = '/^[A-Z0-9]{8}$/';

    /**
     * Paramètre dynamique d'une route (ex: ":id")
     */
    private const ROUTE_PARAM = '#:([\w]+)#';

    /**
     * Groupe nommé remplaçant un paramètre de route
     */
    private const ROUTE_PARAM_GROUP = '(?P<\1>[^/]+)';

    /**
     * Convertit un chemin de route (ex: "/cards/:id") en regex complète
     */
    public static function routeToPattern(string $path): string
    {
        $pattern = preg_replace(self::ROUTE_PARAM, self::ROUTE_PARAM_GROUP, $path);

        return '#^' . $pattern . '$#';
    }
}
