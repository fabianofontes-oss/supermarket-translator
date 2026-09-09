import React from 'react';
import { HomeIcon } from './Icons';

interface ErrorFallbackProps {
  error: Error;
  t: (key: string) => string;
  theme: { color: string; hex: string };
  onGoHome: () => void;
  /** Injetável para teste; por padrão recarrega a página. */
  onReload?: () => void;
}

/**
 * Fallback do módulo que não carregou.
 *
 * Fica no lugar do módulo, dentro do App: o hub, o seletor de idiomas e a
 * navegação continuam funcionando, então a saída "voltar ao início" é real e
 * não depende da recarga.
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  t,
  theme,
  onGoHome,
  onReload = () => window.location.reload(),
}) => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-gray-800 mb-2" dir="auto">{t('errorTitle')}</h1>
      <p className="text-gray-600 mb-7 leading-snug" dir="auto">{t('errorHint')}</p>

      <div className="flex flex-col gap-3">
        <button
          onClick={onReload}
          className={`w-full min-h-[48px] py-3 px-4 rounded-xl ${theme.color} text-white font-bold shadow-lg tap active:scale-95`}
        >
          {t('errorReload')}
        </button>
        <button
          onClick={onGoHome}
          className="w-full min-h-[48px] py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium flex items-center justify-center gap-2 tap active:scale-95"
        >
          <HomeIcon className="w-5 h-5" />
          <span dir="auto">{t('a11yHome')}</span>
        </button>
      </div>

      {/* O app não tem telemetria: a mensagem precisa ficar acessível aqui. */}
      <details className="mt-7 text-left">
        <summary className="text-xs text-gray-500 cursor-pointer">{error.name || 'Error'}</summary>
        <pre className="mt-2 text-[11px] text-gray-600 whitespace-pre-wrap break-words overflow-x-auto">
          {error.message}
        </pre>
      </details>
    </div>
  </div>
);
