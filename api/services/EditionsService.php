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

        // TODO : à remanier une fois les données à remonter déterminées :
        // - date/horaires
        // - thème/sujet des étudiants
        // - défi CGI
        if ($data) {
            // Récupération des données édition
            $edition['edition'] = $data;

            // Récupération des données à propos
            $edition['about'] = $data;

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
        $data['start_date'] = $data['startDate'];
        unset($data['startDate']);

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
        $data['start_date'] = $data['startDate'];
        unset($data['startDate']);

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
        $startDate = $data['startDate'] ?? null;
        $location = trim($data['location'] ?? '');

        $format = 'Y-m-d';
        $d = DateTime::createFromFormat($format, $startDate);

        return $d && $d->format($format) === $startDate && $location;
    }
}
