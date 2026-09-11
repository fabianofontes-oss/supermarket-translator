import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareSheet } from '../components/ShareSheet';
import { ShareButton } from '../components/ShareButton';
import { translations } from '../translations';
import { SHARE_URL } from '../constants';

/**
 * O que estes testes trancam.
 *
 * O app não tinha como ser passado adiante, e o público cresce por indicação —
 * então as regressões caras aqui não são visuais: são o link do WhatsApp virar
 * um esquema que não abre em metade dos aparelhos, a mensagem sair no idioma
 * errado, o QR apontar para um domínio antigo, e o botão sumir de um módulo
 * novo sem ninguém notar.
 */

const ler = (p: string) => fs.readFileSync(path.resolve(__dirname, '..', p), 'utf8');
const tema = { color: 'bg-red-600', textColor: 'text-red-600', hex: '#c83745' };
const t = (key: string) => (translations['pt-BR'] as Record<string, string>)[key] || key;

const Folha = ({ onClose = vi.fn(), tr = t }: { onClose?: () => void; tr?: (k: string) => string }) => (
  <ShareSheet isOpen onClose={onClose} t={tr} theme={tema} />
);

/** O href de um canal, pelo nome acessível composto com `shareVia`. */
const hrefDe = (marca: string) =>
  screen.getByRole('link', { name: `${t('shareVia')} ${marca}` }).getAttribute('href')!;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, 'clipboard');
});

// -------------------------------------------------------------- diálogo

describe('1-5 — a folha é um diálogo acessível', () => {
  it('tem role dialog, aria-modal e um nome que existe', () => {
    render(<Folha />);
    const dialogo = screen.getByRole('dialog');
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    const id = dialogo.getAttribute('aria-labelledby')!;
    expect(document.getElementById(id)?.textContent).toBe(t('shareTitle'));
  });

  it('Escape fecha, uma vez só', () => {
    const onClose = vi.fn();
    render(<Folha onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('o foco entra no diálogo', async () => {
    render(<Folha />);
    await waitFor(() => {
      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
    });
  });

  it('o Tab não escapa da folha', async () => {
    const user = userEvent.setup();
    render(<Folha />);
    const dialogo = screen.getByRole('dialog');
    await waitFor(() => expect(dialogo.contains(document.activeElement)).toBe(true));

    for (let i = 0; i < 25; i++) {
      await user.tab();
      expect(dialogo.contains(document.activeElement), `escapou na volta ${i}`).toBe(true);
    }
  });

  it('todo botão e todo link têm nome acessível', () => {
    render(<Folha />);
    for (const el of [...screen.getAllByRole('button'), ...screen.getAllByRole('link')]) {
      const nome = el.getAttribute('aria-label') || el.textContent?.trim();
      expect(nome, `sem nome: ${el.outerHTML.slice(0, 80)}`).toBeTruthy();
    }
  });
});

// --------------------------------------------------------------- canais

describe('6-7 — os canais levam ao lugar certo, no idioma certo', () => {
  it('WhatsApp usa wa.me, e nunca o esquema nativo', () => {
    render(<Folha />);
    const href = hrefDe('WhatsApp');

    // `whatsapp://send` não faz nada em desktop nem em webview embutida, e no
    // iOS sem o app mostra erro do Safari. `wa.me` degrada sozinho.
    expect(href.startsWith('https://wa.me/?text=')).toBe(true);
    expect(href).not.toContain('whatsapp://');

    const texto = decodeURIComponent(href.split('text=')[1]);
    expect(texto).toContain(SHARE_URL);
    expect(texto).toContain(t('shareMessage'));
  });

  it('Telegram e Facebook carregam a URL canônica', () => {
    render(<Folha />);
    expect(hrefDe('Telegram')).toContain(encodeURIComponent(SHARE_URL));
    // O sharer.php ignora texto pré-preenchido: título, descrição e imagem
    // saem das metas Open Graph do index.html.
    expect(hrefDe('Facebook')).toBe(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`);
  });

  it('a mensagem sai no idioma NATIVO, não no de destino', () => {
    // Nativo Marrocos, destino Espanha: `t` é construída a partir do país
    // nativo (App.tsx), e a folha nunca pode consultar o de destino.
    const tArabe = (k: string) => (translations['ar-MA'] as Record<string, string>)[k] || k;
    render(<ShareSheet isOpen onClose={vi.fn()} t={tArabe} theme={tema} />);

    const href = screen.getByRole('link', { name: `${tArabe('shareVia')} WhatsApp` }).getAttribute('href')!;
    const texto = decodeURIComponent(href.split('text=')[1]);
    expect(texto).toContain(translations['ar-MA'].shareMessage);
    expect(texto).not.toContain(translations['es-ES'].shareMessage);
  });

  it('a folha não repete a URL: ela vem de SHARE_URL', () => {
    expect(ler('components/ShareSheet.tsx')).not.toContain('https://translator');
  });
});

// --------------------------------------------------------------- copiar

describe('8-9 — copiar o link, com e sem área de transferência', () => {
  it('usa a área de transferência quando existe e anuncia o resultado', async () => {
    // O `userEvent.setup()` instala um stub de clipboard próprio, então o
    // nosso tem que entrar DEPOIS dele, senão é sobrescrito.
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    render(<Folha />);
    await user.click(screen.getByRole('button', { name: t('shareCopyLink') }));

    expect(writeText).toHaveBeenCalledWith(SHARE_URL);
    await screen.findByRole('button', { name: t('shareCopied') });
  });

  it('sem área de transferência não quebra, e a URL continua legível', async () => {
    // Sem `userEvent.setup()` não há stub de clipboard — é exatamente o
    // cenário de `http://192.168.x.x:3000`, a rede local usada para testar no
    // celular, onde o contexto não é seguro e a API moderna não existe.
    Reflect.deleteProperty(navigator, 'clipboard');
    render(<Folha />);

    fireEvent.click(screen.getByRole('button', { name: t('shareCopyLink') }));

    // Caiu no fallback, que também não funciona em jsdom: o botão avisa e a
    // URL segue na tela para ser copiada à mão.
    expect(screen.getByRole('button', { name: t('shareCopyFailed') })).toBeTruthy();
    expect(screen.getByText(SHARE_URL)).toBeTruthy();
  });
});

// -------------------------------------------------- compartilhar nativo

describe('10 — a folha nativa só aparece quando existe', () => {
  it('sem navigator.share, o botão não é renderizado', () => {
    render(<Folha />);
    expect(screen.queryByRole('button', { name: t('shareMoreOptions') })).toBeNull();
  });

  it('com navigator.share, é chamado com a URL canônica', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', Object.assign(Object.create(Object.getPrototypeOf(navigator)), navigator, { share }));

    const user = userEvent.setup();
    render(<Folha />);
    await user.click(screen.getByRole('button', { name: t('shareMoreOptions') }));

    expect(share).toHaveBeenCalledTimes(1);
    expect(share.mock.calls[0][0]).toMatchObject({ url: SHARE_URL, text: t('shareMessage') });
  });

  it('cancelar o compartilhamento não vira rejeição não tratada', async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('cancelado'), { name: 'AbortError' }));
    vi.stubGlobal('navigator', Object.assign(Object.create(Object.getPrototypeOf(navigator)), navigator, { share }));

    const user = userEvent.setup();
    render(<Folha />);
    await user.click(screen.getByRole('button', { name: t('shareMoreOptions') }));
    await new Promise((r) => setTimeout(r, 0));
    expect(share).toHaveBeenCalledTimes(1);
  });
});

// ------------------------------------------------------------------ QR

describe('11 — o QR aponta para a URL canônica', () => {
  it('o SVG commitado declara a mesma URL da constante', () => {
    // Um QR é ilegível em diff. O `<desc>` gravado por scripts/generate-qr.mjs
    // é o que faz trocar de domínio sem regerar o código quebrar a CI, em vez
    // de quebrar o usuário.
    const svg = ler('public/qr-share.svg');
    expect(svg).toContain(`<desc>${SHARE_URL}</desc>`);
  });

  it('o QR é decorativo: quem usa leitor de tela recebe a URL em texto', () => {
    render(<Folha />);
    const img = document.querySelector('img[src="/qr-share.svg"]')!;
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText(SHARE_URL).getAttribute('dir')).toBe('ltr');
  });
});

// ------------------------------------------------------------- presença

describe('12 — o botão está nas nove telas', () => {
  it('nenhum header ficou sem o gatilho', () => {
    // Antídoto para os headers duplicados: um décimo módulo que esqueça o
    // botão não passa na CI.
    const headers = [
      'App.tsx',
      'components/ModuleLayout.tsx',
      'modules/LocationModule.tsx',
      'modules/DirectionsModule.tsx',
      'modules/NumbersModule.tsx',
      'modules/BodyModule.tsx',
      'modules/CafeModule.tsx',
      'modules/PronounsModule.tsx',
      'modules/SizesModule.tsx',
      'modules/MakeupModule.tsx',
    ];
    for (const f of headers) {
      expect(ler(f), `${f} não tem o botão de compartilhar`).toContain('<ShareButton');
    }
  });

  it('o gatilho é um botão nomeado, não um ícone mudo', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ShareButton onClick={onClick} t={t} />);

    const botao = screen.getByRole('button', { name: t('shareApp') });
    expect(botao.className).toContain('hit');
    await user.click(botao);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('as metas Open Graph existem, senão o link chega pelado no WhatsApp', () => {
    const html = ler('index.html');
    for (const tag of ['og:title', 'og:description', 'og:url', 'og:image']) {
      expect(html, `falta ${tag}`).toContain(`property="${tag}"`);
    }
    // og:image relativa não é resolvida por nenhum crawler.
    expect(html).toMatch(/property="og:image" content="https:\/\//);
  });
});
