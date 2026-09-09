
import React, { useMemo, useState } from 'react';
import type { Country } from '../types';
import { HomeIcon, SpeakerIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
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
  handlePlayAudio: (text: string, lang: string) => void;
}

export default function BodyModule({
  nativeCountry,
  targetCountry,
  t,
  theme,
  onGoHome,
  onOpenLanguageModal,
  handlePlayAudio,
}: BodyModuleProps) {
  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;

  const [symptom, setSymptom] = useState<Symptom>(LOCAL_SYMPTOMS[0]);
  const [part, setPart] = useState<BodyPart>(BODY_PARTS[0]);
  const [duration, setDuration] = useState<Duration | null>(null);

  const sentence = useMemo(() => buildComplaint(target, symptom, part, duration), [target, symptom, part, duration]);
  const sentenceNative = useMemo(() => buildComplaint(native, symptom, part, duration), [native, symptom, part, duration]);

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
      active ? `${theme.color} text-white border-transparent shadow` : 'bg-white text-gray-700 border-gray-100 hover:border-gray-300'
    } ${dim ? 'opacity-45' : ''}`;

  return (
    <div className="w-full bg-slate-50 text-gray-800 flex flex-col h-[100dvh] relative overflow-hidden font-sans">
      <header className="flex-shrink-0 text-white shadow-lg z-30 rounded-b-3xl" style={{ background: `linear-gradient(to bottom, ${theme.hex}, ${theme.hex}e6)` }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-4 max-w-3xl mx-auto">
          <button onClick={() => { playSound('click'); onGoHome(); }} aria-label={t('a11yHome')} className="hit p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors">
            <HomeIcon className="w-5 h-5" />
          </button>
          <h1 className="flex-1 mx-2 text-center font-bold text-2xl uppercase tracking-tight truncate">{t('moduleBody')}</h1>
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

          {/* Boneco */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-3">
            <svg viewBox="0 0 200 400" className="w-full max-w-[210px] mx-auto block select-none" style={{ aspectRatio: '1 / 2' }}>
              <g fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2">
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
                      stroke={active ? 'white' : '#94a3b8'}
                      strokeWidth={active ? 3 : 2}
                      style={{ transition: 'r var(--scene-duration) var(--ease-out), fill var(--scene-duration) var(--ease-out), stroke-width var(--scene-duration) var(--ease-out)' }}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Frase */}
          <div className={`rounded-3xl p-4 text-white shadow-md ${theme.color}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold leading-snug" dir="auto">{sentence}</p>
                {showNative && <p className="text-sm text-white mt-1 leading-snug" dir="auto">{sentenceNative}</p>}
              </div>
              <button onClick={() => speak(sentence)} className="p-3 rounded-full bg-white shadow active:scale-95 transition-transform flex-shrink-0" style={{ color: theme.hex }} aria-label={t('locListen')}>
                <SpeakerIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Sintoma localizado */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('bodyWhereHurts')}</h2>
            <div className="grid grid-cols-4 gap-2">
              {LOCAL_SYMPTOMS.map((s) => {
                const active = s.key === symptom.key;
                return (
                  <button key={s.key} onClick={() => pickSymptom(s)} className={`rounded-2xl border p-2 flex flex-col items-center gap-1 tap active:scale-95 ${active ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white text-gray-700 border-gray-100'}`}>
                    <span className="text-xl leading-none">{s.emoji}</span>
                    <span className="text-[11px] font-bold leading-tight text-center" dir="auto">{s.labels[target]}</span>
                    {showNative && <span className={`text-[10px] leading-tight text-center ${active ? 'text-white' : 'text-gray-500'}`} dir="auto">{s.labels[native]}</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Partes do corpo */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('bodyPart')}</h2>
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('bodyHowFeel')}</h2>
            <div className="grid grid-cols-4 gap-2">
              {GENERAL_SYMPTOMS.map((s) => {
                const active = s.key === symptom.key;
                return (
                  <button key={s.key} onClick={() => pickSymptom(s)} className={`rounded-2xl border p-2 flex flex-col items-center gap-1 tap active:scale-95 ${active ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white text-gray-700 border-gray-100'}`}>
                    <span className="text-xl leading-none">{s.emoji}</span>
                    <span className="text-[11px] font-bold leading-tight text-center" dir="auto">{s.labels[target]}</span>
                    {showNative && <span className={`text-[10px] leading-tight text-center ${active ? 'text-white' : 'text-gray-500'}`} dir="auto">{s.labels[native]}</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Duração */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('bodyDuration')}</h2>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button key={d.key} onClick={() => pickDuration(d)} className={chip(duration?.key === d.key)}>
                  <span dir="auto">{d.labels[target]}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Frases da farmácia */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t('bodyPhrases')}</h2>
            <ul className="divide-y divide-gray-100">
              {BODY_QUESTIONS.map((q, i) => (
                <li key={i}>
                  <button onClick={() => speak(q[target])} className="w-full py-2.5 flex items-center gap-3 text-left">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-snug" dir="auto">{q[target]}</p>
                      {showNative && <p className="text-xs text-gray-500 leading-snug" dir="auto">{q[native]}</p>}
                    </div>
                    <SpeakerIcon className={`w-5 h-5 flex-shrink-0 ${theme.textColor}`} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
