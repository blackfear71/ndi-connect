<?php
require_once 'repositories/EditionsRepository.php';

class EditionsService
{
    private $model;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->model = new EditionsRepository($db);
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function index()
    {
        return $this->model->all();
    }

    /**
     * Lecture d'un enregistrement
     */
    public function show($id)
    {
        return $this->model->find($id);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function create($data)
    {
        return $this->model->create($data);
    }

    /**
     * Modification d'un enregistrement
     */
    public function update($id, $data)
    {
        return $this->model->update($id, $data);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function delete($id)
    {
        return $this->model->delete($id);
    }
}
