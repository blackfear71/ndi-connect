<?php
require_once 'services/GiftsService.php';
require_once 'services/PlayersService.php';

require_once 'repositories/EditionsRepository.php';

class EditionsService
{
    private $giftsService = null;
    private $playersService = null;

    private $db;
    private $repository;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->db = $db;
        $this->repository = new EditionsRepository($db);
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
     * Lecture de tous les enregistrements
     */
    public function getAllEditions()
    {
        return $this->repository->getAllEditions();
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getEdition($id)
    {
        $edition = null;

        if ($id) {
            $data = $this->repository->getEdition($id);

            if ($data) {
                // Vérification image existante et génération URL
                $data['picture'] = FileHelper::checkFile('images', $data['picture']);

                // Récupération des données édition
                $edition['edition'] = $data;

                // Récupération des données cadeaux
                $edition['gifts'] = $this->getGiftsService()->getEditionGifts($id);

                // Récupération des données participants
                $edition['players'] = $this->getPlayersService()->getEditionPlayers($id);
            }
        }

        return $edition;
    }

    /**
     * Lecture des éditions recherchées
     */
    public function getSearchEditions($search)
    {
        if (empty($search)) {
            return [];
        }

        return $this->repository->getSearchEditions(trim($search));
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createEdition($login, $data, $file)
    {
        // Contrôle des données
        if (!$this->isValidEditionData($data)) {
            return null;
        }

        // Traitement de l'image
        $data['picture'] = $this->uploadImage(null, $data['pictureAction'] ?? null, $file['picture'] ?? null);

        // Insertion
        $data = $this->processDataEdition($data);
        return $this->repository->create($login, $data);
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateEdition($id, $login, $data, $file)
    {
        // Contrôle des données
        if (!$this->isValidEditionData($data)) {
            return null;
        }

        // Traitement de l'image
        $data['picture'] = $this->uploadImage($id, $data['pictureAction'] ?? null, $file['picture'] ?? null);

        // Modification
        $data = $this->processDataEdition($data);

        if ($id && $this->repository->update($id, $login, $data)) {
            return $this->getEdition($id);
        }

        return null;
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteEdition($id, $login)
    {
        // Suppression logique des cadeaux
        $this->getGiftsService()->deleteGifts($id, $login);

        // Suppression logique des participants
        $this->getPlayersService()->deletePlayers($id, $login);

        // Suppression logique de l'édition
        return $this->repository->logicalDelete($id, $login);
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidEditionData($data)
    {
        $location = trim($data['location'] ?? '');
        $startDate = $data['startDate'] ?? null;
        $startTime = $data['startTime'] ?? null;
        $endTime = $data['endTime'] ?? null;

        // Contrôle date
        $formatD = 'Y-m-d';
        $d = DateTime::createFromFormat($formatD, $startDate);

        // Contrôle heures
        $formatH = 'H:i';
        $h1 = DateTime::createFromFormat($formatH, $startTime);
        $h2 = DateTime::createFromFormat($formatH, $endTime);

        return $location
            && $d && $d->format($formatD) === $startDate
            && $h1 && $h1->format($formatH) === $startTime
            && $h2 && $h2->format($formatH) === $endTime;
    }

    /**
     * Traitement de l'image
     */
    private function uploadImage($id, $action, $file)
    {
        // Récupération des données de l'édition
        $picture = $id ? $this->repository->getEditionPicture($id) : null;

        // Traitement de l'image
        switch ($action) {
            case 'insert':
                // Import de la nouvelle image
                $fileName = FileHelper::uploadImage('images', $file);

                // Suppression de l'ancienne image si pas d'erreur (hors création)
                if ($fileName && $picture) {
                    FileHelper::deleteFile('images', $picture);
                }

                return $fileName;
            case 'delete':
                // Suppression de l'ancienne image (hors création)
                if ($picture) {
                    FileHelper::deleteFile('images', $picture);
                }

                return null;
            default:
                // Si pas d'action alors on laisse en l'état
                return $picture;
        }
    }

    /**
     * Formate les données avant traitement SQL
     */
    private function processDataEdition($data)
    {
        $startDate = new DateTime($data['startDate'] . ' ' . $data['startTime']);
        $endDate = new DateTime($data['startDate'] . ' ' . $data['endTime']);
        $endDate->modify('+1 day');

        $sqlData = [
            'location'   => $data['location'],
            'start_date' => $startDate->format('Y-m-d H:i:s'),
            'end_date'   => $endDate->format('Y-m-d H:i:s'),
            'picture'    => $data['picture'],
            'theme'      => $data['theme'],
            'challenge'  => $data['challenge']
        ];

        return $sqlData;
    }
}
