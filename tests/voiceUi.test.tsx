import React from 'react';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { translations } from '../translations';

/**
 * O comportamento do botão de áudio quando o aparelho não tem a voz do destino.
 *
 * O defeito relatado: destino Itália, texto italiano, voz americana. Aqui o app
 * inteiro roda contra um motor TTS falso, e a garantia é dupla — o botão avisa
 * antes do toque, e o toque não chama `speak`. Testar só `pickVoice` provaria a
 * regra; isto prova que a regra chegou na tela.
 */

const t = (key: string) => (translations['pt-BR'] as Record<string, string>)[key] || key;
/** Nome acessível do botão de áudio quando falta a voz: ação + motivo. */
const semVoz = (base: string) => `${base} — ${t('voiceMissingLabel')}`;

interface FakeVoice { name: string; lang: string; voiceURI: string }
const voice = (name: string, lang: string): FakeVoice => ({ name, lang, voiceURI: `${name}|${lang}` });

const SEM_ITALIANO = [voice('Microsoft Daniel', 'pt-BR'), voice('Microsoft David', 'en-US'), voice('Google español', 'es-ES')];
const COM_ITALIANO = [...SEM_ITALIANO, voice('Microsoft Elsa', 'it-IT')];

let voices: FakeVoice[] = [];
let speak: ReturnType<typeof vi.fn>;
let faladas: { text: string; lang: string; voice: FakeVoice | null }[] = [];

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  // Função simples, não `vi.fn()`: `restoreMocks: true` zeraria a implementação
  // entre os testes, e jsdom não tem `matchMedia` para cair de volta.
  window.matchMedia = ((): MediaQueryList => ({
    matches: false, media: '', onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent: () => false,
  } as unknown as MediaQueryList)) as unknown as typeof window.matchMedia;

  faladas = [];
  speak = vi.fn((u: { text: string; lang: string; voice: FakeVoice | null }) => { faladas.push(u); });

  const ouvintes = new Set<() => void>();
  (window as unknown as Record<string, unknown>).speechSynthesis = {
    getVoices: () => voices,
    speak,
    cancel: vi.fn(),
    addEventListener: (_: string, fn: () => void) => { ouvintes.add(fn); },
    removeEventListener: (_: string, fn: () => void) => { ouvintes.delete(fn); },
  };
  (globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance = class {
    text: string; lang = ''; rate = 1; voice: FakeVoice | null = null;
    constructor(text: string) { this.text = text; }
  };

  localStorage.clear();
  // "Estou em" = Itália: é o caso do relato.
  localStorage.setItem('targetCountry', JSON.stringify('it'));
  localStorage.setItem('nativeCountry', JSON.stringify('br'));
});

afterEach(() => cleanup());

/** Abre "Onde está?", um módulo generativo — não depende do catálogo. */
const abrirModuloComAudio = async (user: ReturnType<typeof userEvent.setup>) => {
  render(<App />);
  await user.click(await screen.findByText(t('moduleLocation')));
  // O módulo é lazy: espera o chunk resolver antes de procurar o botão.
  await waitFor(() => expect(screen.getByRole('heading', { name: t('moduleLocation') })).toBeTruthy());
};

describe('sem voz compatível no aparelho', () => {
  beforeEach(() => { voices = SEM_ITALIANO; });

  it('o botão de ouvir já nasce indisponível, com nome traduzido', async () => {
    const user = userEvent.setup();
    await abrirModuloComAudio(user);

    const botao = screen.getByRole('button', { name: semVoz(t('locListen')) });
    expect(botao).toBeTruthy();
    expect(botao.getAttribute('title')).toBe(semVoz(t('locListen')));
    // O rótulo normal não pode estar em lugar nenhum: seria promessa falsa.
    expect(screen.queryByRole('button', { name: t('locListen') })).toBeNull();
  });

  it('o toque não fala e abre o aviso', async () => {
    const user = userEvent.setup();
    await abrirModuloComAudio(user);

    await user.click(screen.getByRole('button', { name: semVoz(t('locListen')) }));

    // A garantia central: nada foi falado, nem com voz de outro idioma.
    expect(speak).not.toHaveBeenCalled();

    const aviso = await screen.findByRole('dialog', { name: t('voiceMissingTitle') });
    expect(aviso).toBeTruthy();
    // O aviso diz QUAL voz falta, não só que faltou alguma.
    expect(aviso.textContent).toContain('it-IT');
    expect(aviso.textContent).toContain(t('voiceMissingAndroid'));
  });
});

describe('com voz compatível no aparelho', () => {
  beforeEach(() => { voices = COM_ITALIANO; });

  it('o botão volta ao normal e fala com a voz italiana', async () => {
    const user = userEvent.setup();
    await abrirModuloComAudio(user);

    const botao = screen.getByRole('button', { name: t('locListen') });
    expect(screen.queryByRole('button', { name: semVoz(t('locListen')) })).toBeNull();

    await user.click(botao);

    expect(speak).toHaveBeenCalledTimes(1);
    expect(faladas[0].lang).toBe('it-IT');
    expect(faladas[0].voice).not.toBeNull();
    expect(faladas[0].voice!.lang).toBe('it-IT');
    expect(faladas[0].text.length).toBeGreaterThan(0);
    // Nenhum aviso: o caminho feliz continua silencioso.
    expect(screen.queryByRole('dialog', { name: t('voiceMissingTitle') })).toBeNull();
  });
});
