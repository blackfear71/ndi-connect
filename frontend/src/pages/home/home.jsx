import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import EditionsService from '../../api/editionsService';

import HomeAccess from '../../components/homeAccess/homeAccess';
import HomeCard from '../../components/homeCard/homeCard';
import HomePresentation from '../../components/homePresentation/homePresentation';
import HomeSuggestions from '../../components/homeSuggestions/homeSuggestions';
import TestForm from '../../components/testForm/testForm';

import { combineLatest, of, switchMap } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

// TODO : voir pour utiliser des fichiers .env
// TODO : voir pour créer un fichier de traductions/libellés

const Home = () => {
    const [editions, setEditions] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [formUpdate, setFormUpdate] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        const editionsService = new EditionsService();

        const subscriptionEditions = editionsService.getAllEditions();

        combineLatest([subscriptionEditions])
            .pipe(
                map(([dataEditions]) => {
                    console.log(dataEditions.response);
                    setEditions(dataEditions.response);
                }),
                take(1),
                catchError(() => {
                    return of();
                }),
            )
            .subscribe();
    }, []);

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

    const resetFormData = () => {
        formData.name = '';
        formData.description = '';

        setFormData(formData);
    };

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

    const resetFormUpdate = () => {
        formUpdate.name = '';
        formUpdate.description = '';

        setFormData(formUpdate);
    };

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
            {/* Cartes accueil */}
            <HomePresentation />

            {/* Suggestions */}
            <HomeSuggestions />

            {/* Accès */}
            <HomeAccess />

            <Link to="/">Accueil</Link>
            {editions && editions.length > 0 && (
                <span>
                    |<Link to={`/edition/${editions[0].id}`}>Edition</Link>
                </span>
            )}
            <h1>Editions</h1>
            <TestForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
            />

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
