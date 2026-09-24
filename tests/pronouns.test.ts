import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PronounsModule from '../modules/PronounsModule';
import {
  PRONOUNS, VERBS, MOOD_LABELS, buildPhrase, verbForm,
  pronounByKey as P, verbByKey as V,
  pronounsFor, pronounBadge, noteFor, youPronoun, readyPhrasesFor, defaultComplement,
  type Mood, type Tense, type NoteRegion,
} from '../modules/pronouns/data/pronounsData';
import { SUPPORTED_LANGS, type LangCode } from '../modules/location/data/locationData';
import { COUNTRIES } from '../constants';
import { translations } from '../translations';
import { GESTO_KEY } from '../utils/audioState';

/**
 * Módulo "Quero, posso, preciso" (nasceu "Eu, você, ele").
 *
 * Tranca as escolhas da auditoria de usabilidade de 23/09/2026 (pron-1 a pron-8):
 *
 *  1. O destino manda na grade: "vous" uma vez na França, um "you" só nos EUA,
 *     "vosotros" e o selo ESPANHA só na Espanha, e a nota é a do lugar.
 *  2. Frases prontas, um toque cada, com o rótulo saído do próprio buildPhrase.
 *  3. A rolagem segue quem precisa falar: frases prontas, verbo, o quê, quem,
 *     e só depois quando/como.
 *  4. Nada de jargão de escola nos botões e nas notas.
 *  5. Piso de 14px.
 *  6. A primeira frase é algo que ela diria hoje.
 *  7. Nenhuma frase concorda com o gênero de quem fala.
 *  8. "él" e "ella" separados, sem a barra dentro da frase falada.
 *
 * A varredura de invariantes de buildPhrase continua em grammar.test.ts; aqui
 * vai uma cópia enxuta só para o que é novo (os dez pronomes e o feminino).
 */

const t = (key: string) => (translations['pt-BR'] as Record<string, string>)[key] || key;
const pais = (code: string) => COUNTRIES.find((c) => c.code === code)!;
const TEMA = { color: 'bg-teal-700', textColor: 'text-teal-700 dark:text-teal-300', hex: '#0f766e', borderColor: 'border-teal-700' };
const MOODS: Mood[] = ['affirm', 'question', 'negative'];
const TENSES: Tense[] = ['past', 'present', 'future'];
/** Os destinos abertos no lançamento: [língua, país]. */
const DESTINOS: [LangCode, string][] = [['es', 'es'], ['fr', 'fr'], ['en', 'us']];

const props = (destino: string) => ({
  nativeCountry: pais('br'),
  targetCountry: pais(destino),
  t,
  theme: TEMA,
  onGoHome: vi.fn(),
  onOpenLanguageModal: vi.fn(),
  onOpenShare: vi.fn(),
  handlePlayAudio: vi.fn(),
});

const montar = (destino = 'es') => {
  const p = props(destino);
  const r = render(createElement(PronounsModule, p));
  return { ...r, handlePlayAudio: p.handlePlayAudio };
};

/** O botão de escolha pelo texto que ele mostra (o de uma frase pronta, de um verbo…). */
const botao = (texto: string) => screen.getByRole('button', { name: texto });

beforeEach(() => {
  localStorage.clear();
  // A linha de gesto da moldura não é assunto daqui.
  localStorage.setItem(GESTO_KEY, '1');
});
afterEach(() => cleanup());

// ------------------------------------------------------------ pron-1: destino

describe('o destino manda na grade (pron-1)', () => {
  const palavras = (lang: LangCode, country: string) => pronounsFor(lang, country).map((p) => p.words[lang]);

  it('Espanha mostra os onze, com nosotras e vosotros', () => {
    // Em pares na grade de duas colunas; vosotros, que só existe lá, fecha a lista.
    expect(palavras('es', 'es')).toEqual(
      ['yo', 'tú', 'él', 'ella', 'usted', 'ustedes', 'nosotros', 'nosotras', 'ellos', 'ellas', 'vosotros'],
    );
  });

  it('"nosotras" existe em todo espanhol, e só no espanhol', () => {
    expect(palavras('es', 'cl')).toContain('nosotras');
    for (const [lang, country] of DESTINOS.filter(([l]) => l !== 'es')) {
      expect(pronounsFor(lang, country).map((p) => p.key), lang).not.toContain('nosotras');
    }
    expect(pronounsFor('it', 'it').map((p) => p.key)).not.toContain('nosotras');
  });

  it('França: "vous" uma vez só, sem vosotros nem ustedes', () => {
    expect(palavras('fr', 'fr')).toEqual(['je', 'tu', 'il', 'elle', 'vous', 'nous', 'ils', 'elles']);
  });

  it('EUA: um "you" só, e sem "you all"', () => {
    expect(palavras('en', 'us')).toEqual(['I', 'you', 'he', 'she', 'we', 'they']);
  });

  it('nenhum destino aberto repete a mesma palavra na grade', () => {
    for (const [lang, country] of DESTINOS) {
      const lista = palavras(lang, country);
      expect(new Set(lista).size, `${lang}: ${lista.join(', ')}`).toBe(lista.length);
    }
  });

  it('no espanhol fora da Espanha, vosotros some e ustedes perde o selo', () => {
    expect(palavras('es', 'cl')).not.toContain('vosotros');
    expect(pronounBadge(P('ustedes'), 'es', 'cl')).toBeNull();
    expect(pronounBadge(P('usted'), 'es', 'cl')).toBe('formal');
  });

  it('selo ESPANHA só na Espanha; FORMAL nunca em inglês', () => {
    expect(pronounBadge(P('vosotros'), 'es', 'es')).toBe('spain');
    for (const [lang, country] of DESTINOS.filter(([l]) => l !== 'es')) {
      for (const p of pronounsFor(lang, country)) {
        expect(pronounBadge(p, lang, country), `${lang}/${p.key}`).not.toBe('spain');
      }
    }
    for (const p of PRONOUNS) expect(pronounBadge(p, 'en', 'us'), p.key).toBeNull();
    expect(pronounBadge(P('usted'), 'fr', 'fr')).toBe('formal');
  });

  it('na tela: nem "Espanha" nem "formal" nos EUA; "vous" com FORMAL na França', () => {
    montar('us');
    expect(screen.queryByText('Espanha')).toBeNull();
    expect(screen.queryByText('formal')).toBeNull();
    cleanup();

    montar('fr');
    expect(screen.queryByText('Espanha')).toBeNull();
    expect(screen.getAllByText('formal')).toHaveLength(1);
  });

  it('o verbo falar tem a língua de cada destino aberto', () => {
    const falar = V('hablar');
    expect(falar.complements.map((c) => c.key)).toEqual(expect.arrayContaining(['spanish', 'english', 'french']));
    expect(defaultComplement(falar, 'fr')).toBe('french');
    expect(defaultComplement(falar, 'en')).toBe('english');
    expect(defaultComplement(falar, 'es')).toBe('spanish');
    // Nos outros verbos, continua o primeiro complemento.
    expect(defaultComplement(V('querer'), 'fr')).toBe('coffee');
  });

  it('na França, tocar em "parler" já monta a frase com "français"', async () => {
    montar('fr');
    await userEvent.click(botao('parler falar'));
    expect(screen.getByText('Est-ce que vous parlez français ?')).toBeTruthy();
  });
});

// ------------------------------------------------------------ pron-1/4: notas

describe('a nota é a do lugar onde ela está (pron-1, pron-4)', () => {
  it('França: "tu" manda usar "vous" com quem não conhece', () => {
    const nota = noteFor(P('tu'), 'fr', 'fr', 'pt')!;
    expect(nota).toContain('França');
    expect(nota).toContain('vous');
    expect(nota).not.toContain('Espanha');
    expect(noteFor(P('usted'), 'fr', 'fr', 'pt')).toContain('Na dúvida, use "vous"');
  });

  it('EUA: "you" serve para todo mundo', () => {
    expect(noteFor(P('tu'), 'en', 'us', 'pt')).toContain('"you" serve para todo mundo');
  });

  it('Espanha: as notas da Espanha, sem jargão', () => {
    expect(noteFor(P('tu'), 'es', 'es', 'pt')).toContain('Na Espanha');
    expect(noteFor(P('usted'), 'es', 'es', 'pt')).toContain('o senhor / a senhora');
    expect(noteFor(P('nosotras'), 'es', 'es', 'pt')).toContain('só de mulheres');
  });

  it('a nota do "tú" não manda tratar a patroa de tú', () => {
    // Dizia "use com quase todo mundo", e a Limpeza e o Cuidar de idosos mandam
    // tratar a patroa e a gente mais velha de "usted". O app se contradizia.
    const nota = noteFor(P('tu'), 'es', 'es', 'pt')!;
    expect(nota).not.toMatch(/quase todo mundo/);
    expect(nota).toMatch(/patroa/);
    expect(nota).toMatch(/usted/);
  });

  it('nada da Espanha fora da Espanha', () => {
    expect(noteFor(P('tu'), 'es', 'cl', 'pt')).toBeNull();
    for (const [lang, country] of DESTINOS.filter(([, c]) => c !== 'es')) {
      for (const p of PRONOUNS) {
        const nota = noteFor(p, lang, country, 'pt');
        if (nota) expect(nota, `${lang}/${p.key}`).not.toMatch(/Espanha/);
      }
    }
  });

  it('toda nota tem os oito idiomas', () => {
    for (const p of PRONOUNS) {
      for (const [region, texto] of Object.entries(p.notes ?? {})) {
        for (const l of SUPPORTED_LANGS) {
          expect(texto![l]?.trim(), `${p.key}.${region as NoteRegion}.${l}`).toBeTruthy();
        }
      }
    }
  });

  it('nenhuma nota em português fala como aula de gramática', () => {
    for (const p of PRONOUNS) {
      for (const texto of Object.values(p.notes ?? {})) {
        // "uma pessoa" é português de todo dia; "2ª pessoa" é aula.
        expect(texto!.pt, p.key).not.toMatch(/\d[ªº]|(primeira|segunda|terceira) pessoa|forma formal|conjuga/i);
      }
    }
  });

  it('na tela, a nota aparece depois da grade de pessoas', () => {
    montar('fr');
    const grade = screen.getByRole('heading', { name: 'Quem' });
    const nota = screen.getByText(/Na dúvida, use "vous"/);
    expect(grade.compareDocumentPosition(nota) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

// ------------------------------------------------------------ pron-2: prontas

describe('frases prontas (pron-2)', () => {
  const SEM = { semSujeito: true };
  const alvo = (lang: LangCode) => readyPhrasesFor(lang).map((r) => buildPhrase(lang, r.pronoun, r.verb, r.comp, r.mood, 'present', SEM));
  const rotulo = (lang: LangCode) => readyPhrasesFor(lang).map((r) => buildPhrase('pt', r.pronoun, r.verb, r.comp, r.mood, 'present', SEM));

  it('Espanha: sem o pronome sujeito, como se diz no balcão', () => {
    // "¿Yo puedo pagar con tarjeta?" tem uma ênfase de "e eu, posso?" que
    // ninguém põe no balcão; o verbo já diz quem é.
    expect(alvo('es')).toEqual([
      '¿Puedes ayudarme?', 'No hablo español.', 'Hablo un poco.',
      '¿Puedo pagar con tarjeta?', 'Necesito un médico.',
    ]);
    expect(rotulo('es')).toEqual([
      'Pode me ajudar?', 'Não falo espanhol.', 'Falo um pouco.',
      'Posso pagar com cartão?', 'Preciso de um médico.',
    ]);
  });

  it('inglês e francês não largam o sujeito, e a frase montada continua com ele', () => {
    const [ajuda] = readyPhrasesFor('en');
    expect(buildPhrase('en', ajuda.pronoun, ajuda.verb, ajuda.comp, ajuda.mood, 'present', SEM)).toBe('Can you help me?');
    const naoFalo = readyPhrasesFor('fr').find((r) => r.key === 'noSpeak')!;
    expect(buildPhrase('fr', naoFalo.pronoun, naoFalo.verb, naoFalo.comp, naoFalo.mood, 'present', SEM)).toBe('Je ne parle pas français.');
    // Sem a opção, nada muda: os seletores ensinam o pronome.
    expect(buildPhrase('es', P('yo'), V('necesitar'), V('necesitar').complements[1], 'affirm')).toBe('Yo necesito un médico.');
    expect(buildPhrase('it', P('usted'), V('poder'), V('poder').complements[0], 'question', 'present', SEM)).toBe('Può aiutarmi?');
  });

  it('França: "vous" e "français"', () => {
    expect(alvo('fr')).toContain("Est-ce que vous pouvez m'aider ?");
    expect(alvo('fr')).toContain('Je ne parle pas français.');
    expect(rotulo('fr')).toContain('Não falo francês.');
  });

  it('EUA: "English"', () => {
    expect(alvo('en')).toContain('Can you help me?');
    expect(alvo('en')).toContain("I don't speak English.");
    expect(rotulo('en')).toContain('Não falo inglês.');
  });

  it('destino sem a língua do lugar não mostra "Não falo…"', () => {
    expect(readyPhrasesFor('it').map((r) => r.key)).not.toContain('noSpeak');
    expect(readyPhrasesFor('it').length).toBe(4);
  });

  it('todo pronome de frase pronta existe na grade daquele destino', () => {
    for (const [lang, country] of DESTINOS) {
      const visiveis = pronounsFor(lang, country).map((p) => p.key);
      for (const r of readyPhrasesFor(lang)) expect(visiveis, `${lang}/${r.key}`).toContain(r.pronoun.key);
    }
  });

  it('tocar numa frase pronta monta a frase lá em cima', async () => {
    montar('es');
    const naoFalo = botao('Não falo espanhol.');
    expect(naoFalo.getAttribute('aria-pressed')).toBe('false');
    await userEvent.click(naoFalo);
    expect(screen.getByText('No hablo español.')).toBeTruthy();
    expect(naoFalo.getAttribute('aria-pressed')).toBe('true');
    expect(botao('Pode me ajudar?').getAttribute('aria-pressed')).toBe('false');
  });

  it('mexer num seletor depois da frase pronta traz o pronome de volta', async () => {
    montar('es');
    const medico = botao('Preciso de um médico.');
    await userEvent.click(medico);
    expect(screen.getByText('Necesito un médico.')).toBeTruthy();
    // Trocar o tipo lá embaixo: agora é frase montada, e ali o pronome é o ensino.
    await userEvent.click(botao(MOOD_LABELS.question.pt));
    expect(screen.getByText('¿Yo necesito un médico?')).toBeTruthy();
    expect(medico.getAttribute('aria-pressed')).toBe('false');
  });

  it('na França, a frase pronta fala francês', async () => {
    montar('fr');
    await userEvent.click(botao('Não falo francês.'));
    expect(screen.getByText('Je ne parle pas français.')).toBeTruthy();
  });

  it('a linha de ajuda aparece embaixo delas', () => {
    montar('es');
    expect(screen.getByText(t('pronReadyHint'))).toBeTruthy();
  });
});

// ------------------------------------------------------------ pron-3: ordem

describe('a rolagem segue quem precisa falar (pron-3)', () => {
  it('frases prontas, verbo, o quê, quem, quando, como — nesta ordem', () => {
    montar('es');
    const titulos = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    const ordem = ['pronReady', 'pronVerb', 'pronWhat', 'pronWho', 'pronWhen', 'pronHow'].map((k) => titulos.indexOf(t(k)));
    expect(ordem.every((i) => i >= 0), titulos.join(' | ')).toBe(true);
    expect([...ordem].sort((a, b) => a - b)).toEqual(ordem);
  });

  it('o cabeçalho usa o título curto, e a dica diz para que serve', () => {
    montar('es');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(t('pronTitle'));
    expect(screen.getByText(t('hintPronouns'))).toBeTruthy();
  });
});

// ------------------------------------------------------------ pron-4: palavras

describe('palavras de fazer, não de escola (pron-4)', () => {
  it('os botões de tipo dizem dizer / perguntar / dizer NÃO', () => {
    expect(MOOD_LABELS.affirm.pt).toBe('dizer');
    expect(MOOD_LABELS.question.pt).toBe('perguntar');
    expect(MOOD_LABELS.negative.pt).toBe('dizer NÃO');
    for (const m of MOODS) for (const l of SUPPORTED_LANGS) expect(MOOD_LABELS[m][l]?.trim(), `${m}.${l}`).toBeTruthy();
  });

  it('a tabela diz que é para tocar e ouvir, e cada linha fala', async () => {
    const { handlePlayAudio } = montar('es');
    expect(screen.getByText(t('pronTapToHear'))).toBeTruthy();
    // Abre em "poder", presente: a linha de "yo" é "puedo".
    await userEvent.click(screen.getByText('puedo').closest('button')!);
    expect(handlePlayAudio).toHaveBeenCalledWith('Yo puedo.', 'es-ES');
  });
});

// ------------------------------------------------------------ pron-5: letra

describe('piso de 14px (pron-5)', () => {
  const fonte = readFileSync(join(__dirname, '..', 'modules', 'PronounsModule.tsx'), 'utf8');

  it('nada abaixo de 14px, e o português sem opacidade', () => {
    expect(fonte).not.toMatch(/text-\[(9|10|11|12|13)px\]/);
    expect(fonte).not.toMatch(/opacity-70/);
  });

  it('text-xs só no selo decorativo', () => {
    expect(fonte.match(/\btext-xs\b/g) ?? []).toHaveLength(1);
  });
});

// ------------------------------------------------------------ pron-6: abertura

describe('a primeira frase é algo que ela diria hoje (pron-6)', () => {
  it('Espanha: "¿Puedes ayudarme?", e a frase pronta dela marcada', () => {
    montar('es');
    expect(screen.getByText('¿Puedes ayudarme?')).toBeTruthy();
    expect(botao('Pode me ajudar?').getAttribute('aria-pressed')).toBe('true');
  });

  it('França: "vous"', () => {
    montar('fr');
    expect(screen.getByText("Est-ce que vous pouvez m'aider ?")).toBeTruthy();
  });

  it('EUA: "Can you help me?"', () => {
    montar('us');
    expect(screen.getByText('Can you help me?')).toBeTruthy();
  });

  it('o "você" de abertura existe na grade de cada destino', () => {
    for (const [lang, country] of DESTINOS) {
      expect(pronounsFor(lang, country)).toContain(youPronoun(lang));
    }
  });

  it('trocar de destino com a tela aberta volta ao "você" do lugar novo', async () => {
    const { rerender } = montar('es');
    await userEvent.click(screen.getAllByRole('button').find((b) => b.textContent?.startsWith('vosotros'))!);
    expect(screen.getByText('¿Vosotros podéis ayudarme?')).toBeTruthy();
    rerender(createElement(PronounsModule, props('fr')));
    expect(screen.getByText("Est-ce que vous pouvez m'aider ?")).toBeTruthy();
  });
});

// ------------------------------------------------------------ pron-7: gênero

describe('nenhuma frase concorda com o gênero de quem fala (pron-7)', () => {
  const ser = V('ser'), estar = V('estar'), yo = P('yo');
  const aqui = ser.complements.find((c) => c.key === 'fromHere')!;
  const casa = estar.complements.find((c) => c.key === 'home')!;

  it('ser e estar não guardam mais adjetivo que concorda', () => {
    expect(ser.complements.map((c) => c.key)).toEqual(['fromBrazil', 'fromHere']);
    expect(estar.complements.map((c) => c.key)).toEqual(['here', 'home', 'fine']);
  });

  it('duas mulheres falam de si no feminino: "nosotras"', () => {
    const nec = V('necesitar');
    const ajuda = nec.complements.find((c) => c.key === 'helpN')!;
    expect(buildPhrase('es', P('nosotras'), nec, ajuda, 'affirm')).toBe('Nosotras necesitamos ayuda.');
    // Nas outras línguas "nós" não tem gênero: a frase é a mesma de "nosotros".
    for (const l of ['pt', 'en', 'fr', 'it'] as LangCode[]) {
      expect(buildPhrase(l, P('nosotras'), nec, ajuda, 'affirm'), l).toBe(buildPhrase(l, P('nosotros'), nec, ajuda, 'affirm'));
    }
  });

  it('"No soy de aquí" e o plural sem erro', () => {
    expect(buildPhrase('es', yo, ser, aqui, 'negative')).toBe('Yo no soy de aquí.');
    expect(buildPhrase('fr', yo, ser, aqui, 'negative')).toBe("Je ne suis pas d'ici.");
    expect(buildPhrase('en', yo, ser, aqui, 'negative')).toBe('I am not from here.');
    expect(buildPhrase('pt', yo, ser, aqui, 'negative')).toBe('Eu não sou daqui.');
    expect(buildPhrase('es', P('nosotros'), ser, aqui, 'affirm')).toBe('Nosotros somos de aquí.');
    expect(buildPhrase('es', P('ellos'), estar, casa, 'affirm')).toBe('Ellos están en casa.');
    expect(buildPhrase('en', P('nosotros'), estar, casa, 'affirm')).toBe('We are at home.');
  });

  it('o passado italiano de ser/estar não concorda ("ero", nunca "sono stato/stata")', () => {
    expect(buildPhrase('it', yo, ser, aqui, 'affirm', 'past')).toBe('Io ero di qui.');
    expect(buildPhrase('it', yo, estar, casa, 'affirm', 'past')).toBe('Io stavo a casa.');
    for (const v of [ser, estar]) expect(v.pastForms.it.join(' '), v.key).not.toMatch(/\bstat[oaie]\b/);
  });

  it('com "yo", nada do que se fala nos destinos abertos (nem na glosa) marca gênero', () => {
    const MARCA = /\b(perdid[oa]s?|nuev[oa]s?|estudiantes?|perdue?s?|nouveau|nouvelle|étudiante?s?|student|lost|new here|pers[oa]|stat[oaie]|novo|nova|estudante)\b/i;
    const falhas: string[] = [];
    for (const lang of ['es', 'en', 'fr', 'pt', 'it'] as LangCode[]) {
      for (const verb of VERBS) {
        for (const comp of [null, ...verb.complements]) {
          for (const m of MOODS) for (const tn of TENSES) {
            const frase = buildPhrase(lang, yo, verb, comp, m, tn);
            if (MARCA.test(frase)) falhas.push(`${lang}/${verb.key}/${comp?.key}: ${frase}`);
          }
        }
      }
    }
    expect(falhas).toEqual([]);
  });
});

// ------------------------------------------------------------ pron-8: él/ella

describe('"él" e "ella" separados (pron-8)', () => {
  const q = V('querer'), nec = V('necesitar'), ser = V('ser');
  const cafe = q.complements[0];
  const medico = nec.complements.find((c) => c.key === 'doctor')!;

  it('nenhuma palavra de pronome falada traz a barra', () => {
    // A glosa portuguesa de "usted" ("o senhor / a senhora") é a única exceção:
    // ela diz à leitora que é tratamento formal, e não é o que se fala.
    for (const p of PRONOUNS) {
      for (const l of SUPPORTED_LANGS) {
        if (l === 'pt' && p.key === 'usted') continue;
        expect(p.words[l], `${p.key}.${l}`).not.toContain('/');
      }
    }
  });

  it('a cuidadora consegue dizer "Ella necesita un médico"', () => {
    expect(buildPhrase('es', P('ella'), nec, medico, 'affirm')).toBe('Ella necesita un médico.');
    expect(buildPhrase('en', P('ella'), nec, medico, 'affirm')).toBe('She needs a doctor.');
    expect(buildPhrase('fr', P('ella'), nec, medico, 'affirm')).toBe("Elle a besoin d'un médecin.");
    expect(buildPhrase('en', P('el'), q, null, 'question')).toBe('Does he want?');
    expect(buildPhrase('en', P('ella'), q, null, 'question')).toBe('Does she want?');
    expect(buildPhrase('es', P('ellas'), q, cafe, 'affirm')).toBe('Ellas quieren un café.');
  });

  it('francês: "que" elide diante de il/elle', () => {
    expect(buildPhrase('fr', P('el'), q, cafe, 'question')).toBe("Est-ce qu'il veut un café ?");
    expect(buildPhrase('fr', P('ella'), q, cafe, 'question')).toBe("Est-ce qu'elle veut un café ?");
    expect(buildPhrase('fr', P('ellas'), q, cafe, 'question')).toBe("Est-ce qu'elles veulent un café ?");
    expect(buildPhrase('fr', P('yo'), q, cafe, 'question')).toBe('Est-ce que je veux un café ?');
    expect(buildPhrase('fr', P('yo'), nec, nec.complements[0], 'question')).toBe("Est-ce que j'ai besoin d'aide ?");
  });

  it('ucraniano: o passado concorda com "вона"', () => {
    expect(buildPhrase('uk', P('ella'), q, cafe, 'affirm', 'past')).toBe('Вона хотіла каву.');
    expect(buildPhrase('uk', P('el'), q, cafe, 'affirm', 'past')).toBe('Він хотів каву.');
    expect(buildPhrase('uk', P('ella'), ser, ser.complements[0], 'affirm', 'past')).toBe('Вона була з Бразилії.');
  });

  it('árabe: verbo e "ليس" no feminino', () => {
    expect(buildPhrase('ar', P('ella'), q, cafe, 'affirm')).toBe('هي تريد قهوة.');
    expect(buildPhrase('ar', P('ellas'), q, cafe, 'negative')).toBe('هن لا يردن قهوة.');
    expect(buildPhrase('ar', P('ella'), ser, ser.complements[0], 'negative')).toBe('هي ليست من البرازيل.');
    expect(buildPhrase('ar', P('ellas'), ser, ser.complements[0], 'negative', 'future')).toBe('هن لن يكنّ من البرازيل.');
  });

  it('lituano: dativo próprio para "ji" e "jos"', () => {
    expect(buildPhrase('lt', P('ella'), nec, medico, 'affirm')).toBe('Jai reikia gydytojo.');
    expect(buildPhrase('lt', P('ellas'), nec, medico, 'affirm')).toBe('Joms reikia gydytojo.');
  });

  it('todo verbo tem o feminino onde a língua concorda', () => {
    for (const v of VERBS) {
      expect(v.fem?.pastForms?.uk, `${v.key} uk passado`).toBeTruthy();
      for (const tabela of ['forms', 'pastForms', 'futureForms'] as const) {
        expect(v.fem?.[tabela]?.ar, `${v.key} ar ${tabela}`).toBeTruthy();
      }
    }
  });

  it('a tabela da tela e a frase usam a mesma forma', () => {
    expect(verbForm(q, P('ella'), 'uk', 'past')).toBe('хотіла');
    expect(verbForm(q, P('el'), 'uk', 'past')).toBe('хотів');
    expect(verbForm(q, P('usted'), 'fr', 'present')).toBe('voulez');
    expect(verbForm(q, P('usted'), 'es', 'present')).toBe('quiere');
  });
});

// ------------------------------------------------------------ varredura enxuta

describe('varredura dos onze pronomes', () => {
  it('nenhuma combinação sai malformada, com barra, ou sem pontuação', () => {
    const falhas: string[] = [];
    for (const lang of SUPPORTED_LANGS) {
      for (const p of PRONOUNS) {
        for (const verb of VERBS) {
          const comps = verb.requiresComplement ? verb.complements : [null, ...verb.complements];
          for (const comp of comps) for (const m of MOODS) for (const tn of TENSES) {
            const f = buildPhrase(lang, p, verb, comp, m, tn);
            const barra = f.includes('/') && !(lang === 'pt' && p.key === 'usted');
            if (/undefined|NaN|\s{2,}|['’]\s/.test(f) || barra || !/[.?!؟]$/.test(f)) {
              falhas.push(`${lang}/${p.key}/${verb.key}/${comp?.key ?? 'SEM'}/${m}/${tn}: "${f}"`);
            }
          }
        }
      }
    }
    expect(falhas.slice(0, 8)).toEqual([]);
  });
});
