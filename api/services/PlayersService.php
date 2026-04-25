<?php
// Imports
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
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->repository = new PlayersRepository($db);
    }

    /**
     * Instancie le RewardsService si besoin
     */
    private function getRewardsService(): RewardsService
    {
        if ($this->rewardsService === null) {
            $this->rewardsService = new RewardsService($this->db);
        }
        
        return $this->rewardsService;
    }

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionPlayers(int|string $id): array
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
    public function getPlayer(int|string $id): array|false
    {
        return $this->repository->find($id);
    }

    /**
     * Création d'un participant
     */
    public function createPlayer(int|string $idEdition, array $user, array $data): ?bool
    {
        // Contrôle des données
        if (!$this->isValidPlayerData($user['level'], $data, true)) {
            return null;
        }

        // Insertion
        if ($idEdition && $this->repository->createPlayer($user['login'], $data)) {
            return true;
        }

        return null;
    }

    /**
     * Modification d'un participant
     */
    public function updatePlayer(int|string $idEdition, int|string $idPlayer, array $user, array $data): ?bool
    {
        // Contrôle des données
        if (!$this->isValidPlayerData($user['level'], $data, false)) {
            return null;
        }

        // Modifications
        $dataPlayer = $this->processDataPlayer($data);

        if ($idEdition && $idPlayer && $this->repository->updatePlayer($idPlayer, $user['login'], $dataPlayer)) {
            // Don de points
            if ($data['giveaway'] > 0 && $data['giveawayId'] != 0) {
                $this->updatePlayerDelta($data['giveawayId'], $user['login'], $data['giveaway']);
            }

            return true;
        }

        return null;
    }

    /**
     * Modification des points d'un participant
     */
    public function updatePlayerPoints(int|string $idPlayer, string $login, array $data): bool
    {
        // Modification des points d'un participant
        return $this->repository->updatePlayerPoints($idPlayer, $login, $data);
    }

    /**
     * Modification des points d'un participant par ajout
     */
    public function updatePlayerDelta(int|string $idPlayer, string $login, int $delta): bool
    {
        // Modification des points d'un participant
        return $this->repository->updatePlayerDelta($idPlayer, $login, $delta);
    }

    /**
     * Suppression logique des participants d'une édition
     */
    public function deletePlayers(int|string $id, string $login): bool
    {
        return $this->repository->deletePlayers($id, $login);
    }

    /**
     * Suppression logique d'un participant
     */
    public function deletePlayer(int|string $idEdition, int|string $idPlayer, string $login): ?bool
    {
        // Suppression logique du participant
        if ($idEdition && $idPlayer && $this->repository->logicalDelete($idPlayer, $login)) {
            return true;
        }

        return null;
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidPlayerData(int $userLevel, array $data, bool $isCreate): bool
    {
        $name = trim($data['name'] ?? '');
        $delta = $data['delta'] ?? null;
        $giveaway = $data['giveaway'] ?? null;
        $giveawayId = $data['giveawayId'] ?? null;

        $isDeltaValid = is_numeric($delta) && ($userLevel == EnumUserRole::SUPERADMIN->value || $delta >= 0);
        $isGiveawayValid = $isCreate || (is_numeric($giveaway) && is_numeric($giveawayId) && (($giveaway > 0 && $giveawayId != 0) || ($giveaway == 0 && $giveawayId == 0)));

        return $name
            && $isDeltaValid
            && $isGiveawayValid;
    }

    /**
     * Formate les données avant traitement SQL (participant)
     */
    private function processDataPlayer(array $data): array
    {
        $sqlData = [
            'name'  => $data['name'],
            'delta' => $data['delta'] - $data['giveaway']
        ];

        return $sqlData;
    }
}
