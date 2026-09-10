
import type { Category, Country } from './types';

/**
 * URL canônica de produção, usada por tudo que compartilha o app: o QR code, os
 * quatro canais e o texto da mensagem.
 *
 * É constante, e não `window.location.origin`, porque a origem em runtime erra
 * em dois cenários reais: no app nativo (Capacitor) ela é `capacitor://localhost`
 * e num preview da Vercel é o domínio efêmero do deploy. Nos dois casos o QR e o
 * link levariam a lugar nenhum.
 *
 * Sem `?utm_source=`: não há analytics no projeto, e o parâmetro só faria a URL
 * do QR divergir da URL do botão de copiar.
 *
 * Quem mudar isto tem que rodar `node scripts/generate-qr.mjs` de novo — o
 * `tests/share.test.tsx` compara o SVG com esta constante e falha se esquecerem.
 */
export const SHARE_URL = 'https://translator-zeta-weld.vercel.app';

/** QR pré-gerado por `scripts/generate-qr.mjs`. Precacheado pelo service worker. */
export const SHARE_QR_SRC = '/qr-share.svg';

// Pharmacy Data Imports

// --- REGISTRY OF IMPLEMENTED MODULES ---
export const AVAILABLE_MODULES = [
    'supermarket', 
    'pharmacy',
];

export const SUPERMARKET_CATEGORIES: Category[] = [
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

export const CATEGORIES = SUPERMARKET_CATEGORIES; // Alias for existing code compatibility

export const PHARMACY_CATEGORIES: Category[] = [
  {
    name: "chronic",
    subCategories: ["bloodPressure", "cholesterol", "diabetes", "generalHealth"],
  },
  {
    name: "painFever",
    subCategories: ["mildPain", "moderatePain", "musclePain", "fever"],
  },
  {
    name: "coldFlu",
    subCategories: ["nasalCongestion", "dryCough", "chestCough", "fluSymptoms"],
  },
  {
    name: "allergy",
    subCategories: ["rhinitis", "skinAllergy", "eyeAllergy", "allergySpray"],
  },
  {
    name: "stomach",
    subCategories: ["heartburn", "constipation", "diarrhea", "nausea"],
  },
  {
    name: "firstAid",
    subCategories: ["dressings", "antiseptics", "burns", "bruises"],
  },
  {
    name: "skin",
    subCategories: ["healing", "acne", "hydration", "sunProtection"],
  },
  {
    name: "intimate",
    subCategories: ["feminineCare", "condoms", "lubricants", "rapidTests"],
  }
];

export const COUNTRIES: Country[] = [
    { name: "Brasil", lang: "pt-BR", flag: "🇧🇷", code: "br", image: "/flags/br.svg" },
    { name: "Chile", lang: "es-CL", flag: "🇨🇱", code: "cl", image: "/flags/cl.svg" },
    { name: "Argentina", lang: "es-AR", flag: "🇦🇷", code: "ar", image: "/flags/ar.svg" },
    { name: "Reino Unido", lang: "en-GB", flag: "🇬🇧", code: "gb", image: "/flags/gb.svg" },
    { name: "Estados Unidos", lang: "en-US", flag: "🇺🇸", code: "us", image: "/flags/us.svg" },
    { name: "Portugal", lang: "pt-PT", flag: "🇵🇹", code: "pt", image: "/flags/pt.svg" },
    { name: "Espanha", lang: "es-ES", flag: "🇪🇸", code: "es", image: "/flags/es.svg" },
    { name: "França", lang: "fr-FR", flag: "🇫🇷", code: "fr", image: "/flags/fr.svg" },
    { name: "Itália", lang: "it-IT", flag: "🇮🇹", code: "it", image: "/flags/it.svg" },
    { name: "Ucrânia", lang: "uk-UA", flag: "🇺🇦", code: "ua", image: "/flags/ua.svg", originOnly: true },
    { name: "Marrocos", lang: "ar-MA", flag: "🇲🇦", code: "ma", image: "/flags/ma.svg", originOnly: true },
    { name: "Lituânia", lang: "lt-LT", flag: "🇱🇹", code: "lt", image: "/flags/lt.svg", originOnly: true },
];
