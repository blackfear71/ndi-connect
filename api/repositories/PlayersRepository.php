<?php
// Imports
require_once 'core/functions/Model.php';

require_once 'models/entities/Player.php';

class PlayersRepository extends Model
{
    protected string $table = 'players';

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionPlayers(int $idEdition): array
    {
        $sql = "SELECT id, name, points
            FROM {$this->table}
            WHERE id_edition = :id_edition AND is_active = 1
            ORDER BY name ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id_edition' => $idEdition
        ]);

        return array_map(fn($row) => new Player(
            id: (int) $row['id'],
            name: $row['name'],
            points: (int) $row['points']
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getPlayer(int $idPlayer): ?Player
    {
        $sql = "SELECT id, name, points
            FROM {$this->table}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $idPlayer
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Player(
            id: (int) $row['id'],
            name: $row['name'],
            points: (int) $row['points']
        );
    }

    /**
     * Insertion d'un joueur
     */
    public function createPlayer(Player $player): bool
    {
        $sql = "INSERT INTO {$this->table} (id_edition, name, points, created_at, created_by, is_active)
            VALUES (:id_edition, :name, :points, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id_edition' => $player->idEdition,
            'name'       => $player->name,
            'points'     => $player->points,
            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $player->createdBy,
            'is_active'  => 1
        ]);
    }

    /**
     * Modification d'un joueur par Id
     */
    public function updatePlayer(Player $player): bool
    {
        $sql = "UPDATE {$this->table} 
            SET name = :name, points = points + :delta, updated_at = :updated_at, updated_by = :updated_by 
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $player->id,
            'name'       => $player->name,
            'delta'      => $player->points,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $player->updatedBy
        ]);
    }

    /**
     * Modification d'un joueur par Id
     */
    public function updatePlayerPoints(Player $player): bool
    {
        $sql = "UPDATE {$this->table}
            SET points = points + :delta, updated_at = :updated_at, updated_by = :updated_by
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $player->id,
            'delta'      => $player->points,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $player->updatedBy
        ]);
    }

    /**
     * Suppression logique des participants d'une édition
     */
    public function deletePlayers(int $idEdition, string $login): bool
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
