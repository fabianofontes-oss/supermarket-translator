
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { PhraseCard } from '../components/PhraseCard';
import type { Country } from '../types';
import { SpeakerIcon, SpeakerOffIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import { anotarGlosa, useFalando } from '../utils/audioState';
import type { VoiceStatus } from '../utils/speech';
import {
  LOC_OBJECTS,
  LOC_RELATIONS,
  LOC_START,
  locObjectByKey,
  locRelationByKey,
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
      {p.ring && <div className="absolute w-6 h-6 rounded-full border border-dashed border-gray-300 dark:border-slate-600" />}
      <div className={`w-3.5 h-3.5 rounded-sm ${active ? 'bg-white/70' : 'bg-gray-300 dark:bg-slate-600'}`} style={{ zIndex: 1 }} />
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
  // A primeira frase é "A chave está embaixo do sofá.", escolhida pela chave e
  // não pela posição na lista (ver `LOC_START`).
  const [subject, setSubject] = useState<LocObject>(() => locObjectByKey(LOC_START.subject));
  const [reference, setReference] = useState<LocObject>(() => locObjectByKey(LOC_START.reference));
  const [relation, setRelation] = useState<LocRelation>(() => locRelationByKey(LOC_START.relation));

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

  // A pergunta é o segundo alto-falante do cartão, e se comporta como o
  // primeiro: pulsa enquanto carrega ou sai, e anota a própria glosa para a
  // folha "Sem som agora" poder mostrá-la inteira se o som falhar.
  const perguntando = useFalando(question);
  const speakQuestion = () => {
    anotarGlosa(question, showNative ? questionNative : null);
    speak(question);
  };


  return (
    <ModuleShell
      // No hub o nome é "Onde está a chave?", que diz o que o módulo faz; no
      // cabeçalho cabe o curto.
      title={t('locTitle')}
      dica={t('hintLocation')}
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
          >
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold leading-snug" dir="auto">{question}</p>
                {showNative && <p className="text-sm text-white leading-snug" dir="auto">{questionNative}</p>}
              </div>
              {/* Alto-falante, e não "?": em qualquer celular o ponto de
                  interrogação quer dizer "ajuda", e quem tocava esperando uma
                  explicação ouvia espanhol. `Listen` também já troca sozinho
                  para o alto-falante cortado quando falta a voz, como o de cima.
                  Menor e translúcido, para não disputar com o botão da frase. */}
              <button
                onClick={speakQuestion}
                className="hit p-2 rounded-full bg-white/20 tap active:scale-90 flex-shrink-0"
                aria-label={audioLabel(t('locAsk'))} title={audioLabel(t('locAsk'))}
                aria-busy={perguntando}
              >
                <Listen className={`w-6 h-6 ${perguntando ? 'animate-pulse' : ''}`} />
              </button>
            </div>
          </PhraseCard>
        </>
      )}
    >

      {/* Cena */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-3">
        <div className="relative mx-auto w-[280px] h-[280px] select-none">
          {/* chão */}
          <div className="absolute left-6 right-6 bottom-8 h-3 rounded-full bg-gray-200/70 dark:bg-slate-700/70 blur-[2px]" />

          {/* anel tracejado para dentro/fora */}
          <div
            className="absolute left-1/2 top-1/2 w-[132px] h-[132px] rounded-full border-2 border-dashed transition-opacity duration-500"
            style={{ transform: 'translate(-50%, -50%)', borderColor: 'var(--tema-texto)', opacity: placement.ring ? 0.5 : 0 }}
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


      {/* A ordem da tela é a ordem da frase: "A chave / está embaixo / do sofá".
          Antes a posição vinha primeiro, com 12 botões, e as duas fileiras de
          objetos ficavam fora da primeira tela, uma embaixo da outra, iguais —
          parecia lista repetida, e quem não rolava achava que só existia a bola. */}

      {/* A coisa */}
      <ObjectRow
        title={t('locObject')}
        selected={subject}
        onPick={pickSubject}
        target={target}
        native={native}
        showNative={showNative}
        theme={theme}
      />

      {/* O lugar */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1" dir="auto">{t('locRelation')}</h2>
        {/* Três colunas de ~110px a 375px: "a la izquierda" quebra em duas
            linhas, mas nenhuma palavra passa de 93px a 14px negrito. */}
        <div className="grid grid-cols-3 gap-2">
          {LOC_RELATIONS.map((rel) => {
            const active = rel.key === relation.key;
            return (
              <button
                key={rel.key}
                onClick={() => pickRelation(rel)}
                aria-pressed={active}
                className={`rounded-2xl border p-2 flex flex-col items-center gap-1 tap active:scale-95 ${
                  active ? `${theme.color} border-transparent text-white shadow-md` : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
              >
                <MiniPosition relKey={rel.key} active={active} hex={theme.hex} />
                <span className="text-sm font-bold leading-tight text-center" dir="auto">{rel.labels[target]}</span>
                {/* O português é o que ela LÊ: 14px, e nunca apagado. */}
                {showNative && (
                  <span className={`text-sm leading-tight text-center ${active ? 'text-white' : 'text-gray-600 dark:text-slate-300'}`} dir="auto">
                    {rel.labels[native]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* O ponto de referência */}
      <ObjectRow
        title={t('locReference')}
        selected={reference}
        onPick={pickReference}
        target={target}
        native={native}
        showNative={showNative}
        theme={theme}
      />
    </ModuleShell>
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

/**
 * Uma fileira de objetos que rola para o lado.
 *
 * O cartão tem 96px DE PROPÓSITO, e não é pelo desenho: a 390px de tela cabem
 * três cartões inteiros e sobra um pedaço do quarto (16 + 3×104 = 328; a 375px
 * aparecem 47px dele). Esse cartão cortado na borda é o sinal de "tem mais para
 * o lado" que ela já conhece do WhatsApp e do Instagram. Com 84px, a conta dava
 * quatro cartões inteiros terminando rente à borda, e os outros dez objetos
 * pareciam não existir. Os 80px úteis também são o que deixa o nome em 14px
 * negrito caber inteiro ("téléphone", a palavra mais longa dos destinos).
 *
 * Ao abrir, a fileira rola sozinha até o cartão escolhido se ele estiver fora da
 * vista — o sofá, que é a referência da primeira frase, é o 5º da lista e
 * nasceria escondido. Só no eixo horizontal: `scrollIntoView` rolaria também a
 * página, e a pessoa abriria o módulo já no meio.
 */
const ObjectRow: React.FC<ObjectRowProps> = ({ title, selected, onPick, target, native, showNative, theme }) => {
  const trilho = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trilho.current;
    const ativo = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!el || !ativo) return;
    const caixa = el.getBoundingClientRect();
    const cartao = ativo.getBoundingClientRect();
    if (cartao.left >= caixa.left && cartao.right <= caixa.right) return;
    // Deixa o cartão a 64px da borda esquerda: assim o anterior aparece pela
    // metade e fica claro que a fileira anda para os dois lados.
    el.scrollLeft += cartao.left - caixa.left - 64;
    // Só na abertura: depois, quem move a fileira é o dedo dela.
  }, []);

  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1" dir="auto">
        {title} <span className="text-gray-500 dark:text-slate-400">·</span> <span className="text-gray-500 dark:text-slate-400 normal-case tracking-normal" dir="auto">{selected.emoji} {nounPhrase(target, selected)}</span>
      </h2>
      <div ref={trilho} className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
        {LOC_OBJECTS.map((obj) => {
          const active = obj.key === selected.key;
          return (
            <button
              key={obj.key}
              onClick={() => onPick(obj)}
              aria-pressed={active}
              className={`flex-shrink-0 w-[96px] rounded-2xl border p-2 flex flex-col items-center gap-0.5 tap active:scale-95 ${
                active ? `${theme.color} border-transparent text-white shadow-md` : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-700 dark:text-slate-200'
              }`}
            >
              <span className="text-3xl leading-none mb-1" aria-hidden="true">{obj.emoji}</span>
              <span className="text-sm font-bold leading-tight text-center truncate w-full" dir="auto">{obj.names[target].n}</span>
              {showNative && (
                <span className={`text-sm leading-tight text-center truncate w-full ${active ? 'text-white' : 'text-gray-600 dark:text-slate-300'}`} dir="auto">
                  {obj.names[native].n}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
