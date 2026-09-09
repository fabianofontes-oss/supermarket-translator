
// Módulo "Medidas" — conversão de numeração de calçado e roupa.
// Aviso importante: numeração varia bastante de marca para marca.
// Estes valores servem de ponto de partida, não de garantia.

import type { LangCode } from '../../location/data/locationData';
import { numberToWords } from '../../numbers/data/numbersData';

export type Text = Record<LangCode, string>;

export type SizeSystem = 'BR' | 'EU' | 'UK' | 'US';

export const SYSTEM_LABEL: Record<SizeSystem, string> = {
  BR: 'Brasil', EU: 'Europa', UK: 'Reino Unido', US: 'EUA',
};

/** Qual numeração o país usa. Ucrânia e Marrocos seguem a europeia. */
export const systemForCountry = (code: string): SizeSystem => {
  if (code === 'br' || code === 'ar' || code === 'cl') return 'BR';
  if (code === 'gb') return 'UK';
  if (code === 'us') return 'US';
  return 'EU';
};

export interface SizeRow { BR: string; EU: string; UK: string; US: string; extra?: string }

export interface SizeTable {
  key: string;
  emoji: string;
  /** Espanhol e francês têm palavra própria para numeração de calçado. */
  kind: 'shoe' | 'clothes';
  labels: Text;
  /** Rótulo da coluna extra, se houver. */
  extraLabel?: Text;
  rows: SizeRow[];
}

export const SIZE_TABLES: SizeTable[] = [
  {
    key: 'shoes', emoji: '👟', kind: 'shoe',
    labels: { es: 'calzado', pt: 'calçado', en: 'shoes', fr: 'chaussures', it: 'scarpe', uk: 'взуття', ar: 'الأحذية' },
    extraLabel: { es: 'cm', pt: 'cm', en: 'cm', fr: 'cm', it: 'cm', uk: 'см', ar: 'سم' },
    rows: [
      { BR: '33', EU: '34', UK: '2',    US: '3',    extra: '21,5' },
      { BR: '34', EU: '35', UK: '2,5',  US: '3,5',  extra: '22' },
      { BR: '35', EU: '36', UK: '3,5',  US: '4,5',  extra: '22,5' },
      { BR: '36', EU: '37', UK: '4',    US: '5',    extra: '23,5' },
      { BR: '37', EU: '38', UK: '5',    US: '6',    extra: '24' },
      { BR: '38', EU: '39', UK: '6',    US: '7',    extra: '25' },
      { BR: '39', EU: '40', UK: '6,5',  US: '7,5',  extra: '25,5' },
      { BR: '40', EU: '41', UK: '7,5',  US: '8,5',  extra: '26,5' },
      { BR: '41', EU: '42', UK: '8',    US: '9',    extra: '27' },
      { BR: '42', EU: '43', UK: '9',    US: '10',   extra: '28' },
      { BR: '43', EU: '44', UK: '9,5',  US: '10,5', extra: '28,5' },
      { BR: '44', EU: '45', UK: '10,5', US: '11,5', extra: '29,5' },
      { BR: '45', EU: '46', UK: '11',   US: '12',   extra: '30' },
    ],
  },
  {
    key: 'women', emoji: '👗', kind: 'clothes',
    labels: { es: 'ropa de mujer', pt: 'roupa feminina', en: "women's clothing", fr: 'vêtements femme', it: 'abbigliamento donna', uk: 'жіночий одяг', ar: 'ملابس نسائية' },
    extraLabel: { es: 'letra', pt: 'letra', en: 'letter', fr: 'lettre', it: 'lettera', uk: 'літера', ar: 'حرف' },
    rows: [
      { BR: '36', EU: '34', UK: '6',  US: '2',  extra: 'XS' },
      { BR: '38', EU: '36', UK: '8',  US: '4',  extra: 'S' },
      { BR: '40', EU: '38', UK: '10', US: '6',  extra: 'M' },
      { BR: '42', EU: '40', UK: '12', US: '8',  extra: 'L' },
      { BR: '44', EU: '42', UK: '14', US: '10', extra: 'XL' },
      { BR: '46', EU: '44', UK: '16', US: '12', extra: 'XXL' },
      { BR: '48', EU: '46', UK: '18', US: '14', extra: 'XXXL' },
    ],
  },
  {
    key: 'men', emoji: '👕', kind: 'clothes',
    labels: { es: 'ropa de hombre', pt: 'roupa masculina', en: "men's clothing", fr: 'vêtements homme', it: 'abbigliamento uomo', uk: 'чоловічий одяг', ar: 'ملابس رجالية' },
    extraLabel: { es: 'pecho cm', pt: 'peito cm', en: 'chest cm', fr: 'poitrine cm', it: 'petto cm', uk: 'груди см', ar: 'الصدر سم' },
    rows: [
      { BR: 'PP', EU: '44', UK: 'XS',  US: 'XS',  extra: '86' },
      { BR: 'P',  EU: '46', UK: 'S',   US: 'S',   extra: '92' },
      { BR: 'M',  EU: '48', UK: 'M',   US: 'M',   extra: '98' },
      { BR: 'G',  EU: '50', UK: 'L',   US: 'L',   extra: '104' },
      { BR: 'GG', EU: '52', UK: 'XL',  US: 'XL',  extra: '110' },
      { BR: 'XG', EU: '54', UK: 'XXL', US: 'XXL', extra: '116' },
    ],
  },
];

// ---------------------------------------------------------------------------
// FRASES DA LOJA
// ---------------------------------------------------------------------------
export const SIZE_QUESTIONS: Text[] = [
  { es: '¿Puedo probármelo?', pt: 'Posso experimentar?', en: 'Can I try it on?', fr: "Puis-je l'essayer ?", it: 'Posso provarlo?', uk: 'Можна поміряти?', ar: 'هل يمكنني تجربته؟' },
  { es: '¿Dónde está el probador?', pt: 'Onde fica o provador?', en: 'Where is the fitting room?', fr: 'Où sont les cabines ?', it: "Dov'è il camerino?", uk: 'Де примірочна?', ar: 'أين غرفة القياس؟' },
  { es: 'Me queda grande.', pt: 'Ficou grande em mim.', en: "It's too big.", fr: "C'est trop grand.", it: 'Mi sta grande.', uk: 'Завелике.', ar: 'إنه كبير عليّ.' },
  { es: 'Me queda pequeño.', pt: 'Ficou pequeno em mim.', en: "It's too small.", fr: "C'est trop petit.", it: 'Mi sta piccolo.', uk: 'Замале.', ar: 'إنه صغير عليّ.' },
  { es: '¿Tienen una talla más?', pt: 'Tem um número maior?', en: 'Do you have a bigger size?', fr: 'Avez-vous la taille au-dessus ?', it: 'Avete una taglia in più?', uk: 'Є більший розмір?', ar: 'هل لديكم مقاس أكبر؟' },
  { es: '¿Tienen una talla menos?', pt: 'Tem um número menor?', en: 'Do you have a smaller size?', fr: 'Avez-vous la taille en dessous ?', it: 'Avete una taglia in meno?', uk: 'Є менший розмір?', ar: 'هل لديكم مقاس أصغر؟' },
  { es: '¿Se puede cambiar si no me vale?', pt: 'Dá para trocar se não servir?', en: "Can I exchange it if it doesn't fit?", fr: 'Puis-je l\'échanger si ça ne va pas ?', it: 'Posso cambiarlo se non mi va?', uk: 'Чи можна обміняти, якщо не підійде?', ar: 'هل يمكن استبداله إذا لم يناسبني؟' },
];

export const SIZE_WARNING: Text = {
  es: 'Las tallas cambian mucho de una marca a otra. Pruébate siempre la prenda.',
  pt: 'A numeração muda bastante de marca para marca. Experimente sempre antes de comprar.',
  en: 'Sizes vary a lot between brands. Always try the item on.',
  fr: 'Les tailles varient beaucoup selon les marques. Essayez toujours.',
  it: 'Le taglie cambiano molto tra le marche. Provate sempre il capo.',
  uk: 'Розміри дуже різняться між брендами. Завжди міряйте.',
  ar: 'المقاسات تختلف كثيرًا بين الماركات. جرّب القطعة دائمًا.',
};

// ---------------------------------------------------------------------------
// MONTAGEM DA FRASE
// ---------------------------------------------------------------------------
/** Números vão por extenso; letras (M, XL) vão como estão. */
const spellSize = (lang: LangCode, size: string): string => {
  const n = Number(size.replace(',', '.'));
  if (!Number.isInteger(n)) return size;
  return numberToWords(lang, n);
};

/** "¿Lo tiene en el número cuarenta y dos?" para calçado, "en la talla" para roupa. */
export const buildSizeQuestion = (lang: LangCode, size: string, kind: 'shoe' | 'clothes'): string => {
  const s = spellSize(lang, size);
  const shoe = kind === 'shoe';
  switch (lang) {
    case 'es': return shoe ? `¿Lo tiene en el número ${s}?` : `¿Lo tiene en la talla ${s}?`;
    case 'pt': return shoe ? `Tem no número ${s}?` : `Tem no tamanho ${s}?`;
    case 'en': return `Do you have it in size ${s}?`;
    case 'fr': return shoe ? `Vous l'avez en pointure ${s} ?` : `Vous l'avez en taille ${s} ?`;
    case 'it': return shoe ? `Ce l'ha nel numero ${s}?` : `Ce l'ha nella taglia ${s}?`;
    case 'uk': return `У вас є розмір ${s}?`;
    default:   return `هل لديك مقاس ${s}؟`;
  }
};
