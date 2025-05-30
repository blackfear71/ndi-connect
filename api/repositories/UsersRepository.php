<?php
require_once 'core/Model.php';

class UsersRepository extends Model
{
    protected $table = 'users';

    /**
     * Contrôle authentification
     */
    public function checkAuth($login, $token)
    {
        $data['login'] = $login;
        $data['token'] = $token;

        $sql = "SELECT COUNT(id) AS count FROM {$this->table} WHERE login = :login AND token = :token AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Connexion utilisateur
     */
    public function getUserPassword($login)
    {
        $sql = "SELECT id, password FROM {$this->table} WHERE login = :login AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['login' => $login]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Déconnexion utilisateur
     */
    public function updateToken($login, $token)
    {
        $data['token'] = $token;
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
