<?php
// Imports
require_once 'core/functions/Model.php';

require_once 'models/entities/Gift.php';

class GiftsRepository extends Model
{
    protected string $table = 'gifts';
    protected string $rewardsTable = 'rewards';

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionGifts(int $idEdition): array
    {
        $sql = "SELECT g.id, g.id_edition, g.name, g.value, g.quantity, COUNT(r.id) AS reward_count
            FROM {$this->table} AS g
            LEFT JOIN {$this->rewardsTable} AS r ON r.id_gift = g.id AND r.is_active = 1
            WHERE g.id_edition = :id_edition AND g.is_active = 1
            GROUP BY g.id, g.name, g.value, g.quantity
            ORDER BY g.name ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id_edition' => $idEdition
        ]);

        return array_map(fn($row) => new Gift(
            id: (int) $row['id'],
            idEdition: (int) $row['id_edition'],
            name: $row['name'],
            value: (int) $row['value'],
            quantity: (int) $row['quantity'],
            rewardCount: (int) $row['reward_count']
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getGift(int $idGift): ?Gift
    {
        $sql = "SELECT id, value, quantity
            FROM {$this->table}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $idGift
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Gift(
            id: (int) $row['id'],
            value: (int) $row['value'],
            quantity: (int) $row['quantity']
        );
    }

    /**
     * Insertion d'un cadeau
     */
    public function createGift(Gift $gift): bool
    {
        $sql = "INSERT INTO {$this->table} (id_edition, name, value, quantity, created_at, created_by, is_active)
            VALUES (:id_edition, :name, :value, :quantity, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id_edition' => $gift->idEdition,
            'name'       => $gift->name,
            'value'      => $gift->value,
            'quantity'   => $gift->quantity,
            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $gift->createdBy,
            'is_active'  => 1
        ]);
    }

    /**
     * Modification d'un cadeau par Id
     */
    public function updateGift(Gift $gift): bool
    {
        $sql = "UPDATE {$this->table} 
            SET name = :name, value = :value, quantity = :quantity, updated_at = :updated_at, updated_by = :updated_by 
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $gift->id,
            'name'       => $gift->name,
            'value'      => $gift->value,
            'quantity'   => $gift->quantity,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $gift->updatedBy
        ]);
    }

    /**
     * Suppression logique des cadeaux d'une édition
     */
    public function deleteGifts(int $idEdition, string $login): bool
    {
        $sql = "UPDATE {$this->table}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE id_edition = :id_edition";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id_edition' => $idEdition,
            'deleted_at' => date('Y-m-d H:i:s'),
            'deleted_by' => $login,
            'is_active'  => 0
        ]);
    }
}
