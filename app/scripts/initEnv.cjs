// Script de création des fichiers .env (front et back)
const fs = require('fs');
const path = require('path');

// Liste des fichiers à générer
const envFiles = [
    {
        path: path.resolve('.env.development'),
        label: 'Front (dev)',
        content: `VITE_VERSION=0.0.0
VITE_API_URL=http://localhost/ndi-connect/api
`
    },
    {
        path: path.resolve('.env.production'),
        label: 'Front (prod)',
        content: `VITE_VERSION=0.0.0
VITE_API_URL=/api
`
    },
    {
        path: path.resolve('../api/.env'),
        label: 'Back',
        content: `# A modifier avec les identifiants du compte phpMyAdmin et les chemins [LOCAL] pour autoriser la connexion à la base de données (utilisé en développement)
DB_HOST=localhost
DB_PORT=
DB_NAME=ndi_connect_db
DB_USER=root
DB_PASS=
LOG_DIR=../logs
`
    },
    {
        path: path.resolve('../api/.env.production'),
        label: 'Back',
        content: `# A modifier avec les identifiants du compte phpMyAdmin et les chemins [SERVEUR] pour autoriser la connexion à la base de données (déployé sur le serveur automatiquement)
DB_HOST=localhost
DB_PORT=
DB_NAME=ndi_connect_db
DB_USER=root
DB_PASS=
LOG_DIR=/server_path/logs/ndi-connect
`
    }
];

// Création des fichiers
envFiles.forEach(({ path: filePath, label, content }) => {
    createEnvFile(filePath, label, content);
});

// Fonction de création des fichiers d'environnement
function createEnvFile(filePath, label, content) {
    if (fs.existsSync(filePath)) {
        console.log(`[${label}] ${filePath} existe déjà`);
    } else {
        fs.writeFileSync(filePath, content);
        console.log(`[${label}] ${filePath} créé`);
    }
}
