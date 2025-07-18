import { useContext, useEffect, useMemo, useState } from 'react';

import { Button, Spinner, Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaComputer, FaHouse, FaTrashCan, FaWandMagicSparkles } from 'react-icons/fa6';
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
import { getDayFromDate, getTimeFromDate } from '../../utils/dateHelper';

import './Edition.css';

/**
 * Page détail édition
 * @returns
 */
const Edition = () => {
    // Router
    const { id } = useParams();
    const navigate = useNavigate();

    // Contexte
    const { auth } = useContext(AuthContext);

    // Traductions
    const { t } = useTranslation();

    // Local states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);
    const [isSubmittingEdition, setIsSubmittingEdition] = useState(false);
    const [isSubmittingGift, setIsSubmittingGift] = useState(false);
    const [isSubmittingPlayer, setIsSubmittingPlayer] = useState(false);
    const [isSubmittingReward, setIsSubmittingReward] = useState(false);
    const [messagePage, setMessagePage] = useState(null);
    const [messageModalConfirm, setMessageModalConfirm] = useState(null);
    const [messageModalEdition, setMessageModalEdition] = useState(null);
    const [messageModalGift, setMessageModalGift] = useState(null);
    const [messageModalPlayer, setMessageModalPlayer] = useState(null);
    const [messageModalReward, setMessageModalReward] = useState(null);
    const [modalOptionsConfirm, setModalOptionsConfirm] = useState({ content: '', action: '', data: null, isOpen: false });
    const [modalOptionsEdition, setModalOptionsEdition] = useState({ action: '', isOpen: false });
    const [modalOptionsGift, setModalOptionsGift] = useState({ action: '', isOpen: false });
    const [modalOptionsPlayer, setModalOptionsPlayer] = useState({ action: '', isOpen: false });
    const [modalOptionsReward, setModalOptionsReward] = useState({ isOpen: false });
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
    const [showActions, setShowActions] = useState(true);

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
                        startTime: getTimeFromDate(dataEdition.response.data.edition.startDate),
                        endTime: getTimeFromDate(dataEdition.response.data.edition.endDate),
                        theme: dataEdition.response.data.edition.theme,
                        challenge: dataEdition.response.data.edition.challenge
                    });
                }),
                take(1),
                catchError((err) => {
                    setShowActions(false);
                    setMessagePage({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsLoading(false);
                })
            )
            .subscribe();
    }, [id]);

    /**
     * Contrôle soumission en cours
     */
    const isSubmitting = useMemo(() => {
        return isSubmittingConfirm || isSubmittingEdition || isSubmittingGift || isSubmittingPlayer || isSubmittingReward;
    }, [isSubmittingConfirm, isSubmittingEdition, isSubmittingGift, isSubmittingPlayer, isSubmittingReward]);

    /**
     * Modification de l'édition
     */
    const handleSubmitEdition = () => {
        setMessageModalEdition(null);
        setMessagePage(null);
        setIsSubmittingEdition(true);

        const editionsService = new EditionsService(localStorage.getItem('token'));

        const subscriptionEdition = editionsService.updateEdition(edition.id, formEdition);

        combineLatest([subscriptionEdition])
            .pipe(
                map(([dataEdition]) => {
                    // Fermeture modale
                    openCloseEditionModal('');
                    resetFormEdition(dataEdition.response.data.edition);
                    setEdition(dataEdition.response.data.edition);
                    setMessagePage({ code: dataEdition.response.message, type: dataEdition.response.status });
                }),
                take(1),
                catchError((err) => {
                    setMessageModalEdition({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsSubmittingEdition(false);
                })
            )
            .subscribe();
    };

    /**
     * Ouverture/fermeture de la modale de modification d'édition
     */
    const openCloseEditionModal = (openAction) => {
        // Ouverture ou fermeture
        setModalOptionsEdition({ action: openAction, isOpen: !modalOptionsEdition.isOpen });

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsEdition.isOpen && resetFormEdition(edition);
    };

    /**
     * Réinitialisation formulaire (modification édition)
     */
    const resetFormEdition = (data) => {
        setFormEdition({
            location: data.location,
            startDate: getDayFromDate(data.startDate),
            startTime: getTimeFromDate(data.startDate),
            endTime: getTimeFromDate(data.endDate),
            theme: data.theme,
            challenge: data.challenge
        });
    };

    /**
     * Ouvre la modale de suppression d'édition
     */
    const handleConfirmEdition = () => {
        // Ouverture de la modale de confirmation
        openCloseConfirmModal({
            content: t('edition.deleteEdition', { year: new Date(edition.startDate).getFullYear(), location: edition.location }),
            action: 'deleteEdition',
            data: null
        });
    };

    /**
     * Suppression de l'édition
     */
    const handleDeleteEdition = () => {
        setMessageModalConfirm(null);
        setMessagePage(null);
        setIsSubmittingConfirm(true);

        const editionsService = new EditionsService(localStorage.getItem('token'));

        const subscriptionEdition = editionsService.deleteEdition(edition.id);

        combineLatest([subscriptionEdition])
            .pipe(
                map(() => {
                    // Fermeture modale de confirmation
                    openCloseConfirmModal();

                    // Redirection
                    navigate('/');
                }),
                take(1),
                catchError((err) => {
                    setMessageModalConfirm({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsSubmittingConfirm(false);
                })
            )
            .subscribe();
    };

    /**
     * Création ou modification d'un participant
     */
    const handleSubmitPlayer = (action) => {
        setMessageModalPlayer(null);
        setMessagePage(null);
        setIsSubmittingPlayer(true);

        const playersService = new PlayersService(localStorage.getItem('token'));

        let subscriptionPlayers = null;

        switch (action) {
            case 'create':
                subscriptionPlayers = playersService.createPlayer(edition.id, {
                    id_edition: edition.id,
                    name: formPlayer.name,
                    delta: formPlayer.delta
                });
                break;
            case 'update':
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
                        action === 'create' ? resetFormPlayer() : openClosePlayerModal('');
                        setPlayers(dataPlayers.response.data);
                        setMessagePage({ code: dataPlayers.response.message, type: dataPlayers.response.status });
                    }),
                    take(1),
                    catchError((err) => {
                        setMessageModalPlayer({ code: err?.response?.message, type: err?.response?.status });
                        return of();
                    }),
                    finalize(() => {
                        setIsSubmittingPlayer(false);
                    })
                )
                .subscribe();
        }
    };

    /**
     * Ouverture/fermeture de la modale de modification de participant
     */
    const openClosePlayerModal = (openAction) => {
        // Ouverture ou fermeture
        setModalOptionsPlayer({ action: openAction, isOpen: !modalOptionsPlayer.isOpen });

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsPlayer.isOpen && resetFormPlayer();
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
     * Suppression d'un participant
     */
    const handleDeletePlayer = (idPlayer) => {
        setMessageModalConfirm(null);
        setMessagePage(null);
        setIsSubmittingConfirm(true);

        const playersService = new PlayersService(localStorage.getItem('token'));

        const subscriptionPlayers = playersService.deletePlayer(edition.id, idPlayer);

        combineLatest([subscriptionPlayers])
            .pipe(
                map(([dataPlayers]) => {
                    openCloseConfirmModal();
                    setPlayers(dataPlayers.response.data);
                    setMessagePage({ code: dataPlayers.response.message, type: dataPlayers.response.status });
                }),
                take(1),
                catchError((err) => {
                    setMessageModalConfirm({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsSubmittingConfirm(false);
                })
            )
            .subscribe();
    };

    /**
     * Création ou modification d'un cadeau
     */
    const handleSubmitGift = (action) => {
        setMessageModalGift(null);
        setMessagePage(null);
        setIsSubmittingGift(true);

        const giftsService = new GiftsService(localStorage.getItem('token'));

        let subscriptionGifts = null;

        switch (action) {
            case 'create':
                subscriptionGifts = giftsService.createGift(edition.id, {
                    id_edition: edition.id,
                    name: formGift.name,
                    value: formGift.value,
                    quantity: formGift.quantity
                });
                break;
            case 'update':
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
                        setMessagePage({ code: dataGifts.response.message, type: dataGifts.response.status });
                    }),
                    take(1),
                    catchError((err) => {
                        setMessageModalGift({ code: err?.response?.message, type: err?.response?.status });
                        return of();
                    }),
                    finalize(() => {
                        setIsSubmittingGift(false);
                    })
                )
                .subscribe();
        }
    };

    /**
     * Ouverture/fermeture de la modale de modification de cadeau
     */
    const openCloseGiftModal = (openAction) => {
        // Ouverture ou fermeture
        setModalOptionsGift({ action: openAction, isOpen: !modalOptionsGift.isOpen });

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsGift.isOpen && resetFormGift();
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
     * Suppression d'un cadeau
     */
    const handleDeleteGift = (idGift) => {
        setMessageModalConfirm(null);
        setMessagePage(null);
        setIsSubmittingConfirm(true);

        const giftsService = new GiftsService(localStorage.getItem('token'));

        const subscriptionGifts = giftsService.deleteGift(edition.id, idGift);

        combineLatest([subscriptionGifts])
            .pipe(
                map(([dataGifts]) => {
                    openCloseConfirmModal();
                    setGifts(dataGifts.response.data);
                    setMessagePage({ code: dataGifts.response.message, type: dataGifts.response.status });
                }),
                take(1),
                catchError((err) => {
                    setMessageModalConfirm({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsSubmittingConfirm(false);
                })
            )
            .subscribe();
    };

    /**
     * Attribution d'un cadeau à un participant
     */
    const handleSubmitReward = () => {
        setMessageModalReward(null);
        setMessagePage(null);
        setIsSubmittingReward(true);

        const rewardsService = new RewardsService(localStorage.getItem('token'));

        const subscriptionRewards = rewardsService.postReward(edition.id, formReward);

        combineLatest([subscriptionRewards])
            .pipe(
                map(([dataRewards]) => {
                    openCloseRewardModal();
                    setGifts(dataRewards.response.data.gifts);
                    setPlayers(dataRewards.response.data.players);
                    setMessagePage({ code: dataRewards.response.message, type: dataRewards.response.status });
                }),
                take(1),
                catchError((err) => {
                    setMessageModalReward({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsSubmittingReward(false);
                })
            )
            .subscribe();
    };

    /**
     * Ouverture/fermeture de la modale d'attribution de cadeau
     */
    const openCloseRewardModal = () => {
        // Ouverture ou fermeture
        setModalOptionsReward({ isOpen: !modalOptionsReward.isOpen });

        // Réinitialisation du formulaire à la fermeture de la modale (c'est-à-dire si la modale était précédemment ouverte)
        modalOptionsReward.isOpen && resetFormReward();
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
     * Suppression d'un cadeau d'un participant
     */
    const handleDeleteReward = (idReward) => {
        setMessageModalConfirm(null);
        setMessagePage(null);
        setIsSubmittingConfirm(true);

        const rewardsService = new RewardsService(localStorage.getItem('token'));

        const subscriptionRewards = rewardsService.deleteReward(edition.id, idReward);

        combineLatest([subscriptionRewards])
            .pipe(
                map(([dataRewards]) => {
                    openCloseConfirmModal();
                    setGifts(dataRewards.response.data.gifts);
                    setPlayers(dataRewards.response.data.players);
                    setMessagePage({ code: dataRewards.response.message, type: dataRewards.response.status });
                }),
                take(1),
                catchError((err) => {
                    setMessageModalConfirm({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsSubmittingConfirm(false);
                })
            )
            .subscribe();
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
                isOpen: !modalOptionsConfirm.isOpen
            });
        } else {
            setModalOptionsConfirm({
                content: '',
                action: '',
                data: null,
                isOpen: false
            });
        }
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

    return (
        <div>
            {isLoading ? (
                <div className="layout-spinner-centered">
                    <Spinner animation="border" role="status" variant="light" />
                </div>
            ) : (
                <>
                    {/* Message */}
                    {messagePage && <Message code={messagePage.code} type={messagePage.type} setMessage={setMessagePage} />}

                    {/* Actions */}
                    <div className="row g-2 mb-2">
                        {/* Accueil */}
                        <div className="col">
                            <Button
                                variant="outline-action"
                                size="sm"
                                onClick={() => navigate('/')}
                                className="d-flex align-items-center justify-content-center gap-2 w-100 btn-yellow"
                            >
                                <FaHouse size={15} className="outline-action-icon" />
                                {t('common.home')}
                            </Button>
                        </div>

                        {showActions && auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && (
                            <>
                                {/* Modifier */}
                                <div className="col">
                                    <Button
                                        variant="outline-action"
                                        size="sm"
                                        onClick={isSubmitting ? null : () => openCloseEditionModal('update')}
                                        className="d-flex align-items-center justify-content-center gap-2 w-100 btn-blue"
                                    >
                                        <FaWandMagicSparkles size={15} className="outline-action-icon" />
                                        {t('common.update')}
                                    </Button>
                                </div>

                                {/* Supprimer */}
                                <div className="col">
                                    <Button
                                        variant="outline-action"
                                        size="sm"
                                        onClick={isSubmitting ? null : () => handleConfirmEdition()}
                                        className="d-flex align-items-center justify-content-center gap-2 w-100 btn-red"
                                    >
                                        <FaTrashCan size={15} className="outline-action-icon" />
                                        {t('common.delete')}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Titre */}
                    {edition && (
                        <div>
                            <h1>
                                <FaComputer size={30} />
                                {t('edition.editionTitle', { year: new Date(edition.startDate).getFullYear(), location: edition.location })}
                            </h1>
                        </div>
                    )}

                    {/* Contenu */}
                    <Tabs variant="underline" defaultActiveKey="players" id="justify-tab-example" className="mb-3 edition-tabs" justify>
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
                                setMessage={setMessagePage}
                                onSubmit={handleSubmitPlayer}
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
                            <EditionAbout edition={edition} />
                        </Tab>
                    </Tabs>

                    {/* Modale de modification/suppression d'édition */}
                    {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && modalOptionsEdition.isOpen && (
                        <EditionModal
                            formData={formEdition}
                            setFormData={setFormEdition}
                            modalOptions={modalOptionsEdition}
                            message={messageModalEdition}
                            setMessage={setMessageModalEdition}
                            onClose={openCloseEditionModal}
                            onSubmit={handleSubmitEdition}
                            isSubmitting={isSubmittingEdition}
                        />
                    )}

                    {/* Modale de création/modification/suppression de cadeau */}
                    {auth.isLoggedIn && auth.level >= UserRole.ADMIN && modalOptionsGift.isOpen && (
                        <GiftModal
                            gift={gifts.find((g) => g.id === formGift.id)}
                            formData={formGift}
                            setFormData={setFormGift}
                            modalOptions={modalOptionsGift}
                            message={messageModalGift}
                            setMessage={setMessageModalGift}
                            onClose={openCloseGiftModal}
                            onSubmit={handleSubmitGift}
                            isSubmitting={isSubmittingGift}
                        />
                    )}

                    {/* Modale de modification/suppression de participant */}
                    {auth.isLoggedIn && auth.level >= UserRole.ADMIN && modalOptionsPlayer.isOpen && (
                        <PlayerModal
                            players={players}
                            player={players.find((p) => p.id === formPlayer.id)}
                            formData={formPlayer}
                            setFormData={setFormPlayer}
                            modalOptions={modalOptionsPlayer}
                            message={messageModalPlayer}
                            setMessage={setMessageModalPlayer}
                            onClose={openClosePlayerModal}
                            onSubmit={handleSubmitPlayer}
                            isSubmitting={isSubmittingPlayer}
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
                            message={messageModalReward}
                            setMessage={setMessageModalReward}
                            onClose={openCloseRewardModal}
                            onSubmit={handleSubmitReward}
                            onConfirm={openCloseConfirmModal}
                            isSubmitting={isSubmittingReward}
                        />
                    )}

                    {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && modalOptionsConfirm.isOpen && (
                        <ConfirmModal
                            modalOptions={modalOptionsConfirm}
                            message={messageModalConfirm}
                            setMessage={setMessageModalConfirm}
                            onClose={openCloseConfirmModal}
                            onConfirmAction={handleConfirmAction}
                            isSubmitting={isSubmittingConfirm}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default Edition;
