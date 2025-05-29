import { useEffect, useState } from 'react';

import { Button } from 'react-bootstrap';

import EditionsService from '../../api/editionsService';

import EditionModal from '../../components/EditionModal/EditionModal';

import { combineLatest, of, switchMap } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

// TODO : voir pour créer un fichier de traductions/libellés

const Home = () => {
    // API states
    const [isOpenEditionModal, setIsOpenEditionModal] = useState(false);
    const [yearsAndEditions, setYearsAndEditions] = useState([]);
    const [editionsByYear, setEditionsByYear] = useState();

    // Formik
    const [formData, setFormData] = useState({
        year: '',
        place: '',
    });
    // TODO : problème avec ce formik qui est global à la page : si on modifie une carte (avec une autre ouverte), elles sont toutes modifiées visuellement (mais pas dans le back)
    const [formUpdate, setFormUpdate] = useState({
        year: '',
        place: '',
    });

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
                catchError(() => {
                    return of();
                }),
            )
            .subscribe();
    }, []);

    const openEditionModal = () => {
        setIsOpenEditionModal(true);
    };

    const closeEditionModal = () => {
        setIsOpenEditionModal(false);
    };

    /**
     * Création
     */
    const handleSubmit = () => {
        const editionsService = new EditionsService();

        // TODO : contrôler les champs obligatoires (sinon on peut ne pas saisir d'année)

        editionsService
            .insertEdition(formData)
            .pipe(
                switchMap(() => editionsService.getAllEditions()),
                map((dataEditions) => {
                    groupByYear(dataEditions.response);
                    closeEditionModal();
                    resetFormData();
                    setEditionsByYear([]);
                }),
                take(1),
                catchError((err) => {
                    // TODO : voir pour l'affichage d'un bandeau avec erreur générique
                    // TODO : voir aussi comment gérer un tableau avec code réponse (200, 404...) et le message associé
                    console.error(err);
                    return of();
                }),
            )
            .subscribe();
    };

    /**
     * Réinitialisation formulaire (modification)
     */
    const resetFormData = () => {
        formData.year = '';
        formData.place = '';

        setFormData(formData);
    };

    /**
     * Mise à jour
     * @param {*} id Identifiant édition
     */
    const handleUpdate = (id) => {
        const editionsService = new EditionsService();

        editionsService
            .updateEdition(id, formUpdate)
            .pipe(
                switchMap(() => editionsService.getAllEditions()),
                map((dataEditions) => {
                    groupByYear(dataEditions.response);
                    resetFormUpdate();
                }),
                take(1),
                catchError((err) => {
                    console.error(err);
                    return of();
                }),
            )
            .subscribe();
    };

    /**
     * Réinitialisation formulaire (modification)
     */
    const resetFormUpdate = () => {
        formUpdate.year = '';
        formUpdate.place = '';

        setFormData(formUpdate);
    };

    /**
     * Suppression
     * @param {*} id Identifiant édition
     */
    const handleDelete = (id) => {
        const editionsService = new EditionsService();

        editionsService
            .deleteEdition(id)
            .pipe(
                switchMap(() => editionsService.getAllEditions()),
                map((dataEditions) => {
                    groupByYear(dataEditions.response);
                }),
                take(1),
                catchError((err) => {
                    console.error(err);
                    return of();
                }),
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
                editions: grouped[year],
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
            <h1>Editions</h1>

            {/* Ajout */}
            <div className="d-grid mb-2">
                <Button variant="success" size="lg" onClick={openEditionModal}>
                    Ajouter une édition
                </Button>
            </div>

            {/* Années et éditions */}
            {(yearsAndEditions && yearsAndEditions.length > 0) || (editionsByYear && editionsByYear.length > 0) ? (
                editionsByYear && editionsByYear.length > 0 ? (
                    <div className="d-grid gap-2">
                        {/* Retour */}
                        <Button
                            variant="warning"
                            size="lg"
                            onClick={showYearsOfEditions}
                        >
                            Retour
                        </Button>

                        {/* Editions */}
                        {editionsByYear.map((edition) => (
                            <Button
                                variant="primary"
                                size="lg"
                                href={`/edition/${edition.id}`}
                            >
                                {edition.place}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <div className="d-grid gap-2">
                        {/* Années */}
                        {yearsAndEditions.map((year) => (
                            <Button
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
                <div>Aucune édition</div>
            )}

            {isOpenEditionModal && (
                <EditionModal
                    formData={formData}
                    setFormData={setFormData}
                    onClose={closeEditionModal}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
};

export default Home;
