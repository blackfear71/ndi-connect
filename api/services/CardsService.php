<?php
// Imports
require_once 'models/dtos/CardOutputDTO.php';
require_once 'models/dtos/CardStatusOutputDTO.php';

require_once 'services/EditionsService.php';
require_once 'services/PlayersService.php';

require_once 'repositories/CardsRepository.php';

class CardsService
{
    private PDO $db;

    private ?EditionsService $editionsService = null;
    private ?PlayersService $playersService = null;

    private CardsRepository $cardsRepository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->cardsRepository = new CardsRepository($db);
    }

    /**
     * Instancie le EditionsService si besoin
     */
    private function getEditionsService(): EditionsService
    {
        if ($this->editionsService === null) {
            $this->editionsService = new EditionsService($this->db);
        }

        return $this->editionsService;
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
    public function getAllCards(): array
    {
        // Lecture des cartes
        $cards = $this->cardsRepository->getAllCards();

        return array_map(fn($card) => new CardOutputDTO(
            id: $card->id,
            code: $card->code,
            editionId: $card->editionId,
            playerId: $card->playerId,
            playerName: $card->playerName
        ), $cards);
    }

    /**
     * Lecture de l'état d'un code de carte (libre ou enregistrée, sinon erreur)
     */
    public function getCardStatus(int $editionId, string $code, ?UserOutputDTO $user): CardStatusOutputDTO
    {
        // Normalisation du code
        $code = DataHelper::normalizeCode($code);

        // Contrôle des données
        $this->isValidCardData($editionId, $code);

        // Edition terminée ou introuvable
        $endDate = $this->getEditionsService()->getEditionEndDateByType($editionId, 'editions');
        $isEditionFinished = $endDate === null || new \DateTimeImmutable() > $endDate;

        // Lecture de la carte
        $card = $this->cardsRepository->getCardByCode($editionId, $code);

        // Si la carte n'existe pas elle est soit libre soit non trouvée
        if (!$card) {
            // Si l'utilisateur est SUPERADMIN ou ADMIN et que l'édition n'est pas terminée, la carte est considérée comme libre
            if ($user !== null && ($user->level >= EnumUserRole::SUPERADMIN->value || ($user->level === EnumUserRole::ADMIN->value && !$isEditionFinished))) {
                return new CardStatusOutputDTO(
                    isFree: true
                );
            }

            // Si l'édition est terminée ou qu'on tente d'accéder à une carte qui n'existe pas, on renvoie une erreur
            throw new \RuntimeException($isEditionFinished ? MessageHelper::ERR_EDITION_FINISHED : MessageHelper::ERR_CARD_NOT_FOUND);
        }

        // Contrôle de l'existence du participant lié (s'il n'existe pas une erreur est renvoyée)
        $this->getPlayersService()->getPlayer($card->playerId);

        // Si la carte et le participant existent, la carte est considérée comme non libre
        return new CardStatusOutputDTO(
            isFree: false,
            playerId: $card->playerId
        );
    }

    /**
     * Lecture d'une carte par son code
     */
    public function getCardByCode(int $editionId, string $code): ?Card
    {
        // Normalisation du code
        $code = DataHelper::normalizeCode($code);

        // Contrôle des données
        $this->isValidCardData($editionId, $code);

        // Lecture de la carte
        return $this->cardsRepository->getCardByCode($editionId, $code);
    }

    /**
     * Liaison d'un code de carte à un participant
     */
    public function linkCard(int $editionId, int $playerId, string $code, int $userId): void
    {
        // Lecture de la carte du participant
        $currentCard = $this->cardsRepository->getCardByPlayerId($playerId);

        // Si le participant possède déjà une carte, son code est remplacé et l'ancien code redevient libre, sinon elle est créée
        if ($currentCard) {
            // Remplacement du code de la carte existante
            $card = new Card(
                id: $currentCard->id,
                code: DataHelper::normalizeCode($code),
                updatedBy: $userId,
            );

            if (!$this->cardsRepository->updateCardCode($card)) {
                throw new \RuntimeException(MessageHelper::ERR_UPDATE_FAILED);
            }
        } else {
            // Création de la carte
            $card = new Card(
                editionId: $editionId,
                playerId: $playerId,
                code: DataHelper::normalizeCode($code),
                createdBy: $userId,
            );

            if (!$this->cardsRepository->createCard($card)) {
                throw new \RuntimeException(MessageHelper::ERR_CREATION_FAILED);
            }
        }
    }

    /**
     * Suppression physique d'une carte (le code redevient libre)
     */
    public function deleteCard(int $cardId): void
    {
        // Contrôle des données
        if (!$cardId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Suppression
        if (!$this->cardsRepository->deleteCard($cardId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Suppression physique des cartes d'un participant (les codes redeviennent libres)
     */
    public function deletePlayerCards(int $playerId): void
    {
        // Contrôle des données
        if (!$playerId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Suppression
        if (!$this->cardsRepository->deletePlayerCards($playerId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Suppression physique des cartes d'une édition (les codes redeviennent libres)
     */
    public function deleteEditionCards(int $editionId): void
    {
        // Contrôle des données
        if (!$editionId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Suppression
        if (!$this->cardsRepository->deleteEditionCards($editionId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Contrôle des données saisies (édition et format code de carte)
     */
    private function isValidCardData(?int $editionId, string $code): void
    {
        // Identifiant édition renseigné
        if (!$editionId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Format du code
        if (preg_match(RegexHelper::CARD_CODE, $code) !== 1) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_CARD_CODE);
        }
    }
}
