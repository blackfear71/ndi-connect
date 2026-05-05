<?php
class Model
{
    protected PDO $db;
    protected string $modelTable;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function logicalDelete(int $id, string $login): bool
    {
        $sql = "UPDATE {$this->table}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $id,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $login,
            'is_active'  => 0
        ]);
    }

    /**
     * Suppression physique d'un enregistrement
     */
    public function physicalDelete(int $id): bool
    {
        $sql = "DELETE FROM {$this->table}
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id' => $id
        ]);
    }
}
