<?php
// Imports
require_once 'core/functions/Auth.php';

require_once 'enums/EnumUserRole.php';

require_once 'models/dtos/GiftInputDTO.php';

require_once 'services/GiftsService.php';

class GiftsController
{
    private const controllerName = 'GiftsController';

    private PDO $db;
    private Auth $auth;
    private GiftsService $giftsService;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->auth = new Auth($db);
        $this->giftsService = new GiftsService($db);
    }

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionGifts(int $editionId): void
    {
        try {
            // Lecture de tous les enregistrements
            $gifts = $this->giftsService->getEditionGifts($editionId);

            // Succès
            ResponseHelper::success($gifts);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error2($e->getMessage(), self::controllerName, __FUNCTION__, [$editionId]);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createGift(string $token, int $editionId, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = GiftInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::ADMIN->value);

            // Insertion d'un enregistrement
            $this->giftsService->createGift($editionId, $dataDTO, $user);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_CREATION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            // TODO : renommer error2 en error
            // TODO : il va falloir adapter tous les ResponseHelper::
            ResponseHelper::error2($e->getMessage(), self::controllerName, __FUNCTION__, [$editionId, json_encode($data)]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateGift(string $token, int $giftId, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = GiftInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::ADMIN->value);

            // Modification d'un enregistrement
            $this->giftsService->updateGift($giftId, $dataDTO, $user);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error2($e->getMessage(), self::controllerName, __FUNCTION__, [$giftId, json_encode($data)]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteGift(string $token, int $giftId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Suppression logique d'un enregistrement
            $this->giftsService->deleteGift($giftId, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error2($e->getMessage(), self::controllerName, __FUNCTION__, [$giftId]);
        }
    }
}
