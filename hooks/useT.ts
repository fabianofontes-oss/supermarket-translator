import { createContext, useContext } from 'react';
import { translations } from '../translations';

/**
 * A função de tradução, disponível sem prop.
 *
 * Existe por um motivo só: o cartão da frase (`PhraseCard`) ganhou o botão
 * "Mostrar" e precisa de um rótulo traduzido, mas ele vive dentro de dez módulos
 * que não lhe passam `t`. Pôr uma prop nova obrigaria os dez a repassá-la. O
 * `App` publica a mesma `t` que já monta — a do idioma de quem lê — e quem
 * precisar lê daqui.
 *
 * Fora do `App` (num teste que monta o cartão sozinho) vale o português do
 * Brasil, que é a interface padrão do app.
 */
const PADRAO = (chave: string): string =>
  (translations['pt-BR'] as Record<string, string>)[chave] || chave;

export const TraducaoContext = createContext<(chave: string) => string>(PADRAO);

export const useT = () => useContext(TraducaoContext);
