<?php
require_once 'core/ResponseHelper.php';

require_once 'enums/UserRole.php';

require_once 'services/PlayersService.php';
require_once 'services/UsersService.php';

class PlayersController
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
        $this->service = new PlayersService($db);
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
    public function createPlayer($token, $idEdition, $data)
    {
        try {
            // Contrôle autorisation
            $user = $this->getUsersService()->checkAuth($token);

            if (!$user || $user['level'] < UserRole::ADMIN->value) {
                // Accès refusé
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    401,
                    'Action non autorisée dans createPlayer de PlayersController'
                );
                exit;
            }

            // Insertion d'un enregistrement
            $players = $this->service->createPlayer($idEdition, $user, $data);

            if ($players !== null) {
                // Succès
                ResponseHelper::success($players, 'MSG_CREATION_SUCCESS');
            } else {
                // Échec de la création
                ResponseHelper::error(
                    'ERR_CREATION_FAILED',
                    400,
                    'Erreur lors de la création du participant : ' . json_encode($data)
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans createPlayer de PlayersController : ' . $e->getMessage()
            );
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updatePlayer($token, $idEdition, $idPlayer, $data)
    {
        try {
            // Contrôle autorisation
            $user = $this->getUsersService()->checkAuth($token);

            if (!$user || $user['level'] < UserRole::ADMIN->value) {
                // Accès refusé
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    401,
                    'Action non autorisée dans updatePlayer de PlayersController'
                );
                exit;
            }

            // Modification d'un enregistrement
            $players = $this->service->updatePlayer($idEdition, $idPlayer, $user, $data);

            if ($players !== null) {
                // Succès
                ResponseHelper::success($players, 'MSG_UPDATE_SUCCESS');
            } else {
                // Échec de la modification
                ResponseHelper::error(
                    'ERR_UPDATE_FAILED',
                    400,
                    'Erreur lors de la modification du participant : ' . $idPlayer . ' - ' . json_encode($data)
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans updatePlayer de PlayersController : ' . $e->getMessage()
            );
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deletePlayer($token, $idEdition, $idPlayer)
    {
        try {
            // Contrôle autorisation
            $user = $this->getUsersService()->checkAuth($token);

            if (!$user || $user['level'] < UserRole::SUPERADMIN->value) {
                // Accès refusé
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    401,
                    'Action non autorisée dans deletePlayer de PlayersController'
                );
                exit;
            }

            // Suppression logique d'un enregistrement
            $players = $this->service->deletePlayer($idEdition, $idPlayer, $user['login']);

            if ($players !== null) {
                // Succès
                ResponseHelper::success($players, 'MSG_DELETION_SUCCESS');
            } else {
                // Échec de la suppression
                ResponseHelper::error(
                    'ERR_DELETION_FAILED',
                    400,
                    'Erreur lors de la suppression du participant : ' . $idPlayer
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans deletePlayer de PlayersController : ' . $e->getMessage()
            );
        }
    }
}
