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
  },
});
