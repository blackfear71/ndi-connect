import { ajax } from 'rxjs/ajax';

const API_URL = process.env.REACT_APP_API_URL + '/assignments';

/**
 * Service appel API cadeaux
 */
class AssignmentsService {
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
}

export default AssignmentsService;
