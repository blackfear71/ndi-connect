<?php
// Imports
require_once 'models/entities/Card.php';

class CardsRepository
{
    protected PDO $db;

    protected string $cardsTable = 'cards';
    protected string $editionsTable = 'editions';
    protected string $playersTable = 'players';

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllCards(): array
    {
        $sql = "SELECT c.id, c.code, c.edition_id, c.player_id, p.name
            FROM {$this->cardsTable} AS c
            INNER JOIN {$this->editionsTable} AS e ON e.id = c.edition_id AND e.is_active = 1
            INNER JOIN {$this->playersTable} AS p ON p.id = c.player_id AND p.is_active = 1
            WHERE c.is_active = 1
            GROUP BY c.id
            ORDER BY c.id ASC";

        $stmt = $this->db->query($sql);

        return array_map(fn($row) => new Card(
            id: (int) $row['id'],
            editionId: (int) $row['edition_id'],
            playerId: (int) $row['player_id'],
            playerName: $row['name'],
            code: $row['code']
        ), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Lecture d'un enregistrement par code
     */
    public function getCardByCode(int $editionId, string $code): ?Card
    {
        $sql = "SELECT id, edition_id, player_id, code
            FROM {$this->cardsTable}
            WHERE edition_id = :edition_id AND code = :code AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'edition_id' => $editionId,
            'code'       => $code
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Card(
            id: (int) $row['id'],
            editionId: (int) $row['edition_id'],
            playerId: (int) $row['player_id'],
            code: $row['code']
        );
    }

    /**
     * Lecture de la carte d'un participant
     */
    public function getCardByPlayerId(int $playerId): ?Card
    {
        $sql = "SELECT id, edition_id, player_id, code
            FROM {$this->cardsTable}
            WHERE player_id = :player_id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'player_id' => $playerId
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Card(
            id: (int) $row['id'],
            editionId: (int) $row['edition_id'],
            playerId: (int) $row['player_id'],
            code: $row['code']
        );
    }

    /**
     * Insertion d'une carte
     */
    public function createCard(Card $card): bool
    {
        $sql = "INSERT INTO {$this->cardsTable} (edition_id, player_id, code, created_at, created_by, is_active)
            VALUES (:edition_id, :player_id, :code, :created_at, :created_by, :is_active)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'edition_id' => $card->editionId,
            'player_id'  => $card->playerId,
            'code'       => $card->code,
            'created_at' => date('Y-m-d H:i:s'),
            'created_by' => $card->createdBy,
            'is_active'  => 1
        ]);
    }

    /**
     * Remplacement du code d'une carte par Id
     */
    public function updateCardCode(Card $card): bool
    {
        $sql = "UPDATE {$this->cardsTable}
            SET code = :code, updated_at = :updated_at, updated_by = :updated_by
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $card->id,
            'code'       => $card->code,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => $card->updatedBy
        ]);
    }

    /**
     * Suppression physique d'une carte par Id
     */
    public function deleteCard(int $cardId): bool
    {
        $sql = "DELETE FROM {$this->cardsTable}
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id' => $cardId
        ]);
    }

    /**
     * Suppression physique des cartes d'un participant
     */
    public function deletePlayerCards(int $playerId): bool
    {
        $sql = "DELETE FROM {$this->cardsTable}
            WHERE player_id = :player_id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'player_id' => $playerId
        ]);
    }

    /**
     * Suppression physique des cartes d'une édition
     */
    public function deleteEditionCards(int $editionId): bool
    {
        $sql = "DELETE FROM {$this->cardsTable}
            WHERE edition_id = :edition_id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'edition_id' => $editionId
        ]);
    }
}
