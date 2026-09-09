/**
 * Atualização do app instalado.
 *
 * O `registerType: 'prompt'` do `vite.config.ts` é deliberado: com `autoUpdate`
 * o service worker novo assume a sessão aberta e apaga do cache os chunks da
 * versão antiga, deixando a tela branca. Leia o comentário lá antes de mexer.
 *
 * O custo aceito era "a atualização entra na próxima abertura". Só que num app
 * instalado no Android isso quase nunca acontece: o service worker novo instala
 * e fica **esperando** enquanto existir qualquer janela aberta, e a janela do
 * app não fecha de verdade. O dono ficou preso na versão antiga tentando
 * atualizar, e é esse o buraco que este arquivo tapa.
 *
 * A saída é a que o comentário adiou: avisar e deixar a pessoa aplicar. Mandar
 * `SKIP_WAITING` e recarregar **na mesma ação** é seguro — a página velha não
 * chega a pedir chunk nenhum entre uma coisa e outra.
 */

/**
 * Registra o service worker e avisa quando existe versão nova esperando.
 *
 * @param aoEncontrar recebe a função que aplica a atualização.
 * @returns função de limpeza.
 */
export const watchForUpdate = (aoEncontrar: (aplicar: () => void) => void): (() => void) => {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return () => {};

  let cancelado = false;
  let limpar = () => {};

  const aplicarCom = (esperando: ServiceWorker) => () => {
    // Recarrega assim que o novo assumir o controle. Sem isto a página segue
    // com o código antigo e o cache novo — a combinação que dá tela branca.
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
    esperando.postMessage({ type: 'SKIP_WAITING' });
  };

  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((reg) => {
      if (cancelado) return;

      const oferecer = (sw: ServiceWorker | null) => {
        if (sw && !cancelado) aoEncontrar(aplicarCom(sw));
      };

      // Já havia uma versão esperando de uma abertura anterior.
      oferecer(reg.waiting);

      reg.addEventListener('updatefound', () => {
        const novo = reg.installing;
        if (!novo) return;
        novo.addEventListener('statechange', () => {
          // `controller` nulo é a primeira instalação, não uma atualização.
          if (novo.state === 'installed' && navigator.serviceWorker.controller) oferecer(novo);
        });
      });

      // Procura versão nova ao abrir e toda vez que o app volta ao primeiro
      // plano: num app instalado, é o único momento previsível de checagem.
      const procurar = () => { if (!document.hidden) reg.update().catch(() => {}); };
      procurar();
      document.addEventListener('visibilitychange', procurar);
      limpar = () => document.removeEventListener('visibilitychange', procurar);
    })
    .catch(() => { /* sem service worker o app funciona igual, só não cacheia */ });

  return () => { cancelado = true; limpar(); };
};

