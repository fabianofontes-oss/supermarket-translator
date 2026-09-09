import React, { useId } from 'react';
import type { Country } from '../types';
import { SpeakerOffIcon } from './Icons';
import { useDialog } from '../hooks/useDialog';
import { playSound } from '../utils/soundUtils';

interface VoiceMissingSheetProps {
  /** País de destino cuja voz falta. `null` mantém a folha fechada. */
  country: Country | null;
  onClose: () => void;
  t: (key: string) => string;
  theme: { color: string; textColor: string; hex: string };
}

/**
 * Explica por que o app ficou calado.
 *
 * Falar com a voz padrão do sistema seria mais "suave" — o botão continuaria
 * funcionando —, mas ensinaria a pronúncia de outro idioma. Silêncio com
 * explicação é o comportamento correto; esta folha é a explicação.
 *
 * As instruções por plataforma são orientação: o caminho exato muda entre
 * versões de Android, iOS e Windows.
 */
export const VoiceMissingSheet: React.FC<VoiceMissingSheetProps> = ({ country, onClose, t, theme }) => {
  const isOpen = !!country;

  const handleClose = () => {
    playSound('pop');
    onClose();
  };

  const panelRef = useDialog(isOpen, handleClose);
  const titleId = useId();

  if (!country) return null;

  const steps = [
    t('voiceMissingAndroid'),
    t('voiceMissingIOS'),
    t('voiceMissingWindows'),
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${theme.hex}1a` }}>
            <SpeakerOffIcon className={`w-7 h-7 ${theme.textColor}`} />
          </div>
          <div className="min-w-0">
            <h3 id={titleId} className="text-lg font-bold text-gray-900 leading-tight">
              {t('voiceMissingTitle')}
            </h3>
            {/* Qual voz falta, em vez de um aviso genérico: é o que a pessoa
                precisa procurar nas configurações do aparelho. */}
            <p className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <img src={country.image} alt="" aria-hidden="true" className="w-5 h-5 rounded-full object-cover" />
              <span dir="auto">{country.name}</span>
              <span className="font-mono text-xs text-gray-500">{country.lang}</span>
            </p>
          </div>
        </div>

        <p className="text-gray-600 mb-4 text-sm leading-relaxed" dir="auto">{t('voiceMissingBody')}</p>

        <ul className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2.5 text-sm text-gray-700">
          {steps.map((step) => (
            <li key={step} dir="auto" className="leading-snug">{step}</li>
          ))}
        </ul>

        <button
          onClick={handleClose}
          className={`w-full min-h-[44px] py-3 px-4 rounded-xl ${theme.color} text-white font-bold shadow-md hover:brightness-90 active:scale-95 tap transition`}
        >
          {t('voiceMissingDismiss')}
        </button>
      </div>
    </div>
  );
};
