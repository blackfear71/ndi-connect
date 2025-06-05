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
    public function getAllEditions()
    {
        return $this->repository->getAllEditions();
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getEdition($id)
    {
        return $this->repository->getEdition($id);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createEdition($login, $data)
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
    public function updateEdition($id, $login, $data)
    {
        // Contrôle des données
        if (!$this->isValidEditionData($data)) {
            return null;
        }

        // Modification
        if ( $this->repository->update($id, $login, $data)) {
            return $this->getEdition($id);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteEdition($id, $login)
    {
        return $this->repository->logicalDelete($id, $login);
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidEditionData($data)
    {
        $year = trim($data['year'] ?? '');
        $place = trim($data['place'] ?? '');

        return $year && is_numeric($year) && $year >= 1901 && $year <= 2155 && $place;
    }
}
