import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useListManager } from '../hooks/useListManager';
import { useFavorites } from '../hooks/useFavorites';
import { storedItem } from './fixtures';

/**
 * Testes de proteção da persistência.
 *
 * Escritos ANTES da correção, para reproduzir os defeitos 8.1 e N-5 da
 * "Segunda Auditoria Translator Hub". Eles descrevem o comportamento correto,
 * não o comportamento atual.
 */

const read = (key: string) => {
  const raw = localStorage.getItem(key);
  return raw === null ? null : JSON.parse(raw);
};

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

/**
 * Espelha como o App monta a camada de armazenamento (App.tsx:120-121: duas
 * instâncias do hook na mesma árvore). Sem as duas vivas ao mesmo tempo o
 * defeito 8.1 não aparece.
 *
 * É aqui, e só aqui, que a fiação muda quando favoritos passarem a ter uma
 * fonte de verdade única; os testes abaixo continuam iguais.
 */
const useAppStorage = () => {
  const supermarket = useListManager('supermarket');
  const pharmacy = useListManager('pharmacy');
  // Favoritos passaram a ter fonte única, montada uma vez só — é exatamente
  // esta linha que a correção 8.1 mudou em App.tsx.
  const shared = useFavorites();
  return {
    supermarket,
    pharmacy,
    favorites: shared.favorites,
    favoritesNaFarmacia: shared.favorites,
    toggleFavorite: shared.toggleFavorite,
  };
};

describe('TESTE 1 — favoritos sobrevivem a mudanças no outro módulo', () => {
  const abacate = storedItem('produce/fruits/Abacate', 'produce', 'fruits', 'Abacate');
  const remedio = storedItem('painFever/mildPain/AAS Infantil', 'painFever', 'mildPain', 'AAS Infantil');

  it('favoritar no Supermercado e mexer na lista da Farmácia não apaga o favorito', () => {
    const { result } = renderHook(() => useAppStorage());

    act(() => { result.current.toggleFavorite(abacate); });
    expect(read('favorites')).toHaveLength(1);

    // Qualquer escrita na Farmácia dispara o efeito de gravação daquela instância.
    act(() => { result.current.pharmacy.toggleShoppingListItem(remedio); });

    const favoritos = read('favorites');
    expect(favoritos, 'o favorito do Supermercado não pode ser apagado pela Farmácia').toHaveLength(1);
    expect(favoritos[0].key).toBe('produce/fruits/Abacate');
  });

  it('as duas telas leem a mesma lista de favoritos', () => {
    const { result } = renderHook(() => useAppStorage());

    act(() => { result.current.toggleFavorite(abacate); });

    // Favoritos são apresentados como uma lista só, então a Farmácia precisa
    // enxergar na hora o que foi favoritado no Supermercado.
    expect(result.current.favorites.map((i) => i.key)).toContain('produce/fruits/Abacate');
    expect(result.current.favoritesNaFarmacia.map((i) => i.key)).toContain('produce/fruits/Abacate');
  });

  it('desfavoritar remove de verdade', () => {
    const { result } = renderHook(() => useAppStorage());

    act(() => { result.current.toggleFavorite(abacate); });
    act(() => { result.current.toggleFavorite(abacate); });

    expect(result.current.favorites).toEqual([]);
    expect(read('favorites')).toEqual([]);
  });

  it('cada módulo mantém a própria lista de compras', () => {
    const arroz = storedItem('grocery/grainsPasta/Arroz', 'grocery', 'grainsPasta', 'Arroz');
    const { result } = renderHook(() => useAppStorage());

    act(() => { result.current.supermarket.toggleShoppingListItem(arroz); });

    expect(read('supermarket_shoppingList')).toHaveLength(1);
    expect(read('pharmacy_shoppingList')).toEqual([]);
  });
});

describe('TESTE 2 — uma chave corrompida não destrói as outras', () => {
  const abacate = storedItem('produce/fruits/Abacate', 'produce', 'fruits', 'Abacate');

  beforeEach(() => {
    localStorage.setItem('supermarket_shoppingList', '[{quebrado');           // JSON inválido
    localStorage.setItem('supermarket_checkedItems', JSON.stringify(['a']));  // JSON válido
    localStorage.setItem('favorites', JSON.stringify([abacate]));             // JSON válido
  });

  it('o JSON inválido da lista não apaga os itens marcados', () => {
    renderHook(() => useListManager('supermarket'));
    expect(read('supermarket_checkedItems')).toEqual(['a']);
  });

  it('o JSON inválido da lista não apaga os favoritos', () => {
    renderHook(() => useAppStorage());
    const favoritos = read('favorites');
    expect(favoritos, 'favoritos válidos não podem morrer por causa de outra chave').toHaveLength(1);
    expect(favoritos[0].key).toBe('produce/fruits/Abacate');
  });

  it('a lista corrompida cai num valor padrão seguro em vez de derrubar o hook', () => {
    const { result } = renderHook(() => useListManager('supermarket'));
    expect(result.current.shoppingList).toEqual([]);
  });

  it('o conteúdo corrompido não é descartado em silêncio', () => {
    renderHook(() => useListManager('supermarket'));
    // Ou o valor cru continua onde estava, ou foi movido para quarentena.
    const original = localStorage.getItem('supermarket_shoppingList');
    const quarentena = localStorage.getItem('supermarket_shoppingList__corrupt');
    expect(original === '[{quebrado' || quarentena === '[{quebrado').toBe(true);
  });

  it('conteúdo com o tipo errado também vira valor padrão seguro', () => {
    localStorage.setItem('pharmacy_shoppingList', '{"nao":"e um array"}');
    const { result } = renderHook(() => useListManager('pharmacy'));
    expect(result.current.shoppingList).toEqual([]);
  });
});

describe('TESTE 2b — armazenamento indisponível', () => {
  let getItem: typeof Storage.prototype.getItem;
  let setItem: typeof Storage.prototype.setItem;

  beforeEach(() => {
    getItem = Storage.prototype.getItem;
    setItem = Storage.prototype.setItem;
    Storage.prototype.getItem = () => { throw new DOMException('bloqueado', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('cheio', 'QuotaExceededError'); };
  });

  afterEach(() => {
    Storage.prototype.getItem = getItem;
    Storage.prototype.setItem = setItem;
  });

  it('o hook monta e funciona quando o navegador bloqueia o storage', () => {
    const arroz = storedItem('grocery/grainsPasta/Arroz', 'grocery', 'grainsPasta', 'Arroz');
    const { result } = renderHook(() => useListManager('supermarket'));

    expect(result.current.shoppingList).toEqual([]);
    act(() => { result.current.toggleShoppingListItem(arroz); });
    expect(result.current.shoppingList).toHaveLength(1);
  });
});
