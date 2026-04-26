<?php
// Imports
require_once 'core/functions/Model.php';

class UsersRepository extends Model
{
    protected $table = 'users';

    /**
     * Contrôle authentification
     */
    public function checkAuth(string|null $token): array|false
    {
        $data['token'] = $token;

        $sql = "SELECT id, login, level FROM {$this->table} WHERE token = :token AND token IS NOT NULL AND token_expires_at > NOW() AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllUsers(): array
    {
        $sql = "SELECT id, login, level FROM {$this->table} WHERE is_active = 1 ORDER BY login ASC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupération données utilisateur actif (via login)
     */
    public function getActiveUserDataByLogin(string $login): array|false
    {
        $sql = "SELECT id, login, password, level FROM {$this->table} WHERE login = :login AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['login' => $login]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Récupération données utilisateur actif (via id)
     */
    public function getActiveUserDataById(int|string $id): array|false
    {
        $sql = "SELECT id, login, level FROM {$this->table} WHERE id = :id AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Récupération données utilisateur (tous statuts)
     */
    public function getUserDataByLogin(string $login): array|false
    {
        $sql = "SELECT id, login, level FROM {$this->table} WHERE login = :login";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['login' => $login]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Vérifie si l'utilisateur est le dernier super admin actif
     */
    public function isLastAdmin(): bool
    {
        $sql = "SELECT COUNT(*) AS nbAdmin FROM {$this->table} WHERE level = :level AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['level' => EnumUserRole::SUPERADMIN->value]);
        $count = $stmt->fetch(PDO::FETCH_ASSOC);

        return ($count['nbAdmin'] == 1);
    }

    /**
     * Mise à jour token de connexion
     */
    public function updateToken(string $login, string|null $token): bool
    {
        $data['token'] = $token;
        $data['token_expires_at'] = $token ? (new DateTime('+1 day'))->format('Y-m-d H:i:s') : NULL;
        $data['updated_at'] = date('Y-m-d H:i:s');
        $data['updated_by'] = $login;

        $fields = [];

        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
        }

        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE login = :login";
        $stmt = $this->db->prepare($sql);

        $data['login'] = $login;
        return $stmt->execute($data);
    }
}
