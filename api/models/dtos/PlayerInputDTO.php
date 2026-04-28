<?php

/**
 * Saisie d'un participant (DTO)
 */
class PlayerInputDTO
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int    $id               = 0,
        public readonly string $name             = '',
        public readonly int    $points           = 0,
        public readonly ?int   $giveaway         = null,
        public readonly ?int   $giveawayPlayerId = null
    ) {}

    /**
     * Construction de l'objet à partir des données front
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: (int) ($data['id'] ?? 0),
            name: $data['name'] ?? '',
            points: (int) ($data['points'] ?? 0),
            giveaway: isset($data['giveaway']) ? (int) $data['giveaway'] : null,
            giveawayPlayerId: isset($data['giveawayPlayerId']) ? (int) $data['giveawayPlayerId'] : null
        );
    }
}
