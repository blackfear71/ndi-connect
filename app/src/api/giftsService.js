import { ajax } from 'rxjs/ajax';

const API_URL = import.meta.env.VITE_API_URL + '/gifts';

/**
 * Service appel API cadeaux
 */
class GiftsService {
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
     * Récupération de tous les cadeaux d'une édition
     * @returns Liste des cadeaux
     */
    getEditionGifts = (idEdition) => {
        const url = `${this.apiUrl}/edition/${idEdition}`;
        return ajax.get(url, this.headers);
    };

    /**
     * Création d'un nouveau cadeau
     * @param {*} idEdition Identifiant édition
     * @param {*} body Données cadeau
     * @returns Données retour
     */
    createGift = (idEdition, body) => {
        const url = `${this.apiUrl}/create/edition/${idEdition}`;
        return ajax({
            url,
            method: 'POST',
            headers: this.headers,
            body,
            withCredentials: true
        });
    };

    /**
     * Mise à jour cadeau
     * @param {*} giftId Identifiant cadeau
     * @param {*} body Données cadeau
     * @returns Données retour
     */
    updateGift = (giftId, body) => {
        const url = `${this.apiUrl}/update/${giftId}`;
        return ajax({
            url,
            method: 'PATCH',
            headers: this.headers,
            body,
            withCredentials: true
        });
    };

    /**
     * Suppression d'un cadeau
     * @param {*} giftId Identifiant cadeau
     * @returns Données retour
     */
    deleteGift = (giftId) => {
        const url = `${this.apiUrl}/delete/${giftId}`;
        return ajax({
            url,
            method: 'DELETE',
            headers: this.headers,
            withCredentials: true
        });
    };
}

export default GiftsService;
