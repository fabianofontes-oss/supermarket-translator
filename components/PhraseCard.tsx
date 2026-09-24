import React from 'react';

/**
 * O cartão da frase — o herói de toda tela dos módulos generativos.
 *
 * ---------------------------------------------------------------------------
 * A IDEIA: o tamanho da frase sai do comprimento da própria frase
 * ---------------------------------------------------------------------------
 * Antes era `text-xl` fixo, 20px, em nove módulos. Num app cujo produto É a
 * frase, o herói estava menor que o corpo de texto de um site de notícias — e o
 * público lê de óculos, de pé, no corredor do supermercado.
 *
 * Mas não dá para simplesmente aumentar: a Maquiagem com todas as dimensões
 * escolhidas produz uns 126 caracteres ("Busco una base de maquillaje de tono
 * claro, de subtono frío, de cobertura media, con acabado mate, para piel grasa,
 * por favor."), e a 30px isso viraria oito linhas empurrando a tela toda.
 *
 * Então a escala é do CONTEÚDO: comando curto fica grande e confiante,
 * especificação longa fica calma e legível. "¿Le duele algo?" merece 30px;
 * a frase da maquiagem, não. É a mesma decisão que um cartaz toma sozinho.
 *
 * Contar caracteres funciona como medida porque **a frase falada é sempre em
 * alfabeto latino**: ucraniano, árabe e lituano são `originOnly` e nunca podem
 * ser destino. A linha de apoio, essa sim pode ser cirílica ou árabe, e por isso
 * fica em tamanho fixo — o `index.css` já a aumenta nesses dois idiomas.
 */

type Theme = { color: string; textColor: string; hex: string; borderColor: string };
type Glyph = React.FC<{ className?: string }>;

/** Degraus de 30, 24, 20 e 18px. O corte é por comprimento, não por módulo. */
const escala = (frase: string): string => {
  const n = frase.length;
  if (n <= 30) return 'text-3xl';
  if (n <= 58) return 'text-2xl';
  if (n <= 100) return 'text-xl';
  return 'text-lg';
};

export const PhraseCard: React.FC<{
  theme: Theme;
  /** A frase no idioma de destino. É ela que manda no tamanho. */
  phrase: string;
  /** A glosa na língua de quem lê. `null` quando os dois idiomas coincidem. */
  alt: string | null;
  Listen: Glyph;
  listenLabel: string;
  onSpeak: (text: string) => void;
  /** Linha extra do módulo: a pergunta do "Onde está?", o preço curto dos
   *  Números, o aviso da Maquiagem. Entra abaixo, dentro do mesmo cartão. */
  children?: React.ReactNode;
}> = ({ theme, phrase, alt, Listen, listenLabel, onSpeak, children }) => (
  <div className={`rounded-3xl p-4 text-white shadow-md ${theme.color}`}>
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        {/* `text-balance` reparte as linhas por igual: sem ele a última linha de
            uma frase de três costuma sobrar com uma palavra sozinha. */}
        <p className={`${escala(phrase)} font-bold leading-snug tracking-tight text-balance`} dir="auto">
          {phrase}
        </p>
        {/* Branco cheio, e isso foi MEDIDO, não escolhido: a 75% de opacidade a
            glosa dá 3,2–3,4:1 sobre a cor dos módulos, abaixo dos 4,5 exigidos, e
            só volta a passar perto de 95% — que é branco. A hierarquia já está
            feita pelo tamanho (30 contra 14) e pelo peso; a opacidade era
            acessório, e acessório que reprova em contraste sai. */}
        {alt && <p className="text-sm text-white mt-1.5 leading-snug" dir="auto">{alt}</p>}
      </div>
      <button
        onClick={() => onSpeak(phrase)}
        className="p-3 rounded-full bg-white dark:bg-slate-800 shadow tap active:scale-90 flex-shrink-0"
        style={{ color: 'var(--tema-texto)' }}
        aria-label={listenLabel}
        title={listenLabel}
      >
        <Listen className="w-6 h-6" />
      </button>
    </div>
    {children}
  </div>
);
