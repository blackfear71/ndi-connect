<?php
require_once 'repositories/PlayersRepository.php';

class PlayersService
{
    private $repository;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->repository = new PlayersRepository($db);
    }

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionPlayers($id)
    {
        return $this->repository->getEditionPlayers($id);
    }

    /**
     * Suppression logique des participants d'une édition
     */
    public function deletePlayers($id, $login)
    {
        return $this->repository->deletePlayers($id, $login);
    }    
}
