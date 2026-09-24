import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import CafeModule from '../modules/CafeModule';
import {
  DRINKS, MODIFIERS, PORTIONS, CAFE_QUESTIONS,
  buildOrder, modsFor, vesselFor,
  type Text,
} from '../modules/cafe/data/cafeData';
import { SUPPORTED_LANGS, type LangCode } from '../modules/location/data/locationData';
import { translations } from '../translations';
import { COUNTRIES } from '../constants';

/**
 * Módulo Café e tapas.
 *
 * O que este arquivo tranca vem da auditoria de usabilidade de 23/09/2026: uma
 * brasileira recém-chegada, de óculos, em pé no balcão, com o garçom esperando.
 *
 *  1. Parte 1 — dados completos nos oito idiomas, a caña na frente das frases do
 *     bar, e nenhuma frase que concorde com o gênero de quem fala ("Soy
 *     vegetariano" ensinava a mulher a falar no masculino).
 *  2. Parte 2 — o pedido tem sentido: nada de "café solo con la leche fría" nem
 *     "café con hielo muy caliente"; e o desenho segue "en taza"/"en vaso".
 *  3. Parte 3 — a tela: o aviso fora da Espanha, o português legível, o ✓ nas
 *     opções que somam, a explicação das palavras sempre à vista.
 */

const raiz = join(__dirname, '..');
const ler = (f: string) => readFileSync(join(raiz, f), 'utf8');

/** Bloco árabe. Nenhuma outra língua pode conter isto. */
const ARABE = /[؀-ۿ]/;

const drinkBy = (k: string) => DRINKS.find((d) => d.key === k)!;
const modBy = (k: string) => MODIFIERS.find((m) => m.key === k)!;

// ------------------------------------------------------------------ dados

describe('PARTE 1 — dados completos, e nenhuma frase com o gênero de quem fala', () => {
  const textos: [string, Text][] = [
    ...DRINKS.flatMap((d) => [[`bebida:${d.key}`, d.names], [`pedido:${d.key}`, d.orders], [`nota:${d.key}`, d.descs]] as [string, Text][]),
    ...MODIFIERS.flatMap((m) => [[`mod:${m.key}`, m.labels], [`mod-texto:${m.key}`, m.texts]] as [string, Text][]),
    ...PORTIONS.flatMap((p) => [[`palavra:${p.key}`, p.names], [`palavra-nota:${p.key}`, p.descs]] as [string, Text][]),
    ...CAFE_QUESTIONS.map((q, i) => [`bar:${i}`, q] as [string, Text]),
  ];

  it('todo texto existe nos oito idiomas', () => {
    const faltando: string[] = [];
    for (const [tag, txt] of textos)
      for (const l of SUPPORTED_LANGS) if (!txt[l]?.trim()) faltando.push(`${tag}/${l}`);
    expect(faltando).toEqual([]);
  });

  it('só o árabe tem letra árabe', () => {
    const vazou: string[] = [];
    for (const [tag, txt] of textos)
      for (const l of SUPPORTED_LANGS) if (l !== 'ar' && ARABE.test(txt[l])) vazou.push(`${tag}/${l}`);
    expect(vazou).toEqual([]);
  });

  /**
   * Predicativo que concordaria com quem fala. Rede grossa, não analisador: pega o
   * que já esteve aqui ("Soy vegetariano", "Sono vegetariano", "Aš vegetaras",
   * "أنا نباتي") e o que viria a seguir no mesmo molde.
   */
  const CONCORDA_COM_QUEM_FALA: Partial<Record<LangCode, RegExp>> = {
    es: /\b(estoy|soy|me siento)\s+\p{L}+[oa]s?\b/iu,
    pt: /\b(estou|sou|fico|me sinto)\s+\p{L}+[oa]s?\b/iu,
    it: /\b(sono|mi sento)\s+\p{L}+[oa]\b/iu,
    fr: /\bje (suis|me sens)\b/iu,
    uk: /(^|\s)я\s+(?!не\s)\p{L}+/iu,
    lt: /(^|\s)(esu|jaučiuosi)(\s|$)|(^|\s)aš\s+(?!ne)\p{L}+(as|ė|a)(?=[\s.,!?]|$)/iu,
    ar: /أنا\s/u,
  };

  it('a rede pega o que já esteve aqui', () => {
    // Sem isto, uma regex quebrada deixaria o teste de baixo verde para sempre.
    expect(CONCORDA_COM_QUEM_FALA.es!.test('Soy vegetariano.')).toBe(true);
    expect(CONCORDA_COM_QUEM_FALA.pt!.test('Sou vegetariano.')).toBe(true);
    expect(CONCORDA_COM_QUEM_FALA.it!.test('Sono vegetariano.')).toBe(true);
    expect(CONCORDA_COM_QUEM_FALA.fr!.test('Je suis végétarien.')).toBe(true);
    expect(CONCORDA_COM_QUEM_FALA.uk!.test('Я вегетаріанець.')).toBe(true);
    expect(CONCORDA_COM_QUEM_FALA.lt!.test('Aš vegetaras.')).toBe(true);
    expect(CONCORDA_COM_QUEM_FALA.ar!.test('أنا نباتي.')).toBe(true);
    // E não pega a negação, que é a forma neutra.
    expect(CONCORDA_COM_QUEM_FALA.uk!.test("Я не їм ні м'яса, ні риби.")).toBe(false);
    expect(CONCORDA_COM_QUEM_FALA.lt!.test('Aš nevalgau nei mėsos, nei žuvies.')).toBe(false);
  });

  it('nenhuma frase do bar concorda com o gênero de quem fala', () => {
    const erradas: string[] = [];
    CAFE_QUESTIONS.forEach((q, i) => {
      for (const l of SUPPORTED_LANGS)
        if (CONCORDA_COM_QUEM_FALA[l]?.test(q[l])) erradas.push(`bar:${i}/${l}: ${q[l]}`);
    });
    expect(erradas).toEqual([]);
  });

  it('"vegetariano" saiu; fica o que ela não come', () => {
    const todas = CAFE_QUESTIONS.flatMap((q) => SUPPORTED_LANGS.map((l) => q[l]));
    expect(todas.filter((s) => /vegetar|végétar|вегетар|نباتي/iu.test(s))).toEqual([]);
    const semCarne = CAFE_QUESTIONS.find((q) => q.es === 'No como carne ni pescado.');
    expect(semCarne).toBeDefined();
    expect(semCarne!.pt).toBe('Não como carne nem peixe.');
  });

  it('a caña abre as frases do bar, pedida como se pede', () => {
    expect(CAFE_QUESTIONS[0].es).toBe('Una caña, por favor.');
    expect(CAFE_QUESTIONS[0].pt).toBe('Um chope pequeno, por favor.');
    expect(CAFE_QUESTIONS[0].fr).toBe("Un demi, s'il vous plaît.");
  });
});

// ---------------------------------------------------------------- pedido

describe('PARTE 2 — o pedido tem sentido, e o desenho concorda com a frase', () => {
  it('"con leche fría" só aparece onde a bebida tem leite', () => {
    const comLeiteFrio = DRINKS.filter((d) => modsFor(d).some((m) => m.key === 'coldMilk')).map((d) => d.key);
    expect(comLeiteFrio).toEqual(['cortado', 'conLeche', 'manchada', 'descafeinado']);
  });

  it('"templado" e "muy caliente" nunca no café con hielo', () => {
    const keys = modsFor(drinkBy('conHielo')).map((m) => m.key);
    expect(keys).not.toContain('warm');
    expect(keys).not.toContain('hot');
    // No resto continuam.
    for (const d of DRINKS.filter((x) => x.key !== 'conHielo'))
      expect(modsFor(d).map((m) => m.key), d.key).toEqual(expect.arrayContaining(['warm', 'hot']));
  });

  it('para llevar, sin azúcar, en taza e en vaso valem para todas', () => {
    for (const d of DRINKS)
      expect(modsFor(d).map((m) => m.key), d.key).toEqual(expect.arrayContaining(['takeaway', 'noSugar', 'cup', 'glass']));
  });

  it('buildOrder deixa de fora o que não vale para a bebida', () => {
    expect(buildOrder('es', drinkBy('solo'), [modBy('coldMilk')])).toBe('Un café solo, por favor.');
    expect(buildOrder('es', drinkBy('carajillo'), [modBy('coldMilk')])).toBe('Un carajillo, por favor.');
    expect(buildOrder('es', drinkBy('conHielo'), [modBy('hot')])).toBe('Un café con hielo, por favor.');
    expect(buildOrder('es', drinkBy('cortado'), [modBy('coldMilk')])).toBe('Un cortado con la leche fría, por favor.');
    expect(buildOrder('pt', drinkBy('cortado'), [modBy('cup')])).toBe('Um pingado na xícara, por favor.');
  });

  it('em nenhuma língua, com tudo marcado, o pedido sem sentido volta', () => {
    const ruins: string[] = [];
    for (const d of DRINKS) {
      const proibidos = MODIFIERS.filter((m) => !modsFor(d).includes(m));
      for (const l of SUPPORTED_LANGS) {
        const frase = buildOrder(l, d, MODIFIERS);
        for (const m of proibidos) if (frase.includes(m.texts[l].trim())) ruins.push(`${d.key}/${l}/${m.key}: ${frase}`);
        if (/\s{2}/.test(frase)) ruins.push(`${d.key}/${l}: espaço duplo`);
      }
    }
    expect(ruins).toEqual([]);
  });

  it('o recipiente segue "en taza"/"en vaso", senão o padrão da bebida', () => {
    for (const d of DRINKS) {
      expect(vesselFor(d, []), d.key).toBe(d.vessel);
      expect(vesselFor(d, ['cup']), d.key).toBe('cup');
      expect(vesselFor(d, ['glass', 'noSugar']), d.key).toBe('glass');
    }
  });
});

// ------------------------------------------------------------------- tela

const t = (k: string) => (translations['pt-BR'] as Record<string, string>)[k] || k;
const BR = COUNTRIES.find((c) => c.code === 'br')!;
const ES = COUNTRIES.find((c) => c.code === 'es')!;
const US = COUNTRIES.find((c) => c.code === 'us')!;
const FR = COUNTRIES.find((c) => c.code === 'fr')!;
const tema = { color: 'bg-amber-700', textColor: 'text-amber-700', hex: '#b45309', borderColor: 'border-amber-700' };

const montar = (targetCountry = ES) => {
  const handlePlayAudio = vi.fn();
  const r = render(createElement(CafeModule, {
    nativeCountry: BR,
    targetCountry,
    t,
    theme: tema,
    onGoHome: () => {},
    onOpenLanguageModal: () => {},
    onOpenShare: () => {},
    handlePlayAudio,
  }));
  return { ...r, handlePlayAudio };
};

/** O botão que contém este texto (o nome do café também aparece no cartão do copo, fora de botão). */
const botaoCom = (texto: string) =>
  screen.getAllByText(texto).map((e) => e.closest('button')).find(Boolean) as HTMLButtonElement;

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = ((): MediaQueryList => ({
    matches: false, media: '', onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent: () => false,
  } as unknown as MediaQueryList)) as unknown as typeof window.matchMedia;
});

afterEach(() => cleanup());

describe('PARTE 3 — a tela', () => {
  it('diz para que serve, e a primeira frase é um pedido de verdade', () => {
    montar();
    expect(screen.getByText(t('hintCafe'))).toBeTruthy();
    expect(screen.getByText('Un cortado, por favor.')).toBeTruthy();
    expect(screen.getByText('Um pingado, por favor.')).toBeTruthy();
  });

  it('na Espanha, nenhum aviso; fora dela, o aviso no topo, antes de tudo', () => {
    montar(ES);
    expect(screen.queryByText(t('cafeSpainOnly'))).toBeNull();
    cleanup();

    for (const destino of [US, FR]) {
      montar(destino);
      const aviso = screen.getByText(t('cafeSpainOnly'));
      const primeiroTitulo = document.querySelector('h2')!;
      expect(aviso.compareDocumentPosition(primeiroTitulo) & Node.DOCUMENT_POSITION_FOLLOWING, destino.code).toBeTruthy();
      cleanup();
    }
  });

  it('nos EUA a frase sai em inglês', () => {
    montar(US);
    expect(screen.getByText('A macchiato, please.')).toBeTruthy();
  });

  it('a ordem: cafés, como você quer, frases do bar, palavras do cardápio', () => {
    montar();
    const titulos = [...document.querySelectorAll('h2')].map((h) => h.textContent);
    expect(titulos).toEqual([t('cafeDrinks'), t('cafeHowYouWant'), t('cafePhrases'), t('cafePortions')]);
  });

  it('o destino em cima e o português embaixo, nos cafés e nas opções', () => {
    montar();
    for (const [es, pt] of [['cortado', 'pingado'], ['café solo', 'café expresso'], ['sin azúcar', 'sem açúcar']]) {
      const txt = botaoCom(es).textContent ?? '';
      expect(txt, es).toContain(pt);
      expect(txt.indexOf(es), es).toBeLessThan(txt.indexOf(pt));
    }
  });

  it('opção marcada ganha ✓ e aria-pressed; o café escolhido também é anunciado', () => {
    montar();
    const semAcucar = botaoCom('sin azúcar');
    expect(semAcucar.getAttribute('aria-pressed')).toBe('false');
    expect(semAcucar.textContent).not.toContain('✓');
    fireEvent.click(semAcucar);
    expect(semAcucar.getAttribute('aria-pressed')).toBe('true');
    expect(semAcucar.textContent).toContain('✓');
    expect(screen.getByText('Un cortado sin azúcar, por favor.')).toBeTruthy();
    expect(botaoCom('pingado').getAttribute('aria-pressed')).toBe('true');
  });

  it('"en taza" muda a frase, o desenho e a etiqueta juntos', () => {
    montar();
    // A etiqueta e o português da opção "en vaso" dizem os dois "no copo".
    expect(screen.getAllByText(t('cafeInGlass'))).toHaveLength(2);
    expect(screen.getAllByText(t('cafeInCup'))).toHaveLength(1);
    expect(document.querySelector('path[d^="M90 56"]')).toBeNull(); // sem asa: é copo

    fireEvent.click(botaoCom('en taza'));
    expect(screen.getByText('Un cortado en taza, por favor.')).toBeTruthy();
    expect(screen.getAllByText(t('cafeInCup'))).toHaveLength(2);
    expect(screen.getAllByText(t('cafeInGlass'))).toHaveLength(1);
    expect(document.querySelector('path[d^="M90 56"]')).not.toBeNull(); // a asa da xícara
  });

  it('trocar de café esconde o que não vale, sem apagar a escolha', () => {
    montar();
    fireEvent.click(botaoCom('con leche fría'));
    expect(screen.getByText('Un cortado con la leche fría, por favor.')).toBeTruthy();

    fireEvent.click(botaoCom('café solo'));
    expect(screen.getByText('Un café solo, por favor.')).toBeTruthy();
    expect(screen.queryByText('con leche fría')).toBeNull();

    fireEvent.click(botaoCom('cortado'));
    expect(screen.getByText('Un cortado con la leche fría, por favor.')).toBeTruthy();
    expect(botaoCom('con leche fría').getAttribute('aria-pressed')).toBe('true');
  });

  it('café con hielo não oferece templado nem muy caliente', () => {
    montar();
    fireEvent.click(botaoCom('café con hielo'));
    expect(screen.queryByText('templado')).toBeNull();
    expect(screen.queryByText('muy caliente')).toBeNull();
  });

  it('a explicação das palavras do cardápio está sempre à vista, sem abrir nada', () => {
    const { handlePlayAudio } = montar();
    for (const p of PORTIONS) expect(screen.getByText(p.descs.pt), p.key).toBeTruthy();
    expect(document.querySelector('[aria-expanded]')).toBeNull();

    fireEvent.click(botaoCom('la ración'));
    expect(handlePlayAudio).toHaveBeenCalledWith('la ración', 'es-ES');
  });

  it('a caña se pede pela frase, com som', () => {
    const { handlePlayAudio } = montar();
    fireEvent.click(botaoCom('Una caña, por favor.'));
    expect(handlePlayAudio).toHaveBeenCalledWith('Una caña, por favor.', 'es-ES');
  });

  it('nenhuma letra abaixo de 14px, e o português nunca apagado', () => {
    const fonte = ler('modules/CafeModule.tsx');
    expect(fonte).not.toMatch(/text-\[(9|10|11|12|13)px\]/);
    expect(fonte).not.toMatch(/\btext-xs\b/);
    expect(fonte).not.toMatch(/opacity-70/);
    // Três colunas espremiam "descafeinado de máquina" a 16px.
    expect(fonte).not.toContain('grid-cols-3');
  });

  it('toda chave que a tela usa existe nos oito idiomas', () => {
    const fonte = ler('modules/CafeModule.tsx');
    const usadas = [...new Set([...fonte.matchAll(/\bt\('([A-Za-z0-9_]+)'\)/g)].map((m) => m[1]))];
    expect(usadas.length).toBeGreaterThan(5);
    const blocos = ['en-US', 'pt-BR', 'es-ES', 'fr-FR', 'it-IT', 'uk-UA', 'ar-MA', 'lt-LT'];
    const faltando = blocos.flatMap((b) => usadas.filter((k) => !translations[b][k]).map((k) => `${b}/${k}`));
    expect(faltando).toEqual([]);
  });
});
