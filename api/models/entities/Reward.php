<?php
/**
 * Représente une récompense en base
 */
class Reward
{
    /**
     * Constructeur
     */
    public function __construct(
        public readonly int                 $id        = 0,
        public readonly int                 $idPlayer  = 0,
        public readonly int                 $idGift    = 0,
        public readonly int                 $points    = 0,
        public readonly string              $giftName  = '',
        public readonly \DateTimeImmutable  $createdAt = new \DateTimeImmutable(),
        public readonly string              $createdBy = '',
        public readonly ?\DateTimeImmutable $updatedAt = null,
        public readonly ?string             $updatedBy = null,
        public readonly ?\DateTimeImmutable $deletedAt = null,
        public readonly ?string             $deletedBy = null,
        public readonly bool                $isActive  = true
    ) {}
}
