import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Configuração separada de vite.config.ts de propósito: os testes não devem
// instanciar o plugin PWA nem gerar service worker.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    restoreMocks: true,
    // Os testes de tela com `userEvent` levam de 0,5 a 2 s cada, e com a suíte
    // inteira rodando em paralelo a máquina carregada empurrava alguns para
    // perto dos 5 s padrão: `npm test` ficava verde numa rodada e vermelho na
    // outra, sem mudança no código. A suíte é a única rede antes do push na
    // `main`, que publica sozinha — intermitente, ela deixa de ser rede.
    testTimeout: 15_000,
  },
});
