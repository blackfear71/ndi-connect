import { ajax } from 'rxjs/ajax';

const API_URL = process.env.REACT_APP_API_URL + '/gifts';

/**
 * Service appel API cadeaux
 */
class GiftsService {
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
     * Création d'un nouveau cadeau
     * @param {*} idEdition Identifiant édition
     * @param {*} body Données cadeau
     * @returns
     */
    createGift = (idEdition, body) => {
        const url = `${this.apiUrl}/create/${idEdition}`;
        return ajax.post(url, body, this.headers);
    };

    /**
     * Mise à jour cadeau
     * @param {*} idEdition Identifiant édition
     * @param {*} idGift Identifiant cadeau
     * @param {*} body Données cadeau
     * @returns
     */
    updateGift = (idEdition, idGift, body) => {
        const url = `${this.apiUrl}/update/${idEdition}/${idGift}`;
        return ajax.patch(url, body, this.headers);
    };

    /**
     * Suppression d'un participant
     * @param {*} idEdition Identifiant édition
     * @param {*} idGift Identifiant participant
     * @returns
     */
    deleteGift = (idEdition, idGift) => {
        const url = `${this.apiUrl}/delete/${idEdition}/${idGift}`;
        return ajax.delete(url, this.headers);
    };
}

export default GiftsService;
