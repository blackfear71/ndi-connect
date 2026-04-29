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
    public function getEditionGifts(int|string $id): array
    {
        $gifts = $this->repository->getEditionGifts($id);

        return array_map(function ($gift) {
            // Calcul du nombre de cadeaux restants
            $remainingQuantity = $gift->quantity - $gift->rewardCount;

            // Récupération des données cadeaux
            return new GiftOutputDTO(
                id: $gift->id,
                idEdition: $gift->idEdition,
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
    public function getGift(int|string $id): ?GiftOutputDTO
    {
        // Contrôle des données
        if (!$id) {
            return null;
        }

        // Lecture du cadeau
        $gift = $this->repository->getGift($id);

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
    public function createGift(int|string $idEdition, string $login, GiftInputDTO $data): ?bool
    {
        // Contrôle des données
        if (!$idEdition || !$this->isValidGiftData($data)) {
            return null;
        }

        // Construction de l'objet
        // TODO : des forçages de types à int permettraient de ne pas caster
        $gift = new Gift(
            idEdition: (int) $idEdition,
            name: $data->name,
            value: $data->value,
            quantity: $data->quantity,
            createdBy: $login,
        );

        // Insertion
        return $this->repository->createGift($gift);
    }

    /**
     * Modification d'un cadeau
     */
    public function updateGift(int|string $idEdition, int|string $idGift, string $login, GiftInputDTO $data): ?bool
    {
        // Contrôle des données
        if (!$idEdition || !$idGift) {
            return null;
        }

        // Récupération du nombre d'attributions du cadeau
        $rewardCount = $this->getRewardsService()->getRewardCount($idGift);

        // Contrôle des données
        if (!$this->isValidGiftData($data, $rewardCount)) {
            return null;
        }

        // Construction de l'objet
        $gift = new Gift(
            id: (int) $idGift,
            name: $data->name,
            value: $data->value,
            quantity: $data->quantity,
            updatedBy: $login,
        );

        // Modification
        return $this->repository->updateGift($gift);
    }

    /**
     * Suppression logique d'un cadeau
     */
    public function deleteGift(int|string $idEdition, int|string $idGift, string $login): ?bool
    {
        // Contrôle des données
        if (!$idEdition || !$idGift) {
            return null;
        }

        // Suppression logique du cadeau
        return $this->repository->logicalDelete($idGift, $login);
    }

    /**
     * Suppression logique des cadeaux d'une édition
     */
    public function deleteGifts(int|string $id, string $login): bool
    {
        return $this->repository->deleteGifts($id, $login);
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
