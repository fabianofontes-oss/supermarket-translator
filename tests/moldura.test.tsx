import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { translations } from '../translations';
import { COUNTRIES } from '../constants';
import { PhraseCard } from '../components/PhraseCard';
import { fraseJaNaTela } from '../components/ShowPhraseScreen';
import { ModuleShell } from '../components/ModuleShell';
import { passosDoAparelho } from '../components/VoiceMissingSheet';
import { SpeakerIcon } from '../components/Icons';
import { useDialog } from '../hooks/useDialog';
import {
  criarTocador,
  REPETIR_DEVAGAR_MS,
  TAXA_MP3_DEVAGAR,
  TAXA_VOZ,
  TAXA_VOZ_DEVAGAR,
  type MotivoSemSom,
} from '../utils/tocador';
import { definirAudio, lerAudio, marcarGestoAprendido, GESTO_KEY } from '../utils/audioState';
import { partirParaTts, PEDACO_TTS } from '../utils/speech';
import {
  ABERTURAS_KEY,
  INSTALAR_DISPENSADO_KEY,
  PAIS_PERGUNTADO_KEY,
  REPERGUNTAR_INSTALAR_MS,
  deveConvidarInstalar,
  devePerguntarPais,
} from '../utils/primeiraAbertura';

/**
 * A moldura comum: o hub, a primeira abertura, o som e a tela "Mostrar".
 *
 * O que estes testes trancam vem da auditoria de usabilidade de 23/09/2026 —
 * uma brasileira recém-chegada, de óculos, com uma mão, e alguém esperando do
 * outro lado do balcão.
 */

const t = (key: string) => (translations['pt-BR'] as Record<string, string>)[key] || key;
const BR = COUNTRIES.find((c) => c.code === 'br')!;
const ES = COUNTRIES.find((c) => c.code === 'es')!;
const tema = { color: 'bg-blue-600', textColor: 'text-blue-600', hex: '#2563eb', borderColor: 'border-blue-600' };

const semMatchMedia = () => {
  window.matchMedia = ((): MediaQueryList => ({
    matches: false, media: '', onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent: () => false,
  } as unknown as MediaQueryList)) as unknown as typeof window.matchMedia;
};

beforeEach(() => {
  semMatchMedia();
  localStorage.clear();
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  cleanup();
  definirAudio('parado');
});

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ladrilho = (labelKey: string) => screen.getByText(t(labelKey)).closest('button')!;

// ------------------------------------------------------------------- hub

describe('hub — telhas que funcionam', () => {
  beforeEach(() => localStorage.setItem(PAIS_PERGUNTADO_KEY, '1'));

  it('a Farmácia fechada abre o Onde dói', async () => {
    const user = userEvent.setup();
    render(<App />);
    const farmacia = ladrilho('modulePharmacy');
    expect(farmacia.disabled).toBe(false);
    expect(farmacia.textContent).toContain(t('useBodyInstead'));

    await user.click(farmacia);

    // O catálogo continua fechado: quem abre é o Onde dói.
    await waitFor(() => expect(window.location.pathname).toBe('/donde-duele'));
  });

  it('os módulos fechados vão para o fim da grade', () => {
    render(<App />);
    const telhas = [...document.querySelectorAll('main .grid > button')].map((b) => b.textContent ?? '');
    expect(telhas.length).toBeGreaterThan(4);
    // A primeira telha é um módulo que abre, e as duas últimas são as fechadas.
    expect(telhas[0]).not.toContain(t('comingSoon'));
    expect(telhas.slice(-2).join(' ')).toContain(t('supermarketGuide'));
    expect(telhas.slice(-2).join(' ')).toContain(t('modulePharmacy'));
  });

  it('não há mais telhas mortas sem aviso', () => {
    render(<App />);
    for (const k of ['moduleRestaurant', 'moduleHospital', 'moduleShopping', 'modulePost']) {
      expect(screen.queryByText(t(k)), k).toBeNull();
    }
  });

  it('o botão do país diz onde a pessoa está, por extenso', () => {
    render(<App />);
    const botao = screen.getByRole('button', { name: new RegExp(`^${t('iAmIn')}`) });
    expect(botao.textContent).toContain('Espanha');
  });
});

// ------------------------------------------------------------ país

describe('primeira abertura — em que país você está?', () => {
  it('só pergunta com mais de um destino aberto', () => {
    const base = { destinoSalvoAberto: false, jaPerguntou: false };
    expect(devePerguntarPais({ ...base, destinosAbertos: 1 })).toBe(false);
    expect(devePerguntarPais({ ...base, destinosAbertos: 3 })).toBe(true);
    // E nunca por cima de uma escolha que já vale, nem duas vezes.
    expect(devePerguntarPais({ destinosAbertos: 3, destinoSalvoAberto: true, jaPerguntou: false })).toBe(false);
    expect(devePerguntarPais({ destinosAbertos: 3, destinoSalvoAberto: false, jaPerguntou: true })).toBe(false);
  });

  it('com um destino só aberto, o app não pergunta', async () => {
    vi.resetModules();
    vi.doMock('../lancamento', () => ({
      origemAberta: (c: { code: string }) => c.code === 'br',
      destinoAberto: (c: { code: string }) => c.code === 'es',
      moduloFechado: () => false,
    }));
    try {
      const { default: AppUmDestino } = await import('../App');
      render(<AppUmDestino />);
      await screen.findByRole('heading', { name: t('hubTitle') });
      expect(screen.queryByRole('dialog', { name: t('countryAsk') })).toBeNull();
    } finally {
      vi.doUnmock('../lancamento');
      vi.resetModules();
    }
  });

  it('com três destinos abertos e nada salvo, pergunta; escolher salva e fecha', async () => {
    const user = userEvent.setup();
    render(<App />);

    const folha = await screen.findByRole('dialog', { name: t('countryAsk') });
    const opcoes = within(folha).getAllByRole('button').map((b) => b.textContent?.trim()).filter((s) => s !== '');
    expect(opcoes).toEqual(expect.arrayContaining(['Espanha', 'Estados Unidos', 'França']));
    // Nada fechado entra na lista: a pergunta só oferece o que funciona.
    expect(opcoes).not.toContain('Itália');

    await user.click(within(folha).getByRole('button', { name: 'França' }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: t('countryAsk') })).toBeNull());
    expect(localStorage.getItem('targetCountry')).toBe('"fr"');
    expect(screen.getByRole('button', { name: new RegExp(`^${t('iAmIn')}`) }).textContent).toContain('França');
  });

  it('fechar sem escolher mantém a Espanha e não pergunta de novo', async () => {
    const primeira = render(<App />);
    await screen.findByRole('dialog', { name: t('countryAsk') });
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: t('countryAsk') })).toBeNull());
    expect(localStorage.getItem(PAIS_PERGUNTADO_KEY)).toBe('1');
    primeira.unmount();

    render(<App />);
    await esperar(50);
    expect(screen.queryByRole('dialog', { name: t('countryAsk') })).toBeNull();
    expect(screen.getByRole('button', { name: new RegExp(`^${t('iAmIn')}`) }).textContent).toContain('Espanha');
  });

  it('destino já salvo e aberto: não pergunta', async () => {
    localStorage.setItem('targetCountry', '"us"');
    render(<App />);
    await esperar(50);
    expect(screen.queryByRole('dialog', { name: t('countryAsk') })).toBeNull();
  });
});

// ------------------------------------------------------------ instalar

describe('convite para guardar o app', () => {
  const DIA = 24 * 60 * 60 * 1000;
  const base = { instalavel: true, dispensadoEm: null, agora: 100 * DIA, ouviuFrase: false, aberturas: 1, telaLivre: true };

  it('regra: nunca antes de ouvir uma frase, a não ser da segunda abertura em diante', () => {
    expect(deveConvidarInstalar(base)).toBe(false);
    expect(deveConvidarInstalar({ ...base, ouviuFrase: true })).toBe(true);
    expect(deveConvidarInstalar({ ...base, aberturas: 2 })).toBe(true);
    expect(deveConvidarInstalar({ ...base, ouviuFrase: true, telaLivre: false })).toBe(false);
    expect(deveConvidarInstalar({ ...base, ouviuFrase: true, instalavel: false })).toBe(false);
  });

  it('regra: "Agora não" vale uma semana, não para sempre', () => {
    const ouviu = { ...base, ouviuFrase: true };
    expect(deveConvidarInstalar({ ...ouviu, dispensadoEm: ouviu.agora - 3 * DIA })).toBe(false);
    expect(deveConvidarInstalar({ ...ouviu, dispensadoEm: ouviu.agora - REPERGUNTAR_INSTALAR_MS - 1 })).toBe(true);
  });

  const oferecerInstalacao = () => {
    const evento = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(evento, { prompt: vi.fn(), userChoice: Promise.resolve({ outcome: 'dismissed' }) });
    act(() => { window.dispatchEvent(evento); });
  };

  it('o convite não abre antes de ouvir, e abre depois da primeira frase ouvida', async () => {
    localStorage.setItem(PAIS_PERGUNTADO_KEY, '1');
    render(<App />);
    oferecerInstalacao();

    // O navegador já deixou instalar, mas ela ainda não ouviu nada.
    await esperar(1200);
    expect(screen.queryByRole('dialog', { name: t('installApp') })).toBeNull();

    act(() => { definirAudio('falando', 'Hola'); });
    act(() => { definirAudio('parado'); });

    const convite = await screen.findByRole('dialog', { name: t('installApp') }, { timeout: 3000 });
    // O ícone é o do app, e não o saquinho do Supermercado fechado.
    expect(convite.querySelector('img')?.getAttribute('src')).toBe('/icons/pwa-192x192.png');

    fireEvent.click(within(convite).getByRole('button', { name: t('notNow') }));
    expect(Number(localStorage.getItem(INSTALAR_DISPENSADO_KEY))).toBeGreaterThan(0);
  });

  it('nunca abre por cima da pergunta do país', async () => {
    localStorage.setItem(ABERTURAS_KEY, '5');
    render(<App />);
    oferecerInstalacao();
    await screen.findByRole('dialog', { name: t('countryAsk') });
    await esperar(1200);
    expect(screen.queryByRole('dialog', { name: t('installApp') })).toBeNull();
  });

  it('na segunda abertura convida mesmo sem ouvir', async () => {
    localStorage.setItem(PAIS_PERGUNTADO_KEY, '1');
    localStorage.setItem(ABERTURAS_KEY, '1');
    render(<App />);
    oferecerInstalacao();
    await screen.findByRole('dialog', { name: t('installApp') }, { timeout: 3000 });
  });
});

// ------------------------------------------------------------ áudio

interface FalaFalsa { text: string; lang: string; rate: number; voice: unknown }

class AudioFalso {
  static criados: AudioFalso[] = [];
  src: string;
  playbackRate = 1;
  defaultPlaybackRate = 1;
  currentTime = 0;
  pausas = 0;
  tocadas = 0;
  ouvintes: Record<string, (() => void)[]> = {};
  static falhar = false;
  constructor(src: string) { this.src = src; AudioFalso.criados.push(this); }
  addEventListener(ev: string, f: () => void) { (this.ouvintes[ev] ??= []).push(f); }
  removeEventListener(ev: string, f: () => void) { this.ouvintes[ev] = (this.ouvintes[ev] ?? []).filter((g) => g !== f); }
  disparar(ev: string) { [...(this.ouvintes[ev] ?? [])].forEach((f) => f()); }
  pause() { this.pausas += 1; }
  play() { this.tocadas += 1; return AudioFalso.falhar ? Promise.reject(new Error('rede')) : Promise.resolve(); }
}

describe('o tocador', () => {
  let faladas: FalaFalsa[];
  let cancelamentos: number;
  let vozes: { name: string; lang: string; voiceURI: string }[];
  let semSom: { texto: string; motivo: MotivoSemSom }[];
  let relogio: number;
  let online: boolean;

  beforeEach(() => {
    faladas = [];
    cancelamentos = 0;
    vozes = [{ name: 'inglês', lang: 'en-US', voiceURI: 'en' }];
    semSom = [];
    relogio = 1_000_000;
    online = true;
    AudioFalso.criados = [];
    AudioFalso.falhar = false;
    (window as unknown as Record<string, unknown>).speechSynthesis = {
      getVoices: () => vozes,
      speak: (u: FalaFalsa) => { faladas.push(u); },
      cancel: () => { cancelamentos += 1; },
    };
    (globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance = class {
      text: string; lang = ''; rate = 1; voice: unknown = null;
      constructor(text: string) { this.text = text; }
    };
    (globalThis as unknown as Record<string, unknown>).Audio = AudioFalso;
  });

  const novo = () => criarTocador({
    online: () => online,
    aoFicarSemSom: (texto, _lang, motivo) => { semSom.push({ texto, motivo }); },
    agora: () => relogio,
  });

  it('um áudio de cada vez: o segundo toque para o primeiro', async () => {
    const tocador = novo();
    tocador.tocar('Hola', 'es-ES');
    tocador.tocar('Adiós', 'es-ES');

    expect(AudioFalso.criados).toHaveLength(2);
    expect(AudioFalso.criados[0].pausas).toBeGreaterThan(0);
    // A voz do aparelho também é calada antes de cada toque.
    expect(cancelamentos).toBeGreaterThanOrEqual(2);
    // Só a segunda frase conta como a que está saindo.
    expect(lerAudio().texto).toBe('Adiós');
  });

  it('o segundo toque na mesma frase sai mais devagar, sem baixar o MP3 de novo', async () => {
    const tocador = novo();
    tocador.tocar('Hola', 'es-ES');
    // O primeiro saiu de fato (a promessa do play resolveu): ela ouviu.
    await act(async () => { await Promise.resolve(); });
    relogio += 3000;
    tocador.tocar('Hola', 'es-ES');

    expect(AudioFalso.criados).toHaveLength(1);
    const audio = AudioFalso.criados[0];
    expect(audio.playbackRate).toBe(TAXA_MP3_DEVAGAR);
    expect(audio.defaultPlaybackRate).toBe(TAXA_MP3_DEVAGAR);
    expect(audio.tocadas).toBe(2);

    // O terceiro volta ao normal: alterna.
    await act(async () => { await Promise.resolve(); });
    relogio += 3000;
    tocador.tocar('Hola', 'es-ES');
    expect(audio.playbackRate).toBe(1);
  });

  it('tocar de novo enquanto o MP3 ainda carrega não é "repete devagar"', async () => {
    // Em 3G o som demora, ela acha que não tocou e toca de novo. Ela ainda não
    // ouviu nada: a primeira escuta não pode sair arrastada.
    const tocador = novo();
    tocador.tocar('Hola', 'es-ES');
    relogio += 800;
    tocador.tocar('Hola', 'es-ES');

    // O mesmo elemento (o download continua), na velocidade normal.
    expect(AudioFalso.criados).toHaveLength(1);
    const audio = AudioFalso.criados[0];
    expect(audio.playbackRate).toBe(1);
    expect(audio.tocadas).toBe(2);

    // Agora sim ela ouviu; o toque seguinte é o "repete devagar".
    await act(async () => { await Promise.resolve(); });
    relogio += 2000;
    tocador.tocar('Hola', 'es-ES');
    expect(audio.playbackRate).toBe(TAXA_MP3_DEVAGAR);
  });

  it('com a voz do aparelho, o segundo toque também sai mais devagar', () => {
    vozes = [{ name: 'Luciana', lang: 'pt-BR', voiceURI: 'pt' }];
    const tocador = novo();
    tocador.tocar('Onde fica?', 'pt-BR');
    relogio += 2000;
    tocador.tocar('Onde fica?', 'pt-BR');
    relogio += 2000;
    tocador.tocar('Onde fica?', 'pt-BR');

    expect(faladas.map((f) => f.rate)).toEqual([TAXA_VOZ, TAXA_VOZ_DEVAGAR, TAXA_VOZ]);
    expect(AudioFalso.criados).toHaveLength(0);
  });

  it('depois de 15 segundos, repetir volta a ser um toque normal', () => {
    vozes = [{ name: 'Luciana', lang: 'pt-BR', voiceURI: 'pt' }];
    const tocador = novo();
    tocador.tocar('Onde fica?', 'pt-BR');
    relogio += REPETIR_DEVAGAR_MS + 1;
    tocador.tocar('Onde fica?', 'pt-BR');
    expect(faladas.map((f) => f.rate)).toEqual([TAXA_VOZ, TAXA_VOZ]);
  });

  it('frase longa vira pedaços, tocados um atrás do outro no mesmo elemento', async () => {
    const longa = `${'Necesito una base de maquillaje de tono claro, de subtono frío. '.repeat(4)}Gracias.`;
    expect(longa.length).toBeGreaterThan(200);
    const tocador = novo();
    tocador.tocar(longa, 'es-ES');

    // Nada de "sem internet" falso: o texto longo foi aceito.
    expect(semSom).toHaveLength(0);
    expect(AudioFalso.criados).toHaveLength(1);
    const audio = AudioFalso.criados[0];
    const primeiro = new URL(audio.src).searchParams.get('q')!;
    expect(primeiro.length).toBeLessThanOrEqual(PEDACO_TTS);

    await act(async () => { await Promise.resolve(); });
    act(() => audio.disparar('ended'));
    const segundo = new URL(audio.src).searchParams.get('q')!;
    expect(segundo).not.toBe(primeiro);
    expect(audio.tocadas).toBe(2);
  });

  it('o estado vai de carregando a falando e volta a parado', async () => {
    const tocador = novo();
    tocador.tocar('Hola', 'es-ES');
    expect(lerAudio()).toEqual({ status: 'carregando', texto: 'Hola' });
    await act(async () => { await Promise.resolve(); });
    expect(lerAudio()).toEqual({ status: 'falando', texto: 'Hola' });
    act(() => AudioFalso.criados[0].disparar('ended'));
    expect(lerAudio().status).toBe('parado');
  });

  it('diz o motivo certo: sem rede é sem rede, falha com rede é falha', async () => {
    online = false;
    novo().tocar('Hola', 'es-ES');
    expect(semSom.at(-1)?.motivo).toBe('sem-rede');

    online = true;
    AudioFalso.falhar = true;
    novo().tocar('Adiós', 'es-ES');
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(semSom.at(-1)).toEqual({ texto: 'Adiós', motivo: 'falhou' });
  });

  it('tocar de novo depois de uma falha é nova tentativa, não pedido de devagar', async () => {
    const tocador = novo();
    AudioFalso.falhar = true;
    tocador.tocar('Hola', 'es-ES');
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(semSom).toHaveLength(1);

    // A rede voltou; ela toca de novo logo em seguida. Ainda não ouviu nada.
    AudioFalso.falhar = false;
    relogio += 2000;
    tocador.tocar('Hola', 'es-ES');
    const audio = AudioFalso.criados.at(-1)!;
    expect(audio.playbackRate).toBe(1);
    // E não reaproveita o elemento que falhou: baixa de novo.
    expect(AudioFalso.criados).toHaveLength(2);
  });
});

describe('partirParaTts', () => {
  it('frase curta volta inteira', () => {
    expect(partirParaTts('  ¿Dónde está   la llave?  ')).toEqual(['¿Dónde está la llave?']);
  });

  it('frase longa: pedaços dentro do limite, sem perder nada', () => {
    const longa = 'Busco una base de maquillaje de tono claro, de subtono frío, de cobertura media, con acabado mate, para piel grasa, por favor. ¿Tiene algo parecido pero un poco más oscuro? Muchas gracias.';
    const pedacos = partirParaTts(longa, 80);
    expect(pedacos.length).toBeGreaterThan(1);
    for (const p of pedacos) expect(p.length).toBeLessThanOrEqual(80);
    expect(pedacos.join(' ')).toBe(longa);
  });

  it('não corta número decimal', () => {
    const pedacos = partirParaTts(`${'palabra '.repeat(8)}Son 4,20 euros y 3.5 litros. ${'otra '.repeat(8)}`, 40);
    expect(pedacos.some((p) => p.includes('4,20'))).toBe(true);
    expect(pedacos.some((p) => p.includes('3.5'))).toBe(true);
  });
});

// ------------------------------------------------------------ cartão e tela Mostrar

const Cartao = ({ onSpeak = vi.fn() }: { onSpeak?: (s: string) => void }) => (
  <PhraseCard theme={tema} phrase="Me duele la cabeza." alt="Dói a cabeça." Listen={SpeakerIcon} listenLabel={t('locListen')} onSpeak={onSpeak} />
);

describe('o cartão da frase', () => {
  it('pulsa e marca aria-busy só enquanto a SUA frase sai', () => {
    render(<Cartao />);
    const ouvir = screen.getByRole('button', { name: t('locListen') });
    expect(ouvir.getAttribute('aria-busy')).toBe('false');

    act(() => { definirAudio('carregando', 'Me duele la cabeza.'); });
    expect(ouvir.getAttribute('aria-busy')).toBe('true');
    expect(ouvir.querySelector('svg')?.getAttribute('class')).toContain('animate-pulse');

    act(() => { definirAudio('falando', 'Outra frase.'); });
    expect(ouvir.getAttribute('aria-busy')).toBe('false');
  });

  it('a tela Mostrar abre com a frase e a glosa, e fecha com Esc', async () => {
    const user = userEvent.setup();
    render(<Cartao />);

    await user.click(screen.getByRole('button', { name: t('show') }));
    const tela = await screen.findByRole('dialog', { name: t('showTitle') });
    expect(tela.getAttribute('aria-modal')).toBe('true');
    expect(tela.textContent).toContain('Me duele la cabeza.');
    expect(tela.textContent).toContain('Dói a cabeça.');
    await waitFor(() => expect(tela.contains(document.activeElement)).toBe(true));

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: t('showTitle') })).toBeNull());
  });

  it('a tela Mostrar se anuncia aberta, para "Mostrar a frase" não abrir outra igual por cima', async () => {
    const user = userEvent.setup();
    render(<Cartao />);
    expect(fraseJaNaTela('Me duele la cabeza.')).toBe(false);

    await user.click(screen.getByRole('button', { name: t('show') }));
    await screen.findByRole('dialog', { name: t('showTitle') });
    expect(fraseJaNaTela('Me duele la cabeza.')).toBe(true);
    expect(fraseJaNaTela('Outra frase.')).toBe(false);

    await user.click(screen.getByRole('button', { name: t('showClose') }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: t('showTitle') })).toBeNull());
    expect(fraseJaNaTela('Me duele la cabeza.')).toBe(false);
  });

  it('o alto-falante da tela Mostrar fala a mesma frase', async () => {
    const onSpeak = vi.fn();
    const user = userEvent.setup();
    render(<Cartao onSpeak={onSpeak} />);
    await user.click(screen.getByRole('button', { name: t('show') }));
    const tela = await screen.findByRole('dialog', { name: t('showTitle') });
    await user.click(within(tela).getByRole('button', { name: t('locListen') }));
    expect(onSpeak).toHaveBeenCalledWith('Me duele la cabeza.');
  });

  it('com duas camadas abertas, o Esc fecha só a de cima', async () => {
    const user = userEvent.setup();
    const fechouAtras = vi.fn();
    const Atras = () => {
      const ref = useDialog(true, fechouAtras);
      return <div ref={ref} role="dialog" aria-label="atrás"><button>atrás</button></div>;
    };
    render(<><Atras /><Cartao /></>);
    await user.click(screen.getByRole('button', { name: t('show') }));
    await screen.findByRole('dialog', { name: t('showTitle') });

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: t('showTitle') })).toBeNull());
    expect(fechouAtras).not.toHaveBeenCalled();
  });
});

// ------------------------------------------------------------ moldura

describe('a moldura dos módulos', () => {
  const Moldura = ({ dica }: { dica?: string }) => (
    <ModuleShell
      title="Teste" theme={tema} t={t} nativeCountry={BR} targetCountry={ES}
      onGoHome={vi.fn()} onOpenLanguageModal={vi.fn()} onOpenShare={vi.fn()}
      dica={dica}
    >
      <p>conteúdo</p>
    </ModuleShell>
  );

  it('a dica do módulo é o primeiro texto da rolagem depois da linha de gesto', () => {
    render(<Moldura dica="Para dizer o que você sente." />);
    const main = document.querySelector('main')!;
    const textos = [...main.querySelectorAll('p')].map((p) => p.textContent);
    expect(textos).toEqual([t('gestureHint'), 'Para dizer o que você sente.', 'conteúdo']);
  });

  it('a linha de gesto some quando a pessoa aprende a tocar no alto-falante', () => {
    render(<Moldura />);
    expect(screen.getByText(t('gestureHint'))).toBeTruthy();
    act(() => { marcarGestoAprendido(); });
    expect(screen.queryByText(t('gestureHint'))).toBeNull();
    expect(localStorage.getItem(GESTO_KEY)).toBe('1');
  });

  it('onde a banda não tem frase, a linha de gesto não promete que ela muda', () => {
    render(
      <ModuleShell
        title="Teste" theme={tema} t={t} nativeCountry={BR} targetCountry={ES}
        onGoHome={vi.fn()} onOpenLanguageModal={vi.fn()} onOpenShare={vi.fn()}
        gesto={false}
      >
        <p>conteúdo</p>
      </ModuleShell>,
    );
    expect(screen.queryByText(t('gestureHint'))).toBeNull();
  });

  it('sem dica, nada a mais aparece', () => {
    localStorage.setItem(GESTO_KEY, '1');
    render(<Moldura />);
    const textos = [...document.querySelectorAll('main p')].map((p) => p.textContent);
    expect(textos).toEqual(['conteúdo']);
  });
});

describe('Sem som agora — o passo de instalar é só o do aparelho', () => {
  it('um sistema de cada vez', () => {
    expect(passosDoAparelho('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 5)).toEqual(['voiceMissingIOS']);
    expect(passosDoAparelho('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5)).toEqual(['voiceMissingIOS']);
    expect(passosDoAparelho('Mozilla/5.0 (Linux; Android 14; SM-A145)', 5)).toEqual(['voiceMissingAndroid']);
    expect(passosDoAparelho('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 0)).toEqual(['voiceMissingWindows']);
  });
});
