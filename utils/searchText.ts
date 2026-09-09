/**
 * Normalização de texto para comparação na busca.
 *
 * A regra é dobrar diacrítico **só em escrita latina**. A versão ingênua —
 * `normalize('NFD').replace(/[̀-ͯ]/g, '')` — parece resolver, mas foi
 * medida e destrói o ucraniano: `й` vira `и` e `ї` vira `і`, que são letras
 * diferentes do alfabeto. Buscar "и" passaria a casar com "й".
 *
 * Restringindo a remoção às marcas que seguem uma letra latina:
 *
 *   Açúcar   → acucar     (dobra: português, espanhol, francês, italiano)
 *   ąžuolas  → azuolas    (dobra: lituano, que também é latino)
 *   йогурт   → йогурт     (intacto: cirílico)
 *   مَرْحَبًا  → mantém as harakat (intacto: árabe)
 *
 * O árabe é preservado por dois motivos: as harakat vivem em U+064B–U+0652,
 * fora da faixa que se costuma limpar, e a base delas não é latina.
 */

/** Marcas combinantes que seguem uma letra latina. */
const LATIN_WITH_MARKS = /(\p{Script=Latin})\p{M}+/gu;

/**
 * Texto pronto para comparar: minúsculas, sem diacrítico latino, sem espaço
 * sobrando nas bordas. Os dois lados da comparação passam por aqui.
 */
export const normalizeForSearch = (value: string): string =>
  value
    .normalize('NFD')
    .replace(LATIN_WITH_MARKS, '$1')
    .toLowerCase()
    .trim();

/** Casamento parcial, em qualquer posição, já normalizado dos dois lados. */
export const matchesSearch = (haystack: string, normalizedNeedle: string): boolean =>
  haystack.includes(normalizedNeedle);

/** Abaixo disto a busca não vale a pena: "a" traz meio catálogo. */
export const MIN_SEARCH_LENGTH = 2;

/** Teto de cards renderizados. Acima disso o app avisa quantos existem. */
export const MAX_SEARCH_RESULTS = 50;
