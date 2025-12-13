<?php
require_once 'services/GiftsService.php';
require_once 'services/PlayersService.php';
require_once 'services/SseService.php';

class SseController
{
    private const controllerName = 'SseController';

    private $giftsService = null;
    private $playersService = null;

    private $db;
    private $service;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->db = $db;
        $this->service = new SseService();
    }

    /**
     * Instancie le GiftsService si besoin
     */
    private function getGiftsService()
    {
        if ($this->giftsService === null) {
            $this->giftsService = new GiftsService($this->db);
        }

        return $this->giftsService;
    }

    /**
     * Instancie le PlayersService si besoin
     */
    private function getPlayersService()
    {
        if ($this->playersService === null) {
            $this->playersService = new PlayersService($this->db);
        }

        return $this->playersService;
    }

    /**
     * Flux SSE de récupération des participants et cadeaux d'une édition
     */
    public function getSseEdition($id)
    {
        // Contrôle id renseigné
        if ($id === null) {
            echo $this->service->getSseEvent('error', 'ID d\'édition manquant');
            ob_flush();
            flush();
            return;
        }

        // Initialisation
        $this->service->initializeSse();

        // Envoi initial
        echo $this->service->getSseEvent('is_initialized', 'ok');
        ob_flush();
        flush();

        $lastGiftsHash = null;
        $lastPlayersHash = null;

        // Boucle infinie de récupération des données
        try {
            while (true) {
                // Coupe la connexion si le client se déconnecte
                if (connection_aborted()) {
                    break;
                }

                // Evènement de maintien de la connexion
                echo $this->service->getSseEvent('is_alive', 'ok');
                ob_flush();
                flush();

                // Evènement de récupération des cadeaux
                try {
                    $gifts = $this->getGiftsService()->getEditionGifts($id);
                } catch (Exception $e) {
                    // Échec de la lecture
                    ResponseHelper::sse('Erreur lors de la récupération des cadeaux dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage());

                    // On continue sans casser le flux
                    $gifts = null;
                }

                if ($gifts !== null) {
                    $newGiftsHash = md5(json_encode($gifts));

                    if ($newGiftsHash !== $lastGiftsHash) {
                        $lastGiftsHash = $newGiftsHash;

                        echo $this->service->getSseEvent('get_gifts', $gifts);
                        ob_flush();
                        flush();
                    }
                }

                // Evènement de récupération des participants
                try {
                    $players = $this->getPlayersService()->getEditionPlayers($id);
                } catch (Exception $e) {
                    // Échec de la lecture
                    ResponseHelper::sse('Erreur lors de la récupération des participants dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage());

                    // On continue sans casser le flux
                    $players = null;
                }

                if ($players !== null) {
                    $newPlayersHash = md5(json_encode($players));

                    if ($newPlayersHash !== $lastPlayersHash) {
                        $lastPlayersHash = $newPlayersHash;

                        echo $this->service->getSseEvent('get_players', $players);
                        ob_flush();
                        flush();
                    }
                }

                // Pause avant la prochaine boucle
                sleep(5);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::sse('Exception levée dans ' . __FUNCTION__ . ' de ' . self::controllerName . ' : ' . $e->getMessage());

            // Message d'erreur
            echo $this->service->getSseEvent('fatal_error', 'Exception levée SSE');
            ob_flush();
            flush();
        }
    }
}
