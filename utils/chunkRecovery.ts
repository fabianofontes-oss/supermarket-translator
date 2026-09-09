/**
 * Recuperação de falha de `import()` dinâmico.
 *
 * O cenário real: um deploy novo entra no ar enquanto a sessão antiga está
 * aberta. Quando essa sessão pede um chunk que não existe mais, o servidor
 * responde 404 — ou, se o SPA fallback pegar o pedido, HTML no lugar de
 * JavaScript. Nos dois casos o `import()` rejeita e o React derruba a árvore.
 *
 * Uma recarga resolve, porque traz o `index.html` novo com os hashes novos.
 * Mas recarregar sem limite vira laço infinito quando a causa não é essa, então
 * a recarga automática acontece **no máximo uma vez por aba**.
 */

/** Contador por aba. `sessionStorage` zera sozinho numa aba nova. */
const RELOAD_COUNTER_KEY = 'th_chunkReloads';

export const MAX_AUTOMATIC_RELOADS = 1;

/**
 * Mensagens que os navegadores usam quando um módulo dinâmico não carrega.
 * Chrome, Firefox e Safari escrevem cada um a sua, e o caso de MIME errado
 * (HTML servido como JS) tem texto próprio.
 */
const CHUNK_ERROR_PATTERNS: RegExp[] = [
  /failed to fetch dynamically imported module/i,   // Chrome / Edge
  /error loading dynamically imported module/i,     // Firefox
  /importing a module script failed/i,              // Safari
  /failed to load module script/i,                  // MIME inesperado
  /expected a javascript module script/i,           // MIME inesperado, texto longo
  /dynamically imported module/i,                   // rede genérico
];

/**
 * Distingue "o código não chegou" de "o componente quebrou". Só o primeiro caso
 * justifica recarregar: recarregar por causa de um erro de lógica repetiria o
 * mesmo erro depois da recarga.
 */
export const isChunkLoadError = (error: unknown): boolean => {
  if (!error) return false;
  const candidate = error as { name?: unknown; message?: unknown };
  if (candidate.name === 'ChunkLoadError') return true;
  const message = typeof candidate.message === 'string' ? candidate.message : String(error);
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message));
};

const readReloadCount = (): number => {
  try {
    const parsed = Number(sessionStorage.getItem(RELOAD_COUNTER_KEY));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
};

/**
 * Registra a tentativa. Devolve `false` quando não deu para gravar — sem
 * contador não existe como garantir "uma vez só", e aí é mais seguro não
 * recarregar do que arriscar um laço.
 */
const recordReloadAttempt = (): boolean => {
  const next = readReloadCount() + 1;
  try {
    sessionStorage.setItem(RELOAD_COUNTER_KEY, String(next));
    return readReloadCount() === next;
  } catch {
    return false;
  }
};

export type ChunkRecovery = 'reload' | 'rethrow';

/**
 * Decide o que fazer com um `import()` que falhou.
 * `'rethrow'` deixa o erro subir para a ErrorBoundary, que mostra o fallback.
 */
export const decideChunkRecovery = (error: unknown): ChunkRecovery => {
  if (!isChunkLoadError(error)) return 'rethrow';
  if (readReloadCount() >= MAX_AUTOMATIC_RELOADS) return 'rethrow';
  if (!recordReloadAttempt()) return 'rethrow';
  return 'reload';
};

/** Apenas para testes: zera o contador da aba. */
export const resetChunkRecovery = (): void => {
  try {
    sessionStorage.removeItem(RELOAD_COUNTER_KEY);
  } catch {
    /* sem sessionStorage não há o que zerar */
  }
};
