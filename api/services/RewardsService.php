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
    public function getRewardCount(int $idGift): ?int
    {
        // Contrôle des données
        if (!$idGift) {
            return null;
        }

        return $this->repository->getRewardCount($idGift);
    }

    /**
     * Récupération des cadeaux d'un participant
     */
    public function getPlayerRewards(int $idPlayer): array
    {
        return $this->repository->getPlayerRewards($idPlayer);
    }

    /**
     * Attribution d'un cadeau
     */
    public function createReward(int $idGift, int $idPlayer, string $login): ?bool
    {
        // Contrôle des données
        if (!$idGift || !$idPlayer) {
            return null;
        }

        // Récupération du cadeau
        $gift = $this->getGiftsService()->getGift($idGift);

        if (!$gift) {
            return null;
        }

        // Récupération du participant
        $player = $this->getPlayersService()->getPlayer($idPlayer);

        if (!$player) {
            return null;
        }

        // Récupération du nombre d'attributions du cadeau
        $rewardCount = $this->getRewardCount($idGift);

        // Contrôle attribution autorisée
        if ($rewardCount === null || !$this->isValidRewardData($gift, $rewardCount, $player)) {
            return null;
        }

        // Construction de l'objet
        $reward = new Reward(
            idPlayer: $player->id,
            idGift: $gift->id,
            points: $gift->value,
            createdBy: $login,
        );

        // Insertion
        if (!$this->repository->createReward($reward)) {
            return null;
        }

        // Suppression des points du participant
        return $this->getPlayersService()->updatePlayerPoints($idPlayer, -1 * $gift->value, $login);
    }

    /**
     * Suppression logique de l'attribution d'un cadeau
     */
    public function deleteReward(int $idReward, string $login): ?bool
    {
        // Contrôle des données
        if (!$idReward) {
            return null;
        }

        // Récupération de l'attribution du cadeau du participant
        $reward = $this->repository->getReward($idReward);

        if (!$reward) {
            return null;
        }

        // Suppression logique de l'attribution
        if (!$this->repository->logicalDelete($idReward, $login)) {
            return null;
        }

        // Récupération des points pour le participant
        return $this->getPlayersService()->updatePlayerPoints($reward->idPlayer, $reward->points, $login);
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
