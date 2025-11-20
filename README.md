<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Guia de Supermercado - PWA & APK

Este projeto é um Progressive Web App (PWA) construído com React e Vite, e configurado com Capacitor para gerar aplicativos nativos (Android/iOS).

## 🚀 Como Rodar Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um arquivo `.env.local` na raiz e adicione sua chave (se necessário):
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```
3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

---

## 📱 Como Gerar o APK (Android)

Este projeto usa o **Capacitor** para transformar o site em um app nativo.

**Pré-requisitos:**
*   Você precisa ter o **Android Studio** instalado no seu computador.
*   Java JDK instalado.

**Passo a Passo:**

1.  **Gere a versão de produção do site:**
    Isso cria a pasta `dist` com o código otimizado.
    ```bash
    npm run build
    ```

2.  **Sincronize com o Capacitor:**
    Isso copia a pasta `dist` para dentro da pasta nativa do Android.
    ```bash
    npx cap sync
    ```

3.  **Abra o projeto no Android Studio:**
    ```bash
    npx cap open android
    ```

4.  **Gere o APK:**
    *   No Android Studio, espere o projeto indexar (Gradle Sync).
    *   Vá no menu superior: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    *   O Android Studio irá notificar quando o APK estiver pronto e mostrará um link "locate" para a pasta do arquivo.
    *   Transfira esse arquivo `.apk` para seu celular e instale.

---

## 🌐 Como Usar como PWA (Web)

Não é necessário "gerar" um arquivo específico. O PWA funciona através do navegador.

1.  Faça o deploy do projeto (ex: Vercel, Netlify).
2.  Acesse o link do site pelo celular (Chrome no Android ou Safari no iOS).
3.  Toque no menu do navegador e selecione **"Adicionar à Tela Inicial"** (Install App).
4.  O ícone aparecerá no seu celular e o app funcionará offline e em tela cheia.

**Testando o PWA localmente:**
Para testar o Service Worker localmente, você precisa rodar a versão de produção, pois o modo `dev` geralmente não ativa o cache offline:

```bash
npm run build
npm run preview
```