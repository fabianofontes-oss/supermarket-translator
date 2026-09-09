import { useCallback, useEffect, useState } from 'react';
import type { TranslationItem } from '../types';
import { FAVORITES_KEY, isItemArray, readJSON, writeJSON } from '../utils/storage';

/**
 * Fonte de verdade única dos favoritos.
 *
 * Favoritos atravessam Supermercado e Farmácia e são apresentados como uma
 * lista só, então não podem morar dentro de `useListManager`, que é instanciado
 * uma vez por módulo. Antes, as duas instâncias tinham cópias independentes em
 * memória e gravavam na mesma chave: mexer na Farmácia gravava a cópia velha
 * por cima e apagava o que tinha sido favoritado no Supermercado (achado 8.1).
 *
 * **Monte este hook exatamente uma vez, em App.tsx.** Duas instâncias recriam
 * o defeito.
 */
export const useFavorites = () => {
  // Leitura na inicialização, não num efeito: um efeito de carga roda no mesmo
  // commit que o de gravação, que então escreveria `[]` por cima do que estava
  // salvo antes de o estado ser atualizado.
  const [favorites, setFavorites] = useState<TranslationItem[]>(
    () => readJSON(FAVORITES_KEY, [] as TranslationItem[], isItemArray),
  );

  useEffect(() => {
    writeJSON(FAVORITES_KEY, favorites);
  }, [favorites]);

  const toggleFavorite = useCallback((item: TranslationItem) => {
    setFavorites((prev) =>
      prev.some((i) => i.key === item.key)
        ? prev.filter((i) => i.key !== item.key)
        : [...prev, item],
    );
  }, []);

  return { favorites, toggleFavorite };
};
