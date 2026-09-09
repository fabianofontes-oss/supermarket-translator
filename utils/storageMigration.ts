import type { TranslationItem } from '../types';
import { itemKeyPrefix, makeItemKey, UNKNOWN_SEGMENT } from './itemIdentity';
import {
  FAVORITES_KEY,
  STORAGE_PREFIXES,
  checkedKeyFor,
  isItemArray,
  isStringArray,
  listKeyFor,
  readJSON,
  safeGetItem,
  safeSetItem,
  writeJSON,
} from './storage';

/**
 * Migração da identidade dos itens salvos (v1 → v2).
 *
 * v1 gravava `key = source_term` (o termo em pt-BR). v2 grava
 * `categoria/subcategoria/termo`. Sem migração, todo favorito e toda lista já
 * salvos deixariam de casar com os cards do catálogo.
 *
 * O caminho principal é determinístico e não precisa do catálogo: todo item
 * gravado por qualquer versão já publicada carrega `category` e `subCategory`
 * dentro do próprio objeto — `mapTranslationItem` sempre preencheu os dois
 * (conferido no histórico do git, commits f1aeec8 e 970ec5c). A key nova é
 * remontada a partir dos campos que o próprio registro traz.
 *
 * Nada é apagado em silêncio: um registro que não puder ser posicionado é
 * preservado com os segmentos `?`, e continua visível e removível no painel de
 * favoritos.
 */

export const SCHEMA_VERSION = 2;
export const SCHEMA_VERSION_KEY = 'th_schemaVersion';

/**
 * Reconciliação opcional contra o catálogo, para registros antigos que não
 * tragam `category`/`subCategory`. Deve devolver `null` quando houver zero ou
 * mais de um candidato — a migração nunca escolhe arbitrariamente.
 *
 * Não é ligada em produção de propósito: o catálogo é um chunk adiado de
 * 474 kB e importá-lo aqui o traria para o pacote inicial, para tratar um caso
 * que os dados reais não produzem. Fica como parâmetro por ser o ponto de
 * extensão correto, e é testada.
 */
export type CatalogResolver = (baseTerm: string) => { category: string; subCategory: string } | null;

export interface MigrationReport {
  /** `false` quando o storage já estava na versão atual. */
  ran: boolean;
  /** Registros que ganharam key composta a partir dos próprios campos. */
  migrated: number;
  /** Registros posicionados pelo catálogo. */
  resolved: number;
  /** Registros preservados com posição desconhecida (`?/?/termo`). */
  unresolved: number;
  /** Registros inutilizáveis (sem `key` de texto) que foram descartados. */
  dropped: number;
  /** Marcas de "item pego" descartadas por não casarem com exatamente um item. */
  droppedChecks: number;
}

const emptyReport = (): MigrationReport => ({
  ran: false, migrated: 0, resolved: 0, unresolved: 0, dropped: 0, droppedChecks: 0,
});

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

/**
 * Migra uma lista de itens. Idempotente por conta própria: um item cuja key já
 * começa com a posição dele é devolvido intacto.
 *
 * Devolve também o mapa `key antiga → key nova`, usado para reconciliar as
 * marcas de "item pego", que são só strings e não carregam posição.
 */
export const migrateItems = (
  items: TranslationItem[],
  report: MigrationReport,
  resolve?: CatalogResolver,
): { items: TranslationItem[]; mapping: Map<string, string[]> } => {
  const mapping = new Map<string, string[]>();
  const migrated: TranslationItem[] = [];

  for (const item of items) {
    if (!isNonEmptyString(item?.key)) {
      report.dropped++;
      continue;
    }

    const oldKey = item.key;
    let category = isNonEmptyString(item.category) ? item.category : '';
    let subCategory = isNonEmptyString(item.subCategory) ? item.subCategory : '';

    // Já migrado: a key começa com a própria posição.
    if (category && subCategory && oldKey.startsWith(itemKeyPrefix(category, subCategory))) {
      migrated.push(item);
      addMapping(mapping, oldKey, oldKey);
      continue;
    }

    if (!category || !subCategory) {
      const found = resolve?.(oldKey) ?? null;
      if (found) {
        category = found.category;
        subCategory = found.subCategory;
        report.resolved++;
      } else {
        // Preservado, não descartado: continua listado e removível.
        category = UNKNOWN_SEGMENT;
        subCategory = UNKNOWN_SEGMENT;
        report.unresolved++;
      }
    } else {
      report.migrated++;
    }

    const newKey = makeItemKey(category, subCategory, oldKey);
    migrated.push({ ...item, key: newKey, category, subCategory });
    addMapping(mapping, oldKey, newKey);
  }

  return { items: migrated, mapping };
};

const addMapping = (mapping: Map<string, string[]>, oldKey: string, newKey: string) => {
  const list = mapping.get(oldKey);
  if (list) list.push(newKey);
  else mapping.set(oldKey, [newKey]);
};

/**
 * As marcas de "item pego" são só a key antiga, sem posição. Só dá para
 * reposicioná-las através da lista de compras do mesmo módulo, onde o item
 * obrigatoriamente está. Quando a key antiga aponta para mais de um item novo,
 * a marca é descartada em vez de ser atribuída a um deles por sorteio.
 */
export const migrateCheckedKeys = (
  checked: string[],
  mapping: Map<string, string[]>,
  report: MigrationReport,
): string[] => {
  const result: string[] = [];
  for (const key of checked) {
    const candidates = mapping.get(key);
    if (candidates && candidates.length === 1) result.push(candidates[0]);
    else report.droppedChecks++;
  }
  return result;
};

/**
 * Executa a migração uma única vez. Chamada em index.tsx, antes do React
 * montar, para que os hooks já leiam o formato novo.
 */
export const runStorageMigration = (options: { resolve?: CatalogResolver } = {}): MigrationReport => {
  const report = emptyReport();

  const stored = Number(safeGetItem(SCHEMA_VERSION_KEY));
  if (Number.isFinite(stored) && stored >= SCHEMA_VERSION) return report;

  report.ran = true;

  // Favoritos: chave global, sem lista de marcados associada.
  const favorites = readJSON(FAVORITES_KEY, [] as TranslationItem[], isItemArray);
  if (favorites.length > 0) {
    writeJSON(FAVORITES_KEY, migrateItems(favorites, report, options.resolve).items);
  }

  // Listas de compras: uma por módulo, cada uma com seus itens marcados.
  for (const prefix of STORAGE_PREFIXES) {
    const listKey = listKeyFor(prefix);
    const checkedKey = checkedKeyFor(prefix);

    const list = readJSON(listKey, [] as TranslationItem[], isItemArray);
    const checked = readJSON(checkedKey, [] as string[], isStringArray);
    if (list.length === 0 && checked.length === 0) continue;

    const { items, mapping } = migrateItems(list, report, options.resolve);
    writeJSON(listKey, items);
    if (checked.length > 0) writeJSON(checkedKey, migrateCheckedKeys(checked, mapping, report));
  }

  safeSetItem(SCHEMA_VERSION_KEY, String(SCHEMA_VERSION));
  return report;
};
