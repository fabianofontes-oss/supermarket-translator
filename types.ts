
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

/**
 * Existência do produto no país de destino.
 *
 * Substitui os marcadores `PROIBIDO`/`NOT SOLD` que ficavam escondidos dentro
 * do texto traduzido. O significado foi lido do próprio catálogo, não presumido:
 *
 * - `not-authorized`  o princípio ativo não é autorizado naquele país
 *   (era `PROIBIDO`: metamizol no Reino Unido, EUA e França; etoricoxibe nos EUA).
 * - `not-marketed`    o produto até poderia existir, mas aquela marca/associação
 *   não é comercializada ali (era `NOT SOLD`: o Dorflex fora do Brasil).
 *
 * Nenhum dos dois diz nada sobre farmácia vender ou exigir receita. O app não
 * tem essa informação e não a inventa.
 */
export type ProductExistence = 'not-authorized' | 'not-marketed';

/**
 * Restrição para LEVAR/IMPORTAR o produto para o país.
 * Conceito diferente de existir ali. **Nenhum item do catálogo tem este dado
 * hoje** — o campo existe porque é uma das perguntas que o app se propõe a
 * responder, e para que ninguém volte a espremer isso dentro da tradução.
 */
export type TravelRestriction = 'restricted';

export interface CountryAvailability {
  exists?: ProductExistence;
  travel?: TravelRestriction;
  /** O que o catálogo já sugeria no lugar. Vem do dado, não é recomendação nova. */
  alternative?: string;
  /** O catálogo nunca teve o nome local desta combinação item × país. */
  localNameUnknown?: true;
  /** Conteúdo ambíguo na origem: precisa de revisão humana. */
  needsReview?: true;
}

/** Chave = código do país de DESTINO. Ausente = disponível normalmente. */
export type AvailabilityByCountry = Record<string, CountryAvailability>;

export interface TranslationItem {
  key: string;
  source_term: string;
  translated_term: string;
  image: string;
  category?: string;
  subCategory?: string;
  gender_pt?: 'm' | 'f';
  phonetic?: string;
  /**
   * Mapa por país inteiro, e não o estado já resolvido: favoritos e lista
   * guardam o item no localStorage, e a resolução precisa acontecer contra o
   * destino atual — senão a restrição da Espanha reapareceria na França.
   */
  availability?: AvailabilityByCountry;
}
