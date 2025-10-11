<?php
require_once 'core/Model.php';

class UsersRepository extends Model
{
    protected $table = 'users';

    /**
     * Contrôle authentification
     */
    public function checkAuth($token)
    {
        $data['token'] = $token;

        $sql = "SELECT login, level FROM {$this->table} WHERE token = :token AND token IS NOT NULL AND token_expires_at > NOW() AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllUsers()
    {
        $sql = "SELECT id, login, level FROM {$this->table} WHERE is_active = 1 ORDER BY login ASC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupération données utilisateur
     */
    public function getUserData($login)
    {
        $sql = "SELECT login, password, level FROM {$this->table} WHERE login = :login AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['login' => $login]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Mise à jour token de connexion
     */
    public function updateToken($login, $token)
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
