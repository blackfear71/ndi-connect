<?php
require_once 'core/ResponseHelper.php';

require_once 'enums/UserRole.php';

require_once 'services/GiftsService.php';
require_once 'services/UsersService.php';

class GiftsController
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
        $this->service = new GiftsService($db);
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
    public function createGift($token, $idEdition, $data)
    {
        try {
            // Contrôle autorisation
            $user = $this->getUsersService()->checkAuth($token);

            if (!$user || $user['level'] < UserRole::ADMIN->value) {
                // Accès refusé
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    401,
                    'Action non autorisée dans createGift de GiftsController'
                );
                exit;
            }

            // Insertion d'un enregistrement
            $gifts = $this->service->createGift($idEdition, $user, $data);

            if ($gifts !== null) {
                // Succès
                ResponseHelper::success($gifts, 'MSG_CREATION_SUCCESS');
            } else {
                // Échec de la création
                ResponseHelper::error(
                    'ERR_CREATION_FAILED',
                    400,
                    'Erreur lors de la création du cadeau : ' . json_encode($data)
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans createGift de GiftsController : ' . $e->getMessage()
            );
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateGift($token, $idEdition, $idGift, $data)
    {
        try {
            // Contrôle autorisation
            $user = $this->getUsersService()->checkAuth($token);

            if (!$user || $user['level'] < UserRole::ADMIN->value) {
                // Accès refusé
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    401,
                    'Action non autorisée dans updateGift de GiftsController'
                );
                exit;
            }

            // Modification d'un enregistrement
            $gifts = $this->service->updateGift($idEdition, $idGift, $user, $data);

            if ($gifts !== null) {
                // Succès
                ResponseHelper::success($gifts, 'MSG_UPDATE_SUCCESS');
            } else {
                // Échec de la modification
                ResponseHelper::error(
                    'ERR_UPDATE_FAILED',
                    400,
                    'Erreur lors de la modification du cadeau : ' . $idGift . ' - ' . json_encode($data)
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans updateGift de GiftsController : ' . $e->getMessage()
            );
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteGift($token, $idEdition, $idGift)
    {
        try {
            // Contrôle autorisation
            $user = $this->getUsersService()->checkAuth($token);

            if (!$user || $user['level'] < UserRole::SUPERADMIN->value) {
                // Accès refusé
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    401,
                    'Action non autorisée dans deleteGift de GiftsController'
                );
                exit;
            }

            // Suppression logique d'un enregistrement
            $gifts = $this->service->deleteGift($idEdition, $idGift, $user['login']);

            if ($gifts !== null) {
                // Succès
                ResponseHelper::success($gifts, 'MSG_DELETION_SUCCESS');
            } else {
                // Échec de la suppression
                ResponseHelper::error(
                    'ERR_DELETION_FAILED',
                    400,
                    'Erreur lors de la suppression du cadeau : ' . $idGift
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans deleteGift de GiftsController : ' . $e->getMessage()
            );
        }
    }
}
