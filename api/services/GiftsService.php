<?php
// Imports
require_once 'services/RewardsService.php';

require_once 'repositories/GiftsRepository.php';

class GiftsService
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
        // Récupération des cadeaux
        $gifts = $this->repository->getEditionGifts($id);

        // Calcul du nombre de cadeaux restants
        foreach ($gifts as &$gift) {
            $gift['remainingQuantity'] = $gift['quantity'] - $gift['rewardCount'];
        }
        unset($gift);

        return $gifts;
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getGift(int|string $id): array|false
    {
        return $this->repository->find($id);
    }

    /**
     * Suppression logique des cadeaux d'une édition
     */
    public function deleteGifts(int|string $id, string $login): bool
    {
        return $this->repository->deleteGifts($id, $login);
    }

    /**
     * Création d'un cadeau
     */
    public function createGift(int|string $idEdition, string $login, array $data): ?bool
    {
        // Contrôle des données
        if (!$this->isValidGiftData($data)) {
            return null;
        }

        // Insertion
        if ($idEdition && $this->repository->create($login, $data)) {
            return true;
        }

        return null;
    }

    /**
     * Modification d'un cadeau
     */
    public function updateGift(int|string $idEdition, int|string $idGift, string $login, array $data): ?bool
    {
        // Récupération du nombre d'attributions du cadeau
        $rewardCount = $this->getRewardsService()->getRewardCount($idGift);

        // Contrôle des données
        if (!$this->isValidGiftData($data, $rewardCount)) {
            return null;
        }

        // Modification
        if ($idEdition && $idGift && $this->repository->update($idGift, $login, $data)) {
            return true;
        }

        return null;
    }

    /**
     * Suppression logique d'un cadeau
     */
    public function deleteGift(int|string $idEdition, int|string $idGift, string $login): ?bool
    {
        // Suppression logique du cadeau
        if ($idEdition && $idGift && $this->repository->logicalDelete($idGift, $login)) {
            return true;
        }

        return null;
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidGiftData(array $data, ?int $rewardCount = null): bool
    {
        $name = trim($data['name'] ?? '');
        $value = $data['value'] ?? null;
        $quantity = $data['quantity'] ?? null;

        return $name
            && is_numeric($value) && $value > 0
            && is_numeric($quantity) && ($rewardCount != null ? $quantity >= $rewardCount : $quantity >= 0);
    }
}
