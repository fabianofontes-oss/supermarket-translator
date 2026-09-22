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

  /*
   * Recarregar, e só. Esta função já foi mais esperta, e a esperteza virou
   * botão morto.
   *
   * Ela mandava `SKIP_WAITING` para o service worker em espera e recarregava
   * ao receber `controllerchange`. Isso funcionava enquanto o `sw.js` tinha
   * `skipWaiting: false`, porque nesse modo o Workbox GERA um ouvinte de
   * mensagem. Quando `skipWaiting` passou a ser `true` no `vite.config.ts`, o
   * Workbox parou de gerar esse ouvinte — o `sw.js` publicado não tem um único
   * `addEventListener` — e as duas metades morreram juntas: a mensagem caía no
   * vazio, e o `controllerchange` já tinha acontecido milissegundos depois do
   * `installed`, muito antes de a pessoa ler o aviso e tocar no botão. Tocar em
   * "Atualizar" não fazia absolutamente nada.
   *
   * Com `skipWaiting` + `clientsClaim`, quando esta folha está na tela o
   * service worker novo JÁ ativou e JÁ assumiu esta página. Não há o que
   * pedir: o que falta é só a página buscar de novo o que agora está no cache
   * novo. Uma recarga faz exatamente isso.
   */
  const aplicar = () => window.location.reload();

  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((reg) => {
      if (cancelado) return;

      const oferecer = (sw: ServiceWorker | null) => {
        if (sw && !cancelado) aoEncontrar(aplicar);
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

