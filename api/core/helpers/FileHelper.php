<?php
class FileHelper
{
    private static $env = null;

    /**
     * Contrôle l'existence d'un fichier sur le serveur
     * @param $destination Dossier de destination
     * @param $file Fichier
     */
    public static function getFilePath($destination, $file)
    {
        // Contrôle données renseignées
        if (!$file || !$destination) {
            return null;
        }

        // Récupération du dossier des fichiers depuis le fichier .env
        if (self::$env === null) {
            self::$env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
        }

        // Contrôle que le fichier existe
        $destination = trim($destination, '/\\');
        $file = basename($file);
        $dir = rtrim(self::$env['FILES_DIR'], '/\\');
        $url = rtrim(self::$env['FILES_URL'], '/\\');

        $filePath = "$dir/$destination/$file";
        $fileUrl = "$url/$destination/$file";

        return is_file($filePath) ? $fileUrl : null;
    }

    /**
     * Enregistre un fichier dans le dossier de destination
     * @param $destination Dossier de destination
     * @param $file Fichier
     */
    public static function fileUpload($destination, $file)
    {
        // Récupération du dossier des fichiers depuis le fichier .env
        if (self::$env === null) {
            self::$env = EnvironmentHelper::loadEnv(__DIR__ . '/../../.env');
        }

        if (isset(self::$env['FILES_DIR']) && !empty(self::$env['FILES_DIR'])) {
            $uploadDir = self::$env['FILES_DIR'] . '/' . $destination;

            // Contrôle que le dossier des fichiers existe
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0775, true);
            }





            // TODO : transformer les echo en return :
            // return [
            //     'status' => 'error',
            //     'message' => 'Aucun fichier valide reçu.'
            // ];
            //
            // Ou
            //
            // if (!isset($_FILES['picture']) || $_FILES['picture']['error'] !== UPLOAD_ERR_OK) {
            //     throw new Exception('Aucun fichier valide reçu.', 400);
            // }
            //
            // Puis
            //
            // try {
            //     $response = $this->uploadPicture();
            //     echo json_encode(['status' => 'success', 'data' => $response]);
            // } catch (Exception $e) {
            //     http_response_code($e->getCode() ?: 500);
            //     echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            // }





            // Vérification du fichier reçu
            if (!isset($_FILES['picture']) || $_FILES['picture']['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Aucun fichier valide reçu.'
                ]);
                exit;
            }

            $fileTmp = $_FILES['picture']['tmp_name'];
            $fileName = basename($_FILES['picture']['name']);

            var_dump($fileTmp);
            var_dump($fileName);

            // Vérifie que c'est bien une image
            $imageInfo = getimagesize($fileTmp);

            var_dump($imageInfo);

            if ($imageInfo === false) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Le fichier n\'est pas une image.'
                ]);
                exit;
            }

            // Récupération du type MIME
            $mimeType = $imageInfo['mime'];
            $newFileName = uniqid('picture-', true);

            // Conversion éventuelle en WebP
            $destinationPath = $uploadDir . '/' . $newFileName . '.webp';

            var_dump($destinationPath);

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
                        if (move_uploaded_file($fileTmp, $destinationPath)) {
                            echo json_encode([
                                'status' => 'success',
                                'url' => $destinationPath
                            ]);
                            exit;
                        }
                        throw new Exception('Erreur lors de la copie du fichier WebP.');

                    default:
                        throw new Exception('Format non supporté : ' . $mimeType);
                }

                // Compression WebP s'il ne l'était pas déjà
                if (!imagewebp($image, $destinationPath, 80)) {
                    throw new Exception('Erreur lors de la conversion WebP.');
                }

                imagedestroy($image);

                // Réponse finale
                echo json_encode([
                    'status' => 'success',
                    'url' => $destinationPath
                ]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => $e->getMessage()
                ]);
            }
        }
    }
}
