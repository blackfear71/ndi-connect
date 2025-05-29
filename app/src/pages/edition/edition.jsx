import { useEffect, useState } from 'react';

import { Button } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

import EditionsService from '../../api/editionsService';

import { combineLatest, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

import './Edition.css';

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
            <Button
                variant="warning"
                href="/"
                className="d-inline-flex align-items-center gap-2"
            >
                <FaArrowLeft size={20} color="#000000" />
                Accueil
            </Button>

            {edition ? (
                <div>
                    <h1>
                        Edition {edition.year} - {edition.place}
                    </h1>
                </div>
            ) : (
                <div>Edition non trouvé</div>
            )}
        </div>
    );
};

export default Edition;
