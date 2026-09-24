import React, { useCallback, useId, useRef } from 'react';
import type { Country } from '../types';
import { XIcon } from './Icons';
import { useDialog } from '../hooks/useDialog';
import { usePresenca } from '../hooks/usePresenca';
import { playSound } from '../utils/soundUtils';

interface CountrySheetProps {
  isOpen: boolean;
  /** Só os destinos abertos. Com um só não há o que perguntar, e a folha nem abre. */
  countries: Country[];
  onChoose: (country: Country) => void;
  /** Fechar sem escolher: fica o padrão. */
  onClose: () => void;
  t: (key: string) => string;
}

/**
 * "Em que país você está agora?" — a pergunta da primeira abertura.
 *
 * O app decidia sozinho que a pessoa estava na Espanha. Quem mora em Paris ou em
 * Miami recebia todas as frases em espanhol, sem aviso, e a única pista era uma
 * bandeirinha de 24px encavalada com a do Brasil. Uma pergunta só, uma vez, com
 * um botão grande por país, resolve antes do primeiro erro.
 *
 * Não pergunta "Eu falo": com o recorte do lançamento, só o Brasil está aberto.
 *
 * Mesmo padrão de diálogo do `CategorySheet` (role dialog, aria-modal, Esc, foco
 * preso). `z-[102]`: acima do painel de idiomas (100) e abaixo de tudo que o
 * sistema impõe — nunca coexistem na prática, mas a ordem fica declarada.
 */
export const CountrySheet: React.FC<CountrySheetProps> = ({ isOpen, countries, onChoose, onClose, t }) => {
  const close = useCallback(() => { playSound('pop'); onClose(); }, [onClose]);
  // O foco entra no TÍTULO, e não no X. A folha abre sozinha, na carga, antes
  // de qualquer toque — e foco posto por código sem toque antes conta como
  // teclado para o navegador: o anel de foco acendia e desenhava um quadrado
  // preto em volta do X, o mesmo defeito que o convite de instalar tinha.
  const titleRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useDialog(isOpen, close, titleRef);
  const { montado, saindo } = usePresenca(isOpen);
  const titleId = useId();

  if (!montado) return null;

  return (
    <div className={`fixed inset-0 z-[102] flex items-end sm:items-center justify-center ${saindo ? 'pointer-events-none' : ''}`}>
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${saindo ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={close} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full max-w-md bg-white dark:bg-slate-800 rounded-t-[2rem] sm:rounded-3xl shadow-2xl px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] max-h-[90vh] overflow-y-auto ${saindo ? 'animate-slide-down' : 'animate-slide-up'}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h2
              id={titleId}
              ref={titleRef}
              tabIndex={-1}
              className="text-xl font-bold text-gray-900 dark:text-white leading-tight focus-visible:outline-none focus-visible:shadow-none"
              dir="auto"
            >
              {t('countryAsk')}
            </h2>
            <p className="text-base text-gray-600 dark:text-slate-300 mt-1 leading-snug" dir="auto">{t('countryAskHint')}</p>
          </div>
          <button
            onClick={close}
            aria-label={t('close')}
            className="hit p-2 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600 tap active:scale-90 flex-shrink-0"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <ul className="mt-5 space-y-3">
          {countries.map((c) => (
            <li key={c.code}>
              <button
                onClick={() => { playSound('click'); onChoose(c); }}
                className="w-full min-h-[64px] flex items-center gap-4 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 ring-1 ring-gray-200 dark:ring-slate-600 shadow-sm text-left tap active:scale-[0.98]"
              >
                <img src={c.image} alt="" aria-hidden="true" className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-1 ring-black/5" />
                <span className="text-base font-bold text-gray-900 dark:text-white" dir="auto">{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
