import { useEffect, useRef, useState } from 'react';

/**
 * Mantém o componente montado enquanto ele sai.
 *
 * As seis sobreposições do app entravam em 250ms e sumiam no mesmo quadro:
 * `if (!isOpen) return null` desmonta antes de qualquer animação de saída
 * começar a existir. Abrir era suave, fechar era um corte — e fechar é a
 * metade do gesto que a pessoa faz mais vezes.
 *
 * A gaveta do `ModuleLayout` já fazia certo, e é de lá que vem o formato:
 * ela nunca desmonta, só desliza para fora com `translateY(100%)`, e por isso
 * pôde ter entrada e saída com durações diferentes (450ms e 250ms). Este hook
 * dá o mesmo a quem precisa desmontar de verdade.
 *
 * A saída é mais curta que a entrada de propósito. Quem fecha já decidiu; é o
 * sistema respondendo, e resposta do sistema é rápida. Quem abre está sendo
 * levado para outro lugar, e aí cabe um tempo maior.
 *
 * Devolve `montado` (renderizar ou não) e `saindo` (qual animação aplicar).
 */
export const usePresenca = (isOpen: boolean, duracao = 200) => {
  const [montado, setMontado] = useState(isOpen);
  const [saindo, setSaindo] = useState(false);

  // Ler `montado` dentro do efeito sem pô-lo nas dependências: com ele na
  // lista, o efeito se reagenda ao terminar a saída e o timer nunca assenta.
  const montadoRef = useRef(montado);
  montadoRef.current = montado;

  useEffect(() => {
    if (isOpen) {
      setMontado(true);
      setSaindo(false);
      return;
    }

    // Fechado e já desmontado é o estado inicial de toda folha do app: não há
    // saída para animar, e sem esta guarda toda tela do app agendaria um timer
    // na primeira renderização.
    if (!montadoRef.current) return;

    setSaindo(true);
    const timer = window.setTimeout(() => {
      setMontado(false);
      setSaindo(false);
    }, duracao);

    // Reabrir no meio da saída cancela o desmonte: o ramo de cima assume e a
    // folha volta sem piscar.
    return () => window.clearTimeout(timer);
  }, [isOpen, duracao]);

  return { montado, saindo };
};
