<?php
// Imports
require_once 'core/functions/Model.php';

require_once 'models/entities/User.php';

class UsersRepository extends Model
{
    protected string $table = 'users';

    /**
     * Contrôle authentification
     */
    public function checkAuth(?string $token): ?User
    {
        $sql = "SELECT id, login, level
            FROM {$this->table}
            WHERE token = :token AND token IS NOT NULL AND token_expires_at > NOW() AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'token' => $token
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new User(
            id: (int) $row['id'],
            login: $row['login'],
            level: (int) $row['level']
        );
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllUsers(): array
    {
        $sql = "SELECT id, login, level
            FROM {$this->table}
            WHERE is_active = 1
            ORDER BY login ASC";

        $stmt = $this->db->query($sql);

        return array_map(fn($row) => new User(
            id: (int) $row['id'],
            login: $row['login'],
            level: (int) $row['level']
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Récupération données utilisateur actif (via login)
     */
    public function getActiveUserDataByLogin(string $login): ?User
    {
        $sql = "SELECT id, login, password, level
            FROM {$this->table}
            WHERE login = :login AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'login' => $login
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new User(
            id: (int) $row['id'],
            login: $row['login'],
            password: $row['password'],
            level: (int) $row['level']
        );
    }

    /**
     * Récupération données utilisateur actif (via id)
     */
    public function getActiveUserDataById(int $id): ?User
    {
        $sql = "SELECT id, login, level
            FROM {$this->table}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $id
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new User(
            id: (int) $row['id'],
            login: $row['login'],
            level: (int) $row['level']
        );
    }

    /**
     * Récupération données utilisateur (tous statuts)
     */
    public function checkLoginAvailable(string $login): bool
    {
        $sql = "SELECT COUNT(*)
            FROM {$this->table}
            WHERE login = :login";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'login' => $login
        ]);

        return (int) $stmt->fetchColumn() === 0;
    }

    /**
     * Vérifie si l'utilisateur est le dernier super admin actif
     */
    public function isLastAdmin(): bool
    {
        $sql = "SELECT COUNT(*) AS nbAdmin
            FROM {$this->table}
            WHERE level = :level AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'level' => EnumUserRole::SUPERADMIN->value
        ]);

        $count = $stmt->fetch(PDO::FETCH_ASSOC);

        return ($count['nbAdmin'] == 1);
    }

    /**
     * Insertion d'un utilisateur
     */
    public function createUser(User $user): bool
    {
        $sql = "INSERT INTO {$this->table} (login, password, level, created_at, created_by, is_active)
            VALUES (:login, :password, :level, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'login'      => $user->login,
            'password'   => $user->password,
            'level'      => $user->level,
            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $user->createdBy,
            'is_active'  => 1
        ]);
    }

    /**
     * Mise à jour token de connexion
     */
    public function updateToken(User $user, ?string $token): bool
    {
        $sql = "UPDATE {$this->table}
            SET token = :token, token_expires_at = :token_expires_at, updated_at = :updated_at, updated_by = :updated_by
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'               => $user->id,
            'token'            => $token,
            'token_expires_at' => $token ? (new DateTime('+1 day'))->format('Y-m-d H:i:s') : NULL,
            'updated_at'       => date('Y-m-d H:i:s'),
            'updated_by'       => $user->login
        ]);
    }

    /**
     * Mise à jour mot de passe
     */
    public function updatePassword(int $id, string $hash, string $login): bool
    {
        $sql = "UPDATE {$this->table}
            SET password = :password, updated_at = :updated_at, updated_by = :updated_by
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $id,
            'password'   => $hash,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $login
        ]);
    }

    /**
     * Mise à jour utilisateur
     */
    public function updateUser(User $user, string $login): bool
    {
        $sql = "UPDATE {$this->table}
            SET level = :level, updated_at = :updated_at, updated_by = :updated_by
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $user->id,
            'level'      => $user->level,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $login
        ]);
    }
}
