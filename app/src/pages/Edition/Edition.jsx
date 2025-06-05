import { useEffect, useState } from 'react';

import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

import EditionsService from '../../api/editionsService';

import Message from '../../components/Message/Message';

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
    const [message, setMessage] = useState(null);

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
                    setEdition(dataEdition.response.data);
                }),
                take(1),
                catchError((err) => {
                    setMessage({ code: err?.response?.message, type: err?.response?.status });
                    return of();
                })
            )
            .subscribe();
    }, []);

    return (
        <div>
            {/* Message */}
            {message && <Message code={message.code} type={message.type} setMessage={setMessage} />}

            {/* Retour */}
            <Button variant="warning" href="/" className="d-inline-flex align-items-center gap-2">
                <FaArrowLeft size={20} color="#000000" />
                {t('common.home')}
            </Button>

            {/* Titre */}
            {edition && (
                <div>
                    <h1>{t('edition.editionTitle', { year: edition.year, place: edition.place })}</h1>
                </div>
            )}
        </div>
    );
};

export default Edition;
