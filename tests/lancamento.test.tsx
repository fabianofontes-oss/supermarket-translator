import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { COUNTRIES } from '../constants';
import { translations } from '../translations';
import { origemAberta, destinoAberto } from '../lancamento';
import { useCountryPair, NATIVE_COUNTRY_KEY, TARGET_COUNTRY_KEY } from '../hooks/useCountryPair';
import { PAIS_PERGUNTADO_KEY } from '../utils/primeiraAbertura';

/**
 * O recorte do lançamento: só português do Brasil em "Eu falo", só Estados
 * Unidos, França e Espanha em "Estou em", Supermercado e Farmácia fechados.
 *
 * A regra que estes testes trancam é que **nada some**: o que está fora do
 * recorte continua na tela, desativado, para quem testa ver que existe.
 */

const t = (key: string) => (translations['pt-BR'] as Record<string, string>)[key] || key;

beforeEach(() => {
  window.matchMedia = ((): MediaQueryList => ({
    matches: false, media: '', onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent: () => false,
  } as unknown as MediaQueryList)) as unknown as typeof window.matchMedia;
  localStorage.clear();
  // A pergunta "Em que país você está agora?" abre na primeira abertura, e tem
  // teste próprio em `moldura.test.tsx`. Aqui ela já foi respondida.
  localStorage.setItem(PAIS_PERGUNTADO_KEY, '1');
  window.history.replaceState(null, '', '/');
});

afterEach(() => cleanup());

const ladrilho = (labelKey: string) => screen.getByText(t(labelKey)).closest('button')!;

describe('hub', () => {
  it('Supermercado aparece desativado; a Farmácia aparece e aponta para o Onde dói', () => {
    render(<App />);
    expect(ladrilho('supermarketGuide').disabled).toBe(true);
    expect(ladrilho('supermarketGuide').textContent).toContain(t('comingSoon'));
    // A Farmácia continua fechada — não abre o catálogo —, mas deixou de ser um
    // beco sem saída: o toque leva ao Onde dói (ver `moldura.test.tsx`).
    expect(ladrilho('modulePharmacy').disabled).toBe(false);
    expect(ladrilho('modulePharmacy').textContent).toContain(t('useBodyInstead'));
    expect(ladrilho('modulePharmacy').textContent).not.toContain(t('comingSoon'));
    // Os generativos seguem abertos.
    expect(ladrilho('moduleLocation').disabled).toBe(false);
    expect(ladrilho('moduleHouseCleaning').disabled).toBe(false);
  });

  it('link direto para a Farmácia cai no hub e a URL é corrigida', () => {
    window.history.replaceState(null, '', '/farmacia');
    render(<App />);
    expect(screen.getByRole('heading', { name: t('hubTitle') })).toBeTruthy();
    expect(window.location.pathname).toBe('/');
  });
});

describe('painel de idiomas', () => {
  const abrirPainel = async () => {
    const user = userEvent.setup();
    render(<App />);
    // No hub o botão diz onde a pessoa está ("Estou em Espanha"), em vez de
    // duas bandeiras mudas com o nome escondido no aria-label.
    await user.click(screen.getByRole('button', { name: new RegExp(`^${t('iAmIn')}`) }));
    const [eu, estou] = screen.getAllByRole('group');
    const ativos = (grupo: HTMLElement) =>
      within(grupo).getAllByRole('button').filter((b) => !(b as HTMLButtonElement).disabled).map((b) => b.title);
    const todos = (grupo: HTMLElement) => within(grupo).getAllByRole('button').map((b) => b.title);
    return { eu, estou, ativos, todos };
  };

  it('"Eu falo": só o Brasil responde, e os outros onze continuam na tela', async () => {
    const { eu, ativos, todos } = await abrirPainel();
    expect(ativos(eu)).toEqual(['Brasil']);
    expect(todos(eu)).toHaveLength(COUNTRIES.length);
  });

  it('o nome do país fechado continua legível: o cinza é só da bandeira', async () => {
    // Com o recorte, 11 dos 12 nomes de "Eu falo" estão fechados, e o nome é o que
    // ela lê para entender o que existe. Em cinza-claro ele dava uns 2,5:1.
    const { eu } = await abrirPainel();
    const fechados = within(eu).getAllByRole('button').filter((b) => (b as HTMLButtonElement).disabled);
    expect(fechados.length).toBeGreaterThan(0);
    for (const b of fechados) {
      const nome = [...b.querySelectorAll('span')].find((s) => s.textContent === b.title)!;
      expect(nome.className, b.title).toMatch(/\btext-gray-600\b/);
      expect(nome.className, b.title).not.toMatch(/\btext-gray-400\b/);
    }
  });

  it('"Estou em": só Estados Unidos, França e Espanha respondem', async () => {
    const { estou, ativos, todos } = await abrirPainel();
    expect(ativos(estou).sort()).toEqual(['Espanha', 'Estados Unidos', 'França'].sort());
    // Os outros seguem visíveis.
    expect(todos(estou)).toEqual(expect.arrayContaining(
      ['Brasil', 'Chile', 'Argentina', 'Reino Unido', 'Portugal', 'Itália'],
    ));
  });
});

describe('escolha salva de antes do recorte', () => {
  const comRecorte = () => useCountryPair(COUNTRIES, { origem: origemAberta, destino: destinoAberto });

  it('país desativado cai no padrão, sem apagar o que estava gravado', () => {
    localStorage.setItem(NATIVE_COUNTRY_KEY, '"ua"');
    localStorage.setItem(TARGET_COUNTRY_KEY, '"it"');
    const { result } = renderHook(comRecorte);

    expect(result.current.nativeCountry.code).toBe('br');
    expect(result.current.targetCountry.code).toBe('es');
    // Quando o recorte cair, a escolha antiga volta sozinha.
    expect(localStorage.getItem(NATIVE_COUNTRY_KEY)).toBe('"ua"');
    expect(localStorage.getItem(TARGET_COUNTRY_KEY)).toBe('"it"');
  });

  it('país liberado continua valendo', () => {
    localStorage.setItem(TARGET_COUNTRY_KEY, '"fr"');
    const { result } = renderHook(comRecorte);
    expect(result.current.targetCountry.code).toBe('fr');
  });
});
