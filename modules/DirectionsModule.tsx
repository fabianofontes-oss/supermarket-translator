
import React, { useMemo, useState } from 'react';
import type { Country } from '../types';
import { HomeIcon, SpeakerIcon, SpeakerOffIcon, XIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import type { VoiceStatus } from '../utils/speech';
import { toLangCode, type LangCode } from './location/data/locationData';
import {
  DIR_STEPS,
  COMPASS,
  DIR_QUESTIONS,
  DIR_PLACES,
  DIR_DISTANCES,
  GRID,
  START,
  applyStep,
  headingSentence,
  type DirStep,
  type Walker,
  type Vocab,
} from './directions/data/directionsData';

interface DirectionsModuleProps {
  nativeCountry: Country;
  targetCountry: Country;
  t: (key: string) => string;
  theme: { color: string; textColor: string; hex: string; borderColor: string };
  onGoHome: () => void;
  onOpenLanguageModal: () => void;
  handlePlayAudio: (text: string, lang: string) => void;
  /** Voz do idioma de destino no aparelho; 'missing' apaga os botões de áudio. */
  voiceStatus?: VoiceStatus;
}

const MAX_STEPS = 10;

// Geometria do mapa (SVG 300x300)
const SP = 60;      // distância entre cruzamentos
const OFF = 30;     // margem
const px = (i: number) => OFF + i * SP;

// Pontos de referência desenhados nos quarteirões (coluna, linha)
const LANDMARKS: { bx: number; by: number; emoji: string }[] = [
  { bx: 0, by: 0, emoji: '🏦' },
  { bx: 3, by: 0, emoji: '⛲' },
  { bx: 1, by: 1, emoji: '🚏' },
  { bx: 2, by: 2, emoji: '💊' },
  { bx: 0, by: 3, emoji: '🚇' },
  { bx: 3, by: 2, emoji: '🏫' },
  { bx: 1, by: 3, emoji: '🍞' },
];

export default function DirectionsModule({
  nativeCountry,
  targetCountry,
  t,
  theme,
  onGoHome,
  onOpenLanguageModal,
  handlePlayAudio,
  voiceStatus = 'unknown',
}: DirectionsModuleProps) {
  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;

  const [steps, setSteps] = useState<DirStep[]>([]);
  const [compassPick, setCompassPick] = useState<number | null>(null);

  // Recalcula o percurso a partir dos passos (fonte única de verdade)
  const route = useMemo(() => {
    let walker: Walker = START;
    const points: Walker[] = [START];
    for (const s of steps) {
      const r = applyStep(walker, s);
      if (!r) break;
      walker = r.next;
      points.push(...r.path);
      if (s.turn === 2 && r.path.length === 0) points.push(walker); // meia-volta sem andar
    }
    return { walker, points, arrived: steps.some((s) => s.arrive) };
  }, [steps]);

  const canApply = (step: DirStep) => {
    if (route.arrived || steps.length >= MAX_STEPS) return false;
    if (step.arrive) return steps.length > 0;
    return applyStep(route.walker, step) !== null;
  };

  const addStep = (step: DirStep) => {
    if (!canApply(step)) return;
    playSound('click');
    setSteps((prev) => [...prev, step]);
    handlePlayAudio(step.phrases[target], targetCountry.lang);
  };
  const undo = () => { playSound('toggle'); setSteps((p) => p.slice(0, -1)); };
  const clear = () => { playSound('toggle'); setSteps([]); };

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

  const fullRoute = steps.map((s) => s.phrases[target]).join(' ');
  const compassIdx = compassPick ?? route.walker.heading;
  const compass = COMPASS[compassIdx];

  const w = route.walker;

  return (
    <div className="w-full bg-slate-50 text-gray-800 flex flex-col h-[100dvh] relative overflow-hidden font-sans">
      {/* Header */}
      <header className="flex-shrink-0 text-white shadow-lg z-30 rounded-b-3xl" style={{ background: `linear-gradient(to bottom, ${theme.hex}, ${theme.hex}e6)` }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-4 max-w-3xl mx-auto">
          <button onClick={() => { playSound('click'); onGoHome(); }} aria-label={t('a11yHome')} className="hit p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors">
            <HomeIcon className="w-5 h-5" />
          </button>
          <h1 className="flex-1 mx-2 text-center font-bold text-2xl uppercase tracking-tight truncate">{t('moduleDirections')}</h1>
          <button onClick={() => { playSound('click'); onOpenLanguageModal(); }} aria-label={t('languageSettings')} className="hit p-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors">
            <div className="flex items-center -space-x-2">
              <img src={nativeCountry.image} alt="" aria-hidden="true" className="w-6 h-6 rounded-full border border-white object-cover" />
              <img src={targetCountry.image} alt="" aria-hidden="true" className="w-6 h-6 rounded-full border border-white object-cover" />
            </div>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-10">
        <div className="px-4 pt-4 max-w-3xl mx-auto w-full space-y-4">

          {/* MAPA */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-3">
            <svg viewBox="0 0 300 300" className="w-full max-w-[320px] mx-auto block select-none" style={{ aspectRatio: '1 / 1' }}>
              {/* quarteirões */}
              {Array.from({ length: GRID - 1 }).map((_, bx) =>
                Array.from({ length: GRID - 1 }).map((_, by) => (
                  <rect key={`${bx}-${by}`} x={px(bx) + 8} y={px(by) + 8} width={SP - 16} height={SP - 16} rx={6} fill="#f1f5f9" stroke="#e2e8f0" />
                ))
              )}
              {/* ruas */}
              {Array.from({ length: GRID }).map((_, i) => (
                <g key={i}>
                  <line x1={px(0)} y1={px(i)} x2={px(GRID - 1)} y2={px(i)} stroke="#cbd5e1" strokeWidth={10} strokeLinecap="round" />
                  <line x1={px(i)} y1={px(0)} x2={px(i)} y2={px(GRID - 1)} stroke="#cbd5e1" strokeWidth={10} strokeLinecap="round" />
                  <line x1={px(0)} y1={px(i)} x2={px(GRID - 1)} y2={px(i)} stroke="white" strokeWidth={1.2} strokeDasharray="4 6" />
                  <line x1={px(i)} y1={px(0)} x2={px(i)} y2={px(GRID - 1)} stroke="white" strokeWidth={1.2} strokeDasharray="4 6" />
                </g>
              ))}
              {/* pontos de referência */}
              {LANDMARKS.map((l, i) => (
                <text key={i} x={px(l.bx) + SP / 2} y={px(l.by) + SP / 2 + 8} textAnchor="middle" fontSize={22}>{l.emoji}</text>
              ))}
              {/* percurso */}
              <polyline
                points={route.points.map((p) => `${px(p.x)},${px(p.y)}`).join(' ')}
                fill="none"
                stroke={theme.hex}
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.85}
              />
              {/* início */}
              <circle cx={px(START.x)} cy={px(START.y)} r={6} fill="white" stroke={theme.hex} strokeWidth={3} />
              {/* destino */}
              {route.arrived && (
                <text x={px(w.x)} y={px(w.y) - 14} textAnchor="middle" fontSize={26}>📍</text>
              )}
              {/* caminhante */}
              <g style={{ transform: `translate(${px(w.x)}px, ${px(w.y)}px) rotate(${w.heading * 90}deg)`, transition: 'transform var(--scene-duration) var(--ease-out)' }}>
                <circle r={11} fill={theme.hex} stroke="white" strokeWidth={3} />
                <polygon points="0,-7 5,3 -5,3" fill="white" />
              </g>
            </svg>
          </div>

          {/* BOTÕES DE PASSO */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('dirSteps')}</h2>
            <div className="grid grid-cols-4 gap-2">
              {DIR_STEPS.map((s) => {
                const enabled = canApply(s);
                return (
                  <button
                    key={s.key}
                    disabled={!enabled}
                    onClick={() => addStep(s)}
                    className={`rounded-2xl border p-2 flex flex-col items-center gap-1 tap active:scale-95 ${
                      enabled ? 'bg-white border-gray-100 text-gray-700 hover:border-gray-300' : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'
                    }`}
                  >
                    <span className="text-2xl leading-none">{s.icon}</span>
                    <span className="text-[11px] font-bold leading-tight text-center">{s.labels[target]}</span>
                    {showNative && <span className="text-[10px] leading-tight text-center text-gray-500" dir="auto">{s.labels[native]}</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* PERCURSO (frases) */}
          <div className={`rounded-3xl p-4 text-white shadow-md ${theme.color}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white">{t('dirRoute')}</h2>
              <div className="flex gap-2">
                {steps.length > 0 && (
                  <>
                    <button onClick={undo} className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold">{t('dirUndo')}</button>
                    <button onClick={clear} className="p-1 rounded-full bg-white/20 hover:bg-white/30" aria-label={t('dirClear')}><XIcon className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            </div>

            {steps.length === 0 ? (
              <p className="text-white text-sm py-3">{t('dirEmpty')}</p>
            ) : (
              <ol className="space-y-2">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-white/25 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold leading-snug">{s.phrases[target]}</p>
                      {showNative && <p className="text-xs text-white leading-snug" dir="auto">{s.phrases[native]}</p>}
                    </div>
                    <button onClick={() => speak(s.phrases[target])} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 flex-shrink-0" aria-label={audioLabel(t('locListen'))} title={audioLabel(t('locListen'))}>
                      <Listen className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ol>
            )}

            {steps.length > 1 && (
              <button
                onClick={() => speak(fullRoute)}
                className="mt-3 w-full py-2.5 rounded-xl bg-white font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                style={{ color: theme.hex }}
              >
                <Listen className="w-5 h-5" /> {t('dirPlayAll')}
              </button>
            )}
          </div>

          {/* BÚSSOLA */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">{t('dirCompass')}</h2>
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 120 120" className="w-32 h-32 flex-shrink-0">
                <circle cx={60} cy={60} r={54} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={2} />
                {COMPASS.map((c) => {
                  const rad = (c.deg - 90) * Math.PI / 180;
                  const x = 60 + Math.cos(rad) * 42;
                  const y = 60 + Math.sin(rad) * 42 + 5;
                  const active = c.key === compass.key;
                  return (
                    <text key={c.key} x={x} y={y} textAnchor="middle" fontSize={14} fontWeight={700} fill={active ? theme.hex : '#94a3b8'}>
                      {c.names[target].charAt(0)}
                    </text>
                  );
                })}
                <g style={{ transform: `translate(60px, 60px) rotate(${compass.deg}deg)`, transition: 'transform var(--scene-duration) var(--ease-out)' }}>
                  <polygon points="0,-30 7,0 -7,0" fill={theme.hex} />
                  <polygon points="0,30 7,0 -7,0" fill="#cbd5e1" />
                  <circle r={4} fill="white" stroke={theme.hex} strokeWidth={2} />
                </g>
              </svg>
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {COMPASS.map((c, i) => {
                    const active = c.key === compass.key;
                    return (
                      <button
                        key={c.key}
                        onClick={() => { setCompassPick(i); speak(c.names[target]); }}
                        className={`rounded-xl border px-2 py-1.5 text-left tap active:scale-95 ${active ? `${theme.color} border-transparent text-white` : 'bg-white border-gray-100 text-gray-700'}`}
                      >
                        <div className="text-sm font-bold leading-tight">{c.names[target]}</div>
                        {showNative && <div className={`text-[10px] leading-tight ${active ? 'text-white' : 'text-gray-500'}`} dir="auto">{c.names[native]}</div>}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => speak(headingSentence(target, compass))} className="w-full text-left flex items-center gap-2">
                  <Listen className={`w-4 h-4 flex-shrink-0 ${theme.textColor}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug">{headingSentence(target, compass)}</p>
                    {showNative && <p className="text-[11px] text-gray-500 leading-snug" dir="auto">{headingSentence(native, compass)}</p>}
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* PERGUNTAS */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t('dirQuestions')}</h2>
            <ul className="divide-y divide-gray-100">
              {DIR_QUESTIONS.map((q, i) => (
                <li key={i}>
                  <button onClick={() => speak(q[target])} className="w-full py-2.5 flex items-center gap-3 text-left">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-snug">{q[target]}</p>
                      {showNative && <p className="text-xs text-gray-500 leading-snug" dir="auto">{q[native]}</p>}
                    </div>
                    <Listen className={`w-5 h-5 flex-shrink-0 ${theme.textColor}`} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* VOCABULÁRIO */}
          <VocabGroup title={t('dirVocabulary')} items={DIR_PLACES} target={target} native={native} showNative={showNative} onSpeak={speak} />
          <VocabGroup title={t('dirDistances')} items={DIR_DISTANCES} target={target} native={native} showNative={showNative} onSpeak={speak} />
        </div>
      </main>
    </div>
  );
}

interface VocabGroupProps {
  title: string;
  items: Vocab[];
  target: LangCode;
  native: LangCode;
  showNative: boolean;
  onSpeak: (text: string) => void;
}

const VocabGroup: React.FC<VocabGroupProps> = ({ title, items, target, native, showNative, onSpeak }) => (
  <section>
    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{title}</h2>
    <div className="grid grid-cols-2 gap-2">
      {items.map((v, i) => (
        <button
          key={i}
          onClick={() => onSpeak(v.names[target])}
          className="bg-white rounded-2xl border border-gray-100 p-2.5 flex items-center gap-2 text-left active:scale-95 transition-transform"
        >
          <span className="text-2xl leading-none flex-shrink-0">{v.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">{v.names[target]}</p>
            {showNative && <p className="text-[11px] text-gray-500 leading-tight" dir="auto">{v.names[native]}</p>}
          </div>
        </button>
      ))}
    </div>
  </section>
);
