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
        if ($this->repository->create($user['login'], $data)) {
            return $this->getEditionPlayers($idEdition);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updatePlayer($idEdition, $idPlayer, $user, $data)
    {
        // Contrôle des données
        if (!$this->isValidPlayerData($user['level'], $data)) {
            return null;
        }

        // TODO : attention avec la mise à jour des points, actuellement ça écrase la valeur alors qu'il faut incrémenter la valeur

        // Modification et récupération des participants de l'édition
        if ($this->repository->update($idPlayer, $user['login'], $data)) {
            return $this->getEditionPlayers($idEdition);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deletePlayer($idEdition, $idPlayer, $login)
    {
        // Suppression logique du participant et récupération des participants de l'édition
        if ($this->repository->logicalDelete($idPlayer, $login)) {
            return $this->getEditionPlayers($idEdition);
        }
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidPlayerData($userLevel, $data)
    {
        $name = trim($data['name'] ?? '');
        $points = $data['points'] ?? null;

        return $name && is_numeric($points) && ($userLevel == UserRole::SUPERADMIN->value || $points >= 0);
    }
}
