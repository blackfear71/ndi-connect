import { useEffect, useState } from 'react';

import { Image, Spinner, Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaComputer } from 'react-icons/fa6';
import { useNavigate, useParams } from 'react-router-dom';

import { forkJoin, of, switchMap } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { EditionsService, GiftsService, PlayersService, RewardsService } from '../../api';

import { EditionAbout, EditionGifts, EditionPlayers } from '../../components/features';
import { ConfirmModal, EditionModal, GiftModal, PlayerModal, RewardModal } from '../../components/modals';
import { Message } from '../../components/shared';

import { useAuth } from '../../utils/context/AuthContext';
import { useSse } from '../../utils/context/SseContext';
import { getDayFromDate, getLocalizedTime } from '../../utils/helpers/dateHelper';

import { EnumAction, EnumUserRole } from '../../enums';

import './Edition.css';

/**
 * Page détail édition
 */
const Edition = () => {
    // Router
    const { id } = useParams();
    const navigate = useNavigate();

    // Contexte
    const { auth, authMessage, setAuthMessage } = useAuth();
    const { events } = useSse();

    // Traductions
    const { t } = useTranslation();

    // Local states
    const [formEdition, setFormEdition] = useState({
        location: '',
        startDate: '',
        startTime: '',
        endTime: '',
        picture: null,
        pictureAction: null,
        theme: '',
        challenge: ''
    });
    const [formGift, setFormGift] = useState({
        id: null,
        name: '',
        value: '',
        quantity: ''
    });
    const [formPlayer, setFormPlayer] = useState({
        id: null,
        name: '',
        delta: 0,
        giveaway: 0,
        giveawayId: 0
    });
    const [formReward, setFormReward] = useState({
        idReward: null,
        idPlayer: null,
        idGift: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [modalOptionsConfirm, setModalOptionsConfirm] = useState({
        content: '',
        action: '',
        data: null,
        isOpen: false,
        message: null
    });
    const [modalOptionsEdition, setModalOptionsEdition] = useState({
        action: '',
        isOpen: false,
        message: null
    });
    const [modalOptionsGift, setModalOptionsGift] = useState({
        action: '',
        isOpen: false,
        message: null
    });
    const [modalOptionsPlayer, setModalOptionsPlayer] = useState({
        action: '',
        isOpen: false,
        message: null
    });
    const [modalOptionsReward, setModalOptionsReward] = useState({
        isOpen: false,
        message: null
    });

    // API states
    const [edition, setEdition] = useState();
    const [gifts, setGifts] = useState([]);
    const [players, setPlayers] = useState([]);

    /**
     * Lancement initial de la page (à chaque changement d'id)
     */
    useEffect(() => {
        const editionsService = new EditionsService();

        const subscriptionEdition = editionsService.getEdition(id);

        subscriptionEdition
            .pipe(
                map((dataEdition) => {
                    setEdition(dataEdition.response.data.edition);
                    setGifts(processGiftsData(dataEdition.response.data.gifts));
                    setPlayers(processPlayersData(dataEdition.response.data.players));

                    setFormEdition({
                        location: dataEdition.response.data.edition.location,
                        startDate: getDayFromDate(dataEdition.response.data.edition.startDate),
                        startTime: getLocalizedTime(dataEdition.response.data.edition.startDate),
                        endTime: getLocalizedTime(dataEdition.response.data.edition.endDate),
                        picture: dataEdition.response.data.edition.picture,
                        pictureAction: null,
                        theme: dataEdition.response.data.edition.theme,
                        challenge: dataEdition.response.data.edition.challenge
                    });
                }),
                take(1),
                catchError((err) => {
                    setMessage({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsLoading(false);
                })
            )
            .subscribe();
    }, [id]);

    /**
     * Mise à jour depuis le SSE seulement si les données sont différentes
     */
    useEffect(() => {
        // Mise à jour des cadeaux depuis le SSE
        if (events?.gifts) {
            setGifts((prev) => {
                const next = processGiftsData(events.gifts);
                return JSON.stringify(prev) !== JSON.stringify(next) ? next : prev;
            });
        }

        // Mise à jour des participants depuis le SSE
        if (events?.players) {
            setPlayers((prev) => {
                const next = processPlayersData(events.players);
                return JSON.stringify(prev) !== JSON.stringify(next) ? next : prev;
            });
        }
    }, [events]);

    /**
     * Si un message d'authentification est défini on l'affiche
     */
    useEffect(() => {
        // Message venant du AuthContext (connexion / déconnexion)
        if (authMessage && authMessage.target === 'page') {
            setMessage(authMessage);
            setAuthMessage(null);
        }
    }, [authMessage, setAuthMessage]);

    /**
     * Enrichit les données participants avec la couleur
     * @param {*} usersData Données participants
     * @returns Données participants enrichies
     */
    const processPlayersData = (playersData) => {
        return playersData.map((player) => ({
            ...player,
            color: getIconColor(player.name)
        }));
    };

    /**
     * Enrichit les données cadeaux avec la couleur
     * @param {*} usersData Données cadeaux
     * @returns Données cadeaux enrichies
     */
    const processGiftsData = (giftsData) => {
        return giftsData.map((gift) => ({
            ...gift,
            color: getIconColor(gift.name)
        }));
    };

    /**
     * Détermine une couleur d'icône en fonction du texte fourni
     * @param {*} text Texte
     * @returns Couleur
     */
    const getIconColor = (text) => {
        const colors = [
            '#2563eb',
            '#7c3aed',
            '#059669',
            '#dc2626',
            '#d97706',
            '#0891b2',
            '#9333ea',
            '#16a34a',
            '#e11d48',
            '#0369a1',
            '#b45309',
            '#1d4ed8'
        ];

        return colors[text.charCodeAt(0) % colors.length];
    };

    /**
     * Ouverture/fermeture de la modale de modification d'édition
     */
    const openCloseEditionModal = (openAction, data) => {
        // Ouverture ou fermeture
        setModalOptionsEdition((prev) => ({
            ...prev,
            action: openAction,
            isOpen: !prev.isOpen,
            message: null
        }));

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsEdition.isOpen && resetFormEdition(data ?? edition);
    };

    /**
     * Modification de l'édition
     */
    const handleSubmitEdition = () => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsEdition((prev) => ({ ...prev, message: null }));

        // Formatage des données
        const body = formatDataEdition();

        const editionsService = new EditionsService();

        const subscriptionEdition = editionsService.updateEdition(edition.id, body);

        subscriptionEdition
            .pipe(
                map((dataEdition) => {
                    // Fermeture modale
                    openCloseEditionModal('', dataEdition.response.data.edition);
                    setEdition(dataEdition.response.data.edition);
                    setMessage({ code: dataEdition.response.message, type: dataEdition.response.status });
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsEdition((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Formate les données édition
     * @returns Données formatées
     */
    const formatDataEdition = () => {
        const formData = new FormData();

        // Champs textes
        Object.entries(formEdition).forEach(([key, value]) => {
            if (key !== 'picture' && value !== null) {
                formData.append(key, value);
            }
        });

        // Images (s'il y a une image à traiter)
        formEdition.pictureAction === EnumAction.CREATE && formEdition.picture && formData.append('picture', formEdition.picture);

        return formData;
    };

    /**
     * Réinitialisation formulaire (modification édition)
     */
    const resetFormEdition = (data) => {
        setFormEdition({
            location: data.location,
            startDate: getDayFromDate(data.startDate),
            startTime: getLocalizedTime(data.startDate),
            endTime: getLocalizedTime(data.endDate),
            picture: data.picture,
            pictureAction: null,
            theme: data.theme,
            challenge: data.challenge
        });
    };

    /**
     * Ouverture/fermeture de la modale de modification de participant
     */
    const openClosePlayerModal = (openAction) => {
        // Ouverture ou fermeture
        setModalOptionsPlayer((prev) => ({
            ...prev,
            action: openAction,
            isOpen: !prev.isOpen,
            message: null
        }));

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsPlayer.isOpen && resetFormPlayer();
    };

    /**
     * Création ou modification d'un participant
     */
    const handleSubmitPlayer = (action) => {
        setMessage(null);

        const playersService = new PlayersService();

        let subscriptionPlayers = null;

        switch (action) {
            case EnumAction.CREATE:
                setIsSubmitting(true);
                setModalOptionsPlayer((prev) => ({ ...prev, message: null }));

                subscriptionPlayers = playersService.createPlayer(edition.id, {
                    id_edition: edition.id,
                    name: formPlayer.name,
                    delta: formPlayer.delta
                });
                break;
            case EnumAction.UPDATE:
                setIsSubmitting(true);
                setModalOptionsPlayer((prev) => ({ ...prev, message: null }));

                subscriptionPlayers = playersService.updatePlayer(edition.id, formPlayer.id, {
                    name: formPlayer.name,
                    delta: formPlayer.delta,
                    giveaway: formPlayer.giveaway,
                    giveawayId: formPlayer.giveawayId
                });
                break;
        }

        subscriptionPlayers
            ?.pipe(
                map((dataPlayer) => {
                    setMessage({ code: dataPlayer.response.message, type: dataPlayer.response.status });
                }),
                switchMap(() => playersService.getEditionPlayers(edition.id)),
                map((dataPlayers) => {
                    openClosePlayerModal('');
                    setPlayers(processPlayersData(dataPlayers.response.data));
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsPlayer((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Réinitialisation formulaire (modification participant)
     */
    const resetFormPlayer = () => {
        setFormPlayer({
            id: null,
            name: '',
            delta: 0,
            giveaway: 0,
            giveawayId: 0
        });
    };

    /**
     * Ouverture/fermeture de la modale de modification de cadeau
     */
    const openCloseGiftModal = (openAction) => {
        // Ouverture ou fermeture
        setModalOptionsGift((prev) => ({
            ...prev,
            action: openAction,
            isOpen: !prev.isOpen,
            message: null
        }));

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsGift.isOpen && resetFormGift();
    };

    /**
     * Création ou modification d'un cadeau
     */
    const handleSubmitGift = (action) => {
        setMessage(null);

        const giftsService = new GiftsService();

        let subscriptionGifts = null;

        switch (action) {
            case EnumAction.CREATE:
                setIsSubmitting(true);
                setModalOptionsGift((prev) => ({ ...prev, message: null }));

                subscriptionGifts = giftsService.createGift(edition.id, {
                    id_edition: edition.id,
                    name: formGift.name,
                    value: formGift.value,
                    quantity: formGift.quantity
                });
                break;
            case EnumAction.UPDATE:
                setIsSubmitting(true);
                setModalOptionsGift((prev) => ({ ...prev, message: null }));

                subscriptionGifts = giftsService.updateGift(edition.id, formGift.id, {
                    name: formGift.name,
                    value: formGift.value,
                    quantity: formGift.quantity
                });
                break;
        }

        subscriptionGifts
            ?.pipe(
                map((dataGift) => {
                    setMessage({ code: dataGift.response.message, type: dataGift.response.status });
                }),
                switchMap(() => giftsService.getEditionGifts(edition.id)),
                map((dataGifts) => {
                    openCloseGiftModal('');
                    setGifts(processGiftsData(dataGifts.response.data));
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsGift((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Réinitialisation formulaire (création/modification cadeau)
     */
    const resetFormGift = () => {
        setFormGift({
            id: null,
            name: '',
            value: '',
            quantity: ''
        });
    };

    /**
     * Ouverture/fermeture de la modale d'attribution de cadeau
     */
    const openCloseRewardModal = () => {
        // Ouverture ou fermeture
        setModalOptionsReward((prev) => ({
            ...prev,
            isOpen: !prev.isOpen,
            message: null
        }));

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsReward.isOpen && resetFormReward();
    };

    /**
     * Attribution d'un cadeau à un participant
     */
    const handleSubmitReward = () => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsReward((prev) => ({ ...prev, message: null }));

        const rewardsService = new RewardsService();
        const giftsService = new GiftsService();
        const playersService = new PlayersService();

        const subscriptionRewards = rewardsService.createReward(edition.id, formReward);
        const subscriptionGifts = giftsService.getEditionGifts(edition.id);
        const subscriptionPlayers = playersService.getEditionPlayers(edition.id);

        subscriptionRewards
            .pipe(
                map((dataReward) => {
                    setMessage({ code: dataReward.response.message, type: dataReward.response.status });
                }),
                switchMap(() => forkJoin([subscriptionGifts, subscriptionPlayers])),
                map(([dataGifts, dataPlayers]) => {
                    openCloseRewardModal();
                    setGifts(processGiftsData(dataGifts.response.data));
                    setPlayers(processPlayersData(dataPlayers.response.data));
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsReward((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Réinitialisation formulaire (attribution cadeau)
     */
    const resetFormReward = () => {
        setFormReward({
            idReward: null,
            idPlayer: null,
            idGift: 0
        });
    };

    /**
     * Ouverture/fermeture de la modale de confirmation
     */
    const openCloseConfirmModal = (confirmOptions) => {
        // Ouverture ou fermeture
        if (confirmOptions) {
            setModalOptionsConfirm({
                content: confirmOptions.content,
                action: confirmOptions.action,
                data: confirmOptions.data,
                isOpen: !modalOptionsConfirm.isOpen,
                message: null
            });
        } else {
            setModalOptionsConfirm({
                content: '',
                action: '',
                data: null,
                isOpen: false,
                message: null
            });
        }
    };

    /**
     * Ouvre la modale de suppression d'édition
     */
    const handleConfirmDeleteEdition = () => {
        // Ouverture de la modale de confirmation
        openCloseConfirmModal({
            content: t('edition.deleteEdition', {
                year: new Date(edition.startDate).getFullYear(),
                location: edition.location
            }),
            action: 'deleteEdition',
            data: null
        });
    };

    /**
     * Méthode centralisée d'action à la confirmation
     */
    const handleConfirmAction = () => {
        switch (modalOptionsConfirm.action) {
            case 'deleteEdition':
                return handleDeleteEdition();
            case 'deleteGift':
                return handleDeleteGift(modalOptionsConfirm.data);
            case 'deletePlayer':
                return handleDeletePlayer(modalOptionsConfirm.data);
            case 'deleteReward':
                return handleDeleteReward(modalOptionsConfirm.data);
            default:
                return;
        }
    };

    /**
     * Suppression de l'édition
     */
    const handleDeleteEdition = () => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const editionsService = new EditionsService();

        const subscriptionEdition = editionsService.deleteEdition(edition.id);

        subscriptionEdition
            .pipe(
                map((dataEdition) => {
                    // Fermeture modale de confirmation
                    openCloseConfirmModal();

                    // Redirection avec message
                    navigate('/', {
                        state: {
                            navMessage: { code: dataEdition.response.message, type: dataEdition.response.status }
                        }
                    });
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsConfirm((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Suppression d'un cadeau
     */
    const handleDeleteGift = (idGift) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const giftsService = new GiftsService();

        const subscriptionGifts = giftsService.deleteGift(edition.id, idGift);

        subscriptionGifts
            .pipe(
                map((dataGift) => {
                    setMessage({ code: dataGift.response.message, type: dataGift.response.status });
                }),
                switchMap(() => giftsService.getEditionGifts(edition.id)),
                map((dataGifts) => {
                    openCloseConfirmModal();
                    setGifts(processGiftsData(dataGifts.response.data));
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsConfirm((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Suppression d'un participant
     */
    const handleDeletePlayer = (idPlayer) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const playersService = new PlayersService();

        const subscriptionPlayers = playersService.deletePlayer(edition.id, idPlayer);

        subscriptionPlayers
            .pipe(
                map((dataPlayer) => {
                    setMessage({ code: dataPlayer.response.message, type: dataPlayer.response.status });
                }),
                switchMap(() => playersService.getEditionPlayers(edition.id)),
                map((dataPlayers) => {
                    openCloseConfirmModal();
                    setPlayers(processPlayersData(dataPlayers.response.data));
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsConfirm((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Suppression d'un cadeau d'un participant
     */
    const handleDeleteReward = (idReward) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const rewardsService = new RewardsService();
        const giftsService = new GiftsService();
        const playersService = new PlayersService();

        const subscriptionRewards = rewardsService.deleteReward(edition.id, idReward);
        const subscriptionGifts = giftsService.getEditionGifts(edition.id);
        const subscriptionPlayers = playersService.getEditionPlayers(edition.id);

        subscriptionRewards
            .pipe(
                map((dataReward) => {
                    setMessage({ code: dataReward.response.message, type: dataReward.response.status });
                }),
                switchMap(() => forkJoin([subscriptionGifts, subscriptionPlayers])),
                map(([dataGifts, dataPlayers]) => {
                    openCloseConfirmModal();
                    setGifts(processGiftsData(dataGifts.response.data));
                    setPlayers(processPlayersData(dataPlayers.response.data));
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsConfirm((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    return (
        <div>
            {isLoading ? (
                <div className="d-flex align-items-center justify-content-center layout-spinner-centered">
                    <Spinner animation="border" role="status" variant="light" />
                </div>
            ) : (
                <>
                    {/* Thème */}
                    {edition?.picture && (
                        <div className="edition-picture-wrapper">
                            <Image
                                src={`${import.meta.env.VITE_API_URL}/serve-file?destination=images&file=${edition.picture}`}
                                alt={edition.picture}
                                className="edition-picture"
                            />
                        </div>
                    )}

                    {/* Contenu */}
                    <div className="position-relative z-2">
                        {/* Message */}
                        {message && <Message code={message.code} params={message.params} type={message.type} setMessage={setMessage} />}

                        {/* Edition */}
                        {edition && (
                            <>
                                {/* Titre */}
                                <h1 className="d-flex align-items-center gap-2">
                                    <FaComputer size={30} />
                                    {t('edition.editionTitle', {
                                        year: new Date(edition.startDate).getFullYear(),
                                        location: edition.location
                                    })}
                                </h1>

                                {/* Onglets */}
                                <Tabs
                                    variant="underline"
                                    defaultActiveKey="players"
                                    id="justify-tab-example"
                                    className="mb-3 page-tabs"
                                    justify
                                >
                                    {/* Participants */}
                                    <Tab eventKey="players" title={t('edition.players')}>
                                        <EditionPlayers
                                            players={players}
                                            setFormPlayer={setFormPlayer}
                                            setModalOptionsPlayer={setModalOptionsPlayer}
                                            setFormReward={setFormReward}
                                            setModalOptionsReward={setModalOptionsReward}
                                            onConfirm={openCloseConfirmModal}
                                            isSubmitting={isSubmitting}
                                        />
                                    </Tab>

                                    {/* Cadeaux */}
                                    <Tab eventKey="gifts" title={t('edition.gifts')}>
                                        <EditionGifts
                                            gifts={gifts}
                                            setFormData={setFormGift}
                                            setModalOptions={setModalOptionsGift}
                                            onConfirm={openCloseConfirmModal}
                                            isSubmitting={isSubmitting}
                                        />
                                    </Tab>

                                    {/* A propos */}
                                    <Tab eventKey="about" title={t('edition.about')}>
                                        <EditionAbout
                                            edition={edition}
                                            onEdit={openCloseEditionModal}
                                            onConfirm={handleConfirmDeleteEdition}
                                            isSubmitting={isSubmitting}
                                        />
                                    </Tab>
                                </Tabs>

                                {/* Modale de modification/suppression d'édition */}
                                {auth.isLoggedIn && auth.level >= EnumUserRole.SUPERADMIN && modalOptionsEdition.isOpen && (
                                    <EditionModal
                                        formData={formEdition}
                                        setFormData={setFormEdition}
                                        modalOptions={modalOptionsEdition}
                                        setModalOptions={setModalOptionsEdition}
                                        onClose={openCloseEditionModal}
                                        onSubmit={handleSubmitEdition}
                                        isSubmitting={isSubmitting}
                                    />
                                )}

                                {/* Modale de création/modification de cadeau */}
                                {auth.isLoggedIn && auth.level >= EnumUserRole.ADMIN && modalOptionsGift.isOpen && (
                                    <GiftModal
                                        gift={gifts.find((g) => g.id === formGift.id)}
                                        formData={formGift}
                                        setFormData={setFormGift}
                                        modalOptions={modalOptionsGift}
                                        setModalOptions={setModalOptionsGift}
                                        onClose={openCloseGiftModal}
                                        onSubmit={handleSubmitGift}
                                        isSubmitting={isSubmitting}
                                    />
                                )}

                                {/* Modale de modification de participant */}
                                {auth.isLoggedIn && auth.level >= EnumUserRole.ADMIN && modalOptionsPlayer.isOpen && (
                                    <PlayerModal
                                        players={players}
                                        player={players.find((p) => p.id === formPlayer.id)}
                                        formData={formPlayer}
                                        setFormData={setFormPlayer}
                                        modalOptions={modalOptionsPlayer}
                                        setModalOptions={setModalOptionsPlayer}
                                        onClose={openClosePlayerModal}
                                        onSubmit={handleSubmitPlayer}
                                        isSubmitting={isSubmitting}
                                    />
                                )}

                                {/* Modale d'attribution de cadeau à un participant */}
                                {modalOptionsReward.isOpen && (
                                    <RewardModal
                                        player={players.find((p) => p.id === formReward.idPlayer)}
                                        gifts={gifts}
                                        formData={formReward}
                                        setFormData={setFormReward}
                                        modalOptions={modalOptionsReward}
                                        setModalOptions={setModalOptionsReward}
                                        onClose={openCloseRewardModal}
                                        onSubmit={handleSubmitReward}
                                        onConfirm={openCloseConfirmModal}
                                        isSubmitting={isSubmitting}
                                    />
                                )}

                                {/* Modale de confirmation */}
                                {auth.isLoggedIn && auth.level >= EnumUserRole.SUPERADMIN && modalOptionsConfirm.isOpen && (
                                    <ConfirmModal
                                        modalOptions={modalOptionsConfirm}
                                        setModalOptions={setModalOptionsConfirm}
                                        onClose={openCloseConfirmModal}
                                        onConfirmAction={handleConfirmAction}
                                        isSubmitting={isSubmitting}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Edition;
