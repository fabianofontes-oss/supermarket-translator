import { lazy, type ComponentType } from 'react';
import { decideChunkRecovery } from './chunkRecovery';

/**
 * Enquanto a página recarrega não há nada para renderizar, e mostrar o fallback
 * de erro por uma fração de segundo só piscaria na tela. Uma promessa que nunca
 * resolve deixa o `<Suspense>` no estado de carregamento até a recarga acontecer.
 */
const PENDING_RELOAD = new Promise<never>(() => {});

/**
 * `React.lazy` com uma única tentativa automática de recuperação.
 *
 * Falha de carregamento de código → recarrega uma vez (traz o `index.html` novo,
 * com os hashes novos). Qualquer outro erro, ou uma segunda falha na mesma aba,
 * sobe para a ErrorBoundary, que mostra um fallback com ação manual.
 */
export const lazyWithRetry = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  reload: () => void = () => window.location.reload(),
) =>
  lazy(() =>
    factory().catch((error: unknown) => {
      if (decideChunkRecovery(error) === 'reload') {
        reload();
        return PENDING_RELOAD;
      }
      throw error;
    }),
  );
