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
        $sql = "SELECT * FROM {$this->table} WHERE is_active = 1 ORDER BY id ASC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Récupérer un enregistrement par ID
    public function find($id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = :id AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Créer un enregistrement (table à colonnes dynamiques)
    public function create($data)
    {
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['created_by'] = 'test';

        $columns = implode(', ', array_keys($data));
        $params = ':' . implode(', :', array_keys($data));
        
        // TODO : attention le type compte, j'ai passé YEAR en VARCHAR(4) mais si je veux revenir dessus il faut convertir avant d'insérer
        
        $sql = "INSERT INTO {$this->table} ($columns) VALUES ($params)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);

        return $this->find($this->db->lastInsertId());
    }

    // Mettre à jour un enregistrement par ID
    public function update($id, $data)
    {
        $data['updated_at'] = date('Y-m-d H:i:s');
        $data['updated_by'] = 'test';

        $fields = [];

        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
        }

        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);

        $data['id'] = $id;
        $stmt->execute($data);

        return $this->find($id);
    }

    // Supprimer logiquement un enregistrement
    public function delete($id)
    {
        $data['is_active'] = 0;
        $data['deleted_at'] = date('Y-m-d H:i:s');

        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
        }

        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);

        $data['id'] = $id;
        return $stmt->execute($data);

        // $sql = "DELETE FROM {$this->table} WHERE id = :id";
        // $stmt = $this->db->prepare($sql);
        // return $stmt->execute(['id' => $id]);
    }
}
