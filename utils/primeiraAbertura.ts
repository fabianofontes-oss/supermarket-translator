import type { Country } from '../types';
import { readJSON, safeGetItem, safeSetItem } from './storage';
import { TARGET_COUNTRY_KEY } from '../hooks/useCountryPair';

/**
 * O que o app pergunta e oferece por conta própria, e quando.
 *
 * Duas interrupções moram aqui — a pergunta do país e o convite para guardar o
 * app no celular —, e a regra das duas é a mesma: **não interromper antes de a
 * pessoa saber o que é o app**. A versão anterior abria o convite de instalar
 * no mesmo instante em que o navegador deixava, por cima de uma tela que ela
 * ainda nem tinha visto, e muita gente tocava "Agora não" por reflexo — e aí o
 * convite não voltava nunca.
 *
 * Decisões puras, sem React, para dar para testar sem montar o app.
 */

export const PAIS_PERGUNTADO_KEY = 'aquisediz:paisPerguntado';
export const ABERTURAS_KEY = 'aquisediz:aberturas';
export const INSTALAR_DISPENSADO_KEY = 'aquisediz:instalarDispensadoEm';
/** A chave antiga: dispensa para sempre, sem data. Convertida na primeira leitura. */
const INSTALAR_DISPENSADO_ANTIGO = 'installDismissed';

/** Quem disse "Agora não" é convidado de novo depois de uma semana, não nunca mais. */
export const REPERGUNTAR_INSTALAR_MS = 7 * 24 * 60 * 60 * 1000;

// --------------------------------------------------------------------- país

const isCodeOrNull = (v: unknown): v is string | null => v === null || (typeof v === 'string' && v.length > 0);

/**
 * Há um destino salvo que ainda vale? Um destino gravado antes do recorte (ex.:
 * Itália) não conta: o app caiu no padrão sem avisar, e é exatamente isso que a
 * pergunta existe para evitar.
 */
export const destinoSalvoAberto = (countries: Country[], aberto: (c: Country) => boolean): boolean => {
  const salvo = readJSON<string | null>(TARGET_COUNTRY_KEY, null, isCodeOrNull);
  return !!salvo && countries.some((c) => c.code === salvo && aberto(c));
};

export const jaPerguntouPais = (): boolean => safeGetItem(PAIS_PERGUNTADO_KEY) === '1';
export const marcarPaisPerguntado = (): void => { safeSetItem(PAIS_PERGUNTADO_KEY, '1'); };

/**
 * Pergunta só quando há o que escolher. Com UM destino aberto a pergunta teria
 * uma resposta só, e seria uma interrupção sem propósito.
 */
export const devePerguntarPais = (p: {
  destinosAbertos: number;
  destinoSalvoAberto: boolean;
  jaPerguntou: boolean;
}): boolean => p.destinosAbertos > 1 && !p.destinoSalvoAberto && !p.jaPerguntou;

// ----------------------------------------------------------------- aberturas

/** Soma esta abertura e devolve o total. Chamar uma vez por carga do app. */
export const contarAbertura = (): number => {
  const n = (Number(safeGetItem(ABERTURAS_KEY)) || 0) + 1;
  safeSetItem(ABERTURAS_KEY, String(n));
  return n;
};

// ------------------------------------------------------------------- instalar

/** Quando o convite foi dispensado pela última vez, em ms. `null`: nunca. */
export const lerDispensaInstalar = (agora: number): number | null => {
  const bruto = safeGetItem(INSTALAR_DISPENSADO_KEY);
  const n = bruto === null ? NaN : Number(bruto);
  if (Number.isFinite(n)) return n;

  // A dispensa antiga não tinha data. Conta a partir de agora: quem dispensou
  // antes é convidado de novo daqui a uma semana, e não na hora.
  if (safeGetItem(INSTALAR_DISPENSADO_ANTIGO) !== null) {
    safeSetItem(INSTALAR_DISPENSADO_KEY, String(agora));
    try { localStorage.removeItem(INSTALAR_DISPENSADO_ANTIGO); } catch { /* sem acesso */ }
    return agora;
  }
  return null;
};

export const gravarDispensaInstalar = (agora: number): void => {
  safeSetItem(INSTALAR_DISPENSADO_KEY, String(agora));
};

/**
 * O convite abre quando TUDO isto vale:
 * - dá para instalar (o navegador ofereceu, ou é iPhone fora do app instalado);
 * - não foi dispensado na última semana;
 * - a pessoa já ouviu uma frase nesta abertura, OU esta é a segunda abertura
 *   (ou mais) — ela já sabe o que o app faz;
 * - a tela está livre: no hub, sem a pergunta do país nem outra folha aberta.
 */
export const deveConvidarInstalar = (p: {
  instalavel: boolean;
  dispensadoEm: number | null;
  agora: number;
  ouviuFrase: boolean;
  aberturas: number;
  telaLivre: boolean;
}): boolean =>
  p.instalavel
  && !(p.dispensadoEm !== null && p.agora - p.dispensadoEm < REPERGUNTAR_INSTALAR_MS)
  && (p.ouviuFrase || p.aberturas >= 2)
  && p.telaLivre;
