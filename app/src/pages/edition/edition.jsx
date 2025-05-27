import { useEffect, useState } from 'react';

import { Link, useParams } from 'react-router-dom';

import EditionsService from '../../api/editionsService';

import { combineLatest, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

/**
 * Page détail édition
 * @returns
 */
const Edition = () => {
    // Params
    const { id } = useParams();

    // API states
    const [edition, setEdition] = useState();

    // Lancement initial de la page
    useEffect(() => {
        const editionsService = new EditionsService();

        const subscriptionEdition = editionsService.getEdition(id);

        combineLatest([subscriptionEdition])
            .pipe(
                map(([dataEdition]) => {
                    setEdition(dataEdition.response);
                }),
                take(1),
                catchError(() => {
                    return of();
                }),
            )
            .subscribe();
    }, []);

    return (
        <div>
            <Link to="/">Accueil</Link>
            <h1>Page d'une édition</h1>
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                {edition ? (
                    <div>
                        {edition.year} - {edition.place}
                    </div>
                ) : (
                    <div>Enregistrement non trouvé</div>
                )}
            </div>
        </div>
    );
};

export default Edition;
