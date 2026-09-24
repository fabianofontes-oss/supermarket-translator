import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LocationModule from '../modules/LocationModule';
import {
  LOC_OBJECTS, LOC_RELATIONS, LOC_START, SUPPORTED_LANGS,
  locObjectByKey, locRelationByKey, buildSentence, buildQuestion, nounPhrase,
} from '../modules/location/data/locationData';
import { COUNTRIES } from '../constants';
import { translations } from '../translations';
import { GESTO_KEY } from '../utils/audioState';

/**
 * Módulo "Onde está?".
 *
 * Tranca as escolhas da auditoria de usabilidade de 23/09/2026:
 *
 *  1. A primeira frase é algo que ela diria hoje ("La llave está debajo del
 *     sofá"), e não o exercício de escola da bola e da caixa.
 *  2. A tela segue a ordem da frase: a coisa, o lugar, a referência.
 *  3. O botão da pergunta é um alto-falante, não um "?" que parece "ajuda".
 *  4. Piso de 14px em tudo o que ela lê.
 *
 * E, de quebra, a gramática deste módulo, que nenhum outro teste cobria.
 */

const t = (key: string) => (translations['pt-BR'] as Record<string, string>)[key] || key;
const pais = (code: string) => COUNTRIES.find((c) => c.code === code)!;
const TEMA = { color: 'bg-blue-600', textColor: 'text-blue-600 dark:text-blue-300', hex: '#2563eb', borderColor: 'border-blue-600' };
const ARABE = /[؀-ۿ]/;

const montar = (opts: { destino?: string; voiceStatus?: 'ok' | 'missing' | 'unknown' } = {}) => {
  const handlePlayAudio = vi.fn();
  render(createElement(LocationModule, {
    nativeCountry: pais('br'),
    targetCountry: pais(opts.destino ?? 'es'),
    t,
    theme: TEMA,
    onGoHome: vi.fn(),
    onOpenLanguageModal: vi.fn(),
    onOpenShare: vi.fn(),
    handlePlayAudio,
    voiceStatus: opts.voiceStatus,
  }));
  return { handlePlayAudio };
};

beforeEach(() => {
  localStorage.clear();
  // A linha de gesto da moldura não é assunto daqui.
  localStorage.setItem(GESTO_KEY, '1');
});
afterEach(() => cleanup());

// ------------------------------------------------------------ primeira frase

describe('a primeira frase é da vida dela', () => {
  const chave = locObjectByKey(LOC_START.subject);
  const embaixo = locRelationByKey(LOC_START.relation);
  const sofa = locObjectByKey(LOC_START.reference);

  it('"a chave está embaixo do sofá" nos destinos abertos e no português', () => {
    expect(buildSentence('es', chave, embaixo, sofa)).toBe('La llave está debajo del sofá.');
    expect(buildSentence('en', chave, embaixo, sofa)).toBe('The key is under the sofa.');
    expect(buildSentence('fr', chave, embaixo, sofa)).toBe('La clé est sous le canapé.');
    expect(buildSentence('pt', chave, embaixo, sofa)).toBe('A chave está embaixo do sofá.');
    expect(buildQuestion('es', chave)).toBe('¿Dónde está la llave?');
  });

  it('o módulo abre nela, com a glosa em português', () => {
    montar();
    expect(screen.getByText('La llave está debajo del sofá.')).toBeTruthy();
    expect(screen.getByText('A chave está embaixo do sofá.')).toBeTruthy();
    expect(screen.getByText('¿Dónde está la llave?')).toBeTruthy();
    expect(screen.getByText('Onde está a chave?')).toBeTruthy();
  });

  it('as coisas de casa vêm primeiro, e bola e caixa por último', () => {
    expect(LOC_OBJECTS.map((o) => o.key)).toEqual([
      'key', 'phone', 'bag', 'cup', 'sofa', 'bed', 'chair', 'door', 'book', 'box', 'car', 'cat', 'dog', 'ball',
    ]);
  });

  it('chave inexistente estoura em vez de abrir a tela vazia', () => {
    expect(() => locObjectByKey('nada')).toThrow();
    expect(() => locRelationByKey('nada')).toThrow();
  });
});

// ------------------------------------------------------------ tela

describe('a tela', () => {
  it('cabeçalho curto e a dica do módulo', () => {
    montar();
    expect(screen.getByRole('heading', { level: 1, name: t('locTitle') })).toBeTruthy();
    expect(screen.getByText(t('hintLocation'))).toBeTruthy();
  });

  it('segue a ordem da frase: a coisa, o lugar, a referência', () => {
    montar();
    const titulos = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent ?? '');
    expect(titulos).toHaveLength(3);
    expect(titulos[0].startsWith(t('locObject'))).toBe(true);
    expect(titulos[1]).toBe(t('locRelation'));
    expect(titulos[2].startsWith(t('locReference'))).toBe(true);
  });

  it('a escolha aparece marcada para o leitor de tela', () => {
    montar();
    const pressionados = screen.getAllByRole('button', { pressed: true }).map((b) => b.textContent);
    // A chave (a coisa), embaixo (o lugar) e o sofá (a referência). O emoji
    // entra no textContent, mas não no nome acessível (`aria-hidden`).
    expect(pressionados).toEqual([
      `${locObjectByKey('key').emoji}llavechave`,
      'debajoembaixo',
      `${locObjectByKey('sofa').emoji}sofásofá`,
    ]);
    expect(screen.getByRole('button', { pressed: true, name: 'llave chave' })).toBeTruthy();
  });

  it('trocar a coisa muda a frase e a pergunta', async () => {
    const user = userEvent.setup();
    montar();
    const [fileiraCoisa] = screen.getAllByRole('heading', { level: 2 });
    const secao = fileiraCoisa.closest('section')!;
    await user.click(within(secao).getByRole('button', { name: /teléfono/ }));
    expect(screen.getByText('El teléfono está debajo del sofá.')).toBeTruthy();
    expect(screen.getByText('¿Dónde está el teléfono?')).toBeTruthy();
  });
});

// ------------------------------------------------------------ pergunta

describe('o botão da pergunta é um alto-falante', () => {
  it('fala a pergunta no idioma de destino', async () => {
    const user = userEvent.setup();
    const { handlePlayAudio } = montar();
    await user.click(screen.getByRole('button', { name: t('locAsk') }));
    expect(handlePlayAudio).toHaveBeenCalledWith('¿Dónde está la llave?', 'es-ES');
  });

  it('usa o mesmo desenho do alto-falante da frase, e não um "?"', () => {
    montar();
    const frase = screen.getByRole('button', { name: t('locListen') }).querySelector('svg')!;
    const pergunta = screen.getByRole('button', { name: t('locAsk') }).querySelector('svg')!;
    expect(pergunta.innerHTML).toBe(frase.innerHTML);
  });

  it('sem voz, os dois viram o alto-falante cortado juntos', () => {
    montar({ voiceStatus: 'missing' });
    const semVoz = (base: string) => `${base} — ${t('voiceMissingLabel')}`;
    const frase = screen.getByRole('button', { name: semVoz(t('locListen')) }).querySelector('svg')!;
    const pergunta = screen.getByRole('button', { name: semVoz(t('locAsk')) }).querySelector('svg')!;
    expect(pergunta.innerHTML).toBe(frase.innerHTML);
  });
});

// ------------------------------------------------------------ letra

describe('piso de 14px no que ela lê', () => {
  const fonte = readFileSync(join(__dirname, '..', 'modules', 'LocationModule.tsx'), 'utf8');

  it('nenhuma letra miúda no módulo', () => {
    // O português das posições estava em 11px, o dos objetos em 10px e os
    // títulos em 12px. Emoji em `text-3xl` não entra: é desenho, não texto.
    expect(fonte).not.toMatch(/text-\[(9|10|11|12|13)px\]/);
    expect(fonte).not.toMatch(/\btext-xs\b/);
    expect(fonte).not.toMatch(/opacity-70/);
  });

  it('o português embaixo de cada botão tem 14px', () => {
    montar();
    for (const palavra of ['embaixo', 'à esquerda', 'chave', 'sofá']) {
      for (const el of screen.getAllByText(palavra)) {
        if (el.closest('button')) expect(el.className, palavra).toMatch(/\btext-sm\b/);
      }
    }
  });

  it('o cartão de objeto tem 96px: três inteiros e um cortado a 390px', () => {
    // 16 + 3×(96+8) = 328, então o quarto aparece pela metade — o sinal de
    // "tem mais para o lado". Com 84px eram quatro inteiros rente à borda.
    expect(fonte).toContain('w-[96px]');
    expect(fonte).not.toContain('w-[84px]');
  });
});

// ------------------------------------------------------------ gramática

describe('gramática do "Onde está?"', () => {
  it('toda combinação preenche o caso pedido pela preposição (uk, lt)', () => {
    for (const lang of SUPPORTED_LANGS)
      for (const s of LOC_OBJECTS)
        for (const r of LOC_RELATIONS)
          for (const ref of LOC_OBJECTS) {
            if (s === ref) continue;
            const frase = buildSentence(lang, s, r, ref);
            expect(frase, `${lang}/${s.key}/${r.key}/${ref.key}`).not.toMatch(/[{}]/);
          }
  });

  it('o lituano tem acusativo para todo objeto, porque "priešais" o pede', () => {
    for (const o of LOC_OBJECTS) expect(o.names.lt.cases?.acc, o.key).toBeTruthy();
  });

  it('árabe só no árabe', () => {
    for (const lang of SUPPORTED_LANGS) {
      if (lang === 'ar') continue;
      for (const o of LOC_OBJECTS) expect(nounPhrase(lang, o), `${lang}/${o.key}`).not.toMatch(ARABE);
      for (const r of LOC_RELATIONS) {
        expect(r.phrases[lang], `${lang}/${r.key}`).not.toMatch(ARABE);
        expect(r.labels[lang], `${lang}/${r.key}`).not.toMatch(ARABE);
      }
    }
  });

  it('as contrações românicas', () => {
    const ao = locRelationByKey('nextTo');
    const perto = locRelationByKey('near');
    const chave = locObjectByKey('key');
    expect(buildSentence('es', chave, ao, locObjectByKey('car'))).toBe('La llave está al lado del coche.');
    expect(buildSentence('fr', chave, perto, locObjectByKey('bed'))).toBe('La clé est près du lit.');
    expect(buildSentence('it', chave, perto, locObjectByKey('bed'))).toBe('La chiave è vicino al letto.');
    expect(buildSentence('pt', chave, ao, locObjectByKey('door'))).toBe('A chave está ao lado da porta.');
  });
});
