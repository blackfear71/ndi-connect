import { useTranslation } from 'react-i18next';

import { QRCodeSVG } from 'qrcode.react';
import { Button, Modal } from 'react-bootstrap';
import { LuQrCode } from 'react-icons/lu';

import ndiConnectLogo from '../../../assets/images/ndi-connect.webp';

/**
 * Modale QR code
 */
const QrCodeModal = ({ url, onClose, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    return (
        <Modal show onHide={onClose} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    <LuQrCode />
                    {t('edition.qrCode')}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="d-flex justify-content-center">
                {/* QR Code */}
                <div className="p-2 modal-group">
                    <div className="d-flex align-items-center gap-2 modal-group-content">
                        <QRCodeSVG
                            className="p-3 edition-qr-code"
                            value={url}
                            size={200}
                            level="Q"
                            fgColor="#07224c"
                            imageSettings={{
                                src: ndiConnectLogo,
                                width: 40,
                                height: 40,
                                excavate: true
                            }}
                        />
                        {/* TODO : pour les cartes afficher l'url et un bouton de téléchargement à la place du message */}
                        <div className="edition-qr-code-text">{t('edition.scanMe')}</div>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                {/* Boutons d'action */}
                <div className="gap-2 modal-footer-actions">
                    <Button type="button" variant="outline-text-action" onClick={() => onClose()} disabled={isSubmitting}>
                        {t('common.close')}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default QrCodeModal;
