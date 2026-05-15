<?php
// Imports
require_once 'core/functions/Auth.php';

require_once 'enums/EnumUserRole.php';

require_once 'services/RewardsService.php';

class RewardsController
{
    private const controllerName = 'RewardsController';

    private PDO $db;
    private Auth $auth;
    private RewardsService $rewardsService;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->auth = new Auth($db);
        $this->rewardsService = new RewardsService($db);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createReward(string $token, int $giftId, int $playerId): void
    {
        try {
            // Contrôle autorisation et niveau
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::ADMIN->value);

            // Insertion d'un enregistrement
            $this->rewardsService->createReward($giftId, $playerId, $user);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_REWARD_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error2($e->getMessage(), self::controllerName, __FUNCTION__, [$giftId, $playerId]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteReward(string $token, int $rewardId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Suppression logique d'un enregistrement
            $this->rewardsService->deleteReward($rewardId, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error2($e->getMessage(), self::controllerName, __FUNCTION__, [$rewardId]);
        }
    }
}
