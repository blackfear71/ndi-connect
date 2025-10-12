<?php
require_once 'core/functions/Auth.php';

require_once 'enums/UserRole.php';

require_once 'services/GiftsService.php';

class GiftsController
{
    private const controllerName = 'GiftsController';

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
        $this->service = new GiftsService($db);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createGift($token, $idEdition, $data)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, UserRole::ADMIN->value, __FUNCTION__, self::controllerName);

            // Insertion d'un enregistrement
            $gifts = $this->service->createGift($idEdition, $user['login'], $data);

            if ($gifts !== null) {
                // Succès
                ResponseHelper::success($gifts, 'MSG_CREATION_SUCCESS');
            } else {
                // Échec de la création
                ResponseHelper::error(
                    'ERR_CREATION_FAILED',
                    400,
                    'Erreur lors de la création du cadeau dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . json_encode($data)
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
    public function updateGift($token, $idEdition, $idGift, $data)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, UserRole::ADMIN->value, __FUNCTION__, self::controllerName);

            // Modification d'un enregistrement
            $gifts = $this->service->updateGift($idEdition, $idGift, $user['login'], $data);

            if ($gifts !== null) {
                // Succès
                ResponseHelper::success($gifts, 'MSG_UPDATE_SUCCESS');
            } else {
                // Échec de la modification
                ResponseHelper::error(
                    'ERR_UPDATE_FAILED',
                    400,
                    'Erreur lors de la modification du cadeau dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour l\'id : ' . $idGift . ' - ' . json_encode($data)
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
    public function deleteGift($token, $idEdition, $idGift)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, UserRole::SUPERADMIN->value, __FUNCTION__, self::controllerName);

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
                    'Erreur lors de la suppression du cadeau dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour l\'id : ' . $idGift
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
