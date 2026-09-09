
import React, { useCallback, useId, useRef, useState } from 'react';
import type { Country } from '../types';
import { XIcon, CheckIcon } from './Icons';
import { useDialog } from '../hooks/useDialog';
import { playSound } from '../utils/soundUtils';
import { pickVoice, type VoiceLike } from '../utils/speech';

interface LanguagePanelProps {
  isOpen: boolean;
  onClose: () => void;
  nativeCountry: Country;
  targetCountry: Country;
  onNativeChange: (country: Country) => void;
  onTargetChange: (country: Country) => void;
  options: Country[];
  t: (key: string) => string;
  theme: { color: string; textColor: string; hex: string };
  /** Bloqueia em "Eu falo" os países que ainda não têm dados do módulo atual (ex.: catálogo). */
  blockOriginOnly?: boolean;
  /** Vozes do aparelho, para o diagnóstico. Vazio = motor ainda não respondeu. */
  voices?: readonly VoiceLike[];
  /** Com rede, a falta de voz local deixa de ser impedimento: o áudio vem de fora. */
  online?: boolean;
}

export const LanguagePanel: React.FC<LanguagePanelProps> = ({
  isOpen,
  onClose,
  nativeCountry,
  targetCountry,
  onNativeChange,
  onTargetChange,
  options,
  t,
  theme,
  blockOriginOnly = false,
  voices = [],
  online = true
}) => {
  const handleClose = useCallback(() => {
      playSound('pop');
      onClose();
  }, [onClose]);

  // Foco entra no país já escolhido em "Eu falo", que é o que a pessoa veio
  // conferir. Tab circula dentro, Esc fecha, foco volta para quem abriu.
  const nativeSelectedRef = useRef<HTMLButtonElement>(null);
  const panelRef = useDialog(isOpen, handleClose, nativeSelectedRef);

  const ids = useId();
  const nativeGroupId = `${ids}-native`;
  const targetGroupId = `${ids}-target`;
  const diagnosticsId = `${ids}-voices`;

  const [showDiagnostics, setShowDiagnostics] = useState(false);

  if (!isOpen) return null;

  const renderFlagButton = (
    opt: Country,
    isSelected: boolean,
    onClick: () => void,
    ringColor: string,
    isBlocked = false, // já escolhido no outro lado: o mesmo país não pode ser origem e destino
    ref?: React.Ref<HTMLButtonElement>
  ) => (
    <button
      key={opt.code}
      ref={ref}
      disabled={isBlocked}
      // O anel e a saturação são só visuais: sem isto, um leitor de tela ouve
      // doze botões iguais e não sabe qual país está escolhido.
      aria-pressed={isSelected}
      onClick={() => { playSound('click'); onClick(); }}
      className={`hit relative group flex items-center justify-center p-1 rounded-full tap ${
        isBlocked
          ? 'opacity-25 grayscale cursor-not-allowed'
          : isSelected
          ? 'bg-white shadow-xl scale-110 z-10 ring-2 ring-offset-1'
          : 'hover:bg-white/40 hover:scale-105 opacity-80 hover:opacity-100 grayscale hover:grayscale-0'
      }`}
      style={isSelected ? ({ '--tw-ring-color': ringColor } as React.CSSProperties) : undefined}
      title={opt.name}
    >
      <img
        src={opt.image}
        alt={opt.name}
        loading="lazy"
        className="w-10 h-10 rounded-full object-cover drop-shadow-md"
      />
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('languageSettings')}
        className="relative w-full max-w-[16rem] bg-white rounded-2xl shadow-2xl flex flex-col ring-4 ring-white/20 max-h-[85vh] overflow-y-auto animate-expand-up no-scrollbar"
      >

        {/* Close Button */}
        <button
            onClick={handleClose}
            aria-label={t('close')}
            className="hit absolute top-1.5 right-1.5 p-1 bg-black/10 rounded-full text-white z-50 hover:bg-black/30 backdrop-blur-md transition-colors"
        >
            <XIcon className="w-3.5 h-3.5" />
        </button>

        {/* Top Section: Native Language (Blue Theme) */}
        <div className="bg-slate-100 flex flex-col shrink-0">
             <div id={nativeGroupId} className="bg-slate-700 text-white p-2 px-4 font-bold text-sm shadow-md z-10 relative flex items-center gap-2">
                {t('myLanguage')}...
             </div>
             {/* Optimized padding and gap for small screens */}
             <div role="group" aria-labelledby={nativeGroupId} className="p-3 grid grid-cols-3 gap-3 justify-items-center">
                {options.map((opt) => {
                    const isSelected = nativeCountry.code === opt.code;
                    return renderFlagButton(
                        opt,
                        isSelected,
                        () => onNativeChange(opt),
                        '#475569',
                        targetCountry.code === opt.code || (blockOriginOnly && !!opt.originOnly),
                        isSelected ? nativeSelectedRef : undefined,
                    );
                })}
             </div>
        </div>

        {/* Bottom Section: Target Location (Red Theme) */}
        <div className="flex flex-col relative shrink-0 flex-1" style={{ backgroundColor: `${theme.hex}14` }}>
             <div id={targetGroupId} className={`${theme.color} text-white p-2 px-4 font-bold text-sm shadow-md z-10 relative flex items-center gap-2`}>
                {t('iAmIn')}...
             </div>
             <div role="group" aria-labelledby={targetGroupId} className="p-3 grid grid-cols-3 gap-3 pb-2 justify-items-center">
                 {options.filter((opt) => !opt.originOnly).map((opt) =>
                    renderFlagButton(
                        opt,
                        targetCountry.code === opt.code,
                        () => onTargetChange(opt),
                        theme.hex,
                        nativeCountry.code === opt.code
                    )
                 )}
             </div>

             {/* OK Button */}
             <div className="px-3 pb-3 pt-1 mt-auto">
                <button
                    onClick={handleClose}
                    className={`w-full min-h-[44px] py-2 rounded-xl ${theme.color} text-white font-bold shadow-md hover:brightness-90 active:scale-95 tap flex items-center justify-center gap-2 ring-1 ring-white/20`}
                >
                    <span>OK</span>
                    <CheckIcon className="w-4 h-4 stroke-[3]" />
                </button>
             </div>
        </div>

        {/*
          Diagnóstico de vozes. Existe para que um relato futuro de "a pronúncia
          está errada" possa ser separado em "defeito do app" e "pacote de voz
          não instalado" — que é a confusão que produziu as reprovações.
          Fechado por padrão: quem não procurar, não vê.
        */}
        <div className="border-t border-gray-100 bg-white rounded-b-2xl">
          {/*
            Botão + aria-expanded em vez de <details>: o elemento nativo entra
            na árvore como role="group" e passaria a contar como um terceiro
            grupo no painel, ao lado de "Eu falo" e "Estou em".
          */}
          <button
            onClick={() => setShowDiagnostics((v) => !v)}
            aria-expanded={showDiagnostics}
            aria-controls={diagnosticsId}
            className="w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-wider text-gray-500 hover:text-gray-700"
          >
            {t('voiceDiagnosticsTitle')}
          </button>
          <ul id={diagnosticsId} hidden={!showDiagnostics} className="px-4 pb-3 space-y-2">
            {options.filter((opt) => !opt.originOnly).map((opt) => {
              // Mesma função do botão de áudio: uma regra só, nunca duas.
              // Só conta como voz do aparelho a da REGIÃO exata — es-US não
              // serve para a Espanha, pt-PT não serve para o Brasil.
              const lookup = pickVoice(voices, opt.lang);

              /**
               * Duas fontes independentes, mostradas separadas. Um idioma pode
               * estar instalado no aparelho E disponível na rede, e juntar as
               * duas coisas numa linha só escondia que o áudio funciona: o
               * painel parecia dizer que quase nada tinha voz.
               */
              const noAparelho = lookup.status === 'ok';
              const aindaLendo = lookup.status === 'unknown';

              return (
                <li key={opt.code} className="text-[11px] leading-tight space-y-0.5">
                  <span className="flex items-baseline gap-1.5 text-gray-700">
                    <span className="font-medium" dir="auto">{opt.name}</span>
                    <span className="font-mono text-gray-500">{opt.lang}</span>
                  </span>

                  <span className="flex items-start gap-1 text-gray-500">
                    <span aria-hidden="true">{noAparelho ? '✅' : aindaLendo ? '…' : '—'}</span>
                    <span dir="auto">
                      {t('voiceDeviceLabel')}:{' '}
                      {noAparelho ? lookup.voice.name : aindaLendo ? t('voiceUnknownLabel') : t('voiceMissingLabel')}
                    </span>
                  </span>

                  <span className="flex items-start gap-1 text-gray-500">
                    <span aria-hidden="true">{online ? '✅' : '—'}</span>
                    <span dir="auto">
                      {t('voiceInternetLabel')}:{' '}
                      {online ? t('voiceFromInternet') : t('voiceOfflineLabel')}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          {/*
            A explicação mora aqui e não só no aviso de falha: quem abre este
            painel está justamente tentando entender por que umas línguas
            falam e outras não. Descobrir isso no momento do erro é tarde.
          */}
          <div hidden={!showDiagnostics} className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-2">
            <p className="text-[11px] leading-snug text-gray-600" dir="auto">{t('voiceOfflineNote')}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500" dir="auto">{t('voiceHowToInstall')}</p>
            <ul className="space-y-1.5 text-[11px] leading-snug text-gray-500">
              {[t('voiceMissingAndroid'), t('voiceMissingIOS'), t('voiceMissingWindows')].map((passo) => (
                <li key={passo} dir="auto">{passo}</li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
