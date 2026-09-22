import React, { useId, useRef } from 'react';
import { RocketIcon } from './Icons';
import { useDialog } from '../hooks/useDialog';
import { usePresenca } from '../hooks/usePresenca';
import { playSound } from '../utils/soundUtils';

interface UpdateSheetProps {
  /** Aplica a atualização e recarrega. `null` mantém a caixa fechada. */
  onApply: (() => void) | null;
  onDismiss: () => void;
  t: (key: string) => string;
  theme: { color: string; textColor: string; hex: string };
}

/**
 * Caixa de "tem versão nova".
 *
 * Sem ela, num app instalado no Android a atualização simplesmente não chega:
 * o service worker novo instala e fica esperando enquanto existir janela
 * aberta, e a janela de um PWA não fecha. O dono ficou presa numa versão
 * antiga tentando atualizar sem conseguir.
 *
 * Aparece só quando há de fato uma versão esperando, e sai da frente se a
 * pessoa não quiser agora.
 */
export const UpdateSheet: React.FC<UpdateSheetProps> = ({ onApply, onDismiss, t, theme }) => {
  const aberta = !!onApply;

  const fechar = () => {
    playSound('pop');
    onDismiss();
  };

  const panelRef = useDialog(aberta, fechar);
  const { montado, saindo } = usePresenca(aberta);
  const titleId = useId();

  // `onApply` some no mesmo instante em que a caixa e dispensada, e a caixa
  // ainda tem 200ms de saida pela frente. Segurar o ultimo valor e o que
  // impede a caixa de se esvaziar no meio do proprio fechamento.
  const ultimoApply = useRef(onApply);
  if (onApply) ultimoApply.current = onApply;
  const aplicar = ultimoApply.current;

  if (!montado || !aplicar) return null;

  return (
    <div className={`fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${saindo ? 'animate-fade-out pointer-events-none' : 'animate-fade-in'}`}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl ${saindo ? 'animate-slide-down' : 'animate-slide-up'}`}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${theme.hex}1a` }}>
            <RocketIcon className={`w-7 h-7 ${theme.textColor}`} />
          </div>
          <div className="min-w-0">
            <h3 id={titleId} className="text-lg font-bold text-gray-900 dark:text-white leading-tight" dir="auto">
              {t('updateAvailableTitle')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1 leading-snug" dir="auto">{t('updateAvailableBody')}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fechar}
            className="flex-1 min-h-[44px] py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            {t('updateLater')}
          </button>
          <button
            onClick={() => { playSound('click'); aplicar(); }}
            className={`flex-1 min-h-[44px] py-3 px-4 rounded-xl ${theme.color} text-white font-bold shadow-md hover:brightness-90 active:scale-95 tap`}
          >
            {t('updateNow')}
          </button>
        </div>
      </div>
    </div>
  );
};
