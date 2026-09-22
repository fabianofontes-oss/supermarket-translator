import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * O que estes testes trancam.
 *
 * A medição entrou tarde, depois de o app viver publicado sem nenhuma resposta
 * para "alguém está entrando?". O caro aqui não é a medição quebrar com erro —
 * é ela quebrar em silêncio: o painel fica zerado, e zerado é exatamente o que
 * se espera ver quando ninguém entrou. O defeito se disfarça de resultado.
 *
 * São três armadilhas, todas já encontradas uma vez:
 *
 * 1. O painel da Vercel entrega o trecho de **Next.js** por padrão. Este projeto
 *    é Vite + React: `@vercel/analytics/next` importa `next/navigation` e o
 *    build cai. O caminho certo é `/react`.
 * 2. O rewrite de SPA do `vercel.json` mandava TUDO que não fosse `/assets/`
 *    para o `index.html` — inclusive `/_vercel/insights/script.js`. O navegador
 *    receberia HTML no lugar do script.
 * 3. O `navigateFallback` do service worker faria o mesmo, uma camada abaixo,
 *    para quem já tem o app instalado.
 */

const ler = (p: string) => fs.readFileSync(path.resolve(__dirname, '..', p), 'utf8');

describe('medição: o caminho do script não pode ser sequestrado', () => {
  it('importa de `/react`, nunca de `/next`', () => {
    const entrada = ler('index.tsx');

    expect(entrada).toContain("from '@vercel/analytics/react'");
    // A troca que o painel da Vercel induz e que derruba o build deste projeto.
    expect(entrada).not.toContain('@vercel/analytics/next');
  });

  it('o rewrite do vercel.json não responde por `/_vercel/`', () => {
    const { rewrites } = JSON.parse(ler('vercel.json'));
    const paraIndex = rewrites.find((r: { destination: string }) => r.destination === '/index.html');

    expect(paraIndex).toBeDefined();
    expect(paraIndex.source).toContain('_vercel/');

    // O que o regex precisa fazer na prática, não só como está escrito.
    const regex = new RegExp(`^${paraIndex.source}$`);
    expect(regex.test('/_vercel/insights/script.js')).toBe(false);
    expect(regex.test('/assets/index-abc123.js')).toBe(false);
    // E o que ele NÃO pode deixar de fazer: a navegação do SPA continua caindo
    // no index.html, que é a razão de o rewrite existir.
    expect(regex.test('/qualquer-rota')).toBe(true);
  });

  it('o service worker não responde por `/_vercel/`', () => {
    const config = ler('vite.config.ts');
    const trecho = config.match(/navigateFallbackDenylist:\s*\[(.*?)\]/s);

    expect(trecho).not.toBeNull();
    expect(trecho![1]).toContain('_vercel');
  });
});

describe('medição: ligada só onde o script existe', () => {
  it('não roda sob `capacitor://` — no APK o caminho daria 404', () => {
    const entrada = ler('index.tsx');

    // A guarda é por protocolo: só `http:`/`https:` têm `/_vercel/` servido.
    expect(entrada).toContain("window.location.protocol === 'https:'");
    expect(entrada).toContain('medindoNaWeb && <Analytics />');
  });
});
