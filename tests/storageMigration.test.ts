import { describe, it, expect, beforeEach } from 'vitest';
import {
  SCHEMA_VERSION,
  SCHEMA_VERSION_KEY,
  migrateCheckedKeys,
  migrateItems,
  runStorageMigration,
  type CatalogResolver,
} from '../utils/storageMigration';
import type { TranslationItem } from '../types';

/**
 * Migração v1 → v2 da identidade dos itens salvos.
 * A regra que governa tudo aqui: nada é descartado em silêncio.
 */

const read = (key: string) => {
  const raw = localStorage.getItem(key);
  return raw === null ? null : JSON.parse(raw);
};

/** Favorito no formato antigo: key = source_term, mas com a posição junto. */
const v1Item = (key: string, category?: string, subCategory?: string): TranslationItem =>
  ({ key, source_term: key, translated_term: 'X', image: '', category, subCategory }) as TranslationItem;

const novoRelatorio = () => ({ ran: false, migrated: 0, resolved: 0, unresolved: 0, dropped: 0, droppedChecks: 0 });

beforeEach(() => localStorage.clear());

describe('migrateItems — caminho determinístico', () => {
  it('remonta a key a partir da posição que o próprio registro carrega', () => {
    const report = novoRelatorio();
    const { items } = migrateItems([v1Item('Abacate', 'produce', 'fruits')], report);

    expect(items[0].key).toBe('produce/fruits/Abacate');
    expect(report.migrated).toBe(1);
    expect(report.unresolved).toBe(0);
  });

  it('separa duplicatas que antes colidiam', () => {
    const report = novoRelatorio();
    const { items } = migrateItems([
      v1Item('Soro Fisiológico', 'coldFlu', 'nasalCongestion'),
      v1Item('Soro Fisiológico', 'firstAid', 'antiseptics'),
    ], report);

    expect(new Set(items.map((i) => i.key)).size).toBe(2);
  });

  it('preserva termos que contêm barra', () => {
    const report = novoRelatorio();
    const { items } = migrateItems([v1Item('Pão Árabe/Sírio', 'bakery', 'breads')], report);
    expect(items[0].key).toBe('bakery/breads/Pão Árabe/Sírio');
  });

  it('é idempotente: rodar de novo não prefixa duas vezes', () => {
    const report = novoRelatorio();
    const uma = migrateItems([v1Item('Abacate', 'produce', 'fruits')], report).items;
    const duas = migrateItems(uma, novoRelatorio()).items;
    expect(duas[0].key).toBe('produce/fruits/Abacate');
    expect(duas).toEqual(uma);
  });
});

describe('migrateItems — registros sem posição', () => {
  it('sem catálogo, o registro é preservado com posição desconhecida', () => {
    const report = novoRelatorio();
    const { items } = migrateItems([v1Item('Soro Fisiológico')], report);

    expect(items).toHaveLength(1);
    expect(items[0].key).toBe('?/?/Soro Fisiológico');
    expect(report.unresolved).toBe(1);
    expect(report.dropped).toBe(0);
  });

  it('com candidato único no catálogo, adota a posição encontrada', () => {
    const resolve: CatalogResolver = (termo) =>
      termo === 'Abacate' ? { category: 'produce', subCategory: 'fruits' } : null;

    const report = novoRelatorio();
    const { items } = migrateItems([v1Item('Abacate')], report, resolve);

    expect(items[0].key).toBe('produce/fruits/Abacate');
    expect(items[0].category).toBe('produce');
    expect(report.resolved).toBe(1);
  });

  it('com vários candidatos, NÃO escolhe: preserva sem posição', () => {
    // O resolvedor devolve null quando há ambiguidade — é o contrato.
    const resolve: CatalogResolver = () => null;

    const report = novoRelatorio();
    const { items } = migrateItems([v1Item('Soro Fisiológico')], report, resolve);

    expect(items).toHaveLength(1);
    expect(items[0].key).toBe('?/?/Soro Fisiológico');
    expect(report.resolved).toBe(0);
    expect(report.unresolved).toBe(1);
  });

  it('descarta apenas registros inutilizáveis, sem key de texto', () => {
    const report = novoRelatorio();
    const { items } = migrateItems(
      [{ source_term: 'sem key' } as unknown as TranslationItem, v1Item('Abacate', 'produce', 'fruits')],
      report,
    );

    expect(items).toHaveLength(1);
    expect(report.dropped).toBe(1);
  });
});

describe('migrateCheckedKeys', () => {
  it('reposiciona a marca quando a key antiga aponta para um item só', () => {
    const report = novoRelatorio();
    const mapping = new Map([['Arroz', ['grocery/grainsPasta/Arroz']]]);
    expect(migrateCheckedKeys(['Arroz'], mapping, report)).toEqual(['grocery/grainsPasta/Arroz']);
  });

  it('descarta a marca ambígua em vez de atribuí-la por sorteio', () => {
    const report = novoRelatorio();
    const mapping = new Map([['Soro Fisiológico', ['a/b/Soro Fisiológico', 'c/d/Soro Fisiológico']]]);
    expect(migrateCheckedKeys(['Soro Fisiológico'], mapping, report)).toEqual([]);
    expect(report.droppedChecks).toBe(1);
  });

  it('descarta marca órfã, que não corresponde a item nenhum da lista', () => {
    const report = novoRelatorio();
    expect(migrateCheckedKeys(['Fantasma'], new Map(), report)).toEqual([]);
    expect(report.droppedChecks).toBe(1);
  });
});

describe('runStorageMigration — execução única e não destrutiva', () => {
  it('converte favoritos e listas dos dois módulos', () => {
    localStorage.setItem('favorites', JSON.stringify([v1Item('Abacate', 'produce', 'fruits')]));
    localStorage.setItem('supermarket_shoppingList', JSON.stringify([v1Item('Arroz', 'grocery', 'grainsPasta')]));
    localStorage.setItem('pharmacy_shoppingList', JSON.stringify([v1Item('Dipirona', 'painFever', 'mildPain')]));

    const report = runStorageMigration();

    expect(report.ran).toBe(true);
    expect(read('favorites')[0].key).toBe('produce/fruits/Abacate');
    expect(read('supermarket_shoppingList')[0].key).toBe('grocery/grainsPasta/Arroz');
    expect(read('pharmacy_shoppingList')[0].key).toBe('painFever/mildPain/Dipirona');
    expect(localStorage.getItem(SCHEMA_VERSION_KEY)).toBe(String(SCHEMA_VERSION));
  });

  it('roda uma vez só: a segunda chamada não toca em nada', () => {
    localStorage.setItem('favorites', JSON.stringify([v1Item('Abacate', 'produce', 'fruits')]));

    runStorageMigration();
    const depoisDaPrimeira = localStorage.getItem('favorites');

    const segunda = runStorageMigration();
    expect(segunda.ran).toBe(false);
    expect(localStorage.getItem('favorites')).toBe(depoisDaPrimeira);
  });

  it('reposiciona os itens marcados junto com a lista', () => {
    localStorage.setItem('supermarket_shoppingList', JSON.stringify([v1Item('Arroz', 'grocery', 'grainsPasta')]));
    localStorage.setItem('supermarket_checkedItems', JSON.stringify(['Arroz']));

    runStorageMigration();

    expect(read('supermarket_checkedItems')).toEqual(['grocery/grainsPasta/Arroz']);
  });

  it('uma chave corrompida não impede a migração das outras', () => {
    localStorage.setItem('favorites', '[{quebrado');
    localStorage.setItem('supermarket_shoppingList', JSON.stringify([v1Item('Arroz', 'grocery', 'grainsPasta')]));

    runStorageMigration();

    expect(read('supermarket_shoppingList')[0].key).toBe('grocery/grainsPasta/Arroz');
    // E o conteúdo ilegível foi guardado, não jogado fora.
    expect(localStorage.getItem('favorites__corrupt')).toBe('[{quebrado');
  });

  it('storage vazio: marca a versão e não inventa dados', () => {
    const report = runStorageMigration();
    expect(report.ran).toBe(true);
    expect(localStorage.getItem('favorites')).toBeNull();
    expect(localStorage.getItem(SCHEMA_VERSION_KEY)).toBe(String(SCHEMA_VERSION));
  });

  it('não mexe nas chaves legadas sem prefixo', () => {
    localStorage.setItem('shoppingList', JSON.stringify([v1Item('Antigo', 'produce', 'fruits')]));
    runStorageMigration();
    expect(read('shoppingList')[0].key).toBe('Antigo');
  });
});
