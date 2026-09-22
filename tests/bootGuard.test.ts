import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A rede de segurança do boot não pode sumir num refactor do `index.html`.
 *
 * Ela existe por um defeito real: o app ficou com tela branca num celular
 * porque um service worker antigo servia um `index.html` que apontava para um
 * bundle que o deploy seguinte já tinha apagado. O `chunkRecovery`, o
 * `pwaUpdate` e a `ErrorBoundary` não ajudaram em nada — os três moram DENTRO
 * do bundle que não carregou.
 *
 * Por isso cada asserção aqui guarda uma propriedade que, sozinha, invalida o
 * conserto: se o script sair do inline, se vier depois do módulo, ou se perder
 * qualquer uma das três travas, ele deixa de funcionar exatamente no cenário
 * para o qual foi escrito.
 */

const html = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');

describe('rede de segurança do boot', () => {
  it('está no index.html e é inline', () => {
    expect(html, 'o guarda sumiu do index.html').toContain('th_boot_recuperado');
    // Precisa sobreviver à falha que conserta. Um arquivo externo seria mais um
    // pedido de rede, e o pedido de rede é justamente o que está falhando.
    const guarda = html.slice(html.indexOf('th_boot_recuperado'));
    const abertura = html.lastIndexOf('<script', html.indexOf('th_boot_recuperado'));
    expect(html.slice(abertura, abertura + 40), 'o guarda deixou de ser inline').not.toMatch(/src=/);
    expect(guarda.length).toBeGreaterThan(0);
  });

  it('roda ANTES do módulo do app', () => {
    // O 404 do bundle dispara `error` de forma assíncrona: se o listener for
    // registrado depois, o evento já passou e só o relógio de 8s salva.
    const guarda = html.indexOf('th_boot_recuperado');
    const modulo = html.indexOf('type="module"');
    expect(guarda, 'guarda não encontrado').toBeGreaterThan(-1);
    expect(modulo, 'script de módulo não encontrado').toBeGreaterThan(-1);
    expect(guarda, 'o guarda passou a vir depois do módulo').toBeLessThan(modulo);
  });

  it('não empurrou o charset para fora dos 1024 primeiros bytes', () => {
    // O comentário do guarda tem ~1,5 KB. Posto antes do charset, ele joga a
    // declaração para além da janela em que o navegador a procura, e o app
    // inteiro é em português.
    const ate = Buffer.from(html, 'utf8').indexOf(Buffer.from('<meta charset', 'utf8'));
    expect(ate, '<meta charset> não encontrado').toBeGreaterThan(-1);
    expect(ate, 'o charset saiu dos primeiros 1024 bytes').toBeLessThan(1024);
  });

  it('mantém as três travas', () => {
    // Uma vez por aba: sem isto, causa que não seja cache vira laço de recarga.
    expect(html, 'perdeu a trava de uma tentativa por aba').toContain('sessionStorage');
    // Só online: o app é offline-first, e offline esse cache pode ser a única
    // cópia que existe. Limpá-lo trocaria tela branca temporária por app morto.
    expect(html, 'perdeu a trava de só agir online').toContain('navigator.onLine');
    // Só com a raiz vazia: app montado não se mexe.
    expect(html, 'perdeu a trava de só agir com #root vazio').toContain('childElementCount');
  });

  it('limpa os dois lados: service worker e caches', () => {
    expect(html, 'deixou de desregistrar o service worker').toContain('unregister');
    expect(html, 'deixou de limpar o Cache Storage').toContain('caches.delete');
    expect(html, 'deixou de recarregar depois de limpar').toMatch(/location\.reload/);
  });
});
