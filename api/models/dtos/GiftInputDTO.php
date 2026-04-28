<?php

/**
 * Saisie d'un cadeau (DTO)
 */
class GiftInputDTO
{
    /**
     * Construteur
     */
    public function __construct(
        // TODO : il est conseillé de passer les id dans la route et pas dans le body car ce sont des données techniques
        public readonly int    $id       = 0,
        public readonly string $name     = '',
        public readonly int    $value    = 0,
        public readonly int    $quantity = 0
    ) {}

    /**
     * Construction de l'objet à partir des données front
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: (int) ($data['id'] ?? 0),
            name: $data['name'] ?? '',
            value: (int) ($data['value'] ?? 0),
            quantity: (int) ($data['quantity'] ?? 0)
        );
    }
}
