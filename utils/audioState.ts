import { useSyncExternalStore } from 'react';

/**
 * O que o áudio está fazendo agora, num lugar só.
 *
 * Quem toca o som é o `App` (`handlePlayAudio`); quem precisa MOSTRAR que o som
 * está saindo é o cartão da frase, que mora dentro de dez módulos diferentes.
 * Passar isso por prop obrigaria os dez a receber e repassar um campo novo — e é
 * exatamente assim que os dez saem de sincronia. Um store minúsculo resolve sem
 * prop nenhuma: o `App` escreve, quem quiser lê.
 *
 * Três coisas moram aqui, e nenhuma é estado de tela:
 *
 * 1. **O estado do som** (`parado`, `carregando`, `falando`) e de QUAL frase.
 *    O cartão compara com a própria frase para saber se é ele que pulsa.
 * 2. **A glosa da última frase tocada.** Quando o som falha, a folha "Sem som
 *    agora" oferece mostrar a frase na tela — e a glosa só o cartão conhece.
 * 3. **A marca "já tocou num alto-falante"**, que apaga a linha de gesto da
 *    moldura. Fica no `localStorage` porque vale entre aberturas.
 */

export type StatusAudio = 'parado' | 'carregando' | 'falando';

interface EstadoAudio {
  status: StatusAudio;
  /** A frase inteira que está tocando (ou carregando). `null` quando parado. */
  texto: string | null;
}

let estado: EstadoAudio = { status: 'parado', texto: null };
const ouvintes = new Set<() => void>();

const avisarOuvintes = () => ouvintes.forEach((f) => f());

const assinar = (f: () => void) => {
  ouvintes.add(f);
  return () => { ouvintes.delete(f); };
};

export const lerAudio = (): EstadoAudio => estado;

export const definirAudio = (status: StatusAudio, texto: string | null = null): void => {
  const novoTexto = status === 'parado' ? null : texto;
  if (estado.status === status && estado.texto === novoTexto) return;
  estado = { status, texto: novoTexto };
  avisarOuvintes();
};

/** Assinatura crua, para quem precisa reagir sem re-renderizar (o `App`). */
export const assinarAudio = assinar;

/**
 * `true` enquanto ESTA frase está carregando ou saindo. Devolve primitivo, e é
 * isso que deixa o `useSyncExternalStore` estável: só re-renderiza o cartão
 * cuja resposta mudou, não os dez.
 */
export const useFalando = (texto: string): boolean =>
  useSyncExternalStore(
    assinar,
    () => estado.status !== 'parado' && estado.texto === texto,
    () => false,
  );

// ---------------------------------------------------------------------------
// A glosa da última frase
// ---------------------------------------------------------------------------

let ultimaFrase: { texto: string; glosa: string | null } | null = null;

/** O cartão anota a própria glosa logo antes de pedir o som. */
export const anotarGlosa = (texto: string, glosa: string | null): void => {
  ultimaFrase = { texto, glosa };
};

/** A glosa da frase, se foi o cartão que pediu o som dela. */
export const glosaDe = (texto: string): string | null =>
  ultimaFrase && ultimaFrase.texto === texto ? ultimaFrase.glosa : null;

// ---------------------------------------------------------------------------
// "Já aprendeu o gesto": tocou num alto-falante pelo menos uma vez
// ---------------------------------------------------------------------------

export const GESTO_KEY = 'aquisediz:gestoAprendido';

/**
 * Reserva em memória para quando o `localStorage` recusa gravar (modo privado,
 * cota cheia): a linha some nesta abertura mesmo assim, e volta na próxima —
 * que é o melhor que dá para fazer sem armazenamento.
 */
let gestoEmMemoria = false;

const lerGesto = (): boolean => {
  if (gestoEmMemoria) return true;
  try {
    return localStorage.getItem(GESTO_KEY) === '1';
  } catch {
    return false;
  }
};

/** Chamado pelo handler de áudio do `App`, a cada toque num alto-falante. */
export const marcarGestoAprendido = (): void => {
  if (lerGesto()) return;
  try {
    localStorage.setItem(GESTO_KEY, '1');
  } catch {
    gestoEmMemoria = true;
  }
  avisarOuvintes();
};

/** A moldura lê a marca daqui; não recebe prop para isso. */
export const useGestoAprendido = (): boolean =>
  useSyncExternalStore(assinar, lerGesto, () => true);
