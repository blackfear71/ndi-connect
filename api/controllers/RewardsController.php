<?php
require_once 'core/functions/Auth.php';

require_once 'enums/UserRole.php';

require_once 'services/RewardsService.php';

class RewardsController
{
    private const controllerName = 'RewardsController';

    private $db;
    private $auth;
    private $service;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->db = $db;
        $this->auth = new Auth($db);
        $this->service = new RewardsService($db);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createReward($token, $idEdition, $data)
    {
        try {
            // Contrôle autorisation et niveau
            $user = $this->auth->checkAuthAndLevel($token, UserRole::ADMIN->value, __FUNCTION__, self::controllerName);

            // Insertion d'un enregistrement
            $playersAndGifts = $this->service->createReward($user['login'], $idEdition, $data['idGift'], $data['idPlayer']);

            if ($playersAndGifts !== null) {
                // Succès
                ResponseHelper::success($playersAndGifts, 'MSG_REWARD_SUCCESS');
            } else {
                // Échec de la création
                ResponseHelper::error(
                    'ERR_CREATION_FAILED',
                    400,
                    'Erreur lors de l\'attribution du cadeau dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . json_encode($data)
                );
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteReward($token, $idEdition, $idReward)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, UserRole::SUPERADMIN->value, __FUNCTION__, self::controllerName);

            // Suppression logique d'un enregistrement
            $playersAndGifts = $this->service->deleteReward($user['login'], $idEdition, $idReward);

            if ($playersAndGifts) {
                // Succès
                ResponseHelper::success($playersAndGifts, 'MSG_DELETION_SUCCESS');
            } else {
                // Échec de la suppression
                ResponseHelper::error(
                    'ERR_DELETION_FAILED',
                    400,
                    'Erreur lors de la suppression du cadeau du participant dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour l\'id : ' . $idReward
                );
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }
}
