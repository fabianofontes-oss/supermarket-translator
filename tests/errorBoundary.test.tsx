import React, { Suspense } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import { resetChunkRecovery } from '../utils/chunkRecovery';

/**
 * A ErrorBoundary é o que separa "um módulo não carregou" de "tela branca".
 * Estes testes cobrem os dois lados: o fallback aparece, e ele tem saída.
 */

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  sessionStorage.clear();
  resetChunkRecovery();
  // A ErrorBoundary registra o erro de propósito; silenciar o ruído do teste
  // sem perder a capacidade de afirmar que ela registrou.
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  consoleError.mockRestore();
});

const Explode = ({ boom }: { boom: boolean }) => {
  if (boom) throw new Error('quebrou de propósito');
  return <p>conteúdo normal</p>;
};

const fallback = (error: Error, reset: () => void) => (
  <div>
    <p>{`FALLBACK: ${error.message}`}</p>
    <button onClick={reset}>tentar de novo</button>
  </div>
);

describe('ErrorBoundary', () => {
  it('não interfere quando nada quebra', () => {
    render(
      <ErrorBoundary fallback={fallback}>
        <Explode boom={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('conteúdo normal')).toBeTruthy();
  });

  it('renderiza o fallback em vez de derrubar a árvore', () => {
    render(
      <ErrorBoundary fallback={fallback}>
        <Explode boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('FALLBACK: quebrou de propósito')).toBeTruthy();
  });

  it('o fallback oferece uma ação de recuperação', () => {
    render(
      <ErrorBoundary fallback={fallback}>
        <Explode boom />
      </ErrorBoundary>,
    );
    const botao = screen.getByRole('button', { name: 'tentar de novo' });
    expect(botao).toBeTruthy();
  });

  it('não engole o erro: registra no console com o stack de componentes', () => {
    render(
      <ErrorBoundary fallback={fallback}>
        <Explode boom />
      </ErrorBoundary>,
    );
    const chamada = consoleError.mock.calls.find((c) => c[0] === '[ErrorBoundary]');
    expect(chamada, 'a ErrorBoundary precisa registrar o erro').toBeTruthy();
    expect((chamada![1] as Error).message).toBe('quebrou de propósito');
    expect(typeof chamada![2]).toBe('string'); // componentStack
  });

  it('chama onError com o erro recebido', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Explode boom />
      </ErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe('quebrou de propósito');
  });

  it('resetKey limpa o erro — trocar de módulo tira o fallback da tela', () => {
    const { rerender } = render(
      <ErrorBoundary fallback={fallback} resetKey="pharmacy">
        <Explode boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/FALLBACK/)).toBeTruthy();

    rerender(
      <ErrorBoundary fallback={fallback} resetKey="home">
        <Explode boom={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('conteúdo normal')).toBeTruthy();
  });
});

describe('lazyWithRetry dentro da ErrorBoundary', () => {
  const chunkError = () => new Error('Failed to fetch dynamically imported module: /assets/x.js');

  const montar = (Lazy: React.ComponentType) =>
    render(
      <ErrorBoundary fallback={fallback}>
        <Suspense fallback={<p>carregando</p>}>
          <Lazy />
        </Suspense>
      </ErrorBoundary>,
    );

  it('módulo lazy que carrega normalmente continua funcionando', async () => {
    const reload = vi.fn();
    const Ok = lazyWithRetry(
      async () => ({ default: () => <p>módulo carregado</p> }),
      reload,
    );
    montar(Ok);
    await waitFor(() => expect(screen.getByText('módulo carregado')).toBeTruthy());
    expect(reload).not.toHaveBeenCalled();
  });

  it('falha de chunk: recarrega uma vez e NÃO mostra erro enquanto recarrega', async () => {
    const reload = vi.fn();
    const Falha = lazyWithRetry(() => Promise.reject(chunkError()), reload);
    montar(Falha);

    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    // A promessa fica pendente de propósito: o Suspense segura a tela em vez de
    // piscar o fallback de erro um instante antes da recarga.
    expect(screen.getByText('carregando')).toBeTruthy();
    expect(screen.queryByText(/FALLBACK/)).toBeNull();
  });

  it('falha de chunk depois da recarga: fallback recuperável, sem recarregar de novo', async () => {
    const primeiroReload = vi.fn();
    // Primeira falha gasta a única tentativa da aba.
    montar(lazyWithRetry(() => Promise.reject(chunkError()), primeiroReload));
    await waitFor(() => expect(primeiroReload).toHaveBeenCalledTimes(1));
    cleanup();

    // Segunda falha, mesma aba: agora tem que virar fallback.
    const segundoReload = vi.fn();
    montar(lazyWithRetry(() => Promise.reject(chunkError()), segundoReload));

    await waitFor(() => expect(screen.getByText(/FALLBACK/)).toBeTruthy());
    expect(segundoReload).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'tentar de novo' })).toBeTruthy();
  });

  it('erro interno do componente não vira recarga', async () => {
    const reload = vi.fn();
    const Quebrado = lazyWithRetry(
      () => Promise.reject(new TypeError('x is not a function')),
      reload,
    );
    montar(Quebrado);

    await waitFor(() => expect(screen.getByText(/FALLBACK: x is not a function/)).toBeTruthy());
    expect(reload).not.toHaveBeenCalled();
  });
});
