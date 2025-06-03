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
    public function create($login, $data)
    {
        // Contrôle des données
        if (!$this->isValidEditionData($data)) {
            return null;
        }

        // Insertion
        return $this->repository->create($login, $data);
    }

    /**
     * Modification d'un enregistrement
     */
    public function update($id, $login, $data)
    {
        // Contrôle des données
        if (!$this->isValidEditionData($data)) {
            return null;
        }

        // Modification
        return $this->repository->update($id, $login, $data);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function delete($id, $login)
    {
        return $this->repository->logicalDelete($id, $login);
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidEditionData(array $data): bool
    {
        $year = trim($data['year'] ?? '');
        $place = trim($data['place'] ?? '');

        return $year && is_numeric($year) && $year >= 1901 && $year <= 2155 && $place;
    }
}
