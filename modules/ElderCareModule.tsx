import React, { useMemo, useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import type { Country } from '../types';
import { SpeakerIcon, SpeakerOffIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import type { VoiceStatus } from '../utils/speech';
import { toLangCode } from './location/data/locationData';
import { TOOL_GLYPHS } from './eldercare/ElderCareGlyphs';
import {
  CARE_ACTIONS, CARE_GROUPS, CARE_GROUP_LABELS,
  REPORT_EVENTS, REPORT_GROUPS, REPORT_GROUP_LABELS, WHEN_TAGS,
  CARE_TOOLS, TOOL_GROUPS, TOOL_GROUP_LABELS, TOOL_FRAMES,
  EMERGENCY, EMERGENCY_NUMBER,
  buildCareLine, buildReport, buildToolPhrase,
  type CareAction, type CareTool, type ReportEvent, type ToolFrame, type WhenTag,
  type Treat, type Gender,
} from './eldercare/data/elderCareData';

type Theme = { color: string; textColor: string; hex: string; borderColor: string };
type Glyph = React.FC<{ className?: string }>;

interface ElderCareModuleProps {
  nativeCountry: Country;
  targetCountry: Country;
  t: (key: string) => string;
  theme: Theme;
  onGoHome: () => void;
  onOpenLanguageModal: () => void;
  onOpenShare: () => void;
  handlePlayAudio: (text: string, lang: string) => void;
  /** Voz do idioma de destino no aparelho; 'missing' apaga os botões de áudio. */
  voiceStatus?: VoiceStatus;
}

/*
 * SOBRE O TAMANHO DA LETRA: este módulo não segue o dos outros dez.
 *
 * Lá a linha de apoio no idioma nativo é `text-[10px]` e os rótulos são `text-xs`.
 * Aqui o piso é `text-sm` (14px) e o corpo é `text-base` (16px), porque quem usa
 * esta tela lê de pé, com uma pessoa apoiada no braço, e muitas vezes de óculos.
 * É divergência deliberada, está registrada no PROJECT_CONTEXT.md, e é precedente:
 * vale levar aos outros módulos depois.
 *
 * Os três ajudantes abaixo ficam FORA do componente de propósito. Definidos dentro,
 * seriam funções novas a cada render, e o React desmontaria e remontaria a subárvore
 * inteira a cada toque — o foco do teclado escaparia no meio da escolha.
 */

/** Cartão da frase. Destino grande; nativo logo abaixo, em 14px e não em 10. */
const PhraseCard: React.FC<{
  theme: Theme; phrase: string; alt: string | null;
  Listen: Glyph; listenLabel: string; onSpeak: (text: string) => void;
}> = ({ theme, phrase, alt, Listen, listenLabel, onSpeak }) => (
  <div className={`rounded-3xl p-4 text-white shadow-md ${theme.color}`}>
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold leading-snug" dir="auto">{phrase}</p>
        {alt && <p className="text-sm text-white mt-1 leading-snug" dir="auto">{alt}</p>}
      </div>
      <button
        onClick={() => onSpeak(phrase)}
        className="p-3 rounded-full bg-white shadow active:scale-95 transition-transform flex-shrink-0"
        style={{ color: theme.hex }}
        aria-label={listenLabel} title={listenLabel}
      >
        <Listen className="w-6 h-6" />
      </button>
    </div>
  </div>
);

/** Alternador de duas posições. Serve ao tratamento e a quem se cuida. */
function Toggle<T extends string>({ theme, label, hint, value, options, onPick }: {
  theme: Theme; label: string; hint?: string; value: T;
  options: { key: T; text: string }[];
  onPick: (v: T) => void;
}) {
  return (
    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2" dir="auto">{label}</h2>
      <div className="bg-gray-200/70 rounded-2xl p-1 flex gap-1">
        {options.map((o) => {
          const active = o.key === value;
          return (
            <button
              key={o.key}
              aria-pressed={active}
              onClick={() => { playSound('toggle'); onPick(o.key); }}
              className={`flex-1 rounded-xl py-3 text-base font-bold tap ${active ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              style={active ? { color: theme.hex } : undefined}
            >
              <span dir="auto">{o.text}</span>
            </button>
          );
        })}
      </div>
      {hint && <p className="text-sm text-gray-600 leading-snug mt-2" dir="auto">{hint}</p>}
    </section>
  );
}

/** Grade de escolhas rotuladas. Uma seção por grupo. */
function Chips<T extends { key: string }>({ theme, items, active, onPick, label, sub }: {
  theme: Theme; items: T[]; active: string; onPick: (item: T) => void;
  label: (item: T) => string; sub?: (item: T) => React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => {
        const on = item.key === active;
        return (
          <button
            key={item.key}
            aria-pressed={on}
            onClick={() => { playSound('click'); onPick(item); }}
            className={`rounded-2xl border p-3 text-left tap active:scale-95 ${on ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white text-gray-700 border-gray-100'}`}
          >
            {sub?.(item)}
            <span className="block text-sm font-bold leading-tight" dir="auto">{label(item)}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Fila de escolhas soltas, para quadros e marcadores de tempo. */
function Pills<T extends { key: string }>({ theme, items, active, onPick, label }: {
  theme: Theme; items: T[]; active: string | null; onPick: (item: T) => void; label: (item: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const on = item.key === active;
        return (
          <button
            key={item.key}
            aria-pressed={on}
            onClick={() => { playSound('toggle'); onPick(item); }}
            className={`rounded-xl px-3 py-2.5 text-sm font-bold tap active:scale-95 border ${on ? `${theme.color} text-white border-transparent shadow` : 'bg-white text-gray-700 border-gray-100'}`}
          >
            <span dir="auto">{label(item)}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function ElderCareModule({
  nativeCountry,
  targetCountry,
  t,
  theme,
  onGoHome,
  onOpenLanguageModal,
  onOpenShare,
  handlePlayAudio,
  voiceStatus = 'unknown',
}: ElderCareModuleProps) {
  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;
  /** A língua em que se EXPLICA: a de quem lê. A frase sai sempre no destino. */
  const read = showNative ? native : target;

  const [mode, setMode] = useState<'talk' | 'report' | 'tools'>('talk');

  /**
   * Os dois eixos moram em modos diferentes, e é de propósito: `treat` só existe
   * onde se fala COM ela, `gender` só onde se fala DELA. Os dois seletores nunca
   * aparecem na mesma tela, então a combinação — que dobraria de novo cada frase —
   * fica impossível pelo uso, e não só pelo tipo. Ver o cabeçalho de `elderCareData.ts`.
   */
  const [treat, setTreat] = useState<Treat>('usted');
  const [gender, setGender] = useState<Gender>('f');

  const [action, setAction] = useState<CareAction>(CARE_ACTIONS[0]);
  const [event, setEvent] = useState<ReportEvent>(REPORT_EVENTS[0]);
  const [when, setWhen] = useState<WhenTag | null>(WHEN_TAGS[0]);
  const [tool, setTool] = useState<CareTool>(CARE_TOOLS[0]);
  const [frame, setFrame] = useState<ToolFrame>(TOOL_FRAMES[0]);
  /**
   * A faixa de emergência é o primeiro elemento da rolagem, logo abaixo da banda
   * fixa. Houve uma versão com botão na barra de baixo que abria e rolava até ela;
   * a barra saiu, e com a banda no topo a faixa já é a primeira coisa que aparece
   * ao rolar — um gesto a alcança, sem `scrollIntoView` nenhum.
   */
  const [sos, setSos] = useState(false);

  const careLine = useMemo(() => buildCareLine(target, action, treat), [target, action, treat]);
  const careLineNative = useMemo(() => buildCareLine(native, action, treat), [native, action, treat]);
  const report = useMemo(() => buildReport(target, event, when, gender), [target, event, when, gender]);
  const reportNative = useMemo(() => buildReport(native, event, when, gender), [native, event, when, gender]);
  const toolPhrase = useMemo(() => buildToolPhrase(target, frame, tool), [target, frame, tool]);
  const toolPhraseNative = useMemo(() => buildToolPhrase(native, frame, tool), [native, frame, tool]);

  /**
   * A frase que vai para a banda fixa. Os três modos têm cada um a sua, mas só uma
   * existe por vez — é isso que permite um cartão só, no alto, que não rola.
   */
  const [shown, shownNative] =
    mode === 'talk' ? [careLine, careLineNative]
      : mode === 'report' ? [report, reportNative]
        : [toolPhrase, toolPhraseNative];

  // Sem voz do idioma de destino, `handlePlayAudio` recusa falar e abre o
  // aviso — falar com a voz padrão ensinaria outra pronúncia. Aqui só o botão
  // conta isso antes do toque.
  const voiceMissing = voiceStatus === 'missing';
  const Listen = voiceMissing ? SpeakerOffIcon : SpeakerIcon;
  const listen = voiceMissing ? `${t('locListen')} — ${t('voiceMissingLabel')}` : t('locListen');

  const speak = (text: string) => {
    playSound('click');
    handlePlayAudio(text, targetCountry.lang);
  };

  /**
   * Em inglês e em árabe virar o botão não muda a linha de apoio: o inglês não
   * distingue tratamento, e o árabe distingue o gênero de quem ouve, não a cortesia.
   * Sem este aviso, um botão que aparentemente não faz nada parece defeito da tela.
   */
  const treatDoesNothing = read === 'en' || read === 'ar';

  const ToolGlyph = TOOL_GLYPHS[tool.key];

  return (
    <ModuleShell
      title={t('ecTitle')}
      theme={theme}
      t={t}
      nativeCountry={nativeCountry}
      targetCountry={targetCountry}
      onGoHome={onGoHome}
      onOpenLanguageModal={onOpenLanguageModal}
      onOpenShare={onOpenShare}
      pinned={(
        <>
        {/* Seletor de modo. Falar com ela, contar dela e pedir um objeto são
            três interações diferentes; numa rolagem só dariam um cartão de
            frase ambíguo. Precedente: Maquiagem e Números. */}
        <div className="bg-gray-200/70 rounded-2xl p-1 flex gap-1" role="tablist" aria-label={t('moduleElderCare')}>
          {([['talk', 'ecModeTalk'], ['report', 'ecModeReport'], ['tools', 'ecModeTools']] as const).map(([key, labelKey]) => {
            const active = mode === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => { playSound('page-turn'); setMode(key); }}
                // py-3 e não py-2: com py-2 o botão fica em 36px de altura,
                // que é exatamente o que a auditoria 8.9 lista como defeito.
                className={`flex-1 rounded-xl py-3 text-sm font-bold tap ${active ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                style={active ? { color: theme.hex } : undefined}
              >
                <span dir="auto">{t(labelKey)}</span>
              </button>
            );
          })}
        </div>
          <PhraseCard theme={theme} phrase={shown} alt={showNative ? shownNative : null} Listen={Listen} listenLabel={listen} onSpeak={speak} />
        </>
      )}
    >


      {/* Emergência. Não é um modo que se navega: é uma coisa que se agarra,
          e por isso fica fora das abas, visível o tempo todo. Vermelha, e não
          na cor do módulo, porque aqui a cor precisa dizer outra coisa. */}
      <section className="rounded-3xl border-2 border-red-600 bg-red-50 overflow-hidden">
        <button
          onClick={() => { playSound('page-turn'); setSos((v) => !v); }}
          aria-expanded={sos}
          className="w-full px-4 py-3 flex items-center justify-between text-left tap active:scale-[0.98]"
        >
          <span className="text-base font-extrabold text-red-700 uppercase tracking-wide" dir="auto">{t('ecEmergency')}</span>
          <span className="text-xl font-extrabold text-red-700 tabular-nums">{EMERGENCY_NUMBER}</span>
        </button>
        {sos && (
          <div className="px-4 pb-4">
            <p className="text-sm text-red-900 leading-snug mb-3" dir="auto">{t('ecEmergencyHint')}</p>
            <ul className="space-y-2">
              {EMERGENCY.map((e, i) => (
                <li key={i}>
                  <button onClick={() => speak(e[target])} className="w-full bg-white rounded-2xl border border-red-200 p-3 flex items-center gap-3 text-left tap active:scale-[0.98]" aria-label={listen}>
                    <span className="flex-1 min-w-0">
                      <span className="block text-base font-bold leading-snug" dir="auto">{e[target]}</span>
                      {showNative && <span className="block text-sm text-gray-600 leading-snug" dir="auto">{e[native]}</span>}
                    </span>
                    <Listen className="w-6 h-6 flex-shrink-0 text-red-600" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ------------------------------------------------- FALAR COM ELA */}
      {mode === 'talk' && (
        <>
          <Toggle<Treat>
            theme={theme}
            label={t('ecTreatment')}
            hint={treatDoesNothing ? t('ecTreatmentSame') : undefined}
            value={treat}
            options={[{ key: 'usted', text: t('ecFormal') }, { key: 'tu', text: t('ecInformal') }]}
            onPick={setTreat}
          />

          {action.note && (
            <p className="text-sm text-gray-600 leading-snug px-1" dir="auto">{action.note[read]}</p>
          )}

          {CARE_GROUPS.map((g) => (
            <section key={g}>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2 px-1" dir="auto">{CARE_GROUP_LABELS[g][read]}</h2>
              <Chips<CareAction>
                theme={theme}
                items={CARE_ACTIONS.filter((a) => a.group === g)}
                active={action.key}
                onPick={setAction}
                label={(a) => a.labels[read]}
              />
            </section>
          ))}
        </>
      )}

      {/* -------------------------------------------- CONTAR À FAMÍLIA */}
      {mode === 'report' && (
        <>
          <Toggle<Gender>
            theme={theme}
            label={t('ecWho')}
            value={gender}
            options={[{ key: 'f', text: t('ecWhoF') }, { key: 'm', text: t('ecWhoM') }]}
            onPick={setGender}
          />

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('ecWhen')}</h2>
            {/* Um toque no marcador já escolhido desfaz a escolha: há relato
                que não quer tempo nenhum ("Habría que llamar al médico"). */}
            <Pills<WhenTag>
              theme={theme}
              items={WHEN_TAGS}
              active={when?.key ?? null}
              onPick={(w) => setWhen(when?.key === w.key ? null : w)}
              label={(w) => w.phrases[read]}
            />
          </section>

          {REPORT_GROUPS.map((g) => (
            <section key={g}>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2 px-1" dir="auto">{REPORT_GROUP_LABELS[g][read]}</h2>
              <Chips<ReportEvent>
                theme={theme}
                items={REPORT_EVENTS.filter((e) => e.group === g)}
                active={event.key}
                onPick={setEvent}
                label={(e) => e.labels[read]}
              />
            </section>
          ))}
        </>
      )}

      {/* ---------------------------------------------------- OS OBJETOS */}
      {mode === 'tools' && (
        <>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
            <div className="flex-shrink-0" style={{ color: theme.hex }}>
              {ToolGlyph && <ToolGlyph className="w-20 h-20" />}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold leading-tight" dir="auto">{tool.names[target]}</p>
              {showNative && <p className="text-sm text-gray-500" dir="auto">{tool.names[native]}</p>}
              {tool.note && <p className="text-sm text-gray-600 leading-snug mt-1" dir="auto">{tool.note[read]}</p>}
            </div>
          </div>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('ecHowToAsk')}</h2>
            <Pills<ToolFrame>
              theme={theme}
              items={TOOL_FRAMES}
              active={frame.key}
              onPick={setFrame}
              label={(f) => f.labels[read]}
            />
          </section>

          {TOOL_GROUPS.map((g) => (
            <section key={g}>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2 px-1" dir="auto">{TOOL_GROUP_LABELS[g][read]}</h2>
              <Chips<CareTool>
                theme={theme}
                items={CARE_TOOLS.filter((x) => x.group === g)}
                active={tool.key}
                onPick={setTool}
                label={(x) => x.names[read]}
                sub={(x) => {
                  const G = TOOL_GLYPHS[x.key];
                  return G ? <G className="w-8 h-8 mb-1" /> : null;
                }}
              />
            </section>
          ))}
        </>
      )}

      <p className="text-sm text-gray-500 leading-snug px-1 pt-2" dir="auto">{t('ecSafety')}</p>
    </ModuleShell>
  );
}
