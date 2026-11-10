import { useTranslation } from 'react-i18next';

import { Badge, Button, Form } from 'react-bootstrap';
import { FaComputer, FaFileZipper } from 'react-icons/fa6';
import { PiHashBold } from 'react-icons/pi';

import { IncrementInput, SelectInput } from '../../../components/inputs';
import { SpinnerButton } from '../../../components/shared';

import { MAX_QR_CODES_COUNT } from '../../../utils/helpers/cardHelper';

import QrCodeList from './QrCodeList/QrCodeList';

/**
 * Génération des QR codes
 */
const QrCodesGeneration = ({ formData, editions, generatedItems, onOpenQrCode, onDownload, onDownloadAll, onReset, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    /**
     * Met à jour le formulaire à la sélection d'une édition
     * @param {*} e Evènement
     */
    const handleChangeEdition = (e) => {
        formData.setValues((prev) => ({
            ...prev,
            editionId: e.target.value === '' ? '' : Number.parseInt(e.target.value)
        }));
    };

    /**
     * Met à jour le nombre de QR codes (entre 0 et le maximum autorisé)
     * @param {*} step Incrément (positif ou négatif)
     */
    const handleChangeQrCodesCount = (step) => {
        formData.setValues((prev) => ({
            ...prev,
            qrCodesCount: Math.min(MAX_QR_CODES_COUNT, Math.max(0, (Number.parseInt(prev.qrCodesCount) || 0) + step))
        }));
    };

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

    return (
        <>
            {editions.length > 0 ? (
                <>
                    {/* Formulaire */}
                    <Form onSubmit={formData.handleSubmit}>
                        <fieldset disabled={isSubmitting}>
                            <div className="p-3 qrcodes-form">
                                {/* Edition */}
                                <SelectInput
                                    title={t('qrCodes.edition')}
                                    icon={<FaComputer />}
                                    name="editionId"
                                    defaultOption={{ key: 0, value: '', label: t('qrCodes.chooseEdition') }}
                                    options={getEditionOptions()}
                                    value={formData.values.editionId}
                                    onChange={handleChangeEdition}
                                    error={formData.submitCount > 0 && formData.errors.editionId}
                                    required={true}
                                />

                                {/* Nombre de QR codes */}
                                <IncrementInput
                                    title={t('qrCodes.count')}
                                    icon={<PiHashBold />}
                                    name="qrCodesCount"
                                    value={formData.values.qrCodesCount}
                                    onChangeDown={() => handleChangeQrCodesCount(-1)}
                                    onChangeUp={() => handleChangeQrCodesCount(1)}
                                    error={formData.submitCount > 0 && formData.errors.qrCodesCount}
                                    required={true}
                                />

                                {/* Bouton d'action */}
                                <div className="d-flex justify-content-end gap-2">
                                    <Button type="button" variant="outline-text-action" onClick={onReset}>
                                        {t('common.reset')}
                                    </Button>

                                    <SpinnerButton label={t('qrCodes.generate')} isSubmitting={isSubmitting} />
                                </div>
                            </div>
                        </fieldset>
                    </Form>

                    {/* QR codes générés */}
                    {generatedItems.length > 0 && (
                        <>
                            {/* Titre et export global */}
                            <div className="d-flex mt-3 mb-2">
                                <Badge pill bg="warning" className="edition-subtitle-badge">
                                    {t('qrCodes.generatedCodes')}
                                </Badge>
                            </div>

                            <div className="d-grid">
                                <Button variant="outline-action" onClick={onDownloadAll} disabled={isSubmitting}>
                                    <FaFileZipper size={18} />
                                    {t('qrCodes.downloadAll')}
                                </Button>
                            </div>

                            {/* Liste */}
                            <QrCodeList
                                items={generatedItems}
                                onOpenQrCode={onOpenQrCode}
                                onDownload={onDownload}
                                isSubmitting={isSubmitting}
                            />
                        </>
                    )}
                </>
            ) : (
                <div className="px-2 py-3 mt-3 page-empty">{t('qrCodes.noEditions')}</div>
            )}
        </>
    );
};

export default QrCodesGeneration;
