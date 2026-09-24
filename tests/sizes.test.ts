import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SizesModule from '../modules/SizesModule';
import {
  SIZE_TABLES, buildSizeQuestion, sizeQuestions, askKeyFor, systemForCountry,
  type SizeSystem,
} from '../modules/sizes/data/sizesData';
import { SUPPORTED_LANGS } from '../modules/location/data/locationData';
import { COUNTRIES } from '../constants';
import { translations } from '../translations';
import { GESTO_KEY } from '../utils/audioState';

/**
 * Módulo "Roupa e sapato" (cabeçalho "Tamanhos").
 *
 * Tranca as escolhas da auditoria de usabilidade de 23/09/2026:
 *
 *  1. Título curto no cabeçalho e a dica do módulo.
 *  2. A pergunta ("Qual número você calça no Brasil?") vem ANTES do resultado.
 *  3. Cada categoria guarda a sua escolha e abre perto do meio — nunca no
 *     maior tamanho.
 *  4. O quadro diz "No Brasil → Peça este aqui", com bandeira, e não
 *     "O SEU · BRASIL → AQUI · EUROPA".
 *  5. A tabela fica fechada, "Na loja" vem antes dela, e o cabeçalho da tabela
 *     tem o nome do país, não a sigla ("EU" se lê "eu").
 *  6. Nos EUA o meio número é "eight and a half", nunca "8,5".
 *  7. "Maior/menor" diz número para sapato e talla/taille para roupa.
 *  8. Piso de 14px em tudo o que ela lê.
 */

const t = (key: string) => (translations['pt-BR'] as Record<string, string>)[key] || key;
const pais = (code: string) => COUNTRIES.find((c) => c.code === code)!;
const TEMA = { color: 'bg-indigo-600', textColor: 'text-indigo-600 dark:text-indigo-300', hex: '#4f46e5', borderColor: 'border-indigo-600' };
const MALFORMADO = /undefined|NaN|\s{2,}|[{}]/;
const SISTEMAS: SizeSystem[] = ['BR', 'EU', 'UK', 'US'];
const tabela = (key: string) => SIZE_TABLES.find((tb) => tb.key === key)!;

const montar = (opts: { destino?: string } = {}) => {
  const handlePlayAudio = vi.fn();
  const r = render(createElement(SizesModule, {
    nativeCountry: pais('br'),
    targetCountry: pais(opts.destino ?? 'es'),
    t,
    theme: TEMA,
    onGoHome: vi.fn(),
    onOpenLanguageModal: vi.fn(),
    onOpenShare: vi.fn(),
    handlePlayAudio,
  }));
  return { handlePlayAudio, container: r.container };
};

const botao = (nome: string) => screen.getByRole('button', { name: nome });
const antes = (a: Element, b: Element) =>
  Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

beforeEach(() => {
  localStorage.clear();
  // A linha de gesto da moldura não é assunto daqui.
  localStorage.setItem(GESTO_KEY, '1');
});
afterEach(() => cleanup());

// ------------------------------------------------------------------ dados

describe('as tabelas', () => {
  it('toda categoria abre numa linha que existe, e nenhuma abre no maior tamanho', () => {
    for (const tb of SIZE_TABLES) {
      expect(tb.defaultRow, tb.key).toBeGreaterThanOrEqual(0);
      expect(tb.defaultRow, tb.key).toBeLessThan(tb.rows.length - 1);
    }
  });

  it('as escolhas iniciais são as da auditoria', () => {
    const inicial = (key: string) => tabela(key).rows[tabela(key).defaultRow].BR;
    expect(inicial('shoes')).toBe('40');
    expect(inicial('women')).toBe('40');
    expect(inicial('men')).toBe('M');
    expect(inicial('trousers')).toBe('40');
    expect(inicial('bra')).toBe('42');
    expect(inicial('kids')).toBe('6');
  });

  it('nas colunas UK e US o meio número se escreve com ponto, como lá', () => {
    for (const tb of SIZE_TABLES) {
      for (const r of tb.rows) {
        expect(r.UK, `${tb.key} UK`).not.toContain(',');
        expect(r.US, `${tb.key} US`).not.toContain(',');
      }
    }
    // A coluna de centímetros continua com vírgula: é lida na língua de origem.
    expect(tabela('shoes').rows[0].extra).toBe('21,5');
  });

  it('todo idioma tem nome e coluna extra em todas as tabelas', () => {
    for (const tb of SIZE_TABLES) {
      for (const l of SUPPORTED_LANGS) {
        expect(tb.labels[l], `${tb.key}.labels.${l}`).toBeTruthy();
        if (tb.extraLabel) expect(tb.extraLabel[l], `${tb.key}.extraLabel.${l}`).toBeTruthy();
      }
    }
  });
});

describe('a pergunta do topo', () => {
  it('nos EUA, o meio número vai por extenso: "eight and a half"', () => {
    expect(buildSizeQuestion('en', '8.5', 'shoe')).toBe('Do you have it in size eight and a half?');
    expect(buildSizeQuestion('en', '10.5', 'shoe')).toBe('Do you have it in size ten and a half?');
  });

  it('nenhuma frase em inglês de calçado sai com vírgula nem algarismo (EUA e Reino Unido)', () => {
    for (const r of tabela('shoes').rows) {
      for (const sys of ['US', 'UK'] as const) {
        const frase = buildSizeQuestion('en', r[sys], 'shoe');
        expect(frase, `${sys} ${r[sys]}`).not.toContain(',');
        expect(frase, `${sys} ${r[sys]}`).not.toMatch(/\d/);
        if (/\.5$/.test(r[sys])) expect(frase).toContain('and a half');
      }
    }
  });

  it('o meio número tem o "e meio" de cada língua', () => {
    expect(buildSizeQuestion('pt', '8.5', 'shoe')).toBe('Tem no número oito e meio?');
    expect(buildSizeQuestion('es', '8.5', 'shoe')).toBe('¿Lo tiene en el número ocho y medio?');
    expect(buildSizeQuestion('fr', '8.5', 'shoe')).toContain('et demi');
    expect(buildSizeQuestion('it', '8.5', 'shoe')).toContain('e mezzo');
    expect(buildSizeQuestion('uk', '8.5', 'shoe')).toContain('з половиною');
    expect(buildSizeQuestion('ar', '8.5', 'shoe')).toContain('ونصف');
    // Lituano vai em algarismo, e lá o decimal é com vírgula.
    expect(buildSizeQuestion('lt', '8.5', 'shoe')).toBe('Ar turite 8,5 dydį?');
  });

  it('toda combinação de tabela, linha, sistema e idioma sai bem formada', () => {
    for (const tb of SIZE_TABLES) {
      for (const r of tb.rows) {
        for (const sys of SISTEMAS) {
          for (const l of SUPPORTED_LANGS) {
            const frase = buildSizeQuestion(l, r[sys], tb.kind);
            expect(frase, `${tb.key} ${sys} ${r[sys]} ${l}`).not.toMatch(MALFORMADO);
            // Nenhum número decimal com ponto sobra na frase falada.
            expect(frase, `${tb.key} ${sys} ${r[sys]} ${l}`).not.toMatch(/\d\.\d/);
          }
        }
      }
    }
  });

  it('calçado diz número/pointure; roupa diz talla/taille', () => {
    expect(buildSizeQuestion('es', '41', 'shoe')).toContain('número');
    expect(buildSizeQuestion('es', '38', 'clothes')).toContain('talla');
    expect(buildSizeQuestion('fr', '41', 'shoe')).toContain('pointure');
    expect(buildSizeQuestion('fr', '38', 'clothes')).toContain('taille');
  });

  it('os sistemas continuam os mesmos por país', () => {
    expect(systemForCountry('us')).toBe('US');
    expect(systemForCountry('es')).toBe('EU');
    expect(systemForCountry('fr')).toBe('EU');
    expect(systemForCountry('br')).toBe('BR');
  });
});

describe('a pergunta do seletor', () => {
  it('sapato se calça, roupa se veste, e na infantil quem veste é a criança', () => {
    expect(askKeyFor(tabela('shoes'))).toBe('szAskShoe');
    expect(askKeyFor(tabela('women'))).toBe('szAskClothes');
    expect(askKeyFor(tabela('bra'))).toBe('szAskClothes');
    expect(askKeyFor(tabela('kids'))).toBe('szAskKids');
  });

  it('as chaves existem nos oito blocos', () => {
    const chaves = new Set(SIZE_TABLES.map(askKeyFor));
    for (const [locale, bloco] of Object.entries(translations)) {
      for (const k of [...chaves, 'szTitle', 'hintSizes', 'szFrom', 'szTo', 'szSeeTable', 'szHideTable']) {
        expect((bloco as Record<string, string>)[k], `${locale}.${k}`).toBeTruthy();
      }
    }
  });
});

describe('as frases da loja', () => {
  it('as duas listas têm o mesmo tamanho e os oito idiomas completos', () => {
    const sapato = sizeQuestions('shoe');
    const roupa = sizeQuestions('clothes');
    expect(sapato).toHaveLength(roupa.length);
    for (const lista of [sapato, roupa]) {
      for (const q of lista) {
        for (const l of SUPPORTED_LANGS) expect(q[l], l).toBeTruthy();
      }
    }
  });

  it('na sapataria se pede número; na loja de roupa, talla', () => {
    const es = (kind: 'shoe' | 'clothes') => sizeQuestions(kind).map((q) => q.es).join(' | ');
    expect(es('shoe')).toContain('¿Tienen un número más?');
    expect(es('shoe')).toContain('¿Tienen un número menos?');
    expect(es('shoe')).not.toContain('talla');
    expect(es('clothes')).toContain('¿Tienen una talla más?');
    expect(es('clothes')).not.toContain('número');

    const fr = (kind: 'shoe' | 'clothes') => sizeQuestions(kind).map((q) => q.fr).join(' | ');
    expect(fr('shoe')).toContain('pointure');
    expect(fr('shoe')).not.toContain('taille');
    expect(fr('clothes')).toContain('taille');

    const pt = (kind: 'shoe' | 'clothes') => sizeQuestions(kind).map((q) => q.pt).join(' | ');
    expect(pt('shoe')).toContain('Tem um número maior?');
    expect(pt('clothes')).toContain('Tem um tamanho maior?');
    expect(pt('clothes')).not.toContain('número');
  });
});

// ------------------------------------------------------------------ a tela

describe('a tela', () => {
  it('cabeçalho curto e a dica do módulo', () => {
    montar();
    expect(screen.getByRole('heading', { level: 1, name: t('szTitle') })).toBeTruthy();
    expect(screen.getByText(t('hintSizes'))).toBeTruthy();
  });

  it('a pergunta vem antes do resultado, como pergunta e não como legenda', () => {
    montar();
    const pergunta = screen.getByRole('heading', { level: 2, name: t('szAskShoe') });
    const deOnde = screen.getByText(t('szFrom'));
    expect(antes(pergunta, deOnde), 'a pergunta tem que vir antes do quadro').toBe(true);
    expect(pergunta.className).not.toContain('uppercase');
    expect(pergunta.className).toContain('text-base');
  });

  it('a pergunta muda com a categoria: calça, veste, a criança veste', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(botao(tabela('women').labels.pt));
    expect(screen.getByRole('heading', { level: 2, name: t('szAskClothes') })).toBeTruthy();
    await user.click(botao(tabela('kids').labels.pt));
    expect(screen.getByRole('heading', { level: 2, name: t('szAskKids') })).toBeTruthy();
  });

  it('o quadro diz "No Brasil → Peça este aqui", sem "O seu" nem "Europa"', () => {
    montar();
    expect(screen.getByText(t('szFrom'))).toBeTruthy();
    expect(screen.getByText(t('szTo'))).toBeTruthy();
    // A chave sizeYours saiu dos 8 blocos; o texto antigo não pode voltar.
    expect(screen.queryByText(/O seu/)).toBeNull();
    expect(screen.queryByText(t('sizeSystemEU'))).toBeNull();
  });

  it('abre no sapato 40 do Brasil, que é o 41 daqui', () => {
    montar();
    expect(botao('40').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('¿Lo tiene en el número cuarenta y uno?')).toBeTruthy();
  });

  it('trocar de categoria não pula para o maior tamanho', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(botao(tabela('women').labels.pt));
    expect(botao('40').getAttribute('aria-pressed')).toBe('true');
    expect(botao('48').getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByText('¿Lo tiene en la talla treinta y ocho?')).toBeTruthy();
  });

  it('cada categoria guarda a sua escolha', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(botao('37'));                              // sapato 37
    await user.click(botao(tabela('women').labels.pt));
    await user.click(botao('44'));                              // roupa 44
    await user.click(botao(tabela('shoes').labels.pt));
    expect(botao('37').getAttribute('aria-pressed')).toBe('true');
    await user.click(botao(tabela('women').labels.pt));
    expect(botao('44').getAttribute('aria-pressed')).toBe('true');
  });

  it('"Na loja" vem antes da tabela, e a tabela começa fechada', () => {
    montar();
    const loja = screen.getByRole('heading', { level: 2, name: t('sizePhrases') });
    const verTabela = botao(t('szSeeTable'));
    expect(antes(loja, verTabela)).toBe(true);
    expect(verTabela.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('table')).toBeNull();
    // Fechada, não aponta para tabela nenhuma: IDREF pendurada é defeito.
    expect(verTabela.hasAttribute('aria-controls')).toBe(false);
  });

  it('a tabela abre com o nome do país no cabeçalho, não a sigla', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(botao(t('szSeeTable')));
    const tab = screen.getByRole('table');
    const cabecalhos = within(tab).getAllByRole('columnheader').map((th) => th.textContent);
    // Primeiro a dela, depois a daqui.
    expect(cabecalhos.slice(0, 4)).toEqual([t('sizeSystemBR'), t('sizeSystemEU'), t('sizeSystemUK'), t('sizeSystemUS')]);
    expect(cabecalhos).not.toContain('EU');
    expect(botao(t('szHideTable')).getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(botao(t('szHideTable')).getAttribute('aria-controls')!)?.contains(tab)).toBe(true);
    await user.click(botao(t('szHideTable')));
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('nos EUA a tabela põe a coluna dos EUA logo depois da do Brasil', async () => {
    const user = userEvent.setup();
    montar({ destino: 'us' });
    await user.click(botao(t('szSeeTable')));
    const cabecalhos = within(screen.getByRole('table')).getAllByRole('columnheader').map((th) => th.textContent);
    expect(cabecalhos.slice(0, 2)).toEqual([t('sizeSystemBR'), t('sizeSystemUS')]);
  });

  it('nos EUA a frase diz "eight and a half" e o quadro mostra 8.5', () => {
    montar({ destino: 'us' });
    expect(screen.getByText('Do you have it in size eight and a half?')).toBeTruthy();
    expect(screen.getByText('Tem no número oito e meio?')).toBeTruthy();
    expect(screen.getByText('8.5')).toBeTruthy();
    expect(screen.queryByText('8,5')).toBeNull();
  });

  it('as frases da loja seguem a categoria', async () => {
    const user = userEvent.setup();
    montar();
    expect(screen.getByText('¿Tienen un número más?')).toBeTruthy();
    expect(screen.queryByText('¿Tienen una talla más?')).toBeNull();
    await user.click(botao(tabela('women').labels.pt));
    expect(screen.getByText('¿Tienen una talla más?')).toBeTruthy();
    expect(screen.queryByText('¿Tienen un número más?')).toBeNull();
    expect(screen.getByText('Tem um tamanho maior?')).toBeTruthy();
  });

  it('tocar numa frase da loja fala na voz do destino', async () => {
    const user = userEvent.setup();
    const { handlePlayAudio } = montar();
    await user.click(screen.getByText('¿Dónde está el probador?'));
    expect(handlePlayAudio).toHaveBeenCalledWith('¿Dónde está el probador?', pais('es').lang);
  });

  it('categoria e número escolhidos são anunciados ao leitor de tela', () => {
    montar();
    expect(botao(tabela('shoes').labels.pt).getAttribute('aria-pressed')).toBe('true');
    expect(botao(tabela('women').labels.pt).getAttribute('aria-pressed')).toBe('false');
  });
});

describe('piso de 14px', () => {
  const fonte = readFileSync(join(__dirname, '..', 'modules', 'SizesModule.tsx'), 'utf8');

  it('nada de letra miúda nem rótulo em maiúscula espaçada', () => {
    expect(fonte).not.toMatch(/text-\[(9|10|11|12|13)px\]/);
    expect(fonte).not.toMatch(/\btext-xs\b/);
    expect(fonte).not.toContain('uppercase');
    expect(fonte).not.toContain('opacity-70');
  });

  it('a cor do módulo como texto passa pelo token', () => {
    expect(fonte).not.toContain('theme.textColor');
  });
});
