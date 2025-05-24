import { useEffect, useState } from 'react';

import { Link, useParams } from 'react-router-dom';

import EditionsService from '../../api/editionsService';

import HomeCard from '../../components/homeCard/homeCard';

import { combineLatest, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

const Edition = () => {
    const { id } = useParams();

    const [edition, setEdition] = useState();

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
            <Link to="/">Accueil</Link>|
            {edition && <Link to={`/edition/${id}`}>Edition</Link>}
            <h1>Page d'une édition'</h1>
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                {edition ? (
                    <HomeCard key={edition.id} edition={edition} />
                ) : (
                    <div>Enregistrement non trouvé</div>
                )}
            </div>
        </div>
    );
};
export default Edition;
