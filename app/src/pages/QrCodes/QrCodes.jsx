import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { combineLatest, of, switchMap } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { Spinner, Tab, Tabs } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa6';
import { LuQrCode } from 'react-icons/lu';

import { QrCodesGeneration, QrCodesManagement } from '../../components/features';
import { ConfirmModal, QrCodeModal } from '../../components/modals';
import { Message } from '../../components/shared';

import { useAuth } from '../../utils/context/AuthContext';
import { generateCardCodes, getCardUrl, MAX_QR_CODES_COUNT } from '../../utils/helpers/cardHelper';
import { downloadQrCode, downloadQrCodesZip, getQrCodesFileName } from '../../utils/helpers/qrCodeHelper';

import { EnumMessageType } from '../../enums';

import { CardsService, EditionsService } from '../../api';

import './QrCodes.css';

// Valeurs initiales des formulaires
const initialQrCodesGenerationValues = {
    editionId: '',
    qrCodesCount: 0
};

/**
 * Page génération et gestion des QR codes
 */
const QrCodes = () => {
    // Router
    const navigate = useNavigate();

    // Contexte
    const { auth, rights, authMessage, refreshAuth, setAuthMessage, skipAutoRedirectRef } = useAuth();

    // Traductions
    const { t } = useTranslation();

    // Local states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [modalOptionsConfirm, setModalOptionsConfirm] = useState({
        content: '',
        action: null,
        data: null,
        isOpen: false,
        message: null
    });
    const [modalOptionsQrCode, setModalOptionsQrCode] = useState({
        url: null,
        text1: null,
        text2: null,
        action: null,
        isOpen: false,
        message: null
    });
    const [qrCodesGeneration, setQrCodesGeneration] = useState({
        edition: null,
        items: []
    });

    // API states
    const [editions, setEditions] = useState([]);
    const [cards, setCards] = useState([]);

    // Constantes
    const generationEditions = editions
        .filter((e) => new Date(e.endDate) >= new Date())
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate) || a.location.localeCompare(b.location));
    const managementEditions = [...editions].sort(
        (a, b) => new Date(b.startDate) - new Date(a.startDate) || a.location.localeCompare(b.location)
    );

    /**
     * Schéma de validation Yup de la génération
     */
    const qrCodesGenerationValidationSchema = useMemo(() => {
        return Yup.object({
            editionId: Yup.number().typeError('errors.invalidEdition').required('errors.invalidEdition'),
            qrCodesCount: Yup.number()
                .typeError('errors.invalidCardCount')
                .required('errors.invalidCardCount')
                .integer('errors.invalidCardCount')
                .min(1, 'errors.invalidCardCount')
                .max(MAX_QR_CODES_COUNT, 'errors.invalidCardCount')
        });
    }, []);

    /**
     * Formik génération
     */
    const formGeneration = useFormik({
        initialValues: initialQrCodesGenerationValues,
        validationSchema: qrCodesGenerationValidationSchema,
        onSubmit: (values) => handleSubmitQrCodesGeneration(values)
    });

    /**
     * Lancement initial de la page
     */
    useEffect(() => {
        // Rafraichissement du contexte d'authentification si l'utilisateur s'est déconnecté ailleurs
        refreshAuth(false);
    }, []);

    /**
     * Récupération des données après contrôle de l'authentification
     */
    useEffect(() => {
        // Redirection vers l'accueil si non autorisé (en évitant la navigation concurrente à la déconnexion)
        if (!auth?.isLoggedIn) {
            if (skipAutoRedirectRef.current) {
                skipAutoRedirectRef.current = false;
            } else {
                navigate('/');
            }

            return;
        }

        // Récupération des éditions et cartes existantes
        if (rights.isAdminOrSuperAdmin) {
            const editionsService = new EditionsService();
            const cardsService = new CardsService();

            const subscriptionEditions = editionsService.getAllEditions();
            const subscriptionCards = rights.isSuperAdmin ? cardsService.getAllCards() : of(null);

            // Les QR codes enregistrés ne sont gérés que par les super administrateurs
            combineLatest([subscriptionEditions, subscriptionCards])
                .pipe(
                    map(([dataEditions, dataCards]) => {
                        setEditions(dataEditions.response.data);
                        setCards(dataCards?.response?.data ?? []);
                    }),
                    take(1),
                    catchError((err) => {
                        setMessage({ code: err?.response?.message, type: err?.response?.status });
                        return of();
                    }),
                    finalize(() => {
                        setIsLoading(false);
                    })
                )
                .subscribe();
        }
    }, [auth]);

    /**
     * Si un message d'authentification est défini on l'affiche
     */
    useEffect(() => {
        // Message venant du AuthContext (connexion / déconnexion)
        if (authMessage) {
            setMessage(authMessage);
            setAuthMessage(null);
        }
    }, [authMessage, setAuthMessage]);

    /**
     * Ouverture/fermeture de la modale du QR Code
     * @param {*} url URL encodée dans le QR code
     * @param {*} text1 Texte principal affiché sous le QR code
     * @param {*} text2 Texte secondaire affiché sous le texte principal
     * @param {*} action Bouton d'action { icon, label, data } affiché sous le QR code (data est transmis à onAction au clic)
     */
    const openCloseQrCodeModal = (url = null, text1 = null, text2 = null, action = null) => {
        // Ouverture ou fermeture
        setModalOptionsQrCode((prev) => ({
            url: url,
            text1: text1,
            text2: text2,
            action: action,
            isOpen: !prev.isOpen,
            message: null
        }));
    };

    /**
     * Ouverture de la modale du QR code d'une carte générée (avec un bouton de téléchargement)
     * @param {*} item QR code (code et url)
     */
    const handleOpenQrCode = (item) => {
        openCloseQrCodeModal(item.url, null, null, {
            icon: <FaDownload size={18} />,
            label: t('qrCodes.download'),
            data: item
        });
    };

    /**
     * Génération des QR codes (sans enregistrement en base)
     * @param {*} values Données du formulaire
     */
    const handleSubmitQrCodesGeneration = (values) => {
        setMessage(null);

        const edition = generationEditions.find((e) => e.id === values.editionId);

        if (!edition) {
            return;
        }

        setQrCodesGeneration({
            edition: edition,
            items: generateCardCodes(Number(values.qrCodesCount)).map((code) => ({ code, url: getCardUrl(edition.id, code) }))
        });
    };

    /**
     * Réinitialisation du formulaire et suppression des QR codes générés
     */
    const handleResetGeneration = () => {
        setMessage(null);
        formGeneration.resetForm();
        setQrCodesGeneration({ edition: null, items: [] });
    };

    /**
     * Téléchargement de l'image d'un QR code
     * @param {*} item QR code (code et url)
     */
    const handleDownload = (item) => {
        // Réinitialisation du message de la modale (si elle est ouverte) ou de la page
        modalOptionsQrCode.isOpen ? setModalOptionsQrCode((prev) => ({ ...prev, message: null })) : setMessage(null);

        setIsSubmitting(true);

        downloadQrCode(item)
            .catch(() => {
                // Message d'erreur dans la modale (si elle est ouverte) ou sur la page
                const errorMessage = { code: 'errors.qrCodeExportFailed', type: EnumMessageType.ERROR };

                modalOptionsQrCode.isOpen
                    ? setModalOptionsQrCode((prev) => ({ ...prev, message: errorMessage }))
                    : setMessage(errorMessage);
            })
            .finally(() => setIsSubmitting(false));
    };

    /**
     * Téléchargement des images de tous les QR codes générés dans une archive ZIP
     */
    const handleDownloadAll = () => {
        setMessage(null);
        setIsSubmitting(true);

        const zipName = getQrCodesFileName(new Date(qrCodesGeneration.edition.startDate).getFullYear(), qrCodesGeneration.edition.location);

        downloadQrCodesZip(qrCodesGeneration.items, zipName)
            .catch(() => setMessage({ code: 'errors.qrCodesExportFailed', type: EnumMessageType.ERROR }))
            .finally(() => setIsSubmitting(false));
    };

    /**
     * Ouverture/fermeture de la modale de confirmation
     * @param {*} confirmOptions Données modale de confirmation
     */
    const openCloseConfirmModal = (confirmOptions) => {
        // Ouverture ou fermeture
        if (confirmOptions) {
            setModalOptionsConfirm({
                content: confirmOptions.content,
                action: confirmOptions.action,
                data: confirmOptions.data,
                isOpen: !modalOptionsConfirm.isOpen,
                message: null
            });
        } else {
            setModalOptionsConfirm({
                content: '',
                action: null,
                data: null,
                isOpen: false,
                message: null
            });
        }
    };

    /**
     * Méthode centralisée d'action à la confirmation
     */
    const handleConfirmAction = () => {
        switch (modalOptionsConfirm?.action) {
            case 'deleteCard':
                return handleDeleteCard(modalOptionsConfirm.data);
            default:
                return;
        }
    };

    /**
     * Suppression d'une carte enregistrée
     * @param {*} cardId Identifiant carte
     */
    const handleDeleteCard = (cardId) => {
        setMessage(null);
        setIsSubmitting(true);
        setModalOptionsConfirm((prev) => ({ ...prev, message: null }));

        const cardsService = new CardsService();

        cardsService
            .deleteCard(cardId)
            .pipe(
                map((dataCard) => {
                    setMessage({ code: dataCard.response.message, type: dataCard.response.status });
                }),
                switchMap(() => cardsService.getAllCards()),
                map((dataCards) => {
                    openCloseConfirmModal();
                    setCards(dataCards.response.data);
                }),
                take(1),
                catchError((err) => {
                    setModalOptionsConfirm((prev) => ({
                        ...prev,
                        message: { code: err?.response?.message, type: err?.response?.status }
                    }));
                    return of();
                }),
                finalize(() => {
                    setIsSubmitting(false);
                })
            )
            .subscribe();
    };

    return (
        <>
            {isLoading ? (
                <div className="d-flex align-items-center justify-content-center layout-spinner-centered">
                    <Spinner animation="border" role="status" variant="light" />
                </div>
            ) : (
                <>
                    {/* Message */}
                    {message && <Message code={message.code} params={message.params} type={message.type} setMessage={setMessage} />}

                    {rights.isAdminOrSuperAdmin && (
                        <>
                            {/* Titre */}
                            <h1 className="d-flex align-items-center gap-2">
                                <LuQrCode size={30} />
                                {t('qrCodes.qrCodesTitle')}
                            </h1>

                            {/* Génération et gestion */}
                            {rights.isSuperAdmin ? (
                                <Tabs
                                    variant="underline"
                                    defaultActiveKey="generation"
                                    id="qrcodes-tabs"
                                    className="mb-3 page-tabs"
                                    justify
                                >
                                    {/* Génération QR codes */}
                                    <Tab eventKey="generation" title={t('qrCodes.generation')}>
                                        <QrCodesGeneration
                                            formData={formGeneration}
                                            editions={generationEditions}
                                            generatedItems={qrCodesGeneration.items}
                                            onOpenQrCode={handleOpenQrCode}
                                            onDownload={handleDownload}
                                            onDownloadAll={handleDownloadAll}
                                            onReset={handleResetGeneration}
                                            isSubmitting={isSubmitting}
                                        />
                                    </Tab>

                                    {/* Cartes enregistrées */}
                                    <Tab eventKey="management" title={t('qrCodes.management')}>
                                        <QrCodesManagement
                                            editions={managementEditions}
                                            cards={cards}
                                            onConfirm={openCloseConfirmModal}
                                            isSubmitting={isSubmitting}
                                        />
                                    </Tab>
                                </Tabs>
                            ) : (
                                <>
                                    {/* Génération QR codes */}
                                    <QrCodesGeneration
                                        formData={formGeneration}
                                        editions={generationEditions}
                                        generatedItems={qrCodesGeneration.items}
                                        onOpenQrCode={handleOpenQrCode}
                                        onDownload={handleDownload}
                                        onDownloadAll={handleDownloadAll}
                                        onReset={handleResetGeneration}
                                        isSubmitting={isSubmitting}
                                    />
                                </>
                            )}
                        </>
                    )}

                    {/* Modale de confirmation */}
                    {rights.isSuperAdmin && modalOptionsConfirm.isOpen && (
                        <ConfirmModal
                            modalOptions={modalOptionsConfirm}
                            setModalOptions={setModalOptionsConfirm}
                            onClose={openCloseConfirmModal}
                            onConfirmAction={handleConfirmAction}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {/* Modale QR Code */}
                    {modalOptionsQrCode.isOpen && (
                        <QrCodeModal
                            modalOptions={modalOptionsQrCode}
                            setModalOptions={setModalOptionsQrCode}
                            onAction={handleDownload}
                            onClose={() => openCloseQrCodeModal()}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default QrCodes;
