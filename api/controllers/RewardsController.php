<?php
// Imports
require_once 'core/functions/Auth.php';

require_once 'enums/EnumUserRole.php';

require_once 'models/dtos/RewardInputDTO.php';

require_once 'services/RewardsService.php';

class RewardsController
{
    private const controllerName = 'RewardsController';

    private PDO $db;
    private Auth $auth;
    private RewardsService $service;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->auth = new Auth($db);
        $this->service = new RewardsService($db);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createReward(string $token, array $data): void
    {
        try {
            // Contrôle autorisation et niveau
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::ADMIN->value);

            // Insertion d'un enregistrement
            $created = $this->service->createReward($user->login, RewardInputDTO::fromArray($data));

            if ($created) {
                // Succès
                ResponseHelper::success(null, MessageHelper::MSG_REWARD_SUCCESS);
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
     * Suppression logique d'un enregistrement
     */
    public function deleteReward(string $token, int|string $idReward): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Suppression logique d'un enregistrement
            $deleted = $this->service->deleteReward($user->login, $idReward);

            if ($deleted) {
                // Succès
                ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
            } else {
                // Échec de la suppression
                ResponseHelper::error(MessageHelper::ERR_DELETION_FAILED, [__FUNCTION__, self::controllerName, $idReward]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }
}
