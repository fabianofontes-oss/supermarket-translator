import { describe, it, expect } from 'vitest';
import {
  TASKS, TASK_GROUPS, TASK_GROUP_LABELS, PLACES, TASK_FRAMES,
  HEARD, SAY_PHRASES, SAY_GROUPS, SAY_GROUP_LABELS,
  buildTaskPhrase,
} from '../modules/housecleaning/data/houseCleaningData';
import * as dados from '../modules/housecleaning/data/houseCleaningData';
import { SUPPORTED_LANGS, type LangCode } from '../modules/location/data/locationData';

/**
 * Módulo Limpeza da casa.
 *
 * O irmão, Cuidar de idosos, flexiona por tratamento e por gênero porque o objeto
 * da frase é uma pessoa. Aqui o objeto é o chão, e não há eixo nenhum — então o
 * peso deste arquivo está em outro lugar:
 *
 *  1. A Parte 3 tranca a regra central: quem fala é sempre a própria pessoa, em 1ª
 *     pessoa, e o app não sabe o gênero dela. Nenhum predicativo pode concordar com
 *     quem fala ("vou chegar atrasada", "je suis désolée", "я не змогла").
 *  2. A Parte 5 tranca a fronteira com o catálogo: este módulo não pode virar uma
 *     segunda lista dos 96 produtos de `supermarket/data/cleaningData.ts`.
 */

/** Bloco árabe. Nenhuma outra língua pode conter isto (AGENTS.md 8.5). */
const ARABE = /[؀-ۿ]/;

type Caso = { tag: string; lang: LangCode; frase: string };

const todasAsTarefas = function* (): Generator<Caso> {
  for (const lang of SUPPORTED_LANGS)
    for (const task of TASKS)
      for (const frame of TASK_FRAMES) {
        yield { tag: `${lang}/${task.key}/${frame.key}/SEM`, lang, frase: buildTaskPhrase(lang, frame, task, null) };
        for (const place of PLACES)
          yield {
            tag: `${lang}/${task.key}/${frame.key}/${place.key}`,
            lang,
            frase: buildTaskPhrase(lang, frame, task, place),
          };
      }
};

const todasAsFrases = function* (): Generator<Caso> {
  for (const lang of SUPPORTED_LANGS) {
    for (const [i, h] of HEARD.entries()) yield { tag: `${lang}/ouve${i}`, lang, frase: h[lang] };
    for (const s of SAY_PHRASES) yield { tag: `${lang}/${s.key}`, lang, frase: s.text[lang] };
  }
};

const TAREFAS = [...todasAsTarefas()];
const FRASES = [...todasAsFrases()];
const TUDO = [...TAREFAS, ...FRASES];

/** Só o que a própria pessoa diz. O modo "o que ela pede" é fala de outra pessoa. */
const EU_FALO = [
  ...TAREFAS,
  ...SUPPORTED_LANGS.flatMap((lang) => SAY_PHRASES.map((s) => ({ tag: `${lang}/${s.key}`, lang, frase: s.text[lang] }))),
];

const invariante = (nome: string, casos: Caso[], quebrou: (c: Caso) => boolean) =>
  it(nome, () => {
    const falhas = casos.filter(quebrou).map((c) => `${c.tag}: "${c.frase}"`);
    expect(falhas.slice(0, 8)).toEqual([]);
  });

// ---------------------------------------------------------------------------

describe('PARTE 1 — varredura de invariantes', () => {
  it('cobre o que a interface consegue produzir', () => {
    expect(TASKS).toHaveLength(16);
    expect(PLACES).toHaveLength(7);
    expect(TASK_FRAMES).toHaveLength(4);
    expect(HEARD).toHaveLength(12);
    expect(SAY_PHRASES).toHaveLength(12);
    // 8 idiomas × 16 tarefas × 4 quadros × (1 sem cômodo + 7 cômodos)
    expect(TAREFAS).toHaveLength(8 * 16 * 4 * 8);
  });

  invariante('sem buraco de dado', TUDO, (c) => !c.frase || /undefined|null|\[object/.test(c.frase));
  invariante('sem marcador por substituir', TUDO, (c) => c.frase.includes('{'));
  invariante('sem espaço duplo', TUDO, (c) => / {2}/.test(c.frase));
  invariante('sem espaço na ponta', TUDO, (c) => c.frase !== c.frase.trim());
  invariante('termina em pontuação', TUDO, (c) => !/[.?!؟]$/.test(c.frase));
  invariante('começa em maiúscula', TAREFAS.filter((c) => !['uk', 'ar'].includes(c.lang)), (c) => {
    const primeira = c.frase.replace(/^[¿¡]/, '').charAt(0);
    return primeira !== primeira.toUpperCase();
  });
  invariante('nenhum idioma cai no ramo árabe', TUDO, (c) => c.lang !== 'ar' && ARABE.test(c.frase));
  invariante('o árabe sai em árabe', TUDO.filter((c) => c.lang === 'ar'), (c) => !ARABE.test(c.frase));
});

describe('PARTE 2 — o cômodo entra só onde cabe', () => {
  it('tarefa que não aceita cômodo ignora a escolha', () => {
    // A seção some da tela, e o builder também filtra — como `optionsFor` na
    // Maquiagem. Escolher o quarto e depois "sacar la basura" não pode produzir
    // "sacar la basura del dormitorio".
    const bins = TASKS.find((t) => t.key === 'bins')!;
    const going = TASK_FRAMES.find((f) => f.key === 'going')!;
    for (const place of PLACES) {
      expect(buildTaskPhrase('es', going, bins, place)).toBe('Voy a sacar la basura.');
    }
  });

  it('tarefa que aceita cômodo o encaixa com a preposição pronta', () => {
    const mop = TASKS.find((t) => t.key === 'mopFloor')!;
    const going = TASK_FRAMES.find((f) => f.key === 'going')!;
    const kitchen = PLACES.find((p) => p.key === 'kitchen')!;
    const living = PLACES.find((p) => p.key === 'living')!;
    expect(buildTaskPhrase('es', going, mop, kitchen)).toBe('Voy a fregar el suelo de la cocina.');
    // Contração escrita à mão: "de el salón" não existe.
    expect(buildTaskPhrase('es', going, mop, living)).toBe('Voy a fregar el suelo del salón.');
    expect(buildTaskPhrase('pt', going, mop, living)).toBe('Vou passar pano no chão da sala.');
    // Em uk e lt o cômodo é adjunto de lugar, não complemento de nome.
    expect(buildTaskPhrase('uk', going, mop, kitchen)).toBe('Зараз буду мити підлогу на кухні.');
    expect(buildTaskPhrase('lt', going, mop, kitchen)).toBe('Ketinu plauti grindis virtuvėje.');
  });

  it('o quadro "já está feito" usa a outra forma, e ela não é derivável', () => {
    const mop = TASKS.find((t) => t.key === 'mopFloor')!;
    const done = TASK_FRAMES.find((f) => f.key === 'done')!;
    expect(buildTaskPhrase('es', done, mop, null)).toBe('Ya he fregado el suelo.');
    // "підлогу вже помито" e "grindys jau išplautos" não saem de "мити підлогу"
    // por regra nenhuma: são impessoal e particípio passivo, e por isso existe `done`.
    expect(buildTaskPhrase('uk', done, mop, null)).toBe('Підлогу вже помито.');
    expect(buildTaskPhrase('lt', done, mop, null)).toBe('Grindys jau išplautos.');
  });

  it('três dos quatro quadros vivem do infinitivo', () => {
    // É o que fez a tabela caber em duas formas por tarefa em vez de quatro.
    expect(TASK_FRAMES.filter((f) => f.use === 'inf').map((f) => f.key)).toEqual(['going', 'need', 'noTime']);
    expect(TASK_FRAMES.filter((f) => f.use === 'done').map((f) => f.key)).toEqual(['done']);
  });
});

describe('PARTE 3 — quem fala não se descreve', () => {
  /**
   * Toda frase deste módulo é dita pela própria pessoa, e o app não sabe o gênero
   * dela — nem deveria perguntar. Um predicativo concordado aqui erraria metade das
   * vezes, e ao contrário do módulo irmão não há seletor para consertar.
   */
  invariante(
    'nenhum predicativo de 1ª pessoa em es/pt',
    EU_FALO.filter((c) => c.lang === 'es' || c.lang === 'pt'),
    (c) => /\b(atrasad|cansad|sozinh|sol[ao]|segur|pront|ocupad|preocupad)[ao]s?\b/i.test(c.frase),
  );

  invariante(
    'nenhum particípio nem adjetivo concordado em fr',
    EU_FALO.filter((c) => c.lang === 'fr'),
    (c) => /\bje suis\s+\w+(ée?|e)\b/i.test(c.frase) || /\bdésolée?\b/i.test(c.frase),
  );

  invariante(
    'nenhum particípio concordado em it',
    EU_FALO.filter((c) => c.lang === 'it'),
    (c) => /\bsono\s+(riuscit|andat|stat|arrivat)[ao]\b/i.test(c.frase),
  );

  invariante(
    'nenhum passado de 1ª pessoa em uk',
    EU_FALO.filter((c) => c.lang === 'uk'),
    // "я не змогла" / "я закінчила" denunciariam o gênero. As saídas são o
    // impessoal em -но/-то e o presente/futuro, que não flexionam.
    (c) => /\bя\s+\w*(ла|ів|ов|в)\b/.test(c.frase),
  );

  invariante(
    'nenhum feminino de 1ª pessoa em ar',
    EU_FALO.filter((c) => c.lang === 'ar'),
    (c) => /آسفة|متأكدة|مشغولة/.test(c.frase),
  );

  it('o "já está feito" é impessoal ou passivo, nunca "eu fiz"', () => {
    // O ponto mais fácil de estragar do arquivo: basta alguém "melhorar" o
    // ucraniano para "я помила" e o app passa a supor o gênero de quem trabalha.
    for (const task of TASKS) {
      expect(task.done.uk, `${task.key}`).not.toMatch(/\bя\b/);
      expect(task.done.lt, `${task.key}`).not.toMatch(/\baš\b/i);
    }
  });
});

describe('PARTE 4 — o que ela pede é fala de outra pessoa', () => {
  it('as frases ouvidas estão em tú, e as ditas em usted', () => {
    /**
     * A assimetria de registro é o achado do módulo: quem limpa trata a patroa de
     * `usted`; a patroa trata quem limpa de `tú`. Se alguém uniformizar os dois
     * lados, o módulo passa a ensinar um registro que ninguém usa.
     */
    const ouvidoEmTu = HEARD.filter((h) => /\b(deja|ten|no uses|puedes|termines|subas)\b/i.test(h.es));
    expect(ouvidoEmTu.length).toBeGreaterThanOrEqual(5);

    const ditoEmUsted = SAY_PHRASES.filter((s) => /\b(le|deja|guarda|parece)\b/i.test(s.text.es));
    expect(ditoEmUsted.length).toBeGreaterThanOrEqual(3);

    // E nada de `vosotros` em lado nenhum: a patroa é uma pessoa, não um balcão.
    for (const s of SAY_PHRASES) expect(s.text.es, s.key).not.toMatch(/\b(vosotros|vosotras)\b|\w+(áis|éis)\b/);
    for (const h of HEARD) expect(h.es).not.toMatch(/\b(vosotros|vosotras)\b|\w+(áis|éis)\b/);
  });

  it('a glosa árabe do que se ouve não é imperativo', () => {
    // O imperativo árabe concorda com o gênero de quem ouve, e a glosa não pode
    // supor o gênero de quem lê. Mesma lição do módulo irmão.
    for (const [i, h] of HEARD.entries()) {
      expect(h.ar, `ouve${i}`).not.toMatch(/^(اتركي|انتبهي|أغلقي|استعملي|خذي)/);
    }
  });
});

describe('PARTE 5 — a fronteira com o catálogo', () => {
  it('não existe lista de objetos para navegar', () => {
    /**
     * O supermercado já é dono de 96 produtos de limpeza, com fonética. Este módulo
     * é o TRABALHO, não a compra. Objeto só aparece dentro da frase de uma tarefa,
     * nunca como verbete — e é essa ausência que impede a duplicação de voltar.
     * Se um dia surgir uma tabela de objetos aqui, este teste tem de falhar antes.
     */
    expect(Object.keys(dados).filter((k) => /TOOLS|PRODUCTS|ITEMS|OBJECTS/i.test(k))).toEqual([]);
  });

  it('toda tarefa começa por verbo, e não por artigo', () => {
    /**
     * É o que separa uma AÇÃO de um item de prateleira: "fregar el suelo" contra
     * "la fregona". Medir o número de palavras não serviria — "ordenar" e
     * "spolverare" são verbos de uma palavra só, e passariam a ser acusados.
     */
    const ARTIGO = /^(el|la|los|las|un|una|unos|unas|o|a|os|as|um|uma|the|le|il|lo|i|gli)\s/i;
    for (const task of TASKS) {
      for (const lang of ['es', 'pt', 'en', 'fr', 'it'] as const) {
        expect(ARTIGO.test(task.inf[lang]), `${task.key}/${lang}: "${task.inf[lang]}"`).toBe(false);
      }
    }
  });
});

describe('PARTE 6 — integridade das tabelas', () => {
  it('nenhuma chave repetida', () => {
    const listas: [string, { key: string }[]][] = [
      ['TASKS', TASKS], ['PLACES', PLACES], ['TASK_FRAMES', TASK_FRAMES], ['SAY_PHRASES', SAY_PHRASES],
    ];
    for (const [nome, lista] of listas) {
      const chaves = lista.map((x) => x.key);
      expect(new Set(chaves).size, `${nome} tem chave repetida`).toBe(chaves.length);
    }
  });

  it('todo texto existe nos oito idiomas', () => {
    for (const lang of SUPPORTED_LANGS) {
      for (const t of TASKS) {
        expect(t.labels[lang], `${t.key}/${lang}`).toBeTruthy();
        expect(t.inf[lang], `${t.key}/${lang}`).toBeTruthy();
        expect(t.done[lang], `${t.key}/${lang}`).toBeTruthy();
        if (t.note) expect(t.note[lang], `${t.key} nota/${lang}`).toBeTruthy();
      }
      for (const p of PLACES) {
        expect(p.labels[lang], `${p.key}/${lang}`).toBeTruthy();
        expect(p.where[lang], `${p.key}/${lang}`).toBeTruthy();
      }
      for (const f of TASK_FRAMES) {
        expect(f.labels[lang], `${f.key}/${lang}`).toBeTruthy();
        expect(f.templates[lang], `${f.key}/${lang}`).toContain('{t}');
      }
      for (const g of TASK_GROUPS) expect(TASK_GROUP_LABELS[g][lang], `${g}/${lang}`).toBeTruthy();
      for (const g of SAY_GROUPS) expect(SAY_GROUP_LABELS[g][lang], `${g}/${lang}`).toBeTruthy();
    }
  });

  it('nenhum grupo fica vazio, e nenhum item fica fora da tela', () => {
    for (const t of TASKS) expect(TASK_GROUPS, t.key).toContain(t.group);
    for (const s of SAY_PHRASES) expect(SAY_GROUPS, s.key).toContain(s.group);
    for (const g of TASK_GROUPS) expect(TASKS.some((t) => t.group === g), `grupo vazio: ${g}`).toBe(true);
    for (const g of SAY_GROUPS) expect(SAY_PHRASES.some((s) => s.group === g), `grupo vazio: ${g}`).toBe(true);
  });

  it('o fragmento de cômodo não traz espaço na ponta', () => {
    for (const p of PLACES) {
      for (const lang of SUPPORTED_LANGS) expect(p.where[lang]).toBe(p.where[lang].trim());
    }
  });
});
