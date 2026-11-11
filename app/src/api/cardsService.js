import { ajax } from 'rxjs/ajax';

const API_URL = import.meta.env.VITE_API_URL + '/cards';

/**
 * Service appel API cartes (avec QR codes)
 */
class CardsService {
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
     * Récupération de toutes les cartes
     * @returns Liste des cartes
     */
    getAllCards = () => {
        const url = `${this.apiUrl}/all`;
        return ajax({
            url,
            method: 'GET',
            headers: this.headers,
            withCredentials: true
        });
    };

    /**
     * Récupération de l'état d'un code de carte
     * @param {*} editionId Identifiant édition
     * @param {*} code Code de la carte
     * @returns Etat du code et participant lié
     */
    getCardStatus = (editionId, code) => {
        const url = `${this.apiUrl}/edition/${editionId}/code/${encodeURIComponent(code)}`;
        return ajax({
            url,
            method: 'GET',
            headers: this.headers,
            withCredentials: true
        });
    };

    /**
     * Suppression d'une carte
     * @param {*} cardId Identifiant carte
     * @returns Données retour
     */
    deleteCard = (cardId) => {
        const url = `${this.apiUrl}/delete/${cardId}`;
        return ajax({
            url,
            method: 'DELETE',
            headers: this.headers,
            withCredentials: true
        });
    };
}

export default CardsService;
