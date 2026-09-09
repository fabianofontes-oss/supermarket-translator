
import React, { useEffect, useMemo, useState } from 'react';
import type { Country } from '../types';
import { HomeIcon, SpeakerIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import { toLangCode } from './location/data/locationData';
import {
  numberToWords,
  buildTime,
  buildPrice,
  buildPriceShort,
  buildDecimal,
  buildDate,
  formatPriceTag,
  MONTHS,
  NUM_QUESTIONS,
  PRICE_PRESETS,
  DAY_PERIODS,
  uses12hClock,
  formatClockDisplay,
  withPeriod,
} from './numbers/data/numbersData';

interface NumbersModuleProps {
  nativeCountry: Country;
  targetCountry: Country;
  t: (key: string) => string;
  theme: { color: string; textColor: string; hex: string; borderColor: string };
  onGoHome: () => void;
  onOpenLanguageModal: () => void;
  handlePlayAudio: (text: string, lang: string) => void;
}

type Tab = 'time' | 'price' | 'date' | 'number';
const TABS: { key: Tab; labelKey: string; icon: string }[] = [
  { key: 'time',   labelKey: 'numTime',   icon: '🕒' },
  { key: 'price',  labelKey: 'numPrice',  icon: '🏷️' },
  { key: 'date',   labelKey: 'numDate',   icon: '📅' },
  { key: 'number', labelKey: 'numNumber', icon: '🔢' },
];

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

// Preço e número saem em minúscula; hora e data já vêm com maiúscula.
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function NumbersModule({
  nativeCountry,
  targetCountry,
  t,
  theme,
  onGoHome,
  onOpenLanguageModal,
  handlePlayAudio,
}: NumbersModuleProps) {
  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;

  const [tab, setTab] = useState<Tab>('time');
  const [hour, setHour] = useState(3);
  const [minute, setMinute] = useState(30);
  // Na Espanha se escreve 24h e se fala 12h + período. Guardamos os dois.
  const [periodKey, setPeriodKey] = useState('tarde');
  // O formato começa no do país de destino, mas a pessoa pode trocar.
  const [twelveHour, setTwelveHour] = useState(() => uses12hClock(targetCountry.code));
  useEffect(() => setTwelveHour(uses12hClock(targetCountry.code)), [targetCountry.code]);
  const [cents, setCents] = useState(420);
  const now = new Date();
  const [day, setDay] = useState(now.getDate());
  const [month, setMonth] = useState(now.getMonth());
  // Número solto guardado como texto ("37,5"): um estado só, sempre atualizado
  // de forma funcional, então toques rápidos nunca se perdem.
  const [plainStr, setPlainStr] = useState('21');
  const [plainIntStr, plainDecStr = ''] = plainStr.split(',');
  const plainInt = Number(plainIntStr || 0);
  const hasComma = plainStr.includes(',');

  const period = useMemo(() => DAY_PERIODS.find((p) => p.key === periodKey) ?? DAY_PERIODS[1], [periodKey]);
  const clockDisplay = formatClockDisplay(hour, minute, periodKey, twelveHour);

  const sentence = useMemo(() => {
    switch (tab) {
      case 'time': return withPeriod(buildTime(target, hour, minute), period.phrases[target]);
      case 'price': return cap(buildPrice(target, cents));
      case 'date': return buildDate(target, day, month);
      default: return cap(buildDecimal(target, plainInt, plainDecStr));
    }
  }, [tab, target, hour, minute, cents, day, month, plainInt, plainDecStr, period]);

  // Forma curta do preço, a que se ouve no caixa.
  const shortPrice = useMemo(() => (tab === 'price' ? buildPriceShort(target, cents) : null), [tab, target, cents]);

  const sentenceNative = useMemo(() => {
    switch (tab) {
      case 'time': return withPeriod(buildTime(native, hour, minute), period.phrases[native]);
      case 'price': return cap(buildPrice(native, cents));
      case 'date': return buildDate(native, day, month);
      default: return cap(buildDecimal(native, plainInt, plainDecStr));
    }
  }, [tab, native, hour, minute, cents, day, month, plainInt, plainDecStr, period]);

  const speak = (text: string) => {
    playSound('click');
    handlePlayAudio(text, targetCountry.lang);
  };

  // Teclado numérico compartilhado por Preço e Número.
  // No preço os dígitos empurram os centavos, como num terminal de caixa.
  const pressDigit = (d: number) => {
    playSound('click');
    if (tab === 'price') {
      setCents((v) => (v * 10 + d) % 1000000);
      return;
    }
    setPlainStr((s) => {
      const [int, dec] = s.split(',');
      if (dec === undefined) return int.length >= 6 ? s : String(Number(int + d));
      return dec.length >= 2 ? s : `${int},${dec}${d}`;
    });
  };

  const pressComma = () => {
    playSound('click');
    setPlainStr((s) => (s.includes(',') ? s : `${s},`));
  };

  const pressDoubleZero = () => {
    playSound('click');
    setCents((v) => (v * 100) % 1000000);
  };

  const pressBack = () => {
    playSound('toggle');
    if (tab === 'price') {
      setCents((v) => Math.floor(v / 10));
      return;
    }
    setPlainStr((s) => {
      const rest = s.slice(0, -1);
      if (s.includes(',')) return rest;
      return rest === '' ? '0' : String(Number(rest));
    });
  };

  const pressClear = () => {
    playSound('toggle');
    if (tab === 'price') setCents(0);
    else setPlainStr('0');
  };

  const chip = (active: boolean) =>
    `rounded-xl px-3 py-2 text-sm font-bold tap active:scale-95 border ${
      active ? `${theme.color} text-white border-transparent shadow` : 'bg-white text-gray-700 border-gray-100 hover:border-gray-300'
    }`;

  // Ponteiros do relógio
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minAngle = minute * 6;

  return (
    <div className="w-full bg-slate-50 text-gray-800 flex flex-col h-[100dvh] relative overflow-hidden font-sans">
      <header className="flex-shrink-0 text-white shadow-lg z-30 rounded-b-3xl" style={{ background: `linear-gradient(to bottom, ${theme.hex}, ${theme.hex}e6)` }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-4 max-w-3xl mx-auto">
          <button onClick={() => { playSound('click'); onGoHome(); }} className="p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors">
            <HomeIcon className="w-5 h-5" />
          </button>
          <h1 className="flex-1 mx-2 text-center font-bold text-2xl uppercase tracking-tight truncate">{t('moduleNumbers')}</h1>
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

          {/* Abas */}
          <div className="grid grid-cols-4 gap-2">
            {TABS.map((tb) => (
              <button
                key={tb.key}
                onClick={() => { playSound('page-turn'); setTab(tb.key); }}
                className={`rounded-2xl border p-2 flex flex-col items-center gap-1 tap active:scale-95 ${
                  tab === tb.key ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white text-gray-600 border-gray-100'
                }`}
              >
                <span className="text-xl leading-none">{tb.icon}</span>
                <span className="text-[11px] font-bold leading-tight text-center">{t(tb.labelKey)}</span>
              </button>
            ))}
          </div>

          {/* Visual */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex items-center justify-center min-h-[190px]">
            {tab === 'time' && (
              <svg viewBox="0 0 200 200" className="w-44 h-44">
                <circle cx="100" cy="100" r="92" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="4" />
                {HOURS.map((n) => {
                  const a = (n * 30 - 90) * Math.PI / 180;
                  return (
                    <text key={n} x={100 + Math.cos(a) * 74} y={100 + Math.sin(a) * 74 + 6} textAnchor="middle" fontSize="16" fontWeight="700" fill={n === hour ? theme.hex : '#94a3b8'}>
                      {n}
                    </text>
                  );
                })}
                {MINUTES.map((m) => {
                  const a = (m * 6 - 90) * Math.PI / 180;
                  return <circle key={m} cx={100 + Math.cos(a) * 88} cy={100 + Math.sin(a) * 88} r={m === minute ? 4 : 2} fill={m === minute ? theme.hex : '#cbd5e1'} />;
                })}
                {/* Ponteiros giram como grupo: transform vai para a GPU, x2/y2 não. */}
                <g style={{ transform: `rotate(${hourAngle}deg)`, transformBox: 'view-box', transformOrigin: '100px 100px', transition: 'transform var(--scene-duration) var(--ease-out)' }}>
                  <line x1="100" y1="100" x2="100" y2="58" stroke={theme.hex} strokeWidth="7" strokeLinecap="round" />
                </g>
                <g style={{ transform: `rotate(${minAngle}deg)`, transformBox: 'view-box', transformOrigin: '100px 100px', transition: 'transform var(--scene-duration) var(--ease-out)' }}>
                  <line x1="100" y1="100" x2="100" y2="34" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
                </g>
                <circle cx="100" cy="100" r="6" fill="white" stroke={theme.hex} strokeWidth="3" />
              </svg>
            )}

            {tab === 'time' && (
              <div className="ml-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{t('numOnSigns')}</p>
                <p className="text-3xl font-extrabold tabular-nums whitespace-nowrap" style={{ color: theme.hex }}>{clockDisplay}</p>

                <div className="mt-2 inline-flex rounded-lg bg-gray-100 p-0.5">
                  {[false, true].map((twelve) => (
                    <button
                      key={String(twelve)}
                      onClick={() => { playSound('toggle'); setTwelveHour(twelve); }}
                      className={`tap rounded-md px-2 py-1 text-[10px] font-bold ${twelveHour === twelve ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                      style={twelveHour === twelve ? { color: theme.hex } : undefined}
                    >
                      {twelve ? 'AM/PM' : '24h'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'price' && (
              <div className="text-center">
                <div className="inline-block rounded-2xl px-8 py-5 shadow-inner" style={{ backgroundColor: `${theme.hex}12` }}>
                  <span className="text-5xl font-extrabold tabular-nums" style={{ color: theme.hex }}>{formatPriceTag(cents)}</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-3">
                  {PRICE_PRESETS.map((p) => (
                    <button key={p} onClick={() => { playSound('click'); setCents(p); }} className={chip(cents === p)}>
                      {formatPriceTag(p)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'date' && (
              <div className="text-center">
                <div className="inline-block rounded-2xl overflow-hidden shadow border border-gray-100 w-32">
                  <div className={`${theme.color} text-white text-xs font-bold uppercase tracking-widest py-1.5`}>{MONTHS[target][month]}</div>
                  <div className="text-6xl font-extrabold text-gray-800 py-3 tabular-nums">{day}</div>
                </div>
              </div>
            )}

            {tab === 'number' && (
              <span className="text-6xl font-extrabold tabular-nums" style={{ color: theme.hex }}>{plainStr}</span>
            )}
          </div>

          {/* Frase */}
          <div className={`rounded-3xl p-4 text-white shadow-md ${theme.color}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold leading-snug" dir="auto">{sentence}</p>
                {showNative && <p className="text-sm text-white/75 mt-1 leading-snug" dir="auto">{sentenceNative}</p>}
              </div>
              <button onClick={() => speak(sentence)} className="p-3 rounded-full bg-white shadow active:scale-95 transition-transform flex-shrink-0" style={{ color: theme.hex }} aria-label={t('locListen')}>
                <SpeakerIcon className="w-6 h-6" />
              </button>
            </div>

            {shortPrice && (
              <button onClick={() => speak(shortPrice)} className="mt-3 pt-3 border-t border-white/20 w-full flex items-center gap-2 text-left">
                <SpeakerIcon className="w-4 h-4 flex-shrink-0 text-white/70" />
                <span className="text-xs text-white/70">{t('numAlsoSaid')}:</span>
                <span className="font-bold" dir="auto">{shortPrice}</span>
              </button>
            )}
          </div>

          {/* Controles */}
          {tab === 'time' && (
            <>
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">{t('numHour')}</h2>
                <div className="grid grid-cols-6 gap-2">
                  {HOURS.map((h) => (
                    <button key={h} onClick={() => { playSound('click'); setHour(h); }} className={chip(hour === h)}>{h}</button>
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">{t('numPeriod')}</h2>
                <div className="flex flex-wrap gap-2">
                  {DAY_PERIODS.map((p) => (
                    <button key={p.key} onClick={() => { playSound('click'); setPeriodKey(p.key); }} className={chip(periodKey === p.key)}>
                      <span dir="auto">{p.labels[target]}</span>
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">{t('numMinute')}</h2>
                <div className="grid grid-cols-6 gap-2">
                  {MINUTES.map((m) => (
                    <button key={m} onClick={() => { playSound('click'); setMinute(m); }} className={chip(minute === m)}>
                      {String(m).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {(tab === 'price' || tab === 'number') && (
            <section>
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {tab === 'price' ? t('numTypePrice') : t('numTypeNumber')}
                </h2>
                <button onClick={pressClear} className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600">
                  {t('dirClear')}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                  <button key={d} onClick={() => pressDigit(d)} className="rounded-2xl bg-white border border-gray-100 py-3 text-2xl font-bold text-gray-700 active:scale-95 transition-transform shadow-sm">
                    {d}
                  </button>
                ))}
                {tab === 'price' ? (
                  <button onClick={pressDoubleZero} className="rounded-2xl bg-white border border-gray-100 py-3 text-2xl font-bold text-gray-700 active:scale-95 transition-transform shadow-sm">00</button>
                ) : (
                  <button onClick={pressComma} disabled={hasComma} className={`rounded-2xl bg-white border border-gray-100 py-3 text-2xl font-bold active:scale-95 transition-transform shadow-sm ${hasComma ? 'text-gray-200' : 'text-gray-700'}`}>,</button>
                )}
                <button onClick={() => pressDigit(0)} className="rounded-2xl bg-white border border-gray-100 py-3 text-2xl font-bold text-gray-700 active:scale-95 transition-transform shadow-sm">0</button>
                <button onClick={pressBack} className="rounded-2xl bg-white border border-gray-100 py-3 text-xl font-bold text-gray-400 active:scale-95 transition-transform shadow-sm">←</button>
              </div>
            </section>
          )}

          {tab === 'date' && (
            <>
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">{t('numDay')}</h2>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS.map((d) => (
                    <button key={d} onClick={() => { playSound('click'); setDay(d); }} className={`rounded-lg py-2 text-sm font-bold tap active:scale-95 border ${day === d ? `${theme.color} text-white border-transparent` : 'bg-white text-gray-700 border-gray-100'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">{t('numMonth')}</h2>
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS[target].map((m, i) => (
                    <button key={m} onClick={() => { playSound('click'); setMonth(i); }} className={`${chip(month === i)} truncate`}>{m}</button>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Perguntas */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('numAsk')}</h2>
            <ul className="divide-y divide-gray-100">
              {NUM_QUESTIONS.map((q, i) => (
                <li key={i}>
                  <button onClick={() => speak(q[target])} className="w-full py-2.5 flex items-center gap-3 text-left">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-snug" dir="auto">{q[target]}</p>
                      {showNative && <p className="text-xs text-gray-400 leading-snug" dir="auto">{q[native]}</p>}
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
