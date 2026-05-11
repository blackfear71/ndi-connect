<?php
// Imports
require_once 'services/GiftsService.php';
require_once 'services/PlayersService.php';

require_once 'repositories/RewardsRepository.php';

class RewardsService
{
    private PDO $db;
    private ?GiftsService $giftsService = null;
    private ?PlayersService $playersService = null;
    private RewardsRepository $repository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->repository = new RewardsRepository($db);
    }

    /**
     * Instancie le GiftsService si besoin
     */
    private function getGiftsService(): GiftsService
    {
        if ($this->giftsService === null) {
            $this->giftsService = new GiftsService($this->db);
        }

        return $this->giftsService;
    }

    /**
     * Instancie le PlayersService si besoin
     */
    private function getPlayersService(): PlayersService
    {
        if ($this->playersService === null) {
            $this->playersService = new PlayersService($this->db);
        }

        return $this->playersService;
    }

    /**
     * Récupération du nombre d'attributions d'un cadeau
     */
    public function getRewardCount(int $giftId): ?int
    {
        // Contrôle des données
        if (!$giftId) {
            return null;
        }

        return $this->repository->getRewardCount($giftId);
    }

    /**
     * Récupération des cadeaux d'un participant
     */
    public function getPlayerRewards(int $playerId): array
    {
        return $this->repository->getPlayerRewards($playerId);
    }

    /**
     * Attribution d'un cadeau
     */
    public function createReward(int $giftId, int $playerId, int $userId): ?bool
    {
        // Contrôle des données
        if (!$giftId || !$playerId) {
            return null;
        }

        // Récupération du cadeau
        $gift = $this->getGiftsService()->getGift($giftId);

        if (!$gift) {
            return null;
        }

        // Récupération du participant
        $player = $this->getPlayersService()->getPlayer($playerId);

        if (!$player) {
            return null;
        }

        // Récupération du nombre d'attributions du cadeau
        $rewardCount = $this->getRewardCount($giftId);

        // Contrôle attribution autorisée
        if ($rewardCount === null || !$this->isValidRewardData($gift, $rewardCount, $player)) {
            return null;
        }

        // Construction de l'objet
        $reward = new Reward(
            playerId: $player->id,
            giftId: $gift->id,
            points: $gift->value,
            createdBy: $userId,
        );

        // Insertion
        if (!$this->repository->createReward($reward)) {
            return null;
        }

        // Suppression des points du participant
        return $this->getPlayersService()->updatePlayerPoints($playerId, -1 * $gift->value, $userId);
    }

    /**
     * Suppression logique de l'attribution d'un cadeau
     */
    public function deleteReward(int $rewardId, int $userId): ?bool
    {
        // Contrôle des données
        if (!$rewardId) {
            return null;
        }

        // Récupération de l'attribution du cadeau du participant
        $reward = $this->repository->getReward($rewardId);

        if (!$reward) {
            return null;
        }

        // Suppression logique de l'attribution
        if (!$this->repository->logicalDelete($rewardId, $userId)) {
            return null;
        }

        // Récupération des points pour le participant
        return $this->getPlayersService()->updatePlayerPoints($reward->playerId, $reward->points, $userId);
    }

    /**
     * Contrôle de cohérence des données
     */
    private function isValidRewardData(GiftOutputDTO $gift, int $rewardCount, PlayerOutputDTO $player): bool
    {
        // Contrôle quantité restante
        $remainingQuantity = $gift->quantity - $rewardCount;

        // Contrôle points participant
        $enoughPoints = $player->points >= $gift->value;

        return $remainingQuantity > 0
            && $enoughPoints;
    }
}
