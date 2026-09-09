import React, { useState } from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationItem } from '../components/TranslationItem';
import { LanguagePanel } from '../components/LanguagePanel';
import { CategorySheet } from '../components/CategorySheet';
import { useDialog } from '../hooks/useDialog';
import { translations } from '../translations';
import { COUNTRIES, PHARMACY_CATEGORIES } from '../constants';
import type { TranslationItem as Item } from '../types';

/**
 * Acessibilidade funcional: teclado, foco, semântica e estado.
 *
 * O que estes testes trancam vinha da auditoria: os cards eram `div` com
 * `onClick` (0 de 25 alcançáveis pelo teclado), o painel de idiomas não era um
 * diálogo, e vários botões só de ícone não tinham nome nenhum.
 */

const BR = COUNTRIES.find((c) => c.code === 'br')!;
const ES = COUNTRIES.find((c) => c.code === 'es')!;
const t = (key: string) => (translations['pt-BR'] as Record<string, string>)[key] || key;

beforeAll(() => { Element.prototype.scrollIntoView = vi.fn(); });
afterEach(() => cleanup());

// ---------------------------------------------------------------- cards

const item: Item = {
  key: 'produce/fruits/Abacate',
  source_term: 'Abacate',
  translated_term: 'Aguacate',
  image: '',
  category: 'produce',
  subCategory: 'fruits',
};

const Card = ({ onToggle }: { onToggle?: () => void } = {}) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <TranslationItem
      item={item}
      onPlayAudio={vi.fn()}
      onPlayPhrase={vi.fn()}
      nativeCountry={BR}
      targetCountry={ES}
      isInShoppingList={false}
      isChecked={false}
      isFavorite={false}
      isExpanded={expanded}
      onToggleExpand={() => { setExpanded((v) => !v); onToggle?.(); }}
      onToggleShoppingListItem={vi.fn()}
      onToggleFavorite={vi.fn()}
      highlighted={false}
      onHighlightDone={vi.fn()}
      t={t}
      isSpeakerLocked={false}
      isConversationLocked={false}
      theme={{ color: 'bg-red-600', textColor: 'text-red-600' }}
      onOpenPlan={vi.fn()}
    />
  );
};

const gatilho = () => screen.getByRole('button', { name: /Abacate/ });

describe('1-2 — o card existe para o teclado', () => {
  it('o gatilho é um <button> de verdade, não uma div com onClick', () => {
    render(<Card />);
    expect(gatilho().tagName).toBe('BUTTON');
  });

  it('o Tab alcança o card', async () => {
    const user = userEvent.setup();
    render(<Card />);
    await user.tab();
    expect(document.activeElement).toBe(gatilho());
  });

  it('Enter abre o card', async () => {
    const user = userEvent.setup();
    render(<Card />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(gatilho().getAttribute('aria-expanded')).toBe('true');
  });

  it('Espaço abre o card', async () => {
    const user = userEvent.setup();
    render(<Card />);
    await user.tab();
    await user.keyboard(' ');
    expect(gatilho().getAttribute('aria-expanded')).toBe('true');
  });

  it('anuncia o estado recolhido/expandido e aponta para o painel', async () => {
    const user = userEvent.setup();
    render(<Card />);
    const botao = gatilho();
    expect(botao.getAttribute('aria-expanded')).toBe('false');

    const painelId = botao.getAttribute('aria-controls');
    expect(painelId).toBeTruthy();
    expect(document.getElementById(painelId!)).toBeTruthy();

    await user.click(botao);
    expect(gatilho().getAttribute('aria-expanded')).toBe('true');
  });

  it('o nome do card vem do próprio conteúdo, sem rótulo duplicado', () => {
    render(<Card />);
    // aria-labelledby aponta para os dois termos: "Abacate Aguacate"
    expect(gatilho().textContent).toContain('Abacate');
    expect(gatilho().textContent).toContain('Aguacate');
  });

  it('todo IDREF de aria-labelledby/aria-controls existe de verdade', () => {
    const { container } = render(<Card />);
    for (const el of container.querySelectorAll('[aria-labelledby], [aria-controls]')) {
      for (const attr of ['aria-labelledby', 'aria-controls']) {
        for (const id of (el.getAttribute(attr) ?? '').split(' ').filter(Boolean)) {
          expect(container.ownerDocument.getElementById(id), `${attr} aponta para "${id}", que não existe`).toBeTruthy();
        }
      }
    }
  });

  it('a restrição entra no nome do card, para quem navega só por Tab', () => {
    render(
      <TranslationItem
        item={{ ...item, availability: { es: { exists: 'not-authorized' } } }}
        onPlayAudio={vi.fn()} onPlayPhrase={vi.fn()} nativeCountry={BR} targetCountry={ES}
        isInShoppingList={false} isChecked={false} isFavorite={false} isExpanded={false}
        onToggleExpand={vi.fn()} onToggleShoppingListItem={vi.fn()} onToggleFavorite={vi.fn()}
        highlighted={false} onHighlightDone={vi.fn()} t={t}
        isSpeakerLocked={false} isConversationLocked={false}
        theme={{ color: 'bg-red-600', textColor: 'text-red-600' }} onOpenPlan={vi.fn()} isPharmacy
      />,
    );
    // O nome acessível precisa carregar o estado: senão o Tab anuncia só o
    // termo e a pessoa perde a restrição.
    expect(screen.getByRole('button', { name: new RegExp(t('pharmacyNotAuthorized')) })).toBeTruthy();
  });

  it('não há botão dentro de botão', () => {
    render(<Card />);
    for (const b of screen.getAllByRole('button')) {
      expect(b.querySelector('button'), 'botão aninhado é HTML inválido').toBeNull();
    }
  });

  it('os controles internos continuam independentes e nomeados', async () => {
    const user = userEvent.setup();
    render(<Card />);
    const estrela = screen.getByRole('button', { name: t('favorites') });
    expect(estrela.getAttribute('aria-pressed')).toBe('false');

    // clicar na estrela não abre o card
    await user.click(estrela);
    expect(gatilho().getAttribute('aria-expanded')).toBe('false');

    for (const nome of [t('listenPronunciation'), t('askForItem'), t('sayYouWantItem')]) {
      expect(screen.getByRole('button', { name: nome })).toBeTruthy();
    }
  });

  it('todo botão do card tem nome acessível', () => {
    render(<Card />);
    for (const b of screen.getAllByRole('button')) {
      const nome = b.getAttribute('aria-label') || b.textContent?.trim();
      expect(nome, `botão sem nome: ${b.outerHTML.slice(0, 80)}`).toBeTruthy();
    }
  });
});

// ------------------------------------------------------- painel de idiomas

const Painel = ({ onClose = vi.fn() }: { onClose?: () => void }) => (
  <LanguagePanel
    isOpen
    onClose={onClose}
    nativeCountry={BR}
    targetCountry={ES}
    onNativeChange={vi.fn()}
    onTargetChange={vi.fn()}
    options={COUNTRIES}
    t={t}
    theme={{ color: 'bg-red-600', textColor: 'text-red-600', hex: '#dc2626' }}
  />
);

describe('4-8 — LanguagePanel é um diálogo acessível', () => {
  it('tem role dialog, aria-modal e nome', () => {
    render(<Painel />);
    const dialogo = screen.getByRole('dialog');
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    expect(dialogo.getAttribute('aria-label')).toBe(t('languageSettings'));
  });

  it('o foco entra no diálogo, no país já escolhido', async () => {
    render(<Painel />);
    await waitFor(() => {
      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
    });
    expect((document.activeElement as HTMLElement).getAttribute('aria-pressed')).toBe('true');
  });

  it('Escape fecha', async () => {
    const onClose = vi.fn();
    render(<Painel onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('o botão de fechar tem nome', () => {
    render(<Painel />);
    expect(screen.getByRole('button', { name: t('close') })).toBeTruthy();
  });

  it('a bandeira selecionada é anunciada com aria-pressed', () => {
    render(<Painel />);
    const brasil = screen.getAllByRole('button', { name: 'Brasil' });
    // Brasil é o nativo escolhido; no grupo de destino ele fica desabilitado.
    expect(brasil.some((b) => b.getAttribute('aria-pressed') === 'true')).toBe(true);

    const espanha = screen.getAllByRole('button', { name: 'Espanha' });
    expect(espanha.some((b) => b.getAttribute('aria-pressed') === 'true')).toBe(true);

    const franca = screen.getAllByRole('button', { name: 'França' });
    expect(franca.every((b) => b.getAttribute('aria-pressed') === 'false')).toBe(true);
  });

  it('os dois seletores são grupos nomeados', () => {
    render(<Painel />);
    const grupos = screen.getAllByRole('group');
    expect(grupos).toHaveLength(2);
    const nomes = grupos.map((g) => document.getElementById(g.getAttribute('aria-labelledby')!)?.textContent);
    expect(nomes[0]).toContain(t('myLanguage'));
    expect(nomes[1]).toContain(t('iAmIn'));
  });

  it('o Tab não escapa do diálogo', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>fora antes</button>
        <Painel />
        <button>fora depois</button>
      </>,
    );
    const dialogo = screen.getByRole('dialog');
    await waitFor(() => expect(dialogo.contains(document.activeElement)).toBe(true));

    for (let i = 0; i < 25; i++) {
      await user.tab();
      expect(dialogo.contains(document.activeElement), 'o foco vazou do diálogo').toBe(true);
    }
  });
});

describe('7 — o foco volta para quem abriu', () => {
  const Abridor = () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>abrir</button>
        {open && <Painel onClose={() => setOpen(false)} />}
      </>
    );
  };

  it('fechar com Escape devolve o foco ao botão que abriu', async () => {
    const user = userEvent.setup();
    render(<Abridor />);
    const abrir = screen.getByRole('button', { name: 'abrir' });
    await user.click(abrir);

    await waitFor(() => expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true));
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(document.activeElement).toBe(abrir));
  });
});

describe('CategorySheet mantém o comportamento após passar a usar o hook', () => {
  const Sheet = ({ onClose = vi.fn() }: { onClose?: () => void }) => (
    <CategorySheet
      isOpen
      onClose={onClose}
      categories={PHARMACY_CATEGORIES}
      selectedName="painFever"
      onSelect={vi.fn()}
      theme={{ color: 'bg-emerald-700', textColor: 'text-emerald-700', hex: '#047857' }}
      t={t}
    />
  );

  it('continua sendo diálogo, com Esc e foco na categoria atual', async () => {
    const onClose = vi.fn();
    render(<Sheet onClose={onClose} />);

    const dialogo = screen.getByRole('dialog');
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    await waitFor(() => expect(dialogo.contains(document.activeElement)).toBe(true));
    expect((document.activeElement as HTMLElement).getAttribute('aria-current')).toBe('true');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('useDialog — o comportamento que o modal de instalação reaproveita', () => {
  const Modal = ({ onClose }: { onClose: () => void }) => {
    const ref = useDialog(true, onClose);
    return (
      <div ref={ref} role="dialog" aria-modal="true" aria-label="instalar">
        <button>um</button>
        <button>dois</button>
      </div>
    );
  };

  it('Escape aciona o fechamento', () => {
    const onClose = vi.fn();
    render(<Modal onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('o foco entra no primeiro focável', async () => {
    render(<Modal onClose={vi.fn()} />);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'um' })));
  });
});

// ------------------------------------------------- verificações de marcação

describe('3 e 9 — marcação verificada na fonte', () => {
  const ler = (p: string) => fs.readFileSync(path.resolve(__dirname, '..', p), 'utf8');

  it('o modal de instalação declara diálogo, nome e fechar nomeado', () => {
    const app = ler('App.tsx');
    const modal = app.slice(app.indexOf('showInstallModal && ('));
    expect(modal).toContain('role="dialog"');
    expect(modal).toContain('aria-modal="true"');
    expect(modal).toContain('aria-labelledby={installTitleId}');
    expect(modal).toContain("aria-label={t('close')}");
    expect(app).toContain('useDialog(showInstallModal');
  });

  it('nenhum botão só de ícone ficou sem nome', () => {
    const arquivos = ['components/ModuleLayout.tsx', 'components/LanguagePanel.tsx',
                      'components/CategorySheet.tsx', 'components/TranslationItem.tsx'];
    const semNome: string[] = [];
    for (const f of arquivos) {
      // Comentários JSX contêm a palavra "<button>" em prosa; sem tirá-los o
      // scanner acusa marcação que não existe.
      const fonte = ler(f).replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
      for (const bloco of fonte.matchAll(/<button\b[\s\S]*?>[\s\S]*?<\/button>/g)) {
        const b = bloco[0];
        const abertura = b.slice(0, b.indexOf('>') + 1);
        const corpo = b.slice(b.indexOf('>') + 1);
        const temNome = /aria-label|aria-labelledby/.test(abertura);
        // `<img alt="País">` dentro do botão também é nome acessível válido.
        const temTexto = /\{t\(|\{title\}|\{panelTitle\}|alt=\{|>\s*\p{L}{2,}/u.test(corpo);
        if (!temNome && !temTexto) semNome.push(`${f}: ${abertura.slice(0, 70)}`);
      }
    }
    expect(semNome).toEqual([]);
  });

  it('o zoom não está bloqueado', () => {
    const viewport = ler('index.html').match(/name="viewport" content="([^"]*)"/)![1];
    expect(viewport).not.toContain('user-scalable=no');
    expect(viewport).not.toContain('maximum-scale');
    expect(viewport, 'viewport-fit=cover deve ser preservado').toContain('viewport-fit=cover');
  });

  it('a alça do painel deslizante é um botão nomeado, não uma div', () => {
    const layout = ler('components/ModuleLayout.tsx');
    expect(layout).not.toMatch(/<div[^>]*rounded-full cursor-pointer[^>]*onClick/);
    expect(layout).toMatch(/<button[\s\S]{0,220}rounded-full mb-3/);
  });
});
