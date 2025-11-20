
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
