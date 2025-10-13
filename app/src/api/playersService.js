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
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` })
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
        return ajax.post(url, body, this.headers);
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
        return ajax.patch(url, body, this.headers);
    };

    /**
     * Suppression d'un participant
     * @param {*} idEdition Identifiant édition
     * @param {*} idPlayer Identifiant participant
     * @returns Message retour
     */
    deletePlayer = (idEdition, idPlayer) => {
        const url = `${this.apiUrl}/delete/${idEdition}/${idPlayer}`;
        return ajax.delete(url, this.headers);
    };
}

export default PlayersService;
