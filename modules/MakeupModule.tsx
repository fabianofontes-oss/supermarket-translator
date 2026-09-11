
import React, { useMemo, useState } from 'react';
import type { Country } from '../types';
import { HomeIcon, SpeakerIcon, SpeakerOffIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import { ShareButton } from '../components/ShareButton';
import type { VoiceStatus } from '../utils/speech';
import { toLangCode } from './location/data/locationData';
import { TOOL_GLYPHS } from './makeup/MakeupGlyphs';
import {
  MAKEUP_PRODUCTS,
  DIMENSIONS,
  TOOLS,
  TOOL_FRAMES,
  MAKEUP_QUESTIONS,
  optionsFor,
  buildMakeupRequest,
  buildToolPhrase,
  type Product,
  type DimKey,
  type Tool,
  type ToolGroup,
} from './makeup/data/makeupData';

interface MakeupModuleProps {
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

/** Ordem das seções de acessório, e a chave de tradução de cada uma. */
const GROUPS: { key: ToolGroup; labelKey: string }[] = [
  { key: 'apply', labelKey: 'mkToolsApply' },
  { key: 'hair', labelKey: 'mkToolsHair' },
  { key: 'clean', labelKey: 'mkToolsClean' },
  { key: 'carry', labelKey: 'mkToolsCarry' },
];

/** Tom neutro de apoio, para quando nada foi escolhido ainda. */
const SEM_COR = '#e2e8f0';

/**
 * A figura é o equivalente do copo desenhado do Café: não ilustra, é objeto de
 * apontar — a pessoa vira a tela para quem atende. Preenchimento chapado, sem
 * `<defs>` e sem `id`, para o defeito 8.19 não ter como acontecer.
 */
const Figure: React.FC<{ product: Product; fill: string }> = ({ product, fill }) => {
  const traco = '#94a3b8';
  const cheek = product.key === 'colorete';

  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28" aria-hidden="true">
      {product.figure === 'face' && (
        <>
          <ellipse cx="60" cy="60" rx="36" ry="44" fill={cheek ? '#f5e6db' : fill} stroke={traco} strokeWidth="3" />
          {cheek && (
            <>
              <ellipse cx="36" cy="68" rx="13" ry="9" fill={fill} />
              <ellipse cx="84" cy="68" rx="13" ry="9" fill={fill} />
            </>
          )}
          <circle cx="47" cy="50" r="3.4" fill={traco} />
          <circle cx="73" cy="50" r="3.4" fill={traco} />
          <path d="M50 80q10 7 20 0" fill="none" stroke={traco} strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {product.figure === 'lips' && (
        <>
          <path
            d="M20 60q10-16 22-10 10 5 18 5t18-5q12-6 22 10-16 30-40 30T20 60Z"
            fill={fill} stroke={traco} strokeWidth="3" strokeLinejoin="round"
          />
          <path d="M20 60q18 8 40 8t40-8" fill="none" stroke={traco} strokeWidth="2.5" />
        </>
      )}

      {product.figure === 'eye' && (
        <>
          {/* pálpebra: é ela que recebe a sombra */}
          <path d="M16 60q44-42 88 0" fill={product.key === 'sombra' ? fill : 'none'} stroke={traco} strokeWidth="3" />
          <path d="M16 60q44 34 88 0" fill="none" stroke={traco} strokeWidth="3" />
          <circle cx="60" cy="60" r="13" fill="none" stroke={traco} strokeWidth="3" />
          <circle cx="60" cy="60" r="6" fill={traco} />
          {/* traço do delineador */}
          {product.key === 'delineador' && (
            <path d="M16 60q44-42 88 0" fill="none" stroke={fill} strokeWidth="7" strokeLinecap="round" />
          )}
          {/* cílios do rímel */}
          {product.key === 'mascara' && (
            <path
              d="M22 48l-7-8M36 38l-5-10M52 32l-2-11M68 32l2-11M84 38l5-10M98 48l7-8"
              fill="none" stroke={traco} strokeWidth="3.5" strokeLinecap="round"
            />
          )}
        </>
      )}

      {product.figure === 'nail' && (
        <>
          <path d="M44 108q-6-26 0-52 4-18 16-18t16 18q6 26 0 52Z" fill="#f5e6db" stroke={traco} strokeWidth="3" />
          <path d="M44 60q-2-22 2-36 4-16 14-16t14 16q4 14 2 36Z" fill={fill} stroke={traco} strokeWidth="3" />
        </>
      )}
    </svg>
  );
};

export default function MakeupModule({
  nativeCountry,
  targetCountry,
  t,
  theme,
  onGoHome,
  onOpenLanguageModal,
  onOpenShare,
  handlePlayAudio,
  voiceStatus = 'unknown',
}: MakeupModuleProps) {
  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;

  const [mode, setMode] = useState<'products' | 'tools'>('products');
  const [product, setProduct] = useState<Product>(MAKEUP_PRODUCTS[0]); // base
  const [picks, setPicks] = useState<Partial<Record<DimKey, string>>>({});
  const [tool, setTool] = useState<Tool>(TOOLS[0]);                    // pincel
  const [frame, setFrame] = useState(TOOL_FRAMES[0]);                  // "Tem…?"

  const request = useMemo(() => buildMakeupRequest(target, product, picks), [target, product, picks]);
  const requestNative = useMemo(() => buildMakeupRequest(native, product, picks), [native, product, picks]);
  const toolPhrase = useMemo(() => buildToolPhrase(target, frame, tool), [target, frame, tool]);
  const toolPhraseNative = useMemo(() => buildToolPhrase(native, frame, tool), [native, frame, tool]);

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

  /**
   * Trocar de produto NÃO descarta escolha nenhuma. Tom e subtom descrevem a
   * PESSOA, não o produto: quem passou pelo batom e voltou para a base teria
   * de informar o próprio tom outra vez. É o oposto do `pickVerb` dos
   * Pronomes, que zera o complemento porque lá ele pertence ao verbo.
   *
   * O que não vale para o produto atual simplesmente não é desenhado (a seção
   * sai da tela) nem entra na frase (`buildMakeupRequest` filtra por
   * `optionsFor`). Podar aqui era o caminho errado: perdia dado do usuário
   * para resolver um problema que já estava resolvido na hora de montar.
   */
  const pickProduct = (p: Product) => {
    playSound('click');
    setProduct(p);
  };

  /** Um toque na opção já escolhida desfaz a escolha. */
  const pickOption = (key: DimKey, optKey: string) => {
    playSound('toggle');
    setPicks((prev) => (prev[key] === optKey ? { ...prev, [key]: undefined } : { ...prev, [key]: optKey }));
  };

  const temEscolha = product.dims.some((d) => picks[d]);

  /** A amostra do tom se desloca com o subtom: "claro frío" e "claro cálido"
   *  são frascos diferentes na prateleira, e é isso que a régua mostra. */
  function corDaOpcao(dimKey: DimKey, optKey: string): string | undefined {
    const dim = DIMENSIONS.find((d) => d.key === dimKey);
    const opt = dim?.options.find((o) => o.key === optKey);
    if (!opt?.swatch) return undefined;
    if (typeof opt.swatch === 'string') return opt.swatch;
    const sub = picks.undertone;
    if (sub === 'frio') return opt.swatch.cool;
    if (sub === 'calido') return opt.swatch.warm;
    return opt.swatch.neutral;
  }

  /** Cor que preenche a figura: a da cor escolhida, senão a do tom, senão nada.
   *  Só conta a escolha que vale para ESTE produto — senão um tom de pele que
   *  sobrou da base pintaria a boca do batom. */
  const fill = useMemo(() => {
    const vale = (d: DimKey) => product.dims.includes(d);
    if (vale('color') && picks.color) return corDaOpcao('color', picks.color) ?? SEM_COR;
    if (vale('depth') && picks.depth) return corDaOpcao('depth', picks.depth) ?? SEM_COR;
    return SEM_COR;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, picks.color, picks.depth, picks.undertone]);

  const ToolGlyph = TOOL_GLYPHS[tool.key];

  return (
    <div className="w-full bg-slate-50 text-gray-800 flex flex-col h-[100dvh] relative overflow-hidden font-sans">
      <header className="flex-shrink-0 text-white shadow-lg z-30 rounded-b-3xl" style={{ background: `linear-gradient(to bottom, ${theme.hex}, ${theme.hex}e6)` }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-4 max-w-3xl mx-auto">
          <button onClick={() => { playSound('click'); onGoHome(); }} aria-label={t('a11yHome')} className="hit p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors">
            <HomeIcon className="w-5 h-5" />
          </button>
          <h1 className="flex-1 mx-2 text-center font-bold text-2xl uppercase tracking-tight truncate">{t('moduleMakeup')}</h1>
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

          {/* Seletor de modo. As duas metades são coisas diferentes — uma se
              configura, a outra se navega —, e juntas na mesma rolagem dariam
              dez seções e um cartão de frase ambíguo. */}
          <div className="bg-gray-200/70 rounded-2xl p-1 flex gap-1" role="tablist" aria-label={t('moduleMakeup')}>
            {([['products', 'mkModeProducts'], ['tools', 'mkModeTools']] as const).map(([key, labelKey]) => {
              const active = mode === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => { playSound('page-turn'); setMode(key); }}
                  // py-3 e não py-2: com py-2 o botão fica em 36px de altura,
                  // que é exatamente o que a auditoria 8.9 lista como defeito.
                  className={`flex-1 rounded-xl py-3 text-sm font-bold tap ${active ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                  style={active ? { color: theme.hex } : undefined}
                >
                  <span dir="auto">{t(labelKey)}</span>
                </button>
              );
            })}
          </div>

          {/* ---------------------------------------------------- PRODUTOS */}
          {mode === 'products' && (
            <>
              {/* Figura + explicação */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                <div className="flex-shrink-0"><Figure product={product} fill={fill} /></div>
                <div className="min-w-0">
                  <p className="text-lg font-extrabold leading-tight" dir="auto">{product.names[target]}</p>
                  {showNative && <p className="text-xs text-gray-500 mb-1" dir="auto">{product.names[native]}</p>}
                  <p className="text-sm text-gray-600 leading-snug mt-1" dir="auto">{product.descs[showNative ? native : target]}</p>
                </div>
              </div>

              {/* Pedido */}
              <div className={`rounded-3xl p-4 text-white shadow-md ${theme.color}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold leading-snug" dir="auto">{request}</p>
                    {showNative && <p className="text-sm text-white mt-1 leading-snug" dir="auto">{requestNative}</p>}
                  </div>
                  <button onClick={() => speak(request)} className="p-3 rounded-full bg-white shadow active:scale-95 transition-transform flex-shrink-0" style={{ color: theme.hex }} aria-label={audioLabel(t('locListen'))} title={audioLabel(t('locListen'))}>
                    <Listen className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-[11px] text-white mt-2 leading-snug" dir="auto">{t('mkShowScreen')}</p>
              </div>

              {/* Produtos */}
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('mkProducts')}</h2>
                <div className="grid grid-cols-3 gap-2">
                  {MAKEUP_PRODUCTS.map((p) => {
                    const active = p.key === product.key;
                    return (
                      <button
                        key={p.key}
                        onClick={() => pickProduct(p)}
                        aria-pressed={active}
                        className={`rounded-2xl border p-2 tap active:scale-95 ${active ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white text-gray-700 border-gray-100'}`}
                      >
                        <span className="block text-xs font-bold leading-tight" dir="auto">{p.names[target]}</span>
                        {showNative && <span className={`block text-[10px] leading-tight mt-0.5 ${active ? 'text-white' : 'text-gray-500'}`} dir="auto">{p.names[native]}</span>}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* As seções saem da tela junto com o toque quando o produto
                  não aceita a dimensão. É essa a resposta visual, e é por
                  isso que não há aviso escrito de "não se aplica". */}
              {product.dims.map((key) => {
                const dim = DIMENSIONS.find((d) => d.key === key);
                if (!dim) return null;
                const opcoes = optionsFor(dim, product);
                return (
                  <section key={key}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t(dim.labelKey)}</h2>
                    <div className="flex flex-wrap gap-2">
                      {opcoes.map((o) => {
                        const active = picks[key] === o.key;
                        const cor = dim.visual ? corDaOpcao(key, o.key) : undefined;
                        return (
                          <button
                            key={o.key}
                            onClick={() => pickOption(key, o.key)}
                            aria-pressed={active}
                            className={`rounded-2xl border px-3 py-2 text-sm font-bold tap active:scale-95 ${active ? 'border-transparent shadow' : 'bg-white border-gray-100'}`}
                            style={active ? { backgroundColor: `${theme.hex}18`, boxShadow: `inset 0 0 0 2px ${theme.hex}`, color: theme.hex } : undefined}
                          >
                            {dim.visual && (
                              // Contorno obrigatório: tom muito claro sobre
                              // card branco some sem ele. E "transparente"
                              // não pode ser quadrado branco, que leria como
                              // "muito claro" — vai como contorno com barra.
                              <span
                                className="block w-10 h-6 rounded-lg border border-slate-400 mx-auto mb-1"
                                style={cor
                                  ? { backgroundColor: cor }
                                  : { backgroundImage: 'linear-gradient(to top right, transparent 46%, #94a3b8 46%, #94a3b8 54%, transparent 54%)' }}
                              />
                            )}
                            {/* Nunca só cor: o rótulo em texto fica sempre. */}
                            <span className="block" dir="auto">{o.labels[target]}</span>
                            {showNative && <span className="block text-[10px] font-medium text-gray-500" dir="auto">{o.labels[native]}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              <div className="flex items-center justify-between gap-3 px-1">
                <p className="text-[11px] text-gray-500 leading-snug flex-1" dir="auto">{t('mkColorWarning')}</p>
                {temEscolha && (
                  <button
                    onClick={() => { playSound('toggle'); setPicks({}); }}
                    className="text-xs font-bold rounded-xl border border-gray-200 bg-white px-3 py-2 tap active:scale-95 flex-shrink-0"
                  >
                    <span dir="auto">{t('mkClear')}</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* -------------------------------------------------- ACESSÓRIOS */}
          {mode === 'tools' && (
            <>
              {/* Objeto + nome + armadilha de nome */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex items-start gap-4">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${theme.hex}14`, color: theme.hex }}>
                  {ToolGlyph && <ToolGlyph className="w-12 h-12" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-extrabold leading-tight" dir="auto">{tool.names[target]}</p>
                      {showNative && <p className="text-xs text-gray-500" dir="auto">{tool.names[native]}</p>}
                    </div>
                    <button
                      onClick={() => speak(tool.names[target])}
                      className={`hit p-1.5 rounded-full flex-shrink-0 ${theme.textColor}`}
                      aria-label={audioLabel(t('locListen'))} title={audioLabel(t('locListen'))}
                    >
                      <Listen className="w-5 h-5" />
                    </button>
                  </div>
                  {tool.note && (
                    <p className="text-sm text-gray-600 leading-snug mt-2" dir="auto">
                      {tool.note[showNative ? native : target]}
                    </p>
                  )}
                </div>
              </div>

              {/* Quadro de frase + frase montada */}
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('mkAsk')}</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  {TOOL_FRAMES.map((f) => {
                    const active = f.key === frame.key;
                    return (
                      <button
                        key={f.key}
                        onClick={() => { playSound('toggle'); setFrame(f); }}
                        aria-pressed={active}
                        className={`rounded-xl px-3 py-2 text-sm font-bold tap active:scale-95 border ${active ? `${theme.color} text-white border-transparent shadow` : 'bg-white text-gray-700 border-gray-100'}`}
                      >
                        <span dir="auto">{f.labels[target]}</span>
                        {showNative && <span className={`block text-[10px] font-medium ${active ? 'text-white' : 'text-gray-500'}`} dir="auto">{f.labels[native]}</span>}
                      </button>
                    );
                  })}
                </div>
                <div className={`rounded-3xl p-4 text-white shadow-md ${theme.color}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-bold leading-snug" dir="auto">{toolPhrase}</p>
                      {showNative && <p className="text-sm text-white mt-1 leading-snug" dir="auto">{toolPhraseNative}</p>}
                    </div>
                    <button onClick={() => speak(toolPhrase)} className="p-3 rounded-full bg-white shadow active:scale-95 transition-transform flex-shrink-0" style={{ color: theme.hex }} aria-label={audioLabel(t('locListen'))} title={audioLabel(t('locListen'))}>
                      <Listen className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </section>

              {GROUPS.map((g) => (
                <section key={g.key}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t(g.labelKey)}</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {TOOLS.filter((x) => x.group === g.key).map((x) => {
                      const active = x.key === tool.key;
                      const Glyph = TOOL_GLYPHS[x.key];
                      return (
                        <button
                          key={x.key}
                          onClick={() => { playSound('click'); setTool(x); }}
                          aria-pressed={active}
                          className={`rounded-2xl border p-2 flex flex-col items-center gap-1 tap active:scale-95 ${active ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white text-gray-700 border-gray-100'}`}
                        >
                          {Glyph && <Glyph className="w-7 h-7" />}
                          <span className="block text-xs font-bold leading-tight text-center" dir="auto">{x.names[target]}</span>
                          {showNative && <span className={`block text-[10px] leading-tight text-center ${active ? 'text-white' : 'text-gray-500'}`} dir="auto">{x.names[native]}</span>}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </>
          )}

          {/* Frases da loja: servem às duas metades. */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t('mkPhrases')}</h2>
            <ul className="divide-y divide-gray-100">
              {MAKEUP_QUESTIONS.map((q, i) => (
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
