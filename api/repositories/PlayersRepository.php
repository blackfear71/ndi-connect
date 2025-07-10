<?php
require_once 'core/Model.php';

class PlayersRepository extends Model
{
    protected $table = 'players';

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionPlayers($id)
    {
        $sql = "SELECT id, name, points FROM {$this->table} WHERE id_edition = :id AND is_active = 1 ORDER BY name ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Suppression logique des participants d'une édition
     */
    public function deletePlayers($id, $login)
    {
        $data['deleted_at'] = date('Y-m-d H:i:s');
        $data['deleted_by'] = $login;
        $data['is_active'] = 0;

        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
        }

        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id_edition = :id";
        $stmt = $this->db->prepare($sql);

        $data['id'] = $id;
        return $stmt->execute($data);
    }

    /**
     * Insertion d'un joueur
     */
    public function createPlayer($login, $data)
    {
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['created_by'] = $login;

        $sql = "INSERT INTO {$this->table} (id_edition, name, points, created_at, created_by) VALUES (:id_edition, :name, :delta, :created_at, :created_by)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);

        return $this->db->lastInsertId();
    }

    /**
     * Modification d'un joueur par Id
     */
    public function updatePlayer($id, $login, $data)
    {
        $data['updated_at'] = date('Y-m-d H:i:s');
        $data['updated_by'] = $login;

        $sql = "UPDATE {$this->table} SET name = :name, points = points + :delta, updated_at = :updated_at, updated_by = :updated_by WHERE id = :id";
        $stmt = $this->db->prepare($sql);

        $data['id'] = $id;

        return $stmt->execute($data);
    }

    /**
     * Modification des points d'un joueur par Id
     */
    public function updatePlayerPoints($id, $login, $data)
    {
        $data['updated_at'] = date('Y-m-d H:i:s');
        $data['updated_by'] = $login;

        $sql = "UPDATE {$this->table} SET points = :points, updated_at = :updated_at, updated_by = :updated_by WHERE id = :id";
        $stmt = $this->db->prepare($sql);

        $data['id'] = $id;

        return $stmt->execute($data);
    }
}
