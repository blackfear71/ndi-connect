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

ndi-connect/
├── api/                # Back-end PHP (API)
│   ├── controllers/
│   ├── core/
│   ├── enums/
│   ├── logs/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── .env
│   ├── .env.production
│   ├── .htaccess
│   ├── index.php
├── app/                # Front-end React
│   ├── build/
│   ├── node_modules/
│   ├── public/
│   ├── scripts/
│   ├── src/
│   ├── .env.development
│   ├── .env.production
│   ├── .prettierrc
│   ├── eslint.config.mjs
│   ├── package-lock.json
│   ├── package.json
├── dist/               # Dossier de déploiement
├── deploy.ps1          # Script de déploiement
├── README.md

## Installation

### Prérequis

- Node.js >= 18
- PHP >= 8.0
- MySQL/MariaDB
- Serveur web (Apache, Nginx...)

### 1. Installation du front-end

```
cd app
npm install
```

### 2. Installation du back-end

Configurer le fichier _.env_ dans le dossier api avec vos identifiants de base de données :

```
DB_HOST=localhost
DB_PORT=
DB_NAME=ndi_connect_db
DB_USER=root
DB_PASS=
```

### 3. Lancement en développement

<u>Front-end :</u>

```
cd app
npm run start
```

<u>Back-end :</u>

Déployer le dossier api sur votre serveur local PHP (ex: WAMP, XAMPP, etc.).

### 4. Déploiement

Configurer le fichier _.env.production_ dans le dossier api avec les identifiants de base de données de production :

```
DB_HOST=localhost
DB_PORT=
DB_NAME=ndi_connect_db
DB_USER=prod_login
DB_PASS=prod_password
```

Utiliser ensuite le script PowerShell pour automatiser le déploiement : **deploy.ps1**. Dans une console lancer la commande puis faire le choix de version :

```
.\deploy.ps1
```

A la fin du déploiment le dossier est ouvert dans l'explorateur, il faut supprimer le dossier existant sur le serveur puis coller le nouveau.

## Scripts disponibles dans le dossier app :

- npm start : lance l'application en mode développement
- npm run build : construit l'application pour la production
- npm test : lance les tests unitaires
- npm run eject : supprime le build de l'application
- npm run lint : vérifie la qualité du code
- npm run lint:fix : corrige automatiquement les erreurs de lint
- npm run init:env : génère les fichiers d'environnement .env
- npm install : installe les dépendances de l'application

Configuration :

Les fichiers .env permettent de configurer les URLs de l'API et la version de l'application côté front, ainsi que les accès à la base de données côté back.

Contact :

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub ou à contacter le mainteneur du projet.

## Documentation

[Create React App](https://github.com/facebook/create-react-app)
[Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
[React documentation](https://reactjs.org/)