<?php
require_once 'core/Model.php';

class RewardsRepository extends Model
{
    protected $table = 'rewards';
    protected $giftsTable = 'gifts';

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

    /**
     * Lecture des enregistrements d'un participant
     */
    public function getPlayerGifts($id)
    {
        $sql = "SELECT r.id, r.id_gift, g.name FROM {$this->table} AS r
        LEFT JOIN {$this->giftsTable} AS g ON g.id = r.id_gift AND g.is_active = 1
        WHERE r.id_player = :id AND r.is_active = 1
        ORDER BY r.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
