import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * O modo escuro está DORMENTE, e este arquivo guarda os dois lados disso.
 *
 * Ele entrou de uma vez, em 589 classes, e foi desligado numa linha só:
 * `darkMode: 'class'` no `tailwind.config.js` faz toda variante `dark:`
 * depender de uma classe que nada neste projeto escreve. As 589 continuam no
 * código, inertes.
 *
 * Por isso as duas regras convivem. A primeira é a de sempre: superfície
 * neutra sem par `dark:` é defeito — porque o dia em que alguém trocar aquela
 * linha de volta para `media`, o app precisa acordar inteiro, e não 95%
 * escuro com um cartão branco aceso no meio. A última é nova e aponta para o
 * outro lado: enquanto a decisão for app claro, nada pode reacender o tema
 * escuro por acidente.
 */

const raiz = join(__dirname, '..');

const arquivos = (() => {
  const out: string[] = ['App.tsx'];
  for (const dir of ['components', 'modules']) {
    for (const f of readdirSync(join(raiz, dir))) {
      if (f.endsWith('.tsx')) out.push(`${dir}/${f}`);
    }
  }
  return out;
})();

const ler = (f: string) => readFileSync(join(raiz, f), 'utf8');

/**
 * As classes que pintam SUPERFÍCIE e por isso precisam de par.
 *
 * `text-white` não está aqui e nunca deve estar: ele vive sobre a cor do
 * módulo, que é a mesma nos dois temas. Nem `bg-white/NN` — alfa sobre cor
 * saturada é igual no claro e no escuro. É por isso que a barra entra na
 * fronteira do regex.
 */
const EXIGEM_PAR = [
  'bg-white', 'bg-slate-50', 'bg-gray-50', 'bg-slate-100', 'bg-gray-100',
  'bg-gray-200', 'bg-slate-200', 'bg-gray-300',
  'text-gray-900', 'text-gray-800', 'text-gray-700', 'text-gray-600',
  'text-gray-500', 'text-gray-400', 'text-slate-700', 'text-slate-600',
  'border-gray-100', 'border-gray-200', 'border-gray-300',
  'border-slate-200', 'border-slate-300', 'divide-gray-100',
];

describe('modo escuro (dormente)', () => {
  it('toda superfície neutra tem par no escuro', () => {
    const orfas: string[] = [];
    for (const f of arquivos) {
      const src = ler(f);
      for (const classe of EXIGEM_PAR) {
        // Classe nua (sem `hover:` na frente, sem `/50` atrás) que NÃO é
        // seguida de um `dark:` qualquer.
        const re = new RegExp(`(?<![\\w:/-])${classe}(?![\\w/-])(?!\\s+dark:)`, 'g');
        for (const m of src.matchAll(re)) {
          const linha = src.slice(0, m.index).split('\n').length;
          orfas.push(`${f}:${linha}  ${classe}`);
        }
      }
    }
    expect(orfas, `superfície sem par no escuro:\n${orfas.join('\n')}`).toEqual([]);
  });

  it('a cor do módulo como TEXTO passa pelo token, não pelo hex cru', () => {
    // `theme.hex` cru como cor de texto reprova sobre o cartão escuro (3,03:1
    // no pior caso) e nenhuma variante `dark:` o alcança, porque ele vem do JS.
    const cruas: string[] = [];
    for (const f of arquivos) {
      const src = ler(f);
      for (const m of src.matchAll(/(?<![A-Za-z])(color|borderColor):\s*theme\.hex/g)) {
        cruas.push(`${f}:${src.slice(0, m.index).split('\n').length}`);
      }
    }
    expect(cruas, `use 'var(--tema-texto)':\n${cruas.join('\n')}`).toEqual([]);
  });

  it('nenhuma TINTA de desenho é hex cravado — só cor de marca pode', () => {
    /*
     * A regra é sobre TINTA, não sobre a palavra `#`. A tabela `THEMES` do
     * `App.tsx` é hex cru de propósito: ela é a definição da paleta, a fonte de
     * onde `--tema` sai. O que não pode é hex dentro de um `fill`/`stroke`,
     * porque é isso que impede o desenho de inverter.
     */
    const cravadas: string[] = [];
    // BrandIcons guarda o verde do WhatsApp, o azul do Telegram e o do
    // Facebook. Cor de marca é fixa por definição: não inverte no escuro.
    const permitido = new Set(['components/BrandIcons.tsx']);
    for (const f of arquivos) {
      if (permitido.has(f)) continue;
      const src = ler(f);
      for (const m of src.matchAll(/(fill|stroke)=(["{])([^"}]*)/g)) {
        const hex = m[3].match(/#[0-9a-fA-F]{6}/);
        if (hex) cravadas.push(`${f}:${src.slice(0, m.index).split('\n').length}  ${m[1]}=${hex[0]}`);
      }
      // As constantes de ilustração dos módulos (`const traco = '#...'`), que
      // acabam num `fill`/`stroke` sem aparecer no atributo.
      if (f.startsWith('modules/')) {
        for (const m of src.matchAll(/const\s+\w+\s*=\s*'(#[0-9a-fA-F]{6})'/g)) {
          cravadas.push(`${f}:${src.slice(0, m.index).split('\n').length}  const ${m[1]}`);
        }
      }
    }
    expect(cravadas, `vire papel em index.css:\n${cravadas.join('\n')}`).toEqual([]);
  });

  it('a rampa dos desenhos continua declarada, em tema único', () => {
    const css = ler('index.css');
    const papeis = ['--art-ground', '--art-tint', '--art-edge', '--art-fill',
                    '--art-line', '--art-ink', '--art-plate', '--art-paint',
                    '--art-label', '--art-skin'];
    // Os papéis sobrevivem ao fim do tema escuro: eles não existem por causa
    // do escuro, existem para a tinta do desenho ter um lugar só.
    for (const p of papeis) {
      expect(css, `${p} sumiu da paleta`).toContain(`${p}:`);
    }
  });

  it('nada reacende o tema escuro por acidente', () => {
    const css = ler('index.css');
    expect(css, 'voltou um bloco @media de tema escuro ao index.css')
      .not.toContain('@media (prefers-color-scheme: dark)');
    // `light dark` anuncia ao navegador que o app aceita os dois, e aí a barra
    // de rolagem e os menus de `select` escurecem sozinhos.
    expect(css).toContain('color-scheme: light;');

    const tw = ler('tailwind.config.js');
    expect(tw, 'sem darkMode: class, as 589 variantes dark: reacendem')
      .toContain("darkMode: 'class'");

    const html = ler('index.html');
    expect(html, 'voltou uma theme-color de tema escuro')
      .not.toContain('prefers-color-scheme: dark');
  });
});
