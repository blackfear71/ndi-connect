<?php
require_once 'core/Model.php';

class RewardsRepository extends Model
{
    protected $table = 'rewards';

    /**
     * Lecture du nombre d'enregistrements
     */
    public function getGiftAttribution($id)
    {
        $sql = "SELECT COUNT(id) AS giftAttribution FROM {$this->table} WHERE id_gift = :id AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result['giftAttribution'] ?? 0;
    }
}
