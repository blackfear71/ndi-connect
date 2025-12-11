import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import EditionsService from '../api/editionsService';

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
        const editionsService = new EditionsService();

        const source = editionsService.getEditionStream(id);

        // Réception des données
        source.onmessage = (event) => {
            const message = JSON.parse(event.data);

            // Dispatch selon le type
            switch (message.type) {
                case 'gifts_updated':
                    setEvents((prev) => ({ ...prev, gifts: message.payload }));
                    break;
                case 'players_updated':
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

        // Evènement de maintien de la connexion SSE
        source.addEventListener('heartbeat', () => {});

        // Evènement de mise à jour des cadeaux
        source.addEventListener('gifts_updated', (event) => {
            const payload = JSON.parse(event.data);
            setEvents((prev) => ({ ...prev, gifts: payload }));
        });

        // Evènement de mise à jour des participants
        source.addEventListener('players_updated', (event) => {
            const payload = JSON.parse(event.data);
            setEvents((prev) => ({ ...prev, players: payload }));
        });

        return source;
    };

    return <SseContext.Provider value={{ events }}>{children}</SseContext.Provider>;
};

export default SseProvider;
