<?php
/**
 * Renvoie le fichier demandé
 */
function serveFile(): void
{
    $destination = isset($_GET['destination']) ? basename(urldecode($_GET['destination'])) : null;
    $fileName = isset($_GET['file']) ? basename(urldecode($_GET['file'])) : null;

    try {
        // Récupération du fichier
        FileHelper::serveFile($destination, $fileName);
    } catch (Exception $e) {
        // Exception
        ResponseHelper::error($e->getMessage(), 'serve-file', __FUNCTION__, [$destination, $fileName]);
    }
}

serveFile();
