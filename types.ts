
export interface Category {
  name: string;
  subCategories: string[];
}

export interface Country {
  name: string;
  lang: string;
  flag: string;
  code: string;
  image: string;
  /** Aparece só em "Eu falo", não em "Estou em" (sem dados de destino ainda). */
  originOnly?: boolean;
}

export interface TranslationItem {
  key: string;
  source_term: string;
  translated_term: string;
  image: string;
  category?: string;
  subCategory?: string;
  gender_pt?: 'm' | 'f';
  phonetic?: string;
}
