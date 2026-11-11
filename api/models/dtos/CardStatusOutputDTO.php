<?php

/**
 * Représente l'état d'un code de carte (DTO)
 */
class CardStatusOutputDTO implements \JsonSerializable
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly bool $isFree   = true,
        public readonly ?int $playerId = null
    ) {}

    /**
     * Sérialisation
     */
    public function jsonSerialize(): array
    {
        return [
            'isFree'   => $this->isFree,
            'playerId' => $this->playerId
        ];
    }
}
