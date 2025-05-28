import { useEffect, useState } from 'react';

import EditionsService from '../../api/editionsService';

import HomeCard from '../../components/HomeCard/HomeCard';
import TestForm from '../../components/TestForm/TestForm';

import { combineLatest, of, switchMap } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

// TODO : voir pour créer un fichier de traductions/libellés

const Home = () => {
    // API states
    const [editionsByYear, setEditionsByYear] = useState([]);

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

    /**
     * Création
     */
    const handleSubmit = () => {
        const editionsService = new EditionsService();

        editionsService
            .insertEdition(formData)
            .pipe(
                switchMap(() => editionsService.getAllEditions()),
                map((dataEditions) => {
                    groupByYear(dataEditions.response);
                    resetFormData();
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

        setEditionsByYear(sortedArray);
    };

    return (
        <div>
            <h1>Editions</h1>

            {/* Formulaire de création */}
            <TestForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
            />

            {/* Cartes */}
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                {editionsByYear && editionsByYear.length > 0 ? (
                    editionsByYear.map((group) => (
                        <div key={group.year}>
                            <h2>{group.year}</h2>
                            {group.editions.map((edition) => (
                                <HomeCard
                                    key={edition.id}
                                    edition={edition}
                                    formUpdate={formUpdate}
                                    setFormUpdate={setFormUpdate}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ))
                ) : (
                    <div>Aucun enregistrement</div>
                )}
            </div>
        </div>
    );
};

export default Home;
