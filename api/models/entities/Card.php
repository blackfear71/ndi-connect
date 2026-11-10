<?php

/**
 * Représente une carte QR code en base
 */
class Card
{
    /**
     * Constructeur
     */
    public function __construct(
        public readonly int                 $id         = 0,
        public readonly int                 $editionId  = 0,
        public readonly int                 $playerId   = 0,
        public readonly string              $playerName = '',
        public readonly string              $code       = '',
        public readonly \DateTimeImmutable  $createdAt  = new \DateTimeImmutable(),
        public readonly int                 $createdBy  = 0,
        public readonly ?\DateTimeImmutable $updatedAt  = null,
        public readonly ?int                $updatedBy  = null,
        public readonly ?\DateTimeImmutable $deletedAt  = null,
        public readonly ?int                $deletedBy  = null,
        public readonly bool                $isActive   = true
    ) {}
}
