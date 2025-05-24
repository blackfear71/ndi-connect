import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import TestService from '../../api/testService';

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
    const [test, setTest] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [formUpdate, setFormUpdate] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        const testService = new TestService();

        const subscriptionTest = testService.getAllTest();

        combineLatest([subscriptionTest])
            .pipe(
                map(([dataTest]) => {
                    setTest(dataTest.response);
                }),
                take(1),
                catchError(() => {
                    return of();
                }),
            )
            .subscribe();
    }, []);

    const handleSubmit = () => {
        const testService = new TestService();

        testService
            .insertTest(formData)
            .pipe(
                switchMap(() => testService.getAllTest()),
                map((dataTest) => {
                    setTest(dataTest.response);
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

    const handleUpdate = (test_id) => {
        const testService = new TestService();

        testService
            .updateTest(test_id, formUpdate)
            .pipe(
                switchMap(() => testService.getAllTest()),
                map((dataTest) => {
                    setTest(dataTest.response);
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

    const handleDelete = (test_id) => {
        const testService = new TestService();

        testService
            .deleteTest(test_id)
            .pipe(
                switchMap(() => testService.getAllTest()),
                map((dataTest) => {
                    setTest(dataTest.response);
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
            {test.length > 0 && (
                <span>
                    |<Link to={`/testPage/${test[0].test_id}`}>Test</Link>
                </span>
            )}
            <h1>Page d'accueil</h1>
            <TestForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
            />

            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                {test && test.length > 0 ? (
                    test.map((p) => (
                        <HomeCard
                            key={p.test_id}
                            test={p}
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
