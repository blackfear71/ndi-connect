import { ajax } from 'rxjs/ajax';

const API_URL = process.env.REACT_APP_API_URL + '/users';

/**
 * Service appel API utilisateurs
 */
class UsersService {
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
     * Contrôle authentification
     * @returns Indicateur authentification valide
     */
    checkAuth = () => {
        const url = `${this.apiUrl}/checkAuth`;
        return ajax({
            url,
            method: 'GET',
            headers: this.headers,
            withCredentials: true
        });
    };

    /**
     * Récupération des utilisateurs
     * @returns Liste des utilisateurs
     */
    getAllUsers = () => {
        const url = `${this.apiUrl}/all`;
        return ajax({
            url,
            method: 'GET',
            headers: this.headers,
            withCredentials: true
        });
    };

    /**
     * Connexion utilisateur
     * @param {*} body Informations d'identification
     * @returns Token de connexion
     */
    connect = (body) => {
        const url = `${this.apiUrl}/connect`;
        return ajax({
            url,
            method: 'POST',
            headers: this.headers,
            body,
            withCredentials: true
        });
    };

    /**
     * Déconnexion utilisateur
     * @returns Indicateur déconnexion
     */
    disconnect = () => {
        const url = `${this.apiUrl}/disconnect`;
        return ajax({
            url,
            method: 'POST',
            headers: this.headers,
            withCredentials: true
        });
    };

    /**
     * Création utilisateur
     * @param {*} body Données utilisateur
     * @returns Message retour
     */
    createUser = (body) => {
        const url = `${this.apiUrl}/create`;
        return ajax({
            url,
            method: 'POST',
            headers: this.headers,
            body,
            withCredentials: true
        });
    };

    /**
     * Réinitialisation mot de passe
     * @param {*} id Identifiant utilisateur
     * @returns Message retour
     */
    resetPassword = (id) => {
        const url = `${this.apiUrl}/reset/${id}`;
        return ajax({
            url,
            method: 'PATCH',
            headers: this.headers,
            withCredentials: true
        });
    };

    /**
     * Mise à jour mot de passe
     * @param {*} body Données mot de passe
     * @returns Message retour
     */
    updatePassword = (body) => {
        const url = `${this.apiUrl}/password`;
        return ajax({
            url,
            method: 'PATCH',
            headers: this.headers,
            body,
            withCredentials: true
        });
    };

    /**
     * Mise à jour utilisateur
     * @param {*} body Données utilisateur
     * @returns Liste des utilisateurs
     */
    updateUser = (body) => {
        const url = `${this.apiUrl}/update`;
        return ajax({
            url,
            method: 'PATCH',
            headers: this.headers,
            body,
            withCredentials: true
        });
    };

    /**
     * Suppression utilisateur
     * @param {*} id Identifiant utilisateur
     * @returns Liste des utilisateurs
     */
    deleteUser = (id) => {
        const url = `${this.apiUrl}/delete/${id}`;
        return ajax({
            url,
            method: 'DELETE',
            headers: this.headers,
            withCredentials: true
        });
    };
}

export default UsersService;
