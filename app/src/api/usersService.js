import { ajax } from 'rxjs/ajax';

const API_URL = process.env.REACT_APP_API_URL + '/users';

/**
 * Service appel API utilisateur (connexion, déconnexion...)
 */
class UsersService {
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
     * Contrôle authentification
     * @returns Indicateur authentification valide
     */
    checkAuth = () => {
        const url = `${this.apiUrl}/checkAuth`;
        return ajax.get(url, this.headers);
    };

    /**
     * Récupération des utilisateurs
     * @returns Liste des utilisateurs
     */
    getAllUsers = () => {
        const url = `${this.apiUrl}/all`;
        return ajax.get(url, this.headers);
    };

    /**
     * Connexion utilisateur
     * @param {*} body Informations d'identification
     * @returns Token de connexion
     */
    connect = (body) => {
        const url = `${this.apiUrl}/connect`;
        return ajax.post(url, body, this.headers);
    };

    /**
     * Déconnexion utilisateur
     * @returns Indicateur déconnexion
     */
    disconnect = () => {
        const url = `${this.apiUrl}/disconnect`;
        return ajax.post(url, null, this.headers);
    };
}

export default UsersService;
