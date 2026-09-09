import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  MAX_AUTOMATIC_RELOADS,
  decideChunkRecovery,
  isChunkLoadError,
  resetChunkRecovery,
} from '../utils/chunkRecovery';

beforeEach(() => {
  sessionStorage.clear();
  resetChunkRecovery();
});

describe('isChunkLoadError — distinguir código que não chegou de componente que quebrou', () => {
  // Mensagens reais dos navegadores quando um módulo dinâmico não carrega.
  const falhasDeCarregamento = [
    'Failed to fetch dynamically imported module: https://app/assets/CatalogModule-abc123.js',
    'error loading dynamically imported module',
    'Importing a module script failed.',
    'Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html".',
  ];

  it.each(falhasDeCarregamento)('reconhece: %s', (mensagem) => {
    expect(isChunkLoadError(new Error(mensagem))).toBe(true);
  });

  it('reconhece ChunkLoadError pelo nome', () => {
    const erro = new Error('qualquer coisa');
    erro.name = 'ChunkLoadError';
    expect(isChunkLoadError(erro)).toBe(true);
  });

  it('NÃO trata erro de componente como falha de chunk', () => {
    expect(isChunkLoadError(new TypeError("Cannot read properties of undefined (reading 'map')"))).toBe(false);
    expect(isChunkLoadError(new Error('Nenhum item encontrado'))).toBe(false);
  });

  it('aguenta valores estranhos sem estourar', () => {
    expect(isChunkLoadError(null)).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
    expect(isChunkLoadError('Failed to fetch dynamically imported module')).toBe(true);
    expect(isChunkLoadError({})).toBe(false);
  });
});

describe('decideChunkRecovery — no máximo uma recarga automática por aba', () => {
  const falhaDeChunk = () => new Error('Failed to fetch dynamically imported module: /assets/x.js');

  it('a primeira falha de chunk recarrega', () => {
    expect(decideChunkRecovery(falhaDeChunk())).toBe('reload');
  });

  it('a segunda falha NÃO recarrega: sobe para a ErrorBoundary', () => {
    expect(decideChunkRecovery(falhaDeChunk())).toBe('reload');
    expect(decideChunkRecovery(falhaDeChunk())).toBe('rethrow');
  });

  it('não existe laço: dez falhas seguidas geram uma recarga só', () => {
    const decisoes = Array.from({ length: 10 }, () => decideChunkRecovery(falhaDeChunk()));
    expect(decisoes.filter((d) => d === 'reload')).toHaveLength(MAX_AUTOMATIC_RELOADS);
  });

  it('erro que não é de carregamento nunca recarrega', () => {
    expect(decideChunkRecovery(new TypeError('x is not a function'))).toBe('rethrow');
    // e não gastou a tentativa
    expect(decideChunkRecovery(falhaDeChunk())).toBe('reload');
  });

  it('uma aba nova recomeça com a tentativa disponível', () => {
    expect(decideChunkRecovery(falhaDeChunk())).toBe('reload');
    resetChunkRecovery(); // equivale a abrir outra aba
    expect(decideChunkRecovery(falhaDeChunk())).toBe('reload');
  });
});

describe('decideChunkRecovery — sem sessionStorage', () => {
  let setItem: typeof Storage.prototype.setItem;

  beforeEach(() => {
    setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new DOMException('bloqueado', 'SecurityError'); };
  });
  afterEach(() => { Storage.prototype.setItem = setItem; });

  it('não recarrega quando não dá para contar as tentativas', () => {
    // Sem contador não há como garantir "uma vez só"; recarregar seria arriscar
    // um laço infinito. Melhor deixar a ErrorBoundary oferecer a ação manual.
    expect(decideChunkRecovery(new Error('Failed to fetch dynamically imported module'))).toBe('rethrow');
  });
});
