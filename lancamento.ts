import type { Country } from './types';
import type { ModuleKey } from './utils/rotas';

/**
 * Recorte do lançamento. TEMPORÁRIO, por decisão do dono.
 *
 * Por enquanto o app abre só para quem fala **português do Brasil** e está num
 * país de língua **inglesa, espanhola ou francesa**. Supermercado e Farmácia
 * ficam fechados no hub para todo mundo.
 *
 * O resto continua na tela, desativado — não some. Nada do que já foi escrito se
 * perde, e quem abre o painel vê que existe.
 *
 * Tudo que o recorte trava passa por estas três funções. Para abrir de novo,
 * basta afrouxá-las aqui; nenhum outro arquivo guarda a lista.
 *
 * Escolha salva de antes (ex.: "Estou em" Itália) não é apagada: o app cai no
 * padrão enquanto o recorte valer, e a escolha volta sozinha quando ele cair.
 * Ver `useCountryPair`.
 */

/** "Eu falo": códigos de país liberados. */
const ORIGENS_ABERTAS: readonly string[] = ['br'];

/**
 * "Estou em": liberado pelo IDIOMA, não pelo país — inglês cobre Reino Unido e
 * Estados Unidos; espanhol cobre Espanha, Chile e Argentina.
 */
const IDIOMAS_DE_DESTINO_ABERTOS: readonly string[] = ['en', 'es', 'fr'];

/** Fechados no hub, e por link direto também. */
const MODULOS_FECHADOS: readonly ModuleKey[] = ['supermarket', 'pharmacy'];

export const origemAberta = (pais: Country): boolean => ORIGENS_ABERTAS.includes(pais.code);

export const destinoAberto = (pais: Country): boolean =>
  !pais.originOnly && IDIOMAS_DE_DESTINO_ABERTOS.includes(pais.lang.split('-')[0]);

export const moduloFechado = (modulo: ModuleKey): boolean => MODULOS_FECHADOS.includes(modulo);
