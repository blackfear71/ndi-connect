import { useContext, useEffect, useState } from 'react';

import { Button, Spinner, Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaComputer, FaHouse, FaTrashCan, FaWandMagicSparkles } from 'react-icons/fa6';
import { useNavigate, useParams } from 'react-router-dom';

import EditionsService from '../../api/editionsService';

import EditionAbout from '../../components/EditionAbout/EditionAbout';
import EditionGifts from '../../components/EditionGifts/EditionGifts';
import EditionModal from '../../components/EditionModal/EditionModal';
import EditionPlayers from '../../components/EditionPlayers/EditionPlayers';
import Message from '../../components/Message/Message';

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
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messagePage, setMessagePage] = useState(null);
    const [messageModal, setMessageModal] = useState(null);
    const [modalOptions, setModalOptions] = useState({ action: '', isOpen: false });
    const [formEdition, setFormEdition] = useState({
        year: '',
        place: ''
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
                        year: dataEdition.response.data.year,
                        place: dataEdition.response.data.place
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
     * Modification
     */
    const handleSubmit = () => {
        setMessageModal(null);
        setMessagePage(null);
        setIsSubmitting(true);

        const editionsService = new EditionsService(localStorage.getItem('token'));

        // TODO : en cas de suppression, passer aussi en suppression les participants et cadeaux

        const subscriptionEdition =
            modalOptions.action === 'delete'
                ? editionsService.deleteEdition(edition.id)
                : editionsService.updateEdition(edition.id, formEdition);

        combineLatest([subscriptionEdition])
            .pipe(
                map(([dataEdition]) => {
                    // Redirection ou fermeture modale
                    if (modalOptions.action === 'delete') {
                        navigate('/');
                    } else {
                        openCloseEditionModal('');
                        resetFormEdition(dataEdition.response.data);
                        setEdition(dataEdition.response.data);
                        setMessagePage({ code: dataEdition.response.message, type: dataEdition.response.status });
                    }
                }),
                take(1),
                catchError((err) => {
                    setMessageModal({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    /**
     * Ouverture/fermeture de la modale de modification d'édition
     */
    const openCloseEditionModal = (openAction) => {
        setModalOptions({ action: openAction, isOpen: !modalOptions.isOpen });
    };

    /**
     * Réinitialisation formulaire (modification)
     */
    const resetFormEdition = (data) => {
        setFormEdition({
            year: data.year,
            place: data.place
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
                    <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
                        {/* Accueil */}
                        <Button
                            variant="outline-action"
                            size="sm"
                            href="/"
                            className="d-flex align-items-center justify-content-center gap-2 flex-fill btn-yellow"
                        >
                            <FaHouse size={15} className="outline-action-icon" />
                            {t('common.home')}
                        </Button>

                        {/* Actions */}
                        {showActions && auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && (
                            <>
                                {/* Modifier */}
                                <Button
                                    variant="outline-action"
                                    size="sm"
                                    onClick={() => openCloseEditionModal('update')}
                                    className="d-flex align-items-center justify-content-center gap-2 flex-fill btn-blue"
                                >
                                    <FaWandMagicSparkles size={15} className="outline-action-icon" />
                                    {t('common.update')}
                                </Button>

                                {/* Supprimer */}
                                <Button
                                    variant="outline-action"
                                    size="sm"
                                    onClick={() => openCloseEditionModal('delete')}
                                    className="d-flex align-items-center justify-content-center gap-2 flex-fill btn-red"
                                >
                                    <FaTrashCan size={15} className="outline-action-icon" />
                                    {t('common.delete')}
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Titre */}
                    {edition && (
                        <div>
                            <h1>
                                <FaComputer size={30} />
                                {t('edition.editionTitle', { year: edition.year, place: edition.place })}
                            </h1>
                        </div>
                    )}

                    {/* Contenu */}
                    <Tabs
                        variant="underline"
                        defaultActiveKey="players"
                        id="justify-tab-example"
                        className="mb-3 edition-tabs"
                        justify
                    >
                        {/* Participants */}
                        <Tab eventKey="players" title={t('edition.players')}>
                            <EditionPlayers players={players} />
                        </Tab>

                        {/* Cadeaux */}
                        <Tab eventKey="gifts" title={t('edition.gifts')}>
                            <EditionGifts gifts={gifts} />
                        </Tab>

                        {/* A propos */}
                        <Tab eventKey="about" title={t('edition.about')}>
                            <EditionAbout about={about} />
                        </Tab>
                    </Tabs>

                    {/* Modale de modification/suppression d'édition */}
                    {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && modalOptions.isOpen && (
                        <EditionModal
                            formData={formEdition}
                            setFormData={setFormEdition}
                            modalOptions={modalOptions}
                            message={messageModal}
                            setMessage={setMessageModal}
                            onClose={openCloseEditionModal}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default Edition;
