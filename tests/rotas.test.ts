import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ROTA_POR_MODULO, caminhoDoModulo, moduloDaRota, type ModuleKey } from '../utils/rotas';
import { useModuleRoute } from '../hooks/useModuleRoute';

/**
 * O que estes testes trancam.
 *
 * A rota existe por três motivos, e cada um quebra de um jeito silencioso:
 *
 * - **Medição.** O plano Hobby não tem Custom Events, então o caminho da URL é
 *   a ÚNICA forma de saber qual módulo as pessoas abrem. Um módulo novo sem
 *   rota some do painel sem erro nenhum — parece que ninguém usou.
 * - **Botão voltar.** Sem `popstate`, voltar fecha o app num PWA instalado.
 * - **Link direto.** Endereço publicado é compromisso: renomear quebra link já
 *   compartilhado, e o app cresce por indicação em grupo de mensagem.
 */

const irPara = (caminho: string) => window.history.replaceState(null, '', caminho);

beforeEach(() => irPara('/'));
afterEach(() => vi.restoreAllMocks());

describe('o mapa de rotas', () => {
  it('não tem endereço repetido — dois módulos no mesmo caminho perderiam um', () => {
    const rotas = Object.values(ROTA_POR_MODULO);
    expect(new Set(rotas).size).toBe(rotas.length);
  });

  it('usa só minúsculas, hífen e letras sem acento', () => {
    for (const rota of Object.values(ROTA_POR_MODULO)) {
      expect(rota).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });

  it('vai e volta sem perder o módulo', () => {
    for (const modulo of Object.keys(ROTA_POR_MODULO) as ModuleKey[]) {
      expect(moduloDaRota(caminhoDoModulo(modulo))).toBe(modulo);
    }
  });

  it('o hub é a raiz', () => {
    expect(caminhoDoModulo(null)).toBe('/');
    expect(moduloDaRota('/')).toBeNull();
  });

  it('caminho desconhecido abre o hub, não quebra', () => {
    expect(moduloDaRota('/nao-existe')).toBeNull();
    expect(moduloDaRota('/supermercado/extra')).toBeNull();
  });

  it('tolera barra final e maiúscula — link colado em mensagem chega torto', () => {
    expect(moduloDaRota('/limpieza/')).toBe('housecleaning');
    expect(moduloDaRota('/LIMPIEZA')).toBe('housecleaning');
  });
});

describe('o módulo aberto espelha a URL', () => {
  const livre = () => false;

  it('link direto abre o módulo, não o hub', () => {
    irPara('/cuidar-mayores');
    const { result } = renderHook(() => useModuleRoute(livre));
    expect(result.current.currentModule).toBe('eldercare');
  });

  it('abrir um módulo muda o endereço — é isso que a medição enxerga', () => {
    const { result } = renderHook(() => useModuleRoute(livre));

    act(() => result.current.setCurrentModule('housecleaning'));

    expect(window.location.pathname).toBe('/limpieza');
    expect(result.current.currentModule).toBe('housecleaning');
  });

  it('não empilha entrada no primeiro render — senão o primeiro voltar não sai do lugar', () => {
    irPara('/cafe');
    const push = vi.spyOn(window.history, 'pushState');

    renderHook(() => useModuleRoute(livre));

    expect(push).not.toHaveBeenCalled();
  });

  it('voltar devolve ao hub em vez de fechar o app', () => {
    const { result } = renderHook(() => useModuleRoute(livre));
    act(() => result.current.setCurrentModule('numbers'));
    expect(window.location.pathname).toBe('/numeros');

    // O que o botão voltar do Android provoca.
    act(() => {
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.currentModule).toBeNull();
  });
});

describe('módulo bloqueado não abre por link direto', () => {
  // Origem ucraniana: Supermercado e Farmácia dependem do catálogo.
  const semCatalogo = (m: ModuleKey) => m === 'supermarket' || m === 'pharmacy';

  it('cai no hub e corrige a URL, para o endereço não mentir', () => {
    irPara('/supermercado');
    const { result } = renderHook(() => useModuleRoute(semCatalogo));

    expect(result.current.currentModule).toBeNull();
    expect(window.location.pathname).toBe('/');
  });

  it('os módulos generativos seguem abrindo — são o que resta para essa pessoa', () => {
    irPara('/donde-duele');
    const { result } = renderHook(() => useModuleRoute(semCatalogo));

    expect(result.current.currentModule).toBe('body');
  });
});
