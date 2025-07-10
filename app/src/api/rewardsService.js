import { ajax } from 'rxjs/ajax';

const API_URL = process.env.REACT_APP_API_URL + '/rewards';

/**
 * Service appel API attribution cadeaux
 */
class RewardsService {
    /**
     * Constructeur du service
     * @param {*} token Token de connexion
     */
    constructor(token = null) {
        this.apiUrl = API_URL;
        this.headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        };
    }

    /**
     * Attribution d'un cadeau à un participant
     * @param {*} body Données participant et cadeau
     * @returns
     */
    postReward = (idEdition, body) => {
        const url = `${this.apiUrl}/reward/${idEdition}`;
        return ajax.post(url, body, this.headers);
    };
}

export default RewardsService;
