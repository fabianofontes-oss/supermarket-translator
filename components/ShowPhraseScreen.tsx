import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDialog } from '../hooks/useDialog';
import { usePresenca } from '../hooks/usePresenca';
import { useFalando } from '../utils/audioState';
import { playSound } from '../utils/soundUtils';

type Glyph = React.FC<{ className?: string }>;

export interface ShowPhraseScreenProps {
  aberto: boolean;
  /** A frase no idioma de destino. É ela que a pessoa do outro lado lê. */
  frase: string;
  /** A glosa na língua de quem mostra, para conferir. `null` quando coincidem. */
  glosa: string | null;
  onFechar: () => void;
  onOuvir: () => void;
  Listen: Glyph;
  listenLabel: string;
  t: (key: string) => string;
  theme: { color: string; hex: string };
}

/**
 * Degraus de 48, 36, 32 e 28px. Mesma ideia do `PhraseCard`, um andar acima: a
 * escala sai do comprimento da frase, porque "¿Le duele algo?" cabe enorme e a
 * frase da Maquiagem com tudo escolhido, não.
 *
 * `leading-tight` sempre: o `text-5xl` do Tailwind vem com entrelinha 1, e
 * frase de duas linhas a 48px encavala sem ela.
 */
const escalaGrande = (frase: string): string => {
  const n = frase.length;
  if (n <= 24) return 'text-5xl leading-tight';
  if (n <= 48) return 'text-4xl leading-tight';
  if (n <= 90) return 'text-[32px] leading-tight';
  return 'text-[28px] leading-snug';
};

/**
 * Frases com a tela "Mostrar" aberta agora.
 *
 * Existe para um caminho só: ela está NA tela Mostrar, toca no alto-falante, o
 * som falha e sobe a folha "Sem som agora" — cujo botão principal é "Mostrar a
 * frase". Sem esta lista, o botão abria uma segunda tela igual por cima da
 * primeira, e para voltar ao módulo era preciso fechar duas vezes a mesma coisa.
 */
const emTela: string[] = [];

/** A frase já está em tela cheia? Então "Mostrar a frase" só precisa fechar a folha. */
export const fraseJaNaTela = (frase: string): boolean => emTela.includes(frase);

/**
 * A tela "Mostrar": a frase em letra enorme, para virar o celular para a outra
 * pessoa.
 *
 * É a outra metade do uso do app, e até aqui só existia escrita num canto da
 * Maquiagem. Com alguém esperando no balcão — e com o som falhando, que é o
 * normal num celular sem a voz do país —, mostrar a tela é o que resolve.
 *
 * Tela cheia, fundo branco, nada além da frase: quem lê é um desconhecido, a um
 * braço de distância, e não deve ter mais nada em que prestar atenção.
 *
 * Portal no `document.body`: o cartão da frase vive dentro da banda fixa da
 * moldura, que tem `overflow` e `z-20`, e um `fixed` lá dentro ficaria preso.
 *
 * `z-[108]`: acima das folhas que a pessoa abre (ShareSheet 105) e ABAIXO da
 * "Sem som agora" (110), porque o alto-falante daqui pode falhar e a folha
 * precisa aparecer por cima. O `useDialog` cuida de só a de cima ouvir o Esc.
 *
 * Exportado para a folha "Sem som agora" reaproveitar: o botão principal dela
 * abre esta mesma tela com a frase que falhou.
 */
export const ShowPhraseScreen: React.FC<ShowPhraseScreenProps> = ({
  aberto, frase, glosa, onFechar, onOuvir, Listen, listenLabel, t, theme,
}) => {
  const fechar = () => { playSound('pop'); onFechar(); };
  const panelRef = useDialog(aberto, fechar);
  const { montado, saindo } = usePresenca(aberto);
  const titleId = useId();

  // Quem abriu costuma zerar a frase no mesmo instante em que fecha, e a tela
  // ainda tem 200ms de saída pela frente. Segura o último valor visível.
  const ultimo = useRef({ frase, glosa });
  if (aberto) ultimo.current = { frase, glosa };
  const { frase: f, glosa: g } = ultimo.current;

  const falando = useFalando(f);

  useEffect(() => {
    if (!aberto) return;
    emTela.push(frase);
    return () => {
      const i = emTela.lastIndexOf(frase);
      if (i >= 0) emTela.splice(i, 1);
    };
  }, [aberto, frase]);

  if (!montado || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[108] bg-white dark:bg-slate-900 ${saindo ? 'animate-fade-out pointer-events-none' : 'animate-fade-in'}`}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="h-full w-full max-w-3xl mx-auto flex flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <h2
          id={titleId}
          className="text-base font-bold text-center"
          style={{ color: 'var(--tema-texto)' }}
          dir="auto"
        >
          {t('showTitle')}
        </h2>

        {/* `my-auto` num filho, e não `justify-center` no pai: com a frase maior
            que a tela, o `justify-center` corta o TOPO fora do alcance da
            rolagem, e o topo é justamente o começo da frase. */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col">
          <div className="my-auto flex flex-col items-center gap-5 py-6 text-center">
            <p
              className={`${escalaGrande(f)} font-bold tracking-tight text-balance break-words text-gray-900 dark:text-white`}
              dir="auto"
            >
              {f}
            </p>
            {g && <p className="text-lg leading-snug text-gray-700 dark:text-slate-200" dir="auto">{g}</p>}
            <button
              onClick={onOuvir}
              aria-label={listenLabel}
              aria-busy={falando}
              className={`hit p-4 rounded-full text-white shadow-md tap active:scale-90 ${theme.color}`}
            >
              <Listen className={`w-8 h-8 ${falando ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>

        <button
          onClick={fechar}
          className={`w-full min-h-[52px] rounded-2xl text-base font-bold text-white shadow-md tap active:scale-[0.98] ${theme.color}`}
        >
          {t('showClose')}
        </button>
      </div>
    </div>,
    document.body,
  );
};
