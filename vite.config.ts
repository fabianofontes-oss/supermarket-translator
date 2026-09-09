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
      // NÃO trocar para 'autoUpdate' sem ler isto.
      //
      // Com 'autoUpdate' o plugin força `skipWaiting` + `clientsClaim`
      // (vite-plugin-pwa/dist/index.js:874-877, atribuição — ignora override no
      // bloco `workbox`). O service worker novo assume a sessão que já está
      // aberta e, no `activate`, o PrecacheController apaga do cache toda
      // entrada fora do manifesto novo. A partir daí a página antiga pede
      // chunks com hash antigo que não existem mais em lugar nenhum.
      //
      // Com 'prompt', `clientsClaim` some e `skipWaiting` só roda se a página
      // mandar a mensagem SKIP_WAITING — nós nunca mandamos. O service worker
      // novo instala, espera, e assume quando todas as abas fecham. A sessão
      // aberta continua com o precache dela inteiro.
      //
      // Custo aceito: a atualização entra na próxima abertura, não na hora.
      // Não há prompt na tela: seria interface nova numa fase de robustez.
      registerType: 'prompt',
      // Quem registra é `utils/pwaUpdate.ts`, porque o registro injetado só
      // chama `register()` e não tem como avisar que existe versão esperando.
      // Sem esse aviso, num app instalado a atualização nunca entra: o service
      // worker novo fica esperando enquanto houver janela aberta, e a janela de
      // um PWA no Android não fecha.
      injectRegister: null,
      includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png', 'flags/*.svg', 'robots.txt'],
      manifest: {
        name: 'Translator Hub',
        short_name: 'Translator',
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
