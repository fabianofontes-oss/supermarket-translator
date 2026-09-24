import { describe, it, expect } from 'vitest';
import { PRONOUNS, VERBS, buildPhrase, type Mood, type Tense } from '../modules/pronouns/data/pronounsData';
import {
  buildDate, buildPrice, buildPriceShort, buildTime, numberToWords, periodFromHour24,
} from '../modules/numbers/data/numbersData';
import { SUPPORTED_LANGS, toLangCode, type LangCode } from '../modules/location/data/locationData';

/**
 * Gramática gerada.
 *
 * A varredura de invariantes abaixo é permanente: ela percorre todas as
 * combinações que a interface consegue produzir e recusa saída malformada.
 * Foi ela que encontrou os quatro defeitos desta fase, e é ela que impede que
 * voltem.
 */

const MOODS: Mood[] = ['affirm', 'question', 'negative'];
const TENSES: Tense[] = ['past', 'present', 'future'];

const P = (k: string) => PRONOUNS.find((p) => p.key === k)!;
const V = (k: string) => VERBS.find((v) => v.key === k)!;

/** Toda combinação que a tela do módulo "Eu, você, ele" consegue montar. */
const todasAsFrases = function* () {
  for (const lang of SUPPORTED_LANGS) {
    for (const pronoun of PRONOUNS) {
      for (const verb of VERBS) {
        // A UI só oferece o chip "nada" para verbos que não exigem objeto.
        const comps = verb.requiresComplement ? verb.complements : [null, ...verb.complements];
        for (const comp of comps) {
          for (const mood of MOODS) {
            for (const tense of TENSES) {
              yield {
                tag: `${lang}/${pronoun.key}/${verb.key}/${comp?.key ?? 'SEM'}/${mood}/${tense}`,
                lang,
                frase: buildPhrase(lang, pronoun, verb, comp, mood, tense),
              };
            }
          }
        }
      }
    }
  }
};

/**
 * Elisão de palavra funcional pendurada no fim: "besoin d'." é defeito.
 * Não confundir com apócope legítima, como o italiano "un po'".
 */
const ELISAO_SOLTA = /(?:^|\s)(?:d|l|n|j|c|s|t|m|qu|dell|nell|all|sull|dall)['’]\s*[.?!؟]?$/i;
/** Preposição solta no fim, sem objeto: "preciso de.", "bisogno di." */
const PREPOSICAO_SOLTA = /\s(?:de|di|du|des|da|do)\s*[.?!؟]?$/i;

describe('PARTE 1 — varredura de invariantes de buildPhrase', () => {
  const frases = [...todasAsFrases()];

  it('cobre as combinações que a interface consegue produzir', () => {
    // 8 idiomas × 8 pronomes × 7 verbos × complementos × 3 modos × 3 tempos.
    expect(frases.length).toBe(15552);
    expect(SUPPORTED_LANGS).toHaveLength(8);
    expect(PRONOUNS).toHaveLength(8);
    expect(VERBS).toHaveLength(7);
  });

  const invariante = (nome: string, quebrou: (f: { frase: string; lang: LangCode }) => boolean) =>
    it(nome, () => {
      const falhas = frases.filter(quebrou).map((f) => `${f.tag}: "${f.frase}"`);
      expect(falhas.slice(0, 8)).toEqual([]);
    });

  invariante('sem undefined nem NaN', (f) => /undefined|NaN/.test(f.frase));
  invariante('sem marcador {…} por substituir', (f) => /[{}]/.test(f.frase));
  invariante('sem espaço duplo', (f) => /\s{2,}/.test(f.frase));
  invariante('sem apóstrofo seguido de espaço', (f) => /['’]\s/.test(f.frase));
  invariante('sem elisão pendurada no fim', (f) => ELISAO_SOLTA.test(f.frase));
  invariante('sem preposição solta no fim', (f) => PREPOSICAO_SOLTA.test(f.frase));
  invariante('sem parênteses de interface dentro da frase', (f) => /[()]/.test(f.frase));
  invariante('sem espaço nas bordas', (f) => /^\s|\s$/.test(f.frase));
  invariante('sem string vazia entre palavras', (f) => / \. | \? /.test(f.frase));

  // O francês escreve espaço antes de "?" — é tipografia, não defeito.
  invariante('sem espaço antes da pontuação (exceto francês)', (f) =>
    f.lang !== 'fr' && /\s+[.?!؟]/.test(f.frase));

  invariante('termina em pontuação', (f) => !/[.?!؟]$/.test(f.frase));

  invariante('começa em maiúscula onde a escrita tem caixa', (f) => {
    if (f.lang === 'ar') return false;                 // árabe não tem caixa
    const primeira = f.frase.replace(/^[¿¡]/, '')[0];  // espanhol abre com ¿
    return primeira !== primeira.toUpperCase();
  });

  it('só ser/estar em uk e ar podem ter forma vazia no presente', () => {
    const vazias: string[] = [];
    for (const v of VERBS) {
      for (const l of SUPPORTED_LANGS) {
        v.forms[l].forEach((forma, i) => {
          if (forma.trim()) return;
          const legitimo = (v.key === 'ser' || v.key === 'estar') && (l === 'uk' || l === 'ar');
          if (!legitimo) vazias.push(`${v.key}.forms.${l}[${i}]`);
        });
      }
    }
    expect(vazias).toEqual([]);
  });

  it('passado e futuro nunca têm forma vazia', () => {
    const vazias: string[] = [];
    for (const v of VERBS) {
      for (const tabela of ['pastForms', 'futureForms'] as const) {
        for (const l of SUPPORTED_LANGS) {
          v[tabela][l].forEach((f, i) => { if (!f.trim()) vazias.push(`${v.key}.${tabela}.${l}[${i}]`); });
        }
      }
    }
    expect(vazias).toEqual([]);
  });
});

describe('PARTE 2 — árabe', () => {
  const ser = V('ser'), estar = V('estar'), yo = P('yo'), tu = P('tu');
  const fala = (v: typeof ser, m: Mood, t: Tense, pr = yo) =>
    buildPhrase('ar', pr, v, v.complements[0], m, t);

  it('futuro negativo de ser usa لن + a forma sem o prefixo س', () => {
    // Marrocos → Espanha, ser, futuro, negativo: o caso reproduzido na auditoria.
    const frase = fala(ser, 'negative', 'future');
    expect(frase).toContain('لن');
    expect(frase).toContain('أكون');
    expect(frase).not.toMatch(/\s{2,}/);
  });

  it('futuro negativo de estar idem', () => {
    const frase = fala(estar, 'negative', 'future', tu);
    expect(frase).toContain('لن');
    expect(frase).toContain('تكون');
    expect(frase).not.toMatch(/\s{2,}/);
  });

  it('sem complemento também sai íntegro', () => {
    expect(buildPhrase('ar', yo, ser, null, 'negative', 'future')).toBe('أنا لن أكون.');
  });

  it('o presente continua sem cópula, que é o correto', () => {
    expect(fala(ser, 'affirm', 'present')).toBe('أنا من البرازيل.');
  });

  it('cada tempo mantém a sua partícula de negação', () => {
    expect(fala(ser, 'negative', 'present')).toContain('لست');  // ليس conjugado
    expect(fala(ser, 'negative', 'past')).toContain('ما');
    expect(fala(ser, 'negative', 'future')).toContain('لن');
    expect(fala(V('querer'), 'negative', 'present')).toContain('لا');
  });

  it('a pergunta usa هل e fecha com ؟', () => {
    expect(fala(ser, 'question', 'present')).toMatch(/^هل .*؟$/);
  });
});

describe('PARTE 3-4 — francês', () => {
  const nec = V('necesitar'), yo = P('yo');
  const fr = (comp: typeof nec.complements[0] | null, m: Mood, t: Tense = 'present') =>
    buildPhrase('fr', yo, nec, comp, m, t);

  it('a afirmativa elide sem espaço', () => {
    expect(fr(nec.complements[0], 'affirm')).toBe("J'ai besoin d'aide.");
  });

  it("a negativa elide sem espaço — antes saía com espaço depois do apóstrofo", () => {
    expect(fr(nec.complements[0], 'negative')).toBe("Je n'ai pas besoin d'aide.");
  });

  it('complemento com consoante também fica certo', () => {
    expect(fr(nec.complements[1], 'negative')).toBe("Je n'ai pas besoin d'un médecin.");
    expect(fr(nec.complements[1], 'affirm')).toBe("J'ai besoin d'un médecin.");
  });

  it('sem complemento não sobra preposição', () => {
    expect(fr(null, 'affirm')).toBe("J'ai besoin.");
    expect(fr(null, 'negative')).toBe("Je n'ai pas besoin.");
    expect(fr(null, 'question')).not.toMatch(ELISAO_SOLTA);
  });

  it('pt e it também perdem a preposição pendurada', () => {
    expect(buildPhrase('pt', yo, nec, null, 'affirm', 'present')).toBe('Eu preciso.');
    expect(buildPhrase('it', yo, nec, null, 'affirm', 'present')).toBe('Io ho bisogno.');
  });

  it('a UI não oferece "nada" para verbo que exige complemento', () => {
    expect(nec.requiresComplement).toBe(true);
    expect(V('querer').requiresComplement).toBeUndefined();
  });

  it('ne … pas continua abraçando só o auxiliar', () => {
    expect(buildPhrase('fr', yo, V('querer'), null, 'negative', 'past')).toBe("Je n'ai pas voulu.");
  });
});

describe('PARTE 5 — pronome formal', () => {
  const q = V('querer');

  it('nenhuma forma de pronome carrega rótulo de interface', () => {
    for (const p of PRONOUNS) {
      for (const l of SUPPORTED_LANGS) {
        expect(p.words[l], `${p.key}.${l}`).not.toMatch(/[()]/);
      }
    }
  });

  it('a frase usa só a forma linguística', () => {
    expect(buildPhrase('en', P('usted'), q, q.complements[0], 'affirm', 'present')).toBe('You want a coffee.');
    expect(buildPhrase('fr', P('usted'), q, q.complements[0], 'affirm', 'present')).toBe('Vous voulez un café.');
    expect(buildPhrase('it', P('usted'), q, q.complements[0], 'affirm', 'present')).toBe('Lei vuole un caffè.');
    expect(buildPhrase('uk', P('ustedes'), q, q.complements[0], 'affirm', 'present')).not.toMatch(/[()]/);
    expect(buildPhrase('lt', P('ustedes'), q, q.complements[0], 'affirm', 'present')).not.toMatch(/[()]/);
    expect(buildPhrase('ar', P('usted'), q, q.complements[0], 'affirm', 'present')).not.toMatch(/[()]/);
  });

  it('a formalidade continua marcada no dado, para a UI mostrar', () => {
    expect(P('usted').tag).toBe('formal');
    expect(P('ustedes').tag).toBe('formal');
    expect(P('vosotros').tag).toBe('spain');
  });

  it('usted continua conjugando na pessoa certa de cada idioma', () => {
    // 3ª pessoa em es/it; 2ª em en/fr/uk/ar/lt.
    expect(buildPhrase('es', P('usted'), q, null, 'affirm', 'present')).toBe('Usted quiere.');
    expect(buildPhrase('it', P('usted'), q, null, 'affirm', 'present')).toBe('Lei vuole.');
    expect(buildPhrase('en', P('usted'), q, null, 'affirm', 'present')).toBe('You want.');
  });
});

describe('MATRIZ MÍNIMA — regras que não podem regredir', () => {
  const q = V('querer'), yo = P('yo'), tu = P('tu');

  it('tu em espanhol é 2ª pessoa; em português é "você" na forma certa', () => {
    expect(buildPhrase('es', tu, q, null, 'affirm', 'present')).toBe('Tú quieres.');
    expect(buildPhrase('pt', tu, q, null, 'affirm', 'present')).toBe('Você quer.');
  });

  it('do-support do inglês', () => {
    expect(buildPhrase('en', P('el'), q, null, 'question', 'present')).toBe('Does he / she want?');
    expect(buildPhrase('en', yo, q, null, 'negative', 'present')).toBe("I don't want.");
    expect(buildPhrase('en', yo, q, null, 'question', 'past')).toBe('Did I want?');
  });

  it('negação lituana cola no verbo', () => {
    expect(buildPhrase('lt', yo, q, null, 'negative', 'present')).toContain('nenoriu');
  });

  it('lituano põe o sujeito no dativo com reikia', () => {
    const nec = V('necesitar');
    expect(buildPhrase('lt', yo, nec, nec.complements[0], 'affirm', 'present')).toMatch(/^Man reikia/);
  });

  it('ucraniano e árabe dispensam a cópula no presente', () => {
    const ser = V('ser');
    expect(buildPhrase('uk', yo, ser, ser.complements[0], 'affirm', 'present')).toBe('Я з Бразилії.');
    expect(buildPhrase('ar', yo, ser, ser.complements[0], 'affirm', 'present')).toBe('أنا من البرازيل.');
  });
});

describe('PARTE 6 — números', () => {
  it('buildPriceShort em lituano devolve lituano, não árabe', () => {
    for (const cents of [150, 499, 1250, 9999]) {
      const curto = buildPriceShort('lt', cents)!;
      expect(curto, `${cents}`).not.toMatch(/[؀-ۿ]/);
      expect(curto).toContain('ir');
    }
  });

  it('buildPriceShort devolve null quando não há as duas partes', () => {
    expect(buildPriceShort('lt', 0)).toBeNull();
    expect(buildPriceShort('lt', 100)).toBeNull();  // euros inteiros
    expect(buildPriceShort('lt', 50)).toBeNull();   // só centavos
  });

  it('nenhum idioma vaza para o ramo árabe', () => {
    for (const l of SUPPORTED_LANGS) {
      if (l === 'ar') continue;
      expect(buildPriceShort(l, 150)!, l).not.toMatch(/[؀-ۿ]/);
    }
  });

  it('buildPrice em lituano usa singular e plural corretos', () => {
    expect(buildPrice('lt', 100)).toContain('euras');    // 1
    expect(buildPrice('lt', 300)).toContain('eurai');    // 2-9
    expect(buildPrice('lt', 1100)).toContain('eurų');    // 11+
  });

  it('regras que a auditoria destacou continuam de pé', () => {
    expect(numberToWords('es', 100)).toBe('cien');
    expect(numberToWords('es', 101)).toBe('ciento uno');
    expect(numberToWords('es', 31)).toBe('treinta y uno');
    expect(numberToWords('fr', 80)).toBe('quatre-vingts');
    expect(numberToWords('fr', 91)).toBe('quatre-vingt-onze');
    expect(numberToWords('it', 21)).toBe('ventuno');
    expect(numberToWords('it', 28)).toBe('ventotto');
    expect(numberToWords('uk', 2)).toBe('два');
    expect(numberToWords('lt', 2)).toBe('du');
  });

  it('nenhuma função de número devolve saída malformada', () => {
    const suspeito = (s: string | null) => s !== null && /undefined|NaN|\s{2,}|[{}]/.test(s);
    for (const l of SUPPORTED_LANGS) {
      for (let n = 0; n <= 120; n++) expect(suspeito(numberToWords(l, n)), `${l}/${n}`).toBe(false);
      for (let h = 0; h < 24; h++) for (const m of [0, 15, 30, 45, 59]) {
        expect(suspeito(buildTime(l, h, m)), `${l}/${h}:${m}`).toBe(false);
      }
      for (const c of [0, 1, 99, 100, 250, 9999]) {
        expect(suspeito(buildPrice(l, c)), `${l}/${c}`).toBe(false);
        expect(suspeito(buildPriceShort(l, c)), `${l}/${c}`).toBe(false);
      }
      // `month` é base ZERO (vem de `Date.getMonth()`), como o módulo chama.
      for (let mes = 0; mes < 12; mes++) {
        for (const dia of [1, 2, 11, 21, 31]) {
          expect(suspeito(buildDate(l, dia, mes)), `${l}/${dia}-${mes}`).toBe(false);
        }
      }
    }
  });

  it('buildDate usa mês base zero, e dezembro é o índice 11', () => {
    // A assinatura é ambígua e já me enganou: o módulo passa `getMonth()`.
    expect(buildDate('pt', 1, 0)).toBe('um de janeiro.');
    expect(buildDate('pt', 25, 11)).toBe('vinte e cinco de dezembro.');
    expect(buildDate('en', 3, 11)).toBe('The third of December.');
    expect(buildDate('lt', 1, 11)).toBe('gruodžio 1 d.');
  });

  it('francês e italiano usam o ordinal só no dia 1', () => {
    expect(buildDate('fr', 1, 0)).toContain('premier');
    expect(buildDate('fr', 2, 0)).not.toContain('premier');
    expect(buildDate('it', 1, 0)).toContain('primo');
  });

  it('a hora espanhola de 24h deduz o período, e não inventa "diez de la madrugada"', () => {
    expect(periodFromHour24(10)).not.toBe(periodFromHour24(3));
    expect(buildTime('es', 1, 0)).toContain('Es la una');
    expect(buildTime('es', 13, 45)).toContain('menos cuarto');
  });
});

describe('PARTE 7 — passado ucraniano: decisão de produto pendente', () => {
  /**
   * O ucraniano marca gênero no passado singular: uma mulher diz "хотіла",
   * não "хотів". Todos os sete verbos usam a forma masculina nas três pessoas
   * do singular.
   *
   * NÃO é corrigido aqui de propósito. Corrigir exige um seletor de gênero,
   * que é decisão de produto: o app não tem esse conceito em lugar nenhum, e
   * inventá-lo dentro de uma correção técnica seria decidir pelo dono.
   *
   * Este teste registra o estado atual. Quando a decisão for tomada, ele falha
   * e obriga a revisão.
   */
  it('documenta que o singular do passado uk é masculino em todos os verbos', () => {
    const masculinoFixo = VERBS.filter((v) => {
      const [eu, tu, ele] = v.pastForms.uk;
      return eu === tu && tu === ele;
    }).map((v) => v.key);

    expect(masculinoFixo).toEqual(['querer', 'tener', 'poder', 'necesitar', 'hablar', 'ser', 'estar']);
  });

  it('o plural do passado uk é comum aos gêneros, e está correto', () => {
    for (const v of VERBS) {
      const [, , , nos, vos, eles] = v.pastForms.uk;
      expect(nos).toBe(vos);
      expect(vos).toBe(eles);
    }
  });
});

describe('PARTE 8 — códigos de idioma e fallback', () => {
  it('toLangCode cobre os 12 países e cai em inglês para desconhecido', () => {
    const esperado: Record<string, LangCode> = {
      'pt-BR': 'pt', 'pt-PT': 'pt', 'es-CL': 'es', 'es-AR': 'es', 'es-ES': 'es',
      'en-GB': 'en', 'en-US': 'en', 'fr-FR': 'fr', 'it-IT': 'it',
      'uk-UA': 'uk', 'ar-MA': 'ar', 'lt-LT': 'lt',
    };
    for (const [lang, code] of Object.entries(esperado)) expect(toLangCode(lang)).toBe(code);
    expect(toLangCode('zz-ZZ')).toBe('en');
  });

  it('ar como LangCode é árabe, e nunca a Argentina', () => {
    // No catálogo `ar` é código de PAÍS (Argentina); aqui é código de IDIOMA
    // (árabe). Os dois espaços de nomes coexistem e não podem se cruzar.
    expect(toLangCode('ar-MA')).toBe('ar');
    expect(toLangCode('es-AR')).toBe('es');
  });
});
