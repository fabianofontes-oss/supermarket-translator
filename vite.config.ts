import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'url';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist', // Capacitor reads the build from here
  },
  plugins: [
    react(),
    VitePWA({
      // ESTA DECISÃO FOI REVERTIDA. O raciocínio antigo está preservado abaixo
      // porque ele não estava errado — o mundo é que mudou.
      //
      // Era assim: 'prompt' em vez de 'autoUpdate' para o service worker novo
      // INSTALAR E ESPERAR, em vez de assumir a sessão aberta. Com `skipWaiting`
      // + `clientsClaim`, o SW novo assume na hora e o PrecacheController apaga
      // no `activate` toda entrada fora do manifesto novo; a página antiga
      // continua rodando e passa a pedir chunks com hash que não existe mais.
      // Evitar isso era o ponto, e o custo aceito era "a atualização entra na
      // próxima abertura".
      //
      // O QUE QUEBROU: essa próxima abertura nunca chega. Num PWA instalado no
      // Android a janela não fecha de verdade, então o SW novo espera para
      // sempre. E quem mandaria ele assumir é o `pwaUpdate.ts`, que vive dentro
      // do bundle — quando o bundle é justamente o que não carrega, não há
      // ninguém para mandar. A pessoa fica presa numa versão cujos arquivos o
      // deploy seguinte já apagou, vendo tela branca, sem nada que possa fazer
      // de dentro do app. Aconteceu de verdade, num celular.
      //
      // POR QUE AGORA PODE: o perigo do `skipWaiting` — página viva pedindo
      // chunk que sumiu — passou a ter duas redes por baixo, as duas testadas.
      // O `utils/chunkRecovery.ts` recarrega uma vez quando um `import()`
      // dinâmico falha, e a rede de segurança inline no `index.html` recupera o
      // caso extremo, quando nem o bundle principal chega. O risco que
      // justificava esperar está coberto; o de ficar preso, não estava.
      //
      // Seguimos em 'prompt' e não 'autoUpdate': assim a folha de atualização
      // continua avisando, e `skipWaiting`/`clientsClaim` ficam declarados
      // explicitamente no bloco `workbox` abaixo, onde dá para ler e reverter.
      registerType: 'prompt',
      // Quem registra é `utils/pwaUpdate.ts`, porque o registro injetado só
      // chama `register()` e não tem como avisar que existe versão esperando.
      // Sem esse aviso, num app instalado a atualização nunca entra: o service
      // worker novo fica esperando enquanto houver janela aberta, e a janela de
      // um PWA no Android não fecha.
      injectRegister: null,
      includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png', 'flags/*.svg', 'robots.txt'],
      manifest: {
        // Resolvido na instalação, não em tempo de execução: só cabe uma forma,
        // e vale o espanhol. Dentro do app o nome se traduz. Ver `APP_NAME`.
        name: 'Aquí se dice',
        short_name: 'Aquí se dice',
        description: 'Guia de sobrevivência para imigrantes: supermercado, farmácia, direções e mais.',
        lang: 'pt-BR',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#c83745',
        icons: [
          { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Pré-cacheia tudo que o build gera: o app inteiro funciona offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',

        /*
         * Os dois que tiram a pessoa do impasse. Ver o comentário extenso em
         * `registerType` acima antes de mexer.
         *
         * `skipWaiting` faz o service worker novo ativar sem esperar a janela
         * fechar — e a janela de um PWA no Android não fecha. `clientsClaim` faz
         * ele assumir as abas que já estão abertas, em vez de só as próximas.
         *
         * Juntos, eles garantem que o `sw.js` seja o caminho de recuperação: o
         * `vercel.json` já serve esse arquivo com `max-age=0, must-revalidate`,
         * então o navegador o revalida a cada abertura. Mesmo um aparelho preso
         * numa versão antiga busca o SW novo, ele ativa na hora, o precache dele
         * traz o `index.html` novo com os hashes que existem, e a abertura
         * seguinte funciona. Sem estes dois, o SW novo instalava e ficava
         * esperando um fechamento que nunca vem.
         */
        skipWaiting: true,
        clientsClaim: true,
        // Só apaga precaches de versões antigas do próprio Workbox (nomes de
        // cache diferentes). Não tem relação com os chunks do deploy anterior
        // — quem apaga esses é o PrecacheController no `activate`. Mantido
        // porque é correto e barato, mas não é o que resolvia o problema.
        cleanupOutdatedCaches: true,
        // O fallback de navegação nunca deve responder por um pedido dentro de
        // /assets/: falha de chunk tem que falhar como falha, não virar HTML.
        // Mesma regra do rewrite em vercel.json, na camada do service worker.
        navigateFallbackDenylist: [/^\/assets\//],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.'),
    },
  },
});
