<?php
require_once 'core/functions/Auth.php';

require_once 'enums/UserRole.php';

require_once 'services/EditionsService.php';

class EditionsController
{
    private const controllerName = 'EditionsController';

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
        $this->service = new EditionsService($db);
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
                // Échec de la lecture
                ResponseHelper::error(
                    'ERR_EDITIONS_NOT_FOUND',
                    400,
                    'Erreur lors de la récupération des éditions dans ' . __FUNCTION__ . ' de ' . self::controllerName
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
     * Lecture d'un enregistrement
     */
    public function getEdition($id)
    {
        try {
            $edition = $this->service->getEdition($id);

            if ($edition) {
                // Succès
                ResponseHelper::success($edition);
            } else {
                // Échec de la lecture
                ResponseHelper::error(
                    'ERR_EDITION_NOT_FOUND',
                    404,
                    'Edition non trouvée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour l\'id : ' . $id
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
                // Échec de la lecture
                ResponseHelper::error(
                    'ERR_EDITIONS_NOT_FOUND',
                    400,
                    'Erreur lors de la récupération des éditions dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour la recherche : ' . $search
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
     * Flux SSE de mise à jour de l'édition
     */
    public function getEditionStream($id)
    {
        if ($id === null) {
            echo "event: error\n";
            echo "data: ID d'édition manquant\n\n";
            flush();
            return;
        }

        // Évite la limite de temps PHP
        set_time_limit(0);

        // Vider tous les tampons éventuels
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        ob_implicit_flush(true);

        // Envoi initial pour test / ping
        echo "event: ping\n";
        echo "data: ok\n\n";
        flush();

        $lastGiftsHash = null;
        $lastPlayersHash = null;

        while (true) {
            // Maintien de la connexion
            echo "event: heartbeat\n";
            echo "data: ok\n\n";
            flush();

            // TODO : améliorer l'algo & gérer les erreurs
            $edition = $this->service->getEdition($id);

            // Récupération des cadeaux
            $gifts = $edition['gifts'];
            $newGiftsHash = md5(json_encode($gifts));

            if ($newGiftsHash !== $lastGiftsHash) {
                echo "event: gifts_updated\n";
                echo "data: " . json_encode($gifts) . "\n\n";
                $lastGiftsHash = $newGiftsHash;
                flush();
            }

            // Récupération des participants
            $players = $edition['players'];
            $newPlayersHash = md5(json_encode($players));

            if ($newPlayersHash !== $lastPlayersHash) {
                echo "event: players_updated\n";
                echo "data: " . json_encode($players) . "\n\n";
                $lastPlayersHash = $newPlayersHash;
                flush();
            }

            // Pause avant la prochaine boucle
            sleep(5);
        }
    }










    /**
     * Insertion d'un enregistrement
     */
    public function createEdition($token, $data, $file)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, UserRole::SUPERADMIN->value, __FUNCTION__, self::controllerName);

            // Insertion d'un enregistrement
            $created = $this->service->createEdition($user['login'], $data, $file);

            if ($created) {
                // Succès
                ResponseHelper::success(null, 'MSG_CREATION_SUCCESS');
            } else {
                // Échec de la création
                ResponseHelper::error(
                    'ERR_CREATION_FAILED',
                    400,
                    'Erreur lors de la création de l\'édition dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . json_encode($data)
                );
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                $e->getCode() ?: 500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateEdition($token, $id, $data, $file)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, UserRole::SUPERADMIN->value, __FUNCTION__, self::controllerName);

            // Modification d'un enregistrement
            $edition = $this->service->updateEdition($id, $user['login'], $data, $file);

            if ($edition) {
                // Succès
                ResponseHelper::success($edition, 'MSG_UPDATE_SUCCESS');
            } else {
                // Échec de la modification
                ResponseHelper::error(
                    'ERR_UPDATE_FAILED',
                    400,
                    'Erreur lors de la modification de l\'édition dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour l\'id : ' . $id . ' - ' . json_encode($data)
                );
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::error(
                $e->getMessage(),
                $e->getCode() ?: 500,
                'Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage()
            );
        }
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteEdition($token, $id)
    {
        try {
            // Contrôle authentification et niveau utilisateur
            $user = $this->auth->checkAuthAndLevel($token, UserRole::SUPERADMIN->value, __FUNCTION__, self::controllerName);

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
                    'Erreur lors de la suppression de l\'édition dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' pour l\'id : ' . $id
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
