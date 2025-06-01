import { useEffect, useState } from 'react';

import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

import EditionsService from '../../api/editionsService';

import Error from '../../components/Error/Error';

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

    // Traductions
    const { t } = useTranslation();

    // Local states
    const [error, setError] = useState('');

    // API states
    const [edition, setEdition] = useState();

    /**
     * Lancement initial de la page
     */
    useEffect(() => {
        const editionsService = new EditionsService();

        const subscriptionEdition = editionsService.getEdition(id);

        combineLatest([subscriptionEdition])
            .pipe(
                map(([dataEdition]) => {
                    setEdition(dataEdition.response);
                }),
                take(1),
                catchError((err) => {
                    setError(err?.response?.error);
                    return of();
                })
            )
            .subscribe();
    }, []);

    return (
        <div>
            {/* Retour */}
            <Button variant="warning" href="/" className="d-inline-flex align-items-center gap-2">
                <FaArrowLeft size={20} color="#000000" />
                {t('common.home')}
            </Button>

            {/* Edition */}
            {edition && (
                <div>
                    <h1>{t('edition.editionTitle', { year: edition.year, place: edition.place })}</h1>
                </div>
            )}

            {/* Erreur */}
            {error && <Error code={error} />}
        </div>
    );
};

export default Edition;
