import { ajax } from 'rxjs/ajax';

const API_URL = 'http://localhost/ndi-connect/backend'; //process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Service class for managing projects from the API.
 */
class TestService {
    /**
     * Allows to get a project from the database.
     *
     * @param {*} projetId The project identifier.
     */
    getAllTest = () => {
        const url = `${API_URL}/tests/all`;
        // const headers = { 'l': this.login, 't': this.token, 'Accept-Language': this.langueId };

        return ajax.get(url); //, headers);
    };

    getOneTest = (test_id) => {
        const url = `${API_URL}/tests/find/${test_id}`;
        // const headers = { 'l': this.login, 't': this.token, 'Accept-Language': this.langueId };

        return ajax.get(url); //, headers);
    };

    insertTest = (body) => {
        const url = `${API_URL}/tests/create`;
        // const headers = { 'l': this.login, 't': this.token, 'Content-Type': 'application/json', 'Accept-Language': this.langueId };

        // TODO : à voir pour passer les headers comme ça
        // TODO : prévoir des objets à l'image de la table pour passer le body (front ou back ?)

        return ajax.post(url, body); //, headers);
    };

    updateTest = (test_id, body) => {
        const url = `${API_URL}/tests/update/${test_id}`;
        // const headers = { 'l': this.login, 't': this.token, 'Content-Type': 'application/json', 'Accept-Language': this.langueId };

        return ajax.patch(url, body); //, headers);
    };

    deleteTest = (test_id) => {
        const url = `${API_URL}/tests/delete/${test_id}`;
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

export default TestService;
