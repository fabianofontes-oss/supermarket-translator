
import { useState, useEffect } from 'react';
import type { TranslationItem } from '../types';
import { checkedKeyFor, isItemArray, isStringArray, listKeyFor, readJSON, writeJSON } from '../utils/storage';

/**
 * Lista de compras e itens marcados de UM módulo.
 *
 * Favoritos **não** moram aqui: eles são uma lista só para o app inteiro e
 * vivem em `useFavorites`, montado uma vez em App.tsx (achado 8.1). Este hook
 * é instanciado uma vez por módulo e cada instância só toca nas próprias
 * chaves prefixadas.
 */
export const useListManager = (storagePrefix: string = '') => {
  const listKey = listKeyFor(storagePrefix);
  const checkedKey = checkedKeyFor(storagePrefix);

  // Cada chave é lida de forma independente, na inicialização do estado.
  // Antes eram três `JSON.parse` num `try/catch` só, dentro de um efeito: um
  // JSON quebrado numa chave impedia a leitura das outras, e o efeito de
  // gravação — que roda no mesmo commit — apagava os dados bons (achado N-5).
  //
  // O prefixo é uma constante por instância (App.tsx passa literais), então não
  // existe recarga por mudança de chave.
  const [shoppingList, setShoppingList] = useState<TranslationItem[]>(
    () => readJSON(listKey, [] as TranslationItem[], isItemArray),
  );
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    () => new Set(readJSON(checkedKey, [] as string[], isStringArray)),
  );

  useEffect(() => {
    writeJSON(listKey, shoppingList);
  }, [listKey, shoppingList]);

  useEffect(() => {
    writeJSON(checkedKey, Array.from(checkedItems));
  }, [checkedKey, checkedItems]);

  const toggleShoppingListItem = (item: TranslationItem) => {
    setShoppingList((prevList) => {
      const isInList = prevList.some((i) => i.key === item.key);
      if (isInList) {
        // Also remove from checked items if removed from list
        toggleCheckedItem(item.key, true);
        return prevList.filter((i) => i.key !== item.key);
      } else {
        return [...prevList, item];
      }
    });
  };

  const toggleCheckedItem = (itemKey: string, forceRemove = false) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (forceRemove) {
        newSet.delete(itemKey);
      } else {
        if (newSet.has(itemKey)) {
          newSet.delete(itemKey);
        } else {
          newSet.add(itemKey);
        }
      }
      return newSet;
    });
  };

  return {
    shoppingList,
    checkedItems,
    toggleShoppingListItem,
    toggleCheckedItem
  };
};
