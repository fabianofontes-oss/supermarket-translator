import { describe, it, expect } from 'vitest';
import { mapTranslationItem } from '../utils/itemHelpers';
import { ITEM_KEY_SEPARATOR } from '../utils/itemIdentity';
import { PREPOPULATED_TRANSLATIONS } from '../data/catalog';
import { PHARMACY_CATEGORIES, SUPERMARKET_CATEGORIES } from '../constants';
import { BR, ES, FR, rawItem } from './fixtures';

/**
 * Testes de proteção da identidade dos itens.
 *
 * Escritos ANTES da correção, para reproduzir o defeito 8.2 da
 * "Segunda Auditoria Translator Hub": `key` derivada só de `source_term`,
 * o que faz itens distintos colidirem.
 */

/** Todas as posições (categoria/subcategoria) em que um termo aparece no catálogo. */
const posicoesDe = (termo: string) => {
  const achados: { category: string; subCategory: string; item: any }[] = [];
  for (const category of Object.keys(PREPOPULATED_TRANSLATIONS)) {
    for (const subCategory of Object.keys(PREPOPULATED_TRANSLATIONS[category])) {
      for (const item of PREPOPULATED_TRANSLATIONS[category][subCategory]) {
        if (item.source_term === termo) achados.push({ category, subCategory, item });
      }
    }
  }
  return achados;
};

describe('TESTE 3 — itens diferentes têm identidades diferentes', () => {
  it('mesmo source_term em categorias diferentes gera keys diferentes', () => {
    const bruto = rawItem('Soro Fisiológico');

    const higiene = mapTranslationItem(bruto, 'personalHygiene', 'specificCare', BR, ES);
    const resfriado = mapTranslationItem(bruto, 'coldFlu', 'nasalCongestion', BR, ES);

    expect(higiene.key).not.toBe(resfriado.key);
  });

  it('mesmo source_term em subcategorias diferentes da mesma categoria gera keys diferentes', () => {
    const bruto = rawItem('Nebacetin');

    const antisepticos = mapTranslationItem(bruto, 'firstAid', 'antiseptics', BR, ES);
    const queimaduras = mapTranslationItem(bruto, 'firstAid', 'burns', BR, ES);

    expect(antisepticos.key).not.toBe(queimaduras.key);
  });

  it('a key carrega categoria e subcategoria', () => {
    const item = mapTranslationItem(rawItem('Maçã'), 'produce', 'fruits', BR, ES);
    expect(item.key).toContain('produce');
    expect(item.key).toContain('fruits');
    expect(item.key).toContain('Maçã');
  });
});

describe('TESTE 4 — a mesma identidade é estável e determinística', () => {
  const bruto = rawItem('Maçã');

  it('recriar o item a partir do catálogo produz exatamente a mesma key', () => {
    const a = mapTranslationItem(bruto, 'produce', 'fruits', BR, ES);
    const b = mapTranslationItem(bruto, 'produce', 'fruits', BR, ES);
    expect(a.key).toBe(b.key);
  });

  it('a key não muda quando o par de idiomas muda', () => {
    // Um favorito salvo em Brasil→Espanha precisa continuar reconhecível
    // depois que a pessoa troca para Brasil→França.
    const emEspanha = mapTranslationItem(bruto, 'produce', 'fruits', BR, ES);
    const emFranca = mapTranslationItem(bruto, 'produce', 'fruits', BR, FR);
    const nativoFrances = mapTranslationItem(bruto, 'produce', 'fruits', FR, ES);

    expect(emFranca.key).toBe(emEspanha.key);
    expect(nativoFrances.key).toBe(emEspanha.key);
    // …mas o texto exibido muda, que é o esperado.
    expect(nativoFrances.source_term).not.toBe(emEspanha.source_term);
  });

  it('termos com barra no nome continuam produzindo uma key estável', () => {
    // "Pão Árabe/Sírio" existe mesmo no catálogo.
    const a = mapTranslationItem(rawItem('Pão Árabe/Sírio'), 'bakery', 'breads', BR, ES);
    const b = mapTranslationItem(rawItem('Pão Árabe/Sírio'), 'bakery', 'breads', BR, ES);
    expect(a.key).toBe('bakery/breads/Pão Árabe/Sírio');
    expect(a.key).toBe(b.key);
  });

  /**
   * O formato `categoria/subcategoria/termo` só é injetivo enquanto os dois
   * primeiros segmentos não contiverem o separador — o termo pode conter, por
   * ser o resto da string. Este teste protege esse invariante: se alguém criar
   * uma subcategoria chamada "breads/pao", duas posições diferentes passariam a
   * gerar a mesma key.
   */
  it('nenhum nome de categoria ou subcategoria contém o separador', () => {
    const nomes = new Set<string>();
    for (const c of [...SUPERMARKET_CATEGORIES, ...PHARMACY_CATEGORIES]) {
      nomes.add(c.name);
      c.subCategories.forEach((s) => nomes.add(s));
    }
    for (const category of Object.keys(PREPOPULATED_TRANSLATIONS)) {
      nomes.add(category);
      Object.keys(PREPOPULATED_TRANSLATIONS[category]).forEach((s) => nomes.add(s));
    }

    const comSeparador = [...nomes].filter((n) => n.includes(ITEM_KEY_SEPARATOR));
    expect(comSeparador).toEqual([]);
  });
});

describe('TESTE 5 — duplicatas reais do catálogo coexistem', () => {
  it('"Soro Fisiológico" aparece em mais de um lugar do catálogo', () => {
    expect(posicoesDe('Soro Fisiológico').length).toBeGreaterThan(1);
  });

  it('as três ocorrências de "Soro Fisiológico" recebem keys distintas', () => {
    const posicoes = posicoesDe('Soro Fisiológico');
    const keys = posicoes.map((p) => mapTranslationItem(p.item, p.category, p.subCategory, BR, ES).key);
    expect(new Set(keys).size).toBe(posicoes.length);
  });

  it('as duplicatas podem estar em favoritos ao mesmo tempo', () => {
    const posicoes = posicoesDe('Soro Fisiológico');
    const itens = posicoes.map((p) => mapTranslationItem(p.item, p.category, p.subCategory, BR, ES));

    // Simula o toggleFavorite: adiciona quem ainda não está lá pela key.
    const favoritos = itens.reduce<typeof itens>((lista, item) => (
      lista.some((i) => i.key === item.key) ? lista : [...lista, item]
    ), []);

    expect(favoritos).toHaveLength(posicoes.length);
  });

  it('marcar uma duplicata como favorita não marca as outras', () => {
    const posicoes = posicoesDe('Soro Fisiológico');
    const itens = posicoes.map((p) => mapTranslationItem(p.item, p.category, p.subCategory, BR, ES));
    const favoritos = [itens[0]];

    const marcados = itens.map((i) => favoritos.some((f) => f.key === i.key));
    expect(marcados).toEqual([true, ...itens.slice(1).map(() => false)]);
  });

  it('o catálogo inteiro produz keys únicas', () => {
    const keys = new Set<string>();
    let total = 0;
    for (const category of Object.keys(PREPOPULATED_TRANSLATIONS)) {
      for (const subCategory of Object.keys(PREPOPULATED_TRANSLATIONS[category])) {
        for (const item of PREPOPULATED_TRANSLATIONS[category][subCategory]) {
          keys.add(mapTranslationItem(item, category, subCategory, BR, ES).key);
          total++;
        }
      }
    }
    expect(keys.size).toBe(total);
  });
});
