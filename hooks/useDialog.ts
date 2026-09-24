import { useEffect, useRef } from 'react';

/**
 * Comportamento de diálogo modal: foco entra, foco não escapa, Esc fecha,
 * foco volta para quem abriu.
 *
 * Estava escrito à mão dentro do `CategorySheet`, que era o único diálogo de
 * verdade do app. Agora é um hook porque o painel de idiomas e o modal de
 * instalação precisam exatamente do mesmo comportamento — e duplicar isso três
 * vezes é como as três telas saem de sincronia.
 *
 * Devolve a ref que deve ir no elemento do painel: é ela que delimita o foco.
 *
 * **Só o diálogo de cima responde ao teclado.** Duas camadas abertas ao mesmo
 * tempo agora é caminho previsto, não acidente: na tela "Mostrar" o alto-falante
 * pode falhar e abrir a folha "Sem som agora" por cima. Sem a pilha, o Esc
 * fecharia as duas de uma vez e os dois traps de Tab disputariam o foco.
 */

/** Diálogos abertos, do mais antigo para o mais novo. O último é o de cima. */
const pilha: symbol[] = [];

export const useDialog = (
  isOpen: boolean,
  onClose: () => void,
  /** Para onde levar o foco ao abrir. Sem ela, vai para o primeiro focável. */
  initialFocusRef?: React.RefObject<HTMLElement | null>,
) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const idRef = useRef<symbol | null>(null);
  if (!idRef.current) idRef.current = Symbol('dialogo');
  // `onClose` costuma ser recriada a cada render; guardar numa ref evita
  // religar o listener de teclado e perder o Esc entre renders.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Ao abrir, guarda quem tinha o foco e leva o foco para dentro do diálogo.
  useEffect(() => {
    if (!isOpen) return;
    restoreFocusTo.current = document.activeElement as HTMLElement | null;

    const timer = window.setTimeout(() => {
      const alvo = initialFocusRef?.current
        ?? panelRef.current?.querySelector<HTMLElement>(focusableSelector);
      alvo?.focus();
    }, 60);

    return () => {
      window.clearTimeout(timer);
      restoreFocusTo.current?.focus?.();
    };
  }, [isOpen, initialFocusRef]);

  // Esc fecha, e o Tab circula dentro do painel em vez de escapar para a página.
  useEffect(() => {
    if (!isOpen) return;
    const id = idRef.current!;
    pilha.push(id);

    const onKeyDown = (e: KeyboardEvent) => {
      if (pilha[pilha.length - 1] !== id) return;
      if (e.key === 'Escape') { e.preventDefault(); onCloseRef.current(); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const items = panelRef.current.querySelectorAll<HTMLElement>(focusableSelector);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const i = pilha.lastIndexOf(id);
      if (i >= 0) pilha.splice(i, 1);
    };
  }, [isOpen]);

  return panelRef;
};

const focusableSelector =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
