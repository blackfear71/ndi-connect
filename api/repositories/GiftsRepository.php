<?php
require_once 'core/Model.php';

class GiftsRepository extends Model
{
    protected $table = 'gifts';
    protected $rewardsTable = 'rewards';

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionGifts($id)
    {
        // TODO : voir si on peut faire plus joli comme requête
        $sql = "SELECT g.id, g.name, g.value, g.quantity, COUNT(r.id) AS giftAttribution FROM {$this->table} AS g
        LEFT JOIN {$this->rewardsTable} AS r ON r.id_gift = g.id AND r.is_active = 1
        WHERE g.id_edition = :id AND g.is_active = 1
        GROUP BY g.id, g.name, g.value, g.quantity
        ORDER BY g.name ASC";

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
