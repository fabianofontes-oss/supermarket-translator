// Catálogo do Supermercado e da Farmácia.
// Fica separado de constants.ts porque são 1.333 itens: só o CatalogModule
// precisa deles, e o hub não deve pagar esse peso para abrir.

import { groceryData } from '../modules/supermarket/data/groceryData';
import { beveragesData } from '../modules/supermarket/data/beveragesData';
import { bakeryData } from '../modules/supermarket/data/bakeryData';
import { hygieneData } from '../modules/supermarket/data/hygieneData';
import { cleaningData } from '../modules/supermarket/data/cleaningData';
import { produceData } from '../modules/supermarket/data/produceData';
import { butcherData } from '../modules/supermarket/data/butcherData';
import { refrigeratedData } from '../modules/supermarket/data/refrigeratedData';
import { phrasesData } from '../modules/supermarket/data/phrasesData';
import { painFeverData, coldFluData, allergyData, digestiveData, chronicData } from '../modules/pharmacy/data/medicineData';
import { firstAidData } from '../modules/pharmacy/data/firstAidData';
import { skinData, intimateData } from '../modules/pharmacy/data/cosmeticsData';

// Pre-populated data for offline-first experience
// Merged data from all modules
export const PREPOPULATED_TRANSLATIONS: Record<string, Record<string, { source_term: string; image: string; translations: Record<string, string>; gender_pt: 'm' | 'f'; phonetics?: Record<string, string> }[]>> = {
  // Supermarket
  produce: produceData,
  butcher: butcherData,
  refrigerated: refrigeratedData,
  grocery: groceryData,
  beverages: beveragesData,
  bakery: bakeryData,
  personalHygiene: hygieneData,
  homeCleaning: cleaningData,
  
  // Pharmacy
  chronic: chronicData,
  painFever: painFeverData,
  coldFlu: coldFluData,
  allergy: allergyData,
  stomach: digestiveData,
  firstAid: firstAidData,
  skin: skinData,
  intimate: intimateData,

  phrases: phrasesData
};
