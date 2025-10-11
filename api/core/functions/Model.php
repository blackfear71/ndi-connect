<?php
class Model
{
    protected $db;
    protected $table;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->db = $db;
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function all()
    {
        $sql = "SELECT * FROM {$this->table} WHERE is_active = 1 ORDER BY id ASC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Lecture d'un enregistrement par Id
     */
    public function find($id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = :id AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Insertion d'un enregistrement (table à colonnes dynamiques)
     */
    public function create($login, $data)
    {
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['created_by'] = $login;

        $columns = implode(', ', array_keys($data));
        $params = ':' . implode(', :', array_keys($data));

        $sql = "INSERT INTO {$this->table} ($columns) VALUES ($params)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);

        return $this->db->lastInsertId();
    }

    /**
     * Modification d'un enregistrement par Id
     */
    public function update($id, $login, $data)
    {
        $data['updated_at'] = date('Y-m-d H:i:s');
        $data['updated_by'] = $login;

        $fields = [];

        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
        }

        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);

        $data['id'] = $id;

        return $stmt->execute($data);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function logicalDelete($id, $login)
    {
        $data['deleted_at'] = date('Y-m-d H:i:s');
        $data['deleted_by'] = $login;
        $data['is_active'] = 0;

        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
        }

        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);

        $data['id'] = $id;
        return $stmt->execute($data);
    }

    /**
     * Suppression physique d'un enregistrement
     */
    public function physicalDelete($id)
    {
        $sql = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}
