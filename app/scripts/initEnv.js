// Script de création des fichiers .env (front et back)
const fs = require('fs');
const path = require('path');

// Liste des fichiers à générer
const envFiles = [
    {
        path: path.resolve('.env.development'),
        label: 'Front (dev)',
        content: `REACT_APP_API_URL=http://localhost/ndi-connect/api
`
    },
    {
        path: path.resolve('.env.production'),
        label: 'Front (prod)',
        content: `REACT_APP_API_URL=/api
`
    },
    {
        path: path.resolve('../api/.env'),
        label: 'Back',
        content: `# A modifier avec les identifiants du compte phpMyAdmin et à copier manuellement pour autoriser la connexion à la base de données
DB_HOST=localhost
DB_PORT=
DB_NAME=ndi_connect_db
DB_USER=root
DB_PASS=
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
