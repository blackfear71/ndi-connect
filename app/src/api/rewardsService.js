import { ajax } from 'rxjs/ajax';

const API_URL = process.env.REACT_APP_API_URL + '/rewards';

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
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` })
        };
    }

    /**
     * Attribution d'un cadeau à un participant
     * @param {*} idEdition Identifiant de l'édition
     * @param {*} body Données participant et cadeau
     * @returns Données participant et cadeau à jour
     */
    postReward = (idEdition, body) => {
        const url = `${this.apiUrl}/reward/${idEdition}`;
        return ajax.post(url, body, this.headers);
    };

    /**
     * Annulation de l'attribution d'un cadeau à un participant
     * @param {*} idEdition Identifiant de l'édition
     * @param {*} body Données participant et cadeau
     * @returns Données participant et cadeau à jour
     */
    deleteReward = (idEdition, idReward) => {
        const url = `${this.apiUrl}/delete/${idEdition}/${idReward}`;
        return ajax.delete(url, this.headers);
    };
}

export default RewardsService;
