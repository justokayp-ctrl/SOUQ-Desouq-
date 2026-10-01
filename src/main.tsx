import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Safety handlers for cross-origin or sandboxed iframe environments
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.warn('[Global window error]:', event.message || event.error);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[Global unhandled promise rejection]:', event.reason);
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}

