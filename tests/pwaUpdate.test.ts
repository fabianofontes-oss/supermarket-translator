import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * O `vite.config.ts` e o `pwaUpdate.ts` precisam concordar, e ninguém
 * verificava isso.
 *
 * Foi assim que o botão "Atualizar" virou botão morto em produção: ligar
 * `skipWaiting: true` no Workbox faz ele PARAR de gerar o ouvinte de mensagem
 * dentro do `sw.js` — o arquivo publicado ficou sem um único
 * `addEventListener`. O `pwaUpdate.ts` seguiu mandando
 * `postMessage({type:'SKIP_WAITING'})` para um ouvinte que não existe mais, e
 * a pessoa tocava em Atualizar sem que nada acontecesse.
 *
 * Nenhum teste pegou porque cada arquivo, sozinho, estava correto. O defeito
 * morava na relação entre os dois — que é exatamente o que se testa aqui.
 */

const raiz = join(__dirname, '..');
const ler = (f: string) => readFileSync(join(raiz, f), 'utf8');

/**
 * Mede CÓDIGO, não prosa. Os dois arquivos documentam esta armadilha em
 * comentário extenso — inclusive citando `SKIP_WAITING` e `controllerchange`
 * para explicar por que sumiram. Sem tirar os comentários, o teste reprova
 * exatamente o arquivo corrigido, que foi o que aconteceu ao escrevê-lo.
 */
const soCodigo = (fonte: string) =>
  fonte.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const viteConfig = soCodigo(ler('vite.config.ts'));
const pwaUpdate = soCodigo(ler('utils/pwaUpdate.ts'));

const semComentarios = viteConfig;
const skipWaitingLigado = /skipWaiting:\s*true/.test(viteConfig);

describe('atualização do PWA: as duas peças concordam', () => {
  it('o modo do Workbox está declarado de forma reconhecível', () => {
    // Se esta asserção falhar, as outras estão medindo o nada.
    expect(semComentarios, 'não achei `skipWaiting` no bloco workbox').toMatch(/skipWaiting:\s*(true|false)/);
  });

  it('com skipWaiting ligado, ninguém manda SKIP_WAITING', () => {
    if (!skipWaitingLigado) return;
    // Com `skipWaiting: true` o `sw.js` gerado não tem ouvinte de `message`.
    // Mandar a mensagem é falar com ninguém — e pior, PARECE que funciona.
    expect(pwaUpdate, 'skipWaiting está ligado, então SKIP_WAITING não tem quem escute')
      .not.toContain('SKIP_WAITING');
  });

  it('com skipWaiting ligado, aplicar a atualização é recarregar', () => {
    if (!skipWaitingLigado) return;
    // O service worker novo já assumiu a página quando a folha aparece;
    // recarregar é tudo o que falta.
    expect(pwaUpdate, 'aplicar a atualização precisa recarregar a página')
      .toMatch(/location\.reload\(\)/);
    // `controllerchange` já aconteceu antes de a pessoa tocar no botão, então
    // esperar por ele é esperar um evento que passou.
    expect(pwaUpdate, 'controllerchange já ocorreu; esperar por ele trava o botão')
      .not.toContain('controllerchange');
  });

  it('com skipWaiting desligado, a mensagem volta a ser obrigatória', () => {
    if (skipWaitingLigado) return;
    // O outro lado da moeda: sem `skipWaiting`, o SW novo fica esperando e
    // SÓ a mensagem o faz assumir. Quem reverter a config tem de reverter aqui.
    expect(pwaUpdate, 'sem skipWaiting, alguém precisa mandar SKIP_WAITING')
      .toContain('SKIP_WAITING');
  });

  it('a folha de atualização continua sendo oferecida', () => {
    expect(pwaUpdate, 'o registro do service worker sumiu').toContain("register('/sw.js'");
    expect(pwaUpdate, 'a busca por versão nova sumiu').toContain('reg.update()');
    expect(pwaUpdate, 'deixou de avisar quem chamou').toContain('aoEncontrar');
  });
});
