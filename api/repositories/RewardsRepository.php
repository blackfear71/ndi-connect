<?php
// Imports
require_once 'core/functions/Model.php';

require_once 'models/entities/Reward.php';

class RewardsRepository extends Model
{
    protected string $table = 'rewards';
    protected string $giftsTable = 'gifts';

    /**
     * Lecture du nombre d'enregistrements
     */
    public function getRewardCount(int $idGift): int
    {
        $sql = "SELECT COUNT(id)
            FROM {$this->table}
            WHERE id_gift = :id_gift AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id_gift' => $idGift]);

        return (int) $stmt->fetchColumn();
    }

    /**
     * Lecture des enregistrements d'un participant (y compris les cadeaux supprimés)
     */
    public function getPlayerRewards(int $idPlayer): array
    {
        $sql = "SELECT r.id, r.id_gift, g.name
            FROM {$this->table} AS r
            LEFT JOIN {$this->giftsTable} AS g ON g.id = r.id_gift
            WHERE r.id_player = :id_player AND r.is_active = 1
            ORDER BY r.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id_player' => $idPlayer
        ]);

        return array_map(fn($row) => new Reward(
            id: (int) $row['id'],
            idGift: (int) $row['id_gift'],
            giftName: $row['name']
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getReward(int $idReward): ?Reward
    {
        $sql = "SELECT id, id_player, points
            FROM {$this->table}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $idReward
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Reward(
            id: (int) $row['id'],
            idPlayer: (int) $row['id_player'],
            points: (int) $row['points']
        );
    }

    /**
     * Insertion d'une récompense
     */
    public function createReward(Reward $reward): bool
    {
        $sql = "INSERT INTO {$this->table} (id_player, id_gift, points, created_at, created_by, is_active)
            VALUES (:id_player, :id_gift, :points, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id_player'  => $reward->idPlayer,
            'id_gift'    => $reward->idGift,
            'points'     => $reward->points,
            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $reward->createdBy,
            'is_active'  => 1
        ]);
    }
}
