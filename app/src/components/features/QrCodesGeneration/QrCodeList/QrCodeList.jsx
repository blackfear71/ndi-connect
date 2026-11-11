import { useTranslation } from 'react-i18next';

import { FaDownload } from 'react-icons/fa6';
import { LuQrCode } from 'react-icons/lu';
import { MdHttp } from 'react-icons/md';

import { TooltipButton } from '../../../../components/shared';

/**
 * Liste des QR codes générés
 */
const QrCodeList = ({ items, onOpenQrCode, onDownload, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <>
            {/* Liste */}
            {items?.map((item) => (
                <div key={item.code} className="d-flex align-items-center gap-2 p-2 mt-2 qrcodes-item">
                    {/* Icône */}
                    <div className="d-flex align-items-center justify-content-center qrcodes-item-icon">
                        <MdHttp size={28} />
                    </div>

                    {/* URL */}
                    <div className="d-flex flex-column flex-grow-1 qrcodes-item-name">
                        <span className="qrcodes-item-ellipsis-text" title={item.url}>
                            {item.url}
                        </span>
                    </div>

                    {/* Visualisation */}
                    <TooltipButton
                        tooltip={t('qrCodes.show')}
                        content={<LuQrCode color={isSubmitting ? 'gray' : 'white'} />}
                        className="qrcodes-item-button"
                        onClick={() => onOpenQrCode(item)}
                        isSubmitting={isSubmitting}
                    />

                    {/* Téléchargement */}
                    <TooltipButton
                        tooltip={t('qrCodes.download')}
                        content={<FaDownload color={isSubmitting ? 'gray' : 'white'} />}
                        className="qrcodes-item-button"
                        onClick={() => onDownload(item)}
                        isSubmitting={isSubmitting}
                    />
                </div>
            ))}
        </>
    );
};

export default QrCodeList;
