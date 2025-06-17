<?php
require_once 'repositories/GiftsRepository.php';

class GiftsService
{
    private $repository;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->repository = new GiftsRepository($db);
    }

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionGifts($id)
    {
        return $this->repository->getEditionGifts($id);
    }

    /**
     * Suppression logique des cadeaux d'une édition
     */
    public function deleteGifts($id, $login)
    {
        return $this->repository->deleteGifts($id, $login);
    }

    /**
     * Création d'un cadeau
     */
    public function createGift($idEdition, $user, $data)
    {
        // Contrôle des données
        if (!$this->isValidGiftData($user['level'], $data)) {
            return null;
        }

        // Insertion et récupération des cadeaux de l'édition
        if ($this->repository->create($user['login'], $data)) {
            return $this->getEditionGifts($idEdition);
        }

        return null;
    }

    /**
     * Modification d'un cadeau
     */
    public function updateGift($idEdition, $idGift, $user, $data)
    {
        // Contrôle des données
        if (!$this->isValidGiftData($user['level'], $data)) {
            return null;
        }

        // Modification et récupération des cadeaux de l'édition
        if ($this->repository->update($idGift, $user['login'], $data)) {
            return $this->getEditionGifts($idEdition);
        }

        return null;
    }

    /**
     * Suppression logique d'un cadeau
     */
    public function deleteGift($idEdition, $idGift, $login)
    {
        // Suppression logique du cadeau et récupération des cadeaux de l'édition
        if ($this->repository->logicalDelete($idGift, $login)) {
            return $this->getEditionGifts($idEdition);
        }

        return null;
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidGiftData($userLevel, $data)
    {
        $name = trim($data['name'] ?? '');
        $value = $data['value'] ?? null;
        $quantity = $data['quantity'] ?? null;

        return $name && is_numeric($value) && $value > 0 && is_numeric($quantity) && $quantity >= 0;
    }
}
