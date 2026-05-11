<?php
// Imports
require_once 'models/dtos/GiftInputDTO.php';
require_once 'models/dtos/GiftOutputDTO.php';

require_once 'services/RewardsService.php';

require_once 'repositories/GiftsRepository.php';

class GiftsService
{
    private PDO $db;
    private ?RewardsService $rewardsService = null;
    private GiftsRepository $repository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->repository = new GiftsRepository($db);
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
    public function getEditionGifts(int $editionId): ?array
    {
        // Contrôle des données
        if (!$editionId) {
            return null;
        }

        $gifts = $this->repository->getEditionGifts($editionId);

        return array_map(function ($gift) {
            // Calcul du nombre de cadeaux restants
            $remainingQuantity = $gift->quantity - $gift->rewardCount;

            // Récupération des données cadeaux
            return new GiftOutputDTO(
                id: $gift->id,
                editionId: $gift->editionId,
                name: $gift->name,
                value: $gift->value,
                quantity: $gift->quantity,
                rewardCount: $gift->rewardCount,
                remainingQuantity: $remainingQuantity
            );
        }, $gifts);
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getGift(int $giftId): ?GiftOutputDTO
    {
        // Contrôle des données
        if (!$giftId) {
            return null;
        }

        // Lecture du cadeau
        $gift = $this->repository->getGift($giftId);

        if (!$gift) {
            return null;
        }

        // Récupération des données cadeau
        return new GiftOutputDTO(
            id: $gift->id,
            value: $gift->value,
            quantity: $gift->quantity
        );
    }

    /**
     * Création d'un cadeau
     */
    public function createGift(int $editionId, GiftInputDTO $data, int $userId): ?bool
    {
        // Contrôle des données
        if (!$editionId || !$this->isValidGiftData($data)) {
            return null;
        }

        // Construction de l'objet
        $gift = new Gift(
            editionId: $editionId,
            name: trim($data->name),
            value: $data->value,
            quantity: $data->quantity,
            createdBy: $userId,
        );

        // Insertion
        return $this->repository->createGift($gift);
    }

    /**
     * Modification d'un cadeau
     */
    public function updateGift(int $giftId, GiftInputDTO $data, int $userId): ?bool
    {
        // Contrôle des données
        if (!$giftId) {
            return null;
        }

        // Récupération du nombre d'attributions du cadeau
        $rewardCount = $this->getRewardsService()->getRewardCount($giftId);

        // Contrôle des données
        if ($rewardCount === null || !$this->isValidGiftData($data, $rewardCount)) {
            return null;
        }

        // Construction de l'objet
        $gift = new Gift(
            id: $giftId,
            name: trim($data->name),
            value: $data->value,
            quantity: $data->quantity,
            updatedBy: $userId
        );

        // Modification
        return $this->repository->updateGift($gift);
    }

    /**
     * Suppression logique d'un cadeau
     */
    public function deleteGift(int $giftId, int $userId): ?bool
    {
        // Contrôle des données
        if (!$giftId) {
            return null;
        }

        // Suppression logique du cadeau
        return $this->repository->logicalDelete($giftId, $userId);
    }

    /**
     * Suppression logique des cadeaux d'une édition
     */
    public function deleteGifts(int $editionId, int $userId): ?bool
    {
        // Contrôle des données
        if (!$editionId) {
            return null;
        }

        return $this->repository->deleteGifts($editionId, $userId);
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidGiftData(GiftInputDTO $data, ?int $rewardCount = null): bool
    {
        $name = trim($data->name);

        return $name !== ''
            && $data->value > 0
            && ($rewardCount !== null ? $data->quantity >= $rewardCount : $data->quantity >= 0);
    }
}
