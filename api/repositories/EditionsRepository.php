<?php
// Imports
require_once 'core/functions/Model.php';

require_once 'models/entities/Edition.php';

class EditionsRepository extends Model
{
    protected string $table = 'editions';
    protected string $playersTable = 'players';

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllEditions(): array
    {
        $sql = "SELECT e.id, e.location, e.start_date, COUNT(p.id) AS 'playerCount'
            FROM {$this->table} AS e
            LEFT JOIN {$this->playersTable} AS p ON p.id_edition = e.id AND p.is_active = 1
            WHERE e.is_active = 1
            GROUP BY e.id
            ORDER BY e.id ASC";

        $stmt = $this->db->query($sql);

        return array_map(fn($row) => new Edition(
            id: (int) $row['id'],
            location: $row['location'],
            startDate: new \DateTimeImmutable($row['start_date']),
            playerCount: (int) $row['playerCount']
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getEdition(int $idEdition): ?Edition
    {
        $sql = "SELECT id, location, start_date, end_date, picture, theme, challenge
            FROM {$this->table}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $idEdition
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Edition(
            id: (int) $row['id'],
            location: $row['location'],
            startDate: new \DateTimeImmutable($row['start_date']),
            endDate: new \DateTimeImmutable($row['end_date']),
            picture: $row['picture'],
            theme: $row['theme'],
            challenge: $row['challenge']
        );
    }

    /**
     * Lecture des éditions recherchées
     */
    public function getSearchEditions(string $search): array
    {
        $sql = "SELECT id, location, start_date
            FROM {$this->table}
            WHERE (CAST(start_date AS CHAR) LIKE :search OR location LIKE :search) AND is_active = 1
            ORDER BY id ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'search' => "%$search%"
        ]);

        return array_map(fn($row) => new Edition(
            id: (int) $row['id'],
            location: $row['location'],
            startDate: new \DateTimeImmutable($row['start_date'])
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function getEditionPicture(int $idEdition): ?string
    {
        $sql = "SELECT picture
            FROM {$this->table}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $idEdition
        ]);

        $result = $stmt->fetchColumn();

        return $result === false ? null : $result;
    }

    /**
     * Insertion d'une édition
     */
    public function createEdition(Edition $edition): string
    {
        $sql = "INSERT INTO {$this->table} (location, start_date, end_date, picture, theme, challenge, created_at, created_by, is_active)
            VALUES (:location, :start_date, :end_date, :picture, :theme, :challenge, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'location'   => $edition->location,
            'start_date' => $edition->startDate->format('Y-m-d H:i:s'),
            'end_date'   => $edition->endDate->format('Y-m-d H:i:s'),
            'picture'    => $edition->picture,
            'theme'      => $edition->theme,
            'challenge'  => $edition->challenge,
            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $edition->createdBy,
            'is_active'  => 1
        ]);

        return $this->db->lastInsertId();
    }

    /**
     * Modification d'une édition
     */
    public function updateEdition(Edition $edition): bool
    {
        $sql = "UPDATE {$this->table}
            SET location = :location, start_date = :start_date, end_date = :end_date, picture = :picture, theme = :theme, challenge = :challenge, updated_at = :updated_at, updated_by = :updated_by
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $edition->id,
            'location'   => $edition->location,
            'start_date' => $edition->startDate->format('Y-m-d H:i:s'),
            'end_date'   => $edition->endDate->format('Y-m-d H:i:s'),
            'picture'    => $edition->picture,
            'theme'      => $edition->theme,
            'challenge'  => $edition->challenge,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $edition->updatedBy
        ]);
    }
}
