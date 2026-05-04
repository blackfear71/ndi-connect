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
    public function getRewardCount(int $id): int
    {
        $sql = "SELECT COUNT(id) AS reward_count
            FROM {$this->table}
            WHERE id_gift = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $id
        ]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result['reward_count'] ?? 0;
    }

    /**
     * Lecture des enregistrements d'un participant (y compris les cadeaux supprimés)
     */
    public function getPlayerRewards(int $id): array
    {
        $sql = "SELECT r.id, r.id_gift, g.name
            FROM {$this->table} AS r
            LEFT JOIN {$this->giftsTable} AS g ON g.id = r.id_gift
            WHERE r.id_player = :id AND r.is_active = 1
            ORDER BY r.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $id
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
    public function getReward(int $id): ?Reward
    {
        $sql = "SELECT id, id_player, points
            FROM {$this->table}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $id
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
