import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { translations } from '../translations';
import { COUNTRIES, SUPERMARKET_CATEGORIES, PHARMACY_CATEGORIES } from '../constants';
import { mapTranslationItem } from '../utils/itemHelpers';
import { PREPOPULATED_TRANSLATIONS } from '../data/catalog';
import { SUPPORTED_LANGS, toLangCode } from '../modules/location/data/locationData';
import { SYSTEM_LABEL, systemForCountry } from '../modules/sizes/data/sizesData';
import { useCountryPair, NATIVE_COUNTRY_KEY, TARGET_COUNTRY_KEY } from '../hooks/useCountryPair';

const ler = (p: string) => fs.readFileSync(path.resolve(__dirname, '..', p), 'utf8');
const pais = (code: string) => COUNTRIES.find((c) => c.code === code)!;

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe('PARTE 9 — es-ES, es-CL e es-AR são objetos separados', () => {
  it('cada locale é uma referência própria', () => {
    expect(translations['es-ES']).not.toBe(translations['es-CL']);
    expect(translations['es-ES']).not.toBe(translations['es-AR']);
    expect(translations['es-AR']).not.toBe(translations['es-CL']);
    expect(translations['en-GB']).not.toBe(translations['en-US']);
    expect(translations['pt-PT']).not.toBe(translations['pt-BR']);
  });

  it('mas os valores continuam iguais — separar não é inventar diferença', () => {
    expect(translations['es-ES']).toEqual(translations['es-CL']);
    expect(translations['en-GB']).toEqual(translations['en-US']);
  });

  it('mexer na Espanha não altera Chile nem Argentina', () => {
    const antesCL = translations['es-CL'].favorites;
    const antesAR = translations['es-AR'].favorites;
    translations['es-ES'].favorites = 'PROVA';
    try {
      expect(translations['es-CL'].favorites).toBe(antesCL);
      expect(translations['es-AR'].favorites).toBe(antesAR);
    } finally {
      translations['es-ES'].favorites = antesCL;
    }
  });

  it('os 12 locales continuam com o mesmo conjunto de chaves', () => {
    const locales = Object.keys(translations);
    expect(locales).toHaveLength(12);
    const base = Object.keys(translations['pt-BR']).sort();
    for (const l of locales) expect(Object.keys(translations[l]).sort(), l).toEqual(base);
  });

  it('todo lang de país resolve para um bloco', () => {
    for (const c of COUNTRIES) expect(translations[c.lang], c.name).toBeTruthy();
  });
});

describe('PARTE 8 — fallback e códigos de país × idioma', () => {
  const item = PREPOPULATED_TRANSLATIONS['produce']['fruits'].find((i) => i.source_term === 'Maçã')!;
  const resolvido = (code: string) =>
    mapTranslationItem(item, 'produce', 'fruits', pais(code), pais('es')).source_term;

  it('o código do país específico vence quando existe', () => {
    expect(resolvido('cl')).toBe(item.translations.cl);
    expect(resolvido('pt')).toBe(item.translations.pt);
    expect(resolvido('it')).toBe(item.translations.it);
  });

  it('Brasil devolve o source_term, sem consultar translations', () => {
    expect(resolvido('br')).toBe('Maçã');
    expect(item.translations.br).toBeUndefined();
  });

  it('ucraniano e lituano caem em inglês, que é mais útil que português', () => {
    expect(resolvido('ua')).toBe(item.translations.gb);
    expect(resolvido('lt')).toBe(item.translations.gb);
  });

  /**
   * O ponto sensível: `ar` é código de PAÍS (Argentina) no catálogo e código de
   * IDIOMA (árabe) nos módulos generativos. A cadeia de fallback do Marrocos
   * (`ar-MA`) passa pelo idioma base `ar` e encontra a chave da Argentina.
   *
   * Não foi corrigido nesta fase: exige mudar o espaço de nomes do catálogo
   * (1.233 itens × 8 chaves) e Marrocos é `originOnly`, então o catálogo fica
   * bloqueado e o caminho não é alcançável hoje. O teste registra o estado real
   * e falha no dia em que alguém remover o `originOnly` sem tratar isto.
   */
  it('DOCUMENTADO: Marrocos ainda cai na chave da Argentina pelo idioma base', () => {
    expect(resolvido('ma')).toBe(item.translations.ar);
    expect(pais('ma').originOnly, 'o catálogo precisa continuar bloqueado para Marrocos').toBe(true);
  });

  it('nenhum país que pode ser destino usa fallback de outro país por acidente', () => {
    for (const c of COUNTRIES.filter((x) => !x.originOnly)) {
      const esperado = c.code === 'br' ? 'Maçã' : item.translations[c.code];
      expect(resolvido(c.code), c.name).toBe(esperado);
    }
  });

  it('toLangCode separa país de idioma nos 12 países', () => {
    for (const c of COUNTRIES) expect(SUPPORTED_LANGS).toContain(toLangCode(c.lang));
    expect(toLangCode('es-AR')).toBe('es');   // Argentina fala espanhol
    expect(toLangCode('ar-MA')).toBe('ar');   // Marrocos fala árabe
  });

  it('systemForCountry cobre os 12 países', () => {
    for (const c of COUNTRIES) expect(['BR', 'EU', 'UK', 'US']).toContain(systemForCountry(c.code));
    expect(systemForCountry('ma')).toBe('EU');
    expect(systemForCountry('ar')).toBe('BR');  // Argentina, não árabe
  });
});

describe('PARTE 13 — nada de texto solto fora do sistema de tradução', () => {
  it('SYSTEM_LABEL guarda chaves de tradução, não português', () => {
    for (const [sistema, chave] of Object.entries(SYSTEM_LABEL)) {
      expect(translations['pt-BR'][chave], `${sistema} → ${chave}`).toBeTruthy();
      expect(translations['uk-UA'][chave]).toBeTruthy();
    }
    expect(translations['uk-UA'][SYSTEM_LABEL.UK]).not.toBe('Reino Unido');
  });

  it('as chaves usadas no código existem em todos os locales', () => {
    const fontes = ['App.tsx', 'components/TranslationItem.tsx', 'components/ModuleLayout.tsx',
                    'components/LanguagePanel.tsx', 'components/CategorySheet.tsx',
                    'components/ErrorFallback.tsx', 'modules/CatalogModule.tsx',
                    'components/ShareSheet.tsx', 'components/ShareButton.tsx',
                    // Nenhum módulo generativo estava nesta lista, então um
                    // t('mkDeph') com erro de digitação renderizaria a chave
                    // crua e nenhum teste pegaria. Estender aos outros sete
                    // é trabalho próprio, e vale.
                    'modules/MakeupModule.tsx'];
    const usadas = new Set<string>();
    for (const f of fontes) {
      for (const m of ler(f).matchAll(/\bt\('([A-Za-z0-9_]+)'\)/g)) usadas.add(m[1]);
    }
    expect(usadas.size).toBeGreaterThan(20);
    const faltando = [...usadas].filter((k) => !translations['pt-BR'][k] || !translations['ar-MA'][k]);
    expect(faltando).toEqual([]);
  });

  it('as categorias e subcategorias continuam traduzidas nos 12 locales', () => {
    const chaves = new Set<string>();
    for (const c of [...SUPERMARKET_CATEGORIES, ...PHARMACY_CATEGORIES]) {
      chaves.add(c.name);
      c.subCategories.forEach((s) => chaves.add(s));
    }
    for (const l of Object.keys(translations)) {
      const faltando = [...chaves].filter((k) => !translations[l][k]);
      expect(faltando, l).toEqual([]);
    }
  });
});

describe('PARTE 10 e 14 — lang/dir do documento e persistência do par', () => {
  it('lang e dir seguem o idioma da interface, que é o país nativo', () => {
    const { result } = renderHook(() => useCountryPair(COUNTRIES));

    expect(document.documentElement.lang).toBe('pt-BR');
    expect(document.documentElement.dir).toBe('ltr');

    act(() => result.current.setNativeCountry(pais('ma')));
    expect(document.documentElement.lang).toBe('ar-MA');
    expect(document.documentElement.dir).toBe('rtl');

    act(() => result.current.setNativeCountry(pais('ua')));
    expect(document.documentElement.lang).toBe('uk-UA');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('o país de DESTINO não mexe no dir — quem manda é a interface', () => {
    const { result } = renderHook(() => useCountryPair(COUNTRIES));
    act(() => result.current.setTargetCountry(pais('fr')));
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('o par escolhido sobrevive a fechar e reabrir', () => {
    const primeira = renderHook(() => useCountryPair(COUNTRIES));
    act(() => {
      primeira.result.current.setNativeCountry(pais('ua'));
      primeira.result.current.setTargetCountry(pais('it'));
    });
    expect(localStorage.getItem(NATIVE_COUNTRY_KEY)).toBe('"ua"');
    primeira.unmount();

    const segunda = renderHook(() => useCountryPair(COUNTRIES));
    expect(segunda.result.current.nativeCountry.code).toBe('ua');
    expect(segunda.result.current.targetCountry.code).toBe('it');
  });

  it('sem nada salvo, o padrão é Brasil → Espanha', () => {
    const { result } = renderHook(() => useCountryPair(COUNTRIES));
    expect(result.current.nativeCountry.code).toBe('br');
    expect(result.current.targetCountry.code).toBe('es');
  });

  it('código desconhecido cai no padrão sem apagar o que estava gravado', () => {
    localStorage.setItem(NATIVE_COUNTRY_KEY, '"zz"');
    const { result } = renderHook(() => useCountryPair(COUNTRIES));
    expect(result.current.nativeCountry.code).toBe('br');
    // O valor bruto continua lá: uma versão futura pode conhecer "zz", e
    // apagá-lo aqui destruiria a escolha do usuário em silêncio.
    expect(localStorage.getItem(NATIVE_COUNTRY_KEY)).toBe('"zz"');
  });

  it('mas uma escolha explícita do usuário sobrescreve o valor desconhecido', () => {
    localStorage.setItem(NATIVE_COUNTRY_KEY, '"zz"');
    const { result } = renderHook(() => useCountryPair(COUNTRIES));
    act(() => result.current.setNativeCountry(pais('fr')));
    expect(localStorage.getItem(NATIVE_COUNTRY_KEY)).toBe('"fr"');
  });

  it('storage corrompido não impede o app de abrir', () => {
    localStorage.setItem(TARGET_COUNTRY_KEY, '{quebrado');
    const { result } = renderHook(() => useCountryPair(COUNTRIES));
    expect(result.current.targetCountry.code).toBe('es');
  });
});

describe('PARTE 11 — RTL', () => {
  it('a regra de letter-spacing existe e é limitada a dir=rtl', () => {
    const css = ler('index.css');
    expect(css).toMatch(/\[dir=['"]rtl['"]\]\s*\*\s*\{[^}]*letter-spacing:\s*normal/);
    // não pode ser global: quebraria a tipografia dos outros sete idiomas
    expect(css).not.toMatch(/^\s*\*\s*\{\s*letter-spacing:\s*normal/m);
  });

  it('o árabe tem tradução para todas as chaves, senão o RTL mostra a chave crua', () => {
    const faltando = Object.keys(translations['pt-BR']).filter((k) => !translations['ar-MA'][k]);
    expect(faltando).toEqual([]);
  });
});

describe('PARTE 12 — dir="auto" no texto traduzido', () => {
  const alvos = ['components/TranslationItem.tsx', 'components/ErrorFallback.tsx', 'modules/CatalogModule.tsx',
                 'components/ShareSheet.tsx'];

  it('os textos vindos de tradução declaram dir="auto"', () => {
    for (const f of alvos) {
      const fonte = ler(f);
      const comT = (fonte.match(/\{t\('/g) ?? []).length;
      const comDir = (fonte.match(/dir="auto"/g) ?? []).length;
      expect(comT, f).toBeGreaterThan(0);
      expect(comDir, `${f} não marca direção em nenhum texto`).toBeGreaterThan(0);
    }
  });

  it('o título do módulo e o par de termos do card marcam direção', () => {
    const card = ler('components/TranslationItem.tsx');
    expect(card).toMatch(/id=\{nameId\}[^>]*dir="auto"/s);
    expect(card).toMatch(/id=\{termId\}[\s\S]{0,220}dir="auto"/);
  });
});

describe('PARTE 13 — corpo maior em árabe e ucraniano', () => {
  /**
   * No mesmo tamanho nominal, árabe e cirílico têm traço mais fino e detalhe
   * distintivo menor que o latino. Some a isso que quem usa este app está lendo
   * um alfabeto que não conhece — não dá para reconhecer a palavra pela
   * silhueta, é preciso resolver glifo por glifo — e 12px viram barreira.
   *
   * Regra fácil de apagar sem perceber, porque nada quebra visualmente para
   * quem revisa em português.
   */
  const ESCALA = ['.text-xs', '.text-sm', '.text-base', '.text-lg', '.text-xl'];

  it('cada degrau da escala pequena tem regra para as duas escritas', () => {
    const css = ler('index.css');
    for (const cls of ESCALA) {
      expect(css, `${cls} sem regra para árabe`).toContain(`html[lang^='ar'] ${cls}`);
      expect(css, `${cls} sem regra para ucraniano`).toContain(`html[lang^='uk'] ${cls}`);
    }
  });

  it('os títulos grandes ficam de fora, senão o cabeçalho corta', () => {
    const css = ler('index.css');
    for (const cls of ['.text-2xl', '.text-3xl', '.text-4xl']) {
      expect(css, `${cls} não devia escalar`).not.toContain(`html[lang^='ar'] ${cls}`);
    }
  });

  it('a URL de compartilhamento fica fora da escala', () => {
    // String de máquina em alfabeto latino: ninguém a lê glifo por glifo, e em
    // `font-mono` a 14px ela não cabe na folha e quebra no meio da palavra.
    expect(ler('index.css')).toContain('.url-mono');
    const folha = ler('components/ShareSheet.tsx');
    expect(folha).toContain('url-mono');
    expect(folha, 'a URL voltou para uma classe que a escala alcança').not.toContain('font-mono text-xs');
  });
});
