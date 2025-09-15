import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // PWA

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Verifica se o service worker está disponível antes de registrar
if ('serviceWorker' in navigator) {
  serviceWorkerRegistration.register();
} else {
  console.log('Service Worker não suportado neste navegador.');
}
