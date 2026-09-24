import React from 'react';

// Glifos dos 21 acessórios.
//
// Ficam aqui, e não em `components/Icons.tsx`, pelo mesmo motivo que
// `CategoryIcons.tsx` existe separado: assim caem no pedaço adiado deste
// módulo e não pesam no pacote inicial do hub.
//
// Por que desenho e não emoji: emoji cobre espelho e esponja, e não cobre
// curvador de cílios, apontador, pinça, brocha, cílios postiços nem nécessaire.
// Metade da lista ficaria ambígua justamente no módulo cujo propósito é
// reconhecer o objeto — e misturar emoji com traço fica visivelmente quebrado.
//
// Convenção do projeto (AGENTS.md §7.2): viewBox 24, strokeWidth 1.8,
// stroke="currentColor". Nenhum `id` e nenhum `<defs>`: o defeito 8.19 (dois
// SVG recortando pelo mesmo `id`) deixa de existir por construção.

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

// --- aplicar ---------------------------------------------------------------

/** Pincel pequeno: cabo fino e ponta em cunha. */
export const PincelGlyph = svg(<>
  <path d="M14.5 3.5 20 9l-7.5 7.5-5.5-5.5z" />
  <path d="M7 11 4.5 17.5 11 15" />
  <path d="m4.5 17.5-1.2 3 3-1.2" />
</>);

/** Brocha: tufo largo em cúpula sobre cabo estreito. A largura é a informação
 *  — é o que separa a brocha do pincel de olho, e é o ponto do verbete. */
export const BrochaGlyph = svg(<>
  <path d="M4 11c0-4.4 3.6-8 8-8s8 3.6 8 8c0 1.7-3.6 3-8 3s-8-1.3-8-3Z" />
  <path d="M7 13.6v2.9h10v-2.9" />
  <path d="M10 16.5h4v4a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z" />
</>);

/** Esponja: gota achatada com poros. */
export const EsponjaGlyph = svg(<>
  <path d="M12 3c4 3.2 6 6 6 9a6 6 0 0 1-12 0c0-3 2-5.8 6-9Z" />
  <path d="M10 12h.01M13.5 14h.01M11 16h.01" />
</>);

/** Aplicador: haste com ponta de espuma oval. */
export const AplicadorGlyph = svg(<>
  <ellipse cx="8" cy="8" rx="3.2" ry="4.4" transform="rotate(-40 8 8)" />
  <path d="M10.5 10.5 20 20" />
</>);

/** Curvador de cílios: aro e braços de tesoura. */
export const CurvadorGlyph = svg(<>
  <path d="M5 9h14" />
  <path d="M7 9c0-2.2 2.2-4 5-4s5 1.8 5 4" />
  <path d="M9 9v4.5M15 9v4.5" />
  <circle cx="9" cy="17" r="2.5" />
  <circle cx="15" cy="17" r="2.5" />
</>);

/** Pinça: dois braços convergindo numa ponta. */
export const PinzaGlyph = svg(<>
  <path d="M9.5 3.5 11.5 15" />
  <path d="M14.5 3.5 12.5 15" />
  <path d="M11.5 15c0 2 .2 3.5.5 5.5.3-2 .5-3.5.5-5.5" />
</>);

/** Apontador: bloco com furo cônico. */
export const ApontadorGlyph = svg(<>
  <rect x="3.5" y="7.5" width="17" height="9" rx="1.5" />
  <path d="M9 7.5 12 12l-3 4.5" />
  <path d="M17 10.5v3" />
</>);

/** Cílios postiços: curva com fios. */
export const CiliosGlyph = svg(<>
  <path d="M3.5 15c3-4 5.7-6 8.5-6s5.5 2 8.5 6" />
  <path d="M5.5 12.5 4 8.5M9 10 8.5 6M12.5 9.3l.5-4M16 10.2l1.3-3.9M19 12.4l2-3.4" />
</>);

// --- cabelo ----------------------------------------------------------------

/** Escova de cabelo: pá oval com cerdas e cabo. */
export const EscovaGlyph = svg(<>
  <ellipse cx="12" cy="8" rx="5.5" ry="5" />
  <path d="M12 13v8" />
  <path d="M8.5 6.5v1.5M12 5.8v1.5M15.5 6.5v1.5M10 9.8v1.5M14 9.8v1.5" />
</>);

/** Pente: lombada e dentes. */
export const PenteGlyph = svg(<>
  <path d="M3.5 8.5h17a1 1 0 0 1 1 1v1.5H2.5V9.5a1 1 0 0 1 1-1Z" />
  <path d="M5 11v6M8 11v8M11 11v6M14 11v8M17 11v6M20 11v8" />
</>);

/** Faixa / diadema: arco com pontas. */
export const FaixaGlyph = svg(<>
  <path d="M3 19c0-6.6 4-11 9-11s9 4.4 9 11" />
  <path d="M3 19v-2.5M21 19v-2.5" />
  <path d="M5.5 13.5c4-2.5 9-2.5 13 0" />
</>);

/** Presilha: garra de cabelo com dentes cruzados. */
export const PresilhaGlyph = svg(<>
  <path d="M5 4.5 19 14" />
  <path d="M5 14 19 4.5" />
  <path d="M5 4.5v10M19 4.5v10" />
  <path d="M7 17.5h10l-1.5 3h-7z" />
</>);

/** Elástico de cabelo: anel torcido. */
export const ElasticoGlyph = svg(<>
  <ellipse cx="12" cy="12" rx="8.5" ry="6" />
  <ellipse cx="12" cy="12" rx="3.5" ry="2.2" />
  <path d="M6 7.5c2 1.5 2 7.5 0 9M18 7.5c-2 1.5-2 7.5 0 9" />
</>);

// --- limpar ----------------------------------------------------------------

/** Demaquilante: frasco com bico e rótulo. */
export const DemaquilanteGlyph = svg(<>
  <path d="M10 2.5h4v3h-4z" />
  <path d="M8 21V9a3.5 3.5 0 0 1 2-3.2V5.5h4v.3A3.5 3.5 0 0 1 16 9v12z" />
  <path d="M8 13h8" />
</>);

/** Disco de algodão: círculos empilhados. */
export const AlgodaoGlyph = svg(<>
  <circle cx="12" cy="9" r="6" />
  <path d="M6.2 11.5c.6 2.6 3 4.5 5.8 4.5s5.2-1.9 5.8-4.5" />
  <path d="M6.2 15c.6 2.6 3 4.5 5.8 4.5s5.2-1.9 5.8-4.5" />
</>);

/** Cotonete: haste com as duas pontas. */
export const CotoneteGlyph = svg(<>
  <path d="M6.5 6.5 17.5 17.5" />
  <ellipse cx="5" cy="5" rx="2.6" ry="2.1" transform="rotate(45 5 5)" />
  <ellipse cx="19" cy="19" rx="2.6" ry="2.1" transform="rotate(45 19 19)" />
</>);

/** Lenço demaquilante: pacote com a folha saindo. */
export const LencoGlyph = svg(<>
  <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
  <path d="M8.5 11h7" />
  <path d="M9.5 7.5V6c0-1.4 1.1-2.5 2.5-2.5S14.5 4.6 14.5 6v1.5" />
</>);

// --- levar e ver -----------------------------------------------------------

/** Espelho de mão: disco com cabo. */
export const EspelhoGlyph = svg(<>
  <circle cx="12" cy="8.5" r="5.5" />
  <path d="M12 14v7" />
  <path d="M10 21h4" />
  <path d="M9.8 7c.5-1.1 1.5-1.8 2.7-1.9" />
</>);

/** Espelho de maquiagem: disco com lâmpadas em volta e pé. */
export const EspelhoMaqGlyph = svg(<>
  <circle cx="12" cy="9.5" r="5" />
  <circle cx="12" cy="2.8" r="0.9" />
  <circle cx="17.2" cy="5.3" r="0.9" />
  <circle cx="17.2" cy="13.7" r="0.9" />
  <circle cx="6.8" cy="5.3" r="0.9" />
  <circle cx="6.8" cy="13.7" r="0.9" />
  <path d="M12 16.5V20M8.5 21h7" />
</>);

/** Nécessaire: bolsa com zíper. */
export const NecessaireGlyph = svg(<>
  <path d="M3.5 9.5h17l-1 9.5a1.5 1.5 0 0 1-1.5 1.3H6a1.5 1.5 0 0 1-1.5-1.3z" />
  <path d="M3.5 9.5 6 6.5h12l2.5 3" />
  <path d="M14.5 12.5h3" />
</>);

/** Estojo: caixa com tampa aberta e espelho. */
export const EstojoGlyph = svg(<>
  <rect x="3.5" y="12" width="17" height="7.5" rx="1.5" />
  <path d="M4.5 12 6 4.8A1.5 1.5 0 0 1 7.5 3.5h9A1.5 1.5 0 0 1 18 4.8L19.5 12" />
  <path d="M9.5 7h5" />
</>);

// ---------------------------------------------------------------------------

/** As chaves são as de `TOOLS` em makeupData.ts. Há teste cobrando paridade. */
export const TOOL_GLYPHS: Record<string, React.FC<GlyphProps>> = {
  pincel: PincelGlyph,
  brocha: BrochaGlyph,
  esponja: EsponjaGlyph,
  aplicador: AplicadorGlyph,
  curvador: CurvadorGlyph,
  pinza: PinzaGlyph,
  apontador: ApontadorGlyph,
  cilios: CiliosGlyph,
  escova: EscovaGlyph,
  pente: PenteGlyph,
  faixa: FaixaGlyph,
  presilha: PresilhaGlyph,
  elastico: ElasticoGlyph,
  demaquilante: DemaquilanteGlyph,
  algodao: AlgodaoGlyph,
  cotonete: CotoneteGlyph,
  lenco: LencoGlyph,
  espelho: EspelhoGlyph,
  espelhoMaq: EspelhoMaqGlyph,
  necessaire: NecessaireGlyph,
  estojo: EstojoGlyph,
};
