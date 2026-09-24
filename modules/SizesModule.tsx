
import React, { useId, useMemo, useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { PhraseCard } from '../components/PhraseCard';
import type { Country } from '../types';
import { SpeakerIcon, SpeakerOffIcon, InfoIcon, ChevronDownIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import type { VoiceStatus } from '../utils/speech';
import { toLangCode } from './location/data/locationData';
import {
  SIZE_TABLES,
  SIZE_WARNING,
  SYSTEM_LABEL,
  systemForCountry,
  sizeQuestions,
  askKeyFor,
  buildSizeQuestion,
  type SizeSystem,
  type SizeRow,
} from './sizes/data/sizesData';

/*
 * "Roupa e sapato" (cabeçalho "Tamanhos").
 *
 * A ORDEM DA TELA é a ordem em que ela pensa, de cima para baixo:
 *   tipo de roupa → "Qual número você calça no Brasil?" → o número daqui →
 *   aviso → frases da loja → (tabela, fechada).
 * Antes o resultado ("40 → 41") vinha ANTES da pergunta, e a tela respondia uma
 * coisa que ela não tinha perguntado: quem calça 37 lia "quarenta e um" e achava
 * que o app tinha errado.
 *
 * POR QUE AS CATEGORIAS SAÍRAM DA BANDA FIXA: com o nome em 14px (piso do app) e
 * o rodapé "Mostrar" no cartão, categorias + cartão passavam de 45dvh — o teto
 * da banda — já num celular de 812px, e a frase, que é o que a banda existe para
 * mostrar, ficava cortada lá dentro. Na banda fica só a frase; o resto rola.
 *
 * A TABELA fica fechada atrás de um botão: ela repete o que o seletor e o quadro
 * já mostram, e aberta ocupava uma tela inteira, empurrando "Na loja" — o que ela
 * precisa dentro do provador — para a terceira tela.
 */

interface SizesModuleProps {
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

/** A escolha de cada categoria começa perto do meio da própria tabela. */
const ESCOLHA_INICIAL: Record<string, number> = Object.fromEntries(
  SIZE_TABLES.map((tb) => [tb.key, tb.defaultRow]),
);

export default function SizesModule({
  nativeCountry,
  targetCountry,
  t,
  theme,
  onGoHome,
  onOpenLanguageModal,
  onOpenShare,
  handlePlayAudio,
  voiceStatus = 'unknown',
}: SizesModuleProps) {
  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;
  /** A língua em que ela LÊ os rótulos: a dela, quando é outra. */
  const read = showNative ? native : target;

  const fromSystem = systemForCountry(nativeCountry.code);
  const toSystem = systemForCountry(targetCountry.code);

  const [tableKey, setTableKey] = useState(SIZE_TABLES[0].key);
  // Uma escolha POR CATEGORIA. Antes era uma posição só para as seis tabelas, e
  // tocar em qualquer roupa vindo do sapato caía no maior tamanho (BR 48).
  const [escolhas, setEscolhas] = useState<Record<string, number>>(ESCOLHA_INICIAL);
  const [tabelaAberta, setTabelaAberta] = useState(false);

  const table = SIZE_TABLES.find((tb) => tb.key === tableKey) ?? SIZE_TABLES[0];
  const rowIndex = Math.min(escolhas[table.key] ?? table.defaultRow, table.rows.length - 1);
  const row: SizeRow = table.rows[rowIndex];
  const mySize = row[fromSystem];
  const theirSize = row[toSystem];

  const question = useMemo(() => buildSizeQuestion(target, theirSize, table.kind), [target, theirSize, table.kind]);
  const questionNative = useMemo(() => buildSizeQuestion(native, theirSize, table.kind), [native, theirSize, table.kind]);
  const phrases = useMemo(() => sizeQuestions(table.kind), [table.kind]);

  // Colunas da tabela: primeiro a dela, depois a daqui, depois as outras — a
  // mesma leitura do quadro "No Brasil → Peça este aqui".
  const columns = useMemo<SizeSystem[]>(() => {
    const all: SizeSystem[] = ['BR', 'EU', 'UK', 'US'];
    return [fromSystem, toSystem, ...all].filter((s, i, arr) => arr.indexOf(s) === i);
  }, [fromSystem, toSystem]);

  const askId = useId();
  const phrasesId = useId();
  const tableId = useId();

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

  const pickTable = (key: string) => {
    playSound('page-turn');
    setTableKey(key);
  };

  const pickRow = (i: number) => {
    playSound('click');
    setEscolhas((prev) => ({ ...prev, [table.key]: i }));
  };

  const sameSystem = fromSystem === toSystem;

  return (
    <ModuleShell
      title={t('szTitle')}
      theme={theme}
      t={t}
      nativeCountry={nativeCountry}
      targetCountry={targetCountry}
      onGoHome={onGoHome}
      onOpenLanguageModal={onOpenLanguageModal}
      onOpenShare={onOpenShare}
      dica={t('hintSizes')}
      pinned={(
        <PhraseCard
          theme={theme}
          phrase={question}
          alt={showNative ? questionNative : null}
          Listen={Listen}
          listenLabel={audioLabel(t('locListen'))}
          onSpeak={speak}
        />
      )}
    >
      {/* Tipo de roupa. Três colunas: "roupa masculina" quebra em duas linhas
          a 14px, e tudo bem — encolher a letra é que não. */}
      <div className="grid grid-cols-3 gap-2">
        {SIZE_TABLES.map((tb) => {
          const on = table.key === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => pickTable(tb.key)}
              aria-pressed={on}
              className={`rounded-2xl border p-2 min-h-[5rem] flex flex-col items-center justify-center gap-1 tap active:scale-95 ${
                on ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-100 dark:border-slate-700'
              }`}
            >
              <span className="text-2xl leading-none" aria-hidden="true">{tb.emoji}</span>
              <span className="text-sm font-bold leading-tight text-center" dir="auto">{tb.labels[read]}</span>
            </button>
          );
        })}
      </div>

      {/* A pergunta vem ANTES do resultado. É um pedido, não uma legenda. */}
      <section aria-labelledby={askId}>
        <h2 id={askId} className="text-base font-bold leading-snug text-gray-800 dark:text-slate-100 mb-2 px-1" dir="auto">
          {t(askKeyFor(table))}
        </h2>
        <div className="flex flex-wrap gap-2">
          {table.rows.map((r, i) => {
            const on = i === rowIndex;
            return (
              <button
                key={r[fromSystem] + i}
                onClick={() => pickRow(i)}
                aria-pressed={on}
                className={`min-w-[3.25rem] rounded-xl px-3 py-2.5 text-base font-bold tabular-nums tap active:scale-95 border ${
                  on ? `${theme.color} text-white border-transparent shadow` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700'
                }`}
              >
                {r[fromSystem]}
              </button>
            );
          })}
        </div>
      </section>

      {/* Conversão: bandeira + palavra de gente, não "O SEU · BRASIL → AQUI ·
          EUROPA". Ela está na Espanha, não "na Europa", e "o seu" era meia frase. */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
        <div className="flex items-center justify-center gap-3">
          <div className="text-center flex-1 min-w-0">
            <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1" dir="auto">
              <img src={nativeCountry.image} alt="" aria-hidden="true" className="w-5 h-5 rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-slate-600" />
              <span>{t('szFrom')}</span>
            </p>
            <p className="text-4xl font-extrabold text-gray-700 dark:text-slate-200 tabular-nums">{mySize}</p>
          </div>

          <span className="text-2xl text-gray-500 dark:text-slate-400 flex-shrink-0" aria-hidden="true">→</span>

          <div className="text-center flex-1 min-w-0">
            <p className="flex items-center justify-center gap-1.5 text-sm font-semibold mb-1" style={{ color: 'var(--tema-texto)' }} dir="auto">
              <img src={targetCountry.image} alt="" aria-hidden="true" className="w-5 h-5 rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-slate-600" />
              <span>{t('szTo')}</span>
            </p>
            <p className="text-4xl font-extrabold tabular-nums" style={{ color: 'var(--tema-texto)' }}>{theirSize}</p>
          </div>
        </div>

        {table.extraLabel && row.extra && (
          <p className="text-center text-sm text-gray-600 dark:text-slate-300 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700" dir="auto">
            {table.extraLabel[read]}: <span className="font-bold text-gray-700 dark:text-slate-200">{row.extra}</span>
          </p>
        )}

        {sameSystem && (
          <p className="text-center text-sm text-gray-600 dark:text-slate-300 mt-3" dir="auto">{t('sizeSameSystem')}</p>
        )}
      </div>

      {/* Aviso */}
      <div className="rounded-2xl p-3 flex items-start gap-2 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
        <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-300" />
        <p className="text-sm text-amber-900 dark:text-amber-300 leading-snug" dir="auto">{SIZE_WARNING[read]}</p>
      </div>

      {/* Frases da loja — logo depois do aviso, antes da tabela: é o que ela
          precisa dentro do provador. "Maior/menor" muda com o tipo: número para
          sapato, talla/taille para roupa. */}
      <section aria-labelledby={phrasesId} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
        <h2 id={phrasesId} className="text-sm font-bold text-gray-600 dark:text-slate-300 mb-1" dir="auto">{t('sizePhrases')}</h2>
        <ul className="divide-y divide-gray-100 dark:divide-slate-700">
          {phrases.map((q, i) => (
            <li key={i}>
              <button
                onClick={() => speak(q[target])}
                className="w-full py-3 flex items-center gap-3 text-left tap active:scale-[0.98]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold leading-snug" dir="auto">{q[target]}</p>
                  {showNative && <p className="text-base text-gray-700 dark:text-slate-200 leading-snug" dir="auto">{q[native]}</p>}
                </div>
                <Listen className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--tema-texto)' }} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Tabela completa: fechada. O botão tem a largura toda e diz o que faz. */}
      <section>
        <button
          onClick={() => { playSound('click'); setTabelaAberta((v) => !v); }}
          aria-expanded={tabelaAberta}
          // Só aponta quando a tabela existe: IDREF pendurada é defeito.
          aria-controls={tabelaAberta ? tableId : undefined}
          className="w-full rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm px-4 py-3 flex items-center justify-between gap-3 text-base font-bold text-gray-700 dark:text-slate-200 tap active:scale-[0.98]"
        >
          <span dir="auto">{t(tabelaAberta ? 'szHideTable' : 'szSeeTable')}</span>
          <ChevronDownIcon className={`w-5 h-5 flex-shrink-0 transition-transform ${tabelaAberta ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        {tabelaAberta && (
          <div id={tableId} className="mt-2 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 overflow-x-auto">
            <table className="w-full text-base tabular-nums">
              <thead>
                <tr className="text-sm text-gray-600 dark:text-slate-300">
                  {columns.map((sys) => (
                    <th key={sys} scope="col" className="py-1 pr-3 font-bold text-left whitespace-nowrap" dir="auto">{t(SYSTEM_LABEL[sys])}</th>
                  ))}
                  {table.extraLabel && <th scope="col" className="py-1 font-bold text-left" dir="auto">{table.extraLabel[read]}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {table.rows.map((r, i) => (
                  <tr
                    key={r.EU + i}
                    onClick={() => pickRow(i)}
                    className={`cursor-pointer ${i === rowIndex ? 'font-bold' : 'text-gray-600 dark:text-slate-300'}`}
                    style={i === rowIndex ? { color: 'var(--tema-texto)', backgroundColor: `${theme.hex}0f` } : undefined}
                  >
                    {columns.map((sys) => (
                      <td key={sys} className="py-2 pr-3">{r[sys]}</td>
                    ))}
                    {/* gray-600, não gray-500: na linha escolhida há um véu da cor
                        do módulo por baixo (`${theme.hex}0f`), e sobre ele o
                        gray-500 media 4,42:1 — passa raspando por baixo dos 4,5. */}
                    {table.extraLabel && <td className="py-2 text-gray-600 dark:text-slate-300">{r.extra}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </ModuleShell>
  );
}
