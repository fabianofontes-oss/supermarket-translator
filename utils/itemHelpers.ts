
import type { AvailabilityByCountry, Country, TranslationItem } from '../types';
import { makeItemKey } from './itemIdentity';

export const mapTranslationItem = (
  item: {
    source_term: string;
    image: string;
    translations: Record<string, string>;
    phonetics?: Record<string, string>;
    gender_pt?: 'm' | 'f';
    availability?: AvailabilityByCountry;
  },
  category: string,
  subCategory: string,
  nativeCountry: Country,
  targetCountry: Country
): TranslationItem => {
  const baseKey = item.source_term;

  const getTermForCountry = (country: Country): string => {
    // The base term is always pt-BR
    if (country.code === 'br') {
        return baseKey;
    }

    // 1. Try for the specific country code ('cl', 'pt', 'us')
    if (item.translations[country.code]) {
        return item.translations[country.code];
    }

    // 2. If not found, try for the base language ('es', 'en', 'pt')
    const langBase = country.lang.split('-')[0];
    if (item.translations[langBase]) {
        return item.translations[langBase];
    }

    // 3. Inglês é mais útil que português para quem não fala pt (ex.: uk, ar)
    if (item.translations['us'] || item.translations['gb']) {
        return item.translations['us'] || item.translations['gb'];
    }

    // 4. As a final fallback, return the original source term (pt-BR)
    return baseKey;
  };

  const nativeTerm = getTermForCountry(nativeCountry);
  const targetTerm = getTermForCountry(targetCountry);

  // Determine Target Phonetic
  const targetLangBase = targetCountry.lang.split('-')[0];
  let targetPhonetic = '';

  if (item.phonetics) {
    if (item.phonetics[targetCountry.code]) {
      targetPhonetic = item.phonetics[targetCountry.code];
    } else if (item.phonetics[targetLangBase]) {
      targetPhonetic = item.phonetics[targetLangBase];
    } else if (targetLangBase === 'en') {
      targetPhonetic = item.phonetics['us'] || item.phonetics['gb'] || '';
    } else if (targetLangBase === 'pt') {
      targetPhonetic = item.phonetics['pt'] || item.phonetics['br'] || '';
    }
  }

  return {
    // Identidade composta: o mesmo termo aparece em posições diferentes do
    // catálogo e precisa ser um item diferente em cada uma.
    key: makeItemKey(category, subCategory, baseKey),
    source_term: nativeTerm,
    translated_term: targetTerm,
    image: item.image,
    category,
    subCategory,
    gender_pt: item.gender_pt,
    phonetic: targetPhonetic,
    // Mapa inteiro, não o estado já resolvido: o item vai para o localStorage
    // em favoritos e lista, e precisa ser relido contra o destino do momento.
    availability: item.availability,
  };
};