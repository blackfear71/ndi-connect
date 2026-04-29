<?php
// Imports
require_once 'core/functions/Auth.php';

require_once 'enums/EnumAction.php';
require_once 'enums/EnumUserRole.php';

require_once 'models/dtos/EditionInputDTO.php';
require_once 'models/dtos/EditionResponseDTO.php';

require_once 'services/EditionsService.php';

class EditionsController
{
    private const controllerName = 'EditionsController';

    private PDO $db;
    private Auth $auth;
    private EditionsService $service;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->auth = new Auth($db);
        $this->service = new EditionsService($db);
    }

    /**
     * Lecture de tous les enregistrements
     */
    public function getAllEditions(): void
    {
        try {
            // Lecture de tous les enregistrements
            $editions = $this->service->getAllEditions();

            if ($editions !== null) {
                // Succès
                ResponseHelper::success($editions);
            } else {
                // Échec de la lecture
                ResponseHelper::error(MessageHelper::ERR_EDITIONS_NOT_FOUND, [__FUNCTION__, self::controllerName]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getEdition(int|string $id): void
    {
        try {
            $edition = $this->service->getEdition($id);

            if ($edition) {
                // Succès
                ResponseHelper::success($edition);
            } else {
                // Échec de la lecture
                ResponseHelper::error(MessageHelper::ERR_EDITION_NOT_FOUND, [__FUNCTION__, self::controllerName, $id]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }

    /**
     * Lecture des éditions recherchées
     */
    public function getSearchEditions(string $search): void
    {
        try {
            // Lecture de tous les enregistrements recherchés
            $editions = $this->service->getSearchEditions($search);

            if ($editions !== null) {
                // Succès
                ResponseHelper::success($editions);
            } else {
                // Échec de la lecture
                ResponseHelper::error(MessageHelper::ERR_EDITIONS_SEARCH, [__FUNCTION__, self::controllerName, $search]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createEdition(string $token, array $data, array $file): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Insertion d'un enregistrement
            $created = $this->service->createEdition($user->login, EditionInputDTO::fromArray($data), $file);

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
    public function updateEdition(string $token, int|string $id, array $data, array $file): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Modification d'un enregistrement
            $edition = $this->service->updateEdition($id, $user->login, EditionInputDTO::fromArray($data), $file);

            if ($edition) {
                // Succès
                ResponseHelper::success($edition, MessageHelper::MSG_UPDATE_SUCCESS);
            } else {
                // Échec de la modification
                ResponseHelper::error(MessageHelper::ERR_UPDATE_FAILED, [__FUNCTION__, self::controllerName, $id, json_encode($data)]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteEdition(string $token, int|string $id): void
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, EnumUserRole::SUPERADMIN->value);

            // Suppression logique d'un enregistrement
            $deleted = $this->service->deleteEdition($id, $user->login);

            if ($deleted) {
                // Succès
                ResponseHelper::success(null, MessageHelper::MSG_DELETION_SUCCESS);
            } else {
                // Échec de la suppression
                ResponseHelper::error(MessageHelper::ERR_DELETION_FAILED, [__FUNCTION__, self::controllerName, $id]);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error($e->getMessage(), [__FUNCTION__, self::controllerName, $e->getMessage()]);
        }
    }
}
