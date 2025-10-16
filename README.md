# NDI-Connect

NDI-Connect est une application web permettant la gestion d'éditions, des joueurs, des récompenses et des cadeaux dans le cadre de la **Nuit de l'Info**. Elle propose une interface moderne basée sur React pour le front-end et PHP pour le back-end.

## Fonctionnalités

- Gestion des éditions (création, modification, suppression)
- Gestion des joueurs et de leurs informations
- Attribution et gestion des récompenses et cadeaux
- Authentification et gestion des utilisateurs
- Interface responsive adaptée aux mobiles et ordinateurs
- API RESTful sécurisée

## Structure du projet

```bash
ndi-connect/
├── api/                  # Back-end PHP (API)
│   ├── controllers/
│   ├── core/
│   │   ├── functions/
│   │   ├── helpers/
│   ├── enums/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── .env
│   ├── .env.production
│   ├── .htaccess
│   ├── index.php
├── app/                  # Front-end React
│   ├── build/
│   ├── node_modules/
│   ├── public/
│   ├── scripts/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   │   ├── fonts/
│   │   │   ├── images/
│   │   ├── components/
│   │   ├── enums/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── main.css
│   │   ├── main.jsx
│   ├── .env.development
│   ├── .env.production
│   ├── .prettierrc
│   ├── eslint.config.mjs
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── vite.config.js
├── dist/                 # Dossier de déploiement
├── logs/                 # Dossier de logs
├── .gitattributes
├── .gitignore
├── deploy.ps1            # Script de déploiement
├── README.md
```

## Installation

Le projet a été initialisé avec Vite.

### Prérequis

- Node.js >= 18
- PHP >= 8.2
- MySQL/MariaDB
- Serveur web (Apache, Nginx...)

### 1. Installation du front-end

```
cd app
npm install
```

### 2. Initialisation des fichiers d'environnements :

```
npm run init:env
```

### 3. Configuration du back-end

Configurer le fichier _.env_ dans le dossier api avec vos identifiants de base de données locale :

```
DB_HOST=localhost
DB_PORT=
DB_NAME=ndi_connect_db
DB_USER=root
DB_PASS=
LOG_DIR=../logs
```

### 4. Lancement en développement

<u>Back-end :</u>

Déployer le dossier api sur votre serveur local PHP (ex: WAMP, XAMPP, etc.).

<u>Front-end :</u>

```
cd app
npm run dev
```

### 4. Déploiement

Configurer le fichier _.env.production_ dans le dossier api avec les identifiants de base de données de production :

```
DB_HOST=localhost
DB_PORT=
DB_NAME=ndi_connect_db
DB_USER=prod_login
DB_PASS=prod_password
LOG_DIR=../logs
```

Utiliser ensuite le script PowerShell pour automatiser le déploiement : **deploy.ps1**. Dans une console lancer la commande puis faire le choix de version :

```
.\deploy.ps1
```

A la fin du déploiement le dossier est ouvert dans l'explorateur, il faut supprimer le dossier existant sur le serveur puis coller le nouveau.

## Scripts disponibles dans le dossier app

### `npm run dev`

Lance l'application en mode développement.

### `npm run build`

Construit l'application pour la production.

### `npm run preview`

Simule un déploiement local comme en production.

### `npm run lint`

Vérifie la qualité du code.

### `npm run lint:fix`

Corrige automatiquement les erreurs de lint.

### `npm run init:env`

Génère les fichiers d'environnement .env.

### `npm install`

Installe les dépendances de l'application.

## Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub ou à contacter le mainteneur du projet.

## Documentation

[Vite](https://vite.dev/)  
[Guide / Getting Started](https://vite.dev/guide/)  
[Configuration](https://vite.dev/config/)  
[React documentation](https://reactjs.org/)  
