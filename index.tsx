
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { runStorageMigration } from './utils/storageMigration';

// Antes do React montar: os hooks leem o localStorage já na inicialização do
// estado, então o formato precisa estar convertido antes do primeiro render.
// A migração já é toda protegida por dentro; este try é a garantia de que uma
// falha aqui não impeça o app de abrir.
try {
  runStorageMigration();
} catch (error) {
  console.error('[storageMigration]', error);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

/**
 * Último recurso. A barreira de dentro do App cobre os módulos adiados e é a
 * que vai disparar na prática; esta existe para que uma falha no próprio App
 * também tenha saída, em vez de tela branca. Não usa tradução nem tema de
 * propósito: se ela apareceu, é porque não dá para confiar no resto.
 */
const LastResort = () => (
  <div
    lang="pt-BR"
    style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem',
      padding: '2rem', textAlign: 'center', background: '#f9fafb',
      color: '#1f2937', fontFamily: 'system-ui, sans-serif',
    }}
  >
    <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Algo deu errado</p>
    <p style={{ margin: 0, color: '#4b5563' }}>Recarregue para tentar de novo.</p>
    <button
      onClick={() => window.location.reload()}
      style={{
        minHeight: '48px', padding: '0.75rem 1.75rem', border: 0, borderRadius: '0.75rem',
        background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
      }}
    >
      Recarregar
    </button>
  </div>
);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary fallback={() => <LastResort />}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
