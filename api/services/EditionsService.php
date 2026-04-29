<?php
// Imports
require_once 'models/dtos/EditionOutputDTO.php';
require_once 'models/dtos/EditionResponseDTO.php';

require_once 'services/GiftsService.php';
require_once 'services/PlayersService.php';

require_once 'repositories/EditionsRepository.php';

class EditionsService
{
    private PDO $db;
    private ?GiftsService $giftsService = null;
    private ?PlayersService $playersService = null;
    private EditionsRepository $repository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->repository = new EditionsRepository($db);
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
     * Lecture de tous les enregistrements
     */
    public function getAllEditions(): array
    {
        $editions = $this->repository->getAllEditions();

        return array_map(fn($edition) => new EditionOutputDTO(
            id: $edition->id,
            location: $edition->location,
            startDate: $edition->startDate,
            endDate: $edition->endDate,
            playerCount: $edition->playerCount
        ), $editions);
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getEdition(int|string $id): ?EditionResponseDTO
    {
        // Contrôle données renseignées
        if (!$id) {
            return null;
        }

        // Lecture de l'édition
        $edition = $this->repository->getEdition($id);

        if (!$edition) {
            return null;
        }

        // Vérification image existante et génération URL
        $picture = FileHelper::checkFile('images', $edition->picture);

        // Formatage des données édition
        $edition = new EditionOutputDTO(
            id: $edition->id,
            location: $edition->location,
            startDate: $edition->startDate,
            endDate: $edition->endDate,
            picture: $picture,
            theme: $edition->theme,
            challenge: $edition->challenge
        );

        // Récupération des données cadeaux
        $gifts = $this->getGiftsService()->getEditionGifts($id);

        // Récupération des données participants
        $players = $this->getPlayersService()->getEditionPlayers($id);

        // Récupération des données édition
        return new EditionResponseDTO(
            edition: $edition,
            gifts: $gifts,
            players: $players
        );
    }

    /**
     * Lecture des éditions recherchées
     */
    public function getSearchEditions(string $search): array
    {
        if (empty($search)) {
            return [];
        }

        $editions = $this->repository->getSearchEditions(trim($search));

        return array_map(fn($edition) => new EditionOutputDTO(
            id: $edition->id,
            location: $edition->location,
            startDate: $edition->startDate,
            endDate: $edition->endDate,
            playerCount: $edition->playerCount
        ), $editions);
    }

    /**
     * Insertion d'un enregistrement
     */
    public function createEdition(string $login, EditionInputDTO $data, ?array $file): ?string
    {
        // Contrôle des données
        if (!$this->isValidEditionData($data)) {
            return null;
        }

        // Traitement des dates
        $startDate = new \DateTimeImmutable($data->startDate . ' ' . $data->startTime);
        $endDate = new \DateTimeImmutable($data->startDate . ' ' . $data->endTime);
        $endDate = $endDate->modify('+1 day');

        // Traitement de l'image
        $picture = $this->uploadImage(null, $data->pictureAction ?? null, $file['picture'] ?? null);

        // Construction de l'objet
        $edition = new Edition(
            location: $data->location,
            startDate: $startDate,
            endDate: $endDate,
            picture: $picture,
            theme: $data->theme,
            challenge: $data->challenge,
            createdBy: $login
        );

        // Insertion
        return $this->repository->createEdition($edition);
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateEdition(int|string $id, string $login, EditionInputDTO $data, ?array $file): ?array
    {
        // Contrôle des données
        if (!$id || !$this->isValidEditionData($data)) {
            return null;
        }

        // Traitement des dates
        $startDate = new \DateTimeImmutable($data->startDate . ' ' . $data->startTime);
        $endDate = new \DateTimeImmutable($data->startDate . ' ' . $data->endTime);
        $endDate = $endDate->modify('+1 day');

        // Traitement de l'image
        $picture = $this->uploadImage($id, $data->pictureAction ?? null, $file['picture'] ?? null);

        // Construction de l'objet
        $edition = new Edition(
            id: $data->id,
            location: $data->location,
            startDate: $startDate,
            endDate: $endDate,
            picture: $picture,
            theme: $data->theme,
            challenge: $data->challenge,
            updatedBy: $login
        );

        // Modification
        if (!$this->repository->updateEdition($id, $edition)) {
            return null;
        }

        // Lecture de l'édition
        return $this->getEdition($id);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteEdition(int|string $id, string $login): ?bool
    {
        // Suppression logique des cadeaux
        if (!$this->getGiftsService()->deleteGifts($id, $login)) {
            return null;
        }

        // Suppression logique des participants
        if (!$this->getPlayersService()->deletePlayers($id, $login)) {
            return null;
        }

        // Suppression logique de l'édition
        return $this->repository->logicalDelete($id, $login);
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidEditionData(EditionInputDTO $data): bool
    {
        $location = trim($data->location ?? '');
        $startDate = $data->startDate ?? null;
        $startTime = $data->startTime ?? null;
        $endTime = $data->endTime ?? null;

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
    private function uploadImage(int|string|null $id, ?string $action, ?array $file): ?string
    {
        // Récupération de l'image de l'édition
        $picture = $id ? $this->repository->getEditionPicture($id) : null;

        // Traitement de l'image
        switch ($action) {
            case EnumAction::CREATE->value:
                // Import de la nouvelle image
                $fileName = FileHelper::uploadImage('images', $file);

                // Suppression de l'ancienne image si pas d'erreur (hors création)
                if ($fileName && $picture) {
                    FileHelper::deleteFile('images', $picture);
                }

                return $fileName;
            case EnumAction::DELETE->value:
                // Suppression de l'ancienne image (hors création)
                if (!$picture) {
                    return null;
                }

                FileHelper::deleteFile('images', $picture);
            default:
                // Si pas d'action alors on laisse en l'état
                return $picture;
        }
    }
}
