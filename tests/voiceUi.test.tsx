import React from 'react';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { translations } from '../translations';

/**
 * O caminho do áudio, do toque até o som.
 *
 * A regra que estes testes trancam é a região: texto do Brasil nunca sai na voz
 * de Portugal, nem por acidente nem por fallback. Quando o aparelho não tem a
 * voz da região certa, o áudio vem da rede com o locale completo; sem rede, o
 * app cala e explica.
 */

/**
 * Estes testes são da regra de voz, e precisam de destinos que o recorte do
 * lançamento desativa (Brasil, Itália). O recorte tem teste próprio, em
 * `lancamento.test.tsx`; aqui ele fica aberto.
 */
vi.mock('../lancamento', () => ({
  origemAberta: () => true,
  destinoAberto: () => true,
  moduloFechado: () => false,
}));

const t = (key: string) => (translations['pt-BR'] as Record<string, string>)[key] || key;
const semVoz = (base: string) => `${base} — ${t('voiceMissingLabel')}`;

interface FakeVoice { name: string; lang: string; voiceURI: string }
const voice = (name: string, lang: string): FakeVoice => ({ name, lang, voiceURI: `${name}|${lang}` });

/** O aparelho da captura do dono: duas vozes, nenhuma brasileira. */
const APARELHO_DO_DONO = [voice('espanhol Estados Unidos', 'es-US'), voice('inglês Estados Unidos', 'en-US')];

let voices: FakeVoice[] = [];
let faladas: { text: string; lang: string; voice: FakeVoice | null }[] = [];
let pedidas: string[] = [];
/** Se o `play()` do áudio online resolve ou rejeita. */
let redeFunciona = true;

const setOnline = (valor: boolean) =>
  Object.defineProperty(navigator, 'onLine', { get: () => valor, configurable: true });

beforeAll(async () => {
  Element.prototype.scrollIntoView = vi.fn();
  // O primeiro `import()` do módulo adiado paga a transformação do arquivo, e
  // isso caía dentro do tempo do primeiro teste: 2,7 s sozinho, mais de 5 s com
  // a suíte inteira em paralelo. Aquecido aqui, o custo sai da conta do teste;
  // o `lazy` do App continua passando pelo Suspense do mesmo jeito.
  await import('../modules/LocationModule');
});

beforeEach(() => {
  window.matchMedia = ((): MediaQueryList => ({
    matches: false, media: '', onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent: () => false,
  } as unknown as MediaQueryList)) as unknown as typeof window.matchMedia;

  faladas = [];
  pedidas = [];
  redeFunciona = true;
  setOnline(true);

  (window as unknown as Record<string, unknown>).speechSynthesis = {
    getVoices: () => voices,
    speak: (u: { text: string; lang: string; voice: FakeVoice | null }) => { faladas.push(u); },
    cancel: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  (globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance = class {
    text: string; lang = ''; rate = 1; voice: FakeVoice | null = null;
    constructor(text: string) { this.text = text; }
  };

  // `Audio` de mentira: registra o endereço pedido e simula sucesso ou falha.
  (globalThis as unknown as Record<string, unknown>).Audio = class {
    src: string;
    constructor(src: string) { this.src = src; pedidas.push(src); }
    addEventListener() {}
    pause() {}
    play() { return redeFunciona ? Promise.resolve() : Promise.reject(new Error('rede')); }
  };

  localStorage.clear();
  localStorage.setItem('nativeCountry', JSON.stringify('br'));
});

afterEach(() => cleanup());

const abrirModulo = async (user: ReturnType<typeof userEvent.setup>) => {
  render(<App />);
  await user.click(await screen.findByText(t('moduleLocation')));
  // O módulo é um pedaço adiado. Com a suíte inteira rodando em paralelo, o
  // import passava de 1s de vez em quando e o teste caía por tempo, não por
  // defeito — daí a folga.
  await waitFor(
    () => expect(screen.getAllByRole('button', { name: new RegExp(`^${t('locListen')}`) }).length).toBeGreaterThan(0),
    { timeout: 5000 },
  );
};

describe('a regra da região', () => {
  it('com pt-PT instalada e destino Brasil, NUNCA fala com a voz portuguesa', async () => {
    voices = [voice('Joana', 'pt-PT')];
    localStorage.setItem('targetCountry', JSON.stringify('br'));
    const user = userEvent.setup();
    await abrirModulo(user);

    await user.click(screen.getByRole('button', { name: t('locListen') }));

    // Nenhuma fala do sistema saiu — e muito menos com a voz de Portugal.
    expect(faladas.map((f) => f.voice?.lang)).not.toContain('pt-PT');
    // O áudio foi buscado na rede, com o locale brasileiro.
    expect(pedidas).toHaveLength(1);
    expect(pedidas[0]).toContain('tl=pt-BR');
  });

  it('com es-US instalada e destino Espanha, busca o castelhano na rede', async () => {
    voices = APARELHO_DO_DONO;
    localStorage.setItem('targetCountry', JSON.stringify('es'));
    const user = userEvent.setup();
    await abrirModulo(user);

    await user.click(screen.getByRole('button', { name: t('locListen') }));

    expect(faladas).toHaveLength(0);
    expect(pedidas[0]).toContain('tl=es-ES');
  });
});

describe('voz da região exata instalada', () => {
  it('fala pelo aparelho e não toca na rede', async () => {
    voices = [voice('Luciana', 'pt-BR'), voice('Joana', 'pt-PT')];
    localStorage.setItem('targetCountry', JSON.stringify('br'));
    const user = userEvent.setup();
    await abrirModulo(user);

    await user.click(screen.getByRole('button', { name: t('locListen') }));

    expect(pedidas).toHaveLength(0);
    expect(faladas).toHaveLength(1);
    expect(faladas[0].voice!.lang).toBe('pt-BR');
    expect(faladas[0].lang).toBe('pt-BR');
  });
});

describe('sem voz da região e sem internet', () => {
  beforeEach(() => {
    voices = APARELHO_DO_DONO;
    setOnline(false);
    localStorage.setItem('targetCountry', JSON.stringify('it'));
  });

  it('o botão já nasce indisponível', async () => {
    const user = userEvent.setup();
    await abrirModulo(user);

    expect(screen.getByRole('button', { name: semVoz(t('locListen')) })).toBeTruthy();
    expect(screen.queryByRole('button', { name: t('locListen') })).toBeNull();
  });

  it('o toque não fala, não vai à rede, e abre o aviso', async () => {
    const user = userEvent.setup();
    await abrirModulo(user);

    await user.click(screen.getByRole('button', { name: semVoz(t('locListen')) }));

    expect(faladas).toHaveLength(0);
    expect(pedidas).toHaveLength(0);

    const aviso = await screen.findByRole('dialog', { name: t('voiceMissingTitle') });
    // Primeiro o que fazer agora (mostrar a tela), depois o motivo verdadeiro.
    expect(aviso.textContent).toContain(t('voiceShowScreen'));
    expect(aviso.textContent).toContain(t('voiceNoNetwork'));
    expect(aviso.textContent).not.toContain(t('voiceFailed'));
    // Código de locale não diz nada a quem usa o app: saiu da tela.
    expect(aviso.textContent).not.toContain('it-IT');
  });
});

describe('rede falhando', () => {
  it('cai para o aviso, e nunca para uma voz de outra região', async () => {
    voices = APARELHO_DO_DONO;
    redeFunciona = false;
    localStorage.setItem('targetCountry', JSON.stringify('it'));
    const user = userEvent.setup();
    await abrirModulo(user);

    await user.click(screen.getByRole('button', { name: t('locListen') }));

    expect(pedidas).toHaveLength(1);
    const aviso = await screen.findByRole('dialog', { name: t('voiceMissingTitle') });
    expect(faladas).toHaveLength(0);
    // Com rede, a culpa não é da internet: a folha antiga dizia "sem internet"
    // aqui também, e a pessoa ia desligar e ligar o wi-fi à toa.
    expect(aviso.textContent).toContain(t('voiceFailed'));
    expect(aviso.textContent).not.toContain(t('voiceNoNetwork'));
  });

  it('"Mostrar a frase" abre a tela cheia com a frase que falhou', async () => {
    voices = APARELHO_DO_DONO;
    redeFunciona = false;
    localStorage.setItem('targetCountry', JSON.stringify('it'));
    const user = userEvent.setup();
    await abrirModulo(user);

    await user.click(screen.getByRole('button', { name: t('locListen') }));
    const frase = new URL(pedidas[0]).searchParams.get('q')!;
    await screen.findByRole('dialog', { name: t('voiceMissingTitle') });

    await user.click(screen.getByRole('button', { name: t('voiceShowPhrase') }));

    const tela = await screen.findByRole('dialog', { name: t('showTitle') });
    expect(tela.textContent).toContain(frase);
    await waitFor(() => expect(screen.queryByRole('dialog', { name: t('voiceMissingTitle') })).toBeNull());
  });
});

describe('o gesto de ouvir', () => {
  it('o primeiro toque num alto-falante apaga a linha que ensina o gesto', async () => {
    voices = [voice('Luciana', 'pt-BR')];
    localStorage.setItem('targetCountry', JSON.stringify('br'));
    const user = userEvent.setup();
    await abrirModulo(user);

    expect(screen.getByText(t('gestureHint'))).toBeTruthy();
    await user.click(screen.getByRole('button', { name: t('locListen') }));

    expect(localStorage.getItem('aquisediz:gestoAprendido')).toBe('1');
    expect(screen.queryByText(t('gestureHint'))).toBeNull();
  });
});

describe('motor sem lista de vozes', () => {
  it('offline, fala definindo só o lang e deixa o sistema escolher', async () => {
    // Lista vazia é comum no Android: não há prova de voz errada, e recusar
    // falar aqui foi a regressão que apagou o áudio no aparelho do dono.
    voices = [];
    setOnline(false);
    localStorage.setItem('targetCountry', JSON.stringify('br'));
    const user = userEvent.setup();
    await abrirModulo(user);

    await user.click(screen.getByRole('button', { name: t('locListen') }));

    expect(faladas).toHaveLength(1);
    expect(faladas[0].lang).toBe('pt-BR');
    expect(faladas[0].voice).toBeNull();
    expect(screen.queryByRole('dialog', { name: t('voiceMissingTitle') })).toBeNull();
  });
});
