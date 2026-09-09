/**
 * Escolha da voz do Text-to-Speech.
 *
 * A regra é absoluta: o app nunca fala com uma voz cujo idioma-base seja
 * diferente do destino. Antes, quando o aparelho não tinha a voz do idioma,
 * `utterance.voice` ficava nulo e o motor caía na voz padrão do sistema — em
 * Windows ou Android configurados em português ou espanhol, normalmente
 * `en-US`. O resultado era texto italiano lido com voz americana, ou seja, o
 * app ensinando a pronúncia errada em silêncio.
 *
 * `utterance.lang` sozinho não resolve: é só uma dica, que o motor ignora
 * quando não existe voz correspondente instalada.
 *
 * A seleção mora aqui, separada do React, porque é a regra que precisa de
 * teste exaustivo — e porque o diagnóstico de vozes precisa responder
 * exatamente o mesmo que o botão de áudio.
 */

export interface VoiceLike {
  name: string;
  lang: string;
}

export type VoiceLookup<V> =
  | { status: 'ok'; voice: V }
  /** O aparelho tem vozes, mas nenhuma do idioma pedido. */
  | { status: 'missing' }
  /** `getVoices()` veio vazio: o motor ainda não inicializou. Não é ausência. */
  | { status: 'unknown' };

export type VoiceStatus = VoiceLookup<never>['status'];

/** `pt_BR`, `PT-br` e `pt-BR` são a mesma coisa para o motor; aqui também. */
const normalizeLang = (lang: string): string => lang.replace(/_/g, '-').trim().toLowerCase();

/**
 * Subtag de idioma. Comparação por segmento, nunca por prefixo de string:
 * `startsWith` faria `it` casar com um hipotético `ita-…` e é justamente o
 * tipo de aproximação que produziu o defeito original.
 */
const baseOf = (lang: string): string => normalizeLang(lang).split('-')[0];

/**
 * Vozes com estes nomes soam melhor. É desempate DENTRO do idioma certo —
 * qualidade nominal nunca promove uma voz de outro idioma.
 */
const PREFERRED_NAME = /google|natural|premium|enhanced|siri/i;

const best = <V extends VoiceLike>(list: V[]): V => list.find((v) => PREFERRED_NAME.test(v.name)) ?? list[0];

/**
 * Ordem: locale exato (`it-IT`) → mesmo idioma em outra região (`it`, `it-CH`)
 * → `missing`. Nunca outro idioma.
 */
export const pickVoice = <V extends VoiceLike>(voices: readonly V[], lang: string): VoiceLookup<V> => {
  if (!voices || voices.length === 0) return { status: 'unknown' };

  const base = baseOf(lang);
  if (!base) return { status: 'missing' };

  // Filtra por idioma ANTES de qualquer preferência de qualidade. É esta linha
  // que torna impossível devolver voz de outro idioma.
  const sameLanguage = voices.filter((v) => baseOf(v.lang) === base);
  if (sameLanguage.length === 0) return { status: 'missing' };

  const wanted = normalizeLang(lang);
  const exact = sameLanguage.filter((v) => normalizeLang(v.lang) === wanted);

  return { status: 'ok', voice: best(exact.length ? exact : sameLanguage) };
};
