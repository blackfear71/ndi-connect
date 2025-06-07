import { useContext, useEffect, useState } from 'react';

import { Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaCalendarDays } from 'react-icons/fa6';

import EditionsService from '../../api/editionsService';

import EditionModal from '../../components/EditionModal/EditionModal';
import Message from '../../components/Message/Message';

import UserRole from '../../enums/UserRole';

import { combineLatest, of, switchMap } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { AuthContext } from '../../utils/AuthContext';

/**
 * Page d'accueil
 * @returns
 */
const Home = () => {
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

    // API states
    const [yearsAndEditions, setYearsAndEditions] = useState([]);
    const [editionsByYear, setEditionsByYear] = useState();

    /**
     * Lancement initial de la page
     */
    useEffect(() => {
        const editionsService = new EditionsService();

        const subscriptionEditions = editionsService.getAllEditions();

        combineLatest([subscriptionEditions])
            .pipe(
                map(([dataEditions]) => {
                    groupByYear(dataEditions.response.data);
                }),
                take(1),
                catchError((err) => {
                    setMessagePage(err?.response?.message);
                    return of();
                }),
                finalize(() => {
                    setIsLoading(false);
                })
            )
            .subscribe();
    }, []);

    /**
     * Ouverture/fermeture de la modale de création d'édition
     */
    const openCloseEditionModal = (openAction) => {
        setModalOptions({ action: openAction, isOpen: !modalOptions.isOpen });
    };

    /**
     * Création
     */
    const handleSubmit = () => {
        setMessageModal(null);
        setMessagePage(null);
        setIsSubmitting(true);

        const editionsService = new EditionsService(localStorage.getItem('token'));

        editionsService
            .insertEdition(formEdition)
            .pipe(
                map((dataEdition) => {
                    setMessagePage({ code: dataEdition.response.message, type: dataEdition.response.status });
                }),
                switchMap(() => editionsService.getAllEditions()),
                map((dataEditions) => {
                    groupByYear(dataEditions.response.data);
                    openCloseEditionModal('');
                    resetFormEdition();
                    setEditionsByYear([]);
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
     * Réinitialisation formulaire (création)
     */
    const resetFormEdition = () => {
        setFormEdition({
            year: '',
            place: ''
        });
    };

    /**
     * Regroupe par année les éditions et trie
     * @param {*} editions Liste des éditions
     * @returns Editions regroupées et triées
     */
    const groupByYear = (editions) => {
        const grouped = {};

        editions.forEach((item) => {
            const year = item.year;
            if (!grouped[year]) {
                grouped[year] = [];
            }
            grouped[year].push(item);
        });

        // Trie les lieux dans chaque groupe d'année
        for (const year in grouped) {
            grouped[year].sort((a, b) => a.place.localeCompare(b.place));
        }

        // Trie les années par ordre décroissant et retourne un array
        const sortedArray = Object.keys(grouped)
            .sort((a, b) => b - a)
            .map((year) => ({
                year: Number(year),
                editions: grouped[year]
            }));

        setYearsAndEditions(sortedArray);
    };

    /**
     * Affiche les éditions d'une année
     * @param {*} year Année
     */
    const showEditionsByYear = (year) => {
        setEditionsByYear(year.editions);
    };

    /**
     * Affiche les années
     */
    const showYearsOfEditions = () => {
        setEditionsByYear([]);
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

                    {/* Titre */}
                    <h1>
                        <FaCalendarDays size={30} />
                        {t('home.editions')}
                    </h1>

                    {/* Ajout */}
                    {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && (
                        <div className="d-inline-flex align-items-center">
                            <Button variant="success" size="lg" onClick={() => openCloseEditionModal('create')}>
                                {t('home.addEdition')}
                            </Button>
                        </div>
                    )}

                    {/* Années et éditions */}
                    {(yearsAndEditions && yearsAndEditions.length > 0) || (editionsByYear && editionsByYear.length > 0) ? (
                        editionsByYear && editionsByYear.length > 0 ? (
                            <div className="d-grid gap-2">
                                {/* Retour */}
                                <Button variant="warning" size="lg" onClick={() => showYearsOfEditions()}>
                                    {t('common.return')}
                                </Button>

                                {/* Editions */}
                                {editionsByYear.map((edition) => (
                                    <Button key={edition.id} variant="primary" size="lg" href={`/edition/${edition.id}`}>
                                        {edition.place}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <div className="d-grid gap-2">
                                {/* Années */}
                                {yearsAndEditions.map((year) => (
                                    <Button key={year.year} variant="primary" size="lg" onClick={() => showEditionsByYear(year)}>
                                        {year.year}
                                    </Button>
                                ))}
                            </div>
                        )
                    ) : (
                        <div>{t('home.noEdition')}</div>
                    )}

                    {/* Modale de création d'édition */}
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

export default Home;
