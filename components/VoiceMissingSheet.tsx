import React, { useId, useRef, useState } from 'react';
import type { Country } from '../types';
import type { MotivoSemSom } from '../utils/tocador';
import { SpeakerOffIcon, ChevronDownIcon } from './Icons';
import { useDialog } from '../hooks/useDialog';
import { usePresenca } from '../hooks/usePresenca';
import { playSound } from '../utils/soundUtils';

export interface AvisoSemSom {
  /** País de destino cuja frase não saiu. */
  country: Country;
  /** Por que não saiu. Decide a segunda linha — e ela não pode mentir. */
  motivo: MotivoSemSom;
}

interface VoiceMissingSheetProps {
  /** `null` mantém a folha fechada. */
  aviso: AvisoSemSom | null;
  onClose: () => void;
  /** Abre a tela "Mostrar" com a frase que falhou. */
  onShowPhrase: () => void;
  t: (key: string) => string;
  theme: { color: string; textColor: string; hex: string };
}

/**
 * Qual caminho de menu mostrar. Um só — o do aparelho que está na mão.
 *
 * Mostrar Android, iPhone e Windows juntos era pedir para a pessoa descobrir
 * qual dos três é o dela. iPad moderno se apresenta como Mac, e é o toque que
 * o denuncia. Sem saber o sistema, os dois de celular: é quase certo que é um.
 */
export const passosDoAparelho = (
  ua: string,
  toques: number,
): ('voiceMissingIOS' | 'voiceMissingAndroid' | 'voiceMissingWindows')[] => {
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && toques > 1)) return ['voiceMissingIOS'];
  if (/Android/i.test(ua)) return ['voiceMissingAndroid'];
  if (/Windows/i.test(ua)) return ['voiceMissingWindows'];
  return ['voiceMissingAndroid', 'voiceMissingIOS'];
};

/**
 * "Sem som agora".
 *
 * Antes era "Voz não instalada": o código `es-ES` na tela, um parágrafo sobre
 * pronúncia e três caminhos de menu. Com alguém esperando no balcão ninguém vai
 * instalar voz nenhuma. O que a pessoa precisa ler primeiro é **mostre a tela**,
 * e o botão principal faz exatamente isso.
 *
 * A segunda linha diz o motivo verdadeiro. A versão antiga dizia "você está sem
 * internet" também quando havia internet e o áudio só tinha demorado — e a
 * pessoa ia desligar e ligar o wi-fi à toa.
 *
 * Instalar a voz continua possível, recolhido atrás de uma linha: é o conserto
 * de verdade, só não é para agora.
 *
 * Falar com a voz padrão do sistema seria mais "suave", mas ensinaria a
 * pronúncia de outro país. Silêncio com explicação é o comportamento correto.
 */
export const VoiceMissingSheet: React.FC<VoiceMissingSheetProps> = ({ aviso, onClose, onShowPhrase, t, theme }) => {
  const isOpen = !!aviso;
  const [instalar, setInstalar] = useState(false);

  const handleClose = () => {
    playSound('pop');
    onClose();
  };

  const panelRef = useDialog(isOpen, handleClose);
  const { montado, saindo } = usePresenca(isOpen);
  const titleId = useId();
  const passosId = useId();

  // Mesmo motivo do UpdateSheet: o aviso é zerado pelo pai no instante do
  // fechamento, e a folha ainda precisa dele para se desenhar enquanto sai.
  const ultimo = useRef(aviso);
  if (aviso) ultimo.current = aviso;
  const atual = ultimo.current;

  // Cada aviso novo começa com os passos recolhidos.
  const [avisoVisto, setAvisoVisto] = useState(aviso);
  if (aviso !== avisoVisto) {
    setAvisoVisto(aviso);
    if (aviso) setInstalar(false);
  }

  if (!montado || !atual) return null;

  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  const toques = typeof navigator === 'undefined' ? 0 : navigator.maxTouchPoints ?? 0;
  const passos = passosDoAparelho(ua, toques);

  return (
    <div className={`fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${saindo ? 'animate-fade-out pointer-events-none' : 'animate-fade-in'}`}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto ${saindo ? 'animate-slide-down' : 'animate-slide-up'}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${theme.hex}1a` }}>
            <SpeakerOffIcon className="w-7 h-7" style={{ color: 'var(--tema-texto)' }} />
          </div>
          <h3 id={titleId} className="text-xl font-bold text-gray-900 dark:text-white leading-tight" dir="auto">
            {t('voiceMissingTitle')}
          </h3>
        </div>

        <p className="text-base font-bold text-gray-900 dark:text-white leading-snug" dir="auto">
          {t('voiceShowScreen')}
        </p>
        <p className="text-base text-gray-700 dark:text-slate-200 leading-snug mt-2 mb-5" dir="auto">
          {t(atual.motivo === 'sem-rede' ? 'voiceNoNetwork' : 'voiceFailed')}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => { playSound('click'); onShowPhrase(); }}
            className={`w-full min-h-[52px] py-3 px-4 rounded-xl ${theme.color} text-white text-base font-bold shadow-md hover:brightness-90 tap active:scale-[0.98]`}
          >
            <span dir="auto">{t('voiceShowPhrase')}</span>
          </button>
          <button
            onClick={handleClose}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-base font-medium hover:bg-gray-50 dark:hover:bg-slate-700 tap active:scale-[0.98]"
          >
            <span dir="auto">{t('voiceMissingDismiss')}</span>
          </button>
        </div>

        {/* Recolhido: instalar a voz é o conserto de verdade, mas não é o que se
            faz com alguém esperando. Botão + aria-expanded, como o diagnóstico do
            painel de idiomas. */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-700">
          <button
            onClick={() => setInstalar((v) => !v)}
            aria-expanded={instalar}
            aria-controls={passosId}
            className="w-full min-h-[44px] flex items-center justify-between gap-2 text-left text-sm font-semibold text-gray-700 dark:text-slate-200 tap active:scale-[0.98]"
          >
            <span dir="auto">{t('voiceInstallToggle')}</span>
            <ChevronDownIcon className={`w-5 h-5 flex-shrink-0 transition-transform duration-150 ${instalar ? 'rotate-180' : ''}`} />
          </button>
          <div id={passosId} hidden={!instalar} className="pt-2 space-y-3">
            {/* Qual voz falta: é o que a pessoa vai procurar no aparelho. Pelo
                nome do país — nunca pelo código `es-ES`, que não diz nada a ela. */}
            <p className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-slate-100">
              <img src={atual.country.image} alt="" aria-hidden="true" className="w-6 h-6 rounded-full object-cover" />
              <span dir="auto">{atual.country.name}</span>
            </p>
            <p className="text-sm text-gray-700 dark:text-slate-200 leading-relaxed" dir="auto">{t('voiceMissingBody')}</p>
            <ul className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 space-y-2.5 text-sm text-gray-700 dark:text-slate-200">
              {passos.map((passo) => (
                <li key={passo} dir="auto" className="leading-snug">{t(passo)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
