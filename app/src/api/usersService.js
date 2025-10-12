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

    /**
     * Création utilisateur
     * @param {*} body Données utilisateur
     * @returns Message retour
     */
    createUser = (body) => {
        const url = `${this.apiUrl}/create`;
        return ajax.post(url, body, this.headers);
    };

    /**
     * Réinitialisation mot de passe
     * @param {*} id Identifiant utilisateur
     * @returns Message retour
     */
    resetPassword = (id) => {
        const url = `${this.apiUrl}/reset/${id}`;
        return ajax.patch(url, null, this.headers);
    };

    /**
     * Mise à jour mot de passe
     * @param {*} body Données mot de passe
     * @returns Message retour
     */
    updatePassword = (body) => {
        const url = `${this.apiUrl}/password`;
        return ajax.patch(url, body, this.headers);
    };

    /**
     * Mise à jour utilisateur
     * @param {*} body Données utilisateur
     * @returns Liste des utilisateurs
     */
    updateUser = (body) => {
        const url = `${this.apiUrl}/update`;
        return ajax.patch(url, body, this.headers);
    };

    /**
     * Suppression utilisateur
     * @param {*} id Identifiant utilisateur
     * @returns Liste des utilisateurs
     */
    deleteUser = (id) => {
        const url = `${this.apiUrl}/delete/${id}`;
        return ajax.delete(url, this.headers);
    };
}

export default UsersService;
