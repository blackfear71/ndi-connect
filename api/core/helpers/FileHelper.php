<?php
class FileHelper
{
    private static $env = null;

    /**
     * Contrôle l'existence d'un fichier sur le serveur
     * @param $destination Dossier de destination
     * @param $fileName Nom du fichier
     */
    public static function getFilePath($destination, $fileName)
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
        $url = rtrim(self::$env['FILES_URL'], '/\\');

        $filePath = "$dir/$destination/$fileName";
        $fileUrl = "$url/$destination/$fileName";

        return is_file($filePath) ? $fileUrl : null;
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
            throw new Exception('ERR_INVALID_FILE', 400);
        }

        // Contrôle taille du fichier
        $uploadMaxBytes = self::convertToBytes(ini_get('upload_max_filesize'));
        $postMaxBytes = self::convertToBytes(ini_get('post_max_size'));
        $serverMaxSize = min($uploadMaxBytes, $postMaxBytes);
        $fileSize = $file['size'] ?? 0;

        if ($fileSize > $serverMaxSize) {
            throw new Exception('ERR_FILE_TOO_LARGE', 400);
        }

        // Récupération du dossier des fichiers depuis le fichier .env
        if (self::$env === null) {
            self::$env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
        }

        // Contrôle chemin serveur renseigné
        if (!isset(self::$env['FILES_DIR']) || empty(self::$env['FILES_DIR'])) {
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
                        throw new Exception('ERR_UPLOAD_FAILED', 400);
                    }
                    exit;

                default:
                    throw new Exception('ERR_INVALID_FORMAT', 400);
            }

            // Compression WebP s'il ne l'était pas déjà
            if (!imagewebp($image, $destinationPath, 80)) {
                throw new Exception('ERR_WEBP_CONVERSION_FAILED', 400);
            }

            imagedestroy($image);

            // Réponse finale
            return $newFileName;
        } catch (Exception $e) {
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
            throw new Exception('ERR_INVALID_FILENAME', 400);
        }

        // Chargement de l'environnement si nécessaire
        if (self::$env === null) {
            self::$env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
        }

        // Contrôle chemin serveur renseigné
        if (!isset(self::$env['FILES_DIR']) || empty(self::$env['FILES_DIR'])) {
            throw new Exception('ERR_ENV_FILES_DIR_MISSING', 500);
        }

        $uploadDir = rtrim(self::$env['FILES_DIR'], '/') . '/' . trim($destination, '/');
        $filePath = $uploadDir . '/' . $fileName;

        // Contrôle que le dossier existe
        if (!is_dir($uploadDir)) {
            throw new Exception('ERR_INVALID_DIRECTORY', 400);
        }

        // Contrôle que le fichier existe
        if (!file_exists($filePath)) {
            throw new Exception('ERR_FILE_NOT_FOUND', 404);
        }

        // Tentative de suppression
        if (!unlink($filePath)) {
            throw new Exception('ERR_DELETION_FILE_FAILED', 500);
        }

        return true;
    }
}
