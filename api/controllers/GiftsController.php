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

            if ($gifts !== null) {
                // Succès
                ResponseHelper::success($gifts);
            } else {
                // Échec de la lecture
                ResponseHelper::error(MessageHelper::ERR_GIFTS_NOT_FOUND, [__FUNCTION__, self::controllerName]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
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
            $created = $this->giftsService->createGift($editionId, $dataDTO, $user);

            if ($created) {
                // Succès
                ResponseHelper::success(null, MessageHelper::MSG_CREATION_SUCCESS);
            } else {
                // Échec de la création
                ResponseHelper::error(MessageHelper::ERR_CREATION_FAILED, [__FUNCTION__, self::controllerName, json_encode($data)]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
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
            $updated = $this->giftsService->updateGift($giftId, $dataDTO, $user);

            if ($updated) {
                // Succès
                ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
            } else {
                // Échec de la modification
                ResponseHelper::error(MessageHelper::ERR_UPDATE_FAILED, [__FUNCTION__, self::controllerName, $giftId, json_encode($data)]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
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
            $deleted = $this->giftsService->deleteGift($giftId, $user->id);

            if ($deleted) {
                // Succès
                ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
            } else {
                // Échec de la suppression
                ResponseHelper::error(MessageHelper::ERR_DELETION_FAILED, [__FUNCTION__, self::controllerName, $giftId]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }
}
