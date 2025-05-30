<?php
require_once 'repositories/EditionsRepository.php';

class EditionsService
{
    private $repository;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->repository = new EditionsRepository($db);
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function index()
    {
        return $this->repository->all();
    }

    /**
     * Lecture d'un enregistrement
     */
    public function show($id)
    {
        return $this->repository->find($id);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function create($data)
    {
        return $this->repository->create($data);
    }

    /**
     * Modification d'un enregistrement
     */
    public function update($id, $data)
    {
        return $this->repository->update($id, $data);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function delete($id)
    {
        return $this->repository->delete($id);
    }
}
