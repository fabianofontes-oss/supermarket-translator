import type { TranslationItem } from '../types';

/**
 * Camada de acesso ao localStorage.
 *
 * Duas regras vêm da auditoria (achado N-5):
 *
 * 1. **Cada chave é lida de forma independente.** Antes, três `JSON.parse`
 *    dividiam um `try/catch` só: um JSON quebrado na lista de compras impedia
 *    a leitura dos itens marcados e dos favoritos, e o efeito de gravação
 *    escrevia `[]` por cima dos dados bons logo em seguida.
 *
 * 2. **Conteúdo ilegível não é apagado.** Ele vai para `<chave>__corrupt`
 *    antes de o app voltar a gravar, para que dê para recuperar à mão.
 */

export const FAVORITES_KEY = 'favorites';

/** Prefixos de módulo que possuem lista própria. Espelha App.tsx. */
export const STORAGE_PREFIXES = ['supermarket', 'pharmacy'] as const;

export const listKeyFor = (prefix: string) => (prefix ? `${prefix}_shoppingList` : 'shoppingList');
export const checkedKeyFor = (prefix: string) => (prefix ? `${prefix}_checkedItems` : 'checkedItems');

const CORRUPT_SUFFIX = '__corrupt';

/** O navegador pode negar o acesso inteiro (modo privado, política de site). */
export const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    // Storage cheio ou bloqueado: o app continua em memória.
    return false;
  }
};

/** Guarda o conteúdo ilegível em vez de deixá-lo ser sobrescrito e perdido. */
const quarantine = (key: string, raw: string): void => {
  const target = `${key}${CORRUPT_SUFFIX}`;
  // Não sobrescreve uma quarentena anterior: a primeira é a mais próxima do original.
  if (safeGetItem(target) === null) safeSetItem(target, raw);
};

/**
 * Lê uma chave, valida o formato e devolve o padrão seguro quando não dá.
 * Nunca lança, nunca contamina a leitura das outras chaves.
 */
export const readJSON = <T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T => {
  const raw = safeGetItem(key);
  if (raw === null || raw === '') return fallback;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    quarantine(key, raw);
    return fallback;
  }

  if (!isValid(parsed)) {
    quarantine(key, raw);
    return fallback;
  }
  return parsed;
};

export const writeJSON = (key: string, value: unknown): void => {
  try {
    safeSetItem(key, JSON.stringify(value));
  } catch {
    // Valor não serializável: melhor não gravar do que gravar lixo.
  }
};

// --- Validadores de formato -------------------------------------------------

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Um item persistido precisa, no mínimo, de uma `key` de texto. */
export const isItemArray = (v: unknown): v is TranslationItem[] =>
  Array.isArray(v) && v.every((i) => isRecord(i) && typeof i.key === 'string');

export const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((i) => typeof i === 'string');
