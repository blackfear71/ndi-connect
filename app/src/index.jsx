import React from 'react';

import ReactDOM from 'react-dom/client';

import './assets/fonts/fonts.css';

import App from './App';

import './index.css';
import './utils/i18n';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
