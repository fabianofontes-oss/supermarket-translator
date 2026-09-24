import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import ElderCareModule from '../modules/ElderCareModule';
import {
  CARE_ACTIONS, REPORT_EVENTS, WHEN_TAGS, CARE_TOOLS, TOOL_FRAMES, EMERGENCY,
  EMERGENCY_NUMBER, EMERGENCY_NUMBERS, emergencyNumberFor,
  CARE_GROUPS, REPORT_GROUPS, TOOL_GROUPS,
  CARE_GROUP_LABELS, REPORT_GROUP_LABELS, TOOL_GROUP_LABELS,
  buildCareLine, buildReport, buildToolPhrase, reportLabel, say, visibleNote,
  type Gender, type Treat,
} from '../modules/eldercare/data/elderCareData';
import { SUPPORTED_LANGS, type LangCode } from '../modules/location/data/locationData';
import { translations } from '../translations';
import { COUNTRIES } from '../constants';

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
 *
 * As Partes 8 a 10 vêm da auditoria de usabilidade de 23/09/2026: uma cuidadora
 * brasileira recém-chegada, de óculos, com a senhora apoiada no braço. O botão
 * mostra a frase que vai dizer; nada da Espanha aparece como verdade fora dela; o
 * número de emergência é o do país; e nenhuma frase esconde um detalhe fixo.
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
    // 18 falas: o comprimido virou dois períodos (manhã e noite) mais o anúncio
    // sem período — ver a Parte 8.
    expect(CARE_ACTIONS).toHaveLength(18);
    expect(REPORT_EVENTS).toHaveLength(12);
    expect(WHEN_TAGS).toHaveLength(5);
    expect(CARE_TOOLS).toHaveLength(14);
    expect(TOOL_FRAMES).toHaveLength(4);
    expect(EMERGENCY).toHaveLength(6);
    // 8 idiomas × (18 falas × 2 tratamentos) e por aí.
    expect(FALAS).toHaveLength(8 * 18 * 2);
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
   * es, fr, it, lt e pt marcam o tratamento SEMPRE, e sem tocar no gênero de ninguém.
   * Só `uk` pode coincidir, e é decisão registrada no cabeçalho dos dados: o
   * ucraniano evita o passado justamente para não denunciar gênero.
   *
   * O `pt` entrou na lista em 24/09/2026. Com o sujeito oculto ("Está com fome?"),
   * 15 das 18 falas saíam iguais nos dois lados do seletor "Senhora / Você", e o
   * português é o que ela LÊ: trocar o seletor parecia não fazer nada.
   */
  it('es, fr, it, lt e pt sempre distinguem usted de tú', () => {
    const falhas: string[] = [];
    for (const a of CARE_ACTIONS) {
      if (a.says.kind !== 'treat') continue;
      for (const lang of ['es', 'fr', 'it', 'lt', 'pt'] as const) {
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
    // (Sem o lugar desde 23/09/2026: dizia sempre "no banheiro". Ver a Parte 8.)
    const fell = REPORT_EVENTS.find((e) => e.key === 'fell')!;
    expect(buildReport('fr', fell, null, 'f')).toBe('Elle est tombée.');
    expect(buildReport('fr', fell, null, 'm')).toBe('Il est tombé.');
    expect(buildReport('it', fell, null, 'f')).toBe('È caduta.');
    expect(buildReport('it', fell, null, 'm')).toBe('È caduto.');
    // O у/в protético do ucraniano segue o som anterior, e por isso é escrito à mão.
    expect(buildReport('uk', fell, null, 'f')).toBe('Вона впала.');
    expect(buildReport('uk', fell, null, 'm')).toBe('Він упав.');
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

  it('o rótulo da tela é a própria oração, e segue o seletor', () => {
    /**
     * Antes o rótulo era um substantivo fixo ("Tranquilidade"), porque um rótulo
     * em forma de frase ESCRITO NO DADO contradizia o cartão assim que o seletor
     * ia para "De um senhor". Agora o rótulo é CALCULADO da mesma oração que o
     * cartão usa, com o mesmo gênero — e a contradição fica impossível: o botão
     * diz exatamente o que o cartão vai dizer, sem o marcador de tempo e sem ponto.
     */
    const falhas: string[] = [];
    for (const lang of SUPPORTED_LANGS)
      for (const e of REPORT_EVENTS)
        for (const g of GENDERS) {
          const rotulo = reportLabel(lang, e, g);
          if (`${rotulo}.` !== buildReport(lang, e, null, g)) falhas.push(`${lang}/${e.key}/${g}: "${rotulo}"`);
        }
    expect(falhas).toEqual([]);
    const calm = REPORT_EVENTS.find((e) => e.key === 'calm')!;
    expect(reportLabel('pt', calm, 'f')).toBe('Esteve tranquila');
    expect(reportLabel('pt', calm, 'm')).toBe('Esteve tranquilo');
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
    // Os números de emergência vivem fora das tabelas, sozinhos, e são os únicos
    // algarismos do módulo: 112 no padrão, 911 nos Estados Unidos.
    expect(EMERGENCY_NUMBER).toBe('112');
    for (const n of Object.values(EMERGENCY_NUMBERS)) expect(n).toMatch(/^\d{3}$/);
  });

  it('o número de emergência é o do país: 112 no padrão, 911 nos Estados Unidos', () => {
    // No lançamento "Estou em" abre Estados Unidos, e ali o app ensinava 112.
    expect(emergencyNumberFor('es')).toBe('112');
    expect(emergencyNumberFor('fr')).toBe('112');
    expect(emergencyNumberFor('it')).toBe('112');
    expect(emergencyNumberFor('us')).toBe('911');
    // País sem entrada cai no padrão europeu, nunca em vazio.
    expect(emergencyNumberFor('xx')).toBe('112');
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

// ---------------------------------------------------------------------------
// Auditoria de usabilidade, 23/09/2026
// ---------------------------------------------------------------------------

const acao = (key: string) => CARE_ACTIONS.find((a) => a.key === key)!;
const relato = (key: string) => REPORT_EVENTS.find((e) => e.key === key)!;
const objeto = (key: string) => CARE_TOOLS.find((x) => x.key === key)!;

describe('PARTE 8 — nenhum detalhe fixo escondido, nenhuma nota fora do lugar', () => {
  it('a queda não diz onde foi', () => {
    // Dizia sempre "caiu no banheiro". Se ela caiu no quarto, a família — e dali o
    // médico — recebia a informação errada.
    const LUGAR = /baño|banheiro|bathroom|salle de bain|bagno|ванн|vonioje|الحمام/i;
    const fell = relato('fell');
    for (const lang of SUPPORTED_LANGS)
      for (const g of GENDERS) expect(buildReport(lang, fell, null, g), `${lang}/${g}`).not.toMatch(LUGAR);
    expect(buildReport('es', fell, null, 'f')).toBe('Se ha caído.');
    expect(buildReport('pt', fell, WHEN_TAGS[0], 'f')).toBe('Hoje caiu.');
  });

  it('a recomendação de chamar o médico não ganha data', () => {
    const medico = relato('callDoctor');
    expect(medico.semTempo).toBe(true);
    for (const lang of SUPPORTED_LANGS)
      for (const when of WHEN_TAGS)
        expect(buildReport(lang, medico, when, 'f'), `${lang}/${when.key}`).toBe(buildReport(lang, medico, null, 'f'));
    expect(buildReport('es', medico, WHEN_TAGS[0], 'f')).toBe('Creo que habría que llamar al médico.');
    // Só ele: todo outro relato continua aceitando o marcador.
    expect(REPORT_EVENTS.filter((e) => e.semTempo).map((e) => e.key)).toEqual(['callDoctor']);
  });

  it('a caminhada não diz por onde', () => {
    const LUGAR = /pasillo|corredor|hallway|couloir|corridoio|коридор|koridori|الممر/i;
    const walked = relato('walked');
    for (const lang of SUPPORTED_LANGS)
      for (const g of GENDERS) expect(buildReport(lang, walked, null, g), `${lang}/${g}`).not.toMatch(LUGAR);
    expect(buildReport('pt', walked, null, 'f')).toBe('Caminhou um pouco.');
  });

  it('o comprimido: uma pergunta por período, e o anúncio sem período', () => {
    // "Hora do comprimido" anunciava sempre o da NOITE, às oito da manhã inclusive.
    const PERIODO = /mañana|noche|manhã|noite|morning|evening|matin|soir|mattino|sera|ранков|вечірн|ryt|vakar|الصباح|المساء/i;
    const anuncio = acao('medTime');
    for (const lang of SUPPORTED_LANGS) expect(buildCareLine(lang, anuncio, 'usted'), lang).not.toMatch(PERIODO);
    expect(buildCareLine('es', anuncio, 'usted')).toBe('Es la hora de la pastilla.');

    const manha = acao('medMorning');
    const noite = acao('medNight');
    expect(manha.group).toBe('meds');
    expect(noite.group).toBe('meds');
    expect(buildCareLine('es', manha, 'usted')).toBe('¿Ya se ha tomado la pastilla de la mañana?');
    expect(buildCareLine('es', noite, 'usted')).toBe('¿Ya se ha tomado la pastilla de la noche?');
    expect(buildCareLine('es', noite, 'tu')).toBe('¿Ya te has tomado la pastilla de la noche?');
    expect(buildCareLine('pt', noite, 'usted')).toBe('A senhora já tomou o comprimido da noite?');
    expect(buildCareLine('pt', noite, 'tu')).toBe('Você já tomou o comprimido da noite?');
    // O ucraniano continua impessoal: o passado denunciaria o gênero de quem ouve.
    expect(buildCareLine('uk', noite, 'usted')).toBe(buildCareLine('uk', noite, 'tu'));
  });

  it('toda nota que fala de um país diz qual é', () => {
    /**
     * A do andador ensinava a quem está nos Estados Unidos que lá se diz
     * "taca-taca". Nota sem `noteIn` aparece em qualquer destino, então precisa
     * ser declarada aqui — as duas únicas são a regra de segurança do comprimido.
     */
    const universais = [...CARE_ACTIONS, ...CARE_TOOLS].filter((x) => x.note && !x.noteIn).map((x) => x.key);
    expect(universais).toEqual(['medMorning', 'medNight']);

    const naEspanha = ['walker', 'cane', 'handrail', 'bedPad', 'bedpan', 'pad', 'bpMonitor'];
    for (const key of naEspanha) expect(objeto(key).noteIn, key).toBe('es');
    expect(objeto('wheelchair').noteIn).toBe('fr');
    expect(acao('leanOnMe').noteIn).toBe('it');
  });

  it('a nota só aparece no destino dela', () => {
    const walker = objeto('walker');
    expect(visibleNote(walker, 'us', 'pt')).toBeNull();
    expect(visibleNote(walker, 'fr', 'pt')).toBeNull();
    // Dentro da Espanha, a nota em português diz que é na Espanha.
    expect(visibleNote(walker, 'es', 'pt')).toMatch(/^Na Espanha, em casa muita gente diz "taca-taca"/);
    expect(visibleNote(objeto('wheelchair'), 'fr', 'pt')).toContain('fauteuil roulant');
    expect(visibleNote(objeto('wheelchair'), 'es', 'pt')).toBeNull();
    // A do comprimido vale em qualquer lugar.
    expect(visibleNote(acao('medMorning'), 'us', 'pt')).toContain('nunca pela quantidade');
    // Item sem nota, nenhuma nota.
    expect(visibleNote(acao('sit'), 'es', 'pt')).toBeNull();
  });

  it('palavras que a brasileira usa', () => {
    const leak = relato('leak');
    expect(leak.labels.pt).toBe('Xixi ou cocô na roupa');
    expect(reportLabel('pt', leak, 'f')).toBe('Teve um escape (fez na roupa)');
    expect(TOOL_GROUP_LABELS.health.pt).toBe('Para medir a saúde');
    expect(objeto('bedPad').names.pt).toBe('o forro de cama descartável');
    expect(objeto('bedPad').askFor.pt).toBe('um forro de cama descartável');
    // "Resguardo" só sobrevive na nota que ensina a NÃO pedir "un resguardo".
    const nomes = CARE_TOOLS.flatMap((x) => [x.names.pt, x.askFor.pt]);
    expect(nomes.filter((n) => /resguardo/i.test(n))).toEqual([]);
    expect(CARE_TOOLS.filter((x) => /resguardo/i.test(x.note?.pt ?? '')).map((x) => x.key)).toEqual(['bedPad']);
  });
});

// ------------------------------------------------------------------- tela

const t = (k: string) => (translations['pt-BR'] as Record<string, string>)[k] || k;
const pais = (code: string) => COUNTRIES.find((c) => c.code === code)!;
const BR = pais('br');
const ES = pais('es');
const US = pais('us');
const FR = pais('fr');
const tema = { color: 'bg-sky-700', textColor: 'text-sky-700', hex: '#0369a1', borderColor: 'border-sky-700' };

const montar = (targetCountry = ES) => {
  const handlePlayAudio = vi.fn();
  const r = render(createElement(ElderCareModule, {
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

const botao = (nome: string) => screen.getByRole('button', { name: nome });
const aba = (chave: string) => fireEvent.click(screen.getByRole('tab', { name: t(chave) }));
const depois = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

describe('PARTE 9 — a tela', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = ((): MediaQueryList => ({
      matches: false, media: '', onchange: null,
      addEventListener() {}, removeEventListener() {},
      addListener() {}, removeListener() {}, dispatchEvent: () => false,
    } as unknown as MediaQueryList)) as unknown as typeof window.matchMedia;
  });

  afterEach(() => cleanup());

  it('diz para que serve', () => {
    montar();
    expect(screen.getByText(t('hintElderCare'))).toBeTruthy();
  });

  it('o botão mostra a frase inteira, em português, no tratamento escolhido', () => {
    montar();
    // Todas as falas, uma por botão, com a frase que o celular vai dizer.
    // Uma consulta só: `getByRole` com nome recalcula o nome de todos os botões
    // da tela a cada chamada, e dezoito seguidas passavam de 5 s com a suíte
    // inteira rodando em paralelo. O botão da fala só tem o texto dela.
    const textos = screen.getAllByRole('button').map((b) => b.textContent);
    for (const a of CARE_ACTIONS) expect(textos, a.key).toContain(buildCareLine('pt', a, 'usted'));
    // Nada de palavra solta: "Fome" podia ser "estou com fome".
    expect(screen.queryByText('Fome')).toBeNull();
    expect(screen.queryByText('O banho')).toBeNull();

    fireEvent.click(botao('A senhora está com fome?'));
    expect(botao('A senhora está com fome?').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('¿Tiene hambre?')).toBeTruthy();
    // O botão e a linha de apoio do cartão dizem a mesma coisa.
    expect(screen.getAllByText('A senhora está com fome?')).toHaveLength(2);

    // "Você" muda a frase falada E o botão: o português diz "você" agora.
    fireEvent.click(botao(t('ecInformal')));
    expect(screen.getByText('¿Tienes hambre?')).toBeTruthy();
    expect(botao('Você está com fome?').getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByRole('button', { name: 'A senhora está com fome?' })).toBeNull();
    expect(botao('Senta aqui, por favor.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Sente-se, por favor.' })).toBeNull();
  });

  it('na Espanha: "Senhora / Você", e a dica do usted', () => {
    montar(ES);
    expect(screen.getByText(t('ecTreatment'))).toBeTruthy();
    expect(botao(t('ecFormal')).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(t('ecUstedTip'))).toBeTruthy();
  });

  it('nos Estados Unidos o seletor de tratamento some, porque o inglês não muda', () => {
    montar(US);
    expect(screen.queryByText(t('ecTreatment'))).toBeNull();
    expect(screen.queryByText(t('ecUstedTip'))).toBeNull();
    expect(screen.getByText('Please sit down.')).toBeTruthy();
  });

  it('na França o seletor fica, mas sem a dica da Espanha', () => {
    montar(FR);
    expect(screen.getByText(t('ecTreatment'))).toBeTruthy();
    expect(screen.queryByText(t('ecUstedTip'))).toBeNull();
  });

  it('emergência na Espanha: a faixa diz que abre, e o ligar mora dentro', () => {
    const { handlePlayAudio } = montar(ES);
    const faixa = screen.getByRole('button', { name: /Emergência · frases/ });
    expect(faixa.textContent).toContain('112');
    expect(faixa.getAttribute('aria-expanded')).toBe('false');
    // Fechada, nada liga: o toque acidental não disca.
    expect(screen.queryByRole('link')).toBeNull();

    fireEvent.click(faixa);
    expect(faixa.getAttribute('aria-expanded')).toBe('true');
    const ligar = screen.getByRole('link', { name: `${t('ecCall')} 112` });
    expect(ligar.getAttribute('href')).toBe('tel:112');
    // No topo da parte aberta, antes da primeira frase — e a lista não mudou de ordem.
    const primeira = screen.getByText(EMERGENCY[0].es);
    expect(depois(ligar, primeira)).toBe(true);
    expect(screen.getByText(t('ecEmergencyHint'))).toBeTruthy();

    fireEvent.click(primeira.closest('button')!);
    expect(handlePlayAudio).toHaveBeenCalledWith('Necesito una ambulancia.', 'es-ES');
  });

  it('emergência nos Estados Unidos: 911', () => {
    montar(US);
    const faixa = screen.getByRole('button', { name: /Emergência · frases/ });
    expect(faixa.textContent).toContain('911');
    expect(faixa.textContent).not.toContain('112');
    fireEvent.click(faixa);
    const ligar = screen.getByRole('link', { name: `${t('ecCall')} 911` });
    expect(ligar.getAttribute('href')).toBe('tel:911');
    expect(screen.getByText('I need an ambulance.')).toBeTruthy();
  });

  it('a nota entra embaixo do grupo tocado, e não empurra a lista', () => {
    montar(ES);
    const nota = acao('medMorning').note!.pt;
    expect(screen.queryByText(nota)).toBeNull();

    const b = botao('A senhora já tomou o comprimido da manhã?');
    fireEvent.click(b);
    const p = screen.getByText(nota);
    expect(p.closest('section')).toBe(b.closest('section'));
    expect(depois(b, p)).toBe(true);
    // Nada foi desenhado antes do primeiro grupo: o primeiro botão não saiu do lugar.
    expect(depois(p, botao('Sente-se, por favor.'))).toBe(false);
  });

  it('a nota sobre o italiano não aparece na Espanha', () => {
    montar(ES);
    fireEvent.click(botao('Apoie-se no meu braço.'));
    expect(screen.queryByText(acao('leanOnMe').note!.pt)).toBeNull();
  });

  it('pedir coisas: "taca-taca" só na Espanha, e embaixo do grupo', () => {
    montar(ES);
    aba('ecModeTools');
    const nota = objeto('walker').note!.pt;
    const p = screen.getByText(nota);
    expect(p.closest('section')).toBe(botao('o andador').closest('section'));
    cleanup();

    montar(US);
    aba('ecModeTools');
    expect(screen.queryByText(nota)).toBeNull();
  });

  it('pedir coisas: "fauteuil roulant" só na França', () => {
    const nota = objeto('wheelchair').note!.pt;
    montar(FR);
    aba('ecModeTools');
    fireEvent.click(botao('a cadeira de rodas'));
    expect(screen.getByText(nota)).toBeTruthy();
    cleanup();

    montar(ES);
    aba('ecModeTools');
    fireEvent.click(botao('a cadeira de rodas'));
    expect(screen.queryByText(nota)).toBeNull();
  });

  it('o relato do médico não leva tempo, e a fila de "Quando" se desliga sem perder a escolha', () => {
    montar(ES);
    aba('ecModeReport');
    const hoje = botao(WHEN_TAGS[0].phrases.pt);
    expect(hoje.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(botao('Acho que seria bom chamar o médico'));
    // Era "Hoy creo que habría que llamar al médico.": opinião com data.
    expect(screen.getByText('Creo que habría que llamar al médico.')).toBeTruthy();
    expect((hoje as HTMLButtonElement).disabled).toBe(true);
    expect(hoje.getAttribute('aria-pressed')).toBe('false');

    // De volta a outro relato, o "Hoje" que estava escolhido continua lá.
    fireEvent.click(botao('Comeu pouco'));
    expect(screen.getByText('Hoy ha comido poco.')).toBeTruthy();
    expect((hoje as HTMLButtonElement).disabled).toBe(false);
  });

  it('contar à família: o botão é a oração, e segue "De um senhor"', () => {
    montar(ES);
    aba('ecModeReport');
    expect(botao('Comeu pouco').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Hoy ha comido poco.')).toBeTruthy();
    expect(botao('Esteve tranquila')).toBeTruthy();
    expect(botao('Teve um escape (fez na roupa)')).toBeTruthy();

    fireEvent.click(botao(t('ecWhoM')));
    expect(botao('Esteve tranquilo')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Esteve tranquila' })).toBeNull();
  });
});

describe('PARTE 10 — o código da tela', () => {
  const ler = (f: string) => readFileSync(join(__dirname, '..', f), 'utf8');
  const fonte = ler('modules/ElderCareModule.tsx');

  it('nada de letra miúda nem português apagado', () => {
    expect(fonte).not.toMatch(/text-\[(9|10|11|12|13)px\]/);
    expect(fonte).not.toMatch(/\btext-xs\b/);
    expect(fonte).not.toMatch(/opacity-(45|50|60|70)/);
  });

  it('passa a dica à moldura e lê o número pelo país', () => {
    expect(fonte).toContain("dica={t('hintElderCare')}");
    expect(fonte).toContain('emergencyNumberFor(targetCountry.code)');
    expect(fonte).not.toMatch(/\{EMERGENCY_NUMBER\}/);
  });

  it('as chaves usadas existem nos oito blocos', () => {
    const usadas = [...fonte.matchAll(/\bt\('([A-Za-z0-9_]+)'\)/g)].map((m) => m[1]);
    expect(usadas.length).toBeGreaterThan(10);
    const faltando: string[] = [];
    for (const [locale, bloco] of Object.entries(translations))
      for (const k of usadas) if (!(bloco as Record<string, string>)[k]) faltando.push(`${locale}/${k}`);
    expect(faltando).toEqual([]);
  });
});
