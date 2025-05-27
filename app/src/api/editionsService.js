import { ajax } from 'rxjs/ajax';

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Service appel API éditions
 */
class EditionsService {
    /**
     * Récupération de toutes les éditions
     * @returns Liste des éditions
     */
    getAllEditions = () => {
        const url = `${API_URL}/editions/all`;
        // const headers = { 'l': this.login, 't': this.token, 'Accept-Language': this.langueId };
        return ajax.get(url); //, headers);
    };

    /**
     * Récupération d'une édition
     * @param {*} id Identifiant édition
     * @returns Edition
     */
    getEdition = (id) => {
        const url = `${API_URL}/editions/find/${id}`;
        // const headers = { 'l': this.login, 't': this.token, 'Accept-Language': this.langueId };

        return ajax.get(url); //, headers);
    };

    /**
     * Création édition
     * @param {*} body Données édition
     * @returns
     */
    insertEdition = (body) => {
        const url = `${API_URL}/editions/create`;
        // const headers = { 'l': this.login, 't': this.token, 'Content-Type': 'application/json', 'Accept-Language': this.langueId };

        // TODO : à voir pour passer les headers comme ça
        // TODO : prévoir des objets à l'image de la table pour passer le body (front ou back ?)

        return ajax.post(url, body); //, headers);
    };

    /**
     * Mise à jour édition
     * @param {*} id Identifiant édition
     * @param {*} body Données édition
     * @returns
     */
    updateEdition = (id, body) => {
        const url = `${API_URL}/editions/update/${id}`;
        // const headers = { 'l': this.login, 't': this.token, 'Content-Type': 'application/json', 'Accept-Language': this.langueId };

        return ajax.patch(url, body); //, headers);
    };

    /**
     * Suppression édition
     */
    deleteEdition = (id) => {
        const url = `${API_URL}/editions/delete/${id}`;
        // const headers = { 'l': this.login, 't': this.token, 'Content-Type': 'application/json', 'Accept-Language': this.langueId };

        return ajax.delete(url); //, headers);
    };
}

export default EditionsService;
