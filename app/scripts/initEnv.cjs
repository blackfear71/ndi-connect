// Script de création des fichiers .env (front et back)
const fs = require('fs');
const path = require('path');

// Liste des fichiers à générer
const envFiles = [
    {
        path: path.resolve('.env.development'),
        label: 'Front (dev)',
        content: `VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost/ndi-connect/api
`
    },
    {
        path: path.resolve('.env.production'),
        label: 'Front (prod)',
        content: `VITE_APP_URL=https://ndi-connect.ddns.net
VITE_API_URL=/api
`
    },
    {
        path: path.resolve('../api/.env'),
        label: 'Back',
        content: `# A modifier avec les identifiants du compte phpMyAdmin [LOCAL] pour autoriser la connexion à la base de données (utilisé en développement)
DB_HOST=localhost
DB_PORT=
DB_NAME=ndi_connect_db
DB_USER=local_login
DB_PASS=local_password

# Dossier des fichiers de l'application (images, logs...)
FILES_DIR=../files

# Origines autorisées (CORS), séparées par une virgule
ALLOWED_ORIGINS=http://localhost:5173
`
    },
    {
        path: path.resolve('../api/.env.production'),
        label: 'Back',
        content: `# A modifier avec les identifiants du compte phpMyAdmin [SERVEUR] pour autoriser la connexion à la base de données (déployé sur le serveur automatiquement)
DB_HOST=localhost
DB_PORT=
DB_NAME=ndi_connect_db
DB_USER=prod_login
DB_PASS=prod_password

# Dossier des fichiers de l'application (images, logs...)
FILES_DIR=/server_path/files/ndi-connect

# Origines autorisées (CORS), séparées par une virgule
ALLOWED_ORIGINS=http://ndi-connect.ddns.net,https://ndi-connect.ddns.net
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
