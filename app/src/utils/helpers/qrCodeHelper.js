import { createElement } from 'react';

import { QRCodeSVG } from 'qrcode.react';

import ndiConnectLogo from '../../assets/images/ndi-connect.webp';

import { REGEX_DIACRITICS, REGEX_EDGE_DASHES, REGEX_NON_ALPHANUMERIC } from './regexHelper';

// Rendu des QR codes exportés (identique à celui de la modale QR Code)
const QR_CODE_EXPORT_SIZE = 1024;
const QR_CODE_LOGO_SIZE = 205; // ~20% de la largeur, compatible avec le niveau de correction Q
const QR_CODE_MARGIN = 4; // En modules, zone blanche nécessaire à la lecture
const QR_CODE_COLOR = '#07224c';
const QR_CODE_BACKGROUND = '#ffffff';

let logoPromise = null;

/**
 * Charge une image
 * @param {*} src Source de l'image
 * @returns Image chargée
 */
const loadImage = (src) =>
    new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });

/**
 * Récupère le logo en data URL (un SVG chargé comme image ne peut pas référencer de ressource externe)
 * @returns Logo en data URL
 */
const getLogoDataUrl = () => {
    if (!logoPromise) {
        logoPromise = loadImage(ndiConnectLogo)
            .then((image) => {
                const canvas = document.createElement('canvas');
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                canvas.getContext('2d').drawImage(image, 0, 0);

                return canvas.toDataURL('image/png');
            })
            .catch((err) => {
                // Nouvelle tentative possible au prochain appel
                logoPromise = null;
                throw err;
            });
    }

    return logoPromise;
};

/**
 * Crée l'image PNG d'un QR code
 * @param {*} url URL encodée dans le QR code
 * @returns Image PNG
 */
export const createQrCodeBlob = async (url) => {
    // Chargement différé : ces librairies ne servent qu'à l'export
    const [{ renderToStaticMarkup }, logo] = await Promise.all([import('react-dom/server'), getLogoDataUrl()]);

    const svg = renderToStaticMarkup(
        createElement(QRCodeSVG, {
            value: url,
            size: QR_CODE_EXPORT_SIZE,
            level: 'Q',
            marginSize: QR_CODE_MARGIN,
            fgColor: QR_CODE_COLOR,
            bgColor: QR_CODE_BACKGROUND,
            imageSettings: {
                src: logo,
                width: QR_CODE_LOGO_SIZE,
                height: QR_CODE_LOGO_SIZE,
                excavate: true
            }
        })
    );

    // Un SVG chargé comme image doit déclarer son espace de noms
    const svgWithNamespace = svg.includes('xmlns=') ? svg : svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    const image = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgWithNamespace)}`);

    // Dessin sur un fond blanc pour un PNG sans transparence
    const canvas = document.createElement('canvas');
    canvas.width = QR_CODE_EXPORT_SIZE;
    canvas.height = QR_CODE_EXPORT_SIZE;

    const context = canvas.getContext('2d');

    context.fillStyle = QR_CODE_BACKGROUND;
    context.fillRect(0, 0, QR_CODE_EXPORT_SIZE, QR_CODE_EXPORT_SIZE);
    context.drawImage(image, 0, 0, QR_CODE_EXPORT_SIZE, QR_CODE_EXPORT_SIZE);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('QR code PNG creation failed'))), 'image/png');
    });
};

/**
 * Télécharge un fichier
 * @param {*} blob Contenu du fichier
 * @param {*} fileName Nom du fichier
 */
export const downloadBlob = (blob, fileName) => {
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    // Libération différée pour laisser le temps au navigateur de lancer le téléchargement
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

/**
 * Télécharge l'image PNG d'un QR code
 * @param {*} item QR code (code et url)
 */
export const downloadQrCode = async (item) => {
    downloadBlob(await createQrCodeBlob(item.url), `${item.code}.png`);
};

/**
 * Télécharge les images PNG de plusieurs QR codes dans une archive ZIP
 * @param {*} items QR codes (code et url)
 * @param {*} zipName Nom de l'archive (sans extension)
 */
export const downloadQrCodesZip = async (items, zipName) => {
    const { default: JSZip } = await import('jszip');

    const zip = new JSZip();

    // Génération séquentielle pour limiter la mémoire utilisée
    for (const item of items) {
        zip.file(`${item.code}.png`, await createQrCodeBlob(item.url));
    }

    downloadBlob(await zip.generateAsync({ type: 'blob' }), `${zipName}.zip`);
};

/**
 * Construit un nom de fichier à partir de l'édition
 * @param {*} year Année
 * @param {*} location Lieu
 * @returns Nom de fichier sans accents ni caractères spéciaux
 */
export const getQrCodesFileName = (year, location) => {
    const slug = location
        .normalize('NFD')
        .replaceAll(REGEX_DIACRITICS, '')
        .replaceAll(REGEX_NON_ALPHANUMERIC, '-')
        .replaceAll(REGEX_EDGE_DASHES, '')
        .toLowerCase();

    return `qrcodes-${year}-${slug}`;
};
