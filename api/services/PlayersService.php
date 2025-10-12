<?php
require_once 'services/RewardsService.php';

require_once 'repositories/PlayersRepository.php';

class PlayersService
{
    private $rewardsService = null;

    private $db;
    private $repository;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->db = $db;
        $this->repository = new PlayersRepository($db);
    }

    /**
     * Instancie le RewardsService si besoin
     */
    private function getRewardsService()
    {
        if ($this->rewardsService === null) {
            $this->rewardsService = new RewardsService($this->db);
        }
        return $this->rewardsService;
    }

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionPlayers($id)
    {
        // Liste des participants
        $players = $this->repository->getEditionPlayers($id);

        // Cadeaux obtenus
        foreach ($players as &$player) {
            $player['rewards'] = $this->getRewardsService()->getPlayerRewards($player['id']);
        }

        return $players;
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getPlayer($id)
    {
        return $this->repository->find($id);
    }

    /**
     * Création d'un participant
     */
    public function createPlayer($idEdition, $user, $data)
    {
        // Contrôle des données
        if (!$this->isValidPlayerData($user['level'], $data, true)) {
            return null;
        }

        // Insertion et récupération des participants de l'édition
        if ($idEdition && $this->repository->createPlayer($user['login'], $data)) {
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
        if (!$this->isValidPlayerData($user['level'], $data, false)) {
            return null;
        }

        // Modifications et récupération des participants de l'édition
        $dataPlayer = $this->processDataPlayer($data);

        if ($idEdition && $idPlayer && $this->repository->updatePlayer($idPlayer, $user['login'], $dataPlayer)) {
            // Don de points
            if ($data['giveaway'] > 0 && $data['giveawayId'] != 0) {
                $this->updatePlayerDelta($data['giveawayId'], $user['login'], $data['giveaway']);
            }

            return $this->getEditionPlayers($idEdition);
        }

        return null;
    }

    /**
     * Modification des points d'un participant
     */
    public function updatePlayerPoints($idPlayer, $login, $data)
    {
        // Modification des points d'un participant
        return $this->repository->updatePlayerPoints($idPlayer, $login, $data);
    }

    /**
     * Modification des points d'un participant par ajout
     */
    public function updatePlayerDelta($idPlayer, $login, $delta)
    {
        // Modification des points d'un participant
        return $this->repository->updatePlayerDelta($idPlayer, $login, $delta);
    }

    /**
     * Suppression logique des participants d'une édition
     */
    public function deletePlayers($id, $login)
    {
        return $this->repository->deletePlayers($id, $login);
    }

    /**
     * Suppression logique d'un participant
     */
    public function deletePlayer($idEdition, $idPlayer, $login)
    {
        // Suppression logique du participant et récupération des participants de l'édition
        if ($idEdition && $idPlayer && $this->repository->logicalDelete($idPlayer, $login)) {
            return $this->getEditionPlayers($idEdition);
        }

        return null;
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidPlayerData($userLevel, $data, $isCreate)
    {
        $name = trim($data['name'] ?? '');
        $delta = $data['delta'] ?? null;
        $giveaway = $data['giveaway'] ?? null;
        $giveawayId = $data['giveawayId'] ?? null;

        $isDeltaValid = is_numeric($delta) && ($userLevel == UserRole::SUPERADMIN->value || $delta >= 0);
        $isGiveawayValid = $isCreate || (is_numeric($giveaway) && is_numeric($giveawayId) && (($giveaway > 0 && $giveawayId != 0) || ($giveaway == 0 && $giveawayId == 0)));

        return $name
            && $isDeltaValid
            && $isGiveawayValid;
    }

    /**
     * Formate les données avant traitement SQL (participant)
     */
    private function processDataPlayer($data)
    {
        $sqlData = [
            'name'  => $data['name'],
            'delta' => $data['delta'] - $data['giveaway']
        ];

        return $sqlData;
    }
}
