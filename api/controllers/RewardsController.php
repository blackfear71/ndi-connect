<?php
require_once 'core/ResponseHelper.php';

require_once 'enums/UserRole.php';

require_once 'services/RewardsService.php';
require_once 'services/UsersService.php';

class RewardsController
{
    private $usersService = null;

    private $db;
    private $service;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->db = $db;
        $this->service = new RewardsService($db);
    }

    /**
     * Instancie le UsersService si besoin
     */
    private function getUsersService()
    {
        if ($this->usersService === null) {
            $this->usersService = new UsersService($this->db);
        }
        return $this->usersService;
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createReward($token, $idEdition, $data)
    {
        try {
            // Contrôle autorisation
            $user = $this->getUsersService()->checkAuth($token);

            if (!$user || $user['level'] < UserRole::ADMIN->value) {
                // Accès refusé
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    401,
                    'Action non autorisée dans createReward de RewardsController'
                );
                exit;
            }

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
                    'Erreur lors de l\'attribution du cadeau : ' . json_encode($data)
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans createReward de RewardsController : ' . $e->getMessage()
            );
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteReward($token, $idEdition, $idReward)
    {
        try {
            // Contrôle autorisation
            $user = $this->getUsersService()->checkAuth($token);

            if (!$user || $user['level'] < UserRole::SUPERADMIN->value) {
                // Accès refusé
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    401,
                    'Action non autorisée dans deleteReward de RewardsController'
                );
                exit;
            }

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
                    'Erreur lors de la suppression du cadeau du participant : ' . $idReward
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans deleteReward de RewardsController : ' . $e->getMessage()
            );
        }
    }
}
