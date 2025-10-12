import { ajax } from 'rxjs/ajax';

const API_URL = process.env.REACT_APP_API_URL + '/editions';

/**
 * Service appel API éditions
 */
class EditionsService {
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
     * Récupération de toutes les éditions
     * @returns Liste des éditions
     */
    getAllEditions = () => {
        const url = `${this.apiUrl}/all`;
        return ajax.get(url, this.headers);
    };

    /**
     * Récupération d'une édition
     * @param {*} id Identifiant édition
     * @returns Edition
     */
    getEdition = (id) => {
        const url = `${this.apiUrl}/find/${id}`;
        return ajax.get(url, this.headers);
    };

    /**
     * Récupération des éditions recherchées
     * @param {*} body Saisie
     * @returns Liste des éditions recherchées
     */
    getSearchEditions = (body) => {
        const url = `${this.apiUrl}/search`;
        return ajax.post(url, body, this.headers);
    };

    /**
     * Création édition
     * @param {*} body Données édition
     * @returns Message retour
     */
    createEdition = (body) => {
        const url = `${this.apiUrl}/create`;
        return ajax.post(url, body, this.headers);
    };

    /**
     * Mise à jour édition
     * @param {*} id Identifiant édition
     * @param {*} body Données édition
     * @returns Données édition à jour
     */
    updateEdition = (id, body) => {
        const url = `${this.apiUrl}/update/${id}`;
        return ajax.patch(url, body, this.headers);
    };

    /**
     * Suppression édition
     * @param {*} id Identifiant édition
     * @returns Message retour
     */
    deleteEdition = (id) => {
        const url = `${this.apiUrl}/delete/${id}`;
        return ajax.delete(url, this.headers);
    };
}

export default EditionsService;
