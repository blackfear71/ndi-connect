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
                <div className="edition-about-progress mb-3">
                    <div>{t('edition.progress')}</div>
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
            <Card className="edition-about-card">
                <Card.Body className="p-0">
                    <Card.Title className="bg-warning p-3 mb-0 text-white">{t('edition.informations')}</Card.Title>
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
                </Card.Body>
            </Card>

            {/* Thème */}
            {edition.theme && (
                <Card className="edition-about-card mt-3">
                    <Card.Body className="p-0">
                        <Card.Title className="bg-success p-3 mb-0 text-white">{t('edition.theme')}</Card.Title>
                        <Card.Text className="p-2">{edition.theme}</Card.Text>
                    </Card.Body>
                </Card>
            )}

            {/* Défi */}
            {edition.challenge && (
                <Card className="edition-about-card mt-3">
                    <Card.Body className="p-0">
                        <Card.Title className="bg-danger p-3 mb-0 text-white">{t('edition.challenge')}</Card.Title>
                        <Card.Text className="p-2">{edition.challenge}</Card.Text>
                    </Card.Body>
                </Card>
            )}
        </>
    );
};

export default EditionAbout;
