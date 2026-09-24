import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import MakeupModule from '../modules/MakeupModule';
import { TOOL_GLYPHS } from '../modules/makeup/MakeupGlyphs';
import {
  MAKEUP_PRODUCTS, DIMENSIONS, TOOLS, TOOL_FRAMES, MAKEUP_QUESTIONS,
  buildMakeupRequest, buildToolPhrase, optionsFor,
  type DimKey,
} from '../modules/makeup/data/makeupData';
import { SUPPORTED_LANGS, type LangCode } from '../modules/location/data/locationData';
import { translations } from '../translations';
import { COUNTRIES } from '../constants';

/**
 * Módulo Maquiagem.
 *
 * Mesma varredura de invariantes de `grammar.test.ts`: percorre o que a tela
 * consegue montar e recusa saída malformada. Aqui ela carrega um peso extra —
 * a concordância de gênero em uk, lt e ar é invisível para quem revisa em
 * português, e sem este arquivo um slot faltando sairia como `undefined` na
 * tela sem quebrar nada.
 */

/** Bloco árabe. Nenhuma outra língua pode conter isto — foi assim que o
 *  `buildPriceShort` deixou o lituano cair no ramo árabe (AGENTS.md 8.5). */
const ARABE = /[؀-ۿ]/;

type Caso = { tag: string; lang: LangCode; frase: string };

/** Uma escolha de cada vez, mais todas juntas. Cobre toda opção sem explodir
 *  no produto cartesiano, porque as falhas aqui são por opção. */
const todosOsPedidos = function* (): Generator<Caso> {
  for (const lang of SUPPORTED_LANGS) {
    for (const p of MAKEUP_PRODUCTS) {
      yield { tag: `${lang}/${p.key}/SEM`, lang, frase: buildMakeupRequest(lang, p, {}) };

      const cheio: Partial<Record<DimKey, string>> = {};
      for (const key of p.dims) {
        const dim = DIMENSIONS.find((d) => d.key === key)!;
        for (const opt of optionsFor(dim, p)) {
          yield {
            tag: `${lang}/${p.key}/${key}=${opt.key}`,
            lang,
            frase: buildMakeupRequest(lang, p, { [key]: opt.key }),
          };
        }
        cheio[key] = optionsFor(dim, p)[0].key;
      }
      yield { tag: `${lang}/${p.key}/TUDO`, lang, frase: buildMakeupRequest(lang, p, cheio) };
    }
  }
};

const todasAsFrasesDeAcessorio = function* (): Generator<Caso> {
  for (const lang of SUPPORTED_LANGS) {
    for (const tool of TOOLS) {
      for (const frame of TOOL_FRAMES) {
        yield {
          tag: `${lang}/${tool.key}/${frame.key}`,
          lang,
          frase: buildToolPhrase(lang, frame, tool),
        };
      }
    }
  }
};

const PEDIDOS = [...todosOsPedidos()];
const ACESSORIOS = [...todasAsFrasesDeAcessorio()];
const TUDO = [...PEDIDOS, ...ACESSORIOS];

const invariante = (nome: string, casos: Caso[], quebrou: (c: Caso) => boolean) =>
  it(nome, () => {
    const falhas = casos.filter(quebrou).map((c) => `${c.tag}: "${c.frase}"`);
    expect(falhas.slice(0, 8)).toEqual([]);
  });

// ---------------------------------------------------------------------------

describe('PARTE 1 — varredura de invariantes', () => {
  it('cobre o que a interface consegue produzir', () => {
    expect(MAKEUP_PRODUCTS).toHaveLength(9);
    expect(DIMENSIONS).toHaveLength(9);
    expect(TOOLS).toHaveLength(21);
    expect(TOOL_FRAMES).toHaveLength(4);
    expect(ACESSORIOS).toHaveLength(8 * 21 * 4);
    expect(PEDIDOS.length).toBeGreaterThan(500);
  });

  invariante('sem buraco de dado', TUDO, (c) =>
    /undefined|NaN|\[object Object\]/.test(c.frase));

  invariante('sem marcador por substituir', TUDO, (c) =>
    /[{}]/.test(c.frase));

  invariante('sem espaço duplo', TUDO, (c) => /\s\s/.test(c.frase));

  invariante('sem espaço nas bordas', TUDO, (c) => c.frase !== c.frase.trim());

  invariante('sem vírgula órfã', TUDO, (c) =>
    /\s,|,\s*,|,\s*[.?!؟]/.test(c.frase));

  // O francês escreve espaço fino antes de ? e !, e é por isso que ele sai da regra.
  invariante('sem espaço antes da pontuação (exceto fr)', TUDO, (c) =>
    c.lang !== 'fr' && /\s[.?!؟،]/.test(c.frase));

  invariante('termina em pontuação', TUDO, (c) =>
    !/[.?!؟]$/.test(c.frase.trim()));

  // "¿" e "¡" abrem a frase em espanhol, então a maiúscula vem depois deles.
  invariante('começa em maiúscula onde a escrita tem caixa', TUDO, (c) => {
    if (c.lang === 'ar') return false;
    const primeira = c.frase.replace(/^[¿¡\s]+/, '').charAt(0);
    return primeira !== primeira.toUpperCase();
  });

  invariante('nenhum idioma cai no ramo árabe', TUDO, (c) =>
    c.lang !== 'ar' && ARABE.test(c.frase));
});

// ---------------------------------------------------------------------------

describe('PARTE 2 — concordância', () => {
  it('todo produto tem o slot que suas opções de `color` precisam', () => {
    const faltando: string[] = [];
    for (const p of MAKEUP_PRODUCTS) {
      for (const key of p.dims) {
        const dim = DIMENSIONS.find((d) => d.key === key)!;
        if (!dim.agrees) continue;
        for (const opt of optionsFor(dim, p)) {
          for (const lang of SUPPORTED_LANGS) {
            const t = opt.texts[lang];
            if (typeof t === 'string') continue;
            const slot = p.agree[lang];
            if (!t[slot]) faltando.push(`${lang}/${p.key}/${opt.key}: falta "${slot}"`);
          }
        }
      }
    }
    expect(faltando.slice(0, 8)).toEqual([]);
  });

  it('o plural de "unos polvos compactos" concorda', () => {
    const polvo = MAKEUP_PRODUCTS.find((p) => p.key === 'polvo')!;
    expect(polvo.agree.es).toBe('mpl');
    // O pó não usa `color`, mas o slot precisa existir para o dia em que usar.
    expect(buildMakeupRequest('es', polvo, { depth: 'claro' }))
      .toBe('Busco unos polvos compactos de tono claro, por favor.');
  });

  it('o adjetivo concorda com o produto em espanhol', () => {
    const labial = MAKEUP_PRODUCTS.find((p) => p.key === 'labial')!;
    const sombra = MAKEUP_PRODUCTS.find((p) => p.key === 'sombra')!;
    expect(buildMakeupRequest('es', labial, { color: 'rojo' }))
      .toBe('Busco un pintalabios rojo, por favor.');
    expect(buildMakeupRequest('es', sombra, { color: 'rojo' }))
      .toBe('Busco una sombra de ojos roja, por favor.');
    // "rosa" é invariável em gênero e em número no espanhol.
    expect(buildMakeupRequest('es', sombra, { color: 'rosa' }))
      .toBe('Busco una sombra de ojos rosa, por favor.');
  });

  it('ucraniano e lituano põem o adjetivo antes do núcleo', () => {
    const labial = MAKEUP_PRODUCTS.find((p) => p.key === 'labial')!;
    expect(buildMakeupRequest('uk', labial, { color: 'rojo' })).toContain('червону помаду');
    expect(buildMakeupRequest('lt', labial, { color: 'rojo' })).toContain('raudono lūpdažio');
  });
});

// ---------------------------------------------------------------------------

describe('PARTE 3 — convenções de caso e artigo', () => {
  // A convenção do artigo colado de locationData.ts NÃO vale aqui: o pedido é
  // indefinido. Esta é a armadilha mais fácil de cair neste arquivo.
  it('nenhum produto em árabe leva o artigo "ال"', () => {
    const comArtigo = MAKEUP_PRODUCTS.filter((p) => p.orders.ar.startsWith('ال'));
    expect(comArtigo.map((p) => p.key)).toEqual([]);
  });

  it('nenhum acessório em árabe leva o artigo "ال"', () => {
    const comArtigo = TOOLS.filter((t) => t.askFor.ar.startsWith('ال'));
    expect(comArtigo.map((t) => t.key)).toEqual([]);
  });

  it('"Ieškau" rege genitivo: todo acessório tem a forma para o quadro que pede', () => {
    const faltando: string[] = [];
    for (const frame of TOOL_FRAMES) {
      for (const lang of frame.gen ?? []) {
        for (const tool of TOOLS) {
          const g = lang === 'uk' ? tool.gen?.uk : lang === 'lt' ? tool.gen?.lt : undefined;
          if (!g) faltando.push(`${frame.key}/${lang}/${tool.key}`);
        }
      }
    }
    expect(faltando.slice(0, 8)).toEqual([]);
  });

  it('o verbo do preço concorda em número, e o número muda por idioma', () => {
    const pinza = TOOLS.find((t) => t.key === 'pinza')!;
    const price = TOOL_FRAMES.find((f) => f.key === 'price')!;
    // "las pinzas" é plural em espanhol, "a pinça" é singular em português.
    expect(buildToolPhrase('es', price, pinza)).toBe('¿Cuánto cuestan las pinzas?');
    expect(buildToolPhrase('pt', price, pinza)).toBe('Quanto custa a pinça?');
    expect(buildToolPhrase('en', price, pinza)).toBe('How much are the tweezers?');
    expect(buildToolPhrase('fr', price, pinza)).toBe('Combien coûte la pince à épiler ?');
    // O quadro de objeto direto não concorda com nada: continua no singular.
    const have = TOOL_FRAMES.find((f) => f.key === 'have')!;
    expect(buildToolPhrase('es', have, pinza)).toBe('¿Tenéis unas pinzas?');
  });

  it('todo quadro que concorda em número tem as duas formas nos oito idiomas', () => {
    for (const f of TOOL_FRAMES) {
      if (!f.templatesPl) continue;
      for (const lang of SUPPORTED_LANGS) {
        expect(f.templatesPl[lang], `${f.key}/${lang}`).toContain('{item}');
      }
    }
    // Um acessório marcado como plural num idioma sem quadro plural passaria
    // despercebido: hoje só o preço concorda, e é isso que esta linha tranca.
    expect(TOOL_FRAMES.filter((f) => f.templatesPl).map((f) => f.key)).toEqual(['price']);
  });

  it('o quadro de preço usa o nominativo, não o acusativo', () => {
    const escova = TOOLS.find((t) => t.key === 'escova')!;
    const price = TOOL_FRAMES.find((f) => f.key === 'price')!;
    const have = TOOL_FRAMES.find((f) => f.key === 'have')!;
    expect(buildToolPhrase('lt', price, escova)).toBe('Kiek kainuoja plaukų šepetys?');
    expect(buildToolPhrase('lt', have, escova)).toBe('Ar turite plaukų šepetį?');
    // E em espanhol o preço vai no definido, não no indefinido.
    expect(buildToolPhrase('es', price, escova)).toBe('¿Cuánto cuesta el cepillo del pelo?');
  });
});

// ---------------------------------------------------------------------------

describe('PARTE 4 — integridade das tabelas', () => {
  it('as chaves não se repetem', () => {
    const dup = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) !== i);
    expect(dup(MAKEUP_PRODUCTS.map((p) => p.key))).toEqual([]);
    expect(dup(TOOLS.map((t) => t.key))).toEqual([]);
    expect(dup(TOOL_FRAMES.map((f) => f.key))).toEqual([]);
    expect(dup(DIMENSIONS.map((d) => d.key))).toEqual([]);
    for (const d of DIMENSIONS) expect(dup(d.options.map((o) => o.key))).toEqual([]);
  });

  it('`dims` só cita dimensões existentes, sem repetir', () => {
    const conhecidas = new Set(DIMENSIONS.map((d) => d.key));
    for (const p of MAKEUP_PRODUCTS) {
      expect(new Set(p.dims).size, p.key).toBe(p.dims.length);
      for (const d of p.dims) expect(conhecidas.has(d), `${p.key}/${d}`).toBe(true);
    }
  });

  it('`only` só cita produtos existentes, e nunca esvazia uma dimensão', () => {
    const conhecidos = new Set(MAKEUP_PRODUCTS.map((p) => p.key));
    for (const dim of DIMENSIONS) {
      for (const opt of dim.options) {
        for (const k of opt.only ?? []) expect(conhecidos.has(k), `${dim.key}/${opt.key}/${k}`).toBe(true);
      }
    }
    // Um produto nunca pode abrir uma seção vazia.
    for (const p of MAKEUP_PRODUCTS) {
      for (const key of p.dims) {
        const dim = DIMENSIONS.find((d) => d.key === key)!;
        expect(optionsFor(dim, p).length, `${p.key}/${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('toda amostra é um hex de seis dígitos', () => {
    const hex = /^#[0-9A-Fa-f]{6}$/;
    for (const dim of DIMENSIONS) {
      for (const opt of dim.options) {
        if (!opt.swatch) continue;
        const cores = typeof opt.swatch === 'string'
          ? [opt.swatch]
          : [opt.swatch.cool, opt.swatch.neutral, opt.swatch.warm];
        for (const c of cores) expect(hex.test(c), `${dim.key}/${opt.key}: ${c}`).toBe(true);
      }
    }
  });

  it('a escala de tom vai de muito claro a muito escuro', () => {
    // Uma régua que começa clara e termina média exclui parte do público, e
    // isso é visível. Mede a luminância da amostra neutra.
    const lum = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
    };
    const depth = DIMENSIONS.find((d) => d.key === 'depth')!;
    const neutros = depth.options.map((o) => lum((o.swatch as { neutral: string }).neutral));
    expect(neutros[0]).toBeGreaterThan(0.8);                     // muito claro
    expect(neutros[neutros.length - 1]).toBeLessThan(0.2);       // muito escuro
    for (let i = 1; i < neutros.length; i++) {
      expect(neutros[i], `degrau ${i}`).toBeLessThan(neutros[i - 1]);
    }
  });

  it('as perguntas da loja não têm clítico que concorde com o produto', () => {
    // "¿Puedo probarlo?" fica errado quando o produto é "una base".
    expect(MAKEUP_QUESTIONS).toHaveLength(9);
    for (const q of MAKEUP_QUESTIONS) {
      expect(q.es, q.es).not.toMatch(/\b\w+(lo|la|los|las)\?/);
      expect(q.fr, q.fr).not.toMatch(/\b(le|la|les)\s+(rendre|essayer|prendre)\b/);
    }
  });

  it('todo texto existe nos oito idiomas', () => {
    const cheio = (t: Record<string, unknown>, tag: string) => {
      for (const lang of SUPPORTED_LANGS) {
        expect(typeof t[lang] === 'string' && (t[lang] as string).length > 0, `${tag}/${lang}`).toBe(true);
      }
    };
    for (const p of MAKEUP_PRODUCTS) {
      cheio(p.names, `produto ${p.key}.names`);
      cheio(p.orders, `produto ${p.key}.orders`);
      cheio(p.descs, `produto ${p.key}.descs`);
    }
    for (const t of TOOLS) {
      cheio(t.names, `acessório ${t.key}.names`);
      cheio(t.askFor, `acessório ${t.key}.askFor`);
      if (t.note) cheio(t.note, `acessório ${t.key}.note`);
    }
    for (const f of TOOL_FRAMES) {
      cheio(f.labels, `quadro ${f.key}.labels`);
      cheio(f.templates, `quadro ${f.key}.templates`);
    }
    for (const dim of DIMENSIONS) {
      for (const o of dim.options) cheio(o.labels, `opção ${dim.key}/${o.key}.labels`);
    }
    MAKEUP_QUESTIONS.forEach((q, i) => cheio(q, `pergunta ${i}`));
  });

  it('todo quadro traz a lacuna {item} nos oito idiomas', () => {
    for (const f of TOOL_FRAMES) {
      for (const lang of SUPPORTED_LANGS) {
        expect(f.templates[lang], `${f.key}/${lang}`).toContain('{item}');
      }
    }
  });
});

// ---------------------------------------------------------------------------

describe('PARTE 5 — o que sobra ao trocar de produto', () => {
  // A tela NÃO poda o estado ao trocar de produto: quem passou pelo batom e
  // voltou para a base teria de informar o próprio tom de novo. Quem filtra é
  // o builder, e é isso que estes testes trancam.
  const base = MAKEUP_PRODUCTS.find((p) => p.key === 'base')!;
  const labial = MAKEUP_PRODUCTS.find((p) => p.key === 'labial')!;
  const colorete = MAKEUP_PRODUCTS.find((p) => p.key === 'colorete')!;

  it('o atributo que não vale para o produto não entra na frase', () => {
    const escolhas = { depth: 'claro', coverage: 'alta', color: 'rojo' };
    expect(buildMakeupRequest('es', labial, escolhas)).toBe('Busco un pintalabios rojo, por favor.');
  });

  it('e volta inteiro quando o produto aceita de novo', () => {
    // base → batom → base: o tom da pessoa continua lá.
    const escolhas = { depth: 'claro', coverage: 'alta', color: 'rojo' };
    expect(buildMakeupRequest('es', base, escolhas))
      .toBe('Busco una base de maquillaje de tono claro, de cobertura alta, por favor.');
  });

  it('uma opção bloqueada para o produto também fica de fora', () => {
    // "transparente" existe em esmalte e batom, não em blush.
    expect(buildMakeupRequest('es', labial, { color: 'transparente' }))
      .toBe('Busco un pintalabios transparente, por favor.');
    expect(buildMakeupRequest('es', colorete, { color: 'transparente' }))
      .toBe('Busco un colorete, por favor.');
  });
});

// ---------------------------------------------------------------------------

/**
 * O que fala da Espanha. O destino pode ser EUA ou França, e "Na Espanha é
 * colorete — blush quase ninguém entende" embaixo da palavra "blush" ensina o
 * contrário do que a tela mostra. Por isso a explicação vive em dois campos, e
 * estes testes seguram a fronteira entre eles.
 */
const FALA_DA_ESPANHA = /espanh|españ|spain|spanish|espagn|spagn|іспан|ispan|إسبان/i;

describe('PARTE 6 — o que é neutro e o que é da Espanha', () => {
  it('a descrição do produto não fala da Espanha, em nenhum dos oito idiomas', () => {
    const falam: string[] = [];
    for (const p of MAKEUP_PRODUCTS) {
      for (const lang of SUPPORTED_LANGS) {
        if (FALA_DA_ESPANHA.test(p.descs[lang])) falam.push(`${p.key}/${lang}: ${p.descs[lang]}`);
      }
    }
    expect(falam).toEqual([]);
  });

  it('a nota da Espanha existe nos oito idiomas, e em português diz que é da Espanha', () => {
    const comNota = MAKEUP_PRODUCTS.filter((p) => p.spainNote);
    expect(comNota.map((p) => p.key)).toEqual(['polvo', 'colorete', 'labial', 'mascara', 'esmalte']);
    for (const p of comNota) {
      for (const lang of SUPPORTED_LANGS) {
        expect(p.spainNote![lang]?.length, `${p.key}/${lang}`).toBeGreaterThan(0);
      }
      expect(p.spainNote!.pt, p.key).toMatch(/^Na Espanha/);
    }
  });

  it('a base se explica em palavras de todo dia', () => {
    const base = MAKEUP_PRODUCTS.find((p) => p.key === 'base')!;
    expect(base.descs.pt).toBe('Deixa a cor da pele igual. É difícil acertar sem testar: peça para passar na sua pele.');
  });

  it('subtom, cobertura e acabamento dizem em português o que querem dizer', () => {
    const rotulo = (dim: DimKey, opt: string) =>
      DIMENSIONS.find((d) => d.key === dim)!.options.find((o) => o.key === opt)!.labels;
    expect(rotulo('undertone', 'frio').pt).toBe('Frio (fundo rosado)');
    expect(rotulo('undertone', 'calido').pt).toBe('Quente (fundo amarelado)');
    expect(rotulo('coverage', 'ligera').pt).toBe('Leve (disfarça pouco)');
    expect(rotulo('coverage', 'alta').pt).toBe('Alta (cobre manchas)');
    expect(rotulo('finish', 'mate').pt).toBe('Matte (sem brilho)');
    expect(rotulo('finish', 'satinado').pt).toBe('Acetinado (brilho leve)');
    // Só o português ganha a explicação: o rótulo de cima é o que ela aprende,
    // e ele continua sendo a palavra da loja.
    expect(rotulo('undertone', 'frio').es).toBe('Frío');
  });

  it('todo acessório tem desenho, e todo desenho é de um acessório', () => {
    expect(Object.keys(TOOL_GLYPHS).sort()).toEqual(TOOLS.map((x) => x.key).sort());
  });
});

// ---------------------------------------------------------------------------

const t = (k: string) => (translations['pt-BR'] as Record<string, string>)[k] || k;
const pais = (code: string) => COUNTRIES.find((c) => c.code === code)!;
const BR = pais('br');
const ES = pais('es');
const US = pais('us');
const FR = pais('fr');
const tema = { color: 'bg-fuchsia-700', textColor: 'text-fuchsia-700', hex: '#a21caf', borderColor: 'border-fuchsia-700' };

const montar = (targetCountry = ES) =>
  render(createElement(MakeupModule, {
    nativeCountry: BR,
    targetCountry,
    t,
    theme: tema,
    onGoHome: () => {},
    onOpenLanguageModal: () => {},
    onOpenShare: () => {},
    handlePlayAudio: () => {},
  }));

/** O botão que contém este texto (o nome também aparece no cartão de cima, fora de botão). */
const botaoCom = (texto: string) =>
  screen.getAllByText(texto).map((e) => e.closest('button')).find(Boolean) as HTMLButtonElement;

const irParaAcessorios = () => fireEvent.click(screen.getByRole('tab', { name: t('mkModeTools') }));

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = ((): MediaQueryList => ({
    matches: false, media: '', onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent: () => false,
  } as unknown as MediaQueryList)) as unknown as typeof window.matchMedia;
});

afterEach(() => cleanup());

describe('PARTE 7 — a tela', () => {
  it('diz para que serve e diz que o resto é opcional', () => {
    montar();
    expect(screen.getByText(t('hintMakeup'))).toBeTruthy();
    // A linha do opcional vem logo depois da grade de produtos, antes da
    // primeira pergunta técnica.
    const opcional = screen.getByText(t('mkOptional'));
    const tom = screen.getByRole('heading', { name: t('mkDepth') });
    expect(opcional.compareDocumentPosition(tom) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(opcional.closest('section')!.querySelector('h2')!.textContent).toBe(t('mkProducts'));
  });

  it('o aviso de cor fica embaixo da primeira régua de cor, e some onde não há régua', () => {
    montar();
    // Base: embaixo do Tom.
    expect(screen.getByText(t('mkColorWarning')).closest('section')!.querySelector('h2')!.textContent).toBe(t('mkDepth'));
    // Batom: embaixo da Cor.
    fireEvent.click(botaoCom('o batom'));
    expect(screen.getByText(t('mkColorWarning')).closest('section')!.querySelector('h2')!.textContent).toBe(t('mkColor'));
    // Rímel: sem régua de cor, sem aviso.
    fireEvent.click(botaoCom('o rímel'));
    expect(screen.queryByText(t('mkColorWarning'))).toBeNull();
  });

  it('na Espanha, a nota do produto aparece; nos EUA e na França, não', () => {
    const colorete = MAKEUP_PRODUCTS.find((p) => p.key === 'colorete')!;
    montar(ES);
    fireEvent.click(botaoCom('o blush'));
    expect(screen.getByText(colorete.spainNote!.pt)).toBeTruthy();
    expect(screen.getByText(colorete.descs.pt)).toBeTruthy();
    cleanup();

    for (const destino of [US, FR]) {
      montar(destino);
      fireEvent.click(botaoCom('o blush'));
      expect(screen.queryByText(colorete.spainNote!.pt), destino.code).toBeNull();
      // O que o produto É continua: isso vale em qualquer país.
      expect(screen.getByText(colorete.descs.pt), destino.code).toBeTruthy();
      cleanup();
    }
  });

  it('a nota do acessório vai no cartão fixo e acompanha o toque lá embaixo', () => {
    const pincel = TOOLS.find((x) => x.key === 'pincel')!;
    const cotonete = TOOLS.find((x) => x.key === 'cotonete')!;
    montar(ES);
    irParaAcessorios();

    const nota = screen.getByText(pincel.note!.pt);
    // Fora da rolagem: é a banda fixa, que continua à vista quando ela desce.
    expect(nota.closest('main')).toBeNull();
    // E no mesmo cartão da frase.
    expect(nota.parentElement!.textContent).toContain('¿Tenéis un pincel?');

    fireEvent.click(botaoCom('os cotonetes'));
    expect(screen.queryByText(pincel.note!.pt)).toBeNull();
    const nova = screen.getByText(cotonete.note!.pt);
    expect(nova.closest('main')).toBeNull();
    // Uma vez só: saiu do cartão de baixo.
    expect(screen.getAllByText(cotonete.note!.pt)).toHaveLength(1);

    // Objeto sem armadilha de nome: sem nota.
    fireEvent.click(botaoCom('a esponja de maquiagem'));
    for (const x of TOOLS) if (x.note) expect(screen.queryByText(x.note.pt), x.key).toBeNull();
  });

  it('fora da Espanha, nenhuma nota de acessório', () => {
    for (const destino of [US, FR]) {
      montar(destino);
      irParaAcessorios();
      for (const x of TOOLS) {
        if (!x.note) continue;
        fireEvent.click(botaoCom(x.names.pt));
        expect(screen.queryByText(x.note.pt), `${destino.code}/${x.key}`).toBeNull();
      }
      cleanup();
    }
  });
});

describe('PARTE 8 — letra', () => {
  const fonte = readFileSync(join(__dirname, '..', 'modules', 'MakeupModule.tsx'), 'utf8');

  it('nenhum texto abaixo de 14px', () => {
    // O português dos botões estava em 10px, e é por ele que ela procura:
    // "o batom" embaixo de "el pintalabios". Títulos em 12px, aviso de cor em 11px.
    expect(fonte).not.toMatch(/text-\[(9|10|11|12|13)px\]/);
    expect(fonte).not.toMatch(/\btext-xs\b/);
  });

  it('o português não fica apagado', () => {
    expect(fonte).not.toMatch(/opacity-(50|60|70)/);
  });
});
