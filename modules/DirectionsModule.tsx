
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import type { Country } from '../types';
import { SpeakerIcon, SpeakerOffIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import { anotarGlosa, useFalando } from '../utils/audioState';
import type { VoiceStatus } from '../utils/speech';
import { toLangCode, type LangCode } from './location/data/locationData';
import {
  DIR_STEPS,
  DIR_PLACE_STEPS,
  ROTATORIA,
  DIAGONAIS,
  COMPASS,
  DIR_GO_TO,
  DIR_QUESTIONS,
  DIR_PLACES,
  DIR_DISTANCES,
  GRID,
  START,
  MAX_STEPS,
  applyStep,
  headingSentence,
  type DirStep,
  type Walker,
  type Vocab,
} from './directions/data/directionsData';

interface DirectionsModuleProps {
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

type Glyph = React.FC<React.SVGProps<SVGSVGElement>>;

/**
 * Pílula de texto do cartão do percurso (Desfazer, Começar de novo).
 *
 * Contorno sobre véu ESCURO, e não `bg-white/20`: o véu claro baixava o branco
 * sobre o âmbar para 3,5:1, reprovado para texto de 14px. Escurecer só sobe. É o
 * mesmo recado que o rodapé do `PhraseCard` já deu.
 */
const PILULA = 'hit flex-shrink-0 px-3 py-1.5 rounded-full border border-white/70 bg-black/10 text-sm font-bold text-white tap active:scale-95';

// Geometria do mapa (SVG 300x300)
const SP = 72;      // distância entre cruzamentos
const OFF = 30;     // margem
const px = (i: number) => OFF + i * SP;

/**
 * Onde o caminhante fica parado. O mundo é que gira e desliza em volta.
 *
 * No meio, porque é onde o olho o procura e é o que faz o mapa parecer um GPS.
 * Isso só é possível porque a cidade do cenário não acaba (ver o `pattern`):
 * ancorado numa cidade de 4 quarteirões, a câmera saía do mundo e o mapa sumia
 * do quadro.
 */
const ANCORA = { x: 150, y: 150 };

/** Tempo de cada tempo da animação, e o tempo do deslize dentro dele. */
const COMPASSO = 520;
const DESLIZE = 400;

/**
 * Um tempo da animação: onde o caminhante está, quanto o mundo já girou e — no
 * tempo em que ele vira — a placa da manobra.
 */
interface Pose { x: number; y: number; spin: number; placa?: string }

// Pontos de referência desenhados nos quarteirões (coluna, linha)
// Espalhados de modo que quase sempre haja um à vista: com o quarteirão a 72
// unidades, cabem só uns quatro por quatro na tela de uma vez.
const LANDMARKS: { bx: number; by: number; emoji: string }[] = [
  { bx: 1, by: 0, emoji: '🏦' },
  { bx: 4, by: 0, emoji: '⛲' },
  { bx: 0, by: 2, emoji: '🚏' },
  { bx: 2, by: 1, emoji: '🏫' },
  { bx: 5, by: 1, emoji: '🚉' },
  { bx: 3, by: 3, emoji: '💊' },
  { bx: 0, by: 4, emoji: '🚇' },
  { bx: 5, by: 3, emoji: '🍞' },
  { bx: 2, by: 5, emoji: '🏥' },
  { bx: 4, by: 5, emoji: '⛪' },
];

export default function DirectionsModule({
  nativeCountry,
  targetCountry,
  t,
  theme,
  onGoHome,
  onOpenLanguageModal,
  onOpenShare,
  handlePlayAudio,
  voiceStatus = 'unknown',
}: DirectionsModuleProps) {
  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;

  const [steps, setSteps] = useState<DirStep[]>([]);
  const [compassPick, setCompassPick] = useState<number | null>(null);
  const setaId = useId();
  const cidadeId = useId();

  // Recalcula o percurso a partir dos passos (fonte única de verdade)
  const route = useMemo(() => {
    let walker: Walker = START;
    const points: Walker[] = [START];
    const marks: { x: number; y: number; n: number }[] = [];
    // Giro acumulado, SEM módulo: é ele que gira o mapa. Com `% 4`, a passagem
    // de 270° para 0° faria o mapa desandar 270° para trás em vez de seguir 90°
    // adiante — e a animação contaria uma virada que não aconteceu.
    let spin = 0;
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      const r = applyStep(walker, s);
      if (!r) break;
      spin += r.turn;
      walker = r.next;
      points.push(...r.path);
      if (r.turn === 4 && r.path.length === 0) points.push(walker); // meia-volta sem andar
      // Passo que não anda (meia-volta, chegada) cai no mesmo cruzamento do
      // anterior: fica só o número mais recente, senão as bolinhas se empilham
      // e nenhuma fica legível.
      const ultima = marks[marks.length - 1];
      if (ultima && ultima.x === walker.x && ultima.y === walker.y) ultima.n = i + 1;
      else marks.push({ x: walker.x, y: walker.y, n: i + 1 });
    }
    return { walker, points, marks, spin, arrived: steps.some((s) => s.arrive) };
  }, [steps]);

  /**
   * Os tempos da animação, um por um.
   *
   * Antes cada passo acontecia numa tacada só: o boneco deslizava e girava ao
   * mesmo tempo, e a virada — que é exatamente o que a frase ensina — passava
   * batida. Agora virar é um tempo próprio, parado na esquina, e cada quarteirão
   * andado é outro. É o que deixa a pessoa VER "gira a la derecha" acontecer.
   */
  const timeline = useMemo(() => {
    const poses: Pose[] = [{ x: START.x, y: START.y, spin: 0 }];
    let walker: Walker = START;
    let spin = 0;
    for (const s of steps) {
      const r = applyStep(walker, s);
      if (!r) break;
      spin += r.turn;
      // vira parado, antes de sair andando, mostrando a placa da manobra
      if (r.turn !== 0) poses.push({ x: walker.x, y: walker.y, spin, placa: s.icon });
      // um quarteirão por tempo
      for (const ponto of r.path) poses.push({ x: ponto.x, y: ponto.y, spin });
      if (r.path.length === 0) poses.push({ x: r.next.x, y: r.next.y, spin });
      walker = r.next;
    }
    return poses;
  }, [steps]);

  // Quem pediu menos movimento não quer ver o passeio: pula direto para o fim.
  const semMovimento = typeof window !== 'undefined'
    && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const [frame, setFrame] = useState(0);
  const ultimoFrame = timeline.length - 1;

  // Em que tempo estávamos quando o passo foi pedido. É o que faz o PRIMEIRO
  // tempo sair na hora: sem isto, o toque ficava meio segundo sem resposta
  // nenhuma antes de o boneco mexer, e meio segundo de nada lê como travado.
  const frameAoPedir = useRef(0);
  useEffect(() => { frameAoPedir.current = frame; }, [steps]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (frame === ultimoFrame) return;
    // Desfazer e limpar encurtam a linha do tempo: aí não há passeio, há corte.
    if (frame > ultimoFrame || semMovimento) { setFrame(ultimoFrame); return; }
    const espera = frame === frameAoPedir.current ? 0 : COMPASSO;
    const id = window.setTimeout(() => setFrame((f) => Math.min(f + 1, ultimoFrame)), espera);
    return () => window.clearTimeout(id);
  }, [frame, ultimoFrame, semMovimento]);

  const pose = timeline[Math.min(frame, ultimoFrame)] ?? timeline[0];
  const noFim = frame >= ultimoFrame;

  const canApply = (step: DirStep) => {
    if (route.arrived || steps.length >= MAX_STEPS) return false;
    if (step.arrive) return steps.length > 0;
    // A rotatória exige estar nela. A bifurcação não precisa de teste: o passo
    // pede chão diagonal, e `applyStep` recusa onde não há.
    if (step.at === 'rotatoria' && (route.walker.x !== ROTATORIA.x || route.walker.y !== ROTATORIA.y)) return false;
    return applyStep(route.walker, step) !== null;
  };

  /**
   * Fala a frase e anota a glosa antes. Quando o som falha, a folha "Sem som
   * agora" oferece mostrar a frase na tela, e a glosa só quem pediu o som
   * conhece — o `PhraseCard` faz o mesmo nos outros módulos.
   */
  const falar = (text: string, glosa: string | null) => {
    anotarGlosa(text, showNative ? glosa : null);
    handlePlayAudio(text, targetCountry.lang);
  };

  /*
   * Todo movimento devolve a bússola ao boneco. A escolha manual passava na
   * frente do rumo dele para sempre: depois de um toque em "Sur", o boneco
   * andava para o norte e o cartão continuava dizendo "você está indo para o
   * sul". A escolha manual vale só até o próximo passo.
   */
  const addStep = (step: DirStep) => {
    if (!canApply(step)) return;
    playSound('click');
    setSteps((prev) => [...prev, step]);
    setCompassPick(null);
    falar(step.phrases[target], step.phrases[native]);
  };
  const undo = () => { playSound('toggle'); setSteps((p) => p.slice(0, -1)); setCompassPick(null); };
  const clear = () => { playSound('toggle'); setSteps([]); setCompassPick(null); };

  // A lista do cartão fixo tem teto e rolagem própria. Sem isto, do quarto
  // passo em diante o que acabou de entrar ficava escondido embaixo.
  const listaRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const lista = listaRef.current;
    if (lista) lista.scrollTop = lista.scrollHeight;
  }, [steps.length]);

  // Sem voz do idioma de destino, `handlePlayAudio` recusa falar e abre o
  // aviso — falar com a voz padrão ensinaria outra pronúncia. Aqui só o botão
  // conta isso antes do toque.
  const voiceMissing = voiceStatus === 'missing';
  const Listen = voiceMissing ? SpeakerOffIcon : SpeakerIcon;
  const audioLabel = (base: string) => (voiceMissing ? `${base} — ${t('voiceMissingLabel')}` : base);

  const speak = (text: string, glosa: string | null = null) => {
    playSound('click');
    falar(text, glosa);
  };

  /** Os passos que dão para usar daqui. Os outros não ficam apagados: somem. */
  const passosPossiveis = DIR_STEPS.filter(canApply);

  /** Os passos de lugar que valem AGORA. Vazio quase sempre. */
  const passosDeLugar = DIR_PLACE_STEPS.filter(canApply);
  const emLugar = passosDeLugar.length > 0;
  const naRotatoria = passosDeLugar.some((p) => p.at === 'rotatoria');

  /** Tudo numa grade só, com os de lugar no fim para não empurrar os de sempre. */
  const passosNaTela = [...passosPossiveis, ...passosDeLugar];

  /**
   * O botão de um passo. Só é chamado para passos possíveis, então não existe
   * estado apagado aqui.
   *
   * Os de lugar vêm tingidos com a cor do módulo: é o que os faz saltar dentro
   * da grade comum, agora que não têm mais seção própria para chamar atenção.
   */
  const botaoPasso = (s: DirStep) => {
    const deLugar = DIR_PLACE_STEPS.includes(s);
    return (
      <button
        key={s.key}
        onClick={() => addStep(s)}
        className="rounded-2xl border p-2 flex flex-col items-center gap-1 tap active:scale-95 bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600"
        style={deLugar ? { borderColor: 'var(--tema-texto)', backgroundColor: `${theme.hex}0d` } : undefined}
      >
        <span className="text-2xl leading-none" aria-hidden="true">{s.icon}</span>
        <span className={`text-sm font-bold leading-tight text-center ${deLugar ? theme.textColor : ''}`} dir="auto">{s.labels[target]}</span>
        {showNative && <span className="text-sm leading-tight text-center text-gray-600 dark:text-slate-300" dir="auto">{s.labels[native]}</span>}
      </button>
    );
  };

  const fullRoute = steps.map((s) => s.phrases[target]).join(' ');
  const fullRouteNative = steps.map((s) => s.phrases[native]).join(' ');
  // O rumo agora tem 8 valores e a bússola só tem 4 pontos: na diagonal mostra o
  // cardeal mais próximo. É aproximação consciente — quem quiser o rumo exato
  // escolhe na própria bússola.
  const compassIdx = compassPick ?? (Math.round(route.walker.heading / 2) % 4);
  const compass = COMPASS[compassIdx];
  /** Inicial do norte no idioma de destino, para a rosa dos ventos do mapa. */
  const compassNorth = COMPASS[0].names[target].charAt(0);

  const w = route.walker;

  // Cruzamentos repetidos viram segmento de comprimento zero, e aí a seta do
  // `marker-mid` não sabe para onde apontar. Tira as repetições seguidas.
  const linhaDoPercurso = route.points
    .map((p) => `${px(p.x)},${px(p.y)}`)
    .filter((p, i, todos) => i === 0 || p !== todos[i - 1])
    .join(' ');

  return (
    <ModuleShell
      title={t('dirTitle')}
      dica={t('hintDirections')}
      theme={theme}
      t={t}
      nativeCountry={nativeCountry}
      targetCountry={targetCountry}
      onGoHome={onGoHome}
      onOpenLanguageModal={onOpenLanguageModal}
      onOpenShare={onOpenShare}
      pinned={(
        steps.length === 0 ? (
          /* Percurso vazio: o cartão vira só a linha que diz PARA QUE servem os
             passos — é o que a pessoa vai ouvir, não o que vai falar. Sem o
             título e sem os botões, que não têm o que fazer aqui, a banda
             devolve ao mapa uns 50px na primeira tela. */
          <p className={`rounded-2xl px-4 py-3 text-base leading-snug text-white shadow-md ${theme.color}`} dir="auto">
            {t('dirEmpty')}
          </p>
        ) : (
          /* O percurso é a frase deste módulo, e vai crescendo passo a passo. A
             lista tem teto e rolagem própria, e rola sozinha até o passo novo:
             dez passos encheriam meia tela, e aí o mapa — que é onde a pessoa
             olha para escolher o próximo — sairia da vista. */
          <div className={`rounded-3xl p-4 text-white shadow-md ${theme.color}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="flex-1 min-w-0 pt-1.5 text-sm font-bold uppercase tracking-wide text-white" dir="auto">{t('dirRoute')}</h2>
              <button onClick={undo} className={PILULA}><span dir="auto">{t('dirUndo')}</span></button>
            </div>

            <ol ref={listaRef} className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-black/15 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold leading-snug" dir="auto">{s.phrases[target]}</p>
                    {showNative && <p className="text-sm text-white leading-snug" dir="auto">{s.phrases[native]}</p>}
                  </div>
                  <button onClick={() => speak(s.phrases[target], s.phrases[native])} className="hit p-1.5 rounded-full bg-white/20 hover:bg-white/30 flex-shrink-0 tap active:scale-90" aria-label={audioLabel(t('locListen'))} title={audioLabel(t('locListen'))}>
                    <IconeOuvir texto={s.phrases[target]} Listen={Listen} className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ol>

            {/* "Começar de novo" era um X, e X quer dizer "fechar" para quase todo
                mundo. Virou texto, no mesmo feitio de Desfazer. */}
            <div className="mt-3 flex items-center gap-2">
              {steps.length > 1 && (
                <button
                  onClick={() => speak(fullRoute, fullRouteNative)}
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 font-bold flex items-center justify-center gap-2 tap active:scale-[0.98]"
                  style={{ color: 'var(--tema-texto)' }}
                  aria-label={audioLabel(t('dirPlayAll'))}
                >
                  <IconeOuvir texto={fullRoute} Listen={Listen} className="w-5 h-5 flex-shrink-0" />
                  <span dir="auto">{t('dirPlayAll')}</span>
                </button>
              )}
              <button onClick={clear} className={`${PILULA} ml-auto`}><span dir="auto">{t('dirClear')}</span></button>
            </div>
          </div>
        )
      )}
    >

      {/*
        MAPA E PASSOS — um bloco só, e é por isso que eles moram juntos.

        O módulo inteiro depende de a pessoa tocar num passo e VER o boneco
        virar: é isso que ensina "derecha" e "izquierda". Com o mapa a 320px, a
        banda fixa e o mapa empurravam os botões para o pé da tela; quem rolava
        para alcançá-los perdia o mapa de vista, tocava, ouvia, e não via nada.

        Duas medidas:
        1. O mapa encolheu para 240px, e para menos ainda em tela baixa (32% da
           altura). Assim o mapa e duas fileiras de passos cabem juntos.
        2. Em tela alta (a partir de 800px), o mapa GRUDA no topo da rolagem
           enquanto os passos passam por baixo dele — e solta sozinho quando os
           passos acabam, porque o `sticky` só vale dentro deste bloco. Em tela
           baixa não gruda: com a banda cheia, sobraria uma fresta para tocar.
           E aqui não há os problemas que tiraram o `sticky` da banda da frase
           (ModuleShell): o mapa é o primeiro filho do bloco, então o
           `space-y-4` não lhe põe margem, e ninguém mira `scrollIntoView` nele.
      */}
      <div>
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-3 [@media(min-height:800px)]:sticky [@media(min-height:800px)]:top-0 [@media(min-height:800px)]:z-10">
        <svg
          viewBox="0 0 300 300"
          className="w-full max-w-[240px] mx-auto block select-none"
          // `dvh` num `min()` e não numa classe: onde o navegador não conhece a
          // unidade, a declaração inteira cai e sobra o `max-w-[240px]`.
          style={{ aspectRatio: '1 / 1', maxWidth: 'min(240px, 32dvh)' }}
        >
          <defs>
            {/* Setas brancas dentro do traço do percurso: dizem o SENTIDO.
                Sem elas a rota é uma linha lisa e não dá para saber onde
                começou nem para onde foi. */}
            <marker id={setaId} markerUnits="userSpaceOnUse" markerWidth={10} markerHeight={10} refX={5} refY={5} orient="auto">
              <path d="M3.4 2 L6.6 5 L3.4 8" fill="none" stroke="white" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            </marker>

            {/*
              A CIDADE NÃO ACABA.

              Sem isto, prender o caminhante no meio da tela era impossível: o
              bairro tem 4 quarteirões de lado, então a câmera saía do mundo e
              o mapa sumia do quadro. Um ladrilho repetido dá cidade infinita
              com um elemento só, em vez de centenas de quarteirões desenhados
              que ninguém vai olhar.

              Em tom mais claro de propósito: é cenário. O bairro onde dá para
              andar vem desenhado por cima, mais forte, e essa diferença de
              tom é o que conta, sem legenda, até onde o percurso pode ir.

              A 40% de opacidade, e não só "um tom mais claro": a diferença
              antiga era sutil demais para quem não sabia que ela existia, e a
              rua de enfeite parecia rua de verdade — o mapa dizia "pode ir"
              onde os botões diziam "não pode".
            */}
            <pattern id={cidadeId} patternUnits="userSpaceOnUse" x={OFF} y={OFF} width={SP} height={SP}>
              <g opacity={0.4}>
                <rect x={9} y={9} width={SP - 18} height={SP - 18} rx={7} fill="var(--art-ground)" stroke="var(--art-tint)" />
                {[0, SP].map((d) => (
                  <g key={d}>
                    <line x1={d} y1={-SP} x2={d} y2={SP * 2} stroke="var(--art-edge)" strokeWidth={11} />
                    <line x1={-SP} y1={d} x2={SP * 2} y2={d} stroke="var(--art-edge)" strokeWidth={11} />
                  </g>
                ))}
              </g>
            </pattern>
          </defs>

          {/*
            O MUNDO gira e desliza em volta do caminhante, que não sai do meio
            da tela — o comportamento de um GPS, e o conserto deste módulo.

            Antes o mapa era norte-sempre-em-cima e as frases são do ponto de
            vista de quem anda. As duas coisas só coincidiam olhando para o
            norte: de frente para o sul, "gira a la derecha" mandava o boneco
            para a ESQUERDA da tela. Em 3 das 4 direções o mapa discordava da
            frase, e em 1 delas dizia o oposto.
          */}
          <g
            style={{
              transform: `translate(${ANCORA.x}px, ${ANCORA.y}px) rotate(${-pose.spin * 45}deg) translate(${-px(pose.x)}px, ${-px(pose.y)}px)`,
              transformOrigin: '0px 0px',
              transition: `transform ${DESLIZE}ms var(--ease-out)`,
            }}
          >
            {/* cenário: a cidade que continua para todo lado */}
            <rect x={-1200} y={-1200} width={2700} height={2700} fill={`url(#${cidadeId})`} />

            {/* o bairro onde dá para andar, em tom mais forte */}
            {Array.from({ length: GRID - 1 }).map((_, bx) =>
              Array.from({ length: GRID - 1 }).map((_, by) => (
                <rect key={`${bx}-${by}`} x={px(bx) + 9} y={px(by) + 9} width={SP - 18} height={SP - 18} rx={7} fill="var(--art-tint)" stroke="var(--art-edge)" />
              ))
            )}
            {Array.from({ length: GRID }).map((_, i) => (
              <g key={i}>
                <line x1={px(0)} y1={px(i)} x2={px(GRID - 1)} y2={px(i)} stroke="var(--art-fill)" strokeWidth={11} strokeLinecap="round" />
                <line x1={px(i)} y1={px(0)} x2={px(i)} y2={px(GRID - 1)} stroke="var(--art-fill)" strokeWidth={11} strokeLinecap="round" />
                <line x1={px(0)} y1={px(i)} x2={px(GRID - 1)} y2={px(i)} stroke="var(--art-paint)" strokeWidth={1.3} strokeDasharray="5 7" />
                <line x1={px(i)} y1={px(0)} x2={px(i)} y2={px(GRID - 1)} stroke="var(--art-paint)" strokeWidth={1.3} strokeDasharray="5 7" />
              </g>
            ))}

            {/*
              Bifurcação e rotatória.

              Estão no vocabulário do módulo ("la bifurcación", "la rotonda")
              e não existiam no mapa, então eram palavras sem figura. São
              CENÁRIO: o caminhante anda na grade reta e passa por elas, mas
              não há passo de "pegue a segunda saída" — isso seria outro
              modelo de movimento.
            */}
            {DIAGONAIS.map((e, i) => (
              <g key={i}>
                <line x1={px(e.a.x)} y1={px(e.a.y)} x2={px(e.b.x)} y2={px(e.b.y)} stroke="var(--art-fill)" strokeWidth={11} strokeLinecap="round" />
                <line x1={px(e.a.x)} y1={px(e.a.y)} x2={px(e.b.x)} y2={px(e.b.y)} stroke="var(--art-paint)" strokeWidth={1.3} strokeDasharray="5 7" />
              </g>
            ))}
            <circle cx={px(ROTATORIA.x)} cy={px(ROTATORIA.y)} r={23} fill="none" stroke="var(--art-fill)" strokeWidth={11} />
            <circle cx={px(ROTATORIA.x)} cy={px(ROTATORIA.y)} r={23} fill="none" stroke="var(--art-paint)" strokeWidth={1.3} strokeDasharray="5 7" />
            <circle cx={px(ROTATORIA.x)} cy={px(ROTATORIA.y)} r={16} fill="var(--art-green)" stroke="var(--art-green-edge)" strokeWidth={2} />
            <Upright x={px(ROTATORIA.x)} y={px(ROTATORIA.y)} deg={pose.spin * 45}>
              <text x={px(ROTATORIA.x)} y={px(ROTATORIA.y) + 6} textAnchor="middle" fontSize={17}>🌳</text>
            </Upright>

            {/* pontos de referência — de pé enquanto o mapa gira */}
            {LANDMARKS.map((l, i) => {
              const lx = px(l.bx) + SP / 2;
              const ly = px(l.by) + SP / 2;
              return (
                <Upright key={i} x={lx} y={ly} deg={pose.spin * 45}>
                  <text x={lx} y={ly + 9} textAnchor="middle" fontSize={27}>{l.emoji}</text>
                </Upright>
              );
            })}

            {/* percurso */}
            <polyline
              points={linhaDoPercurso}
              fill="none"
              stroke={theme.hex}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
              markerMid={`url(#${setaId})`}
            />
            {/* início: anel vazado, o símbolo de origem */}
            <circle cx={px(START.x)} cy={px(START.y)} r={8} fill="var(--art-plate)" stroke={theme.hex} strokeWidth={3} />
            <circle cx={px(START.x)} cy={px(START.y)} r={3} fill={theme.hex} />

            {/* número de cada passo, casando com a lista numerada abaixo */}
            {route.marks.map((m) => {
              const mx = px(m.x);
              const my = px(m.y);
              if (m.x === pose.x && m.y === pose.y) return null; // o boneco cobriria
              return (
                <Upright key={`${m.x}-${m.y}`} x={mx} y={my} deg={pose.spin * 45}>
                  <circle cx={mx} cy={my} r={12} fill={theme.hex} stroke="white" strokeWidth={2.5} />
                  <text x={mx} y={my + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="white">{m.n}</text>
                </Upright>
              );
            })}

            {/* destino: só quando a animação chega lá */}
            {route.arrived && noFim && (
              <Upright x={px(w.x)} y={px(w.y) - 18} deg={pose.spin * 45}>
                <text x={px(w.x)} y={px(w.y) - 18} textAnchor="middle" fontSize={28}>📍</text>
              </Upright>
            )}
          </g>

          {/*
            Caminhante: fora do grupo que gira, cravado no meio e sempre
            apontando para cima. Não leva rotação nenhuma — é esse o ponto. O
            cone de visão mostra o que está à frente sem precisar de legenda.
          */}
          <g style={{ transform: `translate(${ANCORA.x}px, ${ANCORA.y}px)` }}>
            <path d="M0 0 L-21 -38 A42 42 0 0 1 21 -38 Z" fill={theme.hex} opacity={0.15} />
            <circle r={14} fill={theme.hex} stroke="white" strokeWidth={3} />
            <polygon points="0,-8 6.5,4.5 -6.5,4.5" fill="white" />
          </g>

          {/*
            A PLACA da manobra, no tempo em que o caminhante está virando.

            Era uma seta curva desenhada à mão, e ficava esquisita: um risco
            solto no meio do mapa, sem parentesco com nada. A placa é o mesmo
            símbolo do botão que a pessoa acabou de apertar — o que liga o
            toque ao que acontece na tela, e é como a rua avisa de verdade.
          */}
          {pose.placa && (
            <g style={{ transform: `translate(${ANCORA.x}px, ${ANCORA.y}px)` }}>
              <rect x={-27} y={-88} width={54} height={46} rx={13} fill="var(--art-plate)" stroke="var(--art-edge)" strokeWidth={1.5} />
              <text x={0} y={-54} textAnchor="middle" fontSize={28}>{pose.placa}</text>
            </g>
          )}

          {/*
            Rosa dos ventos, fixa no canto e por cima do mapa. O mapa deixou
            de ter o norte para cima, então precisa dizer para onde o norte
            foi — e de quebra é o que este módulo ensina logo abaixo.
          */}
          <g
            style={{
              transform: `rotate(${-pose.spin * 45}deg)`,
              transformOrigin: '266px 34px',
              transition: `transform ${DESLIZE}ms var(--ease-out)`,
            }}
          >
            <circle cx={266} cy={34} r={18} fill="var(--art-plate)" stroke="var(--art-edge)" strokeWidth={1.5} />
            <polygon points="266,20 270,34 262,34" fill={theme.hex} />
            <polygon points="266,48 270,34 262,34" fill="var(--art-fill)" />
            <Upright x={266} y={17} deg={pose.spin * 45}>
              <text x={266} y={17} textAnchor="middle" fontSize={10} fontWeight={700} fill={theme.hex}>
                {compassNorth}
              </text>
            </Upright>
          </g>
        </svg>
      </div>

      {/*
        BOTÕES DE PASSO — uma grade só, com os possíveis daqui.

        Duas regras, e a segunda custou uma tentativa errada.

        1. Passo impossível não fica apagado: some. Apagado carrega um recado
           ("a rua acabou") que quase nunca é verdade — com o bairro de 7x7 o
           mais comum é não valer por um detalhe de geometria que ninguém
           precisa saber, e meia grade cinzenta o tempo todo é como se ensina
           a pessoa a parar de olhar para ali.

        2. Rotatória e bifurcação entram AQUI DENTRO, no fim da mesma grade.
           Estavam numa seção própria logo abaixo, e o resultado foi alguém
           procurar o botão da bifurcação na grade de cima e não achar. Botão
           que aparece fora do lugar onde se olha é botão que não apareceu.

        Eles entram no fim, não no começo, para os de sempre não trocarem de
        posição a cada passo; e vêm tingidos com a cor do módulo, que é o que
        os faz saltar sem precisar de seção à parte.

        O preço de sumir é a grade mexer, e botão que some sem explicação
        confunde tanto quanto botão apagado — por isso a regra vem escrita
        logo acima, e ela troca de texto quando a pessoa chega na rotatória ou
        na bifurcação, que é onde a explicação vale.

        Três colunas e não quatro: com quatro, o espanhol saía em 11px e o
        português em 10px, justo nos botões mais tocados. A 14px, quatro não
        cabem. E a seção vai sem cartão em volta, como os chips dos outros
        módulos: são 32px a menos entre o mapa e a primeira fileira.
      */}
      <section className="mt-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-1 px-1" dir="auto">{t('dirSteps')}</h2>
        {passosNaTela.length > 0 ? (
          <>
            {/* Com o percurso vazio, a banda lá em cima já diz "Toque num passo
                aqui embaixo", e somada à linha de gesto e à dica eram quatro
                recados iguais empurrando os botões para baixo. A regra de por
                que um passo some só faz falta depois do primeiro passo — ou na
                rotatória e na bifurcação, onde ela troca de texto. */}
            {(emLugar || steps.length > 0) && (
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-3 leading-snug px-1" dir="auto">
                {emLugar && (
                  <strong className={`font-bold ${theme.textColor}`}>
                    {t(naRotatoria ? 'dirAtRoundabout' : 'dirAtFork')}{' — '}
                  </strong>
                )}
                {t(emLugar ? (naRotatoria ? 'dirAtRoundaboutHint' : 'dirAtForkHint') : 'dirStepsHint')}
              </p>
            )}
            <div className="grid grid-cols-3 gap-2">
              {passosNaTela.map(botaoPasso)}
            </div>
          </>
        ) : (
          /* Só dois motivos deixam a grade vazia, e nenhum é erro. Chegar é
             vitória, e a frase diz isso; o teto de dez passos é dito como teto.
             As duas apontam para onde o botão está de verdade: lá em cima, no
             cartão fixo (antes diziam "no percurso abaixo", e o X de limpar
             parecia "fechar"). */
          <p
            role="status"
            className="rounded-2xl px-4 py-3 text-base leading-snug text-gray-800 dark:text-slate-100"
            style={{ backgroundColor: `${theme.hex}14` }}
            dir="auto"
          >
            {t(route.arrived ? 'dirArrived' : 'dirMaxSteps')}
          </p>
        )}
        {/* A legenda do mapa desceu para cá: embaixo do mapa ela empurrava os
            passos para longe dele. Aqui ela fica perto de onde o olho está
            quando o mapa gira — logo depois do toque. */}
        <p className="text-sm text-gray-600 dark:text-slate-300 leading-snug mt-3 px-1" dir="auto">{t('dirMapTurns')}</p>
      </section>
      </div>

      {/*
        PERGUNTAS — o que ELA fala, logo depois dos passos.

        A bússola ficava aqui no meio e empurrava tudo isto para baixo; desceu
        para o fim. No topo, as fichas de "Como chego a…", uma frase inteira por
        lugar: é a primeira coisa que alguém perdido pergunta.
      */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1" dir="auto">{t('dirQuestions')}</h2>
        <h3 className="text-base font-bold text-gray-800 dark:text-slate-100 mb-2 px-1" dir="auto">{t('dirGoTo')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {DIR_GO_TO.map((g) => (
            <button
              key={g.key}
              onClick={() => speak(g.phrase[target], g.phrase[native])}
              className="rounded-2xl border p-3 text-left flex flex-col gap-1 tap active:scale-95 bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-800 dark:text-slate-100"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-2xl leading-none" aria-hidden="true">{g.emoji}</span>
                <IconeOuvir texto={g.phrase[target]} Listen={Listen} className={`w-5 h-5 flex-shrink-0 ${theme.textColor}`} />
              </span>
              <span className="text-base font-bold leading-snug" dir="auto">{g.phrase[target]}</span>
              {showNative && <span className="text-sm text-gray-600 dark:text-slate-300 leading-snug" dir="auto">{g.phrase[native]}</span>}
            </button>
          ))}
        </div>

        <ul className="mt-3 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 py-1 divide-y divide-gray-100 dark:divide-slate-700">
          {DIR_QUESTIONS.map((q, i) => (
            <li key={i}>
              <button onClick={() => speak(q[target], q[native])} className="w-full py-2.5 flex items-center gap-3 text-left tap active:scale-[0.98]">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold leading-snug" dir="auto">{q[target]}</p>
                  {showNative && <p className="text-sm text-gray-600 dark:text-slate-300 leading-snug" dir="auto">{q[native]}</p>}
                </div>
                <IconeOuvir texto={q[target]} Listen={Listen} className={`w-5 h-5 flex-shrink-0 ${theme.textColor}`} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* VOCABULÁRIO */}
      <VocabGroup title={t('dirVocabulary')} items={DIR_PLACES} target={target} native={native} showNative={showNative} onSpeak={speak} />
      <VocabGroup title={t('dirDistances')} items={DIR_DISTANCES} target={target} native={native} showNative={showNative} onSpeak={speak} />

      {/*
        BÚSSOLA — por último.

        Na rua ninguém ensina caminho a pé por norte e sul, e as palavras são
        quase iguais ao português. Ela fica porque o mapa tem rosa dos ventos e
        alguém pode querer saber o nome, mas não pode ficar entre os passos e as
        perguntas, empurrando o que é útil para baixo.
      */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-3" dir="auto">{t('dirCompass')}</h2>
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 120 120" className="w-32 h-32 flex-shrink-0">
            <circle cx={60} cy={60} r={54} fill="var(--art-ground)" stroke="var(--art-edge)" strokeWidth={2} />
            {COMPASS.map((c) => {
              const rad = (c.deg - 90) * Math.PI / 180;
              const x = 60 + Math.cos(rad) * 42;
              const y = 60 + Math.sin(rad) * 42 + 5;
              const active = c.key === compass.key;
              return (
                <text key={c.key} x={x} y={y} textAnchor="middle" fontSize={14} fontWeight={700} fill={active ? theme.hex : 'var(--art-label)'}>
                  {c.names[target].charAt(0)}
                </text>
              );
            })}
            <g style={{ transform: `translate(60px, 60px) rotate(${compass.deg}deg)`, transition: 'transform var(--scene-duration) var(--ease-out)' }}>
              <polygon points="0,-30 7,0 -7,0" fill={theme.hex} />
              <polygon points="0,30 7,0 -7,0" fill="var(--art-fill)" />
              <circle r={4} fill="var(--art-plate)" stroke={theme.hex} strokeWidth={2} />
            </g>
          </svg>
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {COMPASS.map((c, i) => {
                const active = c.key === compass.key;
                return (
                  <button
                    key={c.key}
                    aria-pressed={active}
                    onClick={() => { setCompassPick(i); speak(c.names[target], c.names[native]); }}
                    className={`rounded-xl border px-2 py-1.5 text-left tap active:scale-95 ${active ? `${theme.color} border-transparent text-white` : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-700 dark:text-slate-200'}`}
                  >
                    <div className="text-sm font-bold leading-tight" dir="auto">{c.names[target]}</div>
                    {showNative && <div className={`text-sm leading-tight ${active ? 'text-white' : 'text-gray-600 dark:text-slate-300'}`} dir="auto">{c.names[native]}</div>}
                  </button>
                );
              })}
            </div>
            <button onClick={() => speak(headingSentence(target, compass), headingSentence(native, compass))} className="w-full text-left flex items-center gap-2 tap active:scale-[0.98]">
              <IconeOuvir texto={headingSentence(target, compass)} Listen={Listen} className={`w-5 h-5 flex-shrink-0 ${theme.textColor}`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug" dir="auto">{headingSentence(target, compass)}</p>
                {showNative && <p className="text-sm text-gray-600 dark:text-slate-300 leading-snug" dir="auto">{headingSentence(native, compass)}</p>}
              </div>
            </button>
          </div>
        </div>
      </section>
    </ModuleShell>
  );
}

/**
 * Mantém um elemento de pé enquanto o mapa gira por baixo dele.
 *
 * Emoji de cabeça para baixo e número de passo espelhado não se leem. Gira no
 * sentido contrário ao do mundo, em torno do próprio ponto, e com a MESMA
 * duração — com tempos diferentes o item pareceria rodopiar durante a virada.
 */
const Upright: React.FC<{ x: number; y: number; deg: number; children: React.ReactNode }> = ({ x, y, deg, children }) => (
  <g
    style={{
      transform: `rotate(${deg}deg)`,
      transformOrigin: `${x}px ${y}px`,
      transition: 'transform var(--scene-duration) var(--ease-out)',
    }}
  >
    {children}
  </g>
);

/**
 * O ícone de ouvir que pulsa enquanto ESTA frase carrega ou sai.
 *
 * Direções não usa o `PhraseCard` (tem lista, não frase), então não ganhava o
 * pulso de graça como os outros nove. Sem ele, o som da rede demorava, o botão
 * ficava igual, e a pessoa tocava de novo. O estado vem de `utils/audioState`,
 * sem prop nova no módulo.
 */
const IconeOuvir: React.FC<{ texto: string; Listen: Glyph; className: string }> = ({ texto, Listen, className }) => {
  const falando = useFalando(texto);
  return <Listen className={falando ? `${className} animate-pulse` : className} aria-hidden="true" />;
};

interface VocabGroupProps {
  title: string;
  items: Vocab[];
  target: LangCode;
  native: LangCode;
  showNative: boolean;
  onSpeak: (text: string, glosa: string | null) => void;
}

const VocabGroup: React.FC<VocabGroupProps> = ({ title, items, target, native, showNative, onSpeak }) => (
  <section>
    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1" dir="auto">{title}</h2>
    <div className="grid grid-cols-2 gap-2">
      {items.map((v, i) => (
        <button
          key={i}
          onClick={() => onSpeak(v.names[target], v.names[native])}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-2.5 flex items-center gap-2 text-left tap active:scale-95"
        >
          <span className="text-2xl leading-none flex-shrink-0" aria-hidden="true">{v.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight" dir="auto">{v.names[target]}</p>
            {showNative && <p className="text-sm text-gray-600 dark:text-slate-300 leading-tight" dir="auto">{v.names[native]}</p>}
          </div>
        </button>
      ))}
    </div>
  </section>
);
