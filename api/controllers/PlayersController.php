<?php
require_once 'core/functions/Auth.php';

require_once 'enums/EnumUserRole.php';

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
     * Lecture des enregistrements d'une édition
     */
    public function getEditionPlayers($idEdition)
    {
        try {
            // Lecture de tous les enregistrements
            $players = $this->service->getEditionPlayers($idEdition);

            if ($players !== null) {
                // Succès
                ResponseHelper::success($players);
            } else {
                // Échec de la lecture
                ResponseHelper::error(
                    'ERR_PLAYERS_NOT_FOUND',
                    400,
                    'Erreur lors de la récupération des participants dans ' . __FUNCTION__ . ' de ' . self::controllerName
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
     * Insertion d'un enregistrement
     */
    public function createPlayer($token, $idEdition, $data)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::ADMIN->value, __FUNCTION__, self::controllerName);

            // Insertion d'un enregistrement
            $created = $this->service->createPlayer($idEdition, $user, $data);

            if ($created) {
                // Succès
                ResponseHelper::success(null, 'MSG_CREATION_SUCCESS');
            } else {
                // Échec de la création
                ResponseHelper::error(
                    'ERR_CREATION_FAILED',
                    400,
                    'Erreur lors de la création du participant dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . json_encode($data)
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
     * Modification d'un enregistrement
     */
    public function updatePlayer($token, $idEdition, $idPlayer, $data)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::ADMIN->value, __FUNCTION__, self::controllerName);

            // Modification d'un enregistrement
            $updated = $this->service->updatePlayer($idEdition, $idPlayer, $user, $data);

            if ($updated) {
                // Succès
                ResponseHelper::success(null, 'MSG_UPDATE_SUCCESS');
            } else {
                // Échec de la modification
                ResponseHelper::error(
                    'ERR_UPDATE_FAILED',
                    400,
                    'Erreur lors de la modification du participant dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour l\'id : ' . $idPlayer . ' - ' . json_encode($data)
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
    public function deletePlayer($token, $idEdition, $idPlayer)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value, __FUNCTION__, self::controllerName);

            // Suppression logique d'un enregistrement
            $deleted = $this->service->deletePlayer($idEdition, $idPlayer, $user['login']);

            if ($deleted) {
                // Succès
                ResponseHelper::success(null, 'MSG_DELETION_SUCCESS');
            } else {
                // Échec de la suppression
                ResponseHelper::error(
                    'ERR_DELETION_FAILED',
                    400,
                    'Erreur lors de la suppression du participant dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour l\'id : ' . $idPlayer
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
