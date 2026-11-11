import { useTranslation } from 'react-i18next';

import { QRCodeSVG } from 'qrcode.react';
import { Button, Modal } from 'react-bootstrap';
import { LuQrCode } from 'react-icons/lu';

import ndiConnectLogo from '../../../assets/images/ndi-connect.webp';

import { Message } from '../../../components/shared';

import './QrCodeModal.css';

/**
 * Modale QR code
 */
const QrCodeModal = ({ modalOptions, setModalOptions, onAction, onClose, isSubmitting }) => {
    // Traductions
    const { t } = useTranslation();

    // Constantes
    const hasAction = !!modalOptions.action;
    const hasTexts = !!(modalOptions.text1 || modalOptions.text2);

    /**
     * Définit le message affiché
     * @param {*} message Message à afficher
     */
    const setModalMessage = (message) => {
        setModalOptions((prev) => ({ ...prev, message: message }));
    };

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
                    <div className="d-flex flex-column align-items-center gap-3 modal-group-content">
                        <QRCodeSVG
                            className="p-3 qr-code-modal-code"
                            value={modalOptions.url}
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

                        {/* Bouton d'action */}
                        {hasAction && (
                            <Button
                                variant="filled-text-action"
                                className="d-flex align-items-center gap-2"
                                onClick={() => onAction(modalOptions.action.data)}
                                disabled={isSubmitting}
                            >
                                {modalOptions.action.icon}
                                {modalOptions.action.label}
                            </Button>
                        )}

                        {/* Textes */}
                        {hasTexts && (
                            <div className="d-flex flex-column align-items-center">
                                {modalOptions.text1 && <div className="qr-code-modal-text1">{modalOptions.text1}</div>}
                                {modalOptions.text2 && <div className="qr-code-modal-text2">{modalOptions.text2}</div>}
                            </div>
                        )}

                        {/* Texte par défaut */}
                        {!hasAction && !hasTexts && <div className="qr-code-modal-text">{t('edition.scanMe')}</div>}
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                {/* Message */}
                {modalOptions.message && (
                    <div className="modal-message">
                        <Message
                            code={modalOptions.message.code}
                            params={modalOptions.message.params}
                            type={modalOptions.message.type}
                            inline={true}
                            setMessage={setModalMessage}
                        />
                    </div>
                )}

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
