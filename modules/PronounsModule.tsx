
import React, { useMemo, useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { PhraseCard } from '../components/PhraseCard';
import type { Country } from '../types';
import { SpeakerIcon, SpeakerOffIcon, InfoIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import type { VoiceStatus } from '../utils/speech';
import { toLangCode, type LangCode } from './location/data/locationData';
import {
  VERBS,
  MOOD_LABELS,
  TENSE_LABELS,
  buildPhrase,
  verbForm,
  verbByKey,
  personIn,
  pronounsFor,
  pronounBadge,
  noteFor,
  youPronoun,
  readyPhrasesFor,
  defaultComplement,
  type Pronoun,
  type Verb,
  type Mood,
  type Tense,
  type ReadyPhrase,
} from './pronouns/data/pronounsData';

/**
 * "Quero, posso, preciso" — o módulo que nasceu "Eu, você, ele".
 *
 * A auditoria de usabilidade (23/09/2026) deu nota 2 a ele, e o motivo cabe numa
 * frase: as frases que ela usa de verdade existiam, mas escondidas atrás de
 * quatro escolhas de aula de gramática. A tela agora segue a ordem de quem
 * precisa falar, não a de quem estuda:
 *
 *   1. Frases prontas — um toque, e a frase aparece lá em cima.
 *   2. Verbo e o quê — quero, posso, preciso; café, conta, médico.
 *   3. Quem — com a nota do lugar onde ela está (nunca a da Espanha fora dela).
 *   4. Quando e como — passado/futuro e pergunta/NÃO, que são o ajuste fino.
 *   5. A tabela do verbo, para tocar e ouvir cada pessoa.
 *
 * A frase segue na banda fixa, então trocar o tempo lá embaixo continua
 * mostrando o resultado na hora.
 *
 * Piso de 14px em tudo que ela lê. O português embaixo de cada botão era cinza
 * de 10px com 70% de opacidade; era justamente o que ela usava para decidir
 * onde tocar.
 */

interface PronounsModuleProps {
  nativeCountry: Country;
  targetCountry: Country;
  t: (key: string) => string;
  theme: { color: string; textColor: string; hex: string; borderColor: string };
  onGoHome: () => void;
  onOpenLanguageModal: () => void;
  onOpenShare: () => void;
  handlePlayAudio: (text: string, lang: string) => void;
  /** Voz do idioma de destino no aparelho; 'missing' apaga os botões de áudio. */
  voiceStatus?: VoiceStatus;
}

const MOODS: Mood[] = ['affirm', 'question', 'negative'];
const TENSES: Tense[] = ['past', 'present', 'future'];

/** Bonequinhos indicando quantas pessoas o pronome representa. */
const PeopleIcon: React.FC<{ plural: boolean; active: boolean }> = ({ plural, active }) => (
  <svg viewBox="0 0 32 18" className="w-7 h-4 flex-shrink-0" aria-hidden="true">
    {(plural ? [8, 16, 24] : [16]).map((cx) => (
      <g key={cx} fill={active ? 'white' : 'var(--tema-texto)'} opacity={active ? 0.95 : 0.55}>
        <circle cx={cx} cy="5" r="3.4" />
        <path d={`M${cx - 5} 17 a5 5 0 0 1 10 0 z`} />
      </g>
    ))}
  </svg>
);

/** Título de seção. 14px: é texto que ela lê, não enfeite. */
const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1" dir="auto">
    {children}
  </h2>
);

/**
 * Botão de escolha: a palavra no idioma de destino em cima (é o que ela aprende)
 * e o português embaixo, os dois legíveis. No inativo o português é cinza firme,
 * sem opacidade; no ativo, branco.
 */
const Choice: React.FC<{
  active: boolean;
  activeClass: string;
  onClick: () => void;
  main: string;
  sub?: string | null;
}> = ({ active, activeClass, onClick, main, sub }) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={`rounded-xl px-3 py-2 text-left border tap active:scale-95 ${
      active
        ? `${activeClass} text-white border-transparent shadow`
        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
    }`}
  >
    <span className="block text-base font-bold leading-tight" dir="auto">{main}</span>
    {sub && (
      <span className={`block text-sm leading-tight mt-0.5 ${active ? 'text-white' : 'text-gray-600 dark:text-slate-300'}`} dir="auto">
        {sub}
      </span>
    )}
  </button>
);

export default function PronounsModule({
  nativeCountry,
  targetCountry,
  t,
  theme,
  onGoHome,
  onOpenLanguageModal,
  onOpenShare,
  handlePlayAudio,
  voiceStatus = 'unknown',
}: PronounsModuleProps) {
  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;
  /** A língua de quem lê: rótulos, notas e frases prontas. */
  const read: LangCode = showNative ? native : target;
  const country = targetCountry.code;

  // Quem aparece aqui depende do destino: na França, "vous" uma vez só; nos EUA,
  // um "you" só, sem selo FORMAL; "vosotros" só na Espanha.
  const visible = useMemo(() => pronounsFor(target, country), [target, country]);
  const readies = useMemo(() => readyPhrasesFor(target), [target]);
  const tableRows = useMemo(
    () => [...visible].sort((a, b) => personIn(a, target) - personIn(b, target)),
    [visible, target],
  );

  // A frase de abertura é algo que ela diria hoje: "¿Puedes ayudarme?" /
  // "Pode me ajudar?" — e não "Tú quieres un café", que é afirmar para
  // outra pessoa o que ela quer. Na França, com desconhecido, é "vous".
  //
  // O pronome escolhido é guardado junto com a língua para a qual foi escolhido:
  // se o destino muda, ou se o escolhido não existe no destino novo (vosotros
  // fora da Espanha), a tela volta ao "você" daquele lugar sem precisar de efeito.
  const [pick, setPick] = useState<{ key: string; para: LangCode } | null>(null);
  const [verb, setVerb] = useState<Verb>(() => verbByKey('poder'));
  const [compKey, setCompKey] = useState<string | null>('help');
  const [mood, setMood] = useState<Mood>('question');
  const [tense, setTense] = useState<Tense>('present');
  /**
   * A frase pronta tocada por último. Enquanto nada lá embaixo mudar, a banda
   * mostra a frase como se diz no balcão, sem o pronome ("¿Puedes ayudarme?").
   * Qualquer seletor desliga isto, e a frase volta a mostrar o pronome, porque
   * aí ensinar o pronome é o objetivo. Abre ligada: a frase de abertura é a
   * primeira frase pronta.
   */
  const [prontaKey, setProntaKey] = useState<string | null>('help');

  const pronoun: Pronoun =
    (pick && pick.para === target && visible.find((p) => p.key === pick.key)) || youPronoun(target);

  const comp = useMemo(
    () => verb.complements.find((c) => c.key === compKey) ?? null,
    [verb, compKey],
  );

  /** A frase pronta que está na tela agora, se ainda for ela (trocar de destino pode desfazê-la). */
  const pronta = readies.find(
    (r) => r.key === prontaKey
      && r.pronoun.key === pronoun.key && r.verb.key === verb.key && r.comp.key === compKey
      && r.mood === mood && tense === 'present',
  ) ?? null;
  const opcoes = { semSujeito: !!pronta };

  const phrase = buildPhrase(target, pronoun, verb, comp, mood, tense, opcoes);
  const phraseNative = buildPhrase(native, pronoun, verb, comp, mood, tense, opcoes);

  // Sem voz do idioma de destino, `handlePlayAudio` recusa falar e abre o
  // aviso — falar com a voz padrão ensinaria outra pronúncia. Aqui só o botão
  // conta isso antes do toque.
  const voiceMissing = voiceStatus === 'missing';
  const Listen = voiceMissing ? SpeakerOffIcon : SpeakerIcon;
  const audioLabel = (base: string) => (voiceMissing ? `${base} — ${t('voiceMissingLabel')}` : base);

  const speak = (text: string) => {
    playSound('click');
    handlePlayAudio(text, targetCountry.lang);
  };

  const choosePronoun = (p: Pronoun) => {
    playSound('click');
    setProntaKey(null);
    setPick({ key: p.key, para: target });
  };

  const pickVerb = (v: Verb) => {
    playSound('click');
    setProntaKey(null);
    setVerb(v);
    // Cada verbo tem seus próprios complementos, então o antigo não serve. Em
    // "falar", entra a língua do lugar: "Je parle français" na França.
    setCompKey(defaultComplement(v, target));
  };

  /** Uma frase pronta só chama os mesmos setters dos botões lá de baixo. */
  const applyReady = (r: ReadyPhrase) => {
    playSound('click');
    setProntaKey(r.key);
    setPick({ key: r.pronoun.key, para: target });
    setVerb(r.verb);
    setCompKey(r.comp.key);
    setMood(r.mood);
    setTense('present');
  };

  const readyActive = (r: ReadyPhrase) => pronta?.key === r.key;

  const note = noteFor(pronoun, target, country, read);

  return (
    <ModuleShell
      title={t('pronTitle')}
      dica={t('hintPronouns')}
      theme={theme}
      t={t}
      nativeCountry={nativeCountry}
      targetCountry={targetCountry}
      onGoHome={onGoHome}
      onOpenLanguageModal={onOpenLanguageModal}
      onOpenShare={onOpenShare}
      pinned={(
        <PhraseCard
          theme={theme}
          phrase={phrase}
          alt={showNative ? phraseNative : null}
          Listen={Listen}
          listenLabel={audioLabel(t('locListen'))}
          onSpeak={speak}
        />
      )}
    >
      {/* 1. Frases prontas. O rótulo é a própria frase na língua de quem lê, saída
          do `buildPhrase`: o botão nunca promete uma coisa e monta outra. */}
      <section>
        <Heading>{t('pronReady')}</Heading>
        <div className="grid grid-cols-2 gap-2">
          {readies.map((r, i) => {
            const active = readyActive(r);
            // Com número ímpar de frases, a última ocupa a linha inteira em vez de
            // ficar sozinha pela metade.
            const wide = readies.length % 2 === 1 && i === readies.length - 1;
            return (
              <button
                key={r.key}
                onClick={() => applyReady(r)}
                aria-pressed={active}
                // Escala por tamanho de alvo (AGENTS.md §7.5): meia largura é chip,
                // a linha inteira é cartão, e 5% numa faixa larga lê como tela pulando.
                className={`rounded-2xl border px-3 py-3 text-left text-base font-semibold leading-snug tap ${wide ? 'col-span-2 active:scale-[0.97]' : 'active:scale-95'} ${
                  active
                    ? `${theme.color} text-white border-transparent shadow-md`
                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border-gray-100 dark:border-slate-700'
                }`}
              >
                <span dir="auto">{buildPhrase(read, r.pronoun, r.verb, r.comp, r.mood, 'present', { semSujeito: true })}</span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-300 leading-snug mt-2 px-1" dir="auto">{t('pronReadyHint')}</p>
      </section>

      {/* 2. Verbos — é o que faz ela pensar "ah, aqui eu peço coisas". */}
      <section>
        <Heading>{t('pronVerb')}</Heading>
        <div className="flex flex-wrap gap-2">
          {VERBS.map((v) => (
            <Choice
              key={v.key}
              active={v.key === verb.key}
              activeClass={theme.color}
              onClick={() => pickVerb(v)}
              main={v.labels[target]}
              sub={showNative ? v.labels[native] : null}
            />
          ))}
        </div>
      </section>

      {/* Complementos */}
      <section>
        <Heading>{t('pronWhat')}</Heading>
        <div className="flex flex-wrap gap-2">
          {/* "precisar de" sem objeto vira frase truncada em pt/fr/it, então
              o verbo declara que exige complemento e o chip não aparece. */}
          {!verb.requiresComplement && (
            <Choice
              active={compKey === null}
              activeClass={theme.color}
              onClick={() => { playSound('toggle'); setProntaKey(null); setCompKey(null); }}
              main={t('pronNothing')}
            />
          )}
          {verb.complements.map((c) => (
            <Choice
              key={c.key}
              active={compKey === c.key}
              activeClass={theme.color}
              onClick={() => { playSound('click'); setProntaKey(null); setCompKey(c.key); }}
              main={c.texts[target]}
              sub={showNative ? c.texts[native] : null}
            />
          ))}
        </div>
      </section>

      {/* 3. Pronomes. A nota vem DEPOIS da grade: em cima, ela empurrava a grade
          para baixo toda vez que aparecia ou sumia, bem debaixo do dedo. */}
      <section>
        <Heading>{t('pronWho')}</Heading>
        <div className="grid grid-cols-2 gap-2">
          {visible.map((p) => {
            const active = p.key === pronoun.key;
            const badge = pronounBadge(p, target, country);
            return (
              <button
                key={p.key}
                onClick={() => choosePronoun(p)}
                aria-pressed={active}
                className={`rounded-2xl border p-2.5 flex items-center gap-2.5 text-left tap active:scale-95 ${active ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border-gray-100 dark:border-slate-700'}`}
              >
                <PeopleIcon plural={p.person >= 3} active={active} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-base font-bold leading-tight" dir="auto">{p.words[target]}</span>
                    {badge && (
                      // Selo decorativo que repete informação: o único texto de 12px tolerado.
                      <span
                        className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={active ? { backgroundColor: 'rgba(255,255,255,0.25)' } : { backgroundColor: `${theme.hex}18`, color: 'var(--tema-texto)' }}
                        dir="auto"
                      >
                        {badge === 'formal' ? t('pronFormal') : t('pronSpainOnly')}
                      </span>
                    )}
                  </span>
                  {showNative && (
                    <span className={`block text-sm leading-tight mt-0.5 ${active ? 'text-white' : 'text-gray-600 dark:text-slate-300'}`} dir="auto">
                      {p.words[native]}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {note && (
          <div
            className="mt-3 rounded-2xl p-3 flex items-start gap-2 border-l-4"
            style={{ backgroundColor: `${theme.hex}0f`, borderLeftColor: 'var(--tema-texto)' }}
          >
            <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--tema-texto)' }} />
            <p className="text-base text-gray-800 dark:text-slate-100 leading-snug" dir="auto">{note}</p>
          </div>
        )}
      </section>

      {/*
        4. Quando e como. São duas dimensões diferentes, então recebem formas
        diferentes. Quando: seletor único dentro de um trilho afundado (a pastilha
        que pula JÁ é o retorno, por isso sem escala). Tipo de frase: botões soltos
        e arredondados, com escala de chip. Ficam depois do verbo e da pessoa de
        propósito: são o ajuste fino, e a frase fixa lá em cima mostra a mudança.
      */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2" dir="auto">{t('pronWhen')}</h2>
        <div className="flex gap-1 rounded-xl bg-gray-200/70 dark:bg-slate-700/70 p-1">
          {TENSES.map((tn) => (
            <button
              key={tn}
              onClick={() => { playSound('toggle'); setProntaKey(null); setTense(tn); }}
              aria-pressed={tense === tn}
              className={`tap flex-1 rounded-lg py-2.5 text-sm font-bold ${tense === tn ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-gray-600 dark:text-slate-300'}`}
              style={tense === tn ? { color: 'var(--tema-texto)' } : undefined}
            >
              <span dir="auto">{TENSE_LABELS[tn][read]}</span>
            </button>
          ))}
        </div>

        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mt-4 mb-2" dir="auto">{t('pronHow')}</h2>
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => { playSound('toggle'); setProntaKey(null); setMood(m); }}
              aria-pressed={mood === m}
              className={`tap active:scale-95 flex-1 rounded-full px-2 py-2.5 text-sm font-bold border ${
                mood === m ? `${theme.color} text-white border-transparent shadow` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700'
              }`}
            >
              <span dir="auto">{MOOD_LABELS[m][read]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. Tabela do verbo escolhido, na ordem das pessoas. Cada linha fala. */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400" dir="auto">
          {verb.labels[target]} <span aria-hidden="true">·</span>{' '}
          <span className="normal-case tracking-normal">{TENSE_LABELS[tense][read]}</span>
        </h2>
        <p className="text-sm text-gray-600 dark:text-slate-300 leading-snug mt-1 mb-2" dir="auto">{t('pronTapToHear')}</p>
        <ul className="divide-y divide-gray-100 dark:divide-slate-700">
          {tableRows.map((p) => {
            const active = p.key === pronoun.key;
            return (
              <li key={p.key}>
                <button
                  // `speak` já toca o clique; `choosePronoun` tocaria de novo.
                  onClick={() => { setProntaKey(null); setPick({ key: p.key, para: target }); speak(buildPhrase(target, p, verb, null, 'affirm', tense)); }}
                  className="w-full py-2.5 flex items-center gap-3 text-left tap active:scale-[0.98]"
                >
                  <span
                    className={`text-base w-24 flex-shrink-0 ${active ? 'font-bold' : 'text-gray-600 dark:text-slate-300'}`}
                    style={active ? { color: 'var(--tema-texto)' } : undefined}
                    dir="auto"
                  >
                    {p.words[target]}
                  </span>
                  <span
                    className={`text-base font-bold flex-1 min-w-0 leading-snug ${active ? '' : 'text-gray-800 dark:text-slate-100'}`}
                    style={active ? { color: 'var(--tema-texto)' } : undefined}
                    dir="auto"
                  >
                    {verbForm(verb, p, target, tense)}
                  </span>
                  <Listen aria-hidden="true" className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--tema-texto)' }} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </ModuleShell>
  );
}
