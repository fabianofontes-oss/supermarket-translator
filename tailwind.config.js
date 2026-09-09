/** @type {import('tailwindcss').Config} */
export default {
  // Sem isto, tocar num botão no celular deixa o estado de hover grudado.
  future: { hoverOnlyWhenSupported: true },
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './constants.ts',
    './components/**/*.{ts,tsx}',
    './modules/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
