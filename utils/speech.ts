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
