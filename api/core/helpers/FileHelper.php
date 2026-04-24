<?php
class FileHelper
{
    private static $env = null;

    /**
     * Contrôle l'existence d'un fichier sur le serveur
     * @param $destination Dossier de destination
     * @param $fileName Nom du fichier
     */
    public static function checkFile($destination, $fileName)
    {
        // Contrôle données renseignées
        if (!$fileName || !$destination) {
            return null;
        }

        // Récupération du dossier des fichiers depuis le fichier .env
        if (self::$env === null) {
            self::$env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
        }

        // Contrôle que le fichier existe
        $destination = trim($destination, '/\\');
        $fileName = basename($fileName);
        $dir = rtrim(self::$env['FILES_DIR'], '/\\');

        $filePath = "$dir/$destination/$fileName";

        return is_file($filePath) ? $fileName : null;
    }

    /**
     * Renvoie le fichier demandé
     */
    public static function serveFile()
    {
        $destination = isset($_GET['destination']) ? basename($_GET['destination']) : null;
        $file = isset($_GET['file']) ? basename($_GET['file']) : null;

        if (!$destination || !$file) {
            ResponseHelper::error('ERR_MISSING_PARAMS', 400, 'Paramètres manquants.');
            exit;
        }

        // Recherche du dossier des fichiers via getenv()
        $filesDir = getenv('FILES_DIR');

        // Fallback sur le .env uniquement si nécessaire
        if (!$filesDir) {
            $env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
            $filesDir = $env['FILES_DIR'] ?? null;
        }

        if (!$filesDir || !is_dir($filesDir)) {
            ResponseHelper::error('ERR_FORBIDDEN_FILE', 403, 'Chemin de fichier non autorisé.');
            exit;
        }

        // Construction du chemin complet
        $filePath = rtrim($filesDir, '/\\') . '/' . trim($destination, '/\\') . '/' . $file;

        // Vérification existence du fichier
        if (!is_file($filePath)) {
            ResponseHelper::error('ERR_FILE_NOT_FOUND', 404, "Fichier introuvable : $file");
            exit;
        }

        // Détection du type MIME
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($filePath);

        // Envoi du fichier
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filePath));
        readfile($filePath);
        exit;
    }

    /**
     * Enregistre un fichier dans le dossier de destination
     * @param $destination Dossier de destination
     * @param $file Fichier
     */
    public static function uploadImage($destination, $file)
    {
        // Contrôle fichier reçu
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            LoggerHelper::log('Fichier non renseigné');
            throw new Exception('ERR_INVALID_FILE', 400);
        }

        // Contrôle taille du fichier
        $uploadMaxBytes = self::convertToBytes(ini_get('upload_max_filesize'));
        $postMaxBytes = self::convertToBytes(ini_get('post_max_size'));
        $serverMaxSize = min($uploadMaxBytes, $postMaxBytes);
        $fileSize = $file['size'] ?? 0;

        if ($fileSize > $serverMaxSize) {
            LoggerHelper::log("Fichier " . $file['name'] . " trop volumineux : $fileSize > $serverMaxSize octets");
            throw new Exception('ERR_FILE_TOO_LARGE', 400);
        }

        // Récupération du dossier des fichiers depuis le fichier .env
        if (self::$env === null) {
            self::$env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
        }

        // Contrôle chemin serveur renseigné
        if (!isset(self::$env['FILES_DIR']) || empty(self::$env['FILES_DIR'])) {
            LoggerHelper::log('Dossier serveur introuvable');
            throw new Exception('ERR_ENV_FILES_DIR_MISSING', 500);
        }

        $uploadDir = self::$env['FILES_DIR'] . '/' . $destination;

        // Contrôle que le dossier des fichiers existe sinon il est créé
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }

        // Contrôle que c'est bien une image
        $fileTmp = $file['tmp_name'];
        $imageInfo = getimagesize($fileTmp);

        if ($imageInfo === false) {
            LoggerHelper::log('Fichier ' . $file['name'] . ' invalide');
            throw new Exception('ERR_INVALID_IMAGE', 400);
        }

        // Récupération du type MIME
        $mimeType = $imageInfo['mime'];
        $newFileName = uniqid('picture-', true) . '.webp';

        // Conversion éventuelle en WebP
        $destinationPath = $uploadDir . '/' . $newFileName;

        try {
            switch ($mimeType) {
                case 'image/jpeg':
                    // JPEG
                    $image = imagecreatefromjpeg($fileTmp);
                    break;

                case 'image/png':
                    // PNG
                    $image = imagecreatefrompng($fileTmp);
                    imagepalettetotruecolor($image);
                    imagealphablending($image, true);
                    imagesavealpha($image, true);
                    break;

                case 'image/webp':
                    // Si déjà en WebP, copie directe
                    if (!move_uploaded_file($fileTmp, $destinationPath)) {
                        LoggerHelper::log("Envoi échoué dans $destinationPath");
                        throw new Exception('ERR_UPLOAD_FAILED', 400);
                    }

                    return $newFileName;

                default:
                    LoggerHelper::log("Type MIME invalide : $mimeType");
                    throw new Exception('ERR_INVALID_FORMAT', 400);
            }

            // Compression WebP s'il ne l'était pas déjà
            if (!imagewebp($image, $destinationPath, 100)) {
                LoggerHelper::log('Conversion WebP échouée');
                throw new Exception('ERR_WEBP_CONVERSION_FAILED', 400);
            }

            // Réponse finale
            return $newFileName;
        } catch (Exception $e) {
            LoggerHelper::log("Erreur lors de l'envoi de l'image : " . $e->getMessage());
            throw new Exception($e->getMessage(), $e->getCode());
        }
    }

    /**
     * Convertit une taille en bytes
     * Ex : 2M -> 2048
     */
    private static function convertToBytes($value)
    {
        $value = trim($value);
        $last = strtolower($value[strlen($value) - 1]);
        $num = (int)$value;

        switch ($last) {
            case 'g':
                $num *= 1024 ** 3;
                break;
            case 'm':
                $num *= 1024 ** 2;
                break;
            case 'k':
                $num *= 1024 ** 1;
                break;
        }

        return $num;
    }

    /**
     * Supprime un fichier dans le dossier de destination
     * @param $destination Dossier de destination
     * @param $fileName Nom du fichier
     */
    public static function deleteFile($destination, $fileName)
    {
        // Contrôle fichier renseigné
        if (empty($fileName)) {
            LoggerHelper::log('Fichier non renseigné');
            throw new Exception('ERR_INVALID_FILENAME', 400);
        }

        // Chargement de l'environnement si nécessaire
        if (self::$env === null) {
            self::$env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
        }

        // Contrôle chemin serveur renseigné
        if (!isset(self::$env['FILES_DIR']) || empty(self::$env['FILES_DIR'])) {
            LoggerHelper::log('Dossier serveur introuvable');
            throw new Exception('ERR_ENV_FILES_DIR_MISSING', 500);
        }

        $uploadDir = rtrim(self::$env['FILES_DIR'], '/') . '/' . trim($destination, '/');
        $filePath = $uploadDir . '/' . $fileName;

        // Contrôle que le dossier existe
        if (!is_dir($uploadDir)) {
            LoggerHelper::log("Dossier de destination introuvable : $uploadDir");
            // throw new Exception('ERR_INVALID_DIRECTORY', 400);
            return false;
        }

        // Contrôle que le fichier existe
        if (!file_exists($filePath)) {
            LoggerHelper::log("Fichier introuvable : $filePath");
            // throw new Exception('ERR_FILE_NOT_FOUND', 404);
            return false;
        }

        // Tentative de suppression
        if (!unlink($filePath)) {
            LoggerHelper::log("Impossible de supprimer le fichier : $filePath");
            throw new Exception('ERR_DELETION_FILE_FAILED', 500);
        }

        return true;
    }
}
