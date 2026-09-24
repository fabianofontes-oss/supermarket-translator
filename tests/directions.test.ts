import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import DirectionsModule from '../modules/DirectionsModule';
import {
  DIR_STEPS, DIR_PLACE_STEPS, COMPASS, DIR_GO_TO, DIR_QUESTIONS, DIR_PLACES, DIR_DISTANCES,
  GRID, START, MAX_STEPS, ROTATORIA, DIAGONAIS, applyStep, type Text,
} from '../modules/directions/data/directionsData';
import { SUPPORTED_LANGS } from '../modules/location/data/locationData';
import { COUNTRIES } from '../constants';
import { translations } from '../translations';
import { GESTO_KEY, glosaDe } from '../utils/audioState';

/**
 * Módulo "Pedir caminho" (Direções).
 *
 * Tranca as escolhas da auditoria de usabilidade de 23/09/2026:
 *
 *  1. A tela diz quem fala o quê: os passos são o que VÃO TE DIZER, as
 *     perguntas são o que VOCÊ pergunta. Com o percurso vazio, o cartão fixo é
 *     uma linha só, e ela diz isso.
 *  2. "Como chego a…" serve a sete lugares, com a contração já feita.
 *  3. A bússola volta a seguir o boneco depois de um passo.
 *  4. Chegar é vitória, o teto de passos é teto, e "Começar de novo" é texto.
 *  5. Nenhuma frase concorda com o gênero de quem fala (nem de quem ouve).
 *  6. O boneco começa no meio do bairro, e todos os passos valem no 1º toque.
 *  7. Piso de 14px em tudo o que ela lê.
 */

const t = (key: string) => (translations['pt-BR'] as Record<string, string>)[key] || key;
const pais = (code: string) => COUNTRIES.find((c) => c.code === code)!;
const TEMA = { color: 'bg-amber-700', textColor: 'text-amber-700 dark:text-amber-300', hex: '#b45309', borderColor: 'border-amber-700' };

const montar = (opts: { destino?: string } = {}) => {
  const handlePlayAudio = vi.fn();
  render(createElement(DirectionsModule, {
    nativeCountry: pais('br'),
    targetCountry: pais(opts.destino ?? 'es'),
    t,
    theme: TEMA,
    onGoHome: vi.fn(),
    onOpenLanguageModal: vi.fn(),
    onOpenShare: vi.fn(),
    handlePlayAudio,
  }));
  return { handlePlayAudio };
};

/**
 * O botão de um passo, pelo rótulo em espanhol (o de destino na Espanha).
 *
 * Acha o rótulo e sobe até o botão, em vez de `getByRole` com nome: aquele
 * recalcula o nome acessível de todos os botões da tela (mapa, bússola, fichas)
 * a cada chamada, e os dez toques seguidos do teste do teto passavam de 5 s.
 * `getByText` continua falhando se o rótulo sumir ou aparecer em dois botões.
 */
const passo = (rotulo: string) =>
  screen.getByText(rotulo, { selector: 'button > span' }).closest('button')!;

/** Os quatro pontos da bússola, na ordem N, E, S, O. Só eles têm aria-pressed. */
const pontosDaBussola = () => screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-pressed'));

beforeEach(() => {
  localStorage.clear();
  // A linha de gesto da moldura não é assunto daqui.
  localStorage.setItem(GESTO_KEY, '1');
});
afterEach(() => cleanup());

// ------------------------------------------------------------------ dados

/** Todo texto do módulo, com o nome de onde veio para a falha dizer. */
const TODOS: [string, Text][] = [
  ...DIR_STEPS.flatMap((s): [string, Text][] => [[`passo ${s.key} (rótulo)`, s.labels], [`passo ${s.key}`, s.phrases]]),
  ...DIR_PLACE_STEPS.flatMap((s): [string, Text][] => [[`passo ${s.key} (rótulo)`, s.labels], [`passo ${s.key}`, s.phrases]]),
  ...COMPASS.map((c): [string, Text] => [`bússola ${c.key}`, c.names]),
  ...DIR_GO_TO.map((g): [string, Text] => [`como chego ${g.key}`, g.phrase]),
  ...DIR_QUESTIONS.map((q, i): [string, Text] => [`pergunta ${i}`, q]),
  ...DIR_PLACES.map((v, i): [string, Text] => [`vocabulário ${i}`, v.names]),
  ...DIR_DISTANCES.map((v, i): [string, Text] => [`distância ${i}`, v.names]),
];

describe('dados — os oito idiomas', () => {
  it('todo texto tem os oito idiomas, sem célula vazia', () => {
    for (const [onde, texto] of TODOS) {
      for (const l of SUPPORTED_LANGS) {
        expect(texto[l]?.trim(), `${onde} / ${l}`).toBeTruthy();
      }
    }
  });
});

describe('dados — nenhuma frase concorda com o gênero de quem fala ou ouve', () => {
  // Forma com gênero marcado, por idioma. Em espanhol e português o que flexiona
  // é o adjetivo depois de estar ("estoy perdido"); o particípio do perfeito
  // não ("me he perdido", "ya has llegado"), e por isso fica de fora.
  //
  // Fronteira por `\p{L}` e não por `\b`: o `\b` só conhece letra ASCII, e aí
  // "arrivé" (termina em é) e todo o cirílico escapariam da varredura.
  const palavra = (formas: string) => new RegExp(`(?<!\\p{L})(?:${formas})(?!\\p{L})`, 'iu');
  const PROIBIDO: [keyof Text, RegExp][] = [
    ['es', palavra('est(?:oy|ás|á|amos) (?:perdid|confundid|maread|cansad)[oa]s?')],
    ['pt', palavra('est(?:ou|á|amos) (?:perdid|confus|tont|cansad)[oa]s?')],
    ['fr', palavra('perdue?s?|arrivée?s?')],
    ['it', palavra('pers[oa]|arrivat[oa]')],
    ['uk', palavra('заблукав|заблукала|прибув|прибула')],
  ];

  it('a varredura pega as formas antigas (prova de que ela enxerga)', () => {
    const antigas: [keyof Text, string][] = [
      ['es', 'Estoy perdido.'], ['pt', 'Estou perdido.'], ['fr', "Vous êtes arrivé. C'est juste là."],
      ['it', 'Sei arrivato.'], ['uk', 'Я заблукав.'],
    ];
    for (const [l, frase] of antigas) {
      expect(PROIBIDO.some(([pl, re]) => pl === l && re.test(frase)), frase).toBe(true);
    }
  });

  it('nenhum passo, pergunta ou "como chego" carrega forma com gênero', () => {
    for (const [onde, texto] of TODOS) {
      for (const [l, re] of PROIBIDO) {
        expect(texto[l], `${onde} / ${l}`).not.toMatch(re);
      }
    }
  });

  it('"me perdi" existe, e sem gênero', () => {
    const perdida = DIR_QUESTIONS.find((q) => q.es === 'Me he perdido.');
    expect(perdida).toBeDefined();
    expect(perdida!.pt).toBe('Me perdi.');
  });
});

describe('dados — as perguntas', () => {
  it('existe a frase para pedir que falem mais devagar', () => {
    const devagar = DIR_QUESTIONS.find((q) => q.es === '¿Puede hablar más despacio?');
    expect(devagar?.pt).toBe('Pode falar mais devagar?');
  });

  it('"como chego" não se repete na lista de perguntas', () => {
    for (const q of DIR_QUESTIONS) expect(q.es).not.toMatch(/^¿Cómo llego/);
  });
});

describe('dados — "Como chego a…"', () => {
  it('são os sete lugares, cada um com seu desenho', () => {
    expect(DIR_GO_TO.map((g) => g.key)).toEqual(['pharmacy', 'health', 'metro', 'bus', 'station', 'bank', 'supermarket']);
    expect(new Set(DIR_GO_TO.map((g) => g.emoji)).size).toBe(DIR_GO_TO.length);
  });

  it('frase inteira, com a contração já feita em cada língua de destino', () => {
    for (const g of DIR_GO_TO) {
      expect(g.phrase.es, g.key).toMatch(/^¿Cómo llego (a la|al) .+\?$/);
      expect(g.phrase.es, g.key).not.toMatch(/\ba el\b/);
      expect(g.phrase.pt, g.key).toMatch(/^Como chego (à|ao) .+\?$/);
      expect(g.phrase.en, g.key).toMatch(/^How do I get to the .+\?$/);
      expect(g.phrase.fr, g.key).toMatch(/^Comment aller (à la |à l'|au ).+ \?$/);
      expect(g.phrase.fr, g.key).not.toMatch(/\bà le\b|\bà les\b/);
      expect(g.phrase.it, g.key).not.toMatch(/\ba (il|la|lo)\b/);
    }
  });
});

describe('dados — palavras que ensinavam errado', () => {
  it('"da la vuelta" é meia-volta em português, e não "dê a volta"', () => {
    const volta = DIR_STEPS.find((s) => s.key === 'back')!;
    expect(volta.labels.pt).toBe('meia-volta');
    expect(volta.phrases.pt).toBe('Dê meia-volta.');
  });

  it('o desenho da meia-volta não se repete no vocabulário', () => {
    const volta = DIR_STEPS.find((s) => s.key === 'back')!;
    for (const v of [...DIR_PLACES, ...DIR_DISTANCES]) expect(v.emoji, v.names.pt).not.toBe(volta.icon);
  });
});

describe('dados — o mapa', () => {
  it('o boneco começa no meio do bairro, olhando para o norte', () => {
    expect(START).toEqual({ x: (GRID - 1) / 2, y: (GRID - 1) / 2, heading: 0 });
    expect(START.x).toBeGreaterThan(0);
    expect(START.y).toBeLessThan(GRID - 1);
  });

  it('do começo, todos os passos de andar valem no primeiro toque', () => {
    for (const s of DIR_STEPS.filter((s) => !s.arrive)) {
      expect(applyStep(START, s), s.key).not.toBeNull();
    }
  });

  it('depois de uma meia-volta, dá para seguir em frente', () => {
    const volta = applyStep(START, DIR_STEPS.find((s) => s.key === 'back')!)!;
    expect(applyStep(volta.next, DIR_STEPS.find((s) => s.key === 'straight')!)).not.toBeNull();
  });

  it('a rotatória e a bifurcação ficam a um passo do começo', () => {
    const direita = applyStep(START, DIR_STEPS.find((s) => s.key === 'right')!)!;
    expect({ x: direita.next.x, y: direita.next.y }).toEqual(ROTATORIA);
    expect(DIAGONAIS.some((d) => (d.a.x === START.x && d.a.y === START.y) || (d.b.x === START.x && d.b.y === START.y))).toBe(true);
  });

  it('o teto do percurso é de dez passos', () => {
    expect(MAX_STEPS).toBe(10);
  });
});

// ------------------------------------------------------------------ tela

describe('tela — quem fala o quê', () => {
  it('usa o título curto e a dica de propósito', () => {
    montar();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(t('dirTitle'));
    expect(screen.getByText(t('hintDirections'))).toBeTruthy();
  });

  it('com o percurso vazio, o cartão fixo é uma linha só, sem botões', () => {
    montar();
    expect(screen.getByText(t('dirEmpty'))).toBeTruthy();
    expect(screen.queryByText(t('dirRoute'))).toBeNull();
    expect(screen.queryByRole('button', { name: t('dirUndo') })).toBeNull();
    expect(screen.queryByRole('button', { name: t('dirClear') })).toBeNull();
  });

  it('com o percurso vazio, a regra dos passos não repete o que o cartão já diz', () => {
    // O cartão fixo já diz "Toque num passo aqui embaixo"; com a linha de gesto
    // e a dica, eram quatro recados iguais empurrando os botões para baixo.
    montar();
    expect(screen.queryByText(t('dirStepsHint'))).toBeNull();
    // Depois do primeiro passo ela volta: é ela que explica por que um passo some.
    fireEvent.click(passo('sigue recto'));
    expect(screen.getByText(t('dirStepsHint'))).toBeTruthy();
  });

  it('os títulos dizem o que ela ouve e o que ela pergunta', () => {
    montar();
    expect(screen.getByText(t('dirSteps'))).toBeTruthy();
    expect(screen.getByText(t('dirQuestions'))).toBeTruthy();
    expect(screen.getByText(t('dirDistances'))).toBeTruthy();
  });

  it('um passo fala a frase e vira o percurso, com Desfazer e "Começar de novo" em texto', () => {
    const { handlePlayAudio } = montar();
    fireEvent.click(passo('sigue recto'));
    expect(handlePlayAudio).toHaveBeenCalledWith('Sigue recto.', 'es-ES');
    expect(screen.getByText(t('dirRoute'))).toBeTruthy();
    expect(screen.getByRole('button', { name: t('dirUndo') })).toBeTruthy();
    expect(screen.getByRole('button', { name: t('dirClear') })).toBeTruthy();
    expect(t('dirClear')).toBe('Começar de novo');

    fireEvent.click(screen.getByRole('button', { name: t('dirClear') }));
    expect(screen.getByText(t('dirEmpty'))).toBeTruthy();
  });
});

describe('tela — "Como chego a…"', () => {
  it('as fichas vêm com o título e falam a frase inteira', () => {
    const { handlePlayAudio } = montar();
    expect(screen.getByText(t('dirGoTo'))).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /¿Cómo llego a la farmacia\?/ }));
    expect(handlePlayAudio).toHaveBeenCalledWith('¿Cómo llego a la farmacia?', 'es-ES');
  });

  it('a glosa fica anotada para a folha "Sem som agora" poder mostrar a frase', () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: /¿Cómo llego al metro\?/ }));
    expect(glosaDe('¿Cómo llego al metro?')).toBe('Como chego ao metrô?');
  });

  it('nos EUA e na França, a mesma ficha na língua de lá', () => {
    const eua = montar({ destino: 'us' });
    fireEvent.click(screen.getByRole('button', { name: /How do I get to the pharmacy\?/ }));
    expect(eua.handlePlayAudio).toHaveBeenCalledWith('How do I get to the pharmacy?', 'en-US');
    cleanup();

    const franca = montar({ destino: 'fr' });
    fireEvent.click(screen.getByRole('button', { name: /Comment aller à la pharmacie \?/ }));
    expect(franca.handlePlayAudio).toHaveBeenCalledWith('Comment aller à la pharmacie ?', 'fr-FR');
  });
});

describe('tela — a bússola segue o boneco', () => {
  it('depois de escolher "Sur" à mão, um passo devolve a bússola ao rumo do boneco', () => {
    montar();
    const [norte, , sul] = pontosDaBussola();
    expect(norte.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(sul);
    expect(pontosDaBussola()[2].getAttribute('aria-pressed')).toBe('true');

    // Virou à direita: o boneco agora olha para o leste.
    fireEvent.click(passo('a la derecha'));
    const depois = pontosDaBussola();
    expect(depois[1].getAttribute('aria-pressed')).toBe('true');
    expect(depois[2].getAttribute('aria-pressed')).toBe('false');
  });

  it('desfazer também devolve a bússola ao boneco', () => {
    montar();
    fireEvent.click(passo('sigue recto'));
    fireEvent.click(pontosDaBussola()[2]);
    fireEvent.click(screen.getByRole('button', { name: t('dirUndo') }));
    expect(pontosDaBussola()[0].getAttribute('aria-pressed')).toBe('true');
  });
});

describe('tela — o fim do percurso não soa como erro', () => {
  it('chegar mostra a vitória, e não "daqui não dá para seguir"', () => {
    montar();
    fireEvent.click(passo('sigue recto'));
    fireEvent.click(passo('has llegado'));
    expect(screen.getByRole('status').textContent).toBe(t('dirArrived'));
    expect(screen.queryByRole('button', { name: /^sigue recto/ })).toBeNull();
  });

  it('dez passos mostram o teto como teto', () => {
    montar();
    for (let i = 0; i < MAX_STEPS; i++) fireEvent.click(passo('da la vuelta'));
    expect(screen.getByRole('status').textContent).toBe(t('dirMaxSteps'));
  });
});

// ------------------------------------------------------------------ letra

describe('letra — piso de 14px', () => {
  const fonte = readFileSync(join(__dirname, '..', 'modules', 'DirectionsModule.tsx'), 'utf8');

  it('nenhum texto abaixo de 14px nem apagado por opacidade', () => {
    expect(fonte).not.toMatch(/\btext-xs\b/);
    expect(fonte).not.toMatch(/text-\[(\d|1[0-3])px\]/);
    expect(fonte).not.toMatch(/\bopacity-70\b/);
  });

  it('a grade de passos tem três colunas, não quatro', () => {
    expect(fonte).toMatch(/grid grid-cols-3 gap-2">\s*\{passosNaTela\.map/);
    expect(fonte).not.toMatch(/grid-cols-4/);
  });
});
