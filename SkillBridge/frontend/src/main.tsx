import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" toastOptions={{
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#111827',
          border: '1px solid #E5E7EB',
          fontSize: '14px',
        },
      }} />
    </BrowserRouter>
  </StrictMode>
);
