import { ajax } from 'rxjs/ajax';

const API_URL = process.env.REACT_APP_API_URL + '/players';

/**
 * Service appel API participants
 */
class PlayersService {
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
     * Création d'un nouveau participant
     * @param {*} idEdition Identifiant édition
     * @param {*} body Données participant
     * @returns Données participant créé
     */
    createPlayer = (idEdition, body) => {
        const url = `${this.apiUrl}/create/${idEdition}`;
        return ajax({
            url,
            method: 'POST',
            headers: this.headers,
            body,
            withCredentials: true
        });
    };

    /**
     * Mise à jour participant
     * @param {*} idEdition Identifiant édition
     * @param {*} idPlayer Identifiant participant
     * @param {*} body Données participant
     * @returns Données participant à jour
     */
    updatePlayer = (idEdition, idPlayer, body) => {
        const url = `${this.apiUrl}/update/${idEdition}/${idPlayer}`;
        return ajax({
            url,
            method: 'PATCH',
            headers: this.headers,
            body,
            withCredentials: true
        });
    };

    /**
     * Suppression d'un participant
     * @param {*} idEdition Identifiant édition
     * @param {*} idPlayer Identifiant participant
     * @returns Message retour
     */
    deletePlayer = (idEdition, idPlayer) => {
        const url = `${this.apiUrl}/delete/${idEdition}/${idPlayer}`;
        return ajax({
            url,
            method: 'DELETE',
            headers: this.headers,
            withCredentials: true
        });
    };
}

export default PlayersService;
