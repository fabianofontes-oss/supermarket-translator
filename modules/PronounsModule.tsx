
import React, { useMemo, useState } from 'react';
import type { Country } from '../types';
import { HomeIcon, SpeakerIcon, InfoIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import { toLangCode } from './location/data/locationData';
import {
  PRONOUNS,
  VERBS,
  MOOD_LABELS,
  buildPhrase,
  type Pronoun,
  type Verb,
  type Mood,
} from './pronouns/data/pronounsData';

interface PronounsModuleProps {
  nativeCountry: Country;
  targetCountry: Country;
  t: (key: string) => string;
  theme: { color: string; textColor: string; hex: string; borderColor: string };
  onGoHome: () => void;
  onOpenLanguageModal: () => void;
  handlePlayAudio: (text: string, lang: string) => void;
}

const MOODS: Mood[] = ['affirm', 'question', 'negative'];

/** Bonequinhos indicando quantas pessoas o pronome representa. */
const PeopleIcon: React.FC<{ plural: boolean; active: boolean; hex: string }> = ({ plural, active, hex }) => (
  <svg viewBox="0 0 32 18" className="w-7 h-4" aria-hidden="true">
    {(plural ? [8, 16, 24] : [16]).map((cx) => (
      <g key={cx} fill={active ? 'white' : hex} opacity={active ? 0.95 : 0.55}>
        <circle cx={cx} cy="5" r="3.4" />
        <path d={`M${cx - 5} 17 a5 5 0 0 1 10 0 z`} />
      </g>
    ))}
  </svg>
);

export default function PronounsModule({
  nativeCountry,
  targetCountry,
  t,
  theme,
  onGoHome,
  onOpenLanguageModal,
  handlePlayAudio,
}: PronounsModuleProps) {
  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;

  const [pronoun, setPronoun] = useState<Pronoun>(PRONOUNS[1]); // tú
  const [verb, setVerb] = useState<Verb>(VERBS[0]);             // querer
  const [compKey, setCompKey] = useState<string | null>(VERBS[0].complements[0].key);
  const [mood, setMood] = useState<Mood>('affirm');

  const comp = useMemo(
    () => verb.complements.find((c) => c.key === compKey) ?? null,
    [verb, compKey],
  );

  const phrase = useMemo(() => buildPhrase(target, pronoun, verb, comp, mood), [target, pronoun, verb, comp, mood]);
  const phraseNative = useMemo(() => buildPhrase(native, pronoun, verb, comp, mood), [native, pronoun, verb, comp, mood]);

  const speak = (text: string) => {
    playSound('click');
    handlePlayAudio(text, targetCountry.lang);
  };

  const pickVerb = (v: Verb) => {
    playSound('click');
    setVerb(v);
    // Cada verbo tem seus próprios complementos, então o antigo não serve.
    setCompKey(v.complements[0].key);
  };

  const note = pronoun.notes?.[showNative ? native : target];

  const chip = (active: boolean) =>
    `rounded-xl px-3 py-2 text-sm font-bold tap active:scale-95 border ${
      active ? `${theme.color} text-white border-transparent shadow` : 'bg-white text-gray-700 border-gray-100 hover:border-gray-300'
    }`;

  return (
    <div className="w-full bg-slate-50 text-gray-800 flex flex-col h-[100dvh] relative overflow-hidden font-sans">
      <header className="flex-shrink-0 text-white shadow-lg z-30 rounded-b-3xl" style={{ background: `linear-gradient(to bottom, ${theme.hex}, ${theme.hex}e6)` }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-4 max-w-3xl mx-auto">
          <button onClick={() => { playSound('click'); onGoHome(); }} className="p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors">
            <HomeIcon className="w-5 h-5" />
          </button>
          <h1 className="flex-1 mx-2 text-center font-bold text-2xl uppercase tracking-tight truncate">{t('modulePronouns')}</h1>
          <button onClick={() => { playSound('click'); onOpenLanguageModal(); }} className="p-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors">
            <div className="flex items-center -space-x-2">
              <img src={nativeCountry.image} alt={nativeCountry.name} className="w-6 h-6 rounded-full border border-white object-cover" />
              <img src={targetCountry.image} alt={targetCountry.name} className="w-6 h-6 rounded-full border border-white object-cover" />
            </div>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-10">
        <div className="px-4 pt-4 max-w-3xl mx-auto w-full space-y-4">

          {/* Frase */}
          <div className={`rounded-3xl p-4 text-white shadow-md ${theme.color}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold leading-snug" dir="auto">{phrase}</p>
                {showNative && <p className="text-sm text-white/75 mt-1 leading-snug" dir="auto">{phraseNative}</p>}
              </div>
              <button onClick={() => speak(phrase)} className="p-3 rounded-full bg-white shadow active:scale-95 transition-transform flex-shrink-0" style={{ color: theme.hex }} aria-label={t('locListen')}>
                <SpeakerIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Tipo de frase */}
            <div className="mt-3 pt-3 border-t border-white/20 flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => { playSound('toggle'); setMood(m); }}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold tap ${mood === m ? 'bg-white' : 'bg-white/15 text-white hover:bg-white/25'}`}
                  style={mood === m ? { color: theme.hex } : undefined}
                >
                  <span dir="auto">{MOOD_LABELS[m][showNative ? native : target]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aviso sobre tú / usted / vosotros */}
          {note && (
            <div className="rounded-2xl p-3 flex items-start gap-2 border" style={{ backgroundColor: `${theme.hex}0f`, borderColor: `${theme.hex}33` }}>
              <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: theme.hex }} />
              <p className="text-sm text-gray-700 leading-snug" dir="auto">{note}</p>
            </div>
          )}

          {/* Pronomes */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">{t('pronWho')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {PRONOUNS.map((p) => {
                const active = p.key === pronoun.key;
                const plural = p.person >= 3;
                return (
                  <button
                    key={p.key}
                    onClick={() => { playSound('click'); setPronoun(p); }}
                    className={`rounded-2xl border p-2.5 flex items-center gap-2.5 text-left tap active:scale-95 ${active ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white text-gray-700 border-gray-100'}`}
                  >
                    <PeopleIcon plural={plural} active={active} hex={theme.hex} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold leading-tight" dir="auto">{p.words[target]}</span>
                        {p.tag && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={active ? { backgroundColor: 'rgba(255,255,255,0.25)' } : { backgroundColor: `${theme.hex}18`, color: theme.hex }}
                          >
                            {p.tag === 'formal' ? t('pronFormal') : t('pronSpainOnly')}
                          </span>
                        )}
                      </span>
                      {showNative && <span className={`block text-[10px] leading-tight ${active ? 'text-white/75' : 'text-gray-400'}`} dir="auto">{p.words[native]}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Verbos */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">{t('pronVerb')}</h2>
            <div className="flex flex-wrap gap-2">
              {VERBS.map((v) => (
                <button key={v.key} onClick={() => pickVerb(v)} className={chip(v.key === verb.key)}>
                  <span dir="auto">{v.labels[target]}</span>
                  {showNative && <span className="block text-[10px] font-medium opacity-70" dir="auto">{v.labels[native]}</span>}
                </button>
              ))}
            </div>
          </section>

          {/* Complementos */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">{t('pronWhat')}</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { playSound('toggle'); setCompKey(null); }} className={chip(compKey === null)}>
                {t('pronNothing')}
              </button>
              {verb.complements.map((c) => (
                <button key={c.key} onClick={() => { playSound('click'); setCompKey(c.key); }} className={chip(compKey === c.key)}>
                  <span dir="auto">{c.texts[target]}</span>
                  {showNative && <span className="block text-[10px] font-medium opacity-70" dir="auto">{c.texts[native]}</span>}
                </button>
              ))}
            </div>
          </section>

          {/* Tabela do verbo escolhido */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              {verb.labels[target]}
            </h2>
            <ul className="divide-y divide-gray-100">
              {PRONOUNS.map((p) => {
                const active = p.key === pronoun.key;
                return (
                  <li key={p.key}>
                    <button
                      onClick={() => { playSound('click'); setPronoun(p); speak(`${p.words[target]} ${verb.forms[target][p.person]}`); }}
                      className="w-full py-2 flex items-center gap-3 text-left"
                    >
                      <span className={`text-sm w-28 flex-shrink-0 truncate ${active ? `font-bold ${theme.textColor}` : 'text-gray-500'}`} dir="auto">
                        {p.words[target]}
                      </span>
                      <span className={`text-sm font-bold flex-1 min-w-0 truncate ${active ? theme.textColor : 'text-gray-800'}`} dir="auto">
                        {verb.forms[target][p.person]}
                      </span>
                      <SpeakerIcon className={`w-4 h-4 flex-shrink-0 ${theme.textColor}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
