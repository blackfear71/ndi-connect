<?php
require_once 'core/Model.php';

class GiftsRepository extends Model
{
    protected $table = 'gifts';

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionGifts($id)
    {
        $sql = "SELECT id, name, value, quantity FROM {$this->table} WHERE id_edition = :id AND is_active = 1 ORDER BY name ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Suppression logique des cadeaux d'une édition
     */
    public function deleteGifts($id, $login)
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
}
