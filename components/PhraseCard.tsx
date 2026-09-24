import React, { useState } from 'react';
import { ShowPhraseScreen } from './ShowPhraseScreen';
import { useT } from '../hooks/useT';
import { anotarGlosa, useFalando } from '../utils/audioState';
import { playSound } from '../utils/soundUtils';

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
 *
 * ---------------------------------------------------------------------------
 * O QUE O CARTÃO SABE SEM PROP NENHUMA
 * ---------------------------------------------------------------------------
 * Os dez módulos montam este cartão, e nenhum deles precisou mudar para ele
 * ganhar três coisas:
 *
 * - **Pulsar enquanto o som carrega ou sai**, com `aria-busy`. O estado vem de
 *   `utils/audioState`, que o `App` escreve. Sem isso, o som da rede demorava,
 *   o botão ficava igual, e a pessoa tocava de novo.
 * - **O botão "Mostrar"**, que abre a frase em tela cheia para virar o celular
 *   para quem está do outro lado do balcão. O rótulo vem de `useT`.
 * - **A glosa anotada antes do som**, para a folha "Sem som agora" poder
 *   mostrar a frase inteira, com a glosa, quando o som falha.
 *
 * O rodapé fica alinhado à direita e deixa a esquerda livre de propósito: uma
 * etapa futura põe ali o "☆ Guardar".
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
   *  Números, a nota do acessório da Maquiagem. Entra abaixo, dentro do mesmo cartão. */
  children?: React.ReactNode;
}> = ({ theme, phrase, alt, Listen, listenLabel, onSpeak, children }) => {
  const t = useT();
  const falando = useFalando(phrase);
  const [mostrando, setMostrando] = useState(false);

  const ouvir = () => {
    anotarGlosa(phrase, alt);
    onSpeak(phrase);
  };

  return (
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
          onClick={ouvir}
          className="p-3 rounded-full bg-white dark:bg-slate-800 shadow tap active:scale-90 flex-shrink-0"
          style={{ color: 'var(--tema-texto)' }}
          aria-label={listenLabel}
          aria-busy={falando}
          title={listenLabel}
        >
          {/* O pulso é o "estou carregando" que faltava. Movimento reduzido já
              neutraliza o `animate-pulse` no index.css; o `aria-busy` fica. */}
          <Listen className={`w-6 h-6 ${falando ? 'animate-pulse' : ''}`} />
        </button>
      </div>
      {children}
      {/* Rodapé. Pílula de contorno sobre um véu ESCURO, e não `bg-white/15`: o
          véu claro baixa o contraste do texto branco — no rosa do Onde dói cai
          de 4,7:1 para 4,0:1, reprovado para texto de 14px. Escurecer só sobe. */}
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          onClick={() => { playSound('click'); setMostrando(true); }}
          className="hit px-4 py-1.5 rounded-full border border-white/70 bg-black/10 text-sm font-semibold text-white tap active:scale-95"
        >
          <span dir="auto">{t('show')}</span>
        </button>
      </div>
      <ShowPhraseScreen
        aberto={mostrando}
        frase={phrase}
        glosa={alt}
        onFechar={() => setMostrando(false)}
        onOuvir={ouvir}
        Listen={Listen}
        listenLabel={listenLabel}
        t={t}
        theme={theme}
      />
    </div>
  );
};
