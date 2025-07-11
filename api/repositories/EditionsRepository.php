<?php
require_once 'core/Model.php';

class EditionsRepository extends Model
{
    protected $table = 'editions';

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllEditions()
    {
        $sql = "SELECT id, location, start_date AS 'startDate', end_date AS 'endDate', theme, challenge FROM {$this->table} WHERE is_active = 1 ORDER BY id ASC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getEdition($id)
    {
        $sql = "SELECT id, location, start_date AS 'startDate', end_date AS 'endDate', theme, challenge FROM {$this->table} WHERE id = :id AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Lecture des éditions recherchées
     */
    public function getSearchEditions($search)
    {
        $sql = "SELECT id, location, start_date AS 'startDate', end_date AS 'endDate', theme, challenge FROM {$this->table} WHERE (CAST(start_date AS CHAR) LIKE :search OR location LIKE :search) AND is_active = 1 ORDER BY id ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['search' => "%$search%"]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
