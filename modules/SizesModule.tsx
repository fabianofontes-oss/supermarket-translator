
import React, { useMemo, useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { PhraseCard } from '../components/PhraseCard';
import type { Country } from '../types';
import { SpeakerIcon, SpeakerOffIcon, InfoIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import type { VoiceStatus } from '../utils/speech';
import { toLangCode } from './location/data/locationData';
import {
  SIZE_TABLES,
  SIZE_QUESTIONS,
  SIZE_WARNING,
  SYSTEM_LABEL,
  systemForCountry,
  buildSizeQuestion,
  type SizeTable,
  type SizeRow,
} from './sizes/data/sizesData';

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

  const fromSystem = systemForCountry(nativeCountry.code);
  const toSystem = systemForCountry(targetCountry.code);

  const [table, setTable] = useState<SizeTable>(SIZE_TABLES[0]);
  const [rowIndex, setRowIndex] = useState(7); // BR 40 / EU 41

  const row: SizeRow = table.rows[Math.min(rowIndex, table.rows.length - 1)];
  const mySize = row[fromSystem];
  const theirSize = row[toSystem];

  const question = useMemo(() => buildSizeQuestion(target, theirSize, table.kind), [target, theirSize, table.kind]);
  const questionNative = useMemo(() => buildSizeQuestion(native, theirSize, table.kind), [native, theirSize, table.kind]);

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

  const pickTable = (tb: SizeTable) => {
    playSound('page-turn');
    setTable(tb);
    setRowIndex((i) => Math.min(i, tb.rows.length - 1));
  };

  const sameSystem = fromSystem === toSystem;

  return (
    <ModuleShell
      title={t('moduleSizes')}
      theme={theme}
      t={t}
      nativeCountry={nativeCountry}
      targetCountry={targetCountry}
      onGoHome={onGoHome}
      onOpenLanguageModal={onOpenLanguageModal}
      onOpenShare={onOpenShare}
      pinned={(
        <>
          {/* Categorias */}
          <div className="grid grid-cols-3 gap-2">
            {SIZE_TABLES.map((tb) => (
              <button
                key={tb.key}
                onClick={() => pickTable(tb)}
                className={`rounded-2xl border p-2 flex flex-col items-center gap-1 tap active:scale-95 ${
                  table.key === tb.key ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white text-gray-600 border-gray-100'
                }`}
              >
                <span className="text-2xl leading-none">{tb.emoji}</span>
                <span className="text-[11px] font-bold leading-tight text-center" dir="auto">{tb.labels[showNative ? native : target]}</span>
              </button>
            ))}
          </div>
          {/* Pergunta gerada */}
          <PhraseCard
            theme={theme}
            phrase={question}
            alt={showNative ? questionNative : null}
            Listen={Listen}
            listenLabel={audioLabel(t('locListen'))}
            onSpeak={speak}
          />
        </>
      )}
    >


      {/* Conversão */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              {t('sizeYours')} · {t(SYSTEM_LABEL[fromSystem])}
            </p>
            <p className="text-4xl font-extrabold text-gray-700 tabular-nums">{mySize}</p>
          </div>

          <span className="text-2xl text-gray-400 flex-shrink-0">→</span>

          <div className="text-center flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: theme.hex }}>
              {t('sizeHere')} · {t(SYSTEM_LABEL[toSystem])}
            </p>
            <p className="text-4xl font-extrabold tabular-nums" style={{ color: theme.hex }}>{theirSize}</p>
          </div>
        </div>

        {table.extraLabel && row.extra && (
          <p className="text-center text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            {table.extraLabel[showNative ? native : target]}: <span className="font-bold text-gray-600">{row.extra}</span>
          </p>
        )}

        {sameSystem && (
          <p className="text-center text-xs text-gray-500 mt-3">{t('sizeSameSystem')}</p>
        )}
      </div>

      {/* Escolha do tamanho */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">
          {t('sizeYours')} · {t(SYSTEM_LABEL[fromSystem])}
        </h2>
        <div className="flex flex-wrap gap-2">
          {table.rows.map((r, i) => (
            <button
              key={r[fromSystem] + i}
              onClick={() => { playSound('click'); setRowIndex(i); }}
              className={`rounded-xl px-3 py-2 text-sm font-bold tabular-nums tap active:scale-95 border ${
                i === rowIndex ? `${theme.color} text-white border-transparent shadow` : 'bg-white text-gray-700 border-gray-100'
              }`}
            >
              {r[fromSystem]}
            </button>
          ))}
        </div>
      </section>

      {/* Aviso */}
      <div className="rounded-2xl p-3 flex items-start gap-2 border border-amber-200 bg-amber-50">
        <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
        <p className="text-sm text-amber-900 leading-snug" dir="auto">{SIZE_WARNING[showNative ? native : target]}</p>
      </div>


      {/* Tabela completa */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 overflow-x-auto">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t('sizeTable')}</h2>
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-gray-500">
              {(['BR', 'EU', 'UK', 'US'] as const).map((sys) => (
                <th key={sys} className="py-1 font-bold text-left">{sys}</th>
              ))}
              {table.extraLabel && <th className="py-1 font-bold text-left">{table.extraLabel[showNative ? native : target]}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.rows.map((r, i) => (
              <tr
                key={r.EU + i}
                onClick={() => { playSound('click'); setRowIndex(i); }}
                className={`cursor-pointer ${i === rowIndex ? 'font-bold' : 'text-gray-600'}`}
                style={i === rowIndex ? { color: theme.hex, backgroundColor: `${theme.hex}0f` } : undefined}
              >
                {(['BR', 'EU', 'UK', 'US'] as const).map((sys) => (
                  <td key={sys} className="py-1.5">{r[sys]}</td>
                ))}
                {table.extraLabel && <td className="py-1.5 text-gray-500">{r.extra}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Frases */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t('sizePhrases')}</h2>
        <ul className="divide-y divide-gray-100">
          {SIZE_QUESTIONS.map((q, i) => (
            <li key={i}>
              <button onClick={() => speak(q[target])} className="w-full py-2.5 flex items-center gap-3 text-left tap active:scale-[0.98]">
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
    </ModuleShell>
  );
}
