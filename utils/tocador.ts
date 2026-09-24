import { pickVoice, googleTtsUrl, partirParaTts } from './speech';
import { definirAudio } from './audioState';

/**
 * Quem toca o som do app. Um só, para o app inteiro.
 *
 * A regra de sempre continua aqui dentro, intacta: **a região tem que bater**.
 * Voz do aparelho só se for da região exata; senão o MP3 do Google com o locale
 * completo; senão silêncio com explicação. Ver `utils/speech.ts`.
 *
 * O que este arquivo acrescenta é o comportamento do botão, que antes não
 * existia:
 *
 * 1. **Um áudio de cada vez.** Sem voz no aparelho o som vem da rede e demora um
 *    pouco; a pessoa achava que não tinha tocado direito, tocava de novo, e o app
 *    criava um segundo áudio por cima do primeiro. Saíam duas vozes encavaladas.
 *    Agora todo toque para o que estiver tocando antes de começar.
 *
 * 2. **Tocar de novo a MESMA frase em até 15 segundos sai mais devagar.** É o
 *    que a pessoa faz quando não entendeu — e é o mesmo pedido que ela faria ao
 *    atendente ("¿Puede repetir más despacio?"). O terceiro toque volta ao
 *    normal: alterna. O MP3 já baixado é reaproveitado, sem ir à rede de novo.
 *    Só conta se o som do toque anterior SAIU: tocar de novo enquanto o MP3
 *    ainda carrega (em 3G, ela acha que não tocou) é tentar outra vez, e a
 *    primeira vez que ela ouve a frase não pode sair arrastada.
 *
 * 3. **Frase longa vira pedaços**, tocados em sequência. O endpoint recusa texto
 *    acima de 200 caracteres, e a recusa virava um falso "sem internet".
 *
 * 4. **O estado vai para `audioState`**, e é de lá que o cartão da frase sabe
 *    que deve pulsar. Nenhum módulo recebe prop nova.
 *
 * Fica fora do `App` para poder ser testado sem montar o app inteiro.
 */

export type MotivoSemSom = 'sem-rede' | 'falhou';

/** Janela em que o segundo toque na mesma frase conta como "repete devagar". */
export const REPETIR_DEVAGAR_MS = 15_000;
/** Voz do aparelho: ritmo normal (levemente abaixo de 1, como sempre foi) e devagar. */
export const TAXA_VOZ = 0.95;
export const TAXA_VOZ_DEVAGAR = 0.7;
/** MP3 devagar. Abaixo de 0.75 o áudio do Google começa a arrastar as vogais. */
export const TAXA_MP3_DEVAGAR = 0.75;
/**
 * Quanto esperar o MP3 começar. Era 3,5s, e em 3G ruim — a rede de quem usa
 * este app — isso desistia de áudio que ia chegar. Agora o botão pulsa enquanto
 * carrega, então esperar um pouco mais não é mais esperar no escuro.
 */
export const ESPERA_AUDIO_MS = 6000;

interface Toque {
  chave: string;
  quando: number;
  lento: boolean;
  /** O elemento do MP3, para o segundo toque reaproveitar. `null` na voz do aparelho. */
  audio: HTMLAudioElement | null;
  urls: string[] | null;
  falhou: boolean;
  /**
   * O som começou de fato: evento `playing` do MP3, ou a fala entregue ao motor
   * do aparelho. Enquanto for `false`, ela ainda não ouviu nada.
   */
  saiu: boolean;
}

export interface OpcoesTocador {
  /** Lido a cada toque: a rede pode cair entre um toque e outro. */
  online: () => boolean;
  /** O som não saiu. Quem chama abre a folha "Sem som agora". */
  aoFicarSemSom: (texto: string, lang: string, motivo: MotivoSemSom) => void;
  /** Relógio injetável, para teste. */
  agora?: () => number;
}

export interface Tocador {
  tocar: (texto: string, lang: string) => void;
  parar: () => void;
}

/** Rede de segurança da voz do aparelho: alguns motores Android nunca disparam `end`. */
const duracaoEstimada = (texto: string, taxa: number) => Math.max(4000, (texto.length * 90) / taxa + 2000);

/** O `Audio` de mentira dos testes não tem `removeEventListener`; o de verdade tem. */
const tirarOuvinte = (alvo: HTMLAudioElement, evento: string, f: () => void) => {
  try { alvo.removeEventListener(evento, f); } catch { /* elemento sem a API */ }
};

export const criarTocador = ({ online, aoFicarSemSom, agora = Date.now }: OpcoesTocador): Tocador => {
  /** Cada toque abre uma sessão; evento de sessão velha é ignorado. */
  let sessao = 0;
  let limpar: (() => void) | null = null;
  let audioAtual: HTMLAudioElement | null = null;
  let ultimo: Toque | null = null;

  const soltar = () => {
    const f = limpar;
    limpar = null;
    f?.();
  };

  const parar = () => {
    sessao += 1;
    soltar();
    if (audioAtual) {
      try { audioAtual.pause(); } catch { /* já parado */ }
    }
    try { window.speechSynthesis?.cancel(); } catch { /* sem motor */ }
    definirAudio('parado');
  };

  const tocar = (texto: string, lang: string) => {
    const momento = agora();
    const chave = `${lang}|${texto}`;
    const anterior = ultimo;
    // A mesma frase, há pouco, e sem falha: o MP3 dela pode ser reaproveitado.
    const mesmaFrase = !!anterior
      && !anterior.falhou
      && anterior.chave === chave
      && momento - anterior.quando <= REPETIR_DEVAGAR_MS;
    // Só conta como "repete" se o toque anterior SAIU. Se ele falhou, ou se
    // ainda estava carregando, o segundo toque é uma nova tentativa, não um
    // pedido de devagar — ela ainda nem ouviu.
    const repetida = mesmaFrase && anterior!.saiu;
    const lento = repetida ? !anterior!.lento : false;

    parar();
    const minha = sessao;
    const vale = () => minha === sessao;

    const toque: Toque = { chave, quando: momento, lento, audio: null, urls: null, falhou: false, saiu: false };
    ultimo = toque;

    const terminar = () => {
      if (!vale()) return;
      soltar();
      definirAudio('parado');
    };

    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
    // Reconsulta o motor a cada toque: a lista pode ter chegado depois do último render.
    const lookup = synth ? pickVoice(synth.getVoices(), lang) : ({ status: 'missing' } as const);

    const falarNoSistema = (voice: SpeechSynthesisVoice | null): boolean => {
      if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return false;
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = lang;
      utterance.rate = lento ? TAXA_VOZ_DEVAGAR : TAXA_VOZ;
      if (voice) utterance.voice = voice;
      utterance.onend = terminar;
      utterance.onerror = terminar;
      const seguro = window.setTimeout(terminar, duracaoEstimada(texto, utterance.rate));
      limpar = () => window.clearTimeout(seguro);
      definirAudio('falando', texto);
      synth.speak(utterance);
      // A voz do aparelho não tem download: entregue ao motor, ela sai. Alguns
      // motores Android nem disparam `start`, então não dá para esperar por ele.
      toque.saiu = true;
      return true;
    };

    const avisar = (motivo: MotivoSemSom) => {
      toque.falhou = true;
      definirAudio('parado');
      aoFicarSemSom(texto, lang, motivo);
    };

    /** Último recurso. Nunca fala com voz de região diferente. */
    const degradar = (motivo: MotivoSemSom) => {
      // Lista vazia: o motor não sabe dizer o que tem, então não há prova de
      // voz errada. Definir só o `lang` é o que o Android respeita.
      if (lookup.status === 'unknown' && falarNoSistema(null)) return;
      avisar(motivo);
    };

    // 1. Voz da região exata instalada: fala já. Offline, instantâneo, correto.
    if (lookup.status === 'ok') { falarNoSistema(lookup.voice as SpeechSynthesisVoice); return; }

    // 2. Sem a voz certa no aparelho: busca o áudio com o sotaque certo.
    if (!online()) { degradar('sem-rede'); return; }
    if (typeof Audio === 'undefined') { degradar('falhou'); return; }

    const pedacos = partirParaTts(texto);
    const urls = pedacos.map((p) => googleTtsUrl(p, lang)).filter((u): u is string => !!u);
    if (!urls.length || urls.length !== pedacos.length) { degradar('falhou'); return; }
    toque.urls = urls;

    // O segundo toque reaproveita o MESMO elemento: o MP3 já está baixado (ou
    // baixando — tocar de novo durante o carregamento não recomeça o download).
    const mesmaGravacao = mesmaFrase
      && !!anterior!.audio
      && !anterior!.falhou
      && anterior!.urls?.join('\n') === urls.join('\n');

    // `play()` sai daqui de dentro do gesto do toque, que é o que o navegador de
    // celular exige. E é UM elemento só, trocando de `src` entre os pedaços: o
    // iPhone só deixa tocar sem gesto um elemento que já tocou com gesto.
    const audio = mesmaGravacao ? anterior!.audio! : new Audio(urls[0]);
    toque.audio = audio;
    audioAtual = audio;

    const taxa = lento ? TAXA_MP3_DEVAGAR : 1;
    // `defaultPlaybackRate` também: trocar o `src` devolve `playbackRate` ao padrão.
    const ajustarTaxa = () => {
      try { audio.defaultPlaybackRate = taxa; audio.playbackRate = taxa; } catch { /* sem suporte */ }
    };

    if (mesmaGravacao) {
      if (urls.length > 1 && audio.src !== urls[0]) audio.src = urls[0];
      else { try { audio.currentTime = 0; } catch { /* ainda sem metadados */ } }
    }
    ajustarTaxa();

    let indice = 0;
    let comecou = false;
    let limite: number | undefined;

    const falhar = () => {
      if (!vale()) return;
      toque.falhou = true;
      soltar();
      try { audio.pause(); } catch { /* já parado */ }
      // Rede pendurada ou recusa não pode virar silêncio sem explicação.
      if (comecou) avisar('falhou');
      else degradar('falhou');
    };

    const aoTocar = () => {
      if (!vale()) return;
      comecou = true;
      toque.saiu = true;
      window.clearTimeout(limite);
      definirAudio('falando', texto);
    };

    const aoTerminar = () => {
      if (!vale()) return;
      indice += 1;
      if (indice < urls.length) {
        audio.src = urls[indice];
        ajustarTaxa();
        limite = window.setTimeout(falhar, ESPERA_AUDIO_MS);
        audio.play().then(aoTocar, falhar);
        return;
      }
      terminar();
    };

    audio.addEventListener('playing', aoTocar);
    audio.addEventListener('ended', aoTerminar);
    audio.addEventListener('error', falhar);
    limpar = () => {
      window.clearTimeout(limite);
      tirarOuvinte(audio, 'playing', aoTocar);
      tirarOuvinte(audio, 'ended', aoTerminar);
      tirarOuvinte(audio, 'error', falhar);
    };

    definirAudio('carregando', texto);
    limite = window.setTimeout(falhar, ESPERA_AUDIO_MS);
    // A promessa de `play()` resolve quando o som começa de fato; é o mesmo
    // sinal do evento `playing`, e os dois caminhos convergem em `aoTocar`.
    audio.play().then(aoTocar, falhar);
  };

  return { tocar, parar };
};
