import React, { useId } from 'react';
import { RocketIcon } from './Icons';
import { useDialog } from '../hooks/useDialog';
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
  const titleId = useId();

  if (!onApply) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${theme.hex}1a` }}>
            <RocketIcon className={`w-7 h-7 ${theme.textColor}`} />
          </div>
          <div className="min-w-0">
            <h3 id={titleId} className="text-lg font-bold text-gray-900 leading-tight" dir="auto">
              {t('updateAvailableTitle')}
            </h3>
            <p className="text-sm text-gray-600 mt-1 leading-snug" dir="auto">{t('updateAvailableBody')}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fechar}
            className="flex-1 min-h-[44px] py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            {t('updateLater')}
          </button>
          <button
            onClick={() => { playSound('click'); onApply(); }}
            className={`flex-1 min-h-[44px] py-3 px-4 rounded-xl ${theme.color} text-white font-bold shadow-md hover:brightness-90 active:scale-95 tap transition`}
          >
            {t('updateNow')}
          </button>
        </div>
      </div>
    </div>
  );
};
