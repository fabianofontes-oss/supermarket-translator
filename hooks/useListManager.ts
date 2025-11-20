
import { useState, useEffect } from 'react';
import type { TranslationItem } from '../types';

export const useListManager = (storagePrefix: string = '') => {
  // Construct keys based on prefix. 
  // If prefix is empty (e.g. for Supermarket backward compatibility), use original keys.
  // If prefix is 'pharmacy_', keys become 'pharmacy_shoppingList', etc.
  const listKey = storagePrefix ? `${storagePrefix}_shoppingList` : 'shoppingList';
  const checkedKey = storagePrefix ? `${storagePrefix}_checkedItems` : 'checkedItems';
  const favoritesKey = 'favorites'; // Favorites are usually global across the app, but could be prefixed if needed.

  const [shoppingList, setShoppingList] = useState<TranslationItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<TranslationItem[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedList = localStorage.getItem(listKey);
      if (savedList) setShoppingList(JSON.parse(savedList));

      const savedChecked = localStorage.getItem(checkedKey);
      if (savedChecked) setCheckedItems(new Set(JSON.parse(savedChecked)));

      const savedFavorites = localStorage.getItem(favoritesKey);
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    } catch (err) {
      console.error('Failed to load local storage data', err);
    }
  }, [listKey, checkedKey, favoritesKey]);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(listKey, JSON.stringify(shoppingList));
      localStorage.setItem(checkedKey, JSON.stringify(Array.from(checkedItems)));
      localStorage.setItem(favoritesKey, JSON.stringify(favorites));
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  }, [shoppingList, checkedItems, favorites, listKey, checkedKey, favoritesKey]);

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

  const toggleFavorite = (item: TranslationItem) => {
    setFavorites((prevFavorites) => {
      const isFavorite = prevFavorites.some((i) => i.key === item.key);
      if (isFavorite) {
        return prevFavorites.filter((i) => i.key !== item.key);
      } else {
        return [...prevFavorites, item];
      }
    });
  };

  return {
    shoppingList,
    checkedItems,
    favorites,
    toggleShoppingListItem,
    toggleCheckedItem,
    toggleFavorite
  };
};
