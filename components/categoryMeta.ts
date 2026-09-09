import type React from 'react';
import {
  LeafIcon, MeatIcon, SnowflakeIcon, CanIcon, BottleIcon, BreadIcon,
  SoapIcon, SprayIcon, SpeechIcon,
  HeartPulseIcon, ThermometerIcon, NoseIcon, PollenIcon, StomachIcon,
  BandageIcon, SkinIcon, IntimateIcon,
} from './CategoryIcons';

export interface CategoryMeta {
  icon: React.FC<{ className?: string }>;
  /**
   * Classes escritas por extenso. O Tailwind não monta `bg-${cor}`: o projeto
   * já quebrou assim antes e a cor simplesmente some do CSS gerado.
   *
   * Tom 100 de fundo com tom 700 de traço passa em contraste, menos nas cores
   * quentes (âmbar, laranja, lima), que precisam do tom 800.
   */
  iconClass: string;
  /** Frases não é um corredor de loja: ocupa a linha inteira e muda de cara. */
  wide?: boolean;
}

/**
 * A chave é a mesma string usada em `Category.name` e em `translations.ts`.
 * Um vocabulário só, sem tabela de tradução no meio.
 */
export const CATEGORY_META: Record<string, CategoryMeta> = {
  // Supermercado
  produce:         { icon: LeafIcon,       iconClass: 'bg-green-100 text-green-700' },
  butcher:         { icon: MeatIcon,       iconClass: 'bg-red-100 text-red-700' },
  refrigerated:    { icon: SnowflakeIcon,  iconClass: 'bg-sky-100 text-sky-700' },
  grocery:         { icon: CanIcon,        iconClass: 'bg-amber-100 text-amber-800' },
  beverages:       { icon: BottleIcon,     iconClass: 'bg-cyan-100 text-cyan-700' },
  bakery:          { icon: BreadIcon,      iconClass: 'bg-orange-100 text-orange-800' },
  personalHygiene: { icon: SoapIcon,       iconClass: 'bg-violet-100 text-violet-700' },
  homeCleaning:    { icon: SprayIcon,      iconClass: 'bg-teal-100 text-teal-700' },
  phrases:         { icon: SpeechIcon,     iconClass: 'bg-slate-700 text-white', wide: true },

  // Farmácia
  painFever:       { icon: ThermometerIcon, iconClass: 'bg-red-100 text-red-700' },
  coldFlu:         { icon: NoseIcon,       iconClass: 'bg-sky-100 text-sky-700' },
  stomach:         { icon: StomachIcon,    iconClass: 'bg-lime-100 text-lime-800' },
  allergy:         { icon: PollenIcon,     iconClass: 'bg-amber-100 text-amber-800' },
  firstAid:        { icon: BandageIcon,    iconClass: 'bg-rose-100 text-rose-700' },
  skin:            { icon: SkinIcon,       iconClass: 'bg-fuchsia-100 text-fuchsia-700' },
  intimate:        { icon: IntimateIcon,   iconClass: 'bg-purple-100 text-purple-700' },
  chronic:         { icon: HeartPulseIcon, iconClass: 'bg-indigo-100 text-indigo-700' },
};

const FALLBACK: CategoryMeta = { icon: SpeechIcon, iconClass: 'bg-slate-100 text-slate-700' };

/** Nunca indexar direto: uma categoria nova não pode derrubar a tela. */
export const metaFor = (name: string): CategoryMeta => CATEGORY_META[name] ?? FALLBACK;
