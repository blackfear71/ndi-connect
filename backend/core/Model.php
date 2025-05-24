<?php
class Model
{
    protected $db;
    protected $table;

    public function __construct($db)
    {
        $this->db = $db;
    }

    // Récupérer tous les enregistrements
    public function all()
    {
        $sql = "SELECT * FROM {$this->table} ORDER BY test_id ASC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Récupérer un enregistrement par ID
    public function find($id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE test_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Créer un enregistrement (table à colonnes dynamiques)
    public function create($data)
    {
        $columns = implode(', ', array_keys($data));
        $params = ':' . implode(', :', array_keys($data));

        $sql = "INSERT INTO {$this->table} ($columns) VALUES ($params)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);

        return $this->find($this->db->lastInsertId());
    }

    // Mettre à jour un enregistrement par ID
    public function update($id, $data)
    {
        $fields = [];
        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
        }
        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE test_id = :id";
        $stmt = $this->db->prepare($sql);

        $data['id'] = $id;
        $stmt->execute($data);

        return $this->find($id);
    }

    // Supprimer un enregistrement
    public function delete($id)
    {
        $sql = "DELETE FROM {$this->table} WHERE test_id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}
