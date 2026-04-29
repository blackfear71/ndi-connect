<?php
// Imports
require_once 'models/dtos/PlayerOutputDTO.php';
require_once 'models/dtos/RewardOutputDTO.php';

require_once 'services/RewardsService.php';

require_once 'repositories/PlayersRepository.php';

class PlayersService
{
    private PDO $db;
    private ?RewardsService $rewardsService = null;
    private PlayersRepository $repository;

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
        $dataPlayers = $this->repository->getEditionPlayers($id);

        // Récupération des données participants
        return array_map(function ($player) {
            $dataRewards = $this->getRewardsService()->getPlayerRewards($player->id);

            // Formatage des données récompenses
            $rewards = array_map(fn($reward) => new RewardOutputDTO(
                id: $reward->id,
                idGift: $reward->idGift,
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
    public function getPlayer(int|string $id): ?PlayerOutputDTO
    {
        // Lecture du participant
        $player = $this->repository->getPlayer($id);

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
    public function createPlayer(int|string $idEdition, UserOutputDTO $user, PlayerInputDTO $data): ?bool
    {
        // Contrôle des données
        if (!$idEdition || !$this->isValidPlayerData($user->level, $data, true)) {
            return null;
        }

        // Construction de l'objet
        $player = new Player(
            idEdition: (int) $idEdition,
            name: $data->name,
            points: (int) $data->points,
            createdBy: $user->login,
        );

        // Insertion
        return $this->repository->createPlayer($player);
    }

    /**
     * Modification d'un participant
     */
    public function updatePlayer(int|string $idEdition, int|string $idPlayer, UserOutputDTO $user, PlayerInputDTO $data): ?bool
    {
        // Contrôle des données
        if (!$idEdition || !$idPlayer || !$this->isValidPlayerData($user->level, $data, false)) {
            return null;
        }

        // Construction de l'objet
        $player = new Player(
            id: (int) $idPlayer,
            name: $data->name,
            points: (int) ($data->points - $data->giveaway),
            updatedBy: $user->login,
        );

        // Modification
        if (!$this->repository->updatePlayer($player)) {
            return null;
        }

        // Don de points
        if ($data->giveaway > 0 && $data->giveawayPlayerId !== null && $data->giveawayPlayerId !== 0) {
            $giveawayPlayer = new Player(
                id: (int) $data->giveawayPlayerId,
                points: (int) $data->giveaway,
                updatedBy: $user->login,
            );

            return $this->repository->updatePlayerDelta($giveawayPlayer);
        }

        return true;
    }

    /**
     * Modification des points d'un participant
     */
    // TODO : chercher les "array $data" ou juste "array" pour vérifier s'il y a des oublis => OK pour "array $data", reste "array"
    public function updatePlayerPoints(int|string $idPlayer, int $points, string $login): bool
    {
        // Construction de l'objet
        $player = new Player(
            id: $idPlayer,
            points: $points,
            updatedBy: $login,
        );

        // Modification des points d'un participant
        return $this->repository->updatePlayerPoints($player);
    }

    /**
     * Modification des points d'un participant par ajout
     */
    // TODO : voir pour supprimer cette méthode et utiliser celle au dessus qui est PRESQUE identique (delta à gérer côté service)
    public function updatePlayerDelta(int|string $idPlayer, int $delta, string $login): bool
    {
        // Construction de l'objet
        $player = new Player(
            id: $idPlayer,
            points: $delta,
            updatedBy: $login,
        );

        // Modification des points d'un participant
        return $this->repository->updatePlayerDelta($player);
    }

    /**
     * Suppression logique des participants d'une édition
     */
    public function deletePlayers(int|string $id, string $login): ?bool
    {
        // Contrôle des données
        if (!$id) {
            return null;
        }

        // Suppression logique de participants d'une édition
        return $this->repository->deletePlayers($id, $login);
    }

    /**
     * Suppression logique d'un participant
     */
    public function deletePlayer(int|string $idEdition, int|string $idPlayer, string $login): ?bool
    {
        // Contrôle des données
        if (!$idEdition || !$idPlayer) {
            return null;
        }

        // Suppression logique du participant
        return $this->repository->logicalDelete($idPlayer, $login);
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidPlayerData(int $userLevel, PlayerInputDTO $data, bool $isCreation): bool
    {
        // TODO : revoir ce genre de tests partout (chercher "function isValid") car selon le type certains tests sont inutiles si pas nullable par exemple
        $name = trim($data->name);
        $giveaway = $data->giveaway ?? null;
        $giveawayPlayerId = $data->giveawayPlayerId ?? null;

        $isPointsValid = is_numeric($data->points) && ($userLevel == EnumUserRole::SUPERADMIN->value || $data->points >= 0);
        $isGiveawayValid = $isCreation || (is_numeric($giveaway) && is_numeric($giveawayPlayerId) && (($giveaway > 0 && $giveawayPlayerId !== 0) || ($giveaway == 0 && $giveawayPlayerId == 0)));

        return $name !== ''
            && $isPointsValid
            && $isGiveawayValid;
    }
}
