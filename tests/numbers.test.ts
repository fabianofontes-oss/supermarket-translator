import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumbersModule from '../modules/NumbersModule';
import {
  buildDate, buildPrice, buildPriceShort, currencyForCountry, decimalSeparatorFor, formatPriceTag,
  numberToWords, NUM_QUESTIONS, NUMBER_EXAMPLES, NUMBER_EXAMPLES_US, numberExamplesFor, numQuestionByKey, questionsFor,
  type Currency, type NumTab,
} from '../modules/numbers/data/numbersData';
import { SUPPORTED_LANGS } from '../modules/location/data/locationData';
import { COUNTRIES } from '../constants';
import { translations } from '../translations';
import { GESTO_KEY } from '../utils/audioState';

/**
 * Módulo "Números".
 *
 * Tranca as escolhas da auditoria de usabilidade de 23/09/2026:
 *
 *  1. A hora abre na do celular, e não num "três e meia da tarde" fixo.
 *  2. No Preço e no Número, o primeiro toque do teclado começa do zero.
 *  3. A moeda é a do país: dólar nos EUA, nos oito idiomas; e a forma curta
 *     do francês não se confunde com 80.
 *  4. As perguntas são as da aba aberta, com as duas de socorro no topo.
 *  5. O mostrador responde ao toque.
 *  6. A aba Número diz para que serve e avisa quando chega no limite.
 *  7. Piso de 14px em tudo o que ela lê.
 */

const t = (key: string) => (translations['pt-BR'] as Record<string, string>)[key] || key;
const pais = (code: string) => COUNTRIES.find((c) => c.code === code)!;
const TEMA = { color: 'bg-violet-600', textColor: 'text-violet-600 dark:text-violet-300', hex: '#7c3aed', borderColor: 'border-violet-600' };
const MALFORMADO = /undefined|NaN|\s{2,}|[{}]/;

const montar = (opts: { destino?: string; voiceStatus?: 'ok' | 'missing' | 'unknown' } = {}) => {
  const handlePlayAudio = vi.fn();
  const r = render(createElement(NumbersModule, {
    nativeCountry: pais('br'),
    targetCountry: pais(opts.destino ?? 'es'),
    t,
    theme: TEMA,
    onGoHome: vi.fn(),
    onOpenLanguageModal: vi.fn(),
    onOpenShare: vi.fn(),
    handlePlayAudio,
    voiceStatus: opts.voiceStatus,
  }));
  return { handlePlayAudio, container: r.container };
};

const aba = (nome: string) => screen.getByRole('button', { name: nome });
const tecla = (nome: string) => screen.getByRole('button', { name: nome });

beforeEach(() => {
  localStorage.clear();
  // A linha de gesto da moldura não é assunto daqui.
  localStorage.setItem(GESTO_KEY, '1');
  // Só o relógio é falso: 23/09/2026, 10:07 da manhã. Os temporizadores do
  // userEvent continuam reais.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 8, 23, 10, 7));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// ------------------------------------------------------------ moldura

describe('a tela', () => {
  it('cabeçalho curto e a dica do módulo', () => {
    montar();
    expect(screen.getByRole('heading', { level: 1, name: t('numTitle') })).toBeTruthy();
    expect(screen.getByText(t('hintNumbers'))).toBeTruthy();
  });

  it('a aba aberta aparece marcada para o leitor de tela', () => {
    montar();
    expect(aba(t('numTime')).getAttribute('aria-pressed')).toBe('true');
    expect(aba(t('numPrice')).getAttribute('aria-pressed')).toBe('false');
  });
});

// ------------------------------------------------------------ hora

describe('a hora abre na do celular', () => {
  it('10:07 vira "diez y cinco de la mañana", e não "tres y media de la tarde"', () => {
    montar();
    expect(screen.getByText('Son las diez y cinco de la mañana.')).toBeTruthy();
    expect(screen.getByText('São dez e cinco da manhã.')).toBeTruthy();
    expect(screen.getByText('10:05')).toBeTruthy();
    expect(screen.queryByText(/tres y media/)).toBeNull();
  });

  it('a data também abre em hoje, e as duas abas concordam', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(aba(t('numDate')));
    expect(screen.getByText('El veintitrés de septiembre.')).toBeTruthy();
  });

  it('"¿Qué hora es?" fica logo abaixo do relógio, uma vez só', async () => {
    const user = userEvent.setup();
    const { handlePlayAudio } = montar();
    expect(screen.getAllByText('¿Qué hora es?')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: /¿Qué hora es\?/ }));
    expect(handlePlayAudio).toHaveBeenCalledWith('¿Qué hora es?', 'es-ES');
  });
});

describe('o mostrador responde ao toque', () => {
  it('o anel de fora escolhe a hora escrita, o de dentro mantém a metade do dia', async () => {
    const user = userEvent.setup();
    const { container } = montar();
    await user.click(container.querySelector('[data-hora="21"]')!);
    expect(screen.getByText('Son las nueve y cinco de la noche.')).toBeTruthy();
    await user.click(container.querySelector('[data-hora12="4"]')!);
    expect(screen.getByText('Son las cuatro y cinco de la tarde.')).toBeTruthy();
  });

  it('o 24 do mostrador é a meia-noite', async () => {
    const user = userEvent.setup();
    const { container } = montar();
    await user.click(container.querySelector('[data-hora="0"]')!);
    expect(screen.getByText('Son las doce y cinco de la madrugada.')).toBeTruthy();
  });

  it('o anel de fora usa a cor de texto do desenho, não o cinza de preenchimento', () => {
    const { container } = montar();
    const quinze = container.querySelector('[data-hora="15"] text')!;
    expect(quinze.getAttribute('fill')).toBe('var(--art-label)');
  });

  it('os números do mostrador não ficam abaixo de 14px na tela', () => {
    // O SVG tem viewBox de 200 e vai na tela com a largura da classe w-NN
    // (NN × 4px). A letra na tela é fontSize × largura / 200. Com 13 e w-44, o
    // anel de fora saía com 11px — e são os números que ela lê e toca.
    const { container } = montar();
    const svg = container.querySelector('[data-hora="15"]')!.closest('svg')!;
    const largura = Number(/\bw-(\d+)\b/.exec(svg.getAttribute('class') ?? '')![1]) * 4;
    const escala = largura / Number(svg.getAttribute('viewBox')!.split(' ')[2]);
    const textos = [...container.querySelectorAll('[data-hora] text, [data-hora12] text')];
    expect(textos).toHaveLength(24);
    for (const tx of textos) {
      expect(Number(tx.getAttribute('font-size')) * escala, tx.textContent!).toBeGreaterThanOrEqual(14);
    }
  });
});

// ------------------------------------------------------------ teclado

describe('o primeiro toque do teclado começa do zero', () => {
  it('Preço: 4,20 € e um 5 dá 0,05 €, e não 42,05 €', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(aba(t('numPrice')));
    expect(screen.getByText('4,20 €')).toBeTruthy();
    await user.click(tecla('5'));
    expect(screen.getByText('0,05 €')).toBeTruthy();
    // Daí em diante, empurra os centavos como no caixa.
    await user.click(tecla('0'));
    await user.click(tecla('00'));
    expect(screen.getByText('50,00 €')).toBeTruthy();
    expect(screen.getByText('Cincuenta euros.')).toBeTruthy();
  });

  it('Preço: depois de um preço pronto, o próximo algarismo também começa do zero', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(aba(t('numPrice')));
    await user.click(screen.getByRole('button', { name: '12,50 €' }));
    expect(screen.getByText('Doce euros con cincuenta.')).toBeTruthy();
    await user.click(tecla('3'));
    expect(screen.getByText('0,03 €')).toBeTruthy();
  });

  it('Número: 250 e um 5 dá 5, e não 2505', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(aba(t('numNumber')));
    expect(screen.getByText('Doscientos cincuenta.')).toBeTruthy();
    await user.click(tecla('5'));
    // "Cinco." em espanhol e na glosa em português.
    expect(screen.getAllByText('Cinco.')).toHaveLength(2);
    await user.click(tecla('1'));
    expect(screen.getByText('Cincuenta y uno.')).toBeTruthy();
  });

  it('trocar de aba liga o "valor novo" de novo', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(aba(t('numPrice')));
    await user.click(tecla('7'));
    await user.click(aba(t('numDate')));
    await user.click(aba(t('numPrice')));
    await user.click(tecla('2'));
    expect(screen.getByText('0,02 €')).toBeTruthy();
  });

  it('"Apagar" é um botão de verdade, de 14px e com borda', async () => {
    // Era t('dirClear'), que virou "Começar de novo" nas Direções — e ao lado do
    // teclado dava a entender que a tela inteira voltava ao início.
    expect(t('erase')).toBe('Apagar');
    const user = userEvent.setup();
    montar();
    await user.click(aba(t('numNumber')));
    expect(screen.queryByRole('button', { name: t('dirClear') })).toBeNull();
    const limpar = screen.getByRole('button', { name: t('erase') });
    expect(limpar.className).toMatch(/\btext-sm\b/);
    expect(limpar.className).toMatch(/\bborder\b/);
    expect(limpar.className).toMatch(/active:scale-95/);
    await user.click(limpar);
    expect(screen.getByText('Cero.')).toBeTruthy();
  });
});

describe('a aba Número diz para que serve', () => {
  it('exemplos com a situação escrita põem o número no visor', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(aba(t('numNumber')));
    const febre = screen.getByRole('button', { name: /37,5 · febre/ });
    await user.click(febre);
    expect(febre.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Treinta y siete coma cinco.')).toBeTruthy();
    expect(screen.getByText('Trinta e sete vírgula cinco.')).toBeTruthy();
    expect(screen.getByRole('button', { name: /250 · gramas/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /1,5 · litro/ })).toBeTruthy();
  });

  it('no 7º algarismo avisa "Até 6 algarismos", em vez de parar calado', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(aba(t('numNumber')));
    expect(screen.getByRole('status').textContent).toBe('');
    for (const d of ['1', '2', '3', '4', '5', '6']) await user.click(tecla(d));
    expect(screen.getByText('Ciento veintitrés mil cuatrocientos cincuenta y seis.')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('');
    await user.click(tecla('7'));
    expect(screen.getByRole('status').textContent).toBe(t('numMaxDigits'));
    // O número não mudou.
    expect(screen.getByText('Ciento veintitrés mil cuatrocientos cincuenta y seis.')).toBeTruthy();
    // Apagar um algarismo tira o aviso.
    await user.click(tecla('←'));
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('todo exemplo tem rótulo nos oito idiomas e é um número que o módulo lê', () => {
    for (const ex of [...NUMBER_EXAMPLES, ...NUMBER_EXAMPLES_US]) {
      expect(ex.value).toMatch(/^\d{1,6}(,\d{1,2})?$/);
      for (const l of SUPPORTED_LANGS) expect(ex.label[l], `${ex.value}/${l}`).toBeTruthy();
    }
  });
});

// ------------------------------------------------------------ moeda

describe('a moeda é a do país onde ela está', () => {
  it('EUA → dólar; Espanha e França → euro', () => {
    expect(currencyForCountry('us')).toBe('usd');
    expect(currencyForCountry('es')).toBe('eur');
    expect(currencyForCountry('fr')).toBe('eur');
  });

  it('a etiqueta escreve como se escreve lá', () => {
    expect(formatPriceTag(420)).toBe('4,20 €');
    expect(formatPriceTag(420, 'usd')).toBe('$4.20');
    expect(formatPriceTag(95, 'usd')).toBe('$0.95');
    expect(decimalSeparatorFor('us')).toBe('.');
    expect(decimalSeparatorFor('es')).toBe(',');
    expect(decimalSeparatorFor('fr')).toBe(',');
  });

  it('"four dollars and twenty cents", e a glosa "quatro dólares e vinte centavos"', () => {
    expect(buildPrice('en', 420, 'usd')).toBe('four dollars and twenty cents.');
    expect(buildPrice('pt', 420, 'usd')).toBe('quatro dólares e vinte centavos.');
    expect(buildPrice('es', 420, 'usd')).toBe('cuatro dólares con veinte centavos.');
    expect(buildPriceShort('en', 420, 'usd')).toBe('four twenty.');
    // Abaixo de dez centavos o inglês fala o zero.
    expect(buildPriceShort('en', 405, 'usd')).toBe('four oh five.');
  });

  it('os oito idiomas sabem dizer dólar, e nenhum escorrega para o euro', () => {
    const DOLAR: Record<string, RegExp> = {
      es: /dólar/, pt: /dólar/, en: /dollar/, fr: /dollar/, it: /dollar/, uk: /долар/, ar: /دولار/, lt: /doler/,
    };
    const EURO = /euro|євро|يورو|eur/i;
    for (const l of SUPPORTED_LANGS) {
      for (const c of [100, 200, 420, 1250, 2100, 10000]) {
        const frase = buildPrice(l, c, 'usd');
        expect(frase, `${l}/${c}`).toMatch(DOLAR[l]);
        expect(frase, `${l}/${c}`).not.toMatch(EURO);
      }
    }
  });

  it('o euro, que é o padrão, continua como era', () => {
    expect(buildPrice('es', 420)).toBe('cuatro euros con veinte.');
    expect(buildPrice('en', 420)).toBe('four euros twenty.');
    expect(buildPrice('pt', 420)).toBe('quatro euros e vinte.');
    expect(buildPriceShort('es', 420)).toBe('cuatro con veinte.');
  });

  it('singular de verdade: "un céntimo", "one cent", "um centavo"', () => {
    expect(buildPrice('es', 1)).toBe('un céntimo.');
    expect(buildPrice('pt', 1)).toBe('um centavo.');
    expect(buildPrice('en', 101, 'usd')).toBe('one dollar and one cent.');
    expect(buildPrice('lt', 101, 'usd')).toBe('vienas doleris ir vienas centas.');
  });

  it('espanhol: "veintiún euros", nunca "veintiuno euros"', () => {
    expect(buildPrice('es', 2100)).toBe('veintiún euros.');
    expect(buildPrice('es', 3100, 'usd')).toBe('treinta y un dólares.');
  });

  it('a apócope vale nos céntimos também: "veintiún céntimos"', () => {
    expect(buildPrice('es', 21)).toBe('veintiún céntimos.');
    expect(buildPrice('es', 31)).toBe('treinta y un céntimos.');
    expect(buildPrice('es', 91, 'usd')).toBe('noventa y un centavos.');
    expect(buildPrice('es', 421, 'usd')).toBe('cuatro dólares con veintiún centavos.');
    // Sem substantivo depois, o número fica inteiro: "cuatro euros con veintiuno".
    expect(buildPrice('es', 421)).toBe('cuatro euros con veintiuno.');
  });

  it('de mil para cima a frase continua inteira (antes saía "undefined")', () => {
    expect(buildPrice('es', 125000)).toBe('mil doscientos cincuenta euros.');
    const moedas: Currency[] = ['eur', 'usd'];
    for (const l of SUPPORTED_LANGS) for (const m of moedas) {
      for (const c of [100000, 125050, 999999]) {
        expect(buildPrice(l, c, m), `${l}/${m}/${c}`).not.toMatch(MALFORMADO);
        expect(buildPriceShort(l, c, m) ?? '', `${l}/${m}/${c}`).not.toMatch(MALFORMADO);
      }
    }
  });

  it('a forma curta do francês não se confunde com quatre-vingts (80)', () => {
    expect(buildPriceShort('fr', 420)).toBe('quatre euros vingt.');
    expect(buildPriceShort('fr', 420, 'usd')).toBe('quatre dollars vingt.');
    for (const c of [120, 420, 999, 1280]) {
      expect(buildPriceShort('fr', c), `${c}`).not.toMatch(/^\S+ (vingt|quatre)/);
    }
  });

  it('na tela dos EUA: "$4.20", a frase em dólar e a glosa em dólar', async () => {
    const user = userEvent.setup();
    montar({ destino: 'us' });
    await user.click(aba(t('numPrice')));
    expect(screen.getByText('$4.20')).toBeTruthy();
    expect(screen.getByText('Four dollars and twenty cents.')).toBeTruthy();
    expect(screen.getByText('Quatro dólares e vinte centavos.')).toBeTruthy();
    expect(screen.getByText('Four twenty.')).toBeTruthy();
    expect(screen.getByRole('button', { name: '$0.95' })).toBeTruthy();
    expect(screen.queryByText(/€/)).toBeNull();
  });

  it('nos EUA os exemplos são os de lá: febre em Fahrenheit, peso em onças', async () => {
    expect(numberExamplesFor('us')).toBe(NUMBER_EXAMPLES_US);
    expect(numberExamplesFor('es')).toBe(NUMBER_EXAMPLES);
    expect(numberExamplesFor('fr')).toBe(NUMBER_EXAMPLES);
    const user = userEvent.setup();
    montar({ destino: 'us' });
    await user.click(aba(t('numNumber')));
    await user.click(screen.getByRole('button', { name: /99\.5 · febre/ }));
    expect(screen.getByText('Ninety-nine point five.')).toBeTruthy();
    expect(screen.getByRole('button', { name: /8 · onças/ })).toBeTruthy();
    // Nada de 37,5 °C nem de gramas para quem está nos EUA.
    expect(screen.queryByRole('button', { name: /37\.5/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /gramas/ })).toBeNull();
  });

  it('na tela dos EUA o número solto usa ponto', async () => {
    const user = userEvent.setup();
    montar({ destino: 'us' });
    await user.click(aba(t('numNumber')));
    await user.click(screen.getByRole('button', { name: /1\.5 · litro/ }));
    // O visor (o chip do exemplo também escreve "1.5").
    expect(screen.getAllByText('1.5').some((el) => /text-6xl/.test(el.className))).toBe(true);
    expect(screen.queryByText('1,5')).toBeNull();
    expect(screen.getByText('One point five.')).toBeTruthy();
    expect(tecla('.')).toBeTruthy();
  });

  it('na França a linha do caixa some, porque repetiria a frase de cima', async () => {
    const user = userEvent.setup();
    montar({ destino: 'fr' });
    await user.click(aba(t('numPrice')));
    expect(screen.getByText('Quatre euros vingt.')).toBeTruthy();
    expect(screen.queryByText(t('numAlsoSaid'))).toBeNull();
  });

  it('na Espanha a linha do caixa vem em duas linhas: o rótulo e a frase', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(aba(t('numPrice')));
    const rotulo = screen.getByText(t('numAlsoSaid'));
    const curta = screen.getByText('Cuatro con veinte.');
    expect(rotulo).not.toBe(curta);
    expect(curta.className).toMatch(/\bblock\b/);
    expect(curta.className).toMatch(/\bfont-bold\b/);
  });
});

describe('os milhares', () => {
  it('a concordância antes de "mil" em cada idioma', () => {
    // Espanhol: "uno" perde o "o" antes de "mil".
    expect(numberToWords('es', 21000)).toBe('veintiún mil');
    expect(numberToWords('es', 31000)).toBe('treinta y un mil');
    // Francês: o "s" de "quatre-vingts" e de "deux cents" cai antes de "mille".
    expect(numberToWords('fr', 80000)).toBe('quatre-vingt mille');
    expect(numberToWords('fr', 200000)).toBe('deux cent mille');
    // Italiano: "ventunmila", não "ventunomila".
    expect(numberToWords('it', 21000)).toBe('ventunmila');
    // Ucraniano: "тисяча" é feminino e o plural segue o numeral.
    expect(numberToWords('uk', 2000)).toBe('дві тисячі');
    expect(numberToWords('uk', 21000)).toBe('двадцять одна тисяча');
    expect(numberToWords('uk', 5000)).toBe("п'ять тисяч");
    expect(numberToWords('uk', 12000)).toBe('дванадцять тисяч');
  });

  it('nada malformado até 999.999', () => {
    for (const l of SUPPORTED_LANGS) {
      for (const n of [1000, 1001, 2000, 11000, 21000, 80000, 100000, 123456, 999999]) {
        expect(numberToWords(l, n), `${l}/${n}`).not.toMatch(MALFORMADO);
      }
    }
  });
});

describe('a data nos EUA', () => {
  it('"September twenty-third", e não o jeito britânico', () => {
    expect(buildDate('en', 23, 8, 'us')).toBe('September twenty-third.');
    expect(buildDate('en', 23, 8)).toBe('The twenty-third of September.');
    expect(buildDate('en', 23, 8, 'gb')).toBe('The twenty-third of September.');
  });

  it('na tela dos EUA', async () => {
    const user = userEvent.setup();
    montar({ destino: 'us' });
    await user.click(aba(t('numDate')));
    expect(screen.getByText('September twenty-third.')).toBeTruthy();
  });
});

// ------------------------------------------------------------ perguntas

describe('as perguntas são as da aba aberta', () => {
  const ABAS: NumTab[] = ['time', 'price', 'date', 'number'];

  it('as duas de socorro vêm no topo de toda aba', () => {
    for (const tab of ABAS) {
      expect(questionsFor(tab).slice(0, 2).map((q) => q.key), tab).toEqual(['repeatSlowly', 'writeDown']);
    }
  });

  it('cartão e troco só no Preço; a hora só na Hora', () => {
    const chaves = (tab: NumTab) => questionsFor(tab).map((q) => q.key);
    expect(chaves('price')).toEqual(expect.arrayContaining(['howMuch', 'card', 'change']));
    expect(chaves('time')).toEqual(expect.arrayContaining(['whatTime', 'whenOpen', 'whenClose']));
    for (const tab of ['time', 'date', 'number'] as NumTab[]) {
      expect(chaves(tab), tab).not.toContain('card');
      expect(chaves(tab), tab).not.toContain('change');
    }
    expect(chaves('date')).not.toContain('whatTime');
  });

  it('toda pergunta existe nos oito idiomas e aparece em alguma aba', () => {
    for (const q of NUM_QUESTIONS) {
      expect(q.tabs.length, q.key).toBeGreaterThan(0);
      for (const l of SUPPORTED_LANGS) expect(q.text[l], `${q.key}/${l}`).toBeTruthy();
    }
    expect(new Set(NUM_QUESTIONS.map((q) => q.key)).size).toBe(NUM_QUESTIONS.length);
    expect(() => numQuestionByKey('nada')).toThrow();
  });

  it('na tela, a aba Data não oferece cartão nem troco', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(aba(t('numDate')));
    expect(screen.queryByText('¿Aceptan tarjeta?')).toBeNull();
    expect(screen.queryByText('¿Tiene cambio?')).toBeNull();
    const lista = screen.getByRole('heading', { level: 2, name: t('numAsk') }).closest('section')!;
    const primeiras = within(lista).getAllByRole('button').slice(0, 2).map((b) => b.textContent);
    expect(primeiras[0]).toContain('¿Puede repetirlo más despacio?');
    expect(primeiras[1]).toContain('¿Me lo puede escribir?');
  });

  it('o português embaixo de cada pergunta tem 14px e não é apagado', () => {
    montar();
    const pt = screen.getByText('Pode repetir mais devagar?');
    expect(pt.className).toMatch(/\btext-sm\b/);
    expect(pt.className).toMatch(/text-gray-600/);
  });
});

// ------------------------------------------------------------ letra

describe('piso de 14px no que ela lê', () => {
  const fonte = readFileSync(join(__dirname, '..', 'modules', 'NumbersModule.tsx'), 'utf8');

  it('nenhuma letra miúda no módulo', () => {
    // Títulos em 12px, "NAS PLACAS" e a chave 24h/AM-PM em 10px, a tradução das
    // perguntas em 12px e o LIMPAR em 12px: tudo subiu para 14px.
    expect(fonte).not.toMatch(/text-\[(9|10|11|12|13)px\]/);
    expect(fonte).not.toMatch(/\btext-xs\b/);
    expect(fonte).not.toMatch(/opacity-70/);
  });

  it('os meses mostram o português embaixo, e os dois em 14px', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(aba(t('numDate')));
    const janeiro = screen.getByRole('button', { name: /enero janeiro/ });
    expect(within(janeiro).getByText('janeiro').className).toMatch(/\btext-sm\b/);
  });
});
