import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProviders } from './context/AppProviders.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <Suspense fallback={<div className="page-loader">Loading Pasand Showroom...</div>}>
          <App />
        </Suspense>
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
);
