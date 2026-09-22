/**
 * Cada módulo vira um endereço de verdade.
 *
 * O app era uma tela só: abrir um módulo mexia em `useState` e a URL nunca
 * mudava. Isso custava três coisas ao mesmo tempo, e as três doem no uso real.
 *
 * 1. **A medição ficava cega.** O plano Hobby da Vercel não inclui Custom
 *    Events — só contagem de página. Sem endereço por módulo, o painel mostra
 *    uma linha só (`/`) para sempre, e a pergunta que motivou ligar a medição
 *    ("qual módulo as pessoas abrem?") não tem como ser respondida. Com rota,
 *    cada abertura é uma visita a um caminho distinto, e a quebra por caminho
 *    já vem pronta no painel — de graça, sem passar para o plano pago.
 *
 * 2. **O botão voltar do Android fechava o app.** Sem nada no histórico, quem
 *    estava dentro de um módulo e apertava voltar não ia para o hub: saía. Num
 *    PWA instalado isso parece falha do app.
 *
 * 3. **Não dava para mandar alguém direto ao ponto.** O crescimento previsto é
 *    por indicação em grupo de mensagem, e um link para a Limpeza vale mais num
 *    grupo de faxina do que o link do hub, onde a pessoa ainda precisa procurar.
 *
 * **Os nomes são em espanhol**, pela mesma razão que o `APP_NAME` é: é a língua
 * do país onde todo mundo está, e a única que os quatro públicos — brasileiro,
 * marroquino, ucraniano e lituano — têm em comum. A URL é lida por quem recebe
 * o link, não por quem programa.
 *
 * Um endereço publicado é um compromisso: mudar um destes quebra links já
 * compartilhados, que é justamente o que não se pode quebrar num app que cresce
 * por indicação. Acrescentar é livre; renomear, não.
 */

/**
 * A lista canônica de módulos do app. Vive aqui, e não no `App.tsx`, porque o
 * mapa de rotas é o que precisa cobrir todos eles: assim o TypeScript acusa um
 * módulo novo que tenha esquecido o endereço, em vez de deixá-lo invisível para
 * a medição.
 */
export type ModuleKey =
  | 'supermarket' | 'pharmacy' | 'location' | 'directions'
  | 'numbers' | 'body' | 'cafe' | 'pronouns' | 'sizes' | 'makeup' | 'eldercare' | 'housecleaning';

/** `Record` completo: um módulo novo sem rota não compila. */
export const ROTA_POR_MODULO: Record<ModuleKey, string> = {
  supermarket: 'supermercado',
  pharmacy: 'farmacia',
  location: 'donde-esta',
  directions: 'direcciones',
  numbers: 'numeros',
  body: 'donde-duele',
  cafe: 'cafe',
  pronouns: 'pronombres',
  sizes: 'tallas',
  makeup: 'maquillaje',
  eldercare: 'cuidar-mayores',
  housecleaning: 'limpieza',
};

const MODULO_POR_ROTA = Object.fromEntries(
  Object.entries(ROTA_POR_MODULO).map(([modulo, rota]) => [rota, modulo as ModuleKey]),
) as Record<string, ModuleKey | undefined>;

/** O caminho que a barra de endereço mostra. O hub é a raiz. */
export const caminhoDoModulo = (modulo: ModuleKey | null): string =>
  modulo ? `/${ROTA_POR_MODULO[modulo]}` : '/';

/**
 * Lê o módulo a partir do caminho. Devolve `null` para a raiz **e para qualquer
 * coisa desconhecida**: um endereço antigo ou digitado errado abre o hub, que é
 * a tela que sempre faz sentido, em vez de tela vazia ou erro.
 *
 * Tolera barra final e maiúsculas porque link colado em mensagem chega torto.
 */
export const moduloDaRota = (caminho: string): ModuleKey | null => {
  const limpo = caminho.replace(/^\/+|\/+$/g, '').toLowerCase();
  return limpo ? MODULO_POR_ROTA[limpo] ?? null : null;
};
