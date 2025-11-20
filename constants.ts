
import type { Category, Country } from './types';
import { groceryData } from './modules/supermarket/data/groceryData';
import { beveragesData } from './modules/supermarket/data/beveragesData';
import { bakeryData } from './modules/supermarket/data/bakeryData';
import { hygieneData } from './modules/supermarket/data/hygieneData';
import { cleaningData } from './modules/supermarket/data/cleaningData';
import { produceData } from './modules/supermarket/data/produceData';
import { butcherData } from './modules/supermarket/data/butcherData';
import { refrigeratedData } from './modules/supermarket/data/refrigeratedData';
import { phrasesData } from './modules/supermarket/data/phrasesData';

// --- REGISTRY OF IMPLEMENTED MODULES ---
// Add a module key here ONLY when you have created its corresponding module file and logic.
// This prevents users from accessing empty placeholders.
export const AVAILABLE_MODULES = [
    'supermarket', 
    // 'pharmacy', // Uncomment when PharmacyModule is ready
];

export const CATEGORIES: Category[] = [
  {
    name: "produce",
    subCategories: ["fruits", "greens", "vegetables", "spices"],
  },
  {
    name: "butcher",
    subCategories: ["beef", "pork", "chicken", "fish"],
  },
  {
    name: "refrigerated",
    subCategories: ["cheeses", "deli", "milkYogurt", "creamsButters"],
  },
  {
    name: "grocery",
    subCategories: ["grainsPasta", "cannedGoods", "saucesOils", "sweetsBiscuits"],
  },
   {
    name: "beverages",
    subCategories: ["waterJuices", "sodas", "alcoholicDrinks"],
  },
  {
    name: "bakery",
    subCategories: ["breads", "cakesSweets"],
  },
  {
    name: "personalHygiene",
    subCategories: ["hair", "bodyBath", "oralHygiene", "specificCare"],
  },
  {
    name: "homeCleaning",
    subCategories: ["laundry", "kitchenBathroom", "general", "accessories"],
  },
  {
    name: "phrases",
    subCategories: ["findingItems", "stock", "prices", "checkout", "details", "services", "social", "location", "quantities", "help"],
  }
];


export const COUNTRIES: Country[] = [
    { name: "Brasil", lang: "pt-BR", flag: "🇧🇷", code: "br", image: "https://cdn-icons-png.flaticon.com/512/197/197386.png" },
    { name: "Chile", lang: "es-CL", flag: "🇨🇱", code: "cl", image: "https://cdn-icons-png.flaticon.com/512/197/197586.png" },
    { name: "Argentina", lang: "es-AR", flag: "🇦🇷", code: "ar", image: "https://cdn-icons-png.flaticon.com/512/197/197573.png" },
    { name: "Reino Unido", lang: "en-GB", flag: "🇬🇧", code: "gb", image: "https://cdn-icons-png.flaticon.com/512/197/197374.png" },
    { name: "Estados Unidos", lang: "en-US", flag: "🇺🇸", code: "us", image: "https://cdn-icons-png.flaticon.com/512/197/197484.png" },
    { name: "Portugal", lang: "pt-PT", flag: "🇵🇹", code: "pt", image: "https://cdn-icons-png.flaticon.com/512/197/197463.png" },
    { name: "Espanha", lang: "es-ES", flag: "🇪🇸", code: "es", image: "https://cdn-icons-png.flaticon.com/512/197/197593.png" },
    { name: "França", lang: "fr-FR", flag: "🇫🇷", code: "fr", image: "https://cdn-icons-png.flaticon.com/512/197/197560.png" },
    { name: "Itália", lang: "it-IT", flag: "🇮🇹", code: "it", image: "https://cdn-icons-png.flaticon.com/512/197/197626.png" },
];

// Pre-populated data for offline-first experience
export const PREPOPULATED_TRANSLATIONS: Record<string, Record<string, { source_term: string; image: string; translations: Record<string, string>; gender_pt: 'm' | 'f'; phonetics?: Record<string, string> }[]>> = {
  produce: produceData,
  butcher: butcherData,
  refrigerated: refrigeratedData,
  grocery: groceryData,
  beverages: beveragesData,
  bakery: bakeryData,
  personalHygiene: hygieneData,
  homeCleaning: cleaningData,
  phrases: phrasesData
};
