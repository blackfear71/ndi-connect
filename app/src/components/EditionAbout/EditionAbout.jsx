import { useEffect, useState } from 'react';

import { Badge, Card, ProgressBar, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { getFrenchDate, getTimeFromDate } from '../../utils/dateHelper';

import './EditionAbout.css';

/**
 * A propos
 */
const EditionAbout = ({ edition }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [progress, setProgress] = useState({ value: 0, isActive: false });

    /**
     * Mise à jour de l'avancement
     */
    useEffect(() => {
        // Mise à jour intiale de l'avancement
        updateProgress();

        // Mise à jour toutes les 60 secondes
        const interval = setInterval(updateProgress, 60 * 1000);

        // Nettoyage à la destruction
        return () => clearInterval(interval);
    }, [edition.startDate, edition.endDate]);

    /**
     * Met à jour l'avancement
     */
    const updateProgress = () => {
        const now = new Date();
        const startDate = new Date(edition.startDate);
        const endDate = new Date(edition.endDate);
        const isActive = now >= startDate && now <= endDate;
        let value = 0;

        if (isActive) {
            const totalDuration = endDate.getTime() - startDate.getTime();
            const elapsed = now.getTime() - startDate.getTime();

            value = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        }

        setProgress({
            value: value,
            isActive: isActive
        });
    };

    return (
        <>
            {/* Progression */}
            {progress.isActive && (
                <div className="mb-3">
                    <div className="edition-about-title">{t('edition.progress')}</div>
                    <div className="d-flex align-items-center mt-2">
                        <Badge bg="success" className="me-2">
                            {getTimeFromDate(edition.startDate)}
                        </Badge>
                        <div className="flex-fill">
                            <ProgressBar now={progress.value} />
                        </div>
                        <Badge bg="danger" className="ms-2">
                            {getTimeFromDate(edition.endDate)}
                        </Badge>
                    </div>
                </div>
            )}

            {/* Informations */}
            <div className="edition-about-title">{t('edition.informations')}</div>
            <div className="edition-about-table mt-2">
                <Table className="mb-0">
                    <tbody>
                        <tr>
                            <td className="fw-bold">{t('edition.location')}</td>
                            <td>{edition.location}</td>
                        </tr>
                        <tr>
                            <td className="fw-bold">{t('edition.start')}</td>
                            <td>
                                {t('edition.editionDate', {
                                    date: getFrenchDate(edition.startDate),
                                    time: getTimeFromDate(edition.startDate)
                                })}
                            </td>
                        </tr>
                        <tr>
                            <td className="fw-bold">{t('edition.end')}</td>
                            <td>
                                {t('edition.editionDate', {
                                    date: getFrenchDate(edition.endDate),
                                    time: getTimeFromDate(edition.endDate)
                                })}
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </div>

            {/* Thème */}
            {edition.theme && (
                <div className="mt-3">
                    <div className="edition-about-title">{t('edition.theme')}</div>
                    <div className="edition-about-text">{edition.theme}</div>
                </div>
            )}

            {/* Défi */}
            {edition.challenge && (
                <div className="mt-3">
                    <div className="edition-about-title mt-3">{t('edition.challenge')}</div>
                    <div className="edition-about-text">{edition.challenge}</div>
                </div>
            )}
        </>
    );
};

export default EditionAbout;
