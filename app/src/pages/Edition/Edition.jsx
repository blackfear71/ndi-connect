import { useContext, useEffect, useState } from 'react';

import { Spinner, Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaComputer } from 'react-icons/fa6';
import { useNavigate, useParams } from 'react-router-dom';

import EditionsService from '../../api/editionsService';
import GiftsService from '../../api/giftsService';
import PlayersService from '../../api/playersService';
import RewardsService from '../../api/rewardsService';

import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import EditionAbout from '../../components/EditionAbout/EditionAbout';
import EditionGifts from '../../components/EditionGifts/EditionGifts';
import EditionModal from '../../components/EditionModal/EditionModal';
import EditionPlayers from '../../components/EditionPlayers/EditionPlayers';
import GiftModal from '../../components/GiftModal/GiftModal';
import Message from '../../components/Message/Message';
import PlayerModal from '../../components/PlayerModal/PlayerModal';
import RewardModal from '../../components/RewardModal/RewardModal';

import UserRole from '../../enums/UserRole';

import { combineLatest, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { AuthContext } from '../../utils/AuthContext';
import { getDayFromDate, getLocalizedTime } from '../../utils/dateHelper';

import './Edition.css';

/**
 * Page détail édition
 */
const Edition = () => {
    // Router
    const { id } = useParams();
    const navigate = useNavigate();

    // Contexte
    const { auth, authMessage, setAuthMessage } = useContext(AuthContext);

    // Traductions
    const { t } = useTranslation();

    // Local states
    const [formEdition, setFormEdition] = useState({
        location: '',
        startDate: '',
        startTime: '',
        endTime: '',
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
        message: null,
        isSubmitting: false
    });
    const [modalOptionsEdition, setModalOptionsEdition] = useState({
        action: '',
        isOpen: false,
        message: null,
        isSubmitting: false
    });
    const [modalOptionsGift, setModalOptionsGift] = useState({
        action: '',
        isOpen: false,
        message: null,
        isSubmitting: false
    });
    const [modalOptionsPlayer, setModalOptionsPlayer] = useState({
        action: '',
        isOpen: false,
        message: null,
        isSubmitting: false
    });
    const [modalOptionsReward, setModalOptionsReward] = useState({ isOpen: false, message: null, isSubmitting: false });

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

        combineLatest([subscriptionEdition])
            .pipe(
                map(([dataEdition]) => {
                    setEdition(dataEdition.response.data.edition);
                    setGifts(dataEdition.response.data.gifts);
                    setPlayers(dataEdition.response.data.players);

                    setFormEdition({
                        ...formEdition,
                        location: dataEdition.response.data.edition.location,
                        startDate: getDayFromDate(dataEdition.response.data.edition.startDate),
                        startTime: getLocalizedTime(dataEdition.response.data.edition.startDate),
                        endTime: getLocalizedTime(dataEdition.response.data.edition.endDate),
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
     * Ouverture/fermeture de la modale de modification d'édition
     */
    const openCloseEditionModal = (openAction) => {
        // Ouverture ou fermeture
        setModalOptionsEdition((prev) => ({
            ...prev,
            action: openAction,
            isOpen: !prev.isOpen,
            message: null,
            isSubmitting: false
        }));

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsEdition.isOpen && resetFormEdition(edition);
    };

    /**
     * Modification de l'édition
     */
    const handleSubmitEdition = () => {
        setMessage(null);
        setModalOptionsEdition((prev) => ({ ...prev, message: null, isSubmitting: true }));

        const editionsService = new EditionsService();

        const subscriptionEdition = editionsService.updateEdition(edition.id, formEdition);

        combineLatest([subscriptionEdition])
            .pipe(
                map(([dataEdition]) => {
                    // Fermeture modale
                    openCloseEditionModal('');
                    resetFormEdition(dataEdition.response.data.edition);
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
                    setModalOptionsEdition((prev) => ({ ...prev, isSubmitting: false }));
                })
            )
            .subscribe();
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
            message: null,
            isSubmitting: false
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
            case 'create':
                setIsSubmitting(true);

                subscriptionPlayers = playersService.createPlayer(edition.id, {
                    id_edition: edition.id,
                    name: formPlayer.name,
                    delta: formPlayer.delta
                });
                break;
            case 'update':
                setModalOptionsPlayer((prev) => ({ ...prev, message: null, isSubmitting: true }));

                subscriptionPlayers = playersService.updatePlayer(edition.id, formPlayer.id, {
                    name: formPlayer.name,
                    delta: formPlayer.delta,
                    giveaway: formPlayer.giveaway,
                    giveawayId: formPlayer.giveawayId
                });
                break;
        }

        if (subscriptionPlayers) {
            combineLatest([subscriptionPlayers])
                .pipe(
                    map(([dataPlayers]) => {
                        action === 'update' ? openClosePlayerModal('') : resetFormPlayer();
                        setPlayers(dataPlayers.response.data);
                        setMessage({ code: dataPlayers.response.message, type: dataPlayers.response.status });
                    }),
                    take(1),
                    catchError((err) => {
                        action === 'update'
                            ? setModalOptionsPlayer((prev) => ({
                                  ...prev,
                                  message: { code: err?.response?.message, type: err?.response?.status }
                              }))
                            : setMessage({ code: err?.response?.message, type: err?.response?.status });
                        return of();
                    }),
                    finalize(() => {
                        action === 'update' ? setModalOptionsPlayer((prev) => ({ ...prev, isSubmitting: false })) : setIsSubmitting(false);
                    })
                )
                .subscribe();
        }
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
            message: null,
            isSubmitting: false
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
            case 'create':
                setIsSubmitting(true);

                subscriptionGifts = giftsService.createGift(edition.id, {
                    id_edition: edition.id,
                    name: formGift.name,
                    value: formGift.value,
                    quantity: formGift.quantity
                });
                break;
            case 'update':
                setModalOptionsGift((prev) => ({ ...prev, message: null, isSubmitting: true }));

                subscriptionGifts = giftsService.updateGift(edition.id, formGift.id, {
                    name: formGift.name,
                    value: formGift.value,
                    quantity: formGift.quantity
                });
                break;
        }

        if (subscriptionGifts) {
            combineLatest([subscriptionGifts])
                .pipe(
                    map(([dataGifts]) => {
                        openCloseGiftModal('');
                        resetFormGift();
                        setGifts(dataGifts.response.data);
                        setMessage({ code: dataGifts.response.message, type: dataGifts.response.status });
                    }),
                    take(1),
                    catchError((err) => {
                        action === 'update'
                            ? setModalOptionsGift((prev) => ({
                                  ...prev,
                                  message: { code: err?.response?.message, type: err?.response?.status }
                              }))
                            : setMessage({ code: err?.response?.message, type: err?.response?.status });
                        return of();
                    }),
                    finalize(() => {
                        action === 'update' ? setModalOptionsGift((prev) => ({ ...prev, isSubmitting: false })) : setIsSubmitting(false);
                    })
                )
                .subscribe();
        }
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
            message: null,
            isSubmitting: false
        }));

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsReward.isOpen && resetFormReward();
    };

    /**
     * Attribution d'un cadeau à un participant
     */
    const handleSubmitReward = () => {
        setMessage(null);
        setModalOptionsReward((prev) => ({ ...prev, message: null, isSubmitting: true }));

        const rewardsService = new RewardsService();

        const subscriptionRewards = rewardsService.postReward(edition.id, formReward);

        combineLatest([subscriptionRewards])
            .pipe(
                map(([dataRewards]) => {
                    openCloseRewardModal();
                    setGifts(dataRewards.response.data.gifts);
                    setPlayers(dataRewards.response.data.players);
                    setMessage({ code: dataRewards.response.message, type: dataRewards.response.status });
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
                    setModalOptionsReward((prev) => ({ ...prev, isSubmitting: false }));
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
                message: null,
                isSubmitting: false
            });
        } else {
            setModalOptionsConfirm({
                content: '',
                action: '',
                data: null,
                isOpen: false,
                message: null,
                isSubmitting: false
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
        setModalOptionsConfirm((prev) => ({ ...prev, message: null, isSubmitting: true }));

        const editionsService = new EditionsService();

        const subscriptionEdition = editionsService.deleteEdition(edition.id);

        combineLatest([subscriptionEdition])
            .pipe(
                map(([dataEdition]) => {
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
                    setModalOptionsConfirm((prev) => ({ ...prev, isSubmitting: false }));
                })
            )
            .subscribe();
    };

    /**
     * Suppression d'un cadeau
     */
    const handleDeleteGift = (idGift) => {
        setMessage(null);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null, isSubmitting: true }));

        const giftsService = new GiftsService();

        const subscriptionGifts = giftsService.deleteGift(edition.id, idGift);

        combineLatest([subscriptionGifts])
            .pipe(
                map(([dataGifts]) => {
                    openCloseConfirmModal();
                    setGifts(dataGifts.response.data);
                    setMessage({ code: dataGifts.response.message, type: dataGifts.response.status });
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
                    setModalOptionsConfirm((prev) => ({ ...prev, isSubmitting: false }));
                })
            )
            .subscribe();
    };

    /**
     * Suppression d'un participant
     */
    const handleDeletePlayer = (idPlayer) => {
        setMessage(null);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null, isSubmitting: true }));

        const playersService = new PlayersService();

        const subscriptionPlayers = playersService.deletePlayer(edition.id, idPlayer);

        combineLatest([subscriptionPlayers])
            .pipe(
                map(([dataPlayers]) => {
                    openCloseConfirmModal();
                    setPlayers(dataPlayers.response.data);
                    setMessage({ code: dataPlayers.response.message, type: dataPlayers.response.status });
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
                    setModalOptionsConfirm((prev) => ({ ...prev, isSubmitting: false }));
                })
            )
            .subscribe();
    };

    /**
     * Suppression d'un cadeau d'un participant
     */
    const handleDeleteReward = (idReward) => {
        setMessage(null);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null, isSubmitting: true }));

        const rewardsService = new RewardsService();

        const subscriptionRewards = rewardsService.deleteReward(edition.id, idReward);

        combineLatest([subscriptionRewards])
            .pipe(
                map(([dataRewards]) => {
                    openCloseConfirmModal();
                    setGifts(dataRewards.response.data.gifts);
                    setPlayers(dataRewards.response.data.players);
                    setMessage({ code: dataRewards.response.message, type: dataRewards.response.status });
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
                    setModalOptionsConfirm((prev) => ({ ...prev, isSubmitting: false }));
                })
            )
            .subscribe();
    };

    return (
        <div>
            {isLoading ? (
                <div className="layout-spinner-centered">
                    <Spinner animation="border" role="status" variant="light" />
                </div>
            ) : (
                <>
                    {/* Message */}
                    {message && <Message code={message.code} params={message.params} type={message.type} setMessage={setMessage} />}

                    {/* Edition */}
                    {edition && (
                        <>
                            {/* Titre */}
                            <div>
                                <h1>
                                    <FaComputer size={30} />
                                    {t('edition.editionTitle', {
                                        year: new Date(edition.startDate).getFullYear(),
                                        location: edition.location
                                    })}
                                </h1>
                            </div>

                            {/* Onglets */}
                            <Tabs
                                variant="underline"
                                defaultActiveKey="players"
                                id="justify-tab-example"
                                className="mb-3 edition-tabs"
                                justify
                            >
                                {/* Participants */}
                                <Tab eventKey="players" title={t('edition.players')}>
                                    <EditionPlayers
                                        players={players}
                                        formPlayer={formPlayer}
                                        setFormPlayer={setFormPlayer}
                                        resetFormPlayer={resetFormPlayer}
                                        setModalOptionsPlayer={setModalOptionsPlayer}
                                        formReward={formReward}
                                        setFormReward={setFormReward}
                                        setModalOptionsReward={setModalOptionsReward}
                                        setMessage={setMessage}
                                        onSubmit={handleSubmitPlayer}
                                        onConfirm={openCloseConfirmModal}
                                        isSubmitting={isSubmitting}
                                    />
                                </Tab>

                                {/* Cadeaux */}
                                <Tab eventKey="gifts" title={t('edition.gifts')}>
                                    <EditionGifts
                                        gifts={gifts}
                                        formData={formGift}
                                        setFormData={setFormGift}
                                        setModalOptions={setModalOptionsGift}
                                        onConfirm={openCloseConfirmModal}
                                        isSubmitting={isSubmitting}
                                    />
                                </Tab>

                                {/* A propos */}
                                <Tab eventKey="about" title={t('edition.about')}>
                                    <EditionAbout edition={edition} onEdit={openCloseEditionModal} onConfirm={handleConfirmDeleteEdition} />
                                </Tab>
                            </Tabs>

                            {/* Modale de modification/suppression d'édition */}
                            {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && modalOptionsEdition.isOpen && (
                                <EditionModal
                                    formData={formEdition}
                                    setFormData={setFormEdition}
                                    modalOptions={modalOptionsEdition}
                                    setModalOptions={setModalOptionsEdition}
                                    onClose={openCloseEditionModal}
                                    onSubmit={handleSubmitEdition}
                                />
                            )}

                            {/* Modale de création/modification de cadeau */}
                            {auth.isLoggedIn && auth.level >= UserRole.ADMIN && modalOptionsGift.isOpen && (
                                <GiftModal
                                    gift={gifts.find((g) => g.id === formGift.id)}
                                    formData={formGift}
                                    setFormData={setFormGift}
                                    modalOptions={modalOptionsGift}
                                    setModalOptions={setModalOptionsGift}
                                    onClose={openCloseGiftModal}
                                    onSubmit={handleSubmitGift}
                                />
                            )}

                            {/* Modale de modification de participant */}
                            {auth.isLoggedIn && auth.level >= UserRole.ADMIN && modalOptionsPlayer.isOpen && (
                                <PlayerModal
                                    players={players}
                                    player={players.find((p) => p.id === formPlayer.id)}
                                    formData={formPlayer}
                                    setFormData={setFormPlayer}
                                    modalOptions={modalOptionsPlayer}
                                    setModalOptions={setModalOptionsPlayer}
                                    onClose={openClosePlayerModal}
                                    onSubmit={handleSubmitPlayer}
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
                                />
                            )}

                            {/* Modale de confirmation */}
                            {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && modalOptionsConfirm.isOpen && (
                                <ConfirmModal
                                    modalOptions={modalOptionsConfirm}
                                    setModalOptions={setModalOptionsConfirm}
                                    onClose={openCloseConfirmModal}
                                    onConfirmAction={handleConfirmAction}
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Edition;
