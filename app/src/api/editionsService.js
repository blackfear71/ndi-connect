import { ajax } from 'rxjs/ajax';

const API_URL = import.meta.env.VITE_API_URL + '/editions';

/**
 * Service appel API éditions
 */
class EditionsService {
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
     * Récupération d'une édition via SSE
     * @returns Données SSE
     */
    getEditionStream = (id) => {
        const url = `${this.apiUrl}/events?id=${id}`;
        return new EventSource(url);
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
        return ajax({
            url,
            method: 'POST', // La méthode doit être POST pour remplir $_POST et $_FILES côté back
            headers: undefined, // Si le body est de type FormData, le Content-Type ne doit pas être précisé dans le header
            body,
            withCredentials: true
        });
    };

    /**
     * Mise à jour édition
     * @param {*} id Identifiant édition
     * @param {*} body Données édition
     * @returns Données édition à jour
     */
    updateEdition = (id, body) => {
        const url = `${this.apiUrl}/update/${id}`;
        return ajax({
            url,
            method: 'POST', // La méthode doit être POST pour remplir $_POST et $_FILES côté back
            headers: undefined, // Si le body est de type FormData, le Content-Type ne doit pas être précisé dans le header
            body,
            withCredentials: true
        });
    };

    /**
     * Suppression édition
     * @param {*} id Identifiant édition
     * @returns Message retour
     */
    deleteEdition = (id) => {
        const url = `${this.apiUrl}/delete/${id}`;
        return ajax({
            url,
            method: 'DELETE',
            headers: this.headers,
            withCredentials: true
        });
    };
}

export default EditionsService;
