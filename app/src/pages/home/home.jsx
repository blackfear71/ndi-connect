import { useEffect, useState } from 'react';

import EditionsService from '../../api/editionsService';

import HomeCard from '../../components/homeCard/homeCard';
import TestForm from '../../components/testForm/testForm';

import { combineLatest, of, switchMap } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

// TODO : voir pour créer un fichier de traductions/libellés

const Home = () => {
    // API states
    const [editions, setEditions] = useState([]);

    // Formik
    const [formData, setFormData] = useState({
        year: '',
        place: '',
    });
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
                    setEditions(dataEditions.response);
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
                    setEditions(dataEditions.response);
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
                    setEditions(dataEditions.response);
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
                    setEditions(dataEditions.response);
                }),
                take(1),
                catchError((err) => {
                    console.error(err);
                    return of();
                }),
            )
            .subscribe();
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
                {editions && editions.length > 0 ? (
                    editions.map((edition) => (
                        <HomeCard
                            key={edition.id}
                            edition={edition}
                            formUpdate={formUpdate}
                            setFormUpdate={setFormUpdate}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div>Aucun enregistrement</div>
                )}
            </div>
        </div>
    );
};

export default Home;
