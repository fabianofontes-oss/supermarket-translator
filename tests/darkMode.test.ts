import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * O modo escuro não pode apodrecer em silêncio.
 *
 * Ele entrou de uma vez, em 589 classes. O jeito de ele se desfazer não é
 * alguém apagar isso — é o próximo cartão nascer com `bg-white` e sem par, e
 * ninguém ver, porque quem escreve normalmente está no tema claro. Aí o app
 * fica 95% escuro e com um cartão branco aceso no meio.
 *
 * Então a regra é mecânica: superfície neutra sem par `dark:` é defeito.
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

describe('modo escuro', () => {
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

  it('index.css declara a rampa dos desenhos nos dois temas', () => {
    const css = ler('index.css');
    const papeis = ['--art-ground', '--art-tint', '--art-edge', '--art-fill',
                    '--art-line', '--art-ink', '--art-plate', '--art-paint',
                    '--art-label', '--art-skin'];
    const escuro = css.slice(css.indexOf('@media (prefers-color-scheme: dark)'));
    for (const p of papeis) {
      expect(css, `${p} não existe no tema claro`).toContain(`${p}:`);
      expect(escuro, `${p} não inverte no escuro`).toContain(`${p}:`);
    }
    // Sem isto o navegador continua desenhando barra de rolagem e menus claros.
    expect(css).toMatch(/color-scheme:\s*light dark/);
  });
});
