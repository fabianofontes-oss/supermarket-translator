
import React, { useMemo, useState } from 'react';
import type { Country } from '../types';
import { HomeIcon, SpeakerIcon, SpeakerOffIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import type { VoiceStatus } from '../utils/speech';
import { toLangCode } from './location/data/locationData';
import {
  DRINKS,
  MODIFIERS,
  PORTIONS,
  CAFE_QUESTIONS,
  LAYER_COLOR,
  buildOrder,
  type Drink,
  type Modifier,
} from './cafe/data/cafeData';

interface CafeModuleProps {
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

/** Copo (vaso) ou xícara (taza) com as camadas da bebida. */
const Vessel: React.FC<{ drink: Drink }> = ({ drink }) => {
  const isCup = drink.vessel === 'cup';
  // Área interna do recipiente, em coordenadas do viewBox 120x140.
  const box = isCup ? { x: 22, y: 46, w: 68, h: 58 } : { x: 34, y: 24, w: 46, h: 84 };

  let offset = 0;
  const bands = drink.layers.map((l, i) => {
    const h = (box.h * l.pct) / 100;
    const y = box.y + box.h - offset - h;
    offset += h;
    return <rect key={i} x={box.x} y={y} width={box.w} height={h} fill={LAYER_COLOR[l.kind]} />;
  });

  return (
    <svg viewBox="0 0 120 140" className="w-36 h-40">
      <defs>
        <clipPath id="vesselClip">
          {isCup
            ? <path d="M22 46 h68 v34 a34 24 0 0 1 -68 0 z" />
            : <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="4" />}
        </clipPath>
      </defs>

      <g clipPath="url(#vesselClip)">{bands}</g>

      {isCup ? (
        <>
          <path d="M22 46 h68 v34 a34 24 0 0 1 -68 0 z" fill="none" stroke="#94a3b8" strokeWidth="3" />
          <path d="M90 56 a14 14 0 0 1 0 28" fill="none" stroke="#94a3b8" strokeWidth="3" />
          <ellipse cx="56" cy="46" rx="34" ry="7" fill="none" stroke="#94a3b8" strokeWidth="3" />
          <rect x="34" y="112" width="44" height="4" rx="2" fill="#cbd5e1" />
        </>
      ) : (
        <>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="4" fill="none" stroke="#94a3b8" strokeWidth="3" />
          <ellipse cx="57" cy="24" rx="23" ry="5" fill="none" stroke="#94a3b8" strokeWidth="3" />
        </>
      )}
    </svg>
  );
};

export default function CafeModule({
  nativeCountry,
  targetCountry,
  t,
  theme,
  onGoHome,
  onOpenLanguageModal,
  handlePlayAudio,
  voiceStatus = 'unknown',
}: CafeModuleProps) {
  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;

  const [drink, setDrink] = useState<Drink>(DRINKS[1]); // cortado
  const [modKeys, setModKeys] = useState<string[]>([]);
  const [openPortion, setOpenPortion] = useState<string | null>(null);

  const mods = useMemo(() => MODIFIERS.filter((m) => modKeys.includes(m.key)), [modKeys]);
  const order = useMemo(() => buildOrder(target, drink, mods), [target, drink, mods]);
  const orderNative = useMemo(() => buildOrder(native, drink, mods), [native, drink, mods]);

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

  const toggleMod = (m: Modifier) => {
    playSound('toggle');
    setModKeys((ks) => {
      if (ks.includes(m.key)) return ks.filter((k) => k !== m.key);
      // "en vaso" e "en taza" se excluem, assim como "templado" e "muy caliente".
      const exclusive: Record<string, string> = { glass: 'cup', cup: 'glass', warm: 'hot', hot: 'warm' };
      return [...ks.filter((k) => k !== exclusive[m.key]), m.key];
    });
  };

  return (
    <div className="w-full bg-slate-50 text-gray-800 flex flex-col h-[100dvh] relative overflow-hidden font-sans">
      <header className="flex-shrink-0 text-white shadow-lg z-30 rounded-b-3xl" style={{ background: `linear-gradient(to bottom, ${theme.hex}, ${theme.hex}e6)` }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-4 max-w-3xl mx-auto">
          <button onClick={() => { playSound('click'); onGoHome(); }} aria-label={t('a11yHome')} className="hit p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors">
            <HomeIcon className="w-5 h-5" />
          </button>
          <h1 className="flex-1 mx-2 text-center font-bold text-2xl uppercase tracking-tight truncate">{t('moduleCafe')}</h1>
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

          {/* Copo + explicação */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
            <div className="flex-shrink-0"><Vessel drink={drink} /></div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold leading-tight" dir="auto">{drink.names[target]}</p>
              {showNative && <p className="text-xs text-gray-500 mb-1" dir="auto">{drink.names[native]}</p>}
              <p className="text-sm text-gray-600 leading-snug mt-1" dir="auto">{drink.descs[showNative ? native : target]}</p>
              <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${theme.hex}18`, color: theme.hex }}>
                {drink.vessel === 'cup' ? t('cafeInCup') : t('cafeInGlass')}
              </span>
            </div>
          </div>

          {/* Pedido */}
          <div className={`rounded-3xl p-4 text-white shadow-md ${theme.color}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold leading-snug" dir="auto">{order}</p>
                {showNative && <p className="text-sm text-white mt-1 leading-snug" dir="auto">{orderNative}</p>}
              </div>
              <button onClick={() => speak(order)} className="p-3 rounded-full bg-white shadow active:scale-95 transition-transform flex-shrink-0" style={{ color: theme.hex }} aria-label={audioLabel(t('locListen'))} title={audioLabel(t('locListen'))}>
                <Listen className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Bebidas */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('cafeDrinks')}</h2>
            <div className="grid grid-cols-3 gap-2">
              {DRINKS.map((d) => {
                const active = d.key === drink.key;
                return (
                  <button
                    key={d.key}
                    onClick={() => { playSound('click'); setDrink(d); }}
                    className={`rounded-2xl border p-2 tap active:scale-95 ${active ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white text-gray-700 border-gray-100'}`}
                  >
                    <span className="block text-xs font-bold leading-tight" dir="auto">{d.names[target]}</span>
                    {showNative && <span className={`block text-[10px] leading-tight mt-0.5 ${active ? 'text-white' : 'text-gray-500'}`} dir="auto">{d.names[native]}</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Modificadores */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('cafeHowYouWant')}</h2>
            <div className="flex flex-wrap gap-2">
              {MODIFIERS.map((m) => {
                const active = modKeys.includes(m.key);
                return (
                  <button
                    key={m.key}
                    onClick={() => toggleMod(m)}
                    className={`rounded-xl px-3 py-2 text-sm font-bold tap active:scale-95 border ${active ? `${theme.color} text-white border-transparent shadow` : 'bg-white text-gray-700 border-gray-100'}`}
                  >
                    <span dir="auto">{m.labels[target]}</span>
                    {showNative && <span className={`block text-[10px] font-medium ${active ? 'text-white' : 'text-gray-500'}`} dir="auto">{m.labels[native]}</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Porções */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('cafePortions')}</h2>
            <div className="space-y-2">
              {PORTIONS.map((p) => {
                const open = openPortion === p.key;
                return (
                  <div key={p.key} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-1 pr-2">
                      <button
                        onClick={() => { playSound('page-turn'); setOpenPortion(open ? null : p.key); }}
                        className="flex-1 min-w-0 px-3 py-2.5 flex items-center gap-3 text-left"
                      >
                        <span className="text-xl leading-none flex-shrink-0">{p.emoji}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-bold leading-tight" dir="auto">{p.names[target]}</span>
                          {showNative && <span className="block text-[11px] text-gray-500 leading-tight" dir="auto">{p.names[native]}</span>}
                        </span>
                      </button>
                      <button
                        onClick={() => speak(p.names[target])}
                        className={`p-1.5 rounded-full flex-shrink-0 ${theme.textColor}`}
                        aria-label={audioLabel(t('locListen'))} title={audioLabel(t('locListen'))}
                      >
                        <Listen className="w-5 h-5" />
                      </button>
                    </div>
                    {open && (
                      <p className="px-3 pb-3 -mt-1 text-sm text-gray-600 leading-snug" dir="auto">
                        {p.descs[showNative ? native : target]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Frases */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t('cafePhrases')}</h2>
            <ul className="divide-y divide-gray-100">
              {CAFE_QUESTIONS.map((q, i) => (
                <li key={i}>
                  <button onClick={() => speak(q[target])} className="w-full py-2.5 flex items-center gap-3 text-left">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-snug" dir="auto">{q[target]}</p>
                      {showNative && <p className="text-xs text-gray-500 leading-snug" dir="auto">{q[native]}</p>}
                    </div>
                    <Listen className={`w-5 h-5 flex-shrink-0 ${theme.textColor}`} />
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
