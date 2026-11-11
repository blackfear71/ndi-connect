<?php

/**
 * Représente une carte (DTO)
 */
class CardOutputDTO implements \JsonSerializable
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int    $id         = 0,
        public readonly string $code       = '',
        public readonly int    $editionId  = 0,
        public readonly int    $playerId   = 0,
        public readonly string $playerName = ''
    ) {}

    /**
     * Sérialisation
     */
    public function jsonSerialize(): array
    {
        return [
            'id'         => $this->id,
            'code'       => $this->code,
            'editionId'  => $this->editionId,
            'playerId'   => $this->playerId,
            'playerName' => $this->playerName
        ];
    }
}
