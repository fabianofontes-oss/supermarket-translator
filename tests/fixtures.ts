import type { Country, TranslationItem } from '../types';
import { COUNTRIES } from '../constants';

export const BR = COUNTRIES.find((c) => c.code === 'br')!;
export const ES = COUNTRIES.find((c) => c.code === 'es')!;
export const FR = COUNTRIES.find((c) => c.code === 'fr')!;

/** Item bruto do catálogo, no formato que os arquivos de dados usam. */
export const rawItem = (source_term: string, extra: Partial<Record<string, string>> = {}) => ({
  source_term,
  image: '',
  gender_pt: 'm' as const,
  translations: {
    cl: 'X-cl', ar: 'X-ar', gb: 'X-gb', us: 'X-us',
    pt: 'X-pt', es: 'X-es', fr: 'X-fr', it: 'X-it',
    ...extra,
  },
  phonetics: { br: '/x/' },
});

/** TranslationItem já resolvido, no formato que vai para o localStorage. */
export const storedItem = (
  key: string,
  category: string,
  subCategory: string,
  source_term = key,
): TranslationItem => ({
  key,
  source_term,
  translated_term: 'X-es',
  image: '',
  category,
  subCategory,
  gender_pt: 'm',
  phonetic: '/x/',
});

export const countries: Record<string, Country> = { BR, ES, FR };
