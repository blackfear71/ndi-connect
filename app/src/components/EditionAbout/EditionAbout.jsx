import { useContext, useEffect, useState } from 'react';

import { Badge, Button, ProgressBar, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaTrashCan, FaWandMagicSparkles } from 'react-icons/fa6';

import UserRole from '../../enums/UserRole';

import { AuthContext } from '../../utils/AuthContext';
import { getLocalizedDate, getLocalizedTime } from '../../utils/dateHelper';

import './EditionAbout.css';

/**
 * A propos
 */
const EditionAbout = ({ edition, onEdit, onConfirm }) => {
    // Contexte
    const { auth } = useContext(AuthContext);

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
    }, [edition?.startDate, edition?.endDate]);

    /**
     * Met à jour l'avancement
     */
    const updateProgress = () => {
        if (!edition || !edition.startDate || !edition.endDate) {
            return;
        }

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
            {/* Actions */}
            {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && (
                <div className="d-flex gap-2 mb-2">
                    {/* Modifier */}
                    <Button
                        variant="outline-action"
                        className="d-flex align-items-center justify-content-center gap-2 w-100"
                        onClick={() => onEdit('update')}
                    >
                        <FaWandMagicSparkles size={15} />
                        {t('common.update')}
                    </Button>

                    {/* Supprimer */}
                    <Button
                        variant="outline-action"
                        className="d-flex align-items-center justify-content-center gap-2 w-100 btn-red"
                        onClick={onConfirm}
                    >
                        <FaTrashCan size={15} />
                        {t('common.delete')}
                    </Button>
                </div>
            )}

            {edition && (
                <>
                    {/* Progression */}
                    {progress.isActive && (
                        <div className="mb-3">
                            <div className="edition-about-title">{t('edition.progress')}</div>
                            <div className="d-flex align-items-center mt-2">
                                <Badge pill bg="success" className="me-2">
                                    {getLocalizedTime(edition.startDate)}
                                </Badge>
                                <div className="flex-fill">
                                    <ProgressBar now={progress.value} />
                                </div>
                                <Badge pill bg="danger" className="ms-2">
                                    {getLocalizedTime(edition.endDate)}
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
                                            date: getLocalizedDate(edition.startDate),
                                            time: getLocalizedTime(edition.startDate)
                                        })}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="fw-bold">{t('edition.end')}</td>
                                    <td>
                                        {t('edition.editionDate', {
                                            date: getLocalizedDate(edition.endDate),
                                            time: getLocalizedTime(edition.endDate)
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
            )}
        </>
    );
};

export default EditionAbout;
