
import React, { useMemo, useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { PhraseCard } from '../components/PhraseCard';
import type { Country } from '../types';
import { SpeakerIcon, SpeakerOffIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import type { VoiceStatus } from '../utils/speech';
import { toLangCode } from './location/data/locationData';
import {
  BODY_PARTS,
  LOCAL_SYMPTOMS,
  GENERAL_SYMPTOMS,
  DURATIONS,
  BODY_QUESTIONS,
  buildComplaint,
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

  const [symptom, setSymptom] = useState<Symptom>(LOCAL_SYMPTOMS[0]);
  const [part, setPart] = useState<BodyPart>(BODY_PARTS[0]);
  const [duration, setDuration] = useState<Duration | null>(null);

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

  const partsDimmed = !symptom.local;

  const chip = (active: boolean, dim = false) =>
    `rounded-xl px-3 py-2 text-sm font-bold tap active:scale-95 border ${
      active ? `${theme.color} text-white border-transparent shadow` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
    } ${dim ? 'opacity-45' : ''}`;

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

      {/* Boneco */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-3">
        <svg viewBox="0 0 200 400" className="w-full max-w-[210px] mx-auto block select-none" style={{ aspectRatio: '1 / 2' }}>
          <g fill="var(--art-edge)" stroke="var(--art-fill)" strokeWidth="2">
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

          {/* Marcadores tocáveis */}
          {BODY_PARTS.filter((p) => p.x !== undefined).map((p) => {
            const active = p.key === part.key && !partsDimmed;
            return (
              <g key={p.key} onClick={() => pickPart(p)} style={{ cursor: 'pointer' }}>
                <circle cx={p.x} cy={p.y} r="13" fill="transparent" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? 11 : 6}
                  fill={active ? theme.hex : 'white'}
                  stroke={active ? 'white' : 'var(--art-line)'}
                  strokeWidth={active ? 3 : 2}
                  style={{ transition: 'r var(--scene-duration) var(--ease-out), fill var(--scene-duration) var(--ease-out), stroke-width var(--scene-duration) var(--ease-out)' }}
                />
              </g>
            );
          })}
        </svg>
      </div>


      {/* Sintoma localizado */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1">{t('bodyWhereHurts')}</h2>
        <div className="grid grid-cols-4 gap-2">
          {LOCAL_SYMPTOMS.map((s) => {
            const active = s.key === symptom.key;
            return (
              <button key={s.key} onClick={() => pickSymptom(s)} className={`rounded-2xl border p-2 flex flex-col items-center gap-1 tap active:scale-95 ${active ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700'}`}>
                <span className="text-xl leading-none">{s.emoji}</span>
                <span className="text-[11px] font-bold leading-tight text-center" dir="auto">{s.labels[target]}</span>
                {showNative && <span className={`text-[10px] leading-tight text-center ${active ? 'text-white' : 'text-gray-500 dark:text-slate-400'}`} dir="auto">{s.labels[native]}</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Partes do corpo */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1">{t('bodyPart')}</h2>
        <div className="flex flex-wrap gap-2">
          {BODY_PARTS.map((p) => (
            <button key={p.key} onClick={() => pickPart(p)} className={chip(p.key === part.key && !partsDimmed, partsDimmed)}>
              <span dir="auto">{p.names[target][0]}</span>
              {showNative && <span className="block text-[10px] font-medium opacity-70" dir="auto">{p.names[native][0]}</span>}
            </button>
          ))}
        </div>
      </section>

      {/* Sintomas gerais */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1">{t('bodyHowFeel')}</h2>
        <div className="grid grid-cols-4 gap-2">
          {GENERAL_SYMPTOMS.map((s) => {
            const active = s.key === symptom.key;
            return (
              <button key={s.key} onClick={() => pickSymptom(s)} className={`rounded-2xl border p-2 flex flex-col items-center gap-1 tap active:scale-95 ${active ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700'}`}>
                <span className="text-xl leading-none">{s.emoji}</span>
                <span className="text-[11px] font-bold leading-tight text-center" dir="auto">{s.labels[target]}</span>
                {showNative && <span className={`text-[10px] leading-tight text-center ${active ? 'text-white' : 'text-gray-500 dark:text-slate-400'}`} dir="auto">{s.labels[native]}</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Duração */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1">{t('bodyDuration')}</h2>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button key={d.key} onClick={() => pickDuration(d)} className={chip(duration?.key === d.key)}>
              <span dir="auto">{d.labels[target]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Frases da farmácia */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2">{t('bodyPhrases')}</h2>
        <ul className="divide-y divide-gray-100 dark:divide-slate-700">
          {BODY_QUESTIONS.map((q, i) => (
            <li key={i}>
              <button onClick={() => speak(q[target])} className="w-full py-2.5 flex items-center gap-3 text-left tap active:scale-[0.98]">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold leading-snug" dir="auto">{q[target]}</p>
                  {showNative && <p className="text-xs text-gray-500 dark:text-slate-400 leading-snug" dir="auto">{q[native]}</p>}
                </div>
                <Listen className={`w-5 h-5 flex-shrink-0 ${theme.textColor}`} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </ModuleShell>
  );
}
