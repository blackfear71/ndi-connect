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
        $sql = "SELECT id, name FROM {$this->table} WHERE id_edition = $id AND is_active = 1 ORDER BY name ASC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
