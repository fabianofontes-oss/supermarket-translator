# Translator Hub - Guia do Imigrante (PWA & APK)

Guia de sobrevivência para imigrantes e viajantes. Em vez de traduzir literalmente, mostra o **produto equivalente real** no país de destino (supermercado, farmácia), além de módulos de posição de objetos ("Onde está?") e direções na rua.

Progressive Web App (PWA) construído com React, Vite e Tailwind, configurado com Capacitor para gerar aplicativos nativos (Android/iOS). Funciona 100% offline depois do primeiro acesso.

## Como rodar localmente

```bash
npm install
npm run dev
```

Não há chaves de API: todo o conteúdo está no próprio app e o áudio usa a voz do sistema.

## Build de produção

```bash
npm run build
npm run preview
```

O build gera a pasta `dist` já com o service worker e o manifesto do PWA (via `vite-plugin-pwa`). Para testar o modo offline é preciso usar o build, pois o modo `dev` não ativa o cache.

## Ícones do app

Os ícones ficam em `public/icons/` e são gerados a partir de `public/icons/icon.svg`. Para alterar o ícone, edite o SVG e rode:

```bash
node scripts/generate-icons.mjs
```

## Estrutura

```
App.tsx                     hub e estado global (idiomas, áudio, listas)
modules/CatalogModule.tsx   módulo genérico de catálogo (Supermercado, Farmácia)
modules/LocationModule.tsx  "Onde está?" - posição de objetos com cena visual
modules/DirectionsModule.tsx direções na rua com mapa, bússola e frases
modules/*/data/             dados de cada módulo
components/                 layout, cards, painéis, seletor de idioma
translations.ts             textos da interface (en, pt, es, fr, it)
```

Regras de negócio e decisões de produto estão em `PROJECT_CONTEXT.md`.

---

## Como gerar o APK (Android)

Este projeto usa o **Capacitor** para transformar o site em um app nativo.

**Pré-requisitos:** Android Studio e Java JDK instalados.

1. Gere a versão de produção:
   ```bash
   npm run build
   ```
2. Sincronize com o Capacitor:
   ```bash
   npx cap sync
   ```
3. Abra no Android Studio:
   ```bash
   npx cap open android
   ```
4. No Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**. Transfira o `.apk` para o celular e instale.

## Como usar como PWA (Web)

1. Faça o deploy do projeto (ex: Vercel, Netlify).
2. Acesse o link pelo celular (Chrome no Android ou Safari no iOS).
3. Toque no menu do navegador e selecione **"Adicionar à Tela Inicial"**.
4. O ícone aparece no celular e o app funciona offline e em tela cheia.
