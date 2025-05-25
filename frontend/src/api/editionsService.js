import { ajax } from 'rxjs/ajax';

// LOCAL    : 'http://localhost/ndi-connect/backend';
// IDEAL    : process.env.REACT_APP_API_URL
// ORIGINE  : 'http://localhost:3000/api';
// SYNOLOGY : 'api'
const API_URL = 'api';

/**
 * Service class for managing projects from the API.
 */
class EditionsService {
    /**
     * Allows to get a project from the database.
     *
     * @param {*} projetId The project identifier.
     */
    getAllEditions = () => {
        const url = `${API_URL}/editions/all`;
        // const headers = { 'l': this.login, 't': this.token, 'Accept-Language': this.langueId };
        return ajax.get(url); //, headers);
    };

    getEdition = (id) => {
        const url = `${API_URL}/editions/find/${id}`;
        // const headers = { 'l': this.login, 't': this.token, 'Accept-Language': this.langueId };

        return ajax.get(url); //, headers);
    };

    insertEdition = (body) => {
        const url = `${API_URL}/editions/create`;
        // const headers = { 'l': this.login, 't': this.token, 'Content-Type': 'application/json', 'Accept-Language': this.langueId };

        // TODO : à voir pour passer les headers comme ça
        // TODO : prévoir des objets à l'image de la table pour passer le body (front ou back ?)

        return ajax.post(url, body); //, headers);
    };

    updateEdition = (id, body) => {
        const url = `${API_URL}/editions/update/${id}`;
        // const headers = { 'l': this.login, 't': this.token, 'Content-Type': 'application/json', 'Accept-Language': this.langueId };

        return ajax.patch(url, body); //, headers);
    };

    deleteEdition = (id) => {
        const url = `${API_URL}/editions/delete/${id}`;
        // const headers = { 'l': this.login, 't': this.token, 'Content-Type': 'application/json', 'Accept-Language': this.langueId };

        return ajax.delete(url); //, headers);
    };
    /**
     * Update the definition of the project
     *
     * @param {*} projetId The project identifier
     * @param {*} body the data to save
     */
    // updateDefinitionProject = (projetId, body) => {
    //     const url = `${this.rootApiUrl}/projects/${projetId}/definition`;
    //     const headers = { 'l': this.login, 't': this.token, 'Content-Type': 'application/json', 'Accept-Language': this.langueId };

    //     return ajax.patch(url, body, headers);
    // };
}

export default EditionsService;
