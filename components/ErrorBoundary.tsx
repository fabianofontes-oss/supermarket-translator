import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Recebe o erro e uma função que limpa o estado de erro e tenta de novo. */
  fallback: (error: Error, reset: () => void) => React.ReactNode;
  /** Quando este valor muda, o erro é esquecido — ex.: o usuário trocou de módulo. */
  resetKey?: string | number;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Barreira de erro do app.
 *
 * Sem ela, um `import()` de chunk que falha derruba a árvore inteira e a tela
 * fica branca, sem nada para o usuário fazer. É o cenário concreto de um deploy
 * novo enquanto uma sessão antiga está aberta.
 *
 * O erro nunca é engolido: vai sempre para o `console.error` com o stack de
 * componentes do React, e a mensagem fica disponível no próprio fallback.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // O stack de componentes é a única pista de onde o erro nasceu; registrar
    // sempre, inclusive em produção — este app não tem telemetria.
    console.error('[ErrorBoundary]', error, info?.componentStack);
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  reset: () => void = () => this.setState({ error: null });

  render() {
    if (this.state.error) return this.props.fallback(this.state.error, this.reset);
    return this.props.children;
  }
}
