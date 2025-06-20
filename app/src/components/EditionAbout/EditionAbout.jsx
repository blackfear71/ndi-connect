import { useEffect, useState } from 'react';

import { Badge, Card, ProgressBar, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

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

    /**
     * Formate une date au format "JJ/MM/YYYY à HH:MM"
     * @param {*} dateInput
     */
    const formatDate = (dateInput) => {
        const date = new Date(dateInput);

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return t('edition.editionDate', { date: `${day}/${month}/${year}`, time: `${hours}:${minutes}` });
    };

    // TODO : compléter avec :
    // - thème/sujet des étudiants
    // - défi CGI

    return (
        <div style={{ color: 'white' }}>
            {/* Progression */}
            {progress.isActive && (
                <div className="mb-3">
                    <div>{t('edition.progress')}</div>
                    <div className="d-flex align-items-center mt-2">
                        <Badge bg="success" className="me-2">
                            {edition.startDate.split(' ')[1]?.slice(0, 5)}
                        </Badge>
                        <div className="flex-fill">
                            <ProgressBar now={progress.value} />
                        </div>
                        <Badge bg="danger" className="ms-2">
                            {edition.endDate.split(' ')[1]?.slice(0, 5)}
                        </Badge>
                    </div>
                </div>
            )}

            {/* Informations */}
            <Card className="edition-about-card">
                <Card.Body className="p-0">
                    <Card.Title className="bg-warning p-3 mb-0">{t('edition.informations')}</Card.Title>
                    <Card.Text>
                        <Table className="mb-0">
                            <tbody>
                                <tr>
                                    <td className="fw-bold">{t('edition.location')}</td>
                                    <td>{edition.location}</td>
                                </tr>
                                <tr>
                                    <td className="fw-bold">{t('edition.start')}</td>
                                    <td>{formatDate(edition.startDate)}</td>
                                </tr>
                                <tr>
                                    <td className="fw-bold">{t('edition.end')}</td>
                                    <td>{formatDate(edition.endDate)}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Card.Text>
                </Card.Body>
            </Card>

            {/* Thème */}
            <Card className="edition-about-card mt-3">
                <Card.Body className="p-0">
                    <Card.Title className="bg-info p-3 mb-0">{t('edition.theme')}</Card.Title>
                    <Card.Text className="p-2">TODO : thème</Card.Text>
                </Card.Body>
            </Card>

            {/* Défi */}
            <Card className="edition-about-card mt-3">
                <Card.Body className="p-0">
                    <Card.Title className="bg-danger p-3 mb-0">{t('edition.challenge')}</Card.Title>
                    <Card.Text className="p-2">TODO : défi</Card.Text>
                </Card.Body>
            </Card>
        </div>
    );
};

export default EditionAbout;
