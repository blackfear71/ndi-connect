<?php
require_once 'services/GiftsService.php';
require_once 'services/PlayersService.php';

require_once 'repositories/EditionsRepository.php';

class EditionsService
{
    private $giftsService;
    private $playersService;

    private $repository;

    /**
     * Constructeur par défaut
     */
    public function __construct($db)
    {
        $this->giftsService = new GiftsService($db);
        $this->playersService = new PlayersService($db);

        $this->repository = new EditionsRepository($db);
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
        $data = $this->repository->getEdition($id);

        if ($data) {
            // Récupération des données édition
            $edition['edition'] = $data;

            // Récupération des données cadeaux
            $edition['gifts'] = $this->giftsService->getEditionGifts($id);

            // Récupération des données participants
            $edition['players'] = $this->playersService->getEditionPlayers($id);
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
    public function createEdition($login, $data)
    {
        // Contrôle des données
        if (!$this->isValidEditionData($data)) {
            return null;
        }

        // Insertion
        $data = $this->processData($data);
        return $this->repository->create($login, $data);
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateEdition($id, $login, $data)
    {
        // Contrôle des données
        if (!$this->isValidEditionData($data)) {
            return null;
        }

        // Modification
        $data = $this->processData($data);

        if ($this->repository->update($id, $login, $data)) {
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
        $this->giftsService->deleteGifts($id, $login);

        // Suppression logique des participants
        $this->playersService->deletePlayers($id, $login);

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
     * Formate les données avant traitement SQL
     */
    private function processData($data)
    {
        $startDate = new DateTime($data['startDate'] . ' ' . $data['startTime']);
        $endDate = new DateTime($data['startDate'] . ' ' . $data['endTime']);
        $endDate->modify('+1 day');

        $sqlData = [
            'location'   => $data['location'],
            'start_date' => $startDate->format('Y-m-d H:i:s'),
            'end_date'   => $endDate->format('Y-m-d H:i:s'),
            'theme'      => $data['theme'],
            'challenge'  => $data['challenge']
        ];

        return $sqlData;
    }
}
