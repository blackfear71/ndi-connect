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
}
