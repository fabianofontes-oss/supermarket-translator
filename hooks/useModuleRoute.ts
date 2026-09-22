import { useCallback, useEffect, useRef, useState } from 'react';
import { type ModuleKey, caminhoDoModulo, moduloDaRota } from '../utils/rotas';

/**
 * O módulo aberto, espelhado na barra de endereço.
 *
 * O porquê de existir rota está em [utils/rotas.ts](../utils/rotas.ts). Aqui
 * está só a ligação com o React, e ela tem três detalhes que não são óbvios.
 *
 * **Não empurra no primeiro render.** A página já está no endereço em que
 * abriu; empilhar uma entrada igual faria o primeiro "voltar" não sair do
 * lugar. Mesma razão do `hidratado` em `useCountryPair`.
 *
 * **`popstate` não é opcional.** É ele que faz o botão voltar do Android
 * devolver ao hub em vez de fechar o app — e, num PWA instalado, fechar por
 * engano parece defeito do app, não do navegador.
 *
 * **Link para módulo bloqueado cai no hub.** Supermercado e Farmácia dependem
 * do catálogo e ficam desativados quando a origem é um país só de origem
 * (ucraniano, marroquino, lituano). O ladrilho já vem desabilitado, mas um link
 * direto driblaria a trava — e a pessoa entraria num módulo sem conteúdo na
 * língua dela. O endereço é corrigido por `replaceState` para a URL não mentir,
 * e com `replace` e não `push` porque um destino que nunca chegou a existir não
 * merece entrada no histórico.
 */
export const useModuleRoute = (estaBloqueado: (modulo: ModuleKey) => boolean) => {
  const [currentModule, setCurrentModule] = useState<ModuleKey | null>(() =>
    typeof window === 'undefined' ? null : moduloDaRota(window.location.pathname),
  );

  // `estaBloqueado` depende do país nativo e muda de identidade a cada render;
  // guardar numa ref mantém os efeitos abaixo fora do laço de dependências.
  const bloqueadoRef = useRef(estaBloqueado);
  bloqueadoRef.current = estaBloqueado;

  const irPara = useCallback((modulo: ModuleKey | null) => {
    setCurrentModule(modulo && bloqueadoRef.current(modulo) ? null : modulo);
  }, []);

  // Chegada por link direto num módulo bloqueado. Roda também quando o país
  // nativo muda: quem troca para ucraniano estando no Supermercado volta ao hub.
  useEffect(() => {
    if (currentModule && bloqueadoRef.current(currentModule)) {
      setCurrentModule(null);
      window.history.replaceState(null, '', '/');
    }
  });

  const hidratado = useRef(false);
  useEffect(() => {
    if (!hidratado.current) { hidratado.current = true; return; }

    const destino = caminhoDoModulo(currentModule);
    // Um `popstate` já deixou a URL no lugar certo; empurrar de novo criaria
    // uma entrada duplicada e o voltar seguinte não sairia do lugar.
    if (window.location.pathname !== destino) {
      window.history.pushState(null, '', destino);
    }
  }, [currentModule]);

  useEffect(() => {
    const aoVoltar = () => setCurrentModule(moduloDaRota(window.location.pathname));
    window.addEventListener('popstate', aoVoltar);
    return () => window.removeEventListener('popstate', aoVoltar);
  }, []);

  return { currentModule, setCurrentModule: irPara };
};
