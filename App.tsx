import React, { useState, useEffect, useMemo, useCallback, useId, useRef, Suspense } from 'react';
import { COUNTRIES, SUPERMARKET_CATEGORIES, PHARMACY_CATEGORIES } from './constants';
import type { Country, TranslationItem } from './types';
import type { ModuleKey } from './utils/rotas';
import { useModuleRoute } from './hooks/useModuleRoute';
import { origemAberta, destinoAberto, moduloFechado } from './lancamento';
// Cada módulo vira um pedaço próprio: abrir o hub não baixa o catálogo
// inteiro nem os dados dos outros oito módulos.
const CatalogModule = lazyWithRetry(() => import('./modules/CatalogModule'));
const LocationModule = lazyWithRetry(() => import('./modules/LocationModule'));
const DirectionsModule = lazyWithRetry(() => import('./modules/DirectionsModule'));
const NumbersModule = lazyWithRetry(() => import('./modules/NumbersModule'));
const BodyModule = lazyWithRetry(() => import('./modules/BodyModule'));
const CafeModule = lazyWithRetry(() => import('./modules/CafeModule'));
const PronounsModule = lazyWithRetry(() => import('./modules/PronounsModule'));
const SizesModule = lazyWithRetry(() => import('./modules/SizesModule'));
const MakeupModule = lazyWithRetry(() => import('./modules/MakeupModule'));
const ElderCareModule = lazyWithRetry(() => import('./modules/ElderCareModule'));
const HouseCleaningModule = lazyWithRetry(() => import('./modules/HouseCleaningModule'));
import { translations } from './translations';
import { useListManager } from './hooks/useListManager';
import { useFavorites } from './hooks/useFavorites';
import { useDialog } from './hooks/useDialog';
import { usePresenca } from './hooks/usePresenca';
import { useCountryPair, TARGET_COUNTRY_KEY } from './hooks/useCountryPair';
import { TraducaoContext } from './hooks/useT';
import { LanguagePanel } from './components/LanguagePanel';
import { VoiceMissingSheet, type AvisoSemSom } from './components/VoiceMissingSheet';
import { ShowPhraseScreen, fraseJaNaTela } from './components/ShowPhraseScreen';
import { CountrySheet } from './components/CountrySheet';
import { UpdateSheet } from './components/UpdateSheet';
import { ShareSheet } from './components/ShareSheet';
import { ShareButton } from './components/ShareButton';
import { watchForUpdate } from './utils/pwaUpdate';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { lazyWithRetry } from './utils/lazyWithRetry';
import { playSound } from './utils/soundUtils';
import { pickVoice, type VoiceStatus } from './utils/speech';
import { criarTocador, type Tocador } from './utils/tocador';
import { assinarAudio, glosaDe, lerAudio, marcarGestoAprendido } from './utils/audioState';
import { writeJSON } from './utils/storage';
import {
  contarAbertura,
  destinoSalvoAberto,
  devePerguntarPais,
  deveConvidarInstalar,
  gravarDispensaInstalar,
  jaPerguntouPais,
  lerDispensaInstalar,
  marcarPaisPerguntado,
} from './utils/primeiraAbertura';
import {
  ShoppingBagIcon,
  PillIcon,
  KeyIcon,
  SignpostIcon,
  IconeRelogio,
  BodyIcon,
  CafeIcon,
  PronounsIcon,
  ShirtIcon,
  MakeupIcon,
  ElderCareIcon,
  HouseCleaningIcon,
  ChevronDownIcon,
  SpeakerIcon,
  SpeakerOffIcon,
  XIcon,
} from './components/Icons';

type Tab = 'home' | 'search' | 'favorites' | 'list';

export interface Theme { color: string; textColor: string; hex: string; borderColor: string }

const THEMES: Record<ModuleKey, Theme> = {
  supermarket: { color: 'bg-red-600',     textColor: 'text-red-600 dark:text-red-300',     hex: '#dc2626', borderColor: 'border-red-600' },
  pharmacy:    { color: 'bg-emerald-700', textColor: 'text-emerald-700 dark:text-emerald-300', hex: '#047857', borderColor: 'border-emerald-700' },
  location:    { color: 'bg-blue-600',    textColor: 'text-blue-600 dark:text-blue-300',    hex: '#2563eb', borderColor: 'border-blue-600' },
  directions:  { color: 'bg-amber-700',   textColor: 'text-amber-700 dark:text-amber-300',   hex: '#b45309', borderColor: 'border-amber-700' },
  numbers:     { color: 'bg-violet-600',  textColor: 'text-violet-600 dark:text-violet-300',  hex: '#7c3aed', borderColor: 'border-violet-600' },
  body:        { color: 'bg-rose-600',    textColor: 'text-rose-600 dark:text-rose-300',    hex: '#e11d48', borderColor: 'border-rose-600' },
  cafe:        { color: 'bg-orange-800',  textColor: 'text-orange-800 dark:text-orange-300',  hex: '#9a3412', borderColor: 'border-orange-800' },
  pronouns:    { color: 'bg-teal-700',    textColor: 'text-teal-700 dark:text-teal-300',    hex: '#0f766e', borderColor: 'border-teal-700' },
  sizes:       { color: 'bg-indigo-600',  textColor: 'text-indigo-600 dark:text-indigo-300',  hex: '#4f46e5', borderColor: 'border-indigo-600' },
  // fuchsia-700 e não 600: no sólido o 600 dá 4,71:1, e no pé do gradiente do
  // header (`${hex}e6`) cai abaixo de 4,5:1 — foi onde Farmácia, Direções e
  // Pronomes reprovaram antes de subirem para o tom 700.
  makeup:      { color: 'bg-fuchsia-700', textColor: 'text-fuchsia-700 dark:text-fuchsia-300', hex: '#a21caf', borderColor: 'border-fuchsia-700' },
  // sky-700: 5,93:1 com branco no sólido e 4,87:1 no pé do gradiente do header
  // (`${hex}e6`). O sky-600 dá 4,10:1 e já reprova no sólido, antes mesmo do
  // gradiente. Mesma armadilha de Farmácia, Direções, Pronomes e Maquiagem,
  // que subiram todos para o tom 700.
  eldercare:   { color: 'bg-sky-700',     textColor: 'text-sky-700 dark:text-sky-300',     hex: '#0369a1', borderColor: 'border-sky-700' },
  // lime-800: 7,08:1 com branco no solido e 5,53:1 no pe do gradiente. O verde
  // obvio para limpeza seria o green-700, e ele da 4,17:1 no pe — reprova. O
  // lime-800 tambem nao se confunde com o emerald-700 da Farmacia, que e mais azulado.
  housecleaning: { color: 'bg-lime-800',  textColor: 'text-lime-800 dark:text-lime-300',    hex: '#3f6212', borderColor: 'border-lime-800' },
};

// Módulos do hub (classes escritas por extenso para o Tailwind gerar o CSS)
// needsCatalog: depende dos 1.333 itens traduzidos; fica bloqueado para países só de origem (uk, ar).
//
// Não existe mais a fileira de treze telhas cinzas "a caminho" (Restaurante,
// Hospital, Shopping…). Elas não abriam, não diziam por quê, e disputavam com as
// vivas o mesmo problema: quem sentia dor procurava "Hospital", que estava
// morto, e não "Onde dói". Metade do início eram botões que não funcionavam.
const ACTIVE_MODULES: { key: ModuleKey; labelKey: string; icon: React.FC<{ className?: string }>; iconClass: string; cardClass: string; needsCatalog?: boolean }[] = [
  { key: 'supermarket', labelKey: 'supermarketGuide', icon: ShoppingBagIcon, iconClass: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300', cardClass: 'bg-red-50 border-red-200 text-red-700', needsCatalog: true },
  { key: 'pharmacy',    labelKey: 'modulePharmacy',   icon: PillIcon,             iconClass: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300', cardClass: 'bg-emerald-50 border-emerald-200 text-emerald-700', needsCatalog: true },
  { key: 'location',    labelKey: 'moduleLocation',   icon: KeyIcon,              iconClass: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300', cardClass: 'bg-blue-50 border-blue-200 text-blue-600' },
  { key: 'directions',  labelKey: 'moduleDirections', icon: SignpostIcon,         iconClass: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300', cardClass: 'bg-amber-50 border-amber-200 text-amber-700' },
  { key: 'numbers',     labelKey: 'moduleNumbers',    icon: IconeRelogio,         iconClass: 'bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-300', cardClass: 'bg-violet-50 border-violet-200 text-violet-600' },
  { key: 'body',        labelKey: 'moduleBody',       icon: BodyIcon,             iconClass: 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300', cardClass: 'bg-rose-50 border-rose-200 text-rose-700' },
  { key: 'cafe',        labelKey: 'moduleCafe',       icon: CafeIcon,             iconClass: 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300', cardClass: 'bg-orange-50 border-orange-200 text-orange-800' },
  { key: 'pronouns',    labelKey: 'modulePronouns',   icon: PronounsIcon,         iconClass: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300', cardClass: 'bg-teal-50 border-teal-200 text-teal-700' },
  { key: 'sizes',       labelKey: 'moduleSizes',      icon: ShirtIcon,            iconClass: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300', cardClass: 'bg-indigo-50 border-indigo-200 text-indigo-600' },
  { key: 'makeup',      labelKey: 'moduleMakeup',     icon: MakeupIcon,           iconClass: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300', cardClass: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700' },
  // Sem `needsCatalog`: e generativo, entao abre tambem para ucraniana,
  // marroquina e lituana — que sao justamente quem faz este trabalho.
  { key: 'eldercare',   labelKey: 'moduleElderCare',  icon: ElderCareIcon,        iconClass: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300', cardClass: 'bg-sky-50 border-sky-200 text-sky-700' },
  { key: 'housecleaning', labelKey: 'moduleHouseCleaning', icon: HouseCleaningIcon, iconClass: 'bg-lime-100 dark:bg-lime-950 text-lime-800 dark:text-lime-300', cardClass: 'bg-lime-50 border-lime-200 text-lime-800' },
];

/**
 * Para onde leva a telha de um módulo fechado, quando há um vizinho que resolve.
 *
 * A Farmácia fechada é justamente a telha que quem sente dor procura. "Em breve"
 * ali era um beco sem saída; o Onde dói está aberto e diz o que ela precisa
 * dizer no balcão. O Supermercado não tem vizinho equivalente e continua "Em
 * breve", sem ação.
 */
const DESVIO_SE_FECHADO: Partial<Record<ModuleKey, { para: ModuleKey; labelKey: string }>> = {
  pharmacy: { para: 'body', labelKey: 'useBodyInstead' },
};

/** Lido uma vez: nada disso muda com o app aberto. */
const lerAmbiente = () => {
  if (typeof window === 'undefined') return { ios: false, standalone: false };
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
  let standalone = false;
  try {
    standalone = !!window.matchMedia?.('(display-mode: standalone)')?.matches
      || !!(navigator as unknown as { standalone?: boolean }).standalone;
  } catch { /* sem matchMedia */ }
  return { ios, standalone };
};

export default function App() {
  // Par de idiomas persistido; também mantém lang/dir do documento.
  // Vem ANTES da rota de propósito: é o país nativo que decide se um módulo de
  // catálogo pode abrir, e a rota precisa dessa resposta já no primeiro render.
  const { nativeCountry, setNativeCountry, targetCountry, setTargetCountry } = useCountryPair(COUNTRIES, {
    origem: origemAberta,
    destino: destinoAberto,
  });

  /**
   * Supermercado e Farmácia dependem dos 1.333 itens do catálogo, que só existem
   * nas línguas de destino. Para origem ucraniana, marroquina ou lituana eles
   * ficam desativados — e isto é o que impede um link direto de driblar a trava.
   *
   * Por cima disso vale o recorte do lançamento (`lancamento.ts`), que hoje
   * fecha os dois para todo mundo. Uma função só decide o ladrilho e o link.
   */
  const estaBloqueado = useCallback(
    (modulo: ModuleKey) =>
      moduloFechado(modulo)
      || (!!ACTIVE_MODULES.find((m) => m.key === modulo)?.needsCatalog && !!nativeCountry.originOnly),
    [nativeCountry.originOnly],
  );

  // O módulo aberto mora na URL: ver `utils/rotas.ts`.
  const { currentModule, setCurrentModule } = useModuleRoute(estaBloqueado);

  /*
   * Os fechados vão para o FIM da grade. Eles eram a primeira fileira, que é por
   * onde o olho começa: a primeira coisa que a pessoa via era "Em breve". O
   * `sort` é estável, então a ordem entre os abertos não muda.
   */
  const hubModules = useMemo(
    () => [...ACTIVE_MODULES].sort((a, b) => Number(estaBloqueado(a.key)) - Number(estaBloqueado(b.key))),
    [estaBloqueado],
  );

  const [ambiente] = useState(lerAmbiente);

  /**
   * Versão nova esperando. Sem este aviso a atualização não chega no app
   * instalado: o service worker novo espera enquanto houver janela aberta, e a
   * janela de um PWA no Android não fecha.
   */
  const [applyUpdate, setApplyUpdate] = useState<(() => void) | null>(null);
  useEffect(() => watchForUpdate((aplicar) => setApplyUpdate(() => aplicar)), []);

  // Cascata só nos primeiros instantes de vida do app. Voltar ao hub é
  // navegação repetida, e o que se repete muito não deve animar.
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setIntroDone(true), 800);
    return () => window.clearTimeout(timer);
  }, []);
  const stagger = !introDone;

  // Estado compartilhado dos módulos de catálogo
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [expandedItemKey, setExpandedItemKey] = useState<string | null>(null);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Lista de compras e itens marcados são por módulo…
  const supermarketLists = useListManager('supermarket');
  const pharmacyLists = useListManager('pharmacy');
  const lists = currentModule === 'pharmacy' ? pharmacyLists : supermarketLists;
  // …favoritos são uma lista só para o app inteiro, montada uma única vez.
  const { favorites, toggleFavorite } = useFavorites();

  const t = useCallback((key: string) => {
    const lang = nativeCountry.lang || 'en-US';
    const terms = translations[lang] || translations['en-US'];
    return terms[key] || key;
  }, [nativeCountry.lang]);

  /**
   * O nome do app se traduz, e a aba do navegador tem de acompanhar.
   * O `<title>` do `index.html` é só o texto inicial, antes de o React montar —
   * e ele fica em espanhol, como o manifesto, porque também é resolvido antes de
   * existir alguém para quem traduzir. Daqui em diante manda a língua de quem lê,
   * igual ao `lang` do documento que `useCountryPair` já mantém.
   */
  useEffect(() => { document.title = t('hubTitle'); }, [t]);

  /*
   * A cor do módulo atual, publicada na RAIZ do documento.
   *
   * Ela vem do JS, então nenhuma variante `dark:` do Tailwind a alcança — e no
   * escuro as doze cores reprovam como texto (o vermelho do Supermercado dá
   * 3,03:1 sobre o cartão escuro). Publicada aqui, o CSS pode derivar dela um
   * tom legível em `--tema-texto`, e quem pinta texto, borda ou anel com a cor
   * do módulo usa o derivado.
   *
   * Na raiz do documento, e não na moldura do módulo: folhas e modais são
   * portais, vivem fora da árvore da moldura, e ali a variável não chegaria.
   */
  useEffect(() => {
    const { hex } = currentModule ? THEMES[currentModule] : THEMES.supermarket;
    document.documentElement.style.setProperty('--tema', hex);
  }, [currentModule]);

  // Zera abas ao trocar de módulo
  useEffect(() => {
    setActiveTab('home');
    setIsSearchActive(false);
    setExpandedItemKey(null);
  }, [currentModule]);

  // ----- Primeira abertura: em que país você está? -----
  //
  // Só os destinos abertos, em ordem alfabética (Espanha, Estados Unidos,
  // França). Com um destino só, não há pergunta: ver `devePerguntarPais`.
  const destinosAbertos = useMemo(
    () => COUNTRIES.filter((c) => !c.originOnly && destinoAberto(c)).sort((a, b) => a.name.localeCompare(b.name, 'pt')),
    [],
  );
  const [perguntandoPais, setPerguntandoPais] = useState(() => devePerguntarPais({
    destinosAbertos: destinosAbertos.length,
    destinoSalvoAberto: destinoSalvoAberto(COUNTRIES, destinoAberto),
    jaPerguntou: jaPerguntouPais(),
  }));

  const escolherPais = (pais: Country) => {
    setTargetCountry(pais);
    // Gravado já, mesmo sendo o padrão: foi escolha dela, e não pode voltar a
    // ser tratado como "nada salvo".
    writeJSON(TARGET_COUNTRY_KEY, pais.code);
    marcarPaisPerguntado();
    setPerguntandoPais(false);
  };
  const fecharPerguntaPais = () => {
    // Fechar sem escolher mantém o padrão, e não pergunta de novo.
    marcarPaisPerguntado();
    setPerguntandoPais(false);
  };

  // ----- Áudio -----
  //
  // A regra é a região, não só o idioma: texto do Brasil nunca sai na voz de
  // Portugal, espanhol da Espanha nunca sai na voz mexicana. Região errada foi
  // o que dois revisores nativos reprovaram. O caminho inteiro — voz do
  // aparelho, MP3 da rede, um de cada vez, repetir devagar — mora em
  // `utils/tocador.ts`.
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const onlineRef = useRef(online);
  onlineRef.current = online;

  /** Frase cujo som não saiu, e por quê. Preenchido só quando alguém tenta ouvir. */
  const [avisoVoz, setAvisoVoz] = useState<(AvisoSemSom & { texto: string; lang: string }) | null>(null);
  /** A tela "Mostrar" aberta a partir do aviso "Sem som agora". */
  const [fraseMostrada, setFraseMostrada] = useState<{ texto: string; glosa: string | null; lang: string } | null>(null);

  useEffect(() => {
    const entrou = () => setOnline(true);
    const caiu = () => setOnline(false);
    window.addEventListener('online', entrou);
    window.addEventListener('offline', caiu);
    return () => {
      window.removeEventListener('online', entrou);
      window.removeEventListener('offline', caiu);
    };
  }, []);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const load = () => {
      const next = synth.getVoices();
      // `voiceschanged` dispara várias vezes com a mesma lista em alguns
      // motores; trocar o estado à toa re-renderiza o app inteiro.
      setVoices((prev) =>
        prev.length === next.length && prev.every((v, i) => v.voiceURI === next[i].voiceURI) ? prev : next
      );
    };

    load();
    synth.addEventListener('voiceschanged', load);
    return () => synth.removeEventListener('voiceschanged', load);
  }, []);

  /** Voz do destino atual instalada no aparelho, para a interface saber antes do toque. */
  const targetVoice = useMemo(() => pickVoice(voices, targetCountry.lang), [voices, targetCountry.lang]);

  /**
   * O botão só se declara indisponível quando realmente não há como falar
   * certo: sem voz da região no aparelho E sem internet para buscar o áudio.
   * Com internet, o áudio sai — então marcar o botão seria mentira.
   */
  const voiceStatus: VoiceStatus = targetVoice.status === 'missing' && !online ? 'missing' : 'ok';

  // Um tocador só, para o app inteiro: é o que garante um áudio de cada vez.
  const tocadorRef = useRef<Tocador | null>(null);
  if (!tocadorRef.current) {
    tocadorRef.current = criarTocador({
      online: () => onlineRef.current,
      aoFicarSemSom: (texto, lang, motivo) => {
        const country = COUNTRIES.find((c) => c.lang === lang);
        if (country) setAvisoVoz({ country, motivo, texto, lang });
      },
    });
  }

  const handlePlayAudio = useCallback((text: string, lang: string) => {
    // Tocou num alto-falante: aprendeu o gesto, e a linha que o ensina some.
    marcarGestoAprendido();
    tocadorRef.current!.tocar(text, lang);
  }, []);

  // Trocar de módulo cala o som do anterior.
  useEffect(() => { tocadorRef.current?.parar(); }, [currentModule]);

  const handlePlayPhrase = useCallback((type: 'ask' | 'want', item: TranslationItem) => {
    const name = item.translated_term;
    const templates: Record<string, { ask: (s: string) => string; want: (s: string) => string }> = {
      en: { ask: (s) => `Excuse me, where is the ${s}?`, want: (s) => `I would like ${s}, please.` },
      es: { ask: (s) => `Disculpe, ¿dónde está ${s}?`, want: (s) => `Quiero ${s}, por favor.` },
      pt: { ask: (s) => `Com licença, onde está ${s}?`, want: (s) => `Eu queria ${s}, por favor.` },
      fr: { ask: (s) => `Excusez-moi, où est ${s} ?`, want: (s) => `Je voudrais ${s}, s'il vous plaît.` },
      it: { ask: (s) => `Scusi, dov'è ${s}?`, want: (s) => `Vorrei ${s}, per favore.` },
    };
    const template = templates[targetCountry.lang.split('-')[0]] || templates.en;
    handlePlayAudio(type === 'ask' ? template.ask(name) : template.want(name), targetCountry.lang);
  }, [targetCountry.lang, handlePlayAudio]);

  // ----- Convite para guardar o app no celular -----
  //
  // Não abre mais no instante em que o navegador deixa, por cima de uma tela que
  // a pessoa ainda nem viu. Espera ela ouvir a primeira frase — ou a segunda
  // abertura do app —, e aparece no hub, entre uma tarefa e outra, nunca no meio
  // de um módulo nem antes da pergunta do país. Ver `utils/primeiraAbertura.ts`.
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [dispensadoEm, setDispensadoEm] = useState<number | null>(() => lerDispensaInstalar(Date.now()));
  const [aberturas, setAberturas] = useState(0);
  const [ouviuFrase, setOuviuFrase] = useState(false);

  // Conta a abertura uma vez por carga. A ref segura o duplo efeito do
  // StrictMode, que em desenvolvimento contaria duas.
  const contouAbertura = useRef(false);
  useEffect(() => {
    if (contouAbertura.current) return;
    contouAbertura.current = true;
    setAberturas(contarAbertura());
  }, []);

  // "Ouviu uma frase" é o som ter saído de fato, não só o toque.
  useEffect(() => assinarAudio(() => {
    if (lerAudio().status === 'falando') setOuviuFrase(true);
  }), []);

  useEffect(() => {
    const guardar = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    const instalado = () => { setDeferredPrompt(null); setShowInstallModal(false); };
    window.addEventListener('beforeinstallprompt', guardar);
    window.addEventListener('appinstalled', instalado);
    return () => {
      window.removeEventListener('beforeinstallprompt', guardar);
      window.removeEventListener('appinstalled', instalado);
    };
  }, []);

  const instalavel = !ambiente.standalone && (!!deferredPrompt || ambiente.ios);
  const telaLivre = currentModule === null
    && !perguntandoPais && !isLanguageModalOpen && !isShareOpen
    && !avisoVoz && !fraseMostrada && !applyUpdate;

  useEffect(() => {
    if (showInstallModal) return;
    if (!deveConvidarInstalar({ instalavel, dispensadoEm, agora: Date.now(), ouviuFrase, aberturas, telaLivre })) return;
    // Um respiro depois de chegar ao hub, para não parecer que o toque abriu isto.
    const timer = window.setTimeout(() => setShowInstallModal(true), 800);
    return () => window.clearTimeout(timer);
  }, [instalavel, dispensadoEm, ouviuFrase, aberturas, telaLivre, showInstallModal]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // O evento só serve uma vez: depois do `prompt()` o botão ficaria morto.
    setDeferredPrompt(null);
    setShowInstallModal(false);
    if (outcome === 'accepted') playSound('success');
    else registrarDispensa();
  };

  const registrarDispensa = () => {
    const agora = Date.now();
    gravarDispensaInstalar(agora);
    setDispensadoEm(agora);
  };

  const handleDismissInstall = () => {
    setShowInstallModal(false);
    registrarDispensa();
  };

  // Modal de instalação: mesmo padrão de diálogo do painel de categorias. O foco
  // entra no TÍTULO, e não no X: foco posto por código no X, sem toque antes,
  // acendia o anel de teclado e desenhava um quadrado preto em volta dele.
  const installTitleId = useId();
  const installTitleRef = useRef<HTMLHeadingElement>(null);
  const installPanelRef = useDialog(showInstallModal, () => handleDismissInstall(), installTitleRef);
  const instalacao = usePresenca(showInstallModal);

  // ----- Render -----
  const theme = currentModule ? THEMES[currentModule] : THEMES.supermarket;

  const commonProps = {
    nativeCountry,
    targetCountry,
    t,
    theme,
    onGoHome: () => setCurrentModule(null),
    onOpenLanguageModal: () => setIsLanguageModalOpen(true),
    onOpenShare: () => setIsShareOpen(true),
    handlePlayAudio,
    // 'missing' só quando não há mesmo como falar certo — sem voz da região e
    // sem internet. Enquanto houver rede, o áudio sai e o botão fica normal.
    voiceStatus,
  };

  const catalogProps = {
    ...commonProps,
    handlePlayPhrase,
    activeTab,
    onTabChange: setActiveTab,
    isSearchActive,
    onToggleSearch: () => setIsSearchActive((v) => !v),
    favorites,
    shoppingList: lists.shoppingList,
    checkedItems: lists.checkedItems,
    toggleFavorite,
    toggleShoppingListItem: lists.toggleShoppingListItem,
    expandedItemKey,
    setExpandedItemKey,
  };

  const renderContent = () => {
    switch (currentModule) {
      case 'supermarket':
        return <CatalogModule {...catalogProps} titleKey="supermarketGuide" categories={SUPERMARKET_CATEGORIES} storagePrefix="supermarket" />;
      case 'pharmacy':
        return <CatalogModule {...catalogProps} titleKey="modulePharmacy" categories={PHARMACY_CATEGORIES} storagePrefix="pharmacy" defaultCategoryName="painFever" isPharmacy />;
      case 'location':
        return <LocationModule {...commonProps} />;
      case 'directions':
        return <DirectionsModule {...commonProps} />;
      case 'numbers':
        return <NumbersModule {...commonProps} />;
      case 'body':
        return <BodyModule {...commonProps} />;
      case 'cafe':
        return <CafeModule {...commonProps} />;
      case 'pronouns':
        return <PronounsModule {...commonProps} />;
      case 'sizes':
        return <SizesModule {...commonProps} />;
      case 'makeup':
        return <MakeupModule {...commonProps} />;
      case 'eldercare':
        return <ElderCareModule {...commonProps} />;
      case 'housecleaning':
        return <HouseCleaningModule {...commonProps} />;
      default: {
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-slate-800 flex flex-col">
            {/* Não é mais `sticky`: com o país escrito por extenso o cabeçalho
                cresceu, e grudado no topo ele comeria um terço da tela. */}
            <header className="bg-white dark:bg-slate-800 shadow-sm pt-12 pb-5 px-6">
              <div className="flex justify-between items-start gap-3">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 min-w-0" dir="auto">{t('hubTitle')}</h1>
                <ShareButton onClick={() => setIsShareOpen(true)} t={t} variant="onLight" />
              </div>
              <p className="text-gray-600 dark:text-slate-300 text-base leading-snug mt-1" dir="auto">{t('hubSubtitle')}</p>
              {/*
                Onde ela está, escrito. Antes eram duas bandeirinhas de 24px
                encavaladas num botão cinza sem texto, e muita gente não sabia que
                aquilo se tocava — nem que ali se escolhia o país. Numa linha
                própria, embaixo do título, cabe "Estou em: Estados Unidos" inteiro
                a 375px; o `truncate` fica só de guarda.

                Os dois-pontos são gramática, não enfeite: "Estou em França" e
                "Estou em Estados Unidos" estão errados em português (seria "na",
                "nos"). Como rótulo e valor, "Estou em: França" fica certo com
                qualquer país, sem guardar o artigo de cada um.
              */}
              <button
                onClick={() => { playSound('click'); setIsLanguageModalOpen(true); }}
                className="mt-3 inline-flex items-center gap-2 max-w-full min-h-[44px] pl-1.5 pr-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 tap active:scale-95"
              >
                <img src={targetCountry.image} alt="" aria-hidden="true" className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-black/5" />
                <span className="min-w-0 truncate text-base text-gray-800 dark:text-slate-100" dir="auto">
                  {t('iAmIn')}: <strong className="font-bold">{targetCountry.name}</strong>
                </span>
                <ChevronDownIcon className="w-4 h-4 flex-shrink-0 text-gray-600 dark:text-slate-300" />
              </button>
            </header>

            <main className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-20">
                {hubModules.map((mod, i) => {
                  const blocked = estaBloqueado(mod.key);
                  const desvio = blocked ? DESVIO_SE_FECHADO[mod.key] : undefined;
                  return (
                    <button
                      key={mod.key}
                      disabled={blocked && !desvio}
                      style={{
                        ...(stagger ? { animationDelay: `${i * 40}ms` } : null),
                        // A sombra do ladrilho é da COR do módulo, não preta. Chega por
                        // variável porque são doze cores, e em Tailwind isso seriam doze
                        // sombras arbitrárias escritas à mão; o hex já existe no tema.
                        ...(blocked ? null : { '--cor': THEMES[mod.key].hex }),
                      } as React.CSSProperties}
                      onClick={() => { playSound('click'); setCurrentModule(desvio ? desvio.para : mod.key); }}
                      className={`${blocked
                        // Sem `opacity` no fechado: "Em breve" é texto que ela LÊ, e
                        // texto lido não fica apagado (piso de leitura do app). O
                        // cinza do fundo e do ícone já diz que não abre.
                        ? `bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col items-center gap-3 ${desvio ? 'tap active:scale-95' : 'cursor-not-allowed'}`
                        : `${mod.cardClass} ladrilho p-5 rounded-2xl border flex flex-col items-center gap-3 tap active:scale-95`} ${stagger ? 'animate-rise-in' : ''}`}
                    >
                      {/*
                        O disco saiu. Ele existia para segurar a cor do módulo; agora
                        o cartão inteiro é a cor, então o disco só servia para
                        encolher o ícone. 48px contra os 28px de antes.
                      */}
                      <mod.icon className={`w-12 h-12 ${blocked ? 'text-gray-400 dark:text-slate-500' : ''}`} />
                      <span className={`text-base text-center leading-tight ${blocked ? 'font-medium text-gray-600 dark:text-slate-300' : 'font-bold'}`} dir="auto">{t(mod.labelKey)}</span>
                      {blocked && (desvio ? (
                        <span className="text-sm font-semibold text-center leading-tight text-rose-700 dark:text-rose-300 -mt-1" dir="auto">{t(desvio.labelKey)}</span>
                      ) : (
                        <span className="text-sm text-center text-gray-600 dark:text-slate-300 -mt-1" dir="auto">{t('comingSoon')}</span>
                      ))}
                    </button>
                  );
                })}
              </div>
            </main>
          </div>
        );
      }
    }
  };

  return (
    <TraducaoContext.Provider value={t}>
      {/*
        Menor ponto de isolamento útil: só o módulo carregado sob demanda. Se o
        chunk não vier, o hub, o seletor de idiomas e a navegação continuam de
        pé, e o fallback oferece uma saída sem depender da recarga.
        `resetKey` faz o erro sumir quando o usuário troca de módulo.
      */}
      <ErrorBoundary
        resetKey={currentModule ?? 'home'}
        fallback={(error) => (
          <ErrorFallback
            error={error}
            t={t}
            theme={theme}
            onGoHome={() => setCurrentModule(null)}
          />
        )}
      >
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-800" />}>
          {renderContent()}
        </Suspense>
      </ErrorBoundary>

      <CountrySheet
        isOpen={perguntandoPais}
        countries={destinosAbertos}
        onChoose={escolherPais}
        onClose={fecharPerguntaPais}
        t={t}
      />

      <LanguagePanel
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        nativeCountry={nativeCountry}
        targetCountry={targetCountry}
        onNativeChange={setNativeCountry}
        onTargetChange={setTargetCountry}
        options={COUNTRIES}
        t={t}
        theme={theme}
        blockOriginOnly={currentModule === 'supermarket' || currentModule === 'pharmacy'}
        origemAberta={origemAberta}
        destinoAberto={destinoAberto}
        voices={voices}
        online={online}
      />

      <ShowPhraseScreen
        aberto={!!fraseMostrada}
        frase={fraseMostrada?.texto ?? ''}
        glosa={fraseMostrada?.glosa ?? null}
        onFechar={() => setFraseMostrada(null)}
        onOuvir={() => { if (fraseMostrada) handlePlayAudio(fraseMostrada.texto, fraseMostrada.lang); }}
        Listen={voiceStatus === 'missing' ? SpeakerOffIcon : SpeakerIcon}
        listenLabel={voiceStatus === 'missing' ? `${t('locListen')} — ${t('voiceMissingLabel')}` : t('locListen')}
        t={t}
        theme={theme}
      />

      <VoiceMissingSheet
        aviso={avisoVoz}
        onClose={() => setAvisoVoz(null)}
        onShowPhrase={() => {
          // Se o som falhou DENTRO da tela Mostrar, a frase já está em tela
          // cheia embaixo da folha: basta fechar a folha.
          if (avisoVoz && !fraseJaNaTela(avisoVoz.texto)) {
            setFraseMostrada({ texto: avisoVoz.texto, glosa: glosaDe(avisoVoz.texto), lang: avisoVoz.lang });
          }
          setAvisoVoz(null);
        }}
        t={t}
        theme={theme}
      />

      <ShareSheet
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        t={t}
        theme={theme}
      />

      <UpdateSheet
        onApply={applyUpdate}
        onDismiss={() => setApplyUpdate(null)}
        t={t}
        theme={theme}
      />

      {instalacao.montado && (
        <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${instalacao.saindo ? 'animate-fade-out pointer-events-none' : 'animate-fade-in'}`}>
          <div
            ref={installPanelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={installTitleId}
            className={`bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl transform ${instalacao.saindo ? 'animate-slide-down' : 'animate-slide-up'}`}
          >
            <div className="flex justify-between items-start mb-4">
              {/* O ícone do próprio app, que é o que vai ficar na tela do celular.
                  Antes era o saquinho vermelho do Supermercado — um módulo fechado. */}
              <img src="/icons/pwa-192x192.png" alt="" aria-hidden="true" className="w-14 h-14 rounded-2xl shadow-sm" />
              <button onClick={handleDismissInstall} aria-label={t('close')} className="hit p-2 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 tap active:scale-90">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <h3
              id={installTitleId}
              ref={installTitleRef}
              tabIndex={-1}
              className="text-xl font-bold text-gray-900 dark:text-white mb-2 focus-visible:outline-none focus-visible:shadow-none"
              dir="auto"
            >
              {t('installApp')}
            </h3>
            <p className="text-base text-gray-600 dark:text-slate-300 mb-6" dir="auto">{t('installAppDesc')}</p>

            {ambiente.ios ? (
              <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 mb-4 text-base text-gray-700 dark:text-slate-200 space-y-2">
                <p className="flex items-center gap-2">
                  1. {t('iosStep1')}
                  <span className="text-blue-500 dark:text-blue-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  </span>
                </p>
                <p className="flex items-center gap-2">2. {t('iosStep2')} <span className="text-gray-900 dark:text-white font-bold">+</span></p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={handleDismissInstall} className="flex-1 min-h-[48px] py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 tap active:scale-95">
                  {t('notNow')}
                </button>
                <button onClick={handleInstallClick} className="flex-1 min-h-[48px] py-3 px-4 rounded-xl bg-red-600 text-white font-bold shadow-lg hover:bg-red-700 tap active:scale-95">
                  {t('install')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </TraducaoContext.Provider>
  );
}
