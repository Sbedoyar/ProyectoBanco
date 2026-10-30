import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import App from './app/App';
import { BankingProvider } from './app/BankingContext';
import './styles/styles.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <BankingProvider>
        <App />
      </BankingProvider>
    </HashRouter>
  </StrictMode>,
);
