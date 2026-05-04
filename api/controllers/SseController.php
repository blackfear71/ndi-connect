<?php
// Imports
require_once 'services/GiftsService.php';
require_once 'services/PlayersService.php';
require_once 'services/SseService.php';

class SseController
{
    private const controllerName = 'SseController';

    private PDO $db;
    private SseService $service;
    private ?GiftsService $giftsService = null;
    private ?PlayersService $playersService = null;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->service = new SseService();
    }

    /**
     * Instancie le GiftsService si besoin
     */
    private function getGiftsService(): GiftsService
    {
        if ($this->giftsService === null) {
            $this->giftsService = new GiftsService($this->db);
        }

        return $this->giftsService;
    }

    /**
     * Instancie le PlayersService si besoin
     */
    private function getPlayersService(): PlayersService
    {
        if ($this->playersService === null) {
            $this->playersService = new PlayersService($this->db);
        }

        return $this->playersService;
    }

    /**
     * Flux SSE de récupération des participants et cadeaux d'une édition
     */
    public function getSseEdition(int $idEdition): void
    {
        // Contrôle id renseigné
        if ($idEdition === null) {
            echo $this->service->getSseEvent('error', 'ID d\'édition manquant');
            flush();
            return;
        }

        // Initialisation
        $this->service->initializeSse();

        // Envoi initial
        echo $this->service->getSseEvent('is_initialized', 'ok');
        flush();

        $lastGiftsHash = null;
        $lastPlayersHash = null;

        $startTime = time();
        $maxDuration = 50;

        // Boucle de récupération des données
        try {
            while (true) {
                // Coupe la connexion si le client se déconnecte
                if (connection_aborted()) {
                    break;
                }

                // Fermeture propre avant le timeout Nginx du serveur (60s)
                if ((time() - $startTime) >= $maxDuration) {
                    echo $this->service->getSseEvent('is_closing', 'ok');
                    flush();
                    break;
                }

                // Evènement de maintien de la connexion
                echo $this->service->getSseEvent('is_alive', 'ok');
                flush();

                // Evènement de récupération des cadeaux
                try {
                    $gifts = $this->getGiftsService()->getEditionGifts($idEdition);

                    if ($gifts !== null) {
                        $newGiftsHash = md5(json_encode($gifts));

                        if ($newGiftsHash !== $lastGiftsHash) {
                            $lastGiftsHash = $newGiftsHash;

                            echo $this->service->getSseEvent('get_gifts', $gifts);
                            flush();
                        }
                    }
                } catch (Exception $e) {
                    // Échec de la lecture
                    ResponseHelper::sse(MessageHelper::ERR_SSE_GIFTS, [__FUNCTION__, self::controllerName, $e->getMessage()]);
                }

                // Evènement de récupération des participants
                try {
                    $players = $this->getPlayersService()->getEditionPlayers($idEdition);

                    if ($players !== null) {
                        $newPlayersHash = md5(json_encode($players));

                        if ($newPlayersHash !== $lastPlayersHash) {
                            $lastPlayersHash = $newPlayersHash;

                            echo $this->service->getSseEvent('get_players', $players);
                            flush();
                        }
                    }
                } catch (Exception $e) {
                    // Échec de la lecture
                    ResponseHelper::sse(MessageHelper::ERR_SSE_PLAYERS, [__FUNCTION__, self::controllerName, $e->getMessage()]);
                }

                // Pause avant la prochaine boucle
                sleep(5);
            }
        } catch (Exception $e) {
            // Exception levée
            ResponseHelper::sse(MessageHelper::ERR_UNKNOWN_ERROR, [__FUNCTION__, self::controllerName, $e->getMessage()]);

            // Message d'erreur
            echo $this->service->getSseEvent('fatal_error', 'Exception levée SSE');
            flush();
        }
    }
}
