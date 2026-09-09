
import type { Category, Country } from './types';

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
