/**
 * De onde vem a voz, e qual voz.
 *
 * Regra não negociável do produto: **a região tem que bater**. Texto do Brasil
 * nunca pode sair na voz de Portugal ou de Cabo Verde, italiano nunca pode sair
 * na voz americana. Foi região errada que dois revisores nativos reprovaram.
 *
 * Isso vale para todos os pares: `pt-BR` ≠ `pt-PT`, `es-ES` ≠ `es-US`,
 * `en-GB` ≠ `en-US`. "Mesmo idioma" não basta — e uma versão anterior deste
 * arquivo caía de propósito para outra região, o que era exatamente o defeito.
 *
 * A versão de novembro de 2025, que funcionava, tinha as duas propriedades que
 * este arquivo restaura: o áudio vinha do Google com o **locale completo**
 * (`tl=pt-BR`, não `tl=pt`), e o fallback do sistema exigia igualdade exata de
 * `lang` — nunca substituía região.
 */

export interface VoiceLike {
  name: string;
  lang: string;
}

export type VoiceLookup<V> =
  | { status: 'ok'; voice: V }
  /** O aparelho tem vozes, mas nenhuma da região pedida. */
  | { status: 'missing' }
  /** `getVoices()` veio vazio: o motor ainda não inicializou. Não é ausência. */
  | { status: 'unknown' };

export type VoiceStatus = VoiceLookup<never>['status'];

/** `pt_BR`, `PT-br` e `pt-BR` são a mesma coisa para o motor; aqui também. */
const normalizeLang = (lang: string): string => lang.replace(/_/g, '-').trim().toLowerCase();

/**
 * Vozes com estes nomes soam melhor. É desempate entre vozes da MESMA região —
 * qualidade nominal nunca promove uma voz de região diferente.
 */
const PREFERRED_NAME = /google|natural|premium|enhanced|siri/i;

const best = <V extends VoiceLike>(list: V[]): V => list.find((v) => PREFERRED_NAME.test(v.name)) ?? list[0];

/**
 * Só locale exato. Não existe nível intermediário de "mesmo idioma, outra
 * região": é justamente ele que produz pt-PT lendo pt-BR.
 */
export const pickVoice = <V extends VoiceLike>(voices: readonly V[], lang: string): VoiceLookup<V> => {
  if (!voices || voices.length === 0) return { status: 'unknown' };

  const wanted = normalizeLang(lang);
  if (!wanted) return { status: 'missing' };

  const exact = voices.filter((v) => normalizeLang(v.lang) === wanted);
  if (exact.length === 0) return { status: 'missing' };

  return { status: 'ok', voice: best(exact) };
};

// ---------------------------------------------------------------------------
// Áudio online, com o sotaque certo
// ---------------------------------------------------------------------------

/**
 * O endpoint trunca perto disto. Acima do limite é melhor não pedir do que
 * reproduzir meia frase.
 */
export const TTS_MAX_CHARS = 200;

/**
 * Tamanho de cada pedaço quando a frase é longa demais para um pedido só.
 *
 * Abaixo do limite do endpoint, com folga: acima de 200 caracteres ele recusa, e
 * a recusa aparecia para a pessoa como "sem internet" — mentira. A Maquiagem com
 * todas as escolhas e as frases de emergência passam disso.
 */
export const PEDACO_TTS = 180;

/** Junta pedaços vizinhos enquanto couberem: menos pedidos, menos pausas. */
const juntar = (partes: string[], max: number): string[] => {
  const out: string[] = [];
  let atual = '';
  for (const p of partes) {
    if (!atual) atual = p;
    else if (atual.length + 1 + p.length <= max) atual = `${atual} ${p}`;
    else { out.push(atual); atual = p; }
  }
  if (atual) out.push(atual);
  return out;
};

/*
 * Onde cortar, do corte mais natural para o mais bruto: fim de frase, vírgula,
 * espaço. O corte exige espaço DEPOIS da pontuação, e isso não é detalhe: "4,20"
 * e "3.5" não podem virar dois pedaços.
 *
 * Sem lookbehind (`(?<=…)`) de propósito: iPhone com Safari anterior ao 16.4 não
 * o conhece, e uma regex que ele não entende derruba o arquivo inteiro na carga.
 */
const CORTES: ((s: string) => string[])[] = [
  (s) => s.replace(/([.!?…])\s+/g, '$1\u0000').split('\u0000'),
  (s) => s.replace(/([,;:])\s+/g, '$1\u0000').split('\u0000'),
  (s) => s.split(/\s+/),
];

const quebrar = (parte: string, max: number, nivel: number): string[] => {
  if (parte.length <= max) return [parte];
  if (nivel >= CORTES.length) {
    // Uma "palavra" maior que o pedaço inteiro: só resta cortar no meio.
    const r: string[] = [];
    for (let i = 0; i < parte.length; i += max) r.push(parte.slice(i, i + max));
    return r;
  }
  const pedacos = CORTES[nivel](parte)
    .map((s) => s.trim())
    .filter(Boolean)
    .flatMap((s) => quebrar(s, max, nivel + 1));
  return juntar(pedacos, max);
};

/**
 * Parte a frase em pedaços que o endpoint aceita, para tocar um atrás do outro.
 * Frase curta volta inteira, num pedaço só — que é o caso de quase todas.
 */
export const partirParaTts = (texto: string, max = PEDACO_TTS): string[] => {
  const limpo = texto.trim().replace(/\s+/g, ' ');
  if (!limpo) return [];
  return quebrar(limpo, max, 0);
};

/**
 * Endpoint **não oficial** do Google Translate. Sem contrato: pode ser
 * bloqueado ou mudar sem aviso, e por isso quem chama precisa tratar a falha.
 *
 * `tl` recebe o locale completo — é o que separa português do Brasil de
 * português de Portugal, e é a razão de o áudio soar certo em aparelho que não
 * tem voz nenhuma instalada.
 *
 * Devolve `null` quando não vale a pena tentar.
 */
export const googleTtsUrl = (text: string, lang: string): string | null => {
  const limpo = text.trim();
  if (!limpo || limpo.length > TTS_MAX_CHARS) return null;

  const params = new URLSearchParams({
    ie: 'UTF-8',
    q: limpo,
    tl: lang,
    total: '1',
    idx: '0',
    textlen: String(limpo.length),
    client: 'gtx',
  });
  return `https://translate.google.com/translate_tts?${params.toString()}`;
};
