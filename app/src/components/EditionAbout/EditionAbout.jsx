import { useContext, useEffect, useState } from 'react';

import { Badge, Button, ProgressBar } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { CgSandClock } from 'react-icons/cg';
import { FaFlagCheckered, FaScroll, FaTrashCan, FaWandMagicSparkles } from 'react-icons/fa6';
import { IoInformationCircleOutline } from 'react-icons/io5';

import EditionTextCard from '../../components/EditionTextCard/EditionTextCard';

import UserRole from '../../enums/UserRole';

import { AuthContext } from '../../utils/AuthContext';
import { getLocalizedDate, getLocalizedDuration, getLocalizedTime } from '../../utils/dateHelper';

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
    const [progress, setProgress] = useState({ value: 0, remaining: 0, isActive: false });

    /**
     * Mise à jour de l'avancement
     */
    useEffect(() => {
        // Mise à jour initiale de l'avancement
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

        let value = 0;
        let remaining = 0;
        const isActive = now >= startDate && now <= endDate;

        if (isActive) {
            const totalDuration = endDate.getTime() - startDate.getTime();
            const elapsed = now.getTime() - startDate.getTime();

            value = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            remaining = endDate - now;
        }

        setProgress({
            value: value,
            remaining: remaining,
            isActive: isActive
        });
    };

    /**
     * Prépare les lignes d'informations
     * @returns Liste de lignes
     */
    const getInformationsRows = () => [
        {
            label: t('edition.location'),
            value: edition.location
        },
        {
            label: t('edition.start'),
            value: t('edition.editionDate', {
                date: getLocalizedDate(edition.startDate),
                time: getLocalizedTime(edition.startDate)
            })
        },
        {
            label: t('edition.end'),
            value: t('edition.editionDate', {
                date: getLocalizedDate(edition.endDate),
                time: getLocalizedTime(edition.endDate)
            })
        }
    ];

    return (
        <>
            {/* Actions */}
            {auth.isLoggedIn && auth.level >= UserRole.SUPERADMIN && (
                <div className="d-flex gap-2 mb-2">
                    {/* Modifier */}
                    <Button variant="outline-action" onClick={() => onEdit('update')}>
                        <FaWandMagicSparkles size={15} />
                        {t('common.update')}
                    </Button>

                    {/* Supprimer */}
                    <Button variant="outline-action" className="btn-red" onClick={onConfirm}>
                        <FaTrashCan size={15} />
                        {t('common.delete')}
                    </Button>
                </div>
            )}

            {edition && (
                <>
                    {/* Progression */}
                    {progress && progress.isActive && (
                        <div className="edition-about-card mt-3">
                            <div className="edition-about-card-header p-2">
                                <div className="d-flex align-items-center gap-2 edition-about-card-title">
                                    <CgSandClock size={20} />
                                    {t('edition.progress')}
                                </div>
                                <span>{Math.round(progress.value)}%</span>
                            </div>

                            <div className="edition-about-card-body gap-2 p-2">
                                <div className="d-flex align-items-center mt-1">
                                    <Badge pill bg="success" className="me-2">
                                        {getLocalizedTime(edition.startDate)}
                                    </Badge>
                                    <div className="flex-fill">
                                        <ProgressBar now={progress.value} className="rounded-pill" />
                                    </div>
                                    <Badge pill bg="danger" className="ms-2">
                                        {getLocalizedTime(edition.endDate)}
                                    </Badge>
                                </div>
                                <div className="edition-about-card-progress-status">
                                    {t('edition.progressStatus', { remaining: getLocalizedDuration(progress.remaining) })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Informations */}
                    <div className="edition-about-card mt-3">
                        <div className="edition-about-card-header p-2">
                            <div className="d-flex align-items-center gap-2 edition-about-card-title">
                                <IoInformationCircleOutline size={22} />
                                {t('edition.informations')}
                            </div>
                        </div>

                        <div className="edition-about-card-body ps-2 pe-2">
                            {getInformationsRows().map(({ label, value }) => (
                                <div key={label} className="edition-about-card-line">
                                    <span className="edition-about-card-line-label">{label}</span>
                                    <span className="edition-about-card-line-value">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Thème */}
                    {edition.theme && <EditionTextCard title={t('edition.theme')} icon={<FaScroll size={18} />} text={edition.theme} />}

                    {/* Défi */}
                    {edition.challenge && (
                        <EditionTextCard title={t('edition.challenge')} icon={<FaFlagCheckered size={18} />} text={edition.challenge} />
                    )}
                </>
            )}
        </>
    );
};

export default EditionAbout;
