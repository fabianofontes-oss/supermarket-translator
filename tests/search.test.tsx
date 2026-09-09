import { describe, it, expect } from 'vitest';
import {
  MAX_SEARCH_RESULTS,
  MIN_SEARCH_LENGTH,
  matchesSearch,
  normalizeForSearch,
} from '../utils/searchText';
import { mapTranslationItem } from '../utils/itemHelpers';
import { PREPOPULATED_TRANSLATIONS } from '../data/catalog';
import { SUPERMARKET_CATEGORIES, PHARMACY_CATEGORIES, COUNTRIES } from '../constants';
import type { Category, Country, TranslationItem } from '../types';

/**
 * Busca dos módulos de catálogo.
 *
 * Reproduz a mesma pipeline do CatalogModule: índice montado com
 * `mapTranslationItem` (o resolvedor do card), casamento sobre texto
 * normalizado, mínimo de caracteres e teto de exibição.
 */

const BR = COUNTRIES.find((c) => c.code === 'br')!;
const ES = COUNTRIES.find((c) => c.code === 'es')!;
const UA = COUNTRIES.find((c) => c.code === 'ua')!;

/** Espelha `searchIndex` + `search` do CatalogModule. */
const buscar = (
  termoCru: string,
  categories: Category[] = SUPERMARKET_CATEGORIES,
  native: Country = BR,
  target: Country = ES,
) => {
  const entries: { item: TranslationItem; haystack: string }[] = [];
  for (const cat of Object.keys(PREPOPULATED_TRANSLATIONS)) {
    if (!categories.some((c) => c.name === cat)) continue;
    for (const sub of Object.keys(PREPOPULATED_TRANSLATIONS[cat])) {
      for (const raw of PREPOPULATED_TRANSLATIONS[cat][sub]) {
        const item = mapTranslationItem(raw, cat, sub, native, target);
        entries.push({
          item,
          haystack: `${normalizeForSearch(item.source_term)}\n${normalizeForSearch(item.translated_term)}`,
        });
      }
    }
  }
  entries.sort((a, b) => a.item.source_term.localeCompare(b.item.source_term));

  const term = normalizeForSearch(termoCru);
  if (!term) return { mode: 'browse' as const, items: [], total: 0 };
  if (term.length < MIN_SEARCH_LENGTH) return { mode: 'tooShort' as const, items: [], total: 0 };

  const found = entries.filter((e) => matchesSearch(e.haystack, term));
  return {
    mode: 'results' as const,
    items: found.slice(0, MAX_SEARCH_RESULTS).map((e) => e.item),
    total: found.length,
  };
};

const termos = (r: ReturnType<typeof buscar>) => r.items.map((i) => i.source_term);

describe('1-5 — normalização: acentos, caixa e espaços', () => {
  it('"acucar" encontra "Açúcar"', () => {
    // O catálogo não tem 'Açúcar' puro: tem Mascavo, Refinado e de Confeiteiro.
    expect(termos(buscar('acucar'))).toContain('Açúcar Refinado');
  });

  it('"pao" encontra "Pão"', () => {
    expect(termos(buscar('pao')).some((t) => t.includes('Pão'))).toBe(true);
  });

  it('"MAÇÃ" encontra "Maçã"', () => {
    expect(termos(buscar('MAÇÃ'))).toContain('Maçã');
  });

  it('com e sem acento dão o mesmo resultado', () => {
    expect(termos(buscar('acucar'))).toEqual(termos(buscar('açúcar')));
    expect(termos(buscar('LIMAO'))).toEqual(termos(buscar('limão')));
  });

  it('espaços nas bordas são ignorados', () => {
    expect(termos(buscar('   acucar   '))).toEqual(termos(buscar('acucar')));
  });

  it('maiúsculas e minúsculas são equivalentes', () => {
    expect(termos(buscar('ARROZ'))).toEqual(termos(buscar('arroz')));
  });

  it('busca parcial encontra pelo meio da palavra', () => {
    expect(termos(buscar('çuca'))).toContain('Açúcar Refinado');
  });
});

describe('6-8 — o que é pesquisável', () => {
  it('encontra pelo nome de origem', () => {
    expect(termos(buscar('Abacate'))).toContain('Abacate');
  });

  it('encontra pelo nome traduzido exibido no card', () => {
    // "Aguacate" é o termo espanhol; não existe em português.
    const r = buscar('aguacate');
    expect(r.items.map((i) => i.translated_term).join(' ')).toContain('Aguacate');
  });

  it('o termo traduzido indexado é o mesmo que o card mostra', () => {
    const abacate = PREPOPULATED_TRANSLATIONS['produce']['fruits'].find((i) => i.source_term === 'Abacate')!;
    const doCard = mapTranslationItem(abacate, 'produce', 'fruits', BR, ES);
    const achado = buscar(doCard.translated_term).items.find((i) => i.key === doCard.key);
    expect(achado?.translated_term).toBe(doCard.translated_term);
  });

  it('com fallback de idioma, busca e card concordam', () => {
    // Ucraniano não tem chave própria: o card cai em inglês pela cadeia de
    // fallback. A busca precisa comparar exatamente esse texto — era aqui que
    // as duas lógicas divergiam (achado N-14).
    const abacate = PREPOPULATED_TRANSLATIONS['produce']['fruits'].find((i) => i.source_term === 'Abacate')!;
    const doCard = mapTranslationItem(abacate, 'produce', 'fruits', UA, ES);
    expect(doCard.source_term).not.toBe('Abacate'); // caiu no fallback

    const achado = buscar(doCard.source_term, SUPERMARKET_CATEGORIES, UA, ES)
      .items.find((i) => i.key === doCard.key);
    expect(achado, `o card mostra "${doCard.source_term}" e a busca precisa achar por isso`).toBeTruthy();
  });

  it('todo item do índice é encontrável pelo texto que exibe', () => {
    const amostra = ['Abacate', 'Arroz Branco', 'Açúcar Refinado', 'Agrião'];
    for (const nome of amostra) {
      const achado = buscar(nome).items.find((i) => i.source_term === nome);
      expect(achado, `"${nome}" não foi encontrado pelo próprio nome`).toBeTruthy();
    }
  });
});

describe('9-11 — identidade e contexto das duplicatas', () => {
  it('dois "Soro Fisiológico" da Farmácia continuam itens distintos', () => {
    const r = buscar('Soro Fisiológico', PHARMACY_CATEGORIES);
    const iguais = r.items.filter((i) => i.source_term === 'Soro Fisiológico');
    expect(iguais.length).toBeGreaterThan(1);
    expect(new Set(iguais.map((i) => i.key)).size).toBe(iguais.length);
  });

  it('a busca não inventa identidade: usa a key composta da Fase 1', () => {
    const r = buscar('Soro Fisiológico', PHARMACY_CATEGORIES);
    for (const i of r.items.filter((x) => x.source_term === 'Soro Fisiológico')) {
      expect(i.key).toBe(`${i.category}/${i.subCategory}/Soro Fisiológico`);
    }
  });

  it('cada duplicata traz categoria e subcategoria para virar contexto na tela', () => {
    const r = buscar('Soro Fisiológico', PHARMACY_CATEGORIES);
    const posicoes = r.items
      .filter((i) => i.source_term === 'Soro Fisiológico')
      .map((i) => `${i.category}/${i.subCategory}`);
    expect(new Set(posicoes).size).toBe(posicoes.length);
    posicoes.forEach((p) => expect(p).not.toContain('undefined'));
  });
});

describe('12-13 — limite e contagem', () => {
  it('uma letra não varre o catálogo', () => {
    const r = buscar('a');
    expect(r.mode).toBe('tooShort');
    expect(r.items).toHaveLength(0);
  });

  it('duas letras já pesquisam', () => {
    expect(buscar('ar').mode).toBe('results');
  });

  it('nunca renderiza mais que o teto, e informa o total', () => {
    const r = buscar('a'.repeat(0) + 'ar');
    expect(r.items.length).toBeLessThanOrEqual(MAX_SEARCH_RESULTS);
    expect(r.total).toBeGreaterThanOrEqual(r.items.length);
  });

  it('um termo muito comum é cortado no teto e o total é maior', () => {
    // "ar" aparece em dezenas de itens: é o caso que trazia 669 cards.
    const r = buscar('ar');
    expect(r.total).toBeGreaterThan(MAX_SEARCH_RESULTS);
    expect(r.items).toHaveLength(MAX_SEARCH_RESULTS);
  });
});

describe('14 — isolamento entre módulos', () => {
  it('a Farmácia não devolve item do Supermercado', () => {
    const supermercado = new Set(SUPERMARKET_CATEGORIES.map((c) => c.name));
    const r = buscar('a', PHARMACY_CATEGORIES); // 1 char não busca; usar termo real
    expect(r.mode).toBe('tooShort');

    const r2 = buscar('Soro', PHARMACY_CATEGORIES);
    expect(r2.items.length).toBeGreaterThan(0);
    for (const i of r2.items) expect(supermercado.has(i.category!)).toBe(false);
  });

  it('o Supermercado não devolve item da Farmácia', () => {
    const farmacia = new Set(PHARMACY_CATEGORIES.map((c) => c.name));
    const r = buscar('Soro', SUPERMARKET_CATEGORIES);
    for (const i of r.items) expect(farmacia.has(i.category!)).toBe(false);
  });

  it('"Soro Fisiológico" existe nos dois módulos, e cada um vê só o seu', () => {
    const noSuper = buscar('Soro Fisiológico', SUPERMARKET_CATEGORIES);
    const naFarmacia = buscar('Soro Fisiológico', PHARMACY_CATEGORIES);
    expect(noSuper.total).toBeGreaterThan(0);
    expect(naFarmacia.total).toBeGreaterThan(0);
    const keysSuper = new Set(noSuper.items.map((i) => i.key));
    expect(naFarmacia.items.every((i) => !keysSuper.has(i.key))).toBe(true);
  });
});

describe('15-16 — a normalização não destrói alfabetos não latinos', () => {
  it('árabe passa intacto, com as harakat preservadas', () => {
    expect(normalizeForSearch('أنا')).toBe('أنا'.normalize('NFD').toLowerCase());
    const comHarakat = 'مَرْحَبًا';
    expect(normalizeForSearch(comHarakat)).toContain('َ'); // fatha continua lá
  });

  it('cirílico não perde a breve nem o trema: й ≠ и, ї ≠ і', () => {
    // A normalização ingênua (tirar U+0300–U+036F de tudo) colapsava estas
    // letras, que no ucraniano são distintas.
    expect(normalizeForSearch('й')).not.toBe(normalizeForSearch('и'));
    expect(normalizeForSearch('ї')).not.toBe(normalizeForSearch('і'));
    expect(normalizeForSearch('ЙОГУРТ')).toBe(normalizeForSearch('йогурт'));
  });

  it('lituano é escrita latina, então dobra igual ao português', () => {
    expect(normalizeForSearch('ąžuolas')).toBe('azuolas');
    expect(normalizeForSearch('Įkelti')).toBe('ikelti');
  });

  it('os cinco idiomas latinos do catálogo dobram como esperado', () => {
    expect(normalizeForSearch('Açúcar')).toBe('acucar');      // pt
    expect(normalizeForSearch('Limón')).toBe('limon');        // es
    expect(normalizeForSearch('Crème')).toBe('creme');        // fr
    expect(normalizeForSearch('Però')).toBe('pero');          // it
    expect(normalizeForSearch('Apple')).toBe('apple');        // en
  });

  it('escrever em alfabeto diferente não gera falso positivo', () => {
    expect(buscar('йогурт').total).toBe(0);
    expect(buscar('أنا').total).toBe(0);
  });
});

describe('17-18 — bordas', () => {
  it('busca vazia devolve o modo de navegação, não resultados', () => {
    expect(buscar('').mode).toBe('browse');
    expect(buscar('    ').mode).toBe('browse');
  });

  it('termo inexistente devolve zero, sem quebrar', () => {
    const r = buscar('zzzznaoexistezzzz');
    expect(r.mode).toBe('results');
    expect(r.total).toBe(0);
    expect(r.items).toEqual([]);
  });

  it('caracteres de pontuação não quebram a busca', () => {
    for (const t of ['(', ')', '///', '...', '—']) {
      expect(() => buscar(t)).not.toThrow();
    }
  });
});
