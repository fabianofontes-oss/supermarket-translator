
import React, { useEffect, useMemo, useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { PhraseCard } from '../components/PhraseCard';
import type { Country } from '../types';
import { SpeakerIcon, SpeakerOffIcon, IconeRelogio } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import type { VoiceStatus } from '../utils/speech';
import { toLangCode } from './location/data/locationData';
import {
  buildTime,
  buildPrice,
  buildPriceShort,
  buildDecimal,
  buildDate,
  formatPriceTag,
  currencyForCountry,
  decimalSeparatorFor,
  MONTHS,
  numberExamplesFor,
  PRICE_PRESETS,
  DAY_PERIODS,
  periodFromHour24,
  uses12hClock,
  formatClockDisplay,
  withPeriod,
  questionsFor,
  numQuestionByKey,
  type NumQuestion,
  type NumTab,
} from './numbers/data/numbersData';

interface NumbersModuleProps {
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
 * Os quatro ícones dos modos.
 *
 * Eram emoji — 🕒 🏷️ 📅 🔢 — e emoji não serve como ícone de interface aqui por
 * três motivos, nenhum deles estético. Não aceita `currentColor`, então na aba
 * escolhida ele é o único ícone do app que não tinge com a cor do módulo. Vem
 * da fonte do sistema, então é um desenho no Android, outro no iPhone e outro
 * no Windows — e este app é PWA instalado nos três. E é colorido e claro, então
 * no tema escuro ele fica aceso sozinho no meio da tela.
 *
 * Casa do projeto: 24x24, fill none, traço 1.8, `currentColor` (AGENTS.md §7.2).
 *
 * O relógio mora em `components/Icons.tsx`: é também o ícone deste módulo no hub.
 */

const IconeEtiqueta: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 11.4V4.8a1.3 1.3 0 0 1 1.3-1.3h6.6c.35 0 .68.14.92.38l8 8a1.3 1.3 0 0 1 0 1.84l-6.6 6.6a1.3 1.3 0 0 1-1.84 0l-8-8a1.3 1.3 0 0 1-.38-.92Z" />
    <circle cx="8" cy="8" r="1.6" />
  </svg>
);

const IconeCalendario: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className} aria-hidden="true">
    <rect x="3.2" y="5" width="17.6" height="16" rx="2.4" />
    <path strokeLinecap="round" d="M3.2 10h17.6M8.5 3v4M15.5 3v4" />
  </svg>
);

/* Teclado numérico, e não um cerquilha: `#` só diz "número" em inglês, e este
   modo é justamente o que abre um teclado para digitar a quantidade. */
const IconeTeclado: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className} aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.4" />
    <path strokeLinecap="round" d="M8.2 8.2h.01M12 8.2h.01M15.8 8.2h.01M8.2 12h.01M12 12h.01M15.8 12h.01M8.2 15.8h.01M12 15.8h.01M15.8 15.8h.01" />
  </svg>
);

const TABS: { key: NumTab; labelKey: string; Icon: React.FC<{ className?: string }> }[] = [
  { key: 'time',   labelKey: 'numTime',   Icon: IconeRelogio },
  { key: 'price',  labelKey: 'numPrice',  Icon: IconeEtiqueta },
  { key: 'date',   labelKey: 'numDate',   Icon: IconeCalendario },
  { key: 'number', labelKey: 'numNumber', Icon: IconeTeclado },
];

// Horas de 00 a 23: é o que está escrito em placa, bilhete e horário.
const HOURS = Array.from({ length: 24 }, (_, i) => i);
// Dois anéis: o de dentro é como se fala (1 a 12), o de fora é como se
// escreve (13 a 24). Ver 22 e 10 no mesmo ponto é o que explica a relação.
const DIAL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

/** Número solto: até 999.999, que é até onde `numberToWords` sabe contar. */
const MAX_INT_DIGITS = 6;

/** Um algarismo a mais no número solto. Devolve o MESMO texto quando não cabe. */
const appendDigit = (s: string, d: number): string => {
  const [int, dec] = s.split(',');
  if (dec === undefined) return int.length >= MAX_INT_DIGITS ? s : String(Number(int + d));
  return dec.length >= 2 ? s : `${int},${dec}${d}`;
};

// Preço e número saem em minúscula; hora e data já vêm com maiúscula.
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * "¿Qué hora es?" mora logo abaixo do relógio, e não no fim da lista: antes
 * quem entrava em Hora querendo perguntar as horas tinha que rolar por 36
 * botões de hora e minuto até achar.
 */
const PERGUNTA_DA_HORA = numQuestionByKey('whatTime');

/** Títulos de seção: 14px e cinza de leitura, não o cinza apagado de 12px. */
const TITULO = 'text-sm font-bold uppercase tracking-wide text-gray-600 dark:text-slate-300';

/** Tecla do teclado numérico; a cor do texto vem à parte. */
const TECLA = 'rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 py-3 text-2xl font-bold shadow-sm tap active:scale-95';

/** Números do mostrador: a escala de toque gira em volta do próprio número. */
const TOQUE_SVG: React.CSSProperties = { transformBox: 'fill-box', transformOrigin: 'center' };

/**
 * A geometria do mostrador, em unidades do `viewBox` de 200. O SVG vai na tela com
 * 176px (`w-44`, para o painel "nas placas" caber ao lado a 375px), então cada
 * unidade vale 0,88px — e é por essa conta que os números são o que são:
 *
 * - letra: 16 no anel de fora dá 14,1px e 17 no de dentro dá 15px. Com 13 e 16,
 *   o anel de fora saía com 11px, abaixo do piso de leitura, justo nos números
 *   que ela passou a poder tocar.
 * - alvo: raio 12,5 é um círculo de ~22px na tela (eram 19 e 18). Os anéis
 *   ficam a 26 unidades um do outro (75 e 49), então o alvo de um não entra no
 *   do outro; no anel de dentro, vizinhos distam 25,4, e também não se cruzam.
 *   Alvo maior que isso só com mostrador maior — e aí o painel sai do lado.
 *   A grade de horas logo abaixo continua sendo o caminho de 44px.
 * - o anel de fora não passa de 75: com a letra de 16, o "15" e o "21" já
 *   encostariam no ponto do minuto 15 e 45, que mora no raio 88.
 *
 * O ponteiro dos minutos termina entre os dois anéis, e não em cima de um número.
 */
const RAIO_FORA = 75;
const RAIO_DENTRO = 49;
const ALVO_MOSTRADOR = 12.5;

export default function NumbersModule({
  nativeCountry,
  targetCountry,
  t,
  theme,
  onGoHome,
  onOpenLanguageModal,
  onOpenShare,
  handlePlayAudio,
  voiceStatus = 'unknown',
}: NumbersModuleProps) {
  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;

  // A moeda e o separador decimal são do PAÍS onde ela está, não do idioma:
  // nos EUA o preço é "$4.20", e a mesma tela não pode escrever "37,5".
  const currency = currencyForCountry(targetCountry.code);
  const sep = decimalSeparatorFor(targetCountry.code);
  const mostrarNumero = (s: string) => (sep === ',' ? s : s.replace(',', sep));

  const [tab, setTab] = useState<NumTab>('time');
  // A hora começa na do celular, com os minutos arredondados para baixo de 5 em
  // 5 (a grade só tem múltiplos de 5). Antes abria sempre em 15:30 — às 10 da
  // manhã a primeira coisa na tela era "três e meia da tarde", um relógio
  // errado, enquanto a aba Data já abria no dia de hoje.
  const [hour, setHour] = useState(() => new Date().getHours());
  const [minute, setMinute] = useState(() => Math.floor(new Date().getMinutes() / 5) * 5);
  // O formato começa no do país de destino, mas a pessoa pode trocar.
  const [twelveHour, setTwelveHour] = useState(() => uses12hClock(targetCountry.code));
  useEffect(() => setTwelveHour(uses12hClock(targetCountry.code)), [targetCountry.code]);
  const [cents, setCents] = useState(420);
  const [day, setDay] = useState(() => new Date().getDate());
  const [month, setMonth] = useState(() => new Date().getMonth());
  // Número solto guardado como texto e sempre com vírgula ("37,5"); o ponto
  // dos EUA só entra na hora de mostrar. Abre no exemplo dos gramas.
  const [plainStr, setPlainStr] = useState('250');
  const [plainIntStr, plainDecStr = ''] = plainStr.split(',');
  const plainInt = Number(plainIntStr || 0);
  const hasComma = plainStr.includes(',');

  /*
   * "Valor novo". Liga ao abrir, ao trocar de aba e depois de tocar num valor
   * pronto; com ela ligada, o primeiro algarismo COMEÇA DO ZERO em vez de ser
   * empurrado no fim do que está na tela. Antes a aba Preço abria em 4,20 €,
   * ela tocava no 5 querendo cinco euros e aparecia 42,05 € — e concluía que o
   * teclado estava com defeito. Depois do primeiro toque o teclado volta a
   * empurrar os centavos, como num terminal de caixa.
   *
   * É estado, e não ref, porque o botão da vírgula depende dela para desenhar;
   * e é seguro com toques rápidos porque clique é evento discreto: o React
   * redesenha antes do próximo, então o handler seguinte já lê o valor novo.
   */
  const [novo, setNovo] = useState(true);
  // O 7º algarismo foi recusado. Antes o teclado simplesmente parava de
  // responder, sem aviso, e ela achava que o app tinha travado.
  const [cheio, setCheio] = useState(false);

  // O período sai da hora, então nunca aparece "las diez de la madrugada".
  const period = useMemo(
    () => DAY_PERIODS.find((p) => p.key === periodFromHour24(hour))!,
    [hour],
  );
  const clockDisplay = formatClockDisplay(hour, minute, twelveHour);
  // "3:30 PM": o PM vai menor para caber ao lado do relógio a 375px.
  const [clockDigits, clockSuffix] = clockDisplay.split(' ');

  const sentence = useMemo(() => {
    switch (tab) {
      case 'time': return withPeriod(buildTime(target, hour, minute), period.phrases[target]);
      case 'price': return cap(buildPrice(target, cents, currency));
      case 'date': return buildDate(target, day, month, targetCountry.code);
      default: return cap(buildDecimal(target, plainInt, plainDecStr));
    }
  }, [tab, target, hour, minute, cents, currency, day, month, targetCountry.code, plainInt, plainDecStr, period]);

  // Forma curta do preço, a que se ouve no caixa. Some quando repete a frase de
  // cima: em francês a forma curta É a inteira, porque "quatre vingt" sem a
  // moeda soa como "quatre-vingts", oitenta (ver `buildPriceShort`).
  const shortPrice = useMemo(() => {
    if (tab !== 'price') return null;
    const curto = buildPriceShort(target, cents, currency);
    if (!curto || curto.toLowerCase() === sentence.toLowerCase()) return null;
    return cap(curto);
  }, [tab, target, cents, currency, sentence]);

  const sentenceNative = useMemo(() => {
    switch (tab) {
      case 'time': return withPeriod(buildTime(native, hour, minute), period.phrases[native]);
      // Mesma moeda da frase de cima: é o dinheiro do país onde ela está.
      case 'price': return cap(buildPrice(native, cents, currency));
      case 'date': return buildDate(native, day, month);
      default: return cap(buildDecimal(native, plainInt, plainDecStr));
    }
  }, [tab, native, hour, minute, cents, currency, day, month, plainInt, plainDecStr, period]);

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

  const trocarAba = (nova: NumTab) => {
    playSound('page-turn');
    setTab(nova);
    setNovo(true);
    setCheio(false);
  };

  // Teclado numérico compartilhado por Preço e Número.
  const pressDigit = (d: number) => {
    playSound('click');
    const doZero = novo;
    setNovo(false);
    if (tab === 'price') {
      setCents((v) => (doZero ? d : (v * 10 + d) % 1000000));
      return;
    }
    setCheio(!doZero && !plainStr.includes(',') && plainStr.length >= MAX_INT_DIGITS);
    setPlainStr((s) => (doZero ? String(d) : appendDigit(s, d)));
  };

  const pressComma = () => {
    playSound('click');
    const doZero = novo;
    setNovo(false);
    setCheio(false);
    setPlainStr((s) => (doZero ? '0,' : s.includes(',') ? s : `${s},`));
  };

  const pressDoubleZero = () => {
    playSound('click');
    const doZero = novo;
    setNovo(false);
    setCents((v) => (doZero ? 0 : (v * 100) % 1000000));
  };

  // Apagar um algarismo é mexer no que está na tela: desliga o "valor novo".
  const pressBack = () => {
    playSound('toggle');
    setNovo(false);
    setCheio(false);
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
    setNovo(true);
    setCheio(false);
    if (tab === 'price') setCents(0);
    else setPlainStr('0');
  };

  const escolherPreco = (p: number) => {
    playSound('click');
    setCents(p);
    setNovo(true);
  };

  const escolherExemplo = (value: string) => {
    playSound('click');
    setPlainStr(value);
    setNovo(true);
    setCheio(false);
  };

  const chip = (active: boolean) =>
    `rounded-xl px-3 py-2 text-sm font-bold tap active:scale-95 border ${
      active ? `${theme.color} text-white border-transparent shadow` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
    }`;

  /** Uma pergunta: o destino em cima, o português embaixo em 14px, o alto-falante. */
  const conteudoPergunta = (q: NumQuestion) => (
    <>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold leading-snug" dir="auto">{q.text[target]}</span>
        {showNative && <span className="block text-sm text-gray-600 dark:text-slate-300 leading-snug" dir="auto">{q.text[native]}</span>}
      </span>
      <span className="flex-shrink-0" style={{ color: 'var(--tema-texto)' }}>
        <Listen className="w-5 h-5" />
      </span>
    </>
  );

  // A pergunta da hora já está embaixo do relógio; não se repete na lista.
  const perguntas = questionsFor(tab).filter((q) => q !== PERGUNTA_DA_HORA);

  // Ponteiros do relógio
  const dialHour = hour % 12 || 12;
  const isPM = hour >= 12;
  const outerActive = hour === 0 ? 24 : hour >= 13 ? hour : null;

  /** Do mostrador de 12 para a hora de 24, que é a que o resto do módulo usa. */
  const setFrom12 = (d: number, pm: boolean) => setHour((d % 12) + (pm ? 12 : 0));
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minAngle = minute * 6;

  return (
    <ModuleShell
      title={t('numTitle')}
      dica={t('hintNumbers')}
      theme={theme}
      t={t}
      nativeCountry={nativeCountry}
      targetCountry={targetCountry}
      onGoHome={onGoHome}
      onOpenLanguageModal={onOpenLanguageModal}
      onOpenShare={onOpenShare}
      pinned={(
        <>
          {/* Abas */}
          <div className="grid grid-cols-4 gap-2">
            {TABS.map((tb) => (
              <button
                key={tb.key}
                aria-pressed={tab === tb.key}
                onClick={() => trocarAba(tb.key)}
                className={`rounded-2xl border p-2 flex flex-col items-center gap-1 tap active:scale-95 ${
                  tab === tb.key ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-100 dark:border-slate-700'
                }`}
              >
                <tb.Icon className="w-6 h-6" />
                {/* 14px e não 11: é o piso de leitura do projeto. Como as quatro
                    abas crescem juntas na grade, a palavra mais longa só quebra
                    em duas linhas — `leading-tight` já conta com isso. */}
                <span className="text-sm font-bold leading-tight text-center" dir="auto">{t(tb.labelKey)}</span>
              </button>
            ))}
          </div>
          {/* Frase */}
          <PhraseCard
            theme={theme}
            phrase={sentence}
            alt={showNative ? sentenceNative : null}
            Listen={Listen}
            listenLabel={audioLabel(t('locListen'))}
            onSpeak={speak}
          >
            {/* A forma curta é o que ela vai ouvir no caixa, e é a sacada da aba.
                Rótulo e frase em linhas separadas: emendados ("Também falam
                cuatro con veinte") ela não sabia onde acabava o português. */}
            {shortPrice && (
              <button onClick={() => speak(shortPrice)} className="mt-3 pt-3 border-t border-white/20 w-full flex items-center gap-3 text-left tap active:scale-[0.98]">
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-white leading-snug" dir="auto">{t('numAlsoSaid')}</span>
                  <span className="block text-lg font-bold text-white leading-snug" dir="auto">{shortPrice}</span>
                </span>
                <Listen className="w-5 h-5 flex-shrink-0" />
              </button>
            )}
          </PhraseCard>
        </>
      )}
    >

      {/* Visual. `flex-wrap`: se o painel do relógio não couber ao lado numa
          tela estreita, ele desce, em vez de vazar para fora do cartão. */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex flex-wrap items-center justify-center gap-4 min-h-[190px]">
        {tab === 'time' && (
          /* O desenho inteiro é `aria-hidden`: a grade de horas logo abaixo é o
             caminho do teclado e do leitor de tela. Os números do mostrador são
             um atalho para o dedo — o maior desenho da tela não respondia ao
             toque, e ela tentava. */
          <svg viewBox="0 0 200 200" className="w-44 h-44 flex-shrink-0" aria-hidden="true">
            <circle cx="100" cy="100" r="92" fill="var(--art-ground)" stroke="var(--art-edge)" strokeWidth="4" />

            {/* Marcas de minuto na borda */}
            {MINUTES.map((m) => {
              const a = (m * 6 - 90) * Math.PI / 180;
              return <circle key={m} cx={100 + Math.cos(a) * 88} cy={100 + Math.sin(a) * 88} r={m === minute ? 3.5 : 1.8} fill={m === minute ? theme.hex : 'var(--art-fill)'} />;
            })}

            {/* Anel de fora: 13 a 24, como está escrito nas placas. Na cor de
                texto do desenho (`--art-label`), e não no cinza de preenchimento:
                os números de 13 a 24 quase não apareciam. O 24 é a meia-noite. */}
            {DIAL.map((n) => {
              const outer = n + 12;
              const h24 = outer % 24;
              const a = (n * 30 - 90) * Math.PI / 180;
              const x = 100 + Math.cos(a) * RAIO_FORA;
              const y = 100 + Math.sin(a) * RAIO_FORA;
              const on = outer === outerActive;
              return (
                <g key={`o${n}`} data-hora={h24} onClick={() => { playSound('click'); setHour(h24); }} className="cursor-pointer tap active:scale-90" style={TOQUE_SVG}>
                  <circle cx={x} cy={y} r={ALVO_MOSTRADOR} fill="transparent" />
                  <text x={x} y={y + 5.5} textAnchor="middle" fontSize="16" fontWeight="700" fill={on ? 'var(--tema-texto)' : 'var(--art-label)'}>
                    {outer}
                  </text>
                </g>
              );
            })}

            {/* Anel de dentro: 1 a 12, como se fala. O toque mantém a metade do
                dia: com 15:00 na tela, tocar no 4 dá 16:00. */}
            {DIAL.map((n) => {
              const a = (n * 30 - 90) * Math.PI / 180;
              const x = 100 + Math.cos(a) * RAIO_DENTRO;
              const y = 100 + Math.sin(a) * RAIO_DENTRO;
              return (
                <g key={n} data-hora12={n} onClick={() => { playSound('click'); setFrom12(n, isPM); }} className="cursor-pointer tap active:scale-90" style={TOQUE_SVG}>
                  <circle cx={x} cy={y} r={ALVO_MOSTRADOR} fill="transparent" />
                  <text x={x} y={y + 6} textAnchor="middle" fontSize="17" fontWeight="700" fill={n === dialHour ? 'var(--tema-texto)' : 'var(--art-label)'}>
                    {n}
                  </text>
                </g>
              );
            })}
            {/* Ponteiros giram como grupo: transform vai para a GPU, x2/y2 não.
                `pointer-events: none` para não roubarem o toque dos números. */}
            <g pointerEvents="none" style={{ transform: `rotate(${hourAngle}deg)`, transformBox: 'view-box', transformOrigin: '100px 100px', transition: 'transform var(--scene-duration) var(--ease-out)' }}>
              <line x1="100" y1="100" x2="100" y2="66" stroke={theme.hex} strokeWidth="7" strokeLinecap="round" />
            </g>
            <g pointerEvents="none" style={{ transform: `rotate(${minAngle}deg)`, transformBox: 'view-box', transformOrigin: '100px 100px', transition: 'transform var(--scene-duration) var(--ease-out)' }}>
              <line x1="100" y1="100" x2="100" y2="37" stroke="var(--art-ink)" strokeWidth="4" strokeLinecap="round" />
            </g>
            <circle cx="100" cy="100" r="6" fill="var(--art-plate)" stroke={theme.hex} strokeWidth="3" pointerEvents="none" />
          </svg>
        )}

        {tab === 'time' && (
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-gray-600 dark:text-slate-300 mb-1" dir="auto">{t('numOnSigns')}</p>
            <p className="text-3xl font-extrabold tabular-nums whitespace-nowrap" style={{ color: 'var(--tema-texto)' }}>
              {clockDigits}
              {clockSuffix && <span className="text-lg ml-1">{clockSuffix}</span>}
            </p>

            <div className="mt-2 inline-flex rounded-lg bg-gray-100 dark:bg-slate-700 p-0.5">
              {[false, true].map((twelve) => (
                <button
                  key={String(twelve)}
                  aria-pressed={twelveHour === twelve}
                  onClick={() => { playSound('toggle'); setTwelveHour(twelve); }}
                  className={`tap rounded-md px-2 py-1 text-sm font-bold ${twelveHour === twelve ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-gray-600 dark:text-slate-300'}`}
                  style={twelveHour === twelve ? { color: 'var(--tema-texto)' } : undefined}
                >
                  {twelve ? 'AM/PM' : '24h'}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'price' && (
          <div className="text-center">
            <div className="inline-block rounded-2xl px-6 py-5 shadow-inner" style={{ backgroundColor: `${theme.hex}12` }}>
              <span className="text-5xl font-extrabold tabular-nums whitespace-nowrap" style={{ color: 'var(--tema-texto)' }}>{formatPriceTag(cents, currency)}</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {PRICE_PRESETS.map((p) => (
                <button key={p} aria-pressed={cents === p} onClick={() => escolherPreco(p)} className={`${chip(cents === p)} tabular-nums`}>
                  {formatPriceTag(p, currency)}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'date' && (
          <div className="text-center">
            <div className="inline-block rounded-2xl overflow-hidden shadow border border-gray-100 dark:border-slate-700 w-36">
              <div className={`${theme.color} text-white text-sm font-bold uppercase tracking-wide py-1.5`} dir="auto">{MONTHS[target][month]}</div>
              <div className="text-6xl font-extrabold text-gray-800 dark:text-slate-100 py-3 tabular-nums">{day}</div>
            </div>
          </div>
        )}

        {tab === 'number' && (
          <div className="text-center w-full">
            {/* Com vírgula e decimais o número passa de 7 caracteres, e a 60px
                "123456,78" não cabe a 375px. */}
            <span className={`block font-extrabold tabular-nums ${plainStr.length > 7 ? 'text-5xl' : 'text-6xl'}`} style={{ color: 'var(--tema-texto)' }}>
              {mostrarNumero(plainStr)}
            </span>
            <p role="status" className="mt-1 min-h-[1.25rem] text-sm font-semibold text-gray-600 dark:text-slate-300" dir="auto">
              {cheio ? t('numMaxDigits') : ''}
            </p>
            {/* Exemplos com a situação escrita: sem eles a aba não dizia para
                que serve. Mesmo estilo dos preços prontos. */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {numberExamplesFor(targetCountry.code).map((ex) => (
                <button key={ex.value} aria-pressed={plainStr === ex.value} onClick={() => escolherExemplo(ex.value)} className={chip(plainStr === ex.value)}>
                  <span className="tabular-nums">{mostrarNumero(ex.value)}</span>
                  {' · '}
                  <span dir="auto">{ex.label[native]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Controles */}
      {tab === 'time' && (
        <>
          <button
            onClick={() => speak(PERGUNTA_DA_HORA.text[target])}
            className="w-full rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm px-4 py-3 flex items-center gap-3 text-left tap active:scale-[0.98]"
          >
            {conteudoPergunta(PERGUNTA_DA_HORA)}
          </button>

          <section>
            <h2 className={`${TITULO} mb-2 px-1`} dir="auto">{t('numHour')}</h2>

            {/* Em AM/PM a grade tem DOZE números e um seletor de metade do dia.
                Antes mostrava os mesmos 24 nos dois modos: quem escolhia AM/PM e
                tocava em 20 via "8:00 PM" aparecer sem ter escolhido PM em lugar
                nenhum — o seletor simplesmente não existia, e o modo não mudava
                nada abaixo do relógio. */}
            {twelveHour && (
              <div className="mb-2 inline-flex rounded-xl bg-gray-200/70 dark:bg-slate-700/70 p-1">
                {[false, true].map((pm) => (
                  <button
                    key={String(pm)}
                    aria-pressed={isPM === pm}
                    onClick={() => { playSound('toggle'); setFrom12(dialHour, pm); }}
                    className={`tap rounded-lg px-5 py-1.5 text-sm font-bold ${isPM === pm ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-gray-600 dark:text-slate-300'}`}
                    style={isPM === pm ? { color: 'var(--tema-texto)' } : undefined}
                  >
                    {pm ? 'PM' : 'AM'}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-6 gap-2">
              {(twelveHour ? DIAL : HOURS).map((h) => {
                const escolhida = twelveHour ? dialHour === h : hour === h;
                return (
                  <button
                    key={h}
                    aria-pressed={escolhida}
                    onClick={() => { playSound('click'); if (twelveHour) setFrom12(h, isPM); else setHour(h); }}
                    className={`${chip(escolhida)} tabular-nums`}
                  >
                    {twelveHour ? h : String(h).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </section>
          <section>
            <h2 className={`${TITULO} mb-2 px-1`} dir="auto">{t('numMinute')}</h2>
            <div className="grid grid-cols-6 gap-2">
              {MINUTES.map((m) => (
                <button key={m} aria-pressed={minute === m} onClick={() => { playSound('click'); setMinute(m); }} className={`${chip(minute === m)} tabular-nums`}>
                  {String(m).padStart(2, '0')}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {(tab === 'price' || tab === 'number') && (
        <section>
          <div className="flex items-center justify-between gap-3 mb-2 px-1">
            <h2 className={TITULO} dir="auto">
              {tab === 'price' ? t('numTypePrice') : t('numTypeNumber')}
            </h2>
            {/* Botão de verdade, com borda: antes era uma palavrinha cinza de
                12px no canto, e ninguém via que dava para tocar. */}
            <button
              onClick={pressClear}
              className="hit flex-shrink-0 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-bold text-gray-700 dark:text-slate-200 shadow-sm tap active:scale-95"
            >
              <span dir="auto">{t('erase')}</span>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <button key={d} onClick={() => pressDigit(d)} className={`${TECLA} text-gray-700 dark:text-slate-200`}>
                {d}
              </button>
            ))}
            {tab === 'price' ? (
              <button onClick={pressDoubleZero} className={`${TECLA} text-gray-700 dark:text-slate-200`}>00</button>
            ) : (
              /* Com o "valor novo" ligado a vírgula continua valendo mesmo que o
                 número na tela já tenha uma: o toque começa um número do zero. */
              <button
                onClick={pressComma}
                disabled={hasComma && !novo}
                className={`${TECLA} ${hasComma && !novo ? 'text-gray-200 dark:text-slate-600' : 'text-gray-700 dark:text-slate-200'}`}
              >
                {sep}
              </button>
            )}
            <button onClick={() => pressDigit(0)} className={`${TECLA} text-gray-700 dark:text-slate-200`}>0</button>
            <button onClick={pressBack} className={`${TECLA} text-gray-500 dark:text-slate-400`}>←</button>
          </div>
        </section>
      )}

      {tab === 'date' && (
        <>
          <section>
            <h2 className={`${TITULO} mb-2 px-1`} dir="auto">{t('numDay')}</h2>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((d) => (
                <button key={d} aria-pressed={day === d} onClick={() => { playSound('click'); setDay(d); }} className={`rounded-lg py-2 text-sm font-bold tabular-nums tap active:scale-95 border ${day === d ? `${theme.color} text-white border-transparent` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700'}`}>
                  {d}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h2 className={`${TITULO} mb-2 px-1`} dir="auto">{t('numMonth')}</h2>
            {/* O mês no idioma de destino em cima e o português embaixo, os dois
                em 14px: "enero" não lembra "janeiro", e "juin" e "juillet" se
                confundem. */}
            <div className="grid grid-cols-3 gap-2">
              {MONTHS[target].map((m, i) => (
                <button key={m} aria-pressed={month === i} onClick={() => { playSound('click'); setMonth(i); }} className={`${chip(month === i)} leading-tight`}>
                  <span className="block truncate" dir="auto">{m}</span>
                  {showNative && (
                    <span className={`block truncate text-sm font-normal ${month === i ? 'text-white' : 'text-gray-600 dark:text-slate-300'}`} dir="auto">
                      {MONTHS[native][i]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Perguntas: só as da aba aberta, e as duas de socorro no topo. */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
        <h2 className={`${TITULO} mb-2`} dir="auto">{t('numAsk')}</h2>
        <ul className="divide-y divide-gray-100 dark:divide-slate-700">
          {perguntas.map((q) => (
            <li key={q.key}>
              <button onClick={() => speak(q.text[target])} className="w-full py-3 flex items-center gap-3 text-left tap active:scale-[0.98]">
                {conteudoPergunta(q)}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </ModuleShell>
  );
}
