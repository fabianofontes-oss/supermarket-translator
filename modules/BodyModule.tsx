
import React, { useId, useMemo, useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { PhraseCard } from '../components/PhraseCard';
import type { Country } from '../types';
import { ChevronDownIcon, SpeakerIcon, SpeakerOffIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import type { VoiceStatus } from '../utils/speech';
import { toLangCode } from './location/data/locationData';
import {
  BODY_PARTS,
  LOCAL_SYMPTOMS,
  GENERAL_SYMPTOMS,
  DURATIONS,
  BODY_QUESTIONS,
  BODY_URGENT,
  FACE,
  MARKER_HIT_R,
  buildComplaint,
  partName,
  type BodyPart,
  type Symptom,
  type Duration,
} from './body/data/bodyData';

interface BodyModuleProps {
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

/**
 * Títulos das seções: frase normal, 16px, e não mais versalete de 12px em cinza
 * claro. Os títulos deste módulo viraram perguntas para ela ("Como dói nesse
 * lugar?", "Não achou no boneco? Escolha aqui") — em maiúsculas e espaçadas elas
 * perdiam o desenho das palavras, que é o que quem lê pouco usa para ler.
 */
const TITULO = 'text-base font-bold text-gray-700 dark:text-slate-200 mb-2 px-1';

/** Português da linha de apoio: nunca apagado, nunca abaixo de 14px. */
const apoio = (active: boolean) => (active ? 'text-white' : 'text-gray-600 dark:text-slate-300');

export default function BodyModule({
  nativeCountry,
  targetCountry,
  t,
  theme,
  onGoHome,
  onOpenLanguageModal,
  onOpenShare,
  handlePlayAudio,
  voiceStatus = 'unknown',
}: BodyModuleProps) {
  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;
  /** A língua em que ela lê — a da linha de apoio, ou a do destino se forem a mesma. */
  const read = showNative ? native : target;
  const urgenteId = useId();

  const [symptom, setSymptom] = useState<Symptom>(LOCAL_SYMPTOMS[0]);
  const [part, setPart] = useState<BodyPart>(BODY_PARTS[0]);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [urgente, setUrgente] = useState(false);

  const sentence = useMemo(() => buildComplaint(target, symptom, part, duration), [target, symptom, part, duration]);
  const sentenceNative = useMemo(() => buildComplaint(native, symptom, part, duration), [native, symptom, part, duration]);

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

  // Tocar no corpo significa "dói aqui": volta para um sintoma localizado se preciso.
  const pickPart = (p: BodyPart) => {
    playSound('click');
    setPart(p);
    if (!symptom.local) setSymptom(LOCAL_SYMPTOMS[0]);
  };

  const pickSymptom = (s: Symptom) => {
    playSound('toggle');
    setSymptom(s);
  };

  const pickDuration = (d: Duration) => {
    playSound('toggle');
    setDuration((cur) => (cur?.key === d.key ? null : d));
  };

  // Com um sintoma geral (febre, tosse) a parte do corpo sai da frase, e por isso
  // nenhuma parte fica marcada. Antes os botões também ficavam a 45% de
  // opacidade — e o português ia junto, ilegível. Nenhum marcado já diz isso.
  const partsDimmed = !symptom.local;

  const chip = (active: boolean) =>
    `rounded-xl px-3 py-2 tap active:scale-95 border ${
      active ? `${theme.color} text-white border-transparent shadow` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
    }`;

  /** Idioma de destino em cima (é o que ela aprende), português embaixo; os dois ≥ 14px. */
  const symptomButton = (s: Symptom) => {
    const active = s.key === symptom.key;
    return (
      <button
        key={s.key}
        onClick={() => pickSymptom(s)}
        aria-pressed={active}
        className={`min-w-0 rounded-2xl border p-2 flex flex-col items-center gap-1 tap active:scale-95 ${active ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700'}`}
      >
        <span className="text-2xl leading-none" aria-hidden="true">{s.emoji}</span>
        <span className="w-full text-base font-bold leading-tight text-center break-words" dir="auto">{s.labels[target]}</span>
        {showNative && <span className={`w-full text-sm leading-tight text-center break-words ${apoio(active)}`} dir="auto">{s.labels[native]}</span>}
      </button>
    );
  };

  return (
    <ModuleShell
      title={t('moduleBody')}
      theme={theme}
      t={t}
      nativeCountry={nativeCountry}
      targetCountry={targetCountry}
      onGoHome={onGoHome}
      onOpenLanguageModal={onOpenLanguageModal}
      onOpenShare={onOpenShare}
      dica={t('hintBody')}
      pinned={(
        <>
          {/* Frase */}
          <PhraseCard
            theme={theme}
            phrase={sentence}
            alt={showNative ? sentenceNative : null}
            Listen={Listen}
            listenLabel={audioLabel(t('locListen'))}
            onSpeak={speak}
          />
        </>
      )}
    >

      {/* Urgência. Não é uma seção que se procura: é uma coisa que se agarra, e
          por isso fica no topo, fechada numa linha só, antes do boneco. Vermelha,
          e não na cor do módulo, porque aqui a cor precisa dizer outra coisa. Mesmo
          padrão da Emergência do Cuidar de idosos. */}
      <section className="rounded-3xl border-2 border-red-600 bg-red-50 dark:bg-red-950 overflow-hidden">
        <button
          onClick={() => { playSound('page-turn'); setUrgente((v) => !v); }}
          aria-expanded={urgente}
          // Só aponta quando a lista existe: IDREF pendurada é defeito (mesma
          // regra da Emergência do Cuidar de idosos e do `ModeTabs`).
          aria-controls={urgente ? urgenteId : undefined}
          className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left tap active:scale-[0.98]"
        >
          <span className="text-base font-extrabold text-red-700 dark:text-red-300 uppercase tracking-wide" dir="auto">{t('bodyUrgent')}</span>
          <ChevronDownIcon
            aria-hidden="true"
            strokeWidth={2}
            className={`w-6 h-6 flex-shrink-0 text-red-700 dark:text-red-300 transition-transform ${urgente ? 'rotate-180' : ''}`}
          />
        </button>
        {urgente && (
          <ul id={urgenteId} className="px-4 pb-4 space-y-2">
            {BODY_URGENT.map((q, i) => (
              <li key={i}>
                <button
                  onClick={() => speak(q[target])}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-800 p-3 flex items-center gap-3 text-left tap active:scale-[0.98]"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-base font-bold leading-snug" dir="auto">{q[target]}</span>
                    {showNative && <span className="block text-sm text-gray-600 dark:text-slate-300 leading-snug" dir="auto">{q[native]}</span>}
                  </span>
                  <Listen aria-hidden="true" className="w-6 h-6 flex-shrink-0 text-red-600 dark:text-red-300" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Boneco */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-3">
        {/* Sem esta linha, as bolinhas pareciam juntas do desenho e a frase de
            exemplo parecia escolha já feita pelo app. */}
        <p className="text-center text-base font-bold text-gray-800 dark:text-slate-100 mb-2" dir="auto">{t('bodyTapHint')}</p>
        <svg viewBox="0 0 200 400" className="w-full max-w-[210px] mx-auto block select-none" style={{ aspectRatio: '1 / 2' }}>
          <g fill="var(--art-edge)" stroke="var(--art-fill)" strokeWidth="2">
            {/* Orelhas antes da cabeça: a cabeça cobre a metade de dentro. */}
            {FACE.ears.map(([cx, cy]) => <ellipse key={cx} cx={cx} cy={cy} rx="6" ry="9" />)}
            <circle cx="100" cy="42" r="30" />
            <rect x="92" y="68" width="16" height="18" />
            <rect x="66" y="82" width="68" height="112" rx="22" />
            <rect x="44" y="88" width="20" height="112" rx="10" />
            <rect x="136" y="88" width="20" height="112" rx="10" />
            <circle cx="54" cy="205" r="11" />
            <circle cx="146" cy="205" r="11" />
            <rect x="74" y="188" width="22" height="152" rx="11" />
            <rect x="104" y="188" width="22" height="152" rx="11" />
            <ellipse cx="85" cy="350" rx="16" ry="9" />
            <ellipse cx="115" cy="350" rx="16" ry="9" />
          </g>

          {/* Rosto: dá ao olho e ao dente onde se apoiar. Boca reta, nem sorrindo
              nem chorando — o boneco é um mapa, não um personagem. */}
          <g fill="var(--art-line)">
            {FACE.eyes.map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="3.5" />)}
          </g>
          <line
            x1={FACE.mouth.x1} y1={FACE.mouth.y} x2={FACE.mouth.x2} y2={FACE.mouth.y}
            stroke="var(--art-line)" strokeWidth="3" strokeLinecap="round"
          />

          {/* Marcadores tocáveis. O contorno na cor do módulo (pelo token, que
              funciona no escuro) diz "isto se toca"; o cinza de antes dizia
              "isto é enfeite". */}
          {BODY_PARTS.filter((p) => p.x !== undefined).map((p) => {
            const active = p.key === part.key && !partsDimmed;
            return (
              <g key={p.key} onClick={() => pickPart(p)} style={{ cursor: 'pointer' }}>
                <circle cx={p.x} cy={p.y} r={MARKER_HIT_R} fill="transparent" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? 11 : 8}
                  fill={active ? theme.hex : 'var(--art-plate)'}
                  stroke={active ? 'var(--art-plate)' : 'var(--tema-texto)'}
                  strokeWidth={active ? 3 : 2.5}
                  style={{ transition: 'r var(--scene-duration) var(--ease-out), fill var(--scene-duration) var(--ease-out), stroke-width var(--scene-duration) var(--ease-out)' }}
                />
              </g>
            );
          })}
        </svg>
        {/* O nome do que ela tocou, na língua dela. A altura fica reservada mesmo
            vazia: sem isso, escolher "febre" lá embaixo encolhia o cartão e a
            grade pulava debaixo do dedo. */}
        <p className="mt-2 min-h-[1.5rem] text-center text-base font-bold text-gray-800 dark:text-slate-100" dir="auto" aria-live="polite">
          {symptom.local ? partName(part, read) : ''}
        </p>
      </div>

      {/* Sintoma localizado */}
      <section>
        <h2 className={TITULO} dir="auto">{t('bodyWhereHurts')}</h2>
        <div className="grid grid-cols-2 gap-2">
          {LOCAL_SYMPTOMS.map(symptomButton)}
        </div>
      </section>

      {/* Sintomas gerais — logo depois, e não mais uma tela abaixo: quem abre o
          módulo com febre precisa ver que é aqui. */}
      <section>
        <h2 className={TITULO} dir="auto">{t('bodyHowFeel')}</h2>
        <div className="grid grid-cols-3 gap-2">
          {GENERAL_SYMPTOMS.map(symptomButton)}
        </div>
      </section>

      {/* Duração */}
      <section>
        <h2 className={TITULO} dir="auto">{t('bodyDuration')}</h2>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => {
            const active = duration?.key === d.key;
            return (
              <button key={d.key} onClick={() => pickDuration(d)} aria-pressed={active} className={chip(active)}>
                <span className="block text-base font-bold" dir="auto">{d.labels[target]}</span>
                {showNative && <span className={`block text-sm ${apoio(active)}`} dir="auto">{d.labels[native]}</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Partes do corpo — a lista é o caminho de quem não achou no boneco (as
          costas e a pele só existem aqui), por isso vem depois do resto. */}
      <section>
        <h2 className={TITULO} dir="auto">{t('bodyPart')}</h2>
        <div className="flex flex-wrap gap-2">
          {BODY_PARTS.map((p) => {
            const active = p.key === part.key && !partsDimmed;
            return (
              <button key={p.key} onClick={() => pickPart(p)} aria-pressed={active} className={chip(active)}>
                <span className="block text-base font-bold" dir="auto">{p.names[target][0]}</span>
                {showNative && <span className={`block text-sm ${apoio(active)}`} dir="auto">{p.names[native][0]}</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Frases da farmácia e do médico */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
        <h2 className={TITULO} dir="auto">{t('bodyPhrases')}</h2>
        <ul className="divide-y divide-gray-100 dark:divide-slate-700">
          {BODY_QUESTIONS.map((q, i) => (
            <li key={i}>
              <button onClick={() => speak(q[target])} className="w-full py-3 flex items-center gap-3 text-left tap active:scale-[0.98]">
                <span className="flex-1 min-w-0">
                  <span className="block text-base font-semibold leading-snug" dir="auto">{q[target]}</span>
                  {showNative && <span className="block text-sm text-gray-600 dark:text-slate-300 leading-snug" dir="auto">{q[native]}</span>}
                </span>
                <Listen aria-hidden="true" className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--tema-texto)' }} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </ModuleShell>
  );
}
