import React from 'react';
import { HomeIcon } from './Icons';
import { ShareButton } from './ShareButton';
import type { Country } from '../types';
import { playSound } from '../utils/soundUtils';
import { useGestoAprendido } from '../utils/audioState';

/**
 * A moldura dos dez módulos generativos.
 *
 * Nasceu de um defeito anotado: o cabeçalho existia em DEZ cópias idênticas,
 * variando só a chave do título (AGENTS.md 8.17). Mexer nele significava mexer em
 * dez arquivos, e era assim que saíam de sincronia. Aqui é um.
 *
 * ---------------------------------------------------------------------------
 * A BANDA FIXA (`pinned`) — e é a razão de a moldura existir hoje
 * ---------------------------------------------------------------------------
 * Fica ENTRE o cabeçalho e a área de rolagem, e não rola. É onde mora a frase que
 * o módulo monta, mais as abas de quem as tem.
 *
 * O problema que ela resolve: a frase rolava junto com o resto, então quem descia
 * para trocar uma palavra parava de ver o que estava montando — e ver a frase se
 * formar É o módulo. No "Onde dói" o boneco tem uns 420px, então o cartão já
 * começava quase fora da tela.
 *
 * Por que banda, e não `position: sticky`: o `space-y-4` do contêiner injeta margem
 * no elemento grudado; o cartão de Acessórios da Maquiagem vive dentro de uma
 * `<section>` curta e descolaria quase na hora; e `scrollIntoView` passaria a mirar
 * pontos cobertos. A banda não tem nenhum desses problemas — está fora do contêiner
 * de rolagem, e por isso não depende de onde o cartão está no JSX.
 *
 * ---------------------------------------------------------------------------
 * NÃO HÁ BARRA DE BAIXO, e isso foi uma volta atrás deliberada
 * ---------------------------------------------------------------------------
 * Houve uma, com o botão redondo da bandeira, copiada do Supermercado. Ela só se
 * justificava se os slots laterais tivessem função — e em nove dos dez módulos não
 * tinham. Viraram 96px de nada em troca de um botão que já cabia no canto do
 * cabeçalho, e com a banda fixa em cima o preço ficou alto demais. O par de
 * bandeiras voltou para o cabeçalho, onde sempre esteve.
 *
 * ---------------------------------------------------------------------------
 * A DICA E A LINHA DE GESTO — o topo da rolagem
 * ---------------------------------------------------------------------------
 * Todo módulo funciona do mesmo jeito (escolher embaixo, a frase muda em cima,
 * tocar para ouvir), e isso não estava dito em lugar nenhum. A frase já aparecia
 * pronta e parecia texto fixo para ler.
 *
 * - `dica`: uma linha por módulo, dizendo PARA QUE ele serve. Sempre à vista,
 *   16px, primeira coisa da rolagem.
 * - A linha de gesto: igual nos dez, tingida com a cor do módulo, e só até a
 *   pessoa tocar num alto-falante pela primeira vez — aí ela já aprendeu e a
 *   linha some para sempre. A moldura não recebe prop para isso: lê a marca que
 *   o handler de áudio do `App` grava (`utils/audioState`).
 *
 * As duas ficam na rolagem e não na banda fixa de propósito: a banda já disputa
 * altura com a frase, e dica é coisa que se lê uma vez.
 *
 * A linha de gesto promete que "a frase lá em cima muda". Onde a banda não tem
 * frase (na Limpeza, "A patroa diz" e "Combinar" só têm lista), a promessa
 * contradiz a tela: ela toca, nada muda em cima, e acha que o app travou. Por
 * isso o módulo pode desligá-la naquele modo com `gesto={false}`.
 */

export type ShellTheme = { color: string; textColor: string; hex: string; borderColor: string };

interface ModuleShellProps {
  title: string;
  theme: ShellTheme;
  t: (key: string) => string;
  nativeCountry: Country;
  targetCountry: Country;
  onGoHome: () => void;
  onOpenLanguageModal: () => void;
  onOpenShare: () => void;
  /** A frase montada, e as abas de quem as tem. Não rola. */
  pinned?: React.ReactNode;
  /** Para que serve o módulo, numa linha. Primeiro item da rolagem, em 16px. */
  dica?: string;
  /**
   * A linha de gesto vale nesta tela? Padrão sim. `false` onde a banda não tem
   * frase que muda com o toque.
   */
  gesto?: boolean;
  children: React.ReactNode;
}

export const ModuleShell: React.FC<ModuleShellProps> = ({
  title,
  theme,
  t,
  nativeCountry,
  targetCountry,
  onGoHome,
  onOpenLanguageModal,
  onOpenShare,
  pinned,
  dica,
  gesto = true,
  children,
}) => {
  const gestoAprendido = useGestoAprendido();

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 flex flex-col h-[100dvh] relative overflow-hidden font-sans">
      {/* Sem o canto arredondado quando há banda: os dois se encostam e viram um
          bloco só de topo, distinguidos pela tonalidade e não por um vão. */}
      <header
        className={`flex-shrink-0 text-white shadow-lg z-30 ${pinned ? '' : 'rounded-b-3xl'}`}
        style={{ background: `linear-gradient(to bottom, ${theme.hex}, ${theme.hex}e6)` }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-4 max-w-3xl mx-auto">
          <button
            onClick={() => { playSound('click'); onGoHome(); }}
            aria-label={t('a11yHome')}
            className="hit p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 tap active:scale-90"
          >
            <HomeIcon className="w-5 h-5" />
          </button>
          <h1 className="flex-1 mx-2 text-center font-bold text-2xl uppercase tracking-tight truncate">{title}</h1>
          {/* Cluster da direita. `gap-2` não é escolha estética: a área de toque de
              `.hit` é 44px centrada no botão, e com menos espaço que isso as duas se
              sobrepõem e uma para de responder. */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ShareButton onClick={onOpenShare} t={t} variant="onColor" />
            <button
              onClick={() => { playSound('click'); onOpenLanguageModal(); }}
              aria-label={t('languageSettings')}
              className="hit p-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 tap active:scale-90"
            >
              <div className="flex items-center -space-x-2">
                <img src={nativeCountry.image} alt="" aria-hidden="true" className="w-6 h-6 rounded-full border border-white object-cover" />
                <img src={targetCountry.image} alt="" aria-hidden="true" className="w-6 h-6 rounded-full border border-white object-cover" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* A banda. `flex-shrink-0` para ela não ser espremida quando a lista embaixo
          for longa, e `z-20` para ficar acima da rolagem sem cobrir o cabeçalho.
          O fundo vai de ponta a ponta — sem margem lateral, sem borda — e é um tom
          CLARO da cor do próprio módulo (`${hex}14`, uns 8%). Assim ela se encosta no
          cabeçalho e o bloco de cima vira uma peça só, com duas tonalidades: dá para
          ver onde acaba o menu e começa a frase, sem inventar uma terceira cor de
          fundo na tela. Na cor da página ela não parecia camada nenhuma — parecia
          conteúdo que some cortado no meio ao rolar. A sombra fecha o recado. */}
      {pinned && (
        <div
          /*
           * `max-h-[45dvh]` com rolagem própria, e isto é correção de defeito, não
           * enfeite: a banda é `flex-shrink-0` dentro de um contêiner de altura
           * travada, então com o texto ampliado ela crescia sem limite. Medido a
           * 320×640: com a raiz em 24px a banda ia a 492px e sobravam 60px de
           * rolagem; a 32px ia a 734px — mais alta que a tela — e o topo da frase
           * ficava inalcançável, que é falha de WCAG 1.4.4. Com o teto, a rolagem
           * fica sempre com mais da metade da tela e a frase continua alcançável,
           * rolando por dentro da banda.
           */
          className="flex-shrink-0 z-20 w-full px-4 pt-3 pb-3 rounded-b-3xl shadow-[0_10px_18px_-8px_rgba(15,23,42,0.35)] max-h-[45dvh] overflow-y-auto overscroll-contain"
          style={{ backgroundColor: `${theme.hex}14` }}
        >
          <div className="max-w-3xl mx-auto w-full space-y-3">{pinned}</div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto pb-10">
        <div className="px-4 pt-3 max-w-3xl mx-auto w-full space-y-4">
          {gesto && !gestoAprendido && (
            <p
              className="rounded-2xl px-4 py-3 text-base leading-snug text-gray-800 dark:text-slate-100"
              style={{ backgroundColor: `${theme.hex}14` }}
              dir="auto"
            >
              {t('gestureHint')}
            </p>
          )}
          {dica && (
            <p className="text-base leading-snug text-gray-700 dark:text-slate-200" dir="auto">{dica}</p>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};
