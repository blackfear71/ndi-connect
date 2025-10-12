<?php
require_once 'core/functions/Auth.php';

require_once 'enums/UserRole.php';

require_once 'services/PlayersService.php';

class PlayersController
{
    private const controllerName = 'PlayersController';

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
        $this->service = new PlayersService($db);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createPlayer($token, $idEdition, $data)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, UserRole::ADMIN->value, __FUNCTION__, self::controllerName);

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
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updatePlayer($token, $idEdition, $idPlayer, $data)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, UserRole::ADMIN->value, __FUNCTION__, self::controllerName);

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
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deletePlayer($token, $idEdition, $idPlayer)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, UserRole::SUPERADMIN->value, __FUNCTION__, self::controllerName);

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
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }
}
