<?php
class Model
{
    // TODO : objets d'insert/update ici, si on a des objets spécifiques à transférer dans chaque repository si ce n'est pas faisable avec mixed
    // TODO : revoir la mise en forme des requêtes

    protected PDO $db;
    protected string $modelTable;

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
    // TODO : supprimer si pas utile
    public function all(): array
    {
        $sql = "SELECT *
            FROM {$this->table}
            WHERE is_active = 1
            ORDER BY id ASC";

        $stmt = $this->db->query($sql);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    // TODO : supprimer si pas utile
    public function find(int|string $id): array|false
    {
        $sql = "SELECT *
            FROM {$this->table}
            WHERE id = :id AND is_active = 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $id
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Insertion d'un enregistrement (table à colonnes dynamiques)
     */
    // TODO : supprimer si pas utile
    public function create(string $login, array $data): string
    {
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['created_by'] = $login;

        $columns = implode(', ', array_keys($data));
        $params = ':' . implode(', :', array_keys($data));

        $sql = "INSERT INTO {$this->table} ($columns)
            VALUES ($params)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);

        return $this->db->lastInsertId();
    }

    /**
     * Modification d'un enregistrement par Id
     */
    // TODO : supprimer si pas utile
    public function update(int|string $id, string $login, array $data): bool
    {
        $data['updated_at'] = date('Y-m-d H:i:s');
        $data['updated_by'] = $login;

        $fields = [];

        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
        }

        $sql = "UPDATE {$this->table}
            SET " . implode(', ', $fields) . "
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        $data['id'] = $id;

        return $stmt->execute($data);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function logicalDelete(int|string $id, string $login): bool
    {
        $sql = "UPDATE {$this->table}
            SET deleted_at = :deleted_at, deleted_by = :deleted_by, is_active = :is_active
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id'         => $id,
            'deleted_at' => $login,
            'deleted_by' => date('Y-m-d H:i:s'),
            'is_active'  => 0
        ]);
    }

    /**
     * Suppression physique d'un enregistrement
     */
    public function physicalDelete(int|string $id): bool
    {
        $sql = "DELETE FROM {$this->table}
            WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id' => $id
        ]);
    }
}
