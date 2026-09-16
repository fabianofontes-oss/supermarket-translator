import React from 'react';

// Glifos dos 14 objetos do cuidado.
//
// Ficam aqui, e não em `components/Icons.tsx`, para caírem no pedaço adiado deste
// módulo e não pesarem no pacote inicial do hub — mesma razão de `MakeupGlyphs.tsx`.
//
// Por que desenho e não emoji: emoji tem cadeira de rodas e pouco mais. Não tem
// andador, resguardo de cama, comadre, grade de cama, tapete antiderrapante nem
// caixa de comprimidos — e são justamente esses os nomes que ninguém sabe dizer.
// Num módulo cujo ponto é reconhecer o objeto, metade da lista ficaria muda.
//
// Convenção do projeto (AGENTS.md §7.2): viewBox 24, strokeWidth 1.8,
// stroke="currentColor". Nenhum `id` e nenhum `<defs>`: o defeito 8.19 (dois SVG
// recortando pelo mesmo `id`) deixa de existir por construção.

type GlyphProps = { className?: string };

const svg = (d: React.ReactNode) => {
  const G: React.FC<GlyphProps> = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      strokeWidth={1.8} stroke="currentColor"
      strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true"
    >
      {d}
    </svg>
  );
  return G;
};

// --- andar -----------------------------------------------------------------

/** Andador: quadro em U com duas pernas e travessa. As quatro pontas no chão
 *  são a informação — é o que o separa da bengala e da cadeira. */
export const AndadorGlyph = svg(<>
  <path d="M5 5v14" />
  <path d="M19 5v14" />
  <path d="M5 5h14" />
  <path d="M5 12h14" />
  <path d="M3 19h4" />
  <path d="M17 19h4" />
</>);

/** Cadeira de rodas: roda grande, assento e encosto. */
export const CadeiraRodasGlyph = svg(<>
  <circle cx="9" cy="17" r="4.5" />
  <path d="M9 17h6l3-5" />
  <path d="M12 12V4h-3" />
  <path d="M15 12h-6" />
  <circle cx="18.5" cy="19.5" r="1.5" />
</>);

/** Bengala: cabo curvo em J. O cabo é o desenho todo — sem ele lê como vareta. */
export const BengalaGlyph = svg(<>
  <path d="M8 21V8a4 4 0 0 1 8 0v1" />
  <path d="M6 21h4" />
</>);

/** Corrimão: barra contínua com dois suportes na parede. */
export const CorrimaoGlyph = svg(<>
  <path d="M3 9h18" />
  <path d="M7 9v5" />
  <path d="M17 9v5" />
  <path d="M5 14h4" />
  <path d="M15 14h4" />
  <path d="M3 20h18" />
</>);

// --- cama ------------------------------------------------------------------

/** Resguardo de cama: retângulo com o canto dobrado e o miolo tramado. */
export const ResguardoGlyph = svg(<>
  <path d="M4 5h11l5 5v9H4z" />
  <path d="M15 5v5h5" />
  <path d="M7 13h6" />
  <path d="M7 16h9" />
</>);

/** Grade de cama: cabeceira com barras verticais junto ao colchão. */
export const GradeCamaGlyph = svg(<>
  <path d="M3 8v8" />
  <path d="M15 8v6" />
  <path d="M3 9h12" />
  <path d="M7 9v5" />
  <path d="M11 9v5" />
  <path d="M3 16h18v4" />
  <path d="M17 16v-2h4" />
</>);

/** Comadre: bacia baixa de borda larga, vista de lado. */
export const ComadreGlyph = svg(<>
  <path d="M4 11h16" />
  <path d="M5.5 11c0 4 2.5 6 6.5 6s6.5-2 6.5-6" />
  <path d="M4 11c0-1.2 1-2 2.5-2" />
  <path d="M20 11c0-1.2-1-2-2.5-2" />
  <path d="M8 20h8" />
</>);

/** Fralda geriátrica: peça em ampulheta com as abas laterais. */
export const AbsorventeGlyph = svg(<>
  <path d="M6 4h12" />
  <path d="M6 4c0 4-3 4-3 7 0 5 4 9 9 9s9-4 9-9c0-3-3-3-3-7" />
  <path d="M9 12h6" />
</>);

// --- saúde -----------------------------------------------------------------

/** Medidor de pressão: braçadeira com mangueira e mostrador redondo. */
export const TensiometroGlyph = svg(<>
  <path d="M3 8h10v8H3z" />
  <path d="M3 12h10" />
  <path d="M13 10c4 0 3 4 5 4" />
  <circle cx="19.5" cy="15.5" r="3.5" />
  <path d="M19.5 14v1.5l1 1" />
</>);

/** Caixa de comprimidos: estojo dividido em compartimentos com tampas. */
export const PastilheiroGlyph = svg(<>
  <path d="M3 8h18v10H3z" />
  <path d="M3 12h18" />
  <path d="M9 8v10" />
  <path d="M15 8v10" />
  <path d="M6 5v3" />
  <path d="M18 5v3" />
</>);

/** Termômetro: haste graduada com bulbo. */
export const TermometroGlyph = svg(<>
  <path d="M12 3a2.5 2.5 0 0 1 2.5 2.5v8a4.5 4.5 0 1 1-5 0v-8A2.5 2.5 0 0 1 12 3z" />
  <circle cx="12" cy="17.5" r="1.8" />
  <path d="M16.5 7H19" />
  <path d="M16.5 10H19" />
</>);

// --- banho -----------------------------------------------------------------

/** Cadeira de banho: assento com pés altos e furos de escoamento. */
export const CadeiraBanhoGlyph = svg(<>
  <path d="M4 10h16" />
  <path d="M4 10v3" />
  <path d="M20 10v3" />
  <path d="M6 13v7" />
  <path d="M18 13v7" />
  <path d="M8 7v3" />
  <path d="M8 7h8v3" />
  <circle cx="10" cy="11.6" r=".6" fill="currentColor" stroke="none" />
  <circle cx="14" cy="11.6" r=".6" fill="currentColor" stroke="none" />
</>);

/** Tapete antiderrapante: retângulo com ventosas em baixo-relevo. */
export const TapeteGlyph = svg(<>
  <path d="M3 6h18v12H3z" />
  <circle cx="8" cy="10" r=".9" />
  <circle cx="12" cy="10" r=".9" />
  <circle cx="16" cy="10" r=".9" />
  <circle cx="8" cy="14" r=".9" />
  <circle cx="12" cy="14" r=".9" />
  <circle cx="16" cy="14" r=".9" />
</>);

/** Babador: peça arredondada com abertura de pescoço e bolso de aparar. */
export const BabadorGlyph = svg(<>
  <path d="M9 4a3 3 0 0 0 6 0" />
  <path d="M9 4c-3 1-5 4-5 8 0 4.5 3.5 8 8 8s8-3.5 8-8c0-4-2-7-5-8" />
  <path d="M6.5 15h11" />
</>);

/** Mapa objeto → glifo. Chave igual à de `CARE_TOOLS`. */
export const TOOL_GLYPHS: Record<string, React.FC<GlyphProps>> = {
  walker: AndadorGlyph,
  wheelchair: CadeiraRodasGlyph,
  cane: BengalaGlyph,
  handrail: CorrimaoGlyph,
  bedPad: ResguardoGlyph,
  bedRail: GradeCamaGlyph,
  bedpan: ComadreGlyph,
  pad: AbsorventeGlyph,
  bpMonitor: TensiometroGlyph,
  pillBox: PastilheiroGlyph,
  thermometer: TermometroGlyph,
  showerChair: CadeiraBanhoGlyph,
  nonSlipMat: TapeteGlyph,
  bib: BabadorGlyph,
};
