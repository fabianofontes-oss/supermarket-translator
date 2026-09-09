/**
 * Identidade de um item do catálogo.
 *
 * Antes a `key` era só o `source_term`, e 42 termos aparecem em mais de uma
 * posição do catálogo (achado 8.2). Itens distintos colidiam: favoritar um
 * marcava o outro, a lista de compras não guardava os dois, e a `key` do React
 * duplicada deixava cards fantasma na busca.
 */

export const ITEM_KEY_SEPARATOR = '/';

/** Segmento usado quando a posição de um dado antigo não pôde ser determinada. */
export const UNKNOWN_SEGMENT = '?';

/**
 * `baseTerm` é sempre o `source_term` em pt-BR do catálogo — nunca o termo já
 * traduzido. Assim a identidade não muda quando o par de idiomas muda, e um
 * favorito salvo em Brasil→Espanha continua reconhecível em Brasil→França.
 *
 * O `source_term` pode conter barra ("Pão Árabe/Sírio"). A key é montada da
 * esquerda para a direita e nunca é desmontada de volta, então isso é seguro.
 */
export const makeItemKey = (category: string, subCategory: string, baseTerm: string): string =>
  `${category}${ITEM_KEY_SEPARATOR}${subCategory}${ITEM_KEY_SEPARATOR}${baseTerm}`;

/** Prefixo que uma key composta tem quando pertence a esta posição. */
export const itemKeyPrefix = (category: string, subCategory: string): string =>
  `${category}${ITEM_KEY_SEPARATOR}${subCategory}${ITEM_KEY_SEPARATOR}`;
