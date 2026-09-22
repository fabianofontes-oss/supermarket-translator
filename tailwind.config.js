/** @type {import('tailwindcss').Config} */
export default {
  // Sem isto, tocar num botão no celular deixa o estado de hover grudado.
  future: { hoverOnlyWhenSupported: true },

  /*
   * O app é claro, e só claro.
   *
   * `class` em vez do padrão `media` é o que desliga as ~590 variantes `dark:`
   * espalhadas pelos componentes de uma vez: elas passam a depender de uma
   * classe `.dark` no `html` que nada neste projeto escreve, em vez de
   * dependerem do tema do sistema. O código fica onde está, inerte — e voltar
   * atrás é trocar esta única linha de volta para `media`.
   */
  darkMode: 'class',
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
