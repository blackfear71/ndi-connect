<?php

/**
 * Renvoie le fichier demandé
 */
function serveFile(): void
{
    $destination = isset($_GET['destination']) ? basename(urldecode($_GET['destination'])) : null;
    $file = isset($_GET['file']) ? basename(urldecode($_GET['file'])) : null;

    try {
        FileHelper::serveFile($destination, $file);
    } catch (Exception $e) {
        ResponseHelper::error($e->getMessage());
    }
}

serveFile();
