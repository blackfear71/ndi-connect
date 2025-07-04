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

    /**
     * Création d'un participant
     */
    public function createPlayer($idEdition, $user, $data)
    {
        // Contrôle des données
        if (!$this->isValidPlayerData($user['level'], $data)) {
            return null;
        }

        // Insertion et récupération des participants de l'édition
        if ($this->repository->createPlayer($user['login'], $data)) {
            return $this->getEditionPlayers($idEdition);
        }

        return null;
    }

    /**
     * Modification d'un participant
     */
    public function updatePlayer($idEdition, $idPlayer, $user, $data)
    {
        // Contrôle des données
        if (!$this->isValidPlayerData($user['level'], $data)) {
            return null;
        }

        // Modification et récupération des participants de l'édition
        if ($this->repository->updatePlayer($idPlayer, $user['login'], $data)) {
            return $this->getEditionPlayers($idEdition);
        }

        return null;
    }

    /**
     * Suppression logique d'un participant
     */
    public function deletePlayer($idEdition, $idPlayer, $login)
    {
        // Suppression logique du participant et récupération des participants de l'édition
        if ($this->repository->logicalDelete($idPlayer, $login)) {
            return $this->getEditionPlayers($idEdition);
        }

        return null;
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidPlayerData($userLevel, $data)
    {
        $name = trim($data['name'] ?? '');
        $delta = $data['delta'] ?? null;

        return $name && is_numeric($delta) && ($userLevel == UserRole::SUPERADMIN->value || $delta >= 0);
    }
}
