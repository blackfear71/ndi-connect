<?php
// Imports
require_once 'models/dtos/PlayerOutputDTO.php';
require_once 'models/dtos/RewardOutputDTO.php';

require_once 'services/CardsService.php';
require_once 'services/EditionsService.php';
require_once 'services/RewardsService.php';

require_once 'repositories/PlayersRepository.php';

class PlayersService
{
    private PDO $db;

    private ?CardsService $cardsService = null;
    private ?EditionsService $editionsService = null;
    private ?RewardsService $rewardsService = null;

    private PlayersRepository $playersRepository;

    /**
     * Constructeur par défaut
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->playersRepository = new PlayersRepository($db);
    }

    /**
     * Instancie le CardsService si besoin
     */
    private function getCardsService(): CardsService
    {
        if ($this->cardsService === null) {
            $this->cardsService = new CardsService($this->db);
        }

        return $this->cardsService;
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
     * Instancie le RewardsService si besoin
     */
    private function getRewardsService(): RewardsService
    {
        if ($this->rewardsService === null) {
            $this->rewardsService = new RewardsService($this->db);
        }

        return $this->rewardsService;
    }

    /**
     * Lecture des enregistrements d'une édition
     */
    public function getEditionPlayers(int $editionId): array
    {
        // Contrôle des données
        if (!$editionId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Liste des participants
        $players = $this->playersRepository->getEditionPlayers($editionId);

        // Récupération des données participants
        return array_map(function ($player) {
            $rewards = $this->getRewardsService()->getPlayerRewards($player->id);

            // Formatage des données participant
            return new PlayerOutputDTO(
                id: $player->id,
                editionId: $player->editionId,
                name: $player->name,
                points: $player->points,
                cardCode: $player->cardCode,
                rewards: $rewards
            );
        }, $players);
    }

    /**
     * Lecture d'un enregistrement
     */
    public function getPlayer(int $playerId): PlayerOutputDTO
    {
        // Contrôle des données
        if (!$playerId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Lecture du participant
        $player = $this->playersRepository->getPlayer($playerId);

        if (!$player) {
            throw new \RuntimeException(MessageHelper::ERR_PLAYER_NOT_FOUND);
        }

        // Récupération des données participant
        return new PlayerOutputDTO(
            id: $player->id,
            editionId: $player->editionId,
            name: $player->name,
            points: $player->points
        );
    }

    /**
     * Création d'un participant
     */
    public function createPlayer(int $editionId, UserOutputDTO $user, PlayerInputDTO $data): void
    {
        // Contrôle des données
        $this->isValidCreatePlayerData($editionId, $data, $user->level);

        // Construction de l'objet
        $player = new Player(
            editionId: $editionId,
            name: trim($data->name),
            points: $data->points,
            createdBy: $user->id,
        );

        // Insertion
        Database::runInTransaction($this->db, function () use ($player, $editionId, $user, $data) {
            // Création du participant
            $playerId = $this->playersRepository->createPlayer($player);

            if (!$playerId) {
                throw new \RuntimeException(MessageHelper::ERR_CREATION_FAILED);
            }

            // Liaison de la carte si scannée
            if ($data->cardCode !== null) {
                $this->getCardsService()->updateCardCode($editionId, $playerId, $data->cardCode, $user->id);
            }
        });
    }

    /**
     * Modification d'un participant
     */
    public function updatePlayer(int $playerId, UserOutputDTO $user, PlayerInputDTO $data): void
    {
        // Récupération de l'identifiant édition à partir du participant (pour lier une carte à la bonne édition)
        $editionId = $data->cardCode !== null ? $this->getPlayer($playerId)->editionId : null;

        // Contrôle des données
        $this->isValidUpdatePlayerData($playerId, $editionId, $data, $user->level);

        // Construction de l'objet
        $player = new Player(
            id: $playerId,
            name: trim($data->name),
            points: $data->points - $data->giveaway,
            updatedBy: $user->id,
        );

        // Modification
        Database::runInTransaction($this->db, function () use ($playerId, $player, $editionId, $user, $data) {
            // Modification du participant
            if (!$this->playersRepository->updatePlayer($player)) {
                throw new \RuntimeException(MessageHelper::ERR_UPDATE_FAILED);
            }

            // Don de points
            if ($data->giveaway !== null && $data->giveaway > 0 && $data->giveawayPlayerId !== null && $data->giveawayPlayerId !== 0) {
                $giveawayPlayer = new Player(
                    id: $data->giveawayPlayerId,
                    points: $data->giveaway,
                    updatedBy: $user->id,
                );

                if (!$this->playersRepository->updatePlayerPoints($giveawayPlayer)) {
                    throw new \RuntimeException(MessageHelper::ERR_UPDATE_FAILED);
                }
            }

            // Liaison de la carte (remplace la carte active du participant s'il en a une)
            if ($data->cardCode !== null) {
                $this->getCardsService()->updateCardCode($editionId, $playerId, $data->cardCode, $user->id);
            }
        });
    }

    /**
     * Modification des points d'un participant par ajout
     */
    public function updatePlayerPoints(int $playerId, int $delta, int $userId): void
    {
        // Contrôle des données
        if (!$playerId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Construction de l'objet
        $player = new Player(
            id: $playerId,
            points: $delta,
            updatedBy: $userId,
        );

        // Modification des points d'un participant
        if (!$this->playersRepository->updatePlayerPoints($player)) {
            throw new \RuntimeException(MessageHelper::ERR_UPDATE_FAILED);
        }
    }

    /**
     * Suppression logique d'un participant
     */
    public function deletePlayer(int $playerId, int $userId): void
    {
        // Contrôle des données
        if (!$playerId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Suppression du participant
        Database::runInTransaction($this->db, function () use ($playerId, $userId) {
            // Suppression physique des cartes du participant
            $this->getCardsService()->deletePlayerCards($playerId);

            // Suppression logique du participant
            if (!$this->playersRepository->deletePlayer($playerId, $userId)) {
                throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
            }
        });
    }

    /**
     * Suppression logique des participants d'une édition
     */
    public function deletePlayers(int $editionId, int $userId): void
    {
        // Contrôle des données
        if (!$editionId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Suppression logique des participants d'une édition
        if (!$this->playersRepository->deletePlayers($editionId, $userId)) {
            throw new \RuntimeException(MessageHelper::ERR_DELETION_FAILED);
        }
    }

    /**
     * Contrôle des données saisies (création)
     */
    private function isValidCreatePlayerData(int $editionId, PlayerInputDTO $data, int $level): void
    {
        // Identifiant édition renseigné
        if (!$editionId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Nom renseigné
        if (trim($data->name) === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_NAME);
        }

        // Points positifs
        if ($data->points < 0) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_POINTS);
        }

        // Edition terminée (sauf SUPERADMIN)
        if ($level !== EnumUserRole::SUPERADMIN->value) {
            $endDate = $this->getEditionsService()->getEditionEndDateByType($editionId, 'editions');

            if ($endDate === null || new \DateTimeImmutable() > $endDate) {
                throw new \RuntimeException(MessageHelper::ERR_EDITION_FINISHED);
            }
        }

        // Carte valide et libre
        if ($data->cardCode !== null && $this->getCardsService()->getCardByCode($editionId, $data->cardCode)) {
            throw new \RuntimeException(MessageHelper::ERR_CARD_ALREADY_REGISTERED);
        }
    }

    /**
     * Contrôle des données saisies (modification)
     */
    private function isValidUpdatePlayerData(int $playerId, ?int $editionId, PlayerInputDTO $data, int $level): void
    {
        // Identifiant participant renseigné
        if (!$playerId) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_ID);
        }

        // Nom renseigné
        if (trim($data->name) === '') {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_NAME);
        }

        // Points positifs (ou SUPERADMIN)
        if ($level !== EnumUserRole::SUPERADMIN->value && $data->points < 0) {
            throw new \InvalidArgumentException(MessageHelper::ERR_INVALID_POINTS);
        }

        // Don de points correctement renseigné
        $giveaway = $data->giveaway ?? null;
        $giveawayPlayerId = $data->giveawayPlayerId ?? null;

        if (!is_numeric($giveaway) || !is_numeric($giveawayPlayerId) || !(($giveaway > 0 && $giveawayPlayerId !== 0) || ($giveaway == 0 && $giveawayPlayerId == 0))) {
            throw new \InvalidArgumentException(MessageHelper::ERR_PLAYER_GIVEAWAY);
        }

        // Edition terminée (sauf SUPERADMIN)
        if ($level !== EnumUserRole::SUPERADMIN->value) {
            $endDate = $this->getEditionsService()->getEditionEndDateByType($playerId, 'players');

            if ($endDate === null || new \DateTimeImmutable() > $endDate) {
                throw new \RuntimeException(MessageHelper::ERR_EDITION_FINISHED);
            }
        }

        // Carte valide et libre
        if ($data->cardCode !== null && $this->getCardsService()->getCardByCode($editionId, $data->cardCode)) {
            throw new \RuntimeException(MessageHelper::ERR_CARD_ALREADY_REGISTERED);
        }
    }
}
