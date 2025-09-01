import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { HelmetProvider } from 'react-helmet-async'; // ✅ tambahkan ini

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider> {/* ✅ bungkus App */}
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
