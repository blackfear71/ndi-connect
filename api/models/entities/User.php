<?php

/**
 * Représente un utilisateur en base
 */
class User
{
    /**
     * Constructeur
     */
    public function __construct(
        public readonly int                 $id             = 0,
        public readonly string              $login          = '',
        public readonly string              $password       = '',
        public readonly ?string             $token          = null,
        public readonly ?\DateTimeImmutable $tokenExpiresAt = null,
        public readonly int                 $level          = 0,
        public readonly \DateTimeImmutable  $createdAt      = new DateTimeImmutable(),
        public readonly string              $createdBy      = '',
        public readonly ?\DateTimeImmutable $updatedAt      = null,
        public readonly ?string             $updatedBy      = null,
        public readonly ?\DateTimeImmutable $deletedAt      = null,
        public readonly ?string             $deletedBy      = null,
        public readonly bool                $isActive       = true
    ) {}
}
