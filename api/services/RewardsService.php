<?php
// Imports
require_once 'services/EditionsService.php';
require_once 'services/GiftsService.php';
require_once 'services/PlayersService.php';

require_once 'repositories/RewardsRepository.php';

class RewardsService
{
    private PDO $db;

    private ?EditionsService $editionsService = null;
    private ?GiftsService $giftsService = null;
    private ?PlayersService $playersService = null;

    private RewardsRepository $rewardsRepository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->rewardsRepository = new RewardsRepository($db);
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

        return $this->rewardsRepository->getRewardCount($giftId);
    }

    /**
     * Récupération des cadeaux d'un participant
     */
    public function getPlayerRewards(int $playerId): array
    {
        return $this->rewardsRepository->getPlayerRewards($playerId);
    }

    /**
     * Attribution d'un cadeau
     */
    public function createReward(int $giftId, int $playerId, UserOutputDTO $user): ?bool
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
        if ($rewardCount === null || !$this->isValidRewardData($gift, $rewardCount, $player, $user->level, $gift->id, 'gifts')) {
            return null;
        }

        // Construction de l'objet
        $reward = new Reward(
            playerId: $player->id,
            giftId: $gift->id,
            points: $gift->value,
            createdBy: $user->id,
        );

        // Insertion
        if (!$this->rewardsRepository->createReward($reward)) {
            return null;
        }

        // Suppression des points du participant
        return $this->getPlayersService()->updatePlayerPoints($playerId, -1 * $gift->value, $user->id);
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
        $reward = $this->rewardsRepository->getReward($rewardId);

        if (!$reward) {
            return null;
        }

        // Suppression logique de l'attribution
        if (!$this->rewardsRepository->deleteReward($rewardId, $userId)) {
            return null;
        }

        // Récupération des points pour le participant
        return $this->getPlayersService()->updatePlayerPoints($reward->playerId, $reward->points, $userId);
    }

    /**
     * Contrôle de cohérence des données
     */
    private function isValidRewardData(GiftOutputDTO $gift, int $rewardCount, PlayerOutputDTO $player, int $level, int $id, string $typeId): bool
    {
        // Contrôle quantité restante
        $remainingQuantity = $gift->quantity - $rewardCount;

        // Contrôle points participant
        $enoughPoints = $player->points >= $gift->value;

        // Date de fin édition
        $endDate = $level !== EnumUserRole::SUPERADMIN->value ? $this->getEditionsService()->getEditionEndDateByType($id, $typeId) : null;

        return $remainingQuantity > 0
            && $enoughPoints
            && ($level === EnumUserRole::SUPERADMIN->value || ($level === EnumUserRole::ADMIN->value && $endDate !== null && new \DateTimeImmutable() <= $endDate));
    }
}
