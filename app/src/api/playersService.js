import { ajax } from 'rxjs/ajax';

// TODO : réduire les routes en collant "players" à ça, faire aussi pour les autres services
const API_URL = process.env.REACT_APP_API_URL;

/**
 * Service appel API participants
 */
class PlayersService {
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
     * Création d'un nouveau participant
     * @param {*} idEdition Identifiant édition
     * @param {*} body Données participant
     * @returns
     */
    insertPlayer = (idEdition, body) => {
        const url = `${API_URL}/players/create/${idEdition}`;
        return ajax.post(url, body, this.headers);
    };

    /**
     * Mise à jour participant
     * @param {*} idEdition Identifiant édition
     * @param {*} idPlayer Identifiant participant
     * @param {*} body Données participant
     * @returns
     */
    updatePlayer = (idEdition, idPlayer, body) => {
        const url = `${API_URL}/players/update/${idEdition}/${idPlayer}`;
        return ajax.patch(url, body, this.headers);
    };

    /**
     * Suppression d'un participant
     * @param {*} idEdition Identifiant édition
     * @param {*} idPlayer Identifiant participant
     * @returns
     */
    deletePlayer = (idEdition, idPlayer) => {
        const url = `${API_URL}/players/delete/${idEdition}/${idPlayer}`;
        return ajax.delete(url, this.headers);
    };
}

export default PlayersService;
