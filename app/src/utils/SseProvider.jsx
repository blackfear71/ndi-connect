import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import SseService from '../api/sseService';

import { SseContext } from './SseContext';

/**
 * Provider pour les Server-Sent Events (SSE)
 */
const SseProvider = ({ children }) => {
    // Router
    const { id } = useParams();

    // Local states
    const [events, setEvents] = useState({
        gifts: null,
        players: null
    });

    /**
     * Connexion SSE et récupération des données en temps réel
     */
    useEffect(() => {
        // Ouverture de la connexion SSE si une édition est renseignée
        if (!id) {
            return;
        }

        const source = createSseConnection();
        return () => source && source.close();
    }, [id]);

    /**
     * Création connexion SSE et récupération des données (édition)
     */
    const createSseConnection = () => {
        const sseService = new SseService();

        const source = sseService.getSseEdition(id);

        // Réception des données
        source.onmessage = (event) => {
            // On ignore les messages vides
            const trimmed = event.data.trim();

            if (!trimmed) {
                return;
            }

            const message = JSON.parse(trimmed);

            // Dispatch selon le type
            switch (message.type) {
                case 'get_gifts':
                    setEvents((prev) => ({ ...prev, gifts: message.payload }));
                    break;
                case 'get_players':
                    setEvents((prev) => ({ ...prev, players: message.payload }));
                    break;
                default:
                    break;
            }
        };

        // Forçage reconnexion en cas d'erreur
        source.onerror = () => {
            source.close();
            setTimeout(createSseConnection, 5000);
        };

        // Evènement d'initialisation de la connexion SSE
        source.addEventListener('is_initialized', () => {});

        // Evènement de maintien de la connexion SSE
        source.addEventListener('is_alive', () => {});

        // Evènement de récupération des cadeaux
        source.addEventListener('get_gifts', (event) => {
            const payload = JSON.parse(event.data);
            setEvents((prev) => ({ ...prev, gifts: payload }));
        });

        // Evènement de récupération des participants
        source.addEventListener('get_players', (event) => {
            const payload = JSON.parse(event.data);
            setEvents((prev) => ({ ...prev, players: payload }));
        });

        return source;
    };

    return <SseContext.Provider value={{ events }}>{children}</SseContext.Provider>;
};

export default SseProvider;
