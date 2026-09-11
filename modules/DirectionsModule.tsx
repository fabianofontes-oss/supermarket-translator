
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Country } from '../types';
import { HomeIcon, SpeakerIcon, SpeakerOffIcon, XIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import { ShareButton } from '../components/ShareButton';
import type { VoiceStatus } from '../utils/speech';
import { toLangCode, type LangCode } from './location/data/locationData';
import {
  DIR_STEPS,
  DIR_PLACE_STEPS,
  ROTATORIA,
  DIAGONAIS,
  COMPASS,
  DIR_QUESTIONS,
  DIR_PLACES,
  DIR_DISTANCES,
  GRID,
  START,
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

const MAX_STEPS = 10;

/** Quantas colunas para quantos passos. Escrito por extenso: o Tailwind varre o
 *  fonte e não gera classe que só existe depois de concatenada. */
const COLUNAS: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };

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

  const addStep = (step: DirStep) => {
    if (!canApply(step)) return;
    playSound('click');
    setSteps((prev) => [...prev, step]);
    handlePlayAudio(step.phrases[target], targetCountry.lang);
  };
  const undo = () => { playSound('toggle'); setSteps((p) => p.slice(0, -1)); };
  const clear = () => { playSound('toggle'); setSteps([]); };

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

  /** Os passos que dão para usar daqui. Os outros não ficam apagados: somem. */
  const passosPossiveis = DIR_STEPS.filter(canApply);

  /**
   * Os passos de lugar que valem AGORA. Vazio quase sempre, e é isso que faz a
   * seção inteira sumir em vez de ficar apagada na tela.
   */
  const passosDeLugar = DIR_PLACE_STEPS.filter(canApply);
  const naRotatoria = passosDeLugar.some((p) => p.at === 'rotatoria');

  /** O mesmo botão serve as duas grades de passos. */
  const botaoPasso = (s: DirStep) => {
    const enabled = canApply(s);
    return (
      <button
        key={s.key}
        disabled={!enabled}
        onClick={() => addStep(s)}
        className={`rounded-2xl border p-2 flex flex-col items-center gap-1 tap active:scale-95 ${
          enabled ? 'bg-white border-gray-100 text-gray-700 hover:border-gray-300' : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'
        }`}
      >
        <span className="text-2xl leading-none">{s.icon}</span>
        <span className="text-[11px] font-bold leading-tight text-center">{s.labels[target]}</span>
        {showNative && <span className="text-[10px] leading-tight text-center text-gray-500" dir="auto">{s.labels[native]}</span>}
      </button>
    );
  };

  const fullRoute = steps.map((s) => s.phrases[target]).join(' ');
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
    <div className="w-full bg-slate-50 text-gray-800 flex flex-col h-[100dvh] relative overflow-hidden font-sans">
      {/* Header */}
      <header className="flex-shrink-0 text-white shadow-lg z-30 rounded-b-3xl" style={{ background: `linear-gradient(to bottom, ${theme.hex}, ${theme.hex}e6)` }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-4 max-w-3xl mx-auto">
          <button onClick={() => { playSound('click'); onGoHome(); }} aria-label={t('a11yHome')} className="hit p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors">
            <HomeIcon className="w-5 h-5" />
          </button>
          <h1 className="flex-1 mx-2 text-center font-bold text-2xl uppercase tracking-tight truncate">{t('moduleDirections')}</h1>
          {/* Cluster da direita. `gap-2` não é escolha estética: a área de
              toque de `.hit` é 44px centrada no botão, e com menos espaço
              que isso as duas se sobrepõem e uma para de responder. */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ShareButton onClick={onOpenShare} t={t} variant="onColor" />
            <button onClick={() => { playSound('click'); onOpenLanguageModal(); }} aria-label={t('languageSettings')} className="hit p-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors">
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

          {/* MAPA */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-3">
            <svg viewBox="0 0 300 300" className="w-full max-w-[320px] mx-auto block select-none" style={{ aspectRatio: '1 / 1' }}>
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
                */}
                <pattern id={cidadeId} patternUnits="userSpaceOnUse" x={OFF} y={OFF} width={SP} height={SP}>
                  <rect x={9} y={9} width={SP - 18} height={SP - 18} rx={7} fill="#f8fafc" stroke="#eef2f7" />
                  {[0, SP].map((d) => (
                    <g key={d}>
                      <line x1={d} y1={-SP} x2={d} y2={SP * 2} stroke="#e8edf3" strokeWidth={11} />
                      <line x1={-SP} y1={d} x2={SP * 2} y2={d} stroke="#e8edf3" strokeWidth={11} />
                    </g>
                  ))}
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
                    <rect key={`${bx}-${by}`} x={px(bx) + 9} y={px(by) + 9} width={SP - 18} height={SP - 18} rx={7} fill="#f1f5f9" stroke="#e2e8f0" />
                  ))
                )}
                {Array.from({ length: GRID }).map((_, i) => (
                  <g key={i}>
                    <line x1={px(0)} y1={px(i)} x2={px(GRID - 1)} y2={px(i)} stroke="#cbd5e1" strokeWidth={11} strokeLinecap="round" />
                    <line x1={px(i)} y1={px(0)} x2={px(i)} y2={px(GRID - 1)} stroke="#cbd5e1" strokeWidth={11} strokeLinecap="round" />
                    <line x1={px(0)} y1={px(i)} x2={px(GRID - 1)} y2={px(i)} stroke="white" strokeWidth={1.3} strokeDasharray="5 7" />
                    <line x1={px(i)} y1={px(0)} x2={px(i)} y2={px(GRID - 1)} stroke="white" strokeWidth={1.3} strokeDasharray="5 7" />
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
                    <line x1={px(e.a.x)} y1={px(e.a.y)} x2={px(e.b.x)} y2={px(e.b.y)} stroke="#cbd5e1" strokeWidth={11} strokeLinecap="round" />
                    <line x1={px(e.a.x)} y1={px(e.a.y)} x2={px(e.b.x)} y2={px(e.b.y)} stroke="white" strokeWidth={1.3} strokeDasharray="5 7" />
                  </g>
                ))}
                <circle cx={px(ROTATORIA.x)} cy={px(ROTATORIA.y)} r={23} fill="none" stroke="#cbd5e1" strokeWidth={11} />
                <circle cx={px(ROTATORIA.x)} cy={px(ROTATORIA.y)} r={23} fill="none" stroke="white" strokeWidth={1.3} strokeDasharray="5 7" />
                <circle cx={px(ROTATORIA.x)} cy={px(ROTATORIA.y)} r={16} fill="#dcfce7" stroke="#bbf7d0" strokeWidth={2} />
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
                <circle cx={px(START.x)} cy={px(START.y)} r={8} fill="white" stroke={theme.hex} strokeWidth={3} />
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
                  <rect x={-27} y={-88} width={54} height={46} rx={13} fill="white" stroke="#e2e8f0" strokeWidth={1.5} />
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
                <circle cx={266} cy={34} r={18} fill="white" stroke="#e2e8f0" strokeWidth={1.5} />
                <polygon points="266,20 270,34 262,34" fill={theme.hex} />
                <polygon points="266,48 270,34 262,34" fill="#cbd5e1" />
                <Upright x={266} y={17} deg={pose.spin * 45}>
                  <text x={266} y={17} textAnchor="middle" fontSize={10} fontWeight={700} fill={theme.hex}>
                    {compassNorth}
                  </text>
                </Upright>
              </g>
            </svg>

            <p className="text-xs text-gray-500 text-center leading-snug mt-1 px-2" dir="auto">{t('dirMapTurns')}</p>
          </div>

          {/*
            BOTÕES DE PASSO — só os que dão para usar daqui.

            Antes os impossíveis ficavam apagados na grade. Apagado carrega um
            recado ("a rua acabou") que quase nunca é verdade: com o bairro de
            7x7, o mais comum é o passo não valer por um detalhe de geometria que
            ninguém precisa saber. O resultado era meia grade cinzenta o tempo
            todo, que é como se ensina a pessoa a parar de olhar para ali.

            O preço de sumir é a grade mexer de lugar a cada passo, e botão que
            some sem explicação confunde tanto quanto botão apagado. Por isso a
            regra vem escrita DENTRO do cartão, e por isso existe a linha do
            beco sem saída: sem ela, chegar num canto deixaria a seção vazia sem
            dizer o que fazer.

            Cartão branco, não tingido: o tingido é da rotatória e da bifurcação,
            e é o que faz elas parecerem novidade quando aparecem.
          */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{t('dirSteps')}</h2>
            <p className="text-xs text-gray-500 mb-3 leading-snug" dir="auto">{t('dirStepsHint')}</p>
            {passosPossiveis.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {passosPossiveis.map(botaoPasso)}
              </div>
            ) : (
              <p className="text-sm text-gray-600 leading-snug" dir="auto">{t('dirNoSteps')}</p>
            )}
          </section>

          {/*
            Rotatória e bifurcação: aparecem só quando dá para usá-las.

            Antes ficavam sempre na tela, quase sempre apagadas. Botão que passa
            a vida apagado não ensina a regra dele — ensina a ignorar aquele
            canto da tela, e ainda ocupa espaço o tempo todo por algo que vale em
            dois pontos do mapa.

            Surgindo no momento em que a pessoa chega, viram acontecimento: é o
            único instante em que ela vai ler o que está escrito ali. E o texto
            não gasta a linha dizendo onde elas ficam — o mapa já mostra —, e sim
            o que muda na fala, que é a parte que ninguém adivinha: na rotatória
            não se diz "vire", conta-se a saída.

            A descoberta não fica solta: a rotatória e a avenida diagonal estão
            desenhadas no mapa desde o começo, então há para onde mirar.
          */}
          {passosDeLugar.length > 0 && (
            <section
              className="rounded-3xl border p-4 animate-expand-up"
              style={{ borderColor: theme.hex, backgroundColor: `${theme.hex}0d` }}
            >
              <h2 className={`text-xs font-bold uppercase tracking-widest mb-1 ${theme.textColor}`} dir="auto">
                {t(naRotatoria ? 'dirAtRoundabout' : 'dirAtFork')}
              </h2>
              <p className="text-xs text-gray-600 mb-3 leading-snug" dir="auto">
                {t(naRotatoria ? 'dirAtRoundaboutHint' : 'dirAtForkHint')}
              </p>
              <div className={`grid ${COLUNAS[passosDeLugar.length] ?? 'grid-cols-3'} gap-2`}>
                {passosDeLugar.map(botaoPasso)}
              </div>
            </section>
          )}

          {/* PERCURSO (frases) */}
          <div className={`rounded-3xl p-4 text-white shadow-md ${theme.color}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white">{t('dirRoute')}</h2>
              <div className="flex gap-2">
                {steps.length > 0 && (
                  <>
                    <button onClick={undo} className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold">{t('dirUndo')}</button>
                    <button onClick={clear} className="p-1 rounded-full bg-white/20 hover:bg-white/30" aria-label={t('dirClear')}><XIcon className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            </div>

            {steps.length === 0 ? (
              <p className="text-white text-sm py-3">{t('dirEmpty')}</p>
            ) : (
              <ol className="space-y-2">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-white/25 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold leading-snug">{s.phrases[target]}</p>
                      {showNative && <p className="text-xs text-white leading-snug" dir="auto">{s.phrases[native]}</p>}
                    </div>
                    <button onClick={() => speak(s.phrases[target])} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 flex-shrink-0" aria-label={audioLabel(t('locListen'))} title={audioLabel(t('locListen'))}>
                      <Listen className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ol>
            )}

            {steps.length > 1 && (
              <button
                onClick={() => speak(fullRoute)}
                className="mt-3 w-full py-2.5 rounded-xl bg-white font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                style={{ color: theme.hex }}
              >
                <Listen className="w-5 h-5" /> {t('dirPlayAll')}
              </button>
            )}
          </div>

          {/* BÚSSOLA */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">{t('dirCompass')}</h2>
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 120 120" className="w-32 h-32 flex-shrink-0">
                <circle cx={60} cy={60} r={54} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={2} />
                {COMPASS.map((c) => {
                  const rad = (c.deg - 90) * Math.PI / 180;
                  const x = 60 + Math.cos(rad) * 42;
                  const y = 60 + Math.sin(rad) * 42 + 5;
                  const active = c.key === compass.key;
                  return (
                    <text key={c.key} x={x} y={y} textAnchor="middle" fontSize={14} fontWeight={700} fill={active ? theme.hex : '#94a3b8'}>
                      {c.names[target].charAt(0)}
                    </text>
                  );
                })}
                <g style={{ transform: `translate(60px, 60px) rotate(${compass.deg}deg)`, transition: 'transform var(--scene-duration) var(--ease-out)' }}>
                  <polygon points="0,-30 7,0 -7,0" fill={theme.hex} />
                  <polygon points="0,30 7,0 -7,0" fill="#cbd5e1" />
                  <circle r={4} fill="white" stroke={theme.hex} strokeWidth={2} />
                </g>
              </svg>
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {COMPASS.map((c, i) => {
                    const active = c.key === compass.key;
                    return (
                      <button
                        key={c.key}
                        onClick={() => { setCompassPick(i); speak(c.names[target]); }}
                        className={`rounded-xl border px-2 py-1.5 text-left tap active:scale-95 ${active ? `${theme.color} border-transparent text-white` : 'bg-white border-gray-100 text-gray-700'}`}
                      >
                        <div className="text-sm font-bold leading-tight">{c.names[target]}</div>
                        {showNative && <div className={`text-[10px] leading-tight ${active ? 'text-white' : 'text-gray-500'}`} dir="auto">{c.names[native]}</div>}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => speak(headingSentence(target, compass))} className="w-full text-left flex items-center gap-2">
                  <Listen className={`w-4 h-4 flex-shrink-0 ${theme.textColor}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug">{headingSentence(target, compass)}</p>
                    {showNative && <p className="text-[11px] text-gray-500 leading-snug" dir="auto">{headingSentence(native, compass)}</p>}
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* PERGUNTAS */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t('dirQuestions')}</h2>
            <ul className="divide-y divide-gray-100">
              {DIR_QUESTIONS.map((q, i) => (
                <li key={i}>
                  <button onClick={() => speak(q[target])} className="w-full py-2.5 flex items-center gap-3 text-left">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-snug">{q[target]}</p>
                      {showNative && <p className="text-xs text-gray-500 leading-snug" dir="auto">{q[native]}</p>}
                    </div>
                    <Listen className={`w-5 h-5 flex-shrink-0 ${theme.textColor}`} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* VOCABULÁRIO */}
          <VocabGroup title={t('dirVocabulary')} items={DIR_PLACES} target={target} native={native} showNative={showNative} onSpeak={speak} />
          <VocabGroup title={t('dirDistances')} items={DIR_DISTANCES} target={target} native={native} showNative={showNative} onSpeak={speak} />
        </div>
      </main>
    </div>
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

interface VocabGroupProps {
  title: string;
  items: Vocab[];
  target: LangCode;
  native: LangCode;
  showNative: boolean;
  onSpeak: (text: string) => void;
}

const VocabGroup: React.FC<VocabGroupProps> = ({ title, items, target, native, showNative, onSpeak }) => (
  <section>
    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{title}</h2>
    <div className="grid grid-cols-2 gap-2">
      {items.map((v, i) => (
        <button
          key={i}
          onClick={() => onSpeak(v.names[target])}
          className="bg-white rounded-2xl border border-gray-100 p-2.5 flex items-center gap-2 text-left active:scale-95 transition-transform"
        >
          <span className="text-2xl leading-none flex-shrink-0">{v.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">{v.names[target]}</p>
            {showNative && <p className="text-[11px] text-gray-500 leading-tight" dir="auto">{v.names[native]}</p>}
          </div>
        </button>
      ))}
    </div>
  </section>
);
