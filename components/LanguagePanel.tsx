
import React, { useCallback, useId, useRef, useState } from 'react';
import type { Country } from '../types';
import { XIcon, CheckIcon } from './Icons';
import { useDialog } from '../hooks/useDialog';
import { usePresenca } from '../hooks/usePresenca';
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
  /**
   * Recorte do lançamento (`lancamento.ts`). País fora dele continua visível,
   * mas desativado. Sem as props, tudo aberto.
   */
  origemAberta?: (country: Country) => boolean;
  destinoAberto?: (country: Country) => boolean;
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
  origemAberta = () => true,
  destinoAberto = () => true,
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

  const { montado, saindo } = usePresenca(isOpen);

  if (!montado) return null;

  /*
   * Cada bandeira com o NOME embaixo, e colorida sempre que dá para escolher.
   *
   * Antes as livres não escolhidas ficavam em cinza e só ganhavam cor ao passar
   * o mouse — o que não existe no celular. A França em cinza virava três listras
   * cinzas, igual à Itália bloqueada, e para escolher a França era preciso
   * adivinhar pelo tom de cinza. O nome existia só no `title`, que o celular não
   * mostra. Agora o cinza é só de quem está bloqueado — e só na BANDEIRA: o nome
   * embaixo dela é texto que ela lê para entender o que existe, e texto lido não
   * fica apagado (mesma regra das telhas fechadas do hub).
   */
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
      // O anel é só visual: sem isto, um leitor de tela ouve doze botões iguais
      // e não sabe qual país está escolhido.
      aria-pressed={isSelected}
      onClick={() => { playSound('click'); onClick(); }}
      className={`w-full flex flex-col items-center gap-1 p-1 rounded-xl tap ${isBlocked ? 'cursor-not-allowed' : 'active:scale-95'}`}
      title={opt.name}
    >
      <span
        className={`rounded-full p-0.5 ${
          isBlocked
            ? 'opacity-25 grayscale'
            : isSelected
            ? 'bg-white dark:bg-slate-800 shadow-lg ring-2 ring-offset-1'
            : ''
        }`}
        style={isSelected ? ({ '--tw-ring-color': ringColor } as React.CSSProperties) : undefined}
      >
        {/* O nome acessível vem do `alt`; o texto de baixo repete o mesmo nome
            para quem vê e fica fora da árvore, senão o leitor diria duas vezes. */}
        <img
          src={opt.image}
          alt={opt.name}
          loading="lazy"
          className="w-10 h-10 rounded-full object-cover drop-shadow-md"
        />
      </span>
      <span
        aria-hidden="true"
        dir="auto"
        className={`text-sm leading-tight text-center break-words ${
          isBlocked
            ? 'text-gray-600 dark:text-slate-300'
            : isSelected
            ? 'font-bold text-gray-900 dark:text-white'
            : 'text-gray-700 dark:text-slate-200'
        }`}
      >
        {opt.name}
      </span>
    </button>
  );

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${saindo ? 'animate-fade-out pointer-events-none' : 'animate-fade-in'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('languageSettings')}
        className={`relative w-full max-w-xs bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col ring-4 ring-white/20 max-h-[85vh] overflow-y-auto no-scrollbar ${saindo ? 'animate-collapse-down' : 'animate-expand-up'}`}
      >

        {/* Fechar. Fundo escuro de verdade e ícone de 20px: o X branco de 14px
            sobre `bg-black/10` quase não aparecia. */}
        <button
            onClick={handleClose}
            aria-label={t('close')}
            className="hit absolute top-1.5 right-1.5 p-1.5 bg-black/40 rounded-full text-white z-50 hover:bg-black/60 tap active:scale-90"
        >
            <XIcon className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* Top Section: Native Language (Blue Theme) */}
        <div className="bg-slate-100 dark:bg-slate-800 flex flex-col shrink-0">
             <div id={nativeGroupId} className="bg-slate-700 dark:bg-slate-600 text-white py-2.5 pl-4 pr-12 font-bold text-base shadow-md z-10 relative flex items-center gap-2">
                <span dir="auto">{t('myLanguage')}...</span>
             </div>
             {/* Optimized padding and gap for small screens */}
             <div role="group" aria-labelledby={nativeGroupId} className="p-3 grid grid-cols-3 gap-x-2 gap-y-3 items-start">
                {options.map((opt) => {
                    const isSelected = nativeCountry.code === opt.code;
                    return renderFlagButton(
                        opt,
                        isSelected,
                        () => onNativeChange(opt),
                        // Tinta forte, e não o hex: #475569 sobre o chip escuro
                        // dá 1,95:1 e o anel de seleção some. `--art-ink` é o
                        // papel que inverte — 7,5:1 no claro, 11,9:1 no escuro.
                        'var(--art-ink)',
                        targetCountry.code === opt.code || (blockOriginOnly && !!opt.originOnly) || !origemAberta(opt),
                        isSelected ? nativeSelectedRef : undefined,
                    );
                })}
             </div>
        </div>

        {/* Bottom Section: Target Location (Red Theme) */}
        <div className="flex flex-col relative shrink-0 flex-1" style={{ backgroundColor: `${theme.hex}14` }}>
             <div id={targetGroupId} className={`${theme.color} text-white py-2.5 px-4 font-bold text-base shadow-md z-10 relative flex items-center gap-2`}>
                <span dir="auto">{t('iAmIn')}...</span>
             </div>
             <div role="group" aria-labelledby={targetGroupId} className="p-3 grid grid-cols-3 gap-x-2 gap-y-3 pb-2 items-start">
                 {options.filter((opt) => !opt.originOnly).map((opt) =>
                    renderFlagButton(
                        opt,
                        targetCountry.code === opt.code,
                        () => onTargetChange(opt),
                        theme.hex,
                        nativeCountry.code === opt.code || !destinoAberto(opt)
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
        <div className="border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-2xl">
          {/*
            Botão + aria-expanded em vez de <details>: o elemento nativo entra
            na árvore como role="group" e passaria a contar como um terceiro
            grupo no painel, ao lado de "Eu falo" e "Estou em".
          */}
          <button
            onClick={() => setShowDiagnostics((v) => !v)}
            aria-expanded={showDiagnostics}
            aria-controls={diagnosticsId}
            className="w-full min-h-[44px] px-4 py-2.5 text-left text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 tap active:scale-[0.98]"
          >
            <span dir="auto">{t('voiceDiagnosticsTitle')}</span>
          </button>
          <ul id={diagnosticsId} hidden={!showDiagnostics} className="px-4 pb-3 space-y-2">
            {/* Só os destinos que dá para escolher: voz de país desativado é ruído. */}
            {options.filter((opt) => !opt.originOnly && destinoAberto(opt)).map((opt) => {
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
                <li key={opt.code} className="text-sm leading-snug space-y-0.5">
                  <span className="flex items-baseline gap-1.5 text-gray-700 dark:text-slate-200">
                    <span className="font-medium" dir="auto">{opt.name}</span>
                    <span className="font-mono text-gray-500 dark:text-slate-400">{opt.lang}</span>
                  </span>

                  <span className="flex items-start gap-1 text-gray-500 dark:text-slate-400">
                    <span aria-hidden="true">{noAparelho ? '✅' : aindaLendo ? '…' : '—'}</span>
                    <span dir="auto">
                      {t('voiceDeviceLabel')}:{' '}
                      {noAparelho ? lookup.voice.name : aindaLendo ? t('voiceUnknownLabel') : t('voiceMissingLabel')}
                    </span>
                  </span>

                  <span className="flex items-start gap-1 text-gray-500 dark:text-slate-400">
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
          <div hidden={!showDiagnostics} className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-slate-700 space-y-2">
            <p className="text-sm leading-snug text-gray-600 dark:text-slate-300" dir="auto">{t('voiceOfflineNote')}</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-200" dir="auto">{t('voiceHowToInstall')}</p>
            <ul className="space-y-1.5 text-sm leading-snug text-gray-600 dark:text-slate-300">
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
