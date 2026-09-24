import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import BodyModule from '../modules/BodyModule';
import {
  BODY_PARTS, LOCAL_SYMPTOMS, GENERAL_SYMPTOMS, DURATIONS, BODY_QUESTIONS, BODY_URGENT,
  FACE, MARKER_HIT_R,
  buildComplaint, partName,
  type Text,
} from '../modules/body/data/bodyData';
import { SUPPORTED_LANGS, toLangCode, type LangCode } from '../modules/location/data/locationData';
import { translations } from '../translations';
import { COUNTRIES } from '../constants';

/**
 * Módulo Onde dói.
 *
 * O que este arquivo tranca vem da auditoria de usabilidade de 23/09/2026: uma
 * brasileira recém-chegada, de óculos, com dor, na frente do balcão da farmácia.
 *
 *  1. Parte 1 — dados completos nos oito idiomas, e nenhuma frase que concorde
 *     com o gênero de quem fala ("Estoy mareado", "Sou alérgico"). A gravidez é a
 *     única exceção, e é nominal.
 *  2. Parte 2 — o botão fala o que diz: o rótulo está dentro da frase que ele
 *     monta, em toda língua que pode ser destino.
 *  3. Parte 3 — o boneco: as costas saíram da frente da barriga, as áreas de toque
 *     do rosto não se cruzam, e cada marcador do rosto tem desenho embaixo.
 *  4. Parte 4 — a tela: urgência no topo, a ordem das seções, o português legível.
 */

const raiz = join(__dirname, '..');
const ler = (f: string) => readFileSync(join(raiz, f), 'utf8');

/** Bloco árabe. Nenhuma outra língua pode conter isto. */
const ARABE = /[؀-ۿ]/;

/** As línguas que podem ser destino — as que a frase FALA. */
const DESTINOS = [...new Set(COUNTRIES.filter((c) => !c.originOnly).map((c) => toLangCode(c.lang)))];

const GRAVIDEZ = BODY_QUESTIONS.find((q) => q.es === 'Estoy embarazada.');

// ------------------------------------------------------------------ dados

type Caso = { tag: string; lang: LangCode; frase: string; montada?: boolean; excecao?: boolean };

const todasAsFrases = (): Caso[] => {
  const out: Caso[] = [];
  const durs = [null, ...DURATIONS];
  for (const lang of SUPPORTED_LANGS) {
    for (const s of LOCAL_SYMPTOMS)
      for (const p of BODY_PARTS)
        for (const d of durs)
          out.push({ tag: `${lang}/${s.key}/${p.key}/${d?.key ?? '-'}`, lang, frase: buildComplaint(lang, s, p, d), montada: true });
    for (const s of GENERAL_SYMPTOMS)
      for (const d of durs)
        out.push({ tag: `${lang}/${s.key}/${d?.key ?? '-'}`, lang, frase: buildComplaint(lang, s, null, d), montada: true });
    for (const s of [...LOCAL_SYMPTOMS, ...GENERAL_SYMPTOMS]) out.push({ tag: `${lang}/rotulo:${s.key}`, lang, frase: s.labels[lang] });
    for (const d of DURATIONS) {
      out.push({ tag: `${lang}/dur:${d.key}`, lang, frase: d.labels[lang] });
      out.push({ tag: `${lang}/dur-frase:${d.key}`, lang, frase: d.phrases[lang] });
    }
    BODY_QUESTIONS.forEach((q, i) => out.push({ tag: `${lang}/farmacia:${i}`, lang, frase: q[lang], excecao: q === GRAVIDEZ }));
    BODY_URGENT.forEach((q, i) => out.push({ tag: `${lang}/urgencia:${i}`, lang, frase: q[lang] }));
  }
  return out;
};

const FRASES = todasAsFrases();

/**
 * Predicativo que concordaria com quem fala. Não é um analisador: é uma rede
 * grossa para as construções que já apareceram aqui ("Estoy mareado", "Sou
 * alérgico", "Sono allergico", "Esu alergiškas") e para as que viriam a seguir.
 */
const CONCORDA_COM_QUEM_FALA: Partial<Record<LangCode, RegExp>> = {
  es: /\b(estoy|soy|me siento|me encuentro)\s+\p{L}+[oa]s?\b/iu,
  pt: /\b(estou|sou|fico|me sinto)\s+\p{L}+[oa]s?\b/iu,
  it: /\b(sono|mi sento)\s+\p{L}+/iu,
  fr: /\bje (suis|me sens)\b/iu,
  lt: /\b(esu|jaučiuosi)\b|\p{L}+išk(as|a)\b/iu,
  uk: /(^|\s)я\s+\p{L}+/iu,
  ar: /أنا\s/u,
};

describe('PARTE 1 — dados completos, e nenhuma frase com o gênero de quem fala', () => {
  const textos: [string, Text][] = [
    ...[...LOCAL_SYMPTOMS, ...GENERAL_SYMPTOMS].flatMap((s) => [[`rotulo:${s.key}`, s.labels], [`frase:${s.key}`, s.templates]] as [string, Text][]),
    ...DURATIONS.flatMap((d) => [[`dur:${d.key}`, d.labels], [`dur-frase:${d.key}`, d.phrases]] as [string, Text][]),
    ...BODY_QUESTIONS.map((q, i) => [`farmacia:${i}`, q] as [string, Text]),
    ...BODY_URGENT.map((q, i) => [`urgencia:${i}`, q] as [string, Text]),
  ];

  it('todo texto existe nos oito idiomas', () => {
    const faltando: string[] = [];
    for (const [tag, txt] of textos)
      for (const l of SUPPORTED_LANGS) if (!txt[l]?.trim()) faltando.push(`${tag}/${l}`);
    for (const p of BODY_PARTS)
      for (const l of SUPPORTED_LANGS)
        if (!p.names[l]?.[0]?.trim() || !p.names[l]?.[1]?.trim()) faltando.push(`parte:${p.key}/${l}`);
    expect(faltando).toEqual([]);
  });

  it('toda frase montada sai inteira: sem marcador sobrando, sem espaço duplo, com ponto', () => {
    const ruins = FRASES.filter((c) => c.montada)
      .filter((c) => /[{}]/.test(c.frase) || /\s{2}/.test(c.frase) || !c.frase.endsWith('.'))
      .map((c) => `${c.tag}: ${c.frase}`);
    expect(ruins).toEqual([]);
  });

  it('só o árabe tem letra árabe', () => {
    const vazou = FRASES.filter((c) => c.lang !== 'ar' && ARABE.test(c.frase)).map((c) => c.tag);
    expect(vazou).toEqual([]);
  });

  it('nenhuma frase concorda com o gênero de quem fala — só a gravidez', () => {
    expect(GRAVIDEZ, 'a exceção precisa continuar existindo, senão o teste passa à toa').toBeDefined();
    const erradas = FRASES.filter((c) => !c.excecao && CONCORDA_COM_QUEM_FALA[c.lang]?.test(c.frase))
      .map((c) => `${c.tag}: ${c.frase}`);
    expect(erradas).toEqual([]);
  });

  it('a rede pega o que já esteve aqui', () => {
    // Sem isto, uma regex quebrada deixaria o teste de cima verde para sempre.
    expect(CONCORDA_COM_QUEM_FALA.es!.test('Estoy mareado')).toBe(true);
    expect(CONCORDA_COM_QUEM_FALA.es!.test('Soy alérgico a la penicilina.')).toBe(true);
    expect(CONCORDA_COM_QUEM_FALA.pt!.test('Estou tonto')).toBe(true);
    expect(CONCORDA_COM_QUEM_FALA.pt!.test('Sou alérgico a penicilina.')).toBe(true);
    expect(CONCORDA_COM_QUEM_FALA.it!.test('Sono allergico alla penicillina.')).toBe(true);
    expect(CONCORDA_COM_QUEM_FALA.lt!.test('Esu alergiškas penicilinui.')).toBe(true);
    expect(CONCORDA_COM_QUEM_FALA.pt!.test('Estou com tontura')).toBe(false);
  });

  it('tontura, enjoo e alergia saem com ter + substantivo', () => {
    const dizzy = GENERAL_SYMPTOMS.find((s) => s.key === 'dizzy')!;
    const nausea = GENERAL_SYMPTOMS.find((s) => s.key === 'nausea')!;
    expect(dizzy.templates.es).toBe('Tengo mareos');
    expect(dizzy.templates.pt).toBe('Estou com tontura');
    expect(nausea.templates.pt).toBe('Estou com enjoo');
    const alergia = BODY_QUESTIONS.find((q) => q.es.includes('penicilina'))!;
    expect(alergia.es).toBe('Tengo alergia a la penicilina.');
    expect(alergia.pt).toBe('Tenho alergia à penicilina.');
    expect(alergia.it).toBe("Ho un'allergia alla penicillina.");
  });
});

// ---------------------------------------------------------------- rótulos

describe('PARTE 2 — o botão fala o que diz', () => {
  it('as línguas de destino são as cinco de sempre', () => {
    expect([...DESTINOS].sort()).toEqual(['en', 'es', 'fr', 'it', 'pt']);
  });

  it('em toda língua de destino, o rótulo está dentro da frase que o botão monta', () => {
    // O defeito: o botão dizia "me falta el aire" e a frase falada era "Me cuesta
    // respirar". Ela lia uma coisa e ouvia outra.
    const fora: string[] = [];
    for (const lang of DESTINOS)
      for (const s of [...LOCAL_SYMPTOMS, ...GENERAL_SYMPTOMS])
        if (!s.templates[lang].toLowerCase().includes(s.labels[lang].toLowerCase()))
          fora.push(`${lang}/${s.key}: "${s.labels[lang]}" ∉ "${s.templates[lang]}"`);
    expect(fora).toEqual([]);
  });

  it('vômito e "desde quando" formam frase que se diz', () => {
    // "He vomitado desde hace dos días" e "Tengo fiebre desde hoy" estavam a um
    // toque na tela, justo na frase dita no médico.
    const vomito = GENERAL_SYMPTOMS.find((s) => s.key === 'vomit')!;
    const febre = GENERAL_SYMPTOMS.find((s) => s.key === 'fever')!;
    const doisDias = DURATIONS.find((d) => d.key === 'twoDays')!;
    const manha = DURATIONS.find((d) => d.key === 'morning')!;
    expect(buildComplaint('es', vomito, null, doisDias)).toBe('Tengo vómitos desde hace dos días.');
    expect(buildComplaint('pt', vomito, null, doisDias)).toBe('Estou com vômito há dois dias.');
    expect(buildComplaint('en', vomito, null, doisDias)).toBe('I have been vomiting for two days.');
    expect(buildComplaint('es', febre, null, manha)).toBe('Tengo fiebre desde esta mañana.');
    expect(buildComplaint('pt', febre, null, manha)).toBe('Estou com febre desde hoje cedo.');
    for (const d of DURATIONS) for (const l of DESTINOS) {
      expect(d.phrases[l], `${d.key}/${l}`).not.toMatch(/^(desde hoy|desde hoje|since today|depuis aujourd'hui|da oggi)$/);
    }
  });

  it('falta de ar em espanhol é o que está no botão', () => {
    const ar = GENERAL_SYMPTOMS.find((s) => s.key === 'breathe')!;
    expect(ar.templates.es).toBe('Me falta el aire');
  });
});

// ------------------------------------------------------------------ boneco

describe('PARTE 3 — o boneco', () => {
  const marcadores = BODY_PARTS.filter((p) => p.x !== undefined && p.y !== undefined) as Required<typeof BODY_PARTS[number]>[];
  const pos = (k: string) => marcadores.find((p) => p.key === k)!;
  const dist = (a: readonly [number, number], b: readonly [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  it('as costas não estão no boneco (ele está de frente), só na lista', () => {
    expect(marcadores.map((p) => p.key)).not.toContain('back');
    expect(BODY_PARTS.map((p) => p.key)).toContain('back');
    // A bolinha do meio da barriga agora é a barriga.
    expect([pos('belly').x, pos('belly').y]).toEqual([100, 170]);
    expect(marcadores).toHaveLength(12);
  });

  it('nenhuma área de toque se cruza com outra', () => {
    const cruzadas: string[] = [];
    for (let i = 0; i < marcadores.length; i++)
      for (let j = i + 1; j < marcadores.length; j++) {
        const a = marcadores[i], b = marcadores[j];
        const d = dist([a.x, a.y], [b.x, b.y]);
        if (d < 2 * MARKER_HIT_R) cruzadas.push(`${a.key}–${b.key}: ${d.toFixed(1)}`);
      }
    expect(cruzadas).toEqual([]);
  });

  it('toda área de toque cabe dentro do desenho', () => {
    for (const p of marcadores) {
      expect(p.x - MARKER_HIT_R, p.key).toBeGreaterThanOrEqual(0);
      expect(p.x + MARKER_HIT_R, p.key).toBeLessThanOrEqual(200);
      expect(p.y - MARKER_HIT_R, p.key).toBeGreaterThanOrEqual(0);
      expect(p.y + MARKER_HIT_R, p.key).toBeLessThanOrEqual(400);
    }
  });

  it('olho, ouvido e dente ficam em cima do desenho do rosto', () => {
    expect([pos('eye').x, pos('eye').y]).toEqual([...FACE.eyes[0]]);
    expect([pos('ear').x, pos('ear').y]).toEqual([...FACE.ears[0]]);
    expect(pos('tooth').y).toBe(FACE.mouth.y);
    expect(pos('tooth').x).toBeGreaterThan(FACE.mouth.x1);
    expect(pos('tooth').x).toBeLessThan(FACE.mouth.x2);
  });

  it('o outro olho e a outra orelha ficam à vista, fora de qualquer marcador', () => {
    for (const livre of [FACE.eyes[1], FACE.ears[1]])
      for (const p of marcadores)
        expect(dist(livre, [p.x, p.y]), `${livre} coberto por ${p.key}`).toBeGreaterThanOrEqual(MARKER_HIT_R);
  });

  it('o nome da parte sai com maiúscula, na língua pedida', () => {
    const cabeca = BODY_PARTS.find((p) => p.key === 'head')!;
    expect(partName(cabeca, 'pt')).toBe('A cabeça');
    expect(partName(cabeca, 'en')).toBe('My head');
  });
});

// ------------------------------------------------------------------- tela

const t = (k: string) => (translations['pt-BR'] as Record<string, string>)[k] || k;
const BR = COUNTRIES.find((c) => c.code === 'br')!;
const ES = COUNTRIES.find((c) => c.code === 'es')!;
const US = COUNTRIES.find((c) => c.code === 'us')!;
const tema = { color: 'bg-rose-600', textColor: 'text-rose-600', hex: '#e11d48', borderColor: 'border-rose-600' };

const montar = (targetCountry = ES) => {
  const handlePlayAudio = vi.fn();
  const r = render(createElement(BodyModule, {
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

const botaoCom = (texto: string) => screen.getByText(texto).closest('button')!;

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = ((): MediaQueryList => ({
    matches: false, media: '', onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent: () => false,
  } as unknown as MediaQueryList)) as unknown as typeof window.matchMedia;
});

afterEach(() => cleanup());

describe('PARTE 4 — a tela', () => {
  it('diz para que serve e diz para tocar no boneco', () => {
    montar();
    expect(screen.getByText(t('hintBody'))).toBeTruthy();
    expect(screen.getByText(t('bodyTapHint'))).toBeTruthy();
    // A frase de exemplo continua a mesma: é algo que ela diria hoje.
    expect(screen.getByText('Me duele la cabeza.')).toBeTruthy();
    expect(screen.getByText('A cabeça')).toBeTruthy();
  });

  it('a urgência vem antes do boneco, fechada, e abre as três frases com som', () => {
    const { handlePlayAudio } = montar();
    const faixa = screen.getByRole('button', { name: t('bodyUrgent') });
    expect(faixa.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText(BODY_URGENT[0].es)).toBeNull();
    const boneco = screen.getByText(t('bodyTapHint'));
    expect(faixa.compareDocumentPosition(boneco) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Fechada, não aponta para lista nenhuma: IDREF pendurada é defeito.
    expect(faixa.hasAttribute('aria-controls')).toBe(false);

    fireEvent.click(faixa);
    expect(faixa.getAttribute('aria-expanded')).toBe('true');
    const lista = document.getElementById(faixa.getAttribute('aria-controls')!);
    expect(lista?.tagName).toBe('UL');
    for (const q of BODY_URGENT) {
      expect(screen.getByText(q.es)).toBeTruthy();
      expect(screen.getByText(q.pt)).toBeTruthy();
    }
    fireEvent.click(botaoCom('Es urgente.'));
    expect(handlePlayAudio).toHaveBeenCalledWith('Es urgente.', 'es-ES');
  });

  it('as frases de urgência não se repetem no bloco da farmácia', () => {
    const urg = new Set(BODY_URGENT.map((q) => q.es));
    expect(BODY_QUESTIONS.filter((q) => urg.has(q.es))).toEqual([]);
    montar();
    // Com a faixa fechada, nenhuma delas está na tela.
    for (const q of BODY_URGENT) expect(screen.queryByText(q.es)).toBeNull();
    expect(screen.getByText(BODY_QUESTIONS[0].es)).toBeTruthy();
  });

  it('a ordem: como dói, sintomas gerais, desde quando, partes, farmácia', () => {
    montar();
    const titulos = [...document.querySelectorAll('h2')].map((h) => h.textContent);
    expect(titulos).toEqual([t('bodyWhereHurts'), t('bodyHowFeel'), t('bodyDuration'), t('bodyPart'), t('bodyPhrases')]);
  });

  it('o destino em cima e o português embaixo, inclusive na duração', () => {
    montar();
    for (const [es, pt] of [['me duele', 'dói'], ['fiebre', 'febre'], ['ayer', 'ontem'], ['la rodilla', 'o joelho']]) {
      const b = botaoCom(es);
      const txt = b.textContent ?? '';
      expect(txt, es).toContain(pt);
      expect(txt.indexOf(es), es).toBeLessThan(txt.indexOf(pt));
    }
  });

  it('sintoma geral troca a frase; tocar numa parte volta para a dor', () => {
    montar();
    fireEvent.click(botaoCom('mareo'));
    expect(screen.getByText('Tengo mareos.')).toBeTruthy();
    expect(screen.getByText('Estou com tontura.')).toBeTruthy();
    expect(botaoCom('mareo').getAttribute('aria-pressed')).toBe('true');
    // Sem parte na frase, a linha do nome esvazia.
    expect(screen.queryByText('A cabeça')).toBeNull();

    fireEvent.click(botaoCom('la barriga'));
    expect(screen.getByText('Me duele la barriga.')).toBeTruthy();
    expect(screen.getByText('A barriga')).toBeTruthy();
  });

  it('o boneco tem 12 marcadores, e o do meio do tronco é a barriga', () => {
    const { container } = montar();
    const alvos = container.querySelectorAll(`svg circle[r="${MARKER_HIT_R}"]`);
    expect(alvos).toHaveLength(12);
    const meio = [...alvos].find((c) => c.getAttribute('cx') === '100' && c.getAttribute('cy') === '170')!;
    fireEvent.click(meio);
    expect(screen.getByText('Me duele la barriga.')).toBeTruthy();
  });

  it('fora da Espanha a frase sai na língua do destino', () => {
    montar(US);
    expect(screen.getByText('My head hurts.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: t('bodyUrgent') }));
    expect(screen.getByText('I need a doctor.')).toBeTruthy();
  });
});

describe('PARTE 5 — o código da tela', () => {
  const fonte = ler('modules/BodyModule.tsx');

  it('nada de letra miúda nem português apagado', () => {
    expect(fonte).not.toMatch(/text-\[(9|10|11|12|13)px\]/);
    expect(fonte).not.toMatch(/\btext-xs\b/);
    expect(fonte).not.toMatch(/opacity-(45|50|60|70)/);
  });

  it('passa a dica à moldura', () => {
    expect(fonte).toContain("dica={t('hintBody')}");
  });

  it('as chaves usadas existem nos oito blocos', () => {
    const usadas = [...fonte.matchAll(/\bt\('([A-Za-z0-9_]+)'\)/g)].map((m) => m[1]);
    expect(usadas.length).toBeGreaterThan(5);
    const faltando: string[] = [];
    for (const [locale, bloco] of Object.entries(translations))
      for (const k of usadas) if (!(bloco as Record<string, string>)[k]) faltando.push(`${locale}/${k}`);
    expect(faltando).toEqual([]);
  });
});
