import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import HouseCleaningModule from '../modules/HouseCleaningModule';
import {
  TASKS, TASK_GROUPS, TASK_GROUP_LABELS, PLACES, TASK_FRAMES,
  HEARD, SAY_PHRASES, SAY_GROUPS, SAY_GROUP_LABELS, TIP_LABEL,
  buildTaskPhrase,
  placeForm,
} from '../modules/housecleaning/data/houseCleaningData';
import * as dados from '../modules/housecleaning/data/houseCleaningData';
import { SUPPORTED_LANGS, type LangCode } from '../modules/location/data/locationData';
import { translations } from '../translations';
import { COUNTRIES } from '../constants';

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
 *  3. A Parte 7 tranca a tela, pela auditoria de usabilidade de 23/09/2026: abre
 *     em "Voy a limpiar la cocina.", nota de costume espanhol só com destino
 *     Espanha, o aviso de "é para reconhecer" na banda fixa, a tarefa sob "Qual
 *     serviço?" com cômodo e dica logo abaixo dela, e os avisos antes do combinado.
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
    for (const h of HEARD) yield { tag: `${lang}/ouve:${h.key}`, lang, frase: h.text[lang] };
    // A nota entra na varredura: ela é texto que vai para a tela como qualquer outro.
    for (const h of HEARD) if (h.note) yield { tag: `${lang}/nota:${h.key}`, lang, frase: h.note[lang] };
    for (const t of TASKS) if (t.note) yield { tag: `${lang}/nota:${t.key}`, lang, frase: t.note[lang] };
    for (const s of SAY_PHRASES) yield { tag: `${lang}/${s.key}`, lang, frase: s.text[lang] };
  }
};

const TAREFAS = [...todasAsTarefas()];
const FRASES = [...todasAsFrases()];
const TUDO = [...TAREFAS, ...FRASES];

/** Só o que a própria pessoa diz. O modo "A patroa diz" é fala de outra pessoa. */
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
    // 17 e não 16: entrou "Limpar", a frase que quem limpa casa mais diz.
    expect(TASKS).toHaveLength(17);
    expect(PLACES).toHaveLength(7);
    expect(TASK_FRAMES).toHaveLength(4);
    expect(HEARD).toHaveLength(12);
    expect(SAY_PHRASES).toHaveLength(12);
    // 8 idiomas × 17 tarefas × 4 quadros × (1 sem cômodo + 7 cômodos)
    expect(TAREFAS).toHaveLength(8 * 17 * 4 * 8);
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
  // لِ + الـ perde o alif: "للتنظيف", nunca "لالتنظيف". O quadro "não deu tempo"
  // cola لِ, e três tarefas têm masdar com artigo (clean, tidyUp, vacuum).
  invariante('em árabe, لِ colado ao artigo perde o alif', TAREFAS.filter((c) => c.lang === 'ar'), (c) => /(^|\s)لال/.test(c.frase));
});

describe('PARTE 1b — a frase mais dita existe, e abre a tela', () => {
  const going = TASK_FRAMES.find((f) => f.key === 'going')!;
  const done = TASK_FRAMES.find((f) => f.key === 'done')!;
  const need = TASK_FRAMES.find((f) => f.key === 'need')!;
  const noTime = TASK_FRAMES.find((f) => f.key === 'noTime')!;
  const clean = TASKS.find((t) => t.key === 'clean')!;
  const kitchen = PLACES.find((p) => p.key === 'kitchen')!;
  const bath = PLACES.find((p) => p.key === 'bath')!;

  it('"Limpar" é a primeira tarefa, e a cozinha o primeiro cômodo', () => {
    // A tela abre com TASKS[0] e PLACES[0]: a ordem destas tabelas É a primeira
    // frase que a pessoa vê.
    expect(TASKS[0].key).toBe('clean');
    expect(PLACES[0].key).toBe('kitchen');
    expect(TASK_FRAMES[0].key).toBe('going');
    expect(buildTaskPhrase('es', TASK_FRAMES[0], TASKS[0], PLACES[0])).toBe('Voy a limpiar la cocina.');
    expect(buildTaskPhrase('pt', TASK_FRAMES[0], TASKS[0], PLACES[0])).toBe('Vou limpar a cozinha.');
  });

  it('o cômodo é o objeto do verbo, nos quatro quadros', () => {
    expect(buildTaskPhrase('es', done, clean, bath)).toBe('Ya he limpiado el baño.');
    expect(buildTaskPhrase('pt', done, clean, bath)).toBe('Já limpei o banheiro.');
    expect(buildTaskPhrase('es', need, clean, kitchen)).toBe('¿Hace falta limpiar la cocina hoy?');
    expect(buildTaskPhrase('es', noTime, clean, kitchen)).toBe('Hoy no me ha dado tiempo de limpiar la cocina.');
    expect(buildTaskPhrase('en', going, clean, kitchen)).toBe("I'm going to clean the kitchen.");
    expect(buildTaskPhrase('en', done, clean, bath)).toBe("I've already cleaned the bathroom.");
    expect(buildTaskPhrase('fr', going, clean, kitchen)).toBe('Je vais nettoyer la cuisine.');
    expect(buildTaskPhrase('fr', done, clean, bath)).toBe("J'ai déjà nettoyé la salle de bain.");
    expect(buildTaskPhrase('it', going, clean, kitchen)).toBe('Sto per pulire la cucina.');
    // Sem cômodo, a frase continua inteira.
    expect(buildTaskPhrase('es', going, clean, null)).toBe('Voy a limpiar.');
  });

  it('o árabe junta لِ e الـ do jeito certo', () => {
    expect(buildTaskPhrase('ar', noTime, clean, kitchen)).toBe('لم يتسع الوقت اليوم للتنظيف في المطبخ.');
    expect(buildTaskPhrase('ar', going, clean, kitchen)).toBe('سأقوم بالتنظيف في المطبخ.');
    const tidy = TASKS.find((t) => t.key === 'tidyUp')!;
    expect(buildTaskPhrase('ar', noTime, tidy, null)).toBe('لم يتسع الوقت اليوم للترتيب.');
  });

  it('"Limpar" não repete o rótulo de "Arrumar" em ucraniano', () => {
    const tidy = TASKS.find((t) => t.key === 'tidyUp')!;
    const rotulos = TASKS.map((t) => t.labels.uk);
    expect(new Set(rotulos).size).toBe(rotulos.length);
    expect(clean.labels.uk).not.toBe(tidy.labels.uk);
  });
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

  it('cada tarefa prende o cômodo do jeito que ela rege', () => {
    /**
     * As duas que estavam erradas, e o motivo de este teste existir. Com um
     * fragmento único para tudo saíam "Voy a pasar la aspiradora del salón"
     * (= o aspirador DO salão) e "Voy a ordenar del salón" (agramatical).
     * A versão anterior deste arquivo só conferia `mopFloor`, que por acaso é o
     * caso que funcionava — por isso passou.
     */
    const going = TASK_FRAMES.find((f) => f.key === 'going')!;
    const living = PLACES.find((p) => p.key === 'living')!;
    const vacuum = TASKS.find((t) => t.key === 'vacuum')!;
    const tidy = TASKS.find((t) => t.key === 'tidyUp')!;

    expect(buildTaskPhrase('es', going, vacuum, living)).toBe('Voy a pasar la aspiradora por el salón.');
    expect(buildTaskPhrase('pt', going, vacuum, living)).toBe('Vou passar o aspirador na sala.');
    expect(buildTaskPhrase('fr', going, vacuum, living)).toBe("Je vais passer l'aspirateur dans le salon.");
    expect(buildTaskPhrase('it', going, vacuum, living)).toBe("Sto per passare l'aspirapolvere in soggiorno.");

    expect(buildTaskPhrase('es', going, tidy, living)).toBe('Voy a ordenar el salón.');
    expect(buildTaskPhrase('pt', going, tidy, living)).toBe('Vou arrumar a sala.');
    expect(buildTaskPhrase('fr', going, tidy, living)).toBe('Je vais ranger le salon.');
    expect(buildTaskPhrase('it', going, tidy, living)).toBe('Sto per mettere in ordine il soggiorno.');

    // E o "já está feito" tem de aceitar o cômodo igualmente.
    const done = TASK_FRAMES.find((f) => f.key === 'done')!;
    expect(buildTaskPhrase('es', done, tidy, living)).toBe('Ya he ordenado el salón.');
    expect(buildTaskPhrase('es', done, tidy, null)).toBe('Ya he ordenado.');
  });

  /**
   * A regra geral por trás das asserções acima: infinitivo colado a preposição
   * quer dizer que o objeto sumiu no caminho. Vale para es e pt; o italiano fica
   * de fora porque "mettere in ordine" é exatamente isso e é correto.
   */
  invariante(
    'nenhum infinitivo colado a preposição em es',
    TAREFAS.filter((c) => c.lang === 'es'),
    (c) => /\b(fregar|pasar|quitar|limpiar|ordenar|hacer|cambiar|sacar|poner|tender|planchar)\s+(de|del|por|en)\b/.test(c.frase),
  );

  invariante(
    'nenhum infinitivo colado a preposição em pt',
    TAREFAS.filter((c) => c.lang === 'pt'),
    (c) => /\b(passar|tirar|limpar|arrumar|trocar|lavar|levar|botar|estender)\s+(de|da|do|na|no|em)\b/.test(c.frase),
  );

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

describe('PARTE 4 — o que a patroa diz é fala de outra pessoa', () => {
  it('as frases ouvidas estão em tú, e as ditas em usted', () => {
    /**
     * A assimetria de registro é o achado do módulo: quem limpa trata a patroa de
     * `usted`; a patroa trata quem limpa de `tú`. Se alguém uniformizar os dois
     * lados, o módulo passa a ensinar um registro que ninguém usa.
     */
    const ouvidoEmTu = HEARD.filter((h) => /\b(deja|ten|no uses|puedes|termines|subas)\b/i.test(h.text.es));
    expect(ouvidoEmTu.length).toBeGreaterThanOrEqual(5);

    const ditoEmUsted = SAY_PHRASES.filter((s) => /\b(le|deja|guarda|parece)\b/i.test(s.text.es));
    expect(ditoEmUsted.length).toBeGreaterThanOrEqual(3);

    // E nada de `vosotros` em lado nenhum: a patroa é uma pessoa, não um balcão.
    for (const s of SAY_PHRASES) expect(s.text.es, s.key).not.toMatch(/\b(vosotros|vosotras)\b|\w+(áis|éis)\b/);
    for (const h of HEARD) expect(h.text.es, h.key).not.toMatch(/\b(vosotros|vosotras)\b|\w+(áis|éis)\b/);
  });

  it('a glosa árabe do que se ouve não é imperativo', () => {
    // O imperativo árabe concorda com o gênero de quem ouve, e a glosa não pode
    // supor o gênero de quem lê. Mesma lição do módulo irmão.
    for (const h of HEARD) {
      expect(h.text.ar, h.key).not.toMatch(/^(اتركي|انتبهي|أغلقي|استعملي|خذي)/);
    }
  });

  it('a nota de costume existe nos oito idiomas, e diz do lado espanhol', () => {
    /**
     * A nota descreve o que se faz NA ESPANHA, na língua de quem lê. Nunca o que
     * se faz no país dela: eu posso conferir que aqui a roupa vai no tendedero,
     * não posso afirmar como se seca roupa em Vílnius. Aqui o teste garante o que
     * dá para garantir por máquina — que a nota está completa e que não sobrou
     * ninguém sem ela onde ela foi prometida.
     */
    const comNota = HEARD.filter((h) => h.note).map((h) => h.key);
    expect(comNota).toEqual(['trastero', 'fridge', 'blind']);
    for (const h of HEARD) {
      if (!h.note) continue;
      for (const lang of SUPPORTED_LANGS) expect(h.note[lang], `${h.key}/${lang}`).toBeTruthy();
    }
    // E a tarefa mais carregada de costume do módulo também tem a sua.
    expect(TASKS.find((t) => t.key === 'hang')?.note).toBeTruthy();
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
        for (const mode of ['of', 'in', 'obj'] as const) {
          expect(placeForm(p, lang, mode), `${p.key}/${lang}/${mode}`).toBeTruthy();
        }
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
      for (const lang of SUPPORTED_LANGS) {
        for (const mode of ['of', 'in', 'obj'] as const) {
          const f = placeForm(p, lang, mode);
          expect(f, `${p.key}/${lang}/${mode}`).toBe(f.trim());
        }
      }
    }
  });

  it('o rótulo da dica existe nos oito idiomas', () => {
    for (const lang of SUPPORTED_LANGS) expect(TIP_LABEL[lang], lang).toBeTruthy();
  });

  it('a nota do "fregar el suelo" parte da palavra que está na frase', () => {
    // Antes começava por "fregona", e a pessoa procurava "fregona" na frase
    // ("Voy a fregar el suelo") sem achar.
    const mop = TASKS.find((t) => t.key === 'mopFloor')!;
    for (const lang of SUPPORTED_LANGS) expect(mop.note![lang], lang).toMatch(/fregar el suelo/i);
    expect(mop.note!.pt).toMatch(/^"Fregar el suelo"/);
  });

  it('os avisos vêm antes do combinado', () => {
    // "Vou chegar mais tarde" é aperto de todo dia; horas e pagamento se combinam
    // uma vez. Com os avisos por último, o bloco começava no pé da tela.
    expect(SAY_GROUPS).toEqual(['warn', 'deal']);
    expect(SAY_GROUP_LABELS.deal.pt).toBe('Combinar o trabalho');
  });
});

// ---------------------------------------------------------------------- tela

const t = (k: string) => (translations['pt-BR'] as Record<string, string>)[k] || k;
const BR = COUNTRIES.find((c) => c.code === 'br')!;
const ES = COUNTRIES.find((c) => c.code === 'es')!;
const US = COUNTRIES.find((c) => c.code === 'us')!;
const FR = COUNTRIES.find((c) => c.code === 'fr')!;
const tema = { color: 'bg-lime-800', textColor: 'text-lime-800', hex: '#3f6212', borderColor: 'border-lime-800' };

const montar = (targetCountry = ES) => {
  const handlePlayAudio = vi.fn();
  const r = render(createElement(HouseCleaningModule, {
    nativeCountry: BR,
    targetCountry,
    t,
    theme: tema,
    onGoHome: () => {},
    onOpenLanguageModal: () => {},
    onOpenShare: () => {},
    handlePlayAudio,
  }));
  return { ...r, handlePlayAudio };
};

/** O botão que contém este texto. */
const botaoCom = (texto: string) =>
  screen.getAllByText(texto).map((e) => e.closest('button')).find(Boolean) as HTMLButtonElement;

const aba = (chave: string) => screen.getByRole('tab', { name: t(chave) });

/** `a` vem antes de `b` na ordem do documento. */
const antes = (a: Element, b: Element) =>
  Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

const ler = (f: string) => readFileSync(join(__dirname, '..', f), 'utf8');

const nota = (key: string) => TASKS.find((x) => x.key === key)!.note!.pt;

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
  it('abre dizendo "Voy a limpiar la cocina.", com os três botões que a formam acesos', () => {
    montar();
    expect(screen.getByText('Voy a limpiar la cocina.')).toBeTruthy();
    expect(screen.getByText('Vou limpar a cozinha.')).toBeTruthy();
    expect(botaoCom('Vou…').getAttribute('aria-pressed')).toBe('true');
    expect(botaoCom('Limpar').getAttribute('aria-pressed')).toBe('true');
    expect(botaoCom('A cozinha').getAttribute('aria-pressed')).toBe('true');
  });

  it('diz para que serve, e pergunta pelo serviço antes do cômodo', () => {
    montar();
    expect(screen.getByText(t('hintHouseCleaning'))).toBeTruthy();
    const servico = screen.getByRole('heading', { name: t('hcWhatTask') });
    const comodo = screen.getByRole('heading', { name: t('hcWhere') });
    expect(antes(servico, comodo)).toBe(true);
    // E o cômodo mora logo abaixo das tarefas de "Pela casa", antes do grupo seguinte.
    expect(antes(botaoCom('Limpar'), comodo)).toBe(true);
    expect(antes(comodo, screen.getByText(TASK_GROUP_LABELS.beds.pt))).toBe(true);
  });

  it('um toque na cozinha escolhida desfaz a escolha', () => {
    montar();
    fireEvent.click(botaoCom('A cozinha'));
    expect(screen.getByText('Voy a limpiar.')).toBeTruthy();
  });

  it('o cômodo some para a tarefa que não o aceita, e a escolha volta com ela', () => {
    montar();
    fireEvent.click(botaoCom('Levar o lixo'));
    expect(screen.queryByRole('heading', { name: t('hcWhere') })).toBeNull();
    expect(screen.getByText('Voy a sacar la basura.')).toBeTruthy();
    fireEvent.click(botaoCom('Limpar'));
    expect(screen.getByText('Voy a limpiar la cocina.')).toBeTruthy();
  });

  it('na Espanha, a dica aparece com rótulo, logo abaixo do grupo da tarefa tocada', () => {
    montar(ES);
    fireEvent.click(botaoCom('Lavar a louça'));
    const dica = screen.getByText(nota('dishes'));
    expect(dica.closest('p')!.textContent).toMatch(/^Dica: /);
    expect(antes(botaoCom('Lavar a louça'), dica)).toBe(true);
    expect(antes(dica, screen.getByText(TASK_GROUP_LABELS.bath.pt))).toBe(true);
    // Nenhuma dica solta no topo, antes das escolhas.
    expect(antes(screen.getByRole('heading', { name: t('hcHowToSay') }), dica)).toBe(true);
  });

  it('fora da Espanha, nenhuma nota explica palavra espanhola que não está na tela', () => {
    for (const pais of [US, FR]) {
      montar(pais);
      fireEvent.click(botaoCom('Passar pano no chão'));
      expect(screen.queryByText(nota('mopFloor')), pais.code).toBeNull();
      expect(screen.queryByText(/fregona/i), pais.code).toBeNull();

      fireEvent.click(aba('hcModeHeard'));
      expect(screen.getByText(t('hcHeardNote'))).toBeTruthy();
      expect(screen.queryByText(t('hcHeardNoteSpain')), pais.code).toBeNull();
      for (const h of HEARD) if (h.note) expect(screen.queryByText(h.note.pt), `${pais.code}/${h.key}`).toBeNull();
      cleanup();
    }
  });

  it('"A patroa diz": o aviso fica na banda fixa, e o tú/usted só na Espanha', () => {
    montar(ES);
    fireEvent.click(aba('hcModeHeard'));
    const aviso = screen.getByText(t('hcHeardNote'));
    // Fora do painel que rola: na rolagem ele sumia ao descer.
    expect(aviso.closest('[role="tabpanel"]')).toBeNull();
    expect(screen.getByText(t('hcHeardNoteSpain'))).toBeTruthy();
    // As notas de costume continuam na Espanha.
    for (const h of HEARD) if (h.note) expect(screen.getByText(h.note.pt), h.key).toBeTruthy();
    // A dica do módulo ("a frase é para a patroa") contradiria o aviso aqui.
    expect(screen.queryByText(t('hintHouseCleaning'))).toBeNull();
  });

  it('a linha de gesto só aparece na aba que monta frase', () => {
    // Ela diz "toque aqui embaixo e a frase lá em cima muda". Em "A patroa diz" e
    // em "Combinar" a banda não tem frase: tocar e ver nada mudar parece travado.
    montar();
    expect(screen.getByText(t('gestureHint'))).toBeTruthy();
    fireEvent.click(aba('hcModeHeard'));
    expect(screen.queryByText(t('gestureHint'))).toBeNull();
    fireEvent.click(aba('hcModeSay'));
    expect(screen.queryByText(t('gestureHint'))).toBeNull();
    fireEvent.click(aba('hcModeTask'));
    expect(screen.getByText(t('gestureHint'))).toBeTruthy();
  });

  it('"Combinar" começa pelos avisos', () => {
    montar();
    fireEvent.click(aba('hcModeSay'));
    const avisar = screen.getByText(SAY_GROUP_LABELS.warn.pt);
    const combinar = screen.getByText(SAY_GROUP_LABELS.deal.pt);
    expect(antes(avisar, combinar)).toBe(true);
  });

  it('nenhuma letra abaixo de 14px, e o português nunca apagado', () => {
    const fonte = ler('modules/HouseCleaningModule.tsx');
    expect(fonte).not.toMatch(/text-\[(9|10|11|12|13)px\]/);
    expect(fonte).not.toMatch(/\btext-xs\b/);
    expect(fonte).not.toMatch(/opacity-70/);
    expect(fonte).not.toMatch(/text-gray-(300|400|500)\b/);
  });

  it('toda chave que a tela usa existe nos oito idiomas', () => {
    const fonte = ler('modules/HouseCleaningModule.tsx');
    const usadas = [...new Set([...fonte.matchAll(/\bt\('([A-Za-z0-9_]+)'\)/g)].map((m) => m[1]))];
    expect(usadas).toEqual(expect.arrayContaining(['hintHouseCleaning', 'hcWhatTask', 'hcHeardNoteSpain']));
    const blocos = ['en-US', 'pt-BR', 'es-ES', 'fr-FR', 'it-IT', 'uk-UA', 'ar-MA', 'lt-LT'];
    const faltando = blocos.flatMap((b) => usadas.filter((k) => !(translations[b] as Record<string, string>)[k]).map((k) => `${b}/${k}`));
    expect(faltando).toEqual([]);
  });
});
