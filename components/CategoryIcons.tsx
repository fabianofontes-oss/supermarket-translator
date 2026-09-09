import React from 'react';

/**
 * Ícones das categorias de catálogo.
 *
 * Ficam fora de Icons.tsx de propósito: aquele arquivo é importado pelo App e
 * entra no pedaço inicial, enquanto estes 17 só existem dentro do módulo de
 * catálogo, que é carregado sob demanda.
 *
 * Convenção do projeto: 24x24, fill="none", strokeWidth 1.8, stroke currentColor.
 */
// --- Categorias do Supermercado ---------------------------------------------

export const LeafIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-8 5-13 16-14 1 10-4 15-11 15a6 6 0 0 1-5-1Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c3-5 7-8 12-10" />
  </svg>
);

export const MeatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 4.5c5 0 10 3.5 10 8 0 3.5-3 6.5-7 6.5-5 0-9-3.5-9-7.5 0-4 2.5-7 6-7Z" />
    <circle cx="8" cy="12" r="2.5" />
  </svg>
);

export const SnowflakeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5v19M3.8 7.2l16.4 9.6M20.2 7.2 3.8 16.8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5 9.5 4.5M12 6.5l2.5-2M12 17.5 9.5 19.5M12 17.5l2.5 2" />
  </svg>
);

export const CanIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <ellipse cx="12" cy="5.5" rx="6" ry="2.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 5.5v13c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-13" />
    <path strokeLinecap="round" d="M6 11.8c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5" />
  </svg>
);

export const BottleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 2.5h4v3.2c0 1 .4 1.6 1 2.3.9 1 1.5 2 1.5 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 7.5 20.5v-9c0-1.5.6-2.5 1.5-3.5.6-.7 1-1.3 1-2.3V2.5Z" />
    <path strokeLinecap="round" d="M7.5 13.5h9" />
  </svg>
);

export const BreadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 11.5C4 8 7.6 6 12 6s8 2 8 5.5c0 1.4-1 2-2 2v5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 18.5v-5c-1 0-2-.6-2-2Z" />
    <path strokeLinecap="round" d="M9 10.5c.8-.8 1.8-1.2 3-1.2s2.2.4 3 1.2" />
  </svg>
);

export const SoapIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 2.5h6v2.6c0 .9.5 1.5 1.2 2.1A4 4 0 0 1 17.5 10v9.5a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V10a4 4 0 0 1 1.3-2.8C8.5 6.6 9 6 9 5.1V2.5Z" />
    <path strokeLinecap="round" d="M6.5 12h11" />
  </svg>
);

export const SprayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5h5.5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 7.5V4.5h4M18.5 3.5H20M18.5 6.5h2M19 9.5h1.5" />
  </svg>
);

export const SpeechIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 12c0 4-3.8 7.2-8.5 7.2-1 0-2-.15-2.9-.42L4 20.5l1.5-3.7A6.9 6.9 0 0 1 3.5 12C3.5 8 7.3 4.8 12 4.8s8.5 3.2 8.5 7.2Z" />
    <path strokeLinecap="round" d="M8.5 11h7M8.5 14h4" />
  </svg>
);

// --- Categorias da Farmácia -------------------------------------------------

export const HeartPulseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 9.2c0 4.6-6.2 8.6-8.5 10.3-2.3-1.7-8.5-5.7-8.5-10.3a4.7 4.7 0 0 1 8.5-2.8 4.7 4.7 0 0 1 8.5 2.8Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.8 12h3.4l1.6-2.6 2 5 1.6-3.2h3.6" />
  </svg>
);

export const ThermometerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.2 14.6V4.7a2.2 2.2 0 0 0-4.4 0v9.9a4.4 4.4 0 1 0 4.4 0Z" />
    <path strokeLinecap="round" d="M12 9.2v7.6M16.6 6.6h1.8M16.6 10.2h1.2" />
  </svg>
);

export const NoseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3.5v6.2c0 1.3.5 2 1.4 3 .9 1 1.4 1.9 1.4 3.1a4.3 4.3 0 0 1-4.3 4.3H10a4 4 0 0 1-4-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.8 15.8h-2M6 6.5c-.9 1.4-1.4 3-1.4 4.7" />
  </svg>
);

export const PollenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <circle cx="12" cy="12" r="2.6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.4c0-3 1.2-4.6 3-4.6s2.4 2.5.6 4.2M14.6 12c3 0 4.6 1.2 4.6 3s-2.5 2.4-4.2.6M12 14.6c0 3-1.2 4.6-3 4.6s-2.4-2.5-.6-4.2M9.4 12c-3 0-4.6-1.2-4.6-3s2.5-2.4 4.2-.6" />
  </svg>
);

export const StomachIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.5v4.2c-2.6.8-4.4 3-4.4 5.8 0 3.4 2.6 6 6 6 3.8 0 5.6-2.4 5.6-5.2 0-2-1.2-3-1.2-4.6 0-1.4 1-2 2.4-2" />
    <path strokeLinecap="round" d="M7.2 4h3.6" />
  </svg>
);

export const BandageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <rect x="2.6" y="8.4" width="18.8" height="7.2" rx="3.6" transform="rotate(-45 12 12)" />
    <path strokeLinecap="round" d="M9.6 9.6h.01M12 12h.01M14.4 14.4h.01M14.4 9.6h.01M9.6 14.4h.01" />
  </svg>
);

export const SkinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 15.5c2.8-2 5.6-2 8.5 0s5.7 2 8.5 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 19.5c2.8-2 5.6-2 8.5 0s5.7 2 8.5 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5v3M8.6 5.4l1.5 2.6M15.4 5.4l-1.5 2.6" />
  </svg>
);

export const IntimateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.5-2-7-5.4-7-9.6V5.6L12 3l7 2.6v5.8c0 4.2-2.5 7.6-7 9.6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.4 11.8c0-1.4 1.2-2.4 2.6-2.4s2.6 1 2.6 2.4c0 2-2.6 3.6-2.6 3.6s-2.6-1.6-2.6-3.6Z" />
  </svg>
);
