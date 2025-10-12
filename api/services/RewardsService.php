<?php
require_once 'services/GiftsService.php';
require_once 'services/PlayersService.php';

require_once 'repositories/RewardsRepository.php';

class RewardsService
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
        $this->repository = new RewardsRepository($db);
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
     * Récupération du nombre d'attributions d'un cadeau
     */
    public function getRewardCount($idGift)
    {
        return $this->repository->getRewardCount($idGift);
    }

    /**
     * Récupération des cadeaux d'un participant
     */
    public function getPlayerRewards($id)
    {
        return $this->repository->getPlayerRewards($id);
    }

    /**
     * Attribution d'un cadeau
     */
    public function createReward($login, $idEdition, $idGift, $idPlayer)
    {
        // Récupération du cadeau
        $gift = $this->getGiftsService()->getGift($idGift);

        if (!$gift) {
            return null;
        }

        // Récupération du participant
        $player = $this->getPlayersService()->getPlayer($idPlayer);

        if (!$player) {
            return null;
        }

        // Récupération du nombre d'attributions du cadeau
        $rewardCount = $this->getRewardCount($idGift);

        // Contrôle attribution autorisée
        if (!$this->isValidRewardData($gift, $rewardCount, $player)) {
            return null;
        }

        // Insertion d'un enregistrement
        $dataReward = $this->processDataReward($player, $gift);

        if ($this->repository->create($login, $dataReward)) {
            $dataPlayer = $this->processDataPlayer($player, $gift);

            // Suppression des points du participant et récupération des données
            if ($this->getPlayersService()->updatePlayerPoints($idPlayer, $login, $dataPlayer)) {
                // Récupération des données cadeaux
                $data['gifts'] = $this->getGiftsService()->getEditionGifts($idEdition);

                // Récupération des données participants
                $data['players'] = $this->getPlayersService()->getEditionPlayers($idEdition);

                return $data;
            }
        }

        return null;
    }

    /**
     * Suppression logique de l'attribution d'un cadeau
     */
    public function deleteReward($login, $idEdition, $idReward)
    {
        // Récupération de l'attribution du cadeau du participant
        $reward = $this->repository->find($idReward);

        // Suppression logique de l'attribution
        if ($reward && $this->repository->logicalDelete($idReward, $login)) {
            // Récupération des points pour le participant
            if ($this->getPlayersService()->updatePlayerDelta($reward['id_player'], $login, $reward['points'])) {
                // Récupération des données cadeaux
                $data['gifts'] = $this->getGiftsService()->getEditionGifts($idEdition);

                // Récupération des données participants
                $data['players'] = $this->getPlayersService()->getEditionPlayers($idEdition);

                return $data;
            }
        }

        return null;
    }

    /**
     * Contrôle de cohérence des données
     */
    private function isValidRewardData($gift, $rewardCount, $player)
    {
        // Contrôle quantité restante
        $remainingQuantity = $gift['quantity'] - $rewardCount;

        // Contrôle points participant
        $enoughPoints = $player['points'] >= $gift['value'];

        return $remainingQuantity > 0
            && $enoughPoints;
    }

    /**
     * Formate les données avant traitement SQL (attribution)
     */
    private function processDataReward($player, $gift)
    {
        $sqlData = [
            'id_player' => $player['id'],
            'id_gift'   => $gift['id'],
            'points'    => $gift['value']
        ];

        return $sqlData;
    }

    /**
     * Formate les données avant traitement SQL (participant)
     */
    private function processDataPlayer($player, $gift)
    {
        $sqlData = [
            'points' => $player['points'] - $gift['value']
        ];

        return $sqlData;
    }
}
