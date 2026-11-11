import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FaComputer } from 'react-icons/fa6';

import { SelectInput } from '../../../components/inputs';

import CardList from './CardList/CardList';

/**
 * Gestion des QR codes enregistrés
 */
const QrCodesManagement = ({ editions, cards, onConfirm, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Local states
    const [editionId, setEditionId] = useState('');

    // Constantes
    const edition = editions.find((e) => e.id === editionId);
    const editionCards = cards
        .filter((c) => c.editionId === editionId)
        .sort((a, b) => a.playerName.localeCompare(b.playerName) || a.code.localeCompare(b.code));

    /**
     * Renvoie une liste d'éditions sélectionnables
     */
    const getEditionOptions = () => {
        return editions.map((e) => ({
            key: e.id,
            value: e.id,
            label: t('edition.editionTitle', { year: new Date(e.startDate).getFullYear(), location: e.location })
        }));
    };

    /**
     * Met à jour la liste ddes cartes d'une édition
     * @param {*} e Evènement
     */
    const handleChangeEdition = (e) => {
        setEditionId(e.target.value === '' ? '' : Number.parseInt(e.target.value));
    };

    return (
        <>
            {editions.length > 0 ? (
                <>
                    {/* Edition */}
                    <div className="p-3 qrcodes-form" data-bs-theme="dark">
                        <SelectInput
                            title={t('qrCodes.edition')}
                            icon={<FaComputer />}
                            name="cardsEditionId"
                            defaultOption={{ key: 0, value: '', label: t('qrCodes.chooseEdition') }}
                            options={getEditionOptions()}
                            value={editionId}
                            onChange={(e) => handleChangeEdition(e)}
                        />
                    </div>

                    {/* Liste */}
                    {editionId !== '' &&
                        (editionCards.length > 0 ? (
                            <CardList edition={edition} cards={editionCards} onConfirm={onConfirm} isSubmitting={isSubmitting} />
                        ) : (
                            <div className="px-2 py-3 mt-3 page-empty">{t('qrCodes.noCards')}</div>
                        ))}
                </>
            ) : (
                <div className="px-2 py-3 mt-3 page-empty">{t('qrCodes.noEditions')}</div>
            )}
        </>
    );
};

export default QrCodesManagement;
