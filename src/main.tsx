import React from 'react';import {createRoot} from 'react-dom/client';import App from './App';import './styles.css';createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.update().catch(() => undefined);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage('SKIP_WAITING');
          }
        });
      });
    }).catch(() => undefined);
  });
}
