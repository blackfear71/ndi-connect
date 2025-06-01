import { useContext, useEffect, useState } from 'react';

import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import EditionsService from '../../api/editionsService';

import EditionModal from '../../components/EditionModal/EditionModal';

import { combineLatest, of, switchMap, throwError } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

import { AuthContext } from '../../utils/AuthContext';

/**
 * Page d'accueil
 * @returns
 */
const Home = () => {
    // Contexte
    const { isLoggedIn } = useContext(AuthContext);

    // Traductions
    const { t } = useTranslation();

    // Local states
    const [error, setError] = useState('');
    const [isOpenEditionModal, setIsOpenEditionModal] = useState(false);
    const [formEdition, setFormEdition] = useState({
        year: '',
        place: ''
    });
    // TODO : problème avec ce formulaire qui est global à la page : si on modifie une carte (avec une autre ouverte), elles sont toutes modifiées visuellement (mais pas dans le back)
    const [formUpdate, setFormUpdate] = useState({
        year: '',
        place: ''
    });

    // API states
    const [yearsAndEditions, setYearsAndEditions] = useState([]);
    const [editionsByYear, setEditionsByYear] = useState();

    // Lancement initial de la page
    useEffect(() => {
        const editionsService = new EditionsService();

        const subscriptionEditions = editionsService.getAllEditions();

        combineLatest([subscriptionEditions])
            .pipe(
                map(([dataEditions]) => {
                    groupByYear(dataEditions.response);
                }),
                take(1),
                catchError((err) => {
                    setError(err.response.error);
                    return of();
                })
            )
            .subscribe();
    }, []);

    /**
     * Ouverture/fermeture de la modale de création d'édition
     */
    const openCloseEditionModal = () => {
        setIsOpenEditionModal(!isOpenEditionModal);
    };

    /**
     * Création
     */
    const handleSubmit = () => {
        const editionsService = new EditionsService(localStorage.getItem('login'), localStorage.getItem('token'));

        // TODO : contrôler les champs obligatoires (sinon on peut ne pas saisir d'année)

        editionsService
            .insertEdition(formEdition)
            .pipe(
                switchMap((dataEdition) => {
                    // On passe au catchError s'il n'y a pas d'id en retour
                    if (!dataEdition.response) {
                        return throwError(() => new Error(t('errors.insertEditionError')));
                    }

                    return editionsService.getAllEditions();
                }),
                map((dataEditions) => {
                    if (dataEditions.response.error) {
                        setError(dataEditions.response.error);
                    } else {
                        groupByYear(dataEditions.response);
                        openCloseEditionModal();
                        resetFormEdition();
                        setEditionsByYear([]);
                    }
                }),
                take(1),
                catchError((err) => {
                    // TODO : voir aussi comment gérer un tableau avec code réponse (200, 404...) et le message associé
                    // TODO : par défaut si le back renvoie un http_response_code autre que 200 ça tombe dans le catchError, à voir pour récupérer quand même la réponse (sauf dans les cas 500 ?)
                    setError(err.response.error);
                    return of();
                })
            )
            .subscribe();
    };

    /**
     * Réinitialisation formulaire (modification)
     */
    const resetFormEdition = () => {
        formEdition.year = '';
        formEdition.place = '';

        setFormEdition(formEdition);
    };

    /**
     * Modification
     * @param {*} id Identifiant édition
     */
    const handleUpdate = (id) => {
        const editionsService = new EditionsService(localStorage.getItem('login'), localStorage.getItem('token'));

        editionsService
            .updateEdition(id, formUpdate)
            .pipe(
                switchMap((dataEdition) => {
                    // On passe au catchError s'il n'y a pas d'id en retour
                    if (!dataEdition.response) {
                        return throwError(() => new Error(t('errors.updateEditionError')));
                    }

                    return editionsService.getAllEditions();
                }),
                map((dataEditions) => {
                    if (dataEditions.response.error) {
                        setError(dataEditions.response.error);
                    } else {
                        groupByYear(dataEditions.response);
                        resetFormUpdate();
                    }
                }),
                take(1),
                catchError((err) => {
                    setError(err.response.error);
                    return of();
                })
            )
            .subscribe();
    };

    /**
     * Réinitialisation formulaire (modification)
     */
    const resetFormUpdate = () => {
        formUpdate.year = '';
        formUpdate.place = '';

        setFormEdition(formUpdate);
    };

    /**
     * Suppression
     * @param {*} id Identifiant édition
     */
    const handleDelete = (id) => {
        const editionsService = new EditionsService(localStorage.getItem('login'), localStorage.getItem('token'));

        editionsService
            .deleteEdition(id)
            .pipe(
                switchMap((dataEdition) => {
                    // On passe au catchError s'il n'y a pas d'id en retour
                    if (!dataEdition.response) {
                        return throwError(() => new Error(t('errors.deleteEditionError')));
                    }

                    return editionsService.getAllEditions();
                }),
                map((dataEditions) => {
                    if (dataEditions.response.error) {
                        setError(dataEditions.response.error);
                    } else {
                        groupByYear(dataEditions.response);
                    }
                }),
                take(1),
                catchError((err) => {
                    setError(err.response.error);
                    return of();
                })
            )
            .subscribe();
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

    const showEditionsByYear = (year) => {
        setEditionsByYear(year.editions);
    };

    const showYearsOfEditions = () => {
        setEditionsByYear([]);
    };

    return (
        <div>
            <h1>{t('home.editions')}</h1>

            {/* Ajout */}
            {isLoggedIn && (
                <div className="d-grid mb-2">
                    <Button variant="success" size="lg" onClick={openCloseEditionModal}>
                        {t('home.addEdition')}
                    </Button>
                </div>
            )}

            {/* Années et éditions */}
            {(yearsAndEditions && yearsAndEditions.length > 0) || (editionsByYear && editionsByYear.length > 0) ? (
                editionsByYear && editionsByYear.length > 0 ? (
                    <div className="d-grid gap-2">
                        {/* Retour */}
                        <Button variant="warning" size="lg" onClick={showYearsOfEditions}>
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
                            <Button
                                key={year.year}
                                variant="primary"
                                size="lg"
                                onClick={() => showEditionsByYear(year)}
                            >
                                {year.year}
                            </Button>
                        ))}
                    </div>
                )
            ) : (
                <div>{t('home.noEdition')}</div>
            )}

            {/* Modale de création d'édition */}
            {isLoggedIn && isOpenEditionModal && (
                <EditionModal
                    formData={formEdition}
                    setFormData={setFormEdition}
                    isOpen={isOpenEditionModal}
                    error={error}
                    onClose={openCloseEditionModal}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
};

export default Home;
