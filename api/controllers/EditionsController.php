<?php
require_once 'core/ResponseHelper.php';

require_once 'enums/UserRole.php';

require_once 'services/EditionsService.php';
require_once 'services/UsersService.php';

class EditionsController
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
        $this->service = new EditionsService($db);
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
     * Lecture de tous les enregistrements
     */
    public function getAllEditions()
    {
        try {
            // Lecture de tous les enregistrements
            $editions = $this->service->getAllEditions();

            if ($editions !== null) {
                // Succès
                ResponseHelper::success($editions);
            } else {
                // Échec de la suppression
                ResponseHelper::error(
                    'ERR_EDITIONS_NOT_FOUND',
                    400,
                    'Erreur lors de la récupération des éditions'
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans getAllEditions de EditionsController : ' . $e->getMessage()
            );
        }
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getEdition($id)
    {
        try {
            $edition = $this->service->getEdition($id);

            if ($edition) {
                // Réponse si l'enregistrement est trouvé
                ResponseHelper::success($edition);
            } else {
                // Réponse si l'enregistrement est introuvable
                ResponseHelper::error(
                    'ERR_EDITION_NOT_FOUND',
                    404,
                    'Edition non trouvée pour l\'id : ' . $id
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans getEdition de EditionsController : ' . $e->getMessage()
            );
        }
    }

    /**
     * Lecture des éditions recherchées
     */
    public function getSearchEditions($search)
    {
        try {
            // Lecture de tous les enregistrements recherchés
            $editions = $this->service->getSearchEditions($search);

            if ($editions !== null) {
                // Succès
                ResponseHelper::success($editions);
            } else {
                // Échec de la suppression
                ResponseHelper::error(
                    'ERR_EDITIONS_NOT_FOUND',
                    400,
                    'Erreur lors de la récupération des éditions pour la recherche : ' . $search
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans getSearchEditions de EditionsController : ' . $e->getMessage()
            );
        }
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createEdition($token, $data)
    {
        try {
            // Contrôle autorisation
            $user = $this->getUsersService()->checkAuth($token);

            if (!$user || $user['level'] < UserRole::SUPERADMIN->value) {
                // Accès refusé
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    401,
                    'Action non autorisée dans createEdition de EditionsController'
                );
                exit;
            }

            // Insertion d'un enregistrement
            $created = $this->service->createEdition($user['login'], $data);

            if ($created) {
                // Succès
                ResponseHelper::success(null, 'MSG_CREATION_SUCCESS');
            } else {
                // Échec de la création
                ResponseHelper::error(
                    'ERR_CREATION_FAILED',
                    400,
                    'Erreur lors de la création de l\'édition : ' . json_encode($data)
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans createEdition de EditionsController : ' . $e->getMessage()
            );
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateEdition($token, $id, $data)
    {
        try {
            // Contrôle autorisation
            $user = $this->getUsersService()->checkAuth($token);

            if (!$user || $user['level'] < UserRole::SUPERADMIN->value) {
                // Accès refusé
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    401,
                    'Action non autorisée dans updateEdition de EditionsController'
                );
                exit;
            }

            // Modification d'un enregistrement
            $edition = $this->service->updateEdition($id, $user['login'], $data);

            if ($edition) {
                // Succès
                ResponseHelper::success($edition, 'MSG_UPDATE_SUCCESS');
            } else {
                // Échec de la modification
                ResponseHelper::error(
                    'ERR_UPDATE_FAILED',
                    400,
                    'Erreur lors de la modification de l\'édition : ' . $id . ' - ' . json_encode($data)
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans updateEdition de EditionsController : ' . $e->getMessage()
            );
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteEdition($token, $id)
    {
        try {
            // Contrôle autorisation
            $user = $this->getUsersService()->checkAuth($token);

            if (!$user || $user['level'] < UserRole::SUPERADMIN->value) {
                // Accès refusé
                ResponseHelper::error(
                    'ERR_UNAUTHORIZED_ACTION',
                    401,
                    'Action non autorisée dans deleteEdition de EditionsController'
                );
                exit;
            }

            // Suppression logique d'un enregistrement
            $deleted = $this->service->deleteEdition($id, $user['login']);

            if ($deleted) {
                // Succès
                ResponseHelper::success(null, 'MSG_DELETION_SUCCESS');
            } else {
                // Échec de la suppression
                ResponseHelper::error(
                    'ERR_DELETION_FAILED',
                    400,
                    'Erreur lors de la suppression de l\'édition : ' . $id
                );
            }
        } catch (Exception $e) {
            // Gestion des erreurs
            ResponseHelper::error(
                $e->getMessage(),
                500,
                'Exception levée dans deleteEdition de EditionsController : ' . $e->getMessage()
            );
        }
    }
}
