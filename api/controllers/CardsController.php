<?php
// Imports
require_once 'services/CardsService.php';
require_once 'services/UsersService.php';

class CardsController
{
    private const controllerName = 'CardsController';

    private PDO $db;
    private CardsService $cardsService;
    private ?UsersService $usersService = null;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->cardsService = new CardsService($db);
    }

    /**
     * Instancie le UsersService si besoin
     */
    private function getUsersService(): UsersService
    {
        if ($this->usersService === null) {
            $this->usersService = new UsersService($this->db);
        }

        return $this->usersService;
    }

    /**
     * Lecture des enregistrements des éditions non terminées
     */
    public function getAllCards(?string $token): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Lecture de tous les enregistrements
            $cards = $this->cardsService->getAllCards();

            // Succès
            ResponseHelper::success($cards);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, []);
        }
    }

    /**
     * Lecture de l'état d'un code de carte
     */
    public function getCardStatus(?string $token, int $editionId, string $code): void
    {
        try {
            // Utilisateur connecté (seulement si token renseigné, un visiteur peut consulter le statut de sa carte)
            $user = null;

            if ($token) {
                try {
                    $user = $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::USER->value);
                } catch (Exception $e) {
                    // Authentification invalide : traité comme un visiteur comme au chargement initial de l'application
                    if ($e->getMessage() !== MessageHelper::ERR_INVALID_AUTH) {
                        throw $e;
                    }
                }
            }

            // Lecture de l'état du code
            $status = $this->cardsService->getCardStatus($editionId, $code, $user);

            // Succès
            ResponseHelper::success($status);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$editionId, $code]);
        }
    }

    /**
     * Suppression physique d'un enregistrement
     */
    public function deleteCard(?string $token, int $cardId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $this->getUsersService()->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Suppression d'un enregistrement
            $this->cardsService->deleteCard($cardId);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error($e->getMessage(), self::controllerName, __FUNCTION__, [$cardId]);
        }
    }
}
