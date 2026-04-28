<?php

/**
 * Saisie d'un utilisateur (DTO)
 */
class UserInputDTO
{
    /**
     * Construteur
     */
    public function __construct(
        public readonly int     $id              = 0,
        public readonly string  $login           = '',
        public readonly ?string $token           = null,
        public readonly int     $level           = 0,
        public readonly string  $password        = '',
        public readonly string  $oldPassword     = '',
        public readonly string  $confirmPassword = ''
    ) {}

    /**
     * Construction de l'objet à partir des données front
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: (int) ($data['id'] ?? 0),
            login: $data['login'] ?? '',
            token: $data['token'] ?? null,
            level: $data['level'] ?? 0,
            password: $data['password'] ?? '',
            oldPassword: $data['oldPassword'] ?? '',
            confirmPassword: $data['confirmPassword'] ?? ''
        );
    }
}
