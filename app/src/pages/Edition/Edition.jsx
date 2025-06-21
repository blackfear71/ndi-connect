import { useContext, useEffect, useState } from 'react';

import { Button, Spinner, Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaComputer, FaHouse, FaTrashCan, FaWandMagicSparkles } from 'react-icons/fa6';
import { useNavigate, useParams } from 'react-router-dom';

import EditionsService from '../../api/editionsService';
import GiftsService from '../../api/giftsService';
import PlayersService from '../../api/playersService';

import EditionAbout from '../../components/EditionAbout/EditionAbout';
import EditionGifts from '../../components/EditionGifts/EditionGifts';
import EditionModal from '../../components/EditionModal/EditionModal';
import EditionPlayers from '../../components/EditionPlayers/EditionPlayers';
import GiftModal from '../../components/GiftModal/GiftModal';
import Message from '../../components/Message/Message';
import PlayerModal from '../../components/PlayerModal/PlayerModal';

import UserRole from '../../enums/UserRole';

import { combineLatest, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { AuthContext } from '../../utils/AuthContext';

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
    // TODO : messageModal et modalOptions peuvent être mis en commun ?
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmittingEdition, setIsSubmittingEdition] = useState(false);
    const [isSubmittingGift, setIsSubmittingGift] = useState(false);
    const [isSubmittingPlayer, setIsSubmittingPlayer] = useState(false);
    const [messagePage, setMessagePage] = useState(null);
    const [messageModalEdition, setMessageModalEdition] = useState(null);
    const [messageModalGift, setMessageModalGift] = useState(null);
    const [messageModalPlayer, setMessageModalPlayer] = useState(null);
    const [modalOptionsEdition, setModalOptionsEdition] = useState({ action: '', isOpen: false });
    const [modalOptionsGift, setModalOptionsGift] = useState({ action: '', isOpen: false });
    const [modalOptionsPlayer, setModalOptionsPlayer] = useState({ action: '', isOpen: false });
    const [formEdition, setFormEdition] = useState({
        year: '',
        location: ''
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
        points: 0
    });
    const [showActions, setShowActions] = useState(true);

    // API states
    const [about, setAbout] = useState();
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
                    setAbout(dataEdition.response.data.about);
                    setEdition(dataEdition.response.data.edition);
                    setGifts(dataEdition.response.data.gifts);
                    setPlayers(dataEdition.response.data.players);

                    setFormEdition({
                        ...formEdition,
                        year: dataEdition.response.data.edition.year,
                        location: dataEdition.response.data.edition.location
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
     * Modification de l'édition
     */
    const handleSubmitEdition = () => {
        setMessageModalEdition(null);
        setMessagePage(null);
        setIsSubmittingEdition(true);

        const editionsService = new EditionsService(localStorage.getItem('token'));

        const subscriptionEdition =
            modalOptionsEdition.action === 'delete'
                ? editionsService.deleteEdition(edition.id)
                : editionsService.updateEdition(edition.id, formEdition);

        combineLatest([subscriptionEdition])
            .pipe(
                map(([dataEdition]) => {
                    // Redirection ou fermeture modale
                    if (modalOptionsEdition.action === 'delete') {
                        navigate('/');
                    } else {
                        openCloseEditionModal('');
                        resetFormEdition(dataEdition.response.data.edition);
                        setEdition(dataEdition.response.data.edition);
                        setMessagePage({ code: dataEdition.response.message, type: dataEdition.response.status });
                    }
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
            year: data.year,
            location: data.location
        });
    };

    /**
     * Création/modification/suppression d'un participant
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
                    points: formPlayer.points
                });
                break;
            case 'delete':
                subscriptionPlayers = playersService.deletePlayer(edition.id, formPlayer.id);
                break;
            case 'update':
                subscriptionPlayers = playersService.updatePlayer(edition.id, formPlayer.id, {
                    name: formPlayer.name,
                    points: formPlayer.points
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
            points: 0
        });
    };

    /**
     * Création/modification/suppression d'un cadeau
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
            case 'delete':
                subscriptionGifts = giftsService.deleteGift(edition.id, formGift.id);
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
                                href="/"
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
                                        onClick={() => openCloseEditionModal('update')}
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
                                        onClick={() => openCloseEditionModal('delete')}
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
                                {t('edition.editionTitle', { year: edition.year, location: edition.location })}
                            </h1>
                        </div>
                    )}

                    {/* Contenu */}
                    <Tabs variant="underline" defaultActiveKey="players" id="justify-tab-example" className="mb-3 edition-tabs" justify>
                        {/* Participants */}
                        <Tab eventKey="players" title={t('edition.players')}>
                            <EditionPlayers
                                players={players}
                                formData={formPlayer}
                                setFormData={setFormPlayer}
                                resetFormPlayer={resetFormPlayer}
                                setModalOptions={setModalOptionsPlayer}
                                setMessage={setMessagePage}
                                onSubmit={handleSubmitPlayer}
                                isSubmitting={isSubmittingEdition || isSubmittingGift || isSubmittingPlayer}
                            />
                        </Tab>

                        {/* Cadeaux */}
                        <Tab eventKey="gifts" title={t('edition.gifts')}>
                            <EditionGifts
                                gifts={gifts}
                                setFormData={setFormGift}
                                setModalOptions={setModalOptionsGift}
                                isSubmitting={isSubmittingEdition || isSubmittingGift || isSubmittingPlayer}
                            />
                        </Tab>

                        {/* A propos */}
                        <Tab eventKey="about" title={t('edition.about')}>
                            <EditionAbout about={about} />
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
                </>
            )}
        </div>
    );
};

export default Edition;
