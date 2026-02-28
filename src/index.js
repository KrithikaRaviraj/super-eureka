import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const reportClientError = (payload) => {
  if (process.env.NODE_ENV !== 'production') return;
  fetch(`${API_BASE_URL}/api/security/client-error`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => {});
};

window.addEventListener('error', (event) => {
  reportClientError({
    type: 'window_error',
    severity: 'warning',
    message: event?.message || 'Unknown window error',
    source: event?.filename || null,
    stack: event?.error?.stack || null
  });
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event?.reason;
  const message = typeof reason === 'string' ? reason : reason?.message || 'Unhandled promise rejection';
  reportClientError({
    type: 'unhandled_rejection',
    severity: 'warning',
    message,
    stack: reason?.stack || null
  });
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  <App />
  </React.StrictMode>
);
