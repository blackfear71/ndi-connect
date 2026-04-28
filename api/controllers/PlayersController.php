<?php
// Imports
require_once 'core/functions/Auth.php';

require_once 'enums/EnumUserRole.php';

require_once 'services/PlayersService.php';

class PlayersController
{
    private const controllerName = 'PlayersController';

    private PDO $db;
    private Auth $auth;
    private PlayersService $service;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->auth = new Auth($db);
        $this->service = new PlayersService($db);
    }

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionPlayers(int|string $idEdition): void
    {
        try {
            // Lecture de tous les enregistrements
            $players = $this->service->getEditionPlayers($idEdition);

            if ($players !== null) {
                // Succès
                ResponseHelper::success($players);
            } else {
                // Échec de la lecture
                ResponseHelper::error(MessageHelper::ERR_PLAYERS_NOT_FOUND, [__FUNCTION__, self::controllerName]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createPlayer(string $token, int|string $idEdition, array $data): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::ADMIN->value);

            // Insertion d'un enregistrement
            $created = $this->service->createPlayer($idEdition, $user, $data);

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
    public function updatePlayer(string $token, int|string $idEdition, int|string $idPlayer, array $data): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::ADMIN->value);

            // Modification d'un enregistrement
            $updated = $this->service->updatePlayer($idEdition, $idPlayer, $user, $data);

            if ($updated) {
                // Succès
                ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
            } else {
                // Échec de la modification
                ResponseHelper::error(MessageHelper::ERR_UPDATE_FAILED, [__FUNCTION__, self::controllerName, $idPlayer, json_encode($data)]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deletePlayer(string $token, int|string $idEdition, int|string $idPlayer): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Suppression logique d'un enregistrement
            $deleted = $this->service->deletePlayer($idEdition, $idPlayer, $user->login);

            if ($deleted) {
                // Succès
                ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
            } else {
                // Échec de la suppression
                ResponseHelper::error(MessageHelper::ERR_DELETION_FAILED, [__FUNCTION__, self::controllerName, $idPlayer]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }
}
