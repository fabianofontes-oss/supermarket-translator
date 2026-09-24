import { describe, it, expect } from 'vitest';
import {
  CARE_ACTIONS, REPORT_EVENTS, WHEN_TAGS, CARE_TOOLS, TOOL_FRAMES, EMERGENCY, EMERGENCY_NUMBER,
  CARE_GROUPS, REPORT_GROUPS, TOOL_GROUPS,
  CARE_GROUP_LABELS, REPORT_GROUP_LABELS, TOOL_GROUP_LABELS,
  buildCareLine, buildReport, buildToolPhrase, say,
  type Gender, type Treat,
} from '../modules/eldercare/data/elderCareData';
import { SUPPORTED_LANGS, type LangCode } from '../modules/location/data/locationData';

/**
 * Módulo Cuidar de idosos.
 *
 * Mesma varredura de `makeup.test.ts`, com dois pesos que aquele arquivo não tinha:
 *
 *  1. O módulo tem DOIS eixos de flexão (tratamento e gênero), e a regra do projeto
 *     é que eles nunca se multipliquem. A Parte 3 tranca isso no dado: quem escrever
 *     um adjetivo concordado no lado "falar com ela" não passa daqui.
 *  2. A Parte 6 varre nome de medicamento e dose. É o único teste deste arquivo cuja
 *     falha não é bug: é motivo para não publicar.
 */

/** Bloco árabe. Nenhuma outra língua pode conter isto (AGENTS.md 8.5). */
const ARABE = /[؀-ۿ]/;

const TREATS: Treat[] = ['usted', 'tu'];
const GENDERS: Gender[] = ['f', 'm'];

type Caso = { tag: string; lang: LangCode; frase: string };

const todasAsFalas = function* (): Generator<Caso> {
  for (const lang of SUPPORTED_LANGS)
    for (const a of CARE_ACTIONS)
      for (const treat of TREATS)
        yield { tag: `${lang}/${a.key}/${treat}`, lang, frase: buildCareLine(lang, a, treat) };
};

const todosOsRelatos = function* (): Generator<Caso> {
  for (const lang of SUPPORTED_LANGS)
    for (const e of REPORT_EVENTS)
      for (const g of GENDERS)
        for (const when of [null, ...WHEN_TAGS])
          yield {
            tag: `${lang}/${e.key}/${g}/${when?.key ?? 'SEM'}`,
            lang,
            frase: buildReport(lang, e, when, g),
          };
};

const todosOsObjetos = function* (): Generator<Caso> {
  for (const lang of SUPPORTED_LANGS)
    for (const tool of CARE_TOOLS)
      for (const frame of TOOL_FRAMES)
        yield { tag: `${lang}/${tool.key}/${frame.key}`, lang, frase: buildToolPhrase(lang, frame, tool) };
};

const todasAsEmergencias = function* (): Generator<Caso> {
  for (const lang of SUPPORTED_LANGS)
    for (const [i, e] of EMERGENCY.entries())
      yield { tag: `${lang}/emergencia${i}`, lang, frase: e[lang] };
};

const FALAS = [...todasAsFalas()];
const RELATOS = [...todosOsRelatos()];
const OBJETOS = [...todosOsObjetos()];
const URGENCIAS = [...todasAsEmergencias()];
const TUDO = [...FALAS, ...RELATOS, ...OBJETOS, ...URGENCIAS];

const invariante = (nome: string, casos: Caso[], quebrou: (c: Caso) => boolean) =>
  it(nome, () => {
    const falhas = casos.filter(quebrou).map((c) => `${c.tag}: "${c.frase}"`);
    expect(falhas.slice(0, 8)).toEqual([]);
  });

/** Toda string de conteúdo do módulo, venha de onde vier. Base da Parte 6. */
const TODAS_AS_STRINGS: { onde: string; texto: string }[] = (() => {
  const out: { onde: string; texto: string }[] = [];
  const push = (onde: string, v: unknown) => {
    if (typeof v === 'string') out.push({ onde, texto: v });
    else if (v && typeof v === 'object') for (const [k, sub] of Object.entries(v)) push(`${onde}.${k}`, sub);
  };
  push('CARE_ACTIONS', CARE_ACTIONS);
  push('REPORT_EVENTS', REPORT_EVENTS);
  push('WHEN_TAGS', WHEN_TAGS);
  push('CARE_TOOLS', CARE_TOOLS);
  push('TOOL_FRAMES', TOOL_FRAMES);
  push('EMERGENCY', EMERGENCY);
  push('CARE_GROUP_LABELS', CARE_GROUP_LABELS);
  push('REPORT_GROUP_LABELS', REPORT_GROUP_LABELS);
  push('TOOL_GROUP_LABELS', TOOL_GROUP_LABELS);
  return out;
})();

// ---------------------------------------------------------------------------

describe('PARTE 1 — varredura de invariantes', () => {
  it('cobre o que a interface consegue produzir', () => {
    expect(CARE_ACTIONS).toHaveLength(17);
    expect(REPORT_EVENTS).toHaveLength(12);
    expect(WHEN_TAGS).toHaveLength(5);
    expect(CARE_TOOLS).toHaveLength(14);
    expect(TOOL_FRAMES).toHaveLength(4);
    expect(EMERGENCY).toHaveLength(6);
    // 8 idiomas × (17 falas × 2 tratamentos) e por aí.
    expect(FALAS).toHaveLength(8 * 17 * 2);
    expect(RELATOS).toHaveLength(8 * 12 * 2 * 6);
    expect(OBJETOS).toHaveLength(8 * 14 * 4);
  });

  invariante('sem buraco de dado', TUDO, (c) => !c.frase || /undefined|null|\[object/.test(c.frase));
  invariante('sem marcador por substituir', TUDO, (c) => c.frase.includes('{'));
  invariante('sem espaço duplo', TUDO, (c) => / {2}/.test(c.frase));
  invariante('sem espaço na ponta', TUDO, (c) => c.frase !== c.frase.trim());
  invariante('termina em pontuação', TUDO, (c) => !/[.?!؟]$/.test(c.frase));
  invariante('nenhum idioma cai no ramo árabe', TUDO, (c) => c.lang !== 'ar' && ARABE.test(c.frase));
  invariante('o árabe sai em árabe', TUDO.filter((c) => c.lang === 'ar'), (c) => !ARABE.test(c.frase));
});

describe('PARTE 2 — o eixo do tratamento', () => {
  /**
   * es, fr, it e lt marcam o tratamento SEMPRE, e sem tocar no gênero de ninguém.
   * `pt` e `uk` podem coincidir, e é decisão registrada no cabeçalho dos dados:
   * o português com sujeito oculto ("Quer que eu ajude no banho?") serve aos dois,
   * e o ucraniano evita o passado justamente para não denunciar gênero.
   */
  it('es, fr, it e lt sempre distinguem usted de tú', () => {
    const falhas: string[] = [];
    for (const a of CARE_ACTIONS) {
      if (a.says.kind !== 'treat') continue;
      for (const lang of ['es', 'fr', 'it', 'lt'] as const) {
        if (a.says.usted[lang] === a.says.tu[lang]) falhas.push(`${a.key}/${lang}: "${a.says.usted[lang]}"`);
      }
    }
    expect(falhas).toEqual([]);
  });

  it('o inglês nunca muda, porque não distingue', () => {
    for (const a of CARE_ACTIONS) {
      expect(buildCareLine('en', a, 'usted')).toBe(buildCareLine('en', a, 'tu'));
    }
  });

  it('o árabe mostra as duas formas de quem ouve, e não um tratamento', () => {
    const sit = CARE_ACTIONS.find((a) => a.key === 'sit')!;
    // Não há seletor de gênero neste lado da tela: a linha de apoio traz as duas.
    expect(say(sit.says, 'ar', 'usted')).toBe('اجلسي من فضلك. / اجلس من فضلك.');
    expect(say(sit.says, 'ar', 'tu')).toBe(say(sit.says, 'ar', 'usted'));
  });

  it('o clítico italiano troca de lado, nunca de terminação', () => {
    // Uma função que gerasse `tu` a partir de `usted` produziria "Appoggiasi":
    // string plausível, inexistente. As duas formas são escritas à mão.
    const lean = CARE_ACTIONS.find((a) => a.key === 'leanOnMe')!;
    expect(buildCareLine('it', lean, 'usted')).toBe('Si appoggi al mio braccio.');
    expect(buildCareLine('it', lean, 'tu')).toBe('Appoggiati al mio braccio.');

    for (const a of CARE_ACTIONS) {
      if (a.says.kind !== 'treat') continue;
      const formal = a.says.usted.it;
      const informal = a.says.tu.it;
      expect(formal.startsWith('Si ') && informal.startsWith('Si '), `${a.key}: o clítico não se moveu`).toBe(false);
    }
  });

  it('as frases sem 2ª pessoa são declaradas, não esquecidas', () => {
    const invariaveis = CARE_ACTIONS.filter((a) => a.says.kind === 'same').map((a) => a.key);
    expect(invariaveis).toEqual(['standUp', 'step', 'waterTemp', 'medTime']);
    for (const key of invariaveis) {
      const a = CARE_ACTIONS.find((x) => x.key === key)!;
      for (const lang of SUPPORTED_LANGS) expect(buildCareLine(lang, a, 'usted')).toBe(buildCareLine(lang, a, 'tu'));
    }
  });
});

describe('PARTE 3 — os dois eixos não se multiplicam', () => {
  /**
   * O lado "falar com ela" não pode conter predicativo que concorde com o gênero
   * dela: quem escrever "¿Está cansado?" acerta metade das vezes, e a outra metade
   * é uma senhora de 85 anos tratada no masculino.
   */
  invariante(
    'nenhum predicativo concordado em es/pt',
    FALAS.filter((c) => c.lang === 'es' || c.lang === 'pt'),
    (c) => /\b(cansad|c[óo]mod|list|despiert|mojad|sentad|acostad|solit|tranquil|desorientad|preocupad)[ao]s?\b/i.test(c.frase),
  );

  invariante(
    'nenhum particípio concordado em fr',
    FALAS.filter((c) => c.lang === 'fr'),
    (c) => /\b(est|êtes|es)\s+\w+(ée?|ie)s?\b/.test(c.frase),
  );

  invariante(
    'nenhum particípio concordado em it',
    FALAS.filter((c) => c.lang === 'it'),
    (c) => /\b(è|sei|siete)\s+\w+(ata|ato|uta|uto)\b/.test(c.frase),
  );

  invariante(
    'nenhum particípio concordado em lt',
    FALAS.filter((c) => c.lang === 'lt'),
    (c) => /\w+(usi|ęs)\b/.test(c.frase),
  );

  /**
   * O gênero de quem CUIDA é um terceiro eixo que não pode entrar. Em ucraniano ele
   * apareceria no passado de 1ª pessoa ("я допомогла"), e em espanhol num predicativo
   * de 1ª pessoa ("estoy sola").
   */
  invariante(
    'a cuidadora não se descreve',
    FALAS,
    (c) => /\b(допомогла|допоміг|принесла|приніс|прийшла|прийшов)\b/.test(c.frase)
        || /\b(estoy|estou|sono|je suis)\s+(sola|solo|só|sozinha|sozinho|seule|seul)\b/i.test(c.frase),
  );

  /** "¿Tenéis…?" fala com o balcão de uma loja. Aqui há uma senhora sozinha. */
  invariante(
    'nada de vosotros no lado dela',
    FALAS.filter((c) => c.lang === 'es'),
    (c) => /\b(vosotros|vosotras)\b/.test(c.frase) || /\w+(áis|éis)\b/.test(c.frase),
  );
});

describe('PARTE 4 — o eixo do gênero, no relato', () => {
  it('o pro-drop de es/pt/it é aproveitado, e não "consertado" por medo', () => {
    // Particípio de haber/ter/avere NÃO concorda: duplicar seria dado idêntico.
    const ate = REPORT_EVENTS.find((e) => e.key === 'ateLittle')!;
    expect(ate.says.m?.es).toBeUndefined();
    expect(buildReport('es', ate, null, 'f')).toBe('Ha comido poco.');
    expect(buildReport('es', ate, null, 'm')).toBe('Ha comido poco.');
    expect(buildReport('es', ate, WHEN_TAGS[0], 'm')).toBe('Hoy ha comido poco.');
  });

  it('onde a língua obriga, as duas formas existem e diferem', () => {
    // `fell` em francês e italiano usa "être/essere": ali o particípio concorda.
    const fell = REPORT_EVENTS.find((e) => e.key === 'fell')!;
    expect(buildReport('fr', fell, null, 'f')).toBe('Elle est tombée dans la salle de bain.');
    expect(buildReport('fr', fell, null, 'm')).toBe('Il est tombé dans la salle de bain.');
    expect(buildReport('it', fell, null, 'f')).toBe('È caduta in bagno.');
    expect(buildReport('it', fell, null, 'm')).toBe('È caduto in bagno.');
    // O у/в protético do ucraniano segue o som anterior, e por isso é escrito à mão.
    expect(buildReport('uk', fell, null, 'f')).toBe('Вона впала у ванній.');
    expect(buildReport('uk', fell, null, 'm')).toBe('Він упав у ванній.');
  });

  it('fr, uk e ar têm forma masculina em todo evento com sujeito', () => {
    // Francês exige o pronome, ucraniano flexiona o passado, árabe flexiona o verbo.
    // Só os eventos impessoais escapam, e são exatamente dois.
    const impessoais = REPORT_EVENTS.filter((e) => !e.says.m).map((e) => e.key);
    expect(impessoais).toEqual(['leak', 'callDoctor']);
    for (const e of REPORT_EVENTS) {
      if (!e.says.m) continue;
      for (const lang of ['fr', 'uk', 'ar'] as const) {
        expect(e.says.m[lang], `${e.key}/${lang} sem forma masculina`).toBeTruthy();
        expect(e.says.m[lang], `${e.key}/${lang} não muda`).not.toBe(e.says.f[lang]);
      }
    }
  });

  it('há pelo menos um evento em que os oito idiomas mudam', () => {
    const calm = REPORT_EVENTS.find((e) => e.key === 'calm')!;
    for (const lang of SUPPORTED_LANGS) {
      expect(buildReport(lang, calm, null, 'f'), `${lang}`).not.toBe(buildReport(lang, calm, null, 'm'));
    }
  });

  it('o rótulo do relato é assunto, não frase', () => {
    /**
     * Com rótulo em forma de frase ("Esteve tranquila") o botão passava a
     * contradizer o próprio resultado assim que o seletor ia para "De um senhor"
     * — o botão dizia uma coisa e o cartão produzia "Ha estado tranquilo.".
     * Substantivo não tem gênero de sujeito, então serve aos dois.
     */
    const CONCORDA = /\b(tranquil|desorientad|cansad|sentad|acostad|cai?d|dormid|quiet)[ao]s?\b/i;
    const falhas: string[] = [];
    for (const e of REPORT_EVENTS) {
      for (const lang of ['es', 'pt', 'it'] as const) {
        if (CONCORDA.test(e.labels[lang])) falhas.push(`${e.key}/${lang}: "${e.labels[lang]}"`);
      }
    }
    expect(falhas).toEqual([]);
  });

  it('o relato não tem tratamento', () => {
    // Nenhuma frase de relato fala COM ela: não há "usted", "vous", "Ви" de 2ª pessoa.
    const falhas = RELATOS.filter((c) => c.lang === 'es' && /\b(usted|tú|te\s|le\s+duele)\b/i.test(c.frase));
    expect(falhas.map((c) => c.tag)).toEqual([]);
  });

  it('o marcador de tempo entra na frente e não duplica', () => {
    const noSleep = REPORT_EVENTS.find((e) => e.key === 'noSleep')!;
    const night = WHEN_TAGS.find((w) => w.key === 'night')!;
    expect(buildReport('fr', noSleep, night, 'f')).toBe("Cette nuit elle n'a pas bien dormi.");
    expect(buildReport('es', noSleep, night, 'f')).toBe('Esta noche no ha dormido bien.');
  });
});

describe('PARTE 5 — objetos: caso, número e falsos amigos', () => {
  it('o caso sai do quadro, não do módulo', () => {
    const walker = CARE_TOOLS.find((t) => t.key === 'walker')!;
    const have = TOOL_FRAMES.find((f) => f.key === 'have')!;
    const looking = TOOL_FRAMES.find((f) => f.key === 'looking')!;
    // "turėti" rege acusativo; "Ieškau" rege genitivo. O mesmo objeto, dois casos.
    expect(buildToolPhrase('lt', have, walker)).toBe('Ar turite vaikštynę?');
    expect(buildToolPhrase('lt', looking, walker)).toBe('Ieškau vaikštynės.');
    // Ucraniano fica no acusativo nos dois: "Я шукаю" não rege genitivo.
    expect(buildToolPhrase('uk', looking, walker)).toBe('Я шукаю ходунки.');
  });

  it('todo quadro com genitivo encontra a forma genitiva', () => {
    for (const frame of TOOL_FRAMES) {
      for (const lang of frame.gen ?? []) {
        for (const tool of CARE_TOOLS) {
          const forma = lang === 'uk' ? tool.gen?.uk : lang === 'lt' ? tool.gen?.lt : undefined;
          expect(forma, `${tool.key}/${lang} sem genitivo para "${frame.key}"`).toBeTruthy();
        }
      }
    }
  });

  it('o número segue o objeto, e "el pasamanos" engana', () => {
    const price = TOOL_FRAMES.find((f) => f.key === 'price')!;
    const where = TOOL_FRAMES.find((f) => f.key === 'where')!;
    const handrail = CARE_TOOLS.find((t) => t.key === 'handrail')!;
    const walker = CARE_TOOLS.find((t) => t.key === 'walker')!;
    const pad = CARE_TOOLS.find((t) => t.key === 'pad')!;
    // Termina em -s e é singular. Nenhuma varredura genérica pega isto.
    expect(buildToolPhrase('es', price, handrail)).toBe('¿Cuánto cuesta el pasamanos?');
    // "ходунки" é plural em ucraniano, "sauskelnės" em lituano.
    expect(buildToolPhrase('uk', where, walker)).toBe('Де ходунки?');
    expect(buildToolPhrase('lt', where, pad)).toBe('Kur yra sauskelnės?');
  });

  it('o árabe pede indefinido, sem o artigo ال', () => {
    // O OPOSTO de `locationData.ts`, e a armadilha mais fácil deste arquivo.
    for (const tool of CARE_TOOLS) {
      expect(tool.askFor.ar.startsWith('ال'), `${tool.key}`).toBe(false);
    }
  });

  it('os falsos amigos estão escritos, não deduzidos', () => {
    const nomes = Object.fromEntries(CARE_TOOLS.map((t) => [t.key, t.names.es]));
    expect(nomes.cane).toBe('el bastón');          // "bengala" é fogo de artifício
    expect(nomes.bedPad).toBe('el empapador');     // "resguardo" é recibo
    expect(nomes.pad).toBe('el absorbente');       // "pañal" faz pensar em bebê
    expect(nomes.bpMonitor).toBe('el tensiómetro'); // na Espanha se toma "la tensión"
    // Todo objeto com armadilha traz a nota nos oito idiomas.
    for (const t of CARE_TOOLS) {
      if (!t.note) continue;
      for (const lang of SUPPORTED_LANGS) expect(t.note[lang], `${t.key}/${lang}`).toBeTruthy();
    }
  });
});

describe('PARTE 6 — segurança: nunca medicamento, nunca dose', () => {
  /**
   * A varredura que decide se o módulo pode ir ao ar. Falha aqui não é bug: é motivo
   * para não publicar. Cobre TODAS as strings de TODAS as tabelas, rótulos e notas
   * inclusive, nos oito idiomas.
   */
  it('nenhum algarismo em lugar nenhum das tabelas', () => {
    // Horário sai por período do dia ("de la mañana"), nunca por relógio — hora é o
    // módulo Números. E dose, por definição, precisa de número.
    const falhas = TODAS_AS_STRINGS.filter((s) => /\d/.test(s.texto)).map((s) => `${s.onde}: "${s.texto}"`);
    expect(falhas).toEqual([]);
    // O 112 vive fora das tabelas, sozinho, e é o único algarismo do módulo.
    expect(EMERGENCY_NUMBER).toBe('112');
  });

  /**
   * `\b` do JavaScript só conhece `[A-Za-z0-9_]`: em "Atnešiu" ele enxerga uma
   * fronteira antes do "iu" porque "š" não é letra para ele, e em "portapillole"
   * não enxerga nenhuma antes de "pill". As duas varreduras abaixo usam
   * lookaround com `\p{L}` e a flag `u` — sem isso elas acusam o inocente e,
   * pior, deixam passar o culpado colado a um acento.
   */
  it('nenhuma unidade de dose', () => {
    const UNIDADE = /(?<![\p{L}\d])\d+(?:[.,]\d+)?\s?(?:mg|mcg|µg|ml|cc)(?![\p{L}\d])/iu;
    const SIGLA = /(?<![\p{L}\d])(?:UI|IU)(?![\p{L}\d])/u;
    const falhas = TODAS_AS_STRINGS
      .filter((s) => UNIDADE.test(s.texto) || SIGLA.test(s.texto))
      .map((s) => `${s.onde}: "${s.texto}"`);
    expect(falhas).toEqual([]);
  });

  it('nenhuma quantidade de comprimido', () => {
    const QUANTIDADE =
      /(?<![\p{L}])(?:un|una|uno|dos|tres|cuatro|media|mitad|half|two|three|deux|trois|demi|due|tre|mezza|дві|три|половин|dvi|trys|pusė|نصف)(?![\p{L}])(?:\s+\p{L}+)?\s+(?<![\p{L}])(?:pastilla|comprimido|c[áa]psula|gota|pill|tablet|cachet|pastiglia|таблет|حبة|قرص)/iu;
    const falhas = TODAS_AS_STRINGS.filter((s) => QUANTIDADE.test(s.texto)).map((s) => `${s.onde}: "${s.texto}"`);
    expect(falhas).toEqual([]);
  });

  it('nenhum princípio ativo nem marca', () => {
    const REMEDIO =
      /\b(paracetamol|acetaminophen|ibuprofen\w*|omeprazol\w*|enalapril|metformin\w*|insulin\w*|sintrom|adiro|lorazepam|diazepam|furosemid\w*|warfarin\w*|aspirin\w*|dipiron\w*|парацетамол|ібупрофен|аспірин|باراسيتامول|إيبوبروفين|أسبرين)\b/i;
    const falhas = TODAS_AS_STRINGS.filter((s) => REMEDIO.test(s.texto)).map((s) => `${s.onde}: "${s.texto}"`);
    expect(falhas).toEqual([]);
  });

  it('a emergência é literal, e não montada', () => {
    // Zero combinatória: o que está guardado é o que sai, sem `cap` nem ponto acrescentado.
    expect(EMERGENCY[0].es).toBe('Necesito una ambulancia.');
    expect(EMERGENCY[2].fr).toBe('La personne ne réagit pas.');
    expect(EMERGENCY[2].uk).toBe('Людина не реагує.');
    // O sujeito é "la persona" justamente para não precisar de gênero: aqui não há seletor.
    for (const e of EMERGENCY) {
      for (const lang of SUPPORTED_LANGS) expect(e[lang], `emergência/${lang}`).toBeTruthy();
    }
  });
});

describe('PARTE 7 — integridade das tabelas', () => {
  it('nenhuma chave repetida', () => {
    const listas: [string, { key: string }[]][] = [
      ['CARE_ACTIONS', CARE_ACTIONS], ['REPORT_EVENTS', REPORT_EVENTS],
      ['WHEN_TAGS', WHEN_TAGS], ['CARE_TOOLS', CARE_TOOLS], ['TOOL_FRAMES', TOOL_FRAMES],
    ];
    for (const [nome, lista] of listas) {
      const chaves = lista.map((x) => x.key);
      expect(new Set(chaves).size, `${nome} tem chave repetida`).toBe(chaves.length);
    }
  });

  it('todo rótulo existe nos oito idiomas', () => {
    for (const lang of SUPPORTED_LANGS) {
      for (const a of CARE_ACTIONS) expect(a.labels[lang], `${a.key}/${lang}`).toBeTruthy();
      for (const e of REPORT_EVENTS) expect(e.labels[lang], `${e.key}/${lang}`).toBeTruthy();
      for (const w of WHEN_TAGS) expect(w.phrases[lang], `${w.key}/${lang}`).toBeTruthy();
      for (const f of TOOL_FRAMES) expect(f.labels[lang], `${f.key}/${lang}`).toBeTruthy();
      for (const t of CARE_TOOLS) {
        expect(t.names[lang], `${t.key}/${lang}`).toBeTruthy();
        expect(t.askFor[lang], `${t.key}/${lang}`).toBeTruthy();
      }
    }
  });

  it('todo molde de quadro traz o marcador nos oito idiomas', () => {
    for (const f of TOOL_FRAMES) {
      for (const lang of SUPPORTED_LANGS) {
        expect(f.templates[lang], `${f.key}/${lang}`).toContain('{item}');
        if (f.templatesPl) expect(f.templatesPl[lang], `${f.key}/${lang} plural`).toContain('{item}');
      }
    }
  });

  it('nenhum grupo fica sem título, e nenhum item fica fora da tela', () => {
    // A tela percorre os grupos, não as tabelas: um item com grupo novo e sem
    // entrada em CARE_GROUPS simplesmente não apareceria, sem erro nenhum.
    for (const lang of SUPPORTED_LANGS) {
      for (const g of CARE_GROUPS) expect(CARE_GROUP_LABELS[g][lang], `${g}/${lang}`).toBeTruthy();
      for (const g of REPORT_GROUPS) expect(REPORT_GROUP_LABELS[g][lang], `${g}/${lang}`).toBeTruthy();
      for (const g of TOOL_GROUPS) expect(TOOL_GROUP_LABELS[g][lang], `${g}/${lang}`).toBeTruthy();
    }
    for (const a of CARE_ACTIONS) expect(CARE_GROUPS, `${a.key}`).toContain(a.group);
    for (const e of REPORT_EVENTS) expect(REPORT_GROUPS, `${e.key}`).toContain(e.group);
    for (const t of CARE_TOOLS) expect(TOOL_GROUPS, `${t.key}`).toContain(t.group);
    // E nenhum grupo vazio: título sem conteúdo é seção fantasma.
    for (const g of CARE_GROUPS) expect(CARE_ACTIONS.some((a) => a.group === g), `grupo vazio: ${g}`).toBe(true);
    for (const g of REPORT_GROUPS) expect(REPORT_EVENTS.some((e) => e.group === g), `grupo vazio: ${g}`).toBe(true);
    for (const g of TOOL_GROUPS) expect(CARE_TOOLS.some((t) => t.group === g), `grupo vazio: ${g}`).toBe(true);
  });

  it('o marcador de tempo não traz espaço na ponta', () => {
    for (const w of WHEN_TAGS) {
      for (const lang of SUPPORTED_LANGS) expect(w.phrases[lang]).toBe(w.phrases[lang].trim());
    }
  });
});
