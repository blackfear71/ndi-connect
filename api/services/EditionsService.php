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
    public function getEdition(int $editionId): ?EditionResponseDTO
    {
        // Contrôle des données
        if (!$editionId) {
            return null;
        }

        // Lecture de l'édition
        $edition = $this->repository->getEdition($editionId);

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
        $gifts = $this->getGiftsService()->getEditionGifts($editionId);

        // Récupération des données participants
        $players = $this->getPlayersService()->getEditionPlayers($editionId);

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
    public function createEdition(EditionInputDTO $data, ?array $file, int $userId): ?string
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
        $picture = $this->uploadImage(null, $data->pictureAction, $file['picture'] ?? null);

        // Construction de l'objet
        $edition = new Edition(
            location: trim($data->location),
            startDate: $startDate,
            endDate: $endDate,
            picture: $picture,
            theme: $data->theme !== null ? trim($data->theme) : null,
            challenge: $data->challenge !== null ? trim($data->challenge) : null,
            createdBy: $userId
        );

        // Insertion
        return $this->repository->createEdition($edition);
    }

    /**
     * Modification d'un enregistrement
     */
    public function updateEdition(int $editionId, EditionInputDTO $data, ?array $file, int $userId): ?EditionResponseDTO
    {
        // Contrôle des données
        if (!$editionId || !$this->isValidEditionData($data)) {
            return null;
        }

        // Traitement des dates
        $startDate = new \DateTimeImmutable($data->startDate . ' ' . $data->startTime);
        $endDate = new \DateTimeImmutable($data->startDate . ' ' . $data->endTime);
        $endDate = $endDate->modify('+1 day');

        // Traitement de l'image
        $picture = $this->uploadImage($editionId, $data->pictureAction, $file['picture'] ?? null);

        // Construction de l'objet
        $edition = new Edition(
            id: $editionId,
            location: trim($data->location),
            startDate: $startDate,
            endDate: $endDate,
            picture: $picture,
            theme: $data->theme !== null ? trim($data->theme) : null,
            challenge: $data->challenge !== null ? trim($data->challenge) : null,
            updatedBy: $userId
        );

        // Modification
        if (!$this->repository->updateEdition($edition)) {
            return null;
        }

        // Lecture de l'édition
        return $this->getEdition($editionId);
    }

    /**
     * Suppression logique d'un enregistrement
     */
    public function deleteEdition(int $editionId, int $userId): ?bool
    {
        // Contrôle des données
        if (!$editionId) {
            return null;
        }

        // Suppression logique des cadeaux
        if (!$this->getGiftsService()->deleteGifts($editionId, $userId)) {
            return null;
        }

        // Suppression logique des participants
        if (!$this->getPlayersService()->deletePlayers($editionId, $userId)) {
            return null;
        }

        // Suppression logique de l'édition
        return $this->repository->logicalDelete($editionId, $userId);
    }

    /**
     * Contrôle des données saisies (création / modification)
     */
    private function isValidEditionData(EditionInputDTO $data): bool
    {
        $location = trim($data->location);

        return $location
            && DataHelper::isValidDateFormat($data->startDate, 'Y-m-d')
            && DataHelper::isValidDateFormat($data->startTime, 'H:i')
            && DataHelper::isValidDateFormat($data->endTime, 'H:i');
    }

    /**
     * Traitement de l'image
     */
    private function uploadImage(?int $editionId, ?string $action, ?array $file): ?string
    {
        // Récupération de l'image de l'édition
        $picture = $editionId ? $this->repository->getEditionPicture($editionId) : null;

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
