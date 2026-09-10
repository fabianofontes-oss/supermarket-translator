
import React, { useMemo, useState } from 'react';
import type { Country } from '../types';
import { HomeIcon, SpeakerIcon, SpeakerOffIcon, QuestionMarkCircleIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import { ShareButton } from '../components/ShareButton';
import type { VoiceStatus } from '../utils/speech';
import {
  LOC_OBJECTS,
  LOC_RELATIONS,
  toLangCode,
  nounPhrase,
  buildSentence,
  buildQuestion,
  type LocObject,
  type LocRelation,
} from './location/data/locationData';

interface LocationModuleProps {
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

// Posição do objeto na cena, relativa ao centro (referência).
interface Placement { dx: number; dy: number; scale?: number; opacity?: number; z?: number; ring?: boolean }
const PLACEMENTS: Record<string, Placement> = {
  right:   { dx: 95,  dy: 0 },
  left:    { dx: -95, dy: 0 },
  above:   { dx: 0,   dy: -100 },
  onTop:   { dx: 0,   dy: -66 },
  under:   { dx: 0,   dy: 70 },
  behind:  { dx: 0,   dy: -34, scale: 0.7, opacity: 0.5, z: 0 },
  inFront: { dx: 0,   dy: 34,  scale: 1.1, z: 2 },
  inside:  { dx: 0,   dy: 4,   scale: 0.5, z: 2, ring: true },
  outside: { dx: 100, dy: -10, ring: true },
  nextTo:  { dx: -78, dy: 0 },
  near:    { dx: 78,  dy: 44 },
  far:     { dx: 112, dy: -88, scale: 0.75 },
};

/** Ícone em miniatura mostrando a posição (quadrado = referência, bolinha = objeto). */
const MiniPosition: React.FC<{ relKey: string; active: boolean; hex: string }> = ({ relKey, active, hex }) => {
  const p = PLACEMENTS[relKey];
  const k = 0.13;
  return (
    <div className="relative w-9 h-9 flex items-center justify-center">
      {p.ring && <div className="absolute w-6 h-6 rounded-full border border-dashed border-gray-300" />}
      <div className={`w-3.5 h-3.5 rounded-sm ${active ? 'bg-white/70' : 'bg-gray-300'}`} style={{ zIndex: 1 }} />
      <div
        className="absolute w-2.5 h-2.5 rounded-full"
        style={{
          backgroundColor: active ? 'white' : hex,
          transform: `translate(${p.dx * k}px, ${p.dy * k}px) scale(${p.scale ?? 1})`,
          opacity: p.opacity ?? 1,
          zIndex: p.z ?? 1,
        }}
      />
    </div>
  );
};

export default function LocationModule({
  nativeCountry,
  targetCountry,
  t,
  theme,
  onGoHome,
  onOpenLanguageModal,
  onOpenShare,
  handlePlayAudio,
  voiceStatus = 'unknown',
}: LocationModuleProps) {
  const [subject, setSubject] = useState<LocObject>(LOC_OBJECTS[0]);
  const [reference, setReference] = useState<LocObject>(LOC_OBJECTS[1]);
  const [relation, setRelation] = useState<LocRelation>(LOC_RELATIONS[0]);

  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;

  const sentence = useMemo(() => buildSentence(target, subject, relation, reference), [target, subject, relation, reference]);
  const sentenceNative = useMemo(() => buildSentence(native, subject, relation, reference), [native, subject, relation, reference]);
  const question = useMemo(() => buildQuestion(target, subject), [target, subject]);
  const questionNative = useMemo(() => buildQuestion(native, subject), [native, subject]);

  const placement = PLACEMENTS[relation.key];

  const pickSubject = (obj: LocObject) => {
    playSound('click');
    if (obj.key === reference.key) setReference(subject);
    setSubject(obj);
  };
  const pickReference = (obj: LocObject) => {
    playSound('click');
    if (obj.key === subject.key) setSubject(reference);
    setReference(obj);
  };
  const pickRelation = (rel: LocRelation) => {
    playSound('toggle');
    setRelation(rel);
  };

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


  return (
    <div className="w-full bg-slate-50 text-gray-800 flex flex-col h-[100dvh] relative overflow-hidden font-sans">
      {/* Header */}
      <header className="flex-shrink-0 text-white shadow-lg z-30 rounded-b-3xl" style={{ background: `linear-gradient(to bottom, ${theme.hex}, ${theme.hex}e6)` }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-4 max-w-3xl mx-auto">
          <button
            onClick={() => { playSound('click'); onGoHome(); }}
            aria-label={t('a11yHome')}
            className="hit p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <HomeIcon className="w-5 h-5" />
          </button>
          <h1 className="flex-1 mx-2 text-center font-bold text-2xl uppercase tracking-tight truncate">
            {t('moduleLocation')}
          </h1>
          {/* Cluster da direita. `gap-2` não é escolha estética: a área de
              toque de `.hit` é 44px centrada no botão, e com menos espaço
              que isso as duas se sobrepõem e uma para de responder. */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ShareButton onClick={onOpenShare} t={t} variant="onColor" />
            <button
              onClick={() => { playSound('click'); onOpenLanguageModal(); }}
              aria-label={t('languageSettings')}
              className="hit p-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center -space-x-2">
                <img src={nativeCountry.image} alt="" aria-hidden="true" className="w-6 h-6 rounded-full border border-white object-cover" />
                <img src={targetCountry.image} alt="" aria-hidden="true" className="w-6 h-6 rounded-full border border-white object-cover" />
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-10">
        <div className="px-4 pt-4 max-w-3xl mx-auto w-full space-y-4">

          {/* Cena */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-3">
            <div className="relative mx-auto w-[280px] h-[280px] select-none">
              {/* chão */}
              <div className="absolute left-6 right-6 bottom-8 h-3 rounded-full bg-gray-200/70 blur-[2px]" />

              {/* anel tracejado para dentro/fora */}
              <div
                className="absolute left-1/2 top-1/2 w-[132px] h-[132px] rounded-full border-2 border-dashed transition-opacity duration-500"
                style={{ transform: 'translate(-50%, -50%)', borderColor: theme.hex, opacity: placement.ring ? 0.5 : 0 }}
              />

              {/* referência (centro) */}
              <div
                className="absolute left-1/2 top-1/2 leading-none transition-opacity duration-500"
                style={{
                  fontSize: 92,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1,
                  opacity: relation.key === 'inside' ? 0.75 : 1,
                }}
              >
                {reference.emoji}
              </div>

              {/* objeto (móvel) */}
              <div
                className="absolute left-1/2 top-1/2 leading-none"
                style={{
                  fontSize: 56,
                  marginLeft: -28,
                  marginTop: -28,
                  transform: `translate(${placement.dx}px, ${placement.dy}px) scale(${placement.scale ?? 1})`,
                  opacity: placement.opacity ?? 1,
                  zIndex: placement.z ?? 1,
                  transition: 'transform var(--scene-duration) var(--ease-out), opacity 0.4s ease',
                  filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.18))',
                }}
              >
                {subject.emoji}
              </div>
            </div>
          </div>

          {/* Frase */}
          <div className={`rounded-3xl p-4 text-white shadow-md ${theme.color}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold leading-snug">{sentence}</p>
                {showNative && (
                  <p className="text-sm text-white mt-1 leading-snug" dir="auto">{sentenceNative}</p>
                )}
              </div>
              <button
                onClick={() => speak(sentence)}
                className="p-3 rounded-full bg-white shadow active:scale-95 transition-transform flex-shrink-0"
                style={{ color: theme.hex }}
                aria-label={audioLabel(t('locListen'))}
                title={audioLabel(t('locListen'))}
              >
                <Listen className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold leading-snug">{question}</p>
                {showNative && <p className="text-xs text-white leading-snug" dir="auto">{questionNative}</p>}
              </div>
              <button
                onClick={() => speak(question)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition flex-shrink-0"
                aria-label={audioLabel(t('locAsk'))}
                title={audioLabel(t('locAsk'))}
              >
                <QuestionMarkCircleIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Relações */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('locRelation')}</h2>
            <div className="grid grid-cols-3 gap-2">
              {LOC_RELATIONS.map((rel) => {
                const active = rel.key === relation.key;
                return (
                  <button
                    key={rel.key}
                    onClick={() => pickRelation(rel)}
                    className={`rounded-2xl border p-2 flex flex-col items-center gap-1 tap active:scale-95 ${
                      active ? `${theme.color} border-transparent text-white shadow-md` : 'bg-white border-gray-100 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <MiniPosition relKey={rel.key} active={active} hex={theme.hex} />
                    <span className="text-sm font-bold leading-tight text-center">{rel.labels[target]}</span>
                    {showNative && (
                      <span className={`text-[11px] leading-tight text-center ${active ? 'text-white' : 'text-gray-500'}`} dir="auto">
                        {rel.labels[native]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Objeto */}
          <ObjectRow
            title={t('locObject')}
            selected={subject}
            onPick={pickSubject}
            target={target}
            native={native}
            showNative={showNative}
            theme={theme}
          />

          {/* Referência */}
          <ObjectRow
            title={t('locReference')}
            selected={reference}
            onPick={pickReference}
            target={target}
            native={native}
            showNative={showNative}
            theme={theme}
          />
        </div>
      </main>
    </div>
  );
}

interface ObjectRowProps {
  title: string;
  selected: LocObject;
  onPick: (obj: LocObject) => void;
  target: ReturnType<typeof toLangCode>;
  native: ReturnType<typeof toLangCode>;
  showNative: boolean;
  theme: { color: string; hex: string };
}

const ObjectRow: React.FC<ObjectRowProps> = ({ title, selected, onPick, target, native, showNative, theme }) => (
  <section>
    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">
      {title} <span className="text-gray-400">·</span> <span className="text-gray-500 normal-case tracking-normal">{selected.emoji} {nounPhrase(target, selected)}</span>
    </h2>
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
      {LOC_OBJECTS.map((obj) => {
        const active = obj.key === selected.key;
        return (
          <button
            key={obj.key}
            onClick={() => onPick(obj)}
            className={`flex-shrink-0 w-[84px] rounded-2xl border p-2 flex flex-col items-center gap-0.5 tap active:scale-95 ${
              active ? `${theme.color} border-transparent text-white shadow-md` : 'bg-white border-gray-100 text-gray-700'
            }`}
          >
            <span className="text-3xl leading-none mb-1">{obj.emoji}</span>
            <span className="text-xs font-bold leading-tight text-center truncate w-full">{obj.names[target].n}</span>
            {showNative && (
              <span className={`text-[10px] leading-tight text-center truncate w-full ${active ? 'text-white' : 'text-gray-500'}`} dir="auto">
                {obj.names[native].n}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </section>
);
