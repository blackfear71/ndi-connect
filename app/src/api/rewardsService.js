import { ajax } from 'rxjs/ajax';

const API_URL = import.meta.env.VITE_API_URL + '/rewards';

/**
 * Service appel API attribution cadeaux
 */
class RewardsService {
    /**
     * Constructeur du service
     */
    constructor() {
        this.apiUrl = API_URL;
        this.headers = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Attribution d'un cadeau à un participant
     * @param {*} body Données participant et cadeau
     * @returns Données retour
     */
    createReward = (idGift, idPlayer) => {
        const url = `${this.apiUrl}/create/${idGift}/${idPlayer}`;
        return ajax({
            url,
            method: 'POST',
            headers: this.headers,
            withCredentials: true
        });
    };

    /**
     * Annulation de l'attribution d'un cadeau à un participant
     * @param {*} idEdition Identifiant de l'édition
     * @param {*} idReward Identifiant de la récompense
     * @returns Données retour
     */
    deleteReward = (idEdition, idReward) => {
        const url = `${this.apiUrl}/delete/${idReward}`;
        return ajax({
            url,
            method: 'DELETE',
            headers: this.headers,
            withCredentials: true
        });
    };
}

export default RewardsService;
