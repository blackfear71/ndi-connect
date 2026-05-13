<?php
// Imports
require_once 'models/dtos/PlayerOutputDTO.php';
require_once 'models/dtos/RewardOutputDTO.php';

require_once 'services/EditionsService.php';
require_once 'services/RewardsService.php';

require_once 'repositories/PlayersRepository.php';

class PlayersService
{
    private PDO $db;

    private ?EditionsService $editionsService = null;
    private ?RewardsService $rewardsService = null;

    private PlayersRepository $playersRepository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->playersRepository = new PlayersRepository($db);
    }

    /**
     * Instancie le EditionsService si besoin
     */
    private function getEditionsService(): EditionsService
    {
        if ($this->editionsService === null) {
            $this->editionsService = new EditionsService($this->db);
        }

        return $this->editionsService;
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
    public function getEditionPlayers(int $editionId): ?array
    {
        // Contrôle des données
        if (!$editionId) {
            return null;
        }

        // Liste des participants
        $dataPlayers = $this->playersRepository->getEditionPlayers($editionId);

        // Récupération des données participants
        return array_map(function ($player) {
            $dataRewards = $this->getRewardsService()->getPlayerRewards($player->id);

            // Formatage des données récompenses
            $rewards = array_map(fn($reward) => new RewardOutputDTO(
                id: $reward->id,
                giftId: $reward->giftId,
                giftName: $reward->giftName
            ), $dataRewards);

            // Formatage des données participant
            return new PlayerOutputDTO(
                id: $player->id,
                name: $player->name,
                points: $player->points,
                rewards: $rewards
            );
        }, $dataPlayers);
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getPlayer(int $playerId): ?PlayerOutputDTO
    {
        // Contrôle des données
        if (!$playerId) {
            return null;
        }

        // Lecture du participant
        $player = $this->playersRepository->getPlayer($playerId);

        if (!$player) {
            return null;
        }

        // Récupération des données participant
        return new PlayerOutputDTO(
            id: $player->id,
            name: $player->name,
            points: $player->points
        );
    }

    /**
     * Création d'un participant
     */
    public function createPlayer(int $editionId, UserOutputDTO $user, PlayerInputDTO $data): ?bool
    {
        // Contrôle des données
        if (!$editionId || !$this->isValidPlayerData($data, $user->level, $editionId, 'editions', true)) {
            return null;
        }

        // Construction de l'objet
        $player = new Player(
            editionId: $editionId,
            name: trim($data->name),
            points: $data->points,
            createdBy: $user->id,
        );

        // Insertion
        return $this->playersRepository->createPlayer($player);
    }

    /**
     * Modification d'un participant
     */
    public function updatePlayer(int $playerId, UserOutputDTO $user, PlayerInputDTO $data): ?bool
    {
        // Contrôle des données
        if (!$playerId || !$this->isValidPlayerData($data, $user->level, $playerId, 'players', false)) {
            return null;
        }

        // Construction de l'objet
        $player = new Player(
            id: $playerId,
            name: trim($data->name),
            points: $data->points - $data->giveaway,
            updatedBy: $user->id,
        );

        // Modification
        if (!$this->playersRepository->updatePlayer($player)) {
            return null;
        }

        // Don de points
        if ($data->giveaway !== null && $data->giveaway > 0 && $data->giveawayPlayerId !== null && $data->giveawayPlayerId !== 0) {
            $giveawayPlayer = new Player(
                id: $data->giveawayPlayerId,
                points: $data->giveaway,
                updatedBy: $user->id,
            );

            return $this->playersRepository->updatePlayerPoints($giveawayPlayer);
        }

        return true;
    }

    /**
     * Modification des points d'un participant par ajout
     */
    public function updatePlayerPoints(int $playerId, int $delta, int $userId): ?bool
    {
        // Contrôle des données
        if (!$playerId) {
            return null;
        }

        // Construction de l'objet
        $player = new Player(
            id: $playerId,
            points: $delta,
            updatedBy: $userId,
        );

        // Modification des points d'un participant
        return $this->playersRepository->updatePlayerPoints($player);
    }

    /**
     * Suppression logique des participants d'une édition
     */
    public function deletePlayers(int $editionId, int $userId): ?bool
    {
        // Contrôle des données
        if (!$editionId) {
            return null;
        }

        // Suppression logique de participants d'une édition
        return $this->playersRepository->deletePlayers($editionId, $userId);
    }

    /**
     * Suppression logique d'un participant
     */
    public function deletePlayer(int $playerId, int $userId): ?bool
    {
        // Contrôle des données
        if (!$playerId) {
            return null;
        }

        // Suppression logique du participant
        return $this->playersRepository->deletePlayer($playerId, $userId);
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidPlayerData(PlayerInputDTO $data, int $level, int $id, string $typeId, bool $isCreation): bool
    {
        $name = trim($data->name);
        $giveaway = $data->giveaway ?? null;
        $giveawayPlayerId = $data->giveawayPlayerId ?? null;

        // Points
        $isPointsValid = $level == EnumUserRole::SUPERADMIN->value || $data->points >= 0;

        // Don de points
        $isGiveawayValid = $isCreation || (is_numeric($giveaway) && is_numeric($giveawayPlayerId) && (($giveaway > 0 && $giveawayPlayerId !== 0) || ($giveaway == 0 && $giveawayPlayerId == 0)));

        // Date de fin édition
        $endDate = $level !== EnumUserRole::SUPERADMIN->value ? $this->getEditionsService()->getEditionEndDateByType($id, $typeId) : null;

        return $name !== ''
            && $isPointsValid
            && $isGiveawayValid
            && ($level === EnumUserRole::SUPERADMIN->value || ($level === EnumUserRole::ADMIN->value && $endDate !== null && new \DateTimeImmutable() <= $endDate));
    }
}
