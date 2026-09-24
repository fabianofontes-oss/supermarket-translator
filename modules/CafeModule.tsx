
import React, { useMemo, useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { PhraseCard } from '../components/PhraseCard';
import type { Country } from '../types';
import { SpeakerIcon, SpeakerOffIcon } from '../components/Icons';
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
  modsFor,
  vesselFor,
  type Drink,
  type Modifier,
  type Vessel,
} from './cafe/data/cafeData';

interface CafeModuleProps {
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
 * Título de seção: 16px, sem a caixa-alta miúda de antes (12px, cinza,
 * espaçada), que parecia rodapé. O mesmo do Onde dói.
 */
const TITULO = 'text-base font-bold text-gray-700 dark:text-slate-200 mb-2 px-1';

/**
 * Português da linha de apoio: nunca apagado, nunca abaixo de 14px. É por ele
 * que ela ESCOLHE — ainda não sabe o que é "cortado", sabe o que é "pingado" —,
 * e antes era a menor letra da tela, 10px.
 */
const apoio = (active: boolean) => (active ? 'text-white' : 'text-gray-600 dark:text-slate-300');

/** Copo (vaso) ou xícara (taza) com as camadas da bebida. */
const VesselDrawing: React.FC<{ drink: Drink; vessel: Vessel }> = ({ drink, vessel }) => {
  const isCup = vessel === 'cup';
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
    <svg viewBox="0 0 120 140" className="w-28 h-32 sm:w-36 sm:h-40" aria-hidden="true">
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
          <path d="M22 46 h68 v34 a34 24 0 0 1 -68 0 z" fill="none" stroke="var(--art-line)" strokeWidth="3" />
          <path d="M90 56 a14 14 0 0 1 0 28" fill="none" stroke="var(--art-line)" strokeWidth="3" />
          <ellipse cx="56" cy="46" rx="34" ry="7" fill="none" stroke="var(--art-line)" strokeWidth="3" />
          <rect x="34" y="112" width="44" height="4" rx="2" fill="var(--art-fill)" />
        </>
      ) : (
        <>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="4" fill="none" stroke="var(--art-line)" strokeWidth="3" />
          <ellipse cx="57" cy="24" rx="23" ry="5" fill="none" stroke="var(--art-line)" strokeWidth="3" />
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
  onOpenShare,
  handlePlayAudio,
  voiceStatus = 'unknown',
}: CafeModuleProps) {
  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;
  /**
   * O módulo ensina o costume da Espanha (o cortado no copo, a tapa de graça, o
   * "de máquina"). Fora dela a frase sai na língua do destino, mas as notas
   * continuam falando da Espanha — então a tela diz isso logo no topo, em vez de
   * deixar ela aprender como verdade de Miami o que é costume de Madri.
   */
  const naEspanha = targetCountry.code === 'es';

  const [drink, setDrink] = useState<Drink>(DRINKS[1]); // cortado
  const [modKeys, setModKeys] = useState<string[]>([]);

  // O que se mostra depende da bebida; o que foi marcado, não. Trocar do cortado
  // para o solo esconde "con leche fría" sem apagar a escolha — ao voltar, ela
  // está lá. Quem tira da frase o que não vale é `buildOrder`.
  const available = useMemo(() => modsFor(drink), [drink]);
  const mods = useMemo(() => MODIFIERS.filter((m) => modKeys.includes(m.key)), [modKeys]);
  const order = useMemo(() => buildOrder(target, drink, mods), [target, drink, mods]);
  const orderNative = useMemo(() => buildOrder(native, drink, mods), [native, drink, mods]);
  // O desenho e a etiqueta seguem "en taza"/"en vaso", não só o padrão da bebida.
  const vessel = vesselFor(drink, modKeys);

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
    <ModuleShell
      title={t('moduleCafe')}
      theme={theme}
      t={t}
      nativeCountry={nativeCountry}
      targetCountry={targetCountry}
      onGoHome={onGoHome}
      onOpenLanguageModal={onOpenLanguageModal}
      onOpenShare={onOpenShare}
      dica={t('hintCafe')}
      pinned={(
        <>
          {/* Pedido */}
          <PhraseCard
            theme={theme}
            phrase={order}
            alt={showNative ? orderNative : null}
            Listen={Listen}
            listenLabel={audioLabel(t('locListen'))}
            onSpeak={speak}
          />
        </>
      )}
    >

      {/* Fora da Espanha: o aviso que enquadra as notas (auditoria [cafe-1], opção B). */}
      {!naEspanha && (
        <p
          role="note"
          className="rounded-2xl border-l-4 bg-white dark:bg-slate-800 px-4 py-3 text-base font-semibold leading-snug text-gray-800 dark:text-slate-100 shadow-sm"
          style={{ borderLeftColor: 'var(--tema-texto)' }}
          dir="auto"
        >
          {t('cafeSpainOnly')}
        </p>
      )}

      {/* Copo + explicação */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-4">
        <div className="flex-shrink-0"><VesselDrawing drink={drink} vessel={vessel} /></div>
        <div className="min-w-0">
          <p className="text-lg font-extrabold leading-tight" dir="auto">{drink.names[target]}</p>
          {showNative && <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 leading-snug mt-0.5" dir="auto">{drink.names[native]}</p>}
          <p className="text-sm text-gray-600 dark:text-slate-300 leading-snug mt-1" dir="auto">{drink.descs[showNative ? native : target]}</p>
          <span className="inline-block mt-2 text-sm font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${theme.hex}18`, color: 'var(--tema-texto)' }} dir="auto">
            {vessel === 'cup' ? t('cafeInCup') : t('cafeInGlass')}
          </span>
        </div>
      </div>

      {/* Bebidas — escolha única. Duas colunas e não três: com o nome a 16px e o
          português a 14px, "descafeinado de máquina" não cabia em três. */}
      <section>
        <h2 className={TITULO} dir="auto">{t('cafeDrinks')}</h2>
        <div className="grid grid-cols-2 gap-2">
          {DRINKS.map((d) => {
            const active = d.key === drink.key;
            return (
              <button
                key={d.key}
                onClick={() => { playSound('click'); setDrink(d); }}
                aria-pressed={active}
                className={`rounded-2xl border px-2 py-3 tap active:scale-95 ${active ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700'}`}
              >
                <span className="block text-base font-bold leading-tight" dir="auto">{d.names[target]}</span>
                {showNative && <span className={`block text-sm leading-snug mt-1 ${apoio(active)}`} dir="auto">{d.names[native]}</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Modificadores — somam. O ✓ no marcado é o que os distingue dos cafés, que
          são escolha única e tinham a mesmíssima cara; o título diz o resto. */}
      <section>
        <h2 className={TITULO} dir="auto">{t('cafeHowYouWant')}</h2>
        <div className="flex flex-wrap gap-2">
          {available.map((m) => {
            const active = modKeys.includes(m.key);
            return (
              <button
                key={m.key}
                onClick={() => toggleMod(m)}
                aria-pressed={active}
                className={`rounded-xl px-3 py-2 text-base font-bold tap active:scale-95 border ${active ? `${theme.color} text-white border-transparent shadow` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700'}`}
              >
                <span className="block" dir="auto">{active && <span aria-hidden="true">✓ </span>}{m.labels[target]}</span>
                {showNative && <span className={`block text-sm font-medium ${apoio(active)}`} dir="auto">{m.labels[native]}</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Frases do bar — antes das palavras do cardápio, porque é daqui que sai o
          pedido: a caña abre a lista, e a lista de palavras, agora com a
          explicação sempre aberta, ficou alta demais para vir antes. */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
        <h2 className="text-base font-bold text-gray-700 dark:text-slate-200 mb-1" dir="auto">{t('cafePhrases')}</h2>
        <ul className="divide-y divide-gray-100 dark:divide-slate-700">
          {CAFE_QUESTIONS.map((q, i) => (
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

      {/* Palavras do cardápio. A explicação fica SEMPRE à vista: antes ela abria
          no toque e nada avisava, e era justamente a parte que ensina o costume.
          A linha inteira é o botão de ouvir, como nas frases do bar. */}
      <section>
        <h2 className={TITULO} dir="auto">{t('cafePortions')}</h2>
        <ul className="space-y-2">
          {PORTIONS.map((p) => (
            <li key={p.key}>
              <button
                onClick={() => speak(p.names[target])}
                className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 px-3 py-3 flex items-start gap-3 text-left tap active:scale-[0.98]"
              >
                <span className="text-2xl leading-none flex-shrink-0 pt-0.5" aria-hidden="true">{p.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-base font-bold leading-tight" dir="auto">{p.names[target]}</span>
                  {showNative && <span className="block text-sm font-semibold text-gray-700 dark:text-slate-200 leading-snug mt-0.5" dir="auto">{p.names[native]}</span>}
                  <span className="block text-sm text-gray-600 dark:text-slate-300 leading-snug mt-1" dir="auto">{p.descs[showNative ? native : target]}</span>
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
