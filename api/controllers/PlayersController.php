<?php
// Imports
require_once 'core/functions/Auth.php';

require_once 'enums/EnumUserRole.php';

require_once 'models/dtos/PlayerInputDTO.php';

require_once 'services/PlayersService.php';

class PlayersController
{
    private const controllerName = 'PlayersController';

    private PDO $db;
    private Auth $auth;
    private PlayersService $playersService;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->auth = new Auth($db);
        $this->playersService = new PlayersService($db);
    }

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionPlayers(int $editionId): void
    {
        try {
            // Lecture de tous les enregistrements
            $players = $this->playersService->getEditionPlayers($editionId);

            // Succès
            ResponseHelper::success($players);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error2($e->getMessage(), self::controllerName, __FUNCTION__, [$editionId]);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createPlayer(string $token, int $editionId, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = PlayerInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::ADMIN->value);

            // Insertion d'un enregistrement
            $this->playersService->createPlayer($editionId, $user, $dataDTO);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_CREATION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error2($e->getMessage(), self::controllerName, __FUNCTION__, [$editionId, $data]);
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updatePlayer(string $token, int $playerId, array $data): void
    {
        try {
            // Conversion DTO
            $dataDTO = PlayerInputDTO::fromArray($data);

            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::ADMIN->value);

            // Modification d'un enregistrement
            $this->playersService->updatePlayer($playerId, $user, $dataDTO);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_UPDATE_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error2($e->getMessage(), self::controllerName, __FUNCTION__, [$playerId, $data]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deletePlayer(string $token, int $playerId): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Suppression logique d'un enregistrement
            $this->playersService->deletePlayer($playerId, $user->id);

            // Succès
            ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
        } catch (Exception $e) {
            // Exception
            ResponseHelper::error2($e->getMessage(), self::controllerName, __FUNCTION__, [$playerId]);
        }
    }
}
