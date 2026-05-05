<?php
/**
 * Représente un cadeau en base
 */
class Gift
{
    /**
     * Constructeur
     */
    public function __construct(
        public readonly int                 $id          = 0,
        public readonly int                 $idEdition   = 0,
        public readonly string              $name        = '',
        public readonly int                 $value       = 0,
        public readonly int                 $quantity    = 0,
        public readonly int                 $rewardCount = 0,
        public readonly \DateTimeImmutable  $createdAt   = new \DateTimeImmutable(),
        public readonly string              $createdBy   = '',
        public readonly ?\DateTimeImmutable $updatedAt   = null,
        public readonly ?string             $updatedBy   = null,
        public readonly ?\DateTimeImmutable $deletedAt   = null,
        public readonly ?string             $deletedBy   = null,
        public readonly bool                $isActive    = true
    ) {}
}
