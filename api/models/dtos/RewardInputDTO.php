<?php

/**
 * Saisie d'une récompense (DTO)
 */
class RewardInputDTO
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int $idGift   = 0,
        public readonly int $idPlayer = 0
    ) {}

    /**
     * Construction de l'objet à partir des données front
     */
    public static function fromArray(array $data): self
    {
        return new self(
            idGift: (int) ($data['idGift'] ?? 0),
            idPlayer: (int) ($data['idPlayer'] ?? 0)
        );
    }
}
