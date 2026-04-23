import { ajax } from 'rxjs/ajax';

const API_URL = import.meta.env.VITE_API_URL + '/players';

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
     * Récupération de tous les participants d'une édition
     * @returns Liste des participants
     */
    getEditionPlayers = (idEdition) => {
        const url = `${this.apiUrl}/edition/${idEdition}`;
        return ajax.get(url, this.headers);
    };

    /**
     * Création d'un nouveau participant
     * @param {*} idEdition Identifiant édition
     * @param {*} body Données participant
     * @returns Données retour
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
     * @returns Données retour
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
     * @returns Données retour
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
