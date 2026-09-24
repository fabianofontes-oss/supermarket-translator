import React, { useId, useMemo, useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { ModeTabs, panelProps } from '../components/ModeTabs';
import { PhraseCard } from '../components/PhraseCard';
import type { Country } from '../types';
import { ChevronDownIcon, SpeakerIcon, SpeakerOffIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import type { VoiceStatus } from '../utils/speech';
import { toLangCode } from './location/data/locationData';
import { TOOL_GLYPHS } from './eldercare/ElderCareGlyphs';
import {
  CARE_ACTIONS, CARE_GROUPS, CARE_GROUP_LABELS,
  REPORT_EVENTS, REPORT_GROUPS, REPORT_GROUP_LABELS, WHEN_TAGS,
  CARE_TOOLS, TOOL_GROUPS, TOOL_GROUP_LABELS, TOOL_FRAMES,
  EMERGENCY, emergencyNumberFor,
  buildCareLine, buildReport, buildToolPhrase, reportLabel, visibleNote,
  type CareAction, type CareTool, type ReportEvent, type ToolFrame, type WhenTag,
  type Treat, type Gender,
} from './eldercare/data/elderCareData';

type Theme = { color: string; textColor: string; hex: string; borderColor: string };

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
 * SOBRE O TAMANHO DA LETRA: este módulo foi o primeiro a subir o piso.
 *
 * Aqui o piso é `text-sm` (14px) e o corpo é `text-base` (16px), porque quem usa
 * esta tela lê de pé, com uma pessoa apoiada no braço, e muitas vezes de óculos.
 * Nasceu como divergência deliberada (PROJECT_CONTEXT.md) e virou regra do app.
 *
 * Os ajudantes abaixo ficam FORA do componente de propósito. Definidos dentro,
 * seriam funções novas a cada render, e o React desmontaria e remontaria a subárvore
 * inteira a cada toque — o foco do teclado escaparia no meio da escolha.
 */

/** Alternador de duas posições. Serve ao tratamento e a quem se cuida. */
function Toggle<T extends string>({ label, hints = [], value, options, onPick }: {
  label: string; hints?: string[]; value: T;
  options: { key: T; text: string }[];
  onPick: (v: T) => void;
}) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2" dir="auto">{label}</h2>
      <div className="bg-gray-200/70 dark:bg-slate-700/70 rounded-2xl p-1 flex gap-1">
        {options.map((o) => {
          const active = o.key === value;
          return (
            <button
              key={o.key}
              aria-pressed={active}
              onClick={() => { playSound('toggle'); onPick(o.key); }}
              className={`flex-1 rounded-xl py-3 text-base font-bold tap ${active ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-gray-600 dark:text-slate-300'}`}
              style={active ? { color: 'var(--tema-texto)' } : undefined}
            >
              <span dir="auto">{o.text}</span>
            </button>
          );
        })}
      </div>
      {hints.map((h) => (
        <p key={h} className="text-base text-gray-700 dark:text-slate-200 leading-snug mt-2" dir="auto">{h}</p>
      ))}
    </section>
  );
}

/**
 * Grade de escolhas rotuladas. Uma seção por grupo.
 *
 * `cols={1}` é para quando o rótulo É a frase ("Quer que eu ajude no banho?"):
 * uma coluna, 16px, a frase inteira à vista. Com duas colunas e 14px, frase de
 * cinco palavras quebra em três linhas e vira sopa. `cols={2}` fica para os
 * objetos, em que o rótulo é um nome curto com desenho em cima.
 */
function Chips<T extends { key: string }>({ theme, items, active, onPick, label, sub, cols = 2 }: {
  theme: Theme; items: T[]; active: string; onPick: (item: T) => void;
  label: (item: T) => string; sub?: (item: T) => React.ReactNode;
  cols?: 1 | 2;
}) {
  const umaColuna = cols === 1;
  return (
    <div className={umaColuna ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-2'}>
      {items.map((item) => {
        const on = item.key === active;
        return (
          <button
            key={item.key}
            aria-pressed={on}
            onClick={() => { playSound('click'); onPick(item); }}
            // Linha de largura inteira escala menos que o chip: 5% numa faixa larga
            // lê como a tela pulando (AGENTS.md §7.5).
            className={`rounded-2xl border p-3 text-left tap ${umaColuna ? 'active:scale-[0.98]' : 'active:scale-95'} ${on ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700'}`}
          >
            {sub?.(item)}
            <span className={umaColuna ? 'block text-base font-bold leading-snug' : 'block text-sm font-bold leading-tight'} dir="auto">{label(item)}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Fila de escolhas soltas, para quadros e marcadores de tempo.
 *
 * `disabled`: a fila fica na tela, mas não responde nem mostra escolha. É para o
 * relato que não aceita tempo — sumir com a fila faria a lista de baixo subir
 * uns 100px, debaixo do dedo que acabou de tocar. O texto continua legível (a
 * regra de leitura do app), e o que diz "não dá" é o fundo sem cor, a borda
 * tracejada e o cursor, como nas telhas fechadas do hub.
 */
function Pills<T extends { key: string }>({ theme, items, active, onPick, label, disabled = false }: {
  theme: Theme; items: T[]; active: string | null; onPick: (item: T) => void; label: (item: T) => string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const on = !disabled && item.key === active;
        return (
          <button
            key={item.key}
            aria-pressed={on}
            disabled={disabled}
            onClick={() => { playSound('toggle'); onPick(item); }}
            className={`rounded-xl px-3 py-2.5 text-base font-bold border ${
              disabled
                ? 'bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-300 border-dashed border-gray-300 dark:border-slate-600 cursor-not-allowed'
                : `tap active:scale-95 ${on ? `${theme.color} text-white border-transparent shadow` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700'}`
            }`}
          >
            <span dir="auto">{label(item)}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * A nota de um item, desenhada DENTRO da seção do grupo dele, logo abaixo dos
 * botões. Antes ela entrava acima da lista inteira: ao tocar num botão com nota,
 * tudo descia três linhas e o botão fugia do dedo; ao tocar noutro, subia de novo.
 * Abaixo do grupo tocado, o que se mexe é só o que está depois dele.
 */
function Nota({ texto }: { texto: string | null }) {
  if (!texto) return null;
  return <p className="text-base text-gray-700 dark:text-slate-200 leading-snug px-1 mt-2" dir="auto">{texto}</p>;
}

/** Fone. Autoral, na convenção do projeto (AGENTS.md §7.2). */
const PhoneGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    strokeWidth={1.8} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
    className={className} aria-hidden="true"
  >
    <path d="M5 3.5h3.2l1.6 4.2-2.1 1.5a11.5 11.5 0 0 0 7.1 7.1l1.5-2.1 4.2 1.6v3.2a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2Z" />
  </svg>
);

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
  /** Nota e dica que falam da Espanha só aparecem com destino Espanha. */
  const naEspanha = targetCountry.code === 'es';
  const emergencia = emergencyNumberFor(targetCountry.code);

  /** Liga cada aba ao seu painel. `useId` evita colisão se dois módulos
   *  chegarem a existir na mesma árvore. */
  const tabsId = useId();
  const sosId = useId();
  const [mode, setMode] = useState<'talk' | 'report' | 'tools'>('talk');

  /**
   * Os dois eixos moram em modos diferentes, e é de propósito: `treat` só existe
   * onde se fala COM ela, `gender` só onde se fala DELA. Os dois seletores nunca
   * aparecem na mesma tela, então a combinação — que dobraria de novo cada frase —
   * fica impossível pelo uso, e não só pelo tipo. Ver o cabeçalho de `elderCareData.ts`.
   */
  const [treat, setTreat] = useState<Treat>('usted');
  const [gender, setGender] = useState<Gender>('f');

  /**
   * O inglês não distingue tratamento: a frase falada sai igual nos dois lados, e o
   * seletor parecia botão quebrado. Com destino inglês ele some, e o tratamento
   * fica no formal — senão a linha de apoio em português seguiria um seletor que
   * ninguém vê mais.
   */
  const treatVisible = target !== 'en';
  const treatNow: Treat = treatVisible ? treat : 'usted';

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

  const careLine = useMemo(() => buildCareLine(target, action, treatNow), [target, action, treatNow]);
  const careLineNative = useMemo(() => buildCareLine(native, action, treatNow), [native, action, treatNow]);
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
  const treatHints = [
    ...(naEspanha ? [t('ecUstedTip')] : []),
    ...(treatDoesNothing ? [t('ecTreatmentSame')] : []),
  ];

  const talkNote = visibleNote(action, targetCountry.code, read);
  const toolNote = visibleNote(tool, targetCountry.code, read);

  const ToolGlyph = TOOL_GLYPHS[tool.key];

  return (
    <ModuleShell
      title={t('ecTitle')}
      dica={t('hintElderCare')}
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
          <ModeTabs<'talk' | 'report' | 'tools'>
            idPrefix={tabsId}
            label={t('moduleElderCare')}
            value={mode}
            options={[{ key: 'talk', label: t('ecModeTalk') }, { key: 'report', label: t('ecModeReport') }, { key: 'tools', label: t('ecModeTools') }]}
            onChange={setMode}
            theme={theme}
          />
          <PhraseCard theme={theme} phrase={shown} alt={showNative ? shownNative : null} Listen={Listen} listenLabel={listen} onSpeak={speak} />
        </>
      )}
    >
      {/* O painel que as abas apontam. Só o do modo escolhido existe, então
          um `div` basta: ele assume o id e o rótulo do modo atual. */}
      <div {...panelProps(tabsId, mode)} className="space-y-4">

        {/* Emergência. Não é um modo que se navega: é uma coisa que se agarra,
            e por isso fica fora das abas, visível o tempo todo. Vermelha, e não
            na cor do módulo, porque aqui a cor precisa dizer outra coisa.

            A faixa fechada diz que ABRE (· frases, e a seta): antes mostrava só
            "112" e parecia botão de ligar — quem estava em pânico tocava e caía
            numa lista. O ligar de verdade mora DENTRO, no topo da parte aberta: a
            um toque de quem abriu, e longe do toque acidental. */}
        <section className="rounded-3xl border-2 border-red-600 bg-red-50 dark:bg-red-950 overflow-hidden">
          <button
            onClick={() => { playSound('page-turn'); setSos((v) => !v); }}
            aria-expanded={sos}
            // Só aponta quando a parte aberta existe: IDREF pendurada é defeito
            // (mesma regra do `ModeTabs`).
            aria-controls={sos ? sosId : undefined}
            className="w-full px-4 py-3 flex items-center gap-3 text-left tap active:scale-[0.98]"
          >
            <span className="flex-1 min-w-0 text-base font-extrabold text-red-700 dark:text-red-300 uppercase tracking-wide" dir="auto">
              {`${t('ecEmergency')} · ${t('ecEmergencyPhrases')}`}
            </span>
            <span className="text-xl font-extrabold text-red-700 dark:text-red-300 tabular-nums">{emergencia}</span>
            <ChevronDownIcon
              aria-hidden="true"
              strokeWidth={1.8}
              className={`w-6 h-6 flex-shrink-0 text-red-700 dark:text-red-300 transition-transform ${sos ? 'rotate-180' : ''}`}
            />
          </button>
          {sos && (
            <div id={sosId} className="px-4 pb-4 space-y-3">
              <a
                href={`tel:${emergencia}`}
                onClick={() => playSound('click')}
                className="w-full min-h-[44px] rounded-2xl bg-red-600 text-white px-4 py-3 flex items-center justify-center gap-2 text-lg font-extrabold tap active:scale-[0.98]"
              >
                <PhoneGlyph className="w-6 h-6 flex-shrink-0" />
                <span className="tabular-nums" dir="auto">{`${t('ecCall')} ${emergencia}`}</span>
              </a>
              <p className="text-base text-red-900 dark:text-red-300 leading-snug" dir="auto">{t('ecEmergencyHint')}</p>
              <ul className="space-y-2">
                {EMERGENCY.map((e, i) => (
                  <li key={i}>
                    <button onClick={() => speak(e[target])} className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-800 p-3 flex items-center gap-3 text-left tap active:scale-[0.98]" aria-label={listen}>
                      <span className="flex-1 min-w-0">
                        <span className="block text-base font-bold leading-snug" dir="auto">{e[target]}</span>
                        {showNative && <span className="block text-sm text-gray-600 dark:text-slate-300 leading-snug" dir="auto">{e[native]}</span>}
                      </span>
                      <Listen className="w-6 h-6 flex-shrink-0 text-red-600 dark:text-red-300" />
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
            {treatVisible && (
              <Toggle<Treat>
                label={t('ecTreatment')}
                hints={treatHints}
                value={treat}
                options={[{ key: 'usted', text: t('ecFormal') }, { key: 'tu', text: t('ecInformal') }]}
                onPick={setTreat}
              />
            )}

            {/* O botão mostra a PRÓPRIA frase, na língua de quem lê e já no
                tratamento escolhido. Antes mostrava "Fome", "O banho", "A
                temperatura" — e cada toque era uma surpresa lá em cima. */}
            {CARE_GROUPS.map((g) => (
              <section key={g}>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1" dir="auto">{CARE_GROUP_LABELS[g][read]}</h2>
                <Chips<CareAction>
                  theme={theme}
                  cols={1}
                  items={CARE_ACTIONS.filter((a) => a.group === g)}
                  active={action.key}
                  onPick={setAction}
                  label={(a) => buildCareLine(read, a, treatNow)}
                />
                {action.group === g && <Nota texto={talkNote} />}
              </section>
            ))}
          </>
        )}

        {/* -------------------------------------------- CONTAR À FAMÍLIA */}
        {mode === 'report' && (
          <>
            <Toggle<Gender>
              label={t('ecWho')}
              value={gender}
              options={[{ key: 'f', text: t('ecWhoF') }, { key: 'm', text: t('ecWhoM') }]}
              onPick={setGender}
            />

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1" dir="auto">{t('ecWhen')}</h2>
              {/* Um toque no marcador já escolhido desfaz a escolha. O relato
                  que não aceita tempo nenhum ("Habría que llamar al médico")
                  desliga a fila sozinho, sem apagar o que estava escolhido: ao
                  voltar para outro relato, o "Hoje" continua lá. */}
              <Pills<WhenTag>
                theme={theme}
                items={WHEN_TAGS}
                active={when?.key ?? null}
                onPick={(w) => setWhen(when?.key === w.key ? null : w)}
                label={(w) => w.phrases[read]}
                disabled={!!event.semTempo}
              />
            </section>

            {/* Rótulo calculado: a oração do relato, sem o tempo. Segue o seletor
                de gênero junto com o cartão ("Esteve tranquila" / "Esteve
                tranquilo"), então o botão nunca contradiz a frase lá em cima. */}
            {REPORT_GROUPS.map((g) => (
              <section key={g}>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1" dir="auto">{REPORT_GROUP_LABELS[g][read]}</h2>
                <Chips<ReportEvent>
                  theme={theme}
                  cols={1}
                  items={REPORT_EVENTS.filter((e) => e.group === g)}
                  active={event.key}
                  onPick={setEvent}
                  label={(e) => reportLabel(read, e, gender)}
                />
              </section>
            ))}
          </>
        )}

        {/* --------------------------------------------------- PEDIR COISAS */}
        {mode === 'tools' && (
          <>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-4">
              <div className="flex-shrink-0" style={{ color: 'var(--tema-texto)' }}>
                {ToolGlyph && <ToolGlyph className="w-20 h-20" />}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold leading-tight" dir="auto">{tool.names[target]}</p>
                {showNative && <p className="text-base text-gray-600 dark:text-slate-300" dir="auto">{tool.names[native]}</p>}
              </div>
            </div>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1" dir="auto">{t('ecHowToAsk')}</h2>
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
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1" dir="auto">{TOOL_GROUP_LABELS[g][read]}</h2>
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
                {tool.group === g && <Nota texto={toolNote} />}
              </section>
            ))}
          </>
        )}

        <p className="text-sm text-gray-600 dark:text-slate-300 leading-snug px-1 pt-2" dir="auto">{t('ecSafety')}</p>
      </div>
    </ModuleShell>
  );
}
