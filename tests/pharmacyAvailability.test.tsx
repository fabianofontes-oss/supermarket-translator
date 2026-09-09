import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import { TranslationItem } from '../components/TranslationItem';
import { mapTranslationItem } from '../utils/itemHelpers';
import { PREPOPULATED_TRANSLATIONS } from '../data/catalog';
import { translations } from '../translations';
import { COUNTRIES } from '../constants';
import type { AvailabilityByCountry, TranslationItem as Item } from '../types';

/**
 * Farmácia: estado do produto por país.
 *
 * A regra que estes testes trancam: **restrição nunca ocupa o lugar do nome
 * local nem tira o áudio**. Antes, `PROIBIDO` dentro da tradução fazia as duas
 * coisas — o card mostrava a palavra-marcador como se fosse o nome do remédio.
 */

const BR = COUNTRIES.find((c) => c.code === 'br')!;
const ES = COUNTRIES.find((c) => c.code === 'es')!;
const GB = COUNTRIES.find((c) => c.code === 'gb')!;
const t = (key: string) => (translations['pt-BR'] as Record<string, string>)[key] || key;
const T = (key: string) => t(key);

beforeAll(() => {
  // jsdom não implementa scrollIntoView, usado no efeito de expandir.
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => cleanup());

const item = (over: Partial<Item> = {}): Item => ({
  key: 'painFever/mildPain/Remédio',
  source_term: 'Remédio',
  translated_term: 'Medicamento (MarcaA, MarcaB)',
  image: '',
  category: 'painFever',
  subCategory: 'mildPain',
  ...over,
});

const renderCard = (over: Partial<Item> = {}, opts: { target?: typeof ES; expanded?: boolean } = {}) => {
  const onPlayAudio = vi.fn();
  const view = render(
    <TranslationItem
      item={item(over)}
      onPlayAudio={onPlayAudio}
      onPlayPhrase={vi.fn()}
      nativeCountry={BR}
      targetCountry={opts.target ?? ES}
      isInShoppingList={false}
      isChecked={false}
      isFavorite={false}
      isExpanded={opts.expanded ?? false}
      onToggleExpand={vi.fn()}
      onToggleShoppingListItem={vi.fn()}
      onToggleFavorite={vi.fn()}
      highlighted={false}
      onHighlightDone={vi.fn()}
      t={T}
      isSpeakerLocked={false}
      isConversationLocked={false}
      theme={{ color: 'bg-emerald-700', textColor: 'text-emerald-700' }}
      onOpenPlan={vi.fn()}
      isPharmacy
    />,
  );
  return { ...view, onPlayAudio };
};

const botaoOuvir = () => screen.queryByRole('button', { name: t('listenPronunciation') });

describe('1-2 — item normal', () => {
  it('mostra o nome local', () => {
    renderCard();
    expect(screen.getByText('Medicamento (MarcaA, MarcaB)')).toBeTruthy();
  });

  it('oferece áudio, e fala o nome sem a lista de marcas', () => {
    const { onPlayAudio } = renderCard();
    const botao = botaoOuvir();
    expect(botao).toBeTruthy();
    botao!.click();
    expect(onPlayAudio).toHaveBeenCalledWith('Medicamento', ES.lang);
  });

  it('não mostra selo de estado quando não há restrição', () => {
    renderCard({}, { expanded: true });
    expect(within(screen.getByTestId('pharmacy-status')).getByText(t('pharmacyAvailable'))).toBeTruthy();
  });
});

describe('3-5 — item com restrição mantém nome e áudio', () => {
  // O catálogo real não tem esta combinação: onde havia marcador, o nome local
  // nunca existiu. O fixture tranca a REGRA, para que nenhuma restrição futura
  // volte a apagar um nome que existe.
  const comRestricao: AvailabilityByCountry = { es: { exists: 'not-authorized' } };

  it('o nome local continua aparecendo', () => {
    renderCard({ availability: comRestricao });
    expect(screen.getByText('Medicamento (MarcaA, MarcaB)')).toBeTruthy();
  });

  it('o áudio continua disponível e fala o nome local', () => {
    const { onPlayAudio } = renderCard({ availability: comRestricao });
    const botao = botaoOuvir();
    expect(botao, 'restrição não pode tirar o botão de ouvir').toBeTruthy();
    botao!.click();
    expect(onPlayAudio).toHaveBeenCalledWith('Medicamento', ES.lang);
  });

  it('o aviso aparece separado do nome', () => {
    renderCard({ availability: comRestricao });
    const aviso = screen.getByText(t('pharmacyNotAuthorized'));
    expect(aviso).toBeTruthy();
    // separado mesmo: não está dentro do elemento que carrega o nome
    expect(aviso.textContent).not.toContain('Medicamento');
  });

  it('distingue "não comercializado" de "não autorizado"', () => {
    renderCard({ availability: { es: { exists: 'not-marketed' } } });
    expect(screen.getByText(t('pharmacyNotMarketed'))).toBeTruthy();
    expect(screen.queryByText(t('pharmacyNotAuthorized'))).toBeNull();
  });

  it('restrição de transporte é apresentada como transporte, não como venda', () => {
    renderCard({ availability: { es: { travel: 'restricted' } } });
    expect(screen.getByText(t('pharmacyTravelRestricted'))).toBeTruthy();
    // e continua com nome e áudio
    expect(screen.getByText('Medicamento (MarcaA, MarcaB)')).toBeTruthy();
    expect(botaoOuvir()).toBeTruthy();
  });

  it('o aviso não afirma nada sobre a farmácia vender', () => {
    renderCard({ availability: comRestricao }, { expanded: true });
    const nota = screen.getByText(t('pharmacyCountryInfoNote'));
    expect(nota.textContent).toContain('país');
    expect(nota.textContent?.toLowerCase()).toContain('farmácia');
  });
});

describe('6-7 — o marcador antigo não é mais texto de apresentação', () => {
  it('Nimesulida na Espanha não mostra "PROIBIDO" como nome', () => {
    const bruto = PREPOPULATED_TRANSLATIONS['painFever']['moderatePain']
      .find((i) => i.source_term === 'Nimesulida')!;
    const mapeado = mapTranslationItem(bruto, 'painFever', 'moderatePain', BR, ES);

    renderCard(mapeado, { expanded: true });

    expect(screen.queryByText(/PROIBIDO/)).toBeNull();
    expect(screen.queryByText(/NOT SOLD/)).toBeNull();
    // o selo aparece na linha recolhida E no painel expandido: é o desenho.
    expect(screen.getAllByText(t('pharmacyNotAuthorized')).length).toBeGreaterThan(0);
  });

  it('Dorflex na Espanha mostra a sugestão do catálogo, não o marcador', () => {
    const bruto = PREPOPULATED_TRANSLATIONS['painFever']['musclePain']
      .find((i) => i.source_term === 'Dorflex')!;
    const mapeado = mapTranslationItem(bruto, 'painFever', 'musclePain', BR, ES);

    renderCard(mapeado, { expanded: true });

    expect(screen.queryByText(/NOT SOLD/)).toBeNull();
    expect(screen.getAllByText(t('pharmacyNotMarketed')).length).toBeGreaterThan(0);
    expect(screen.getByText('Robaxisal')).toBeTruthy();
  });

  it('quando não há nome local, diz isso — não mostra o estado no lugar do nome', () => {
    renderCard({ availability: { es: { exists: 'not-authorized', localNameUnknown: true } } });
    expect(screen.getByText(t('pharmacyNoLocalName'))).toBeTruthy();
    expect(screen.queryByText('Medicamento (MarcaA, MarcaB)')).toBeNull();
  });

  it('sem nome local mas com sugestão, o áudio fala a sugestão', () => {
    const { onPlayAudio } = renderCard({
      availability: { es: { exists: 'not-marketed', alternative: 'Robaxisal', localNameUnknown: true } },
    });
    const botao = botaoOuvir();
    expect(botao).toBeTruthy();
    botao!.click();
    expect(onPlayAudio).toHaveBeenCalledWith('Robaxisal', ES.lang);
  });
});

describe('8 — o estado de um país não vaza para outro', () => {
  const soNaEspanha: AvailabilityByCountry = { es: { exists: 'not-authorized' } };

  it('a restrição da Espanha não aparece com destino Reino Unido', () => {
    renderCard({ availability: soNaEspanha }, { target: GB });
    expect(screen.queryByText(t('pharmacyNotAuthorized'))).toBeNull();
  });

  it('o mesmo item guardado nos favoritos troca de estado ao trocar de destino', () => {
    // Favoritos guardam o mapa inteiro, então a resolução é sempre contra o
    // destino do momento.
    const guardado = { availability: soNaEspanha };
    const { unmount } = renderCard(guardado, { target: ES });
    expect(screen.getByText(t('pharmacyNotAuthorized'))).toBeTruthy();
    unmount();

    renderCard(guardado, { target: GB });
    expect(screen.queryByText(t('pharmacyNotAuthorized'))).toBeNull();
  });

  it('Arcoxia: restrito nos EUA, normal na Espanha', () => {
    const bruto = PREPOPULATED_TRANSLATIONS['painFever']['moderatePain']
      .find((i) => i.source_term === 'Arcoxia')!;
    const US = COUNTRIES.find((c) => c.code === 'us')!;

    renderCard(mapTranslationItem(bruto, 'painFever', 'moderatePain', BR, ES), { target: ES });
    // 'Arcoxia' é igual em pt e es: aparece na linha de origem e na de destino.
    expect(screen.getAllByText('Arcoxia').length).toBeGreaterThan(0);
    expect(screen.queryByText(t('pharmacyNotAuthorized'))).toBeNull();
    cleanup();

    renderCard(mapTranslationItem(bruto, 'painFever', 'moderatePain', BR, US), { target: US });
    expect(screen.getAllByText(t('pharmacyNotAuthorized')).length).toBeGreaterThan(0);
  });
});

describe('9 — item sem informação de disponibilidade', () => {
  it('renderiza normalmente quando o campo não existe', () => {
    renderCard({ availability: undefined }, { expanded: true });
    expect(screen.getByText('Medicamento (MarcaA, MarcaB)')).toBeTruthy();
    expect(botaoOuvir()).toBeTruthy();
  });

  it('renderiza quando o país atual não está no mapa', () => {
    renderCard({ availability: { fr: { exists: 'not-marketed' } } }, { target: ES, expanded: true });
    expect(screen.getByText('Medicamento (MarcaA, MarcaB)')).toBeTruthy();
    expect(screen.queryByText(t('pharmacyNotMarketed'))).toBeNull();
  });

  it('um item do supermercado, sem campo nenhum, continua igual', () => {
    const supermercado = PREPOPULATED_TRANSLATIONS['produce']['fruits'][0];
    const mapeado = mapTranslationItem(supermercado, 'produce', 'fruits', BR, ES);
    expect(mapeado.availability).toBeUndefined();
  });
});

describe('10 — nenhuma string da Farmácia escrita no JSX', () => {
  const fonte = fs.readFileSync(
    path.resolve(__dirname, '..', 'components', 'TranslationItem.tsx'),
    'utf8',
  );

  it('as strings que estavam fixas em português sumiram', () => {
    for (const antiga of ['Nome Genérico', 'Princípio Ativo', 'Marcas nas Prateleiras', 'DISPONÍVEL', 'AVAILABLE']) {
      expect(fonte, `"${antiga}" ainda está no JSX`).not.toContain(antiga);
    }
  });

  it('não sobrou nó de texto literal no JSX', () => {
    const semComentarios = fonte.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const literais = [...semComentarios.matchAll(/>\s*([^<>{}\n]{3,})\s*</g)]
      .map((m) => m[1].trim())
      .filter((s) => /\p{L}{3,}/u.test(s));
    expect(literais).toEqual([]);
  });

  it('todo estado da Farmácia passa por t()', () => {
    for (const chave of ['pharmacyAvailable', 'pharmacyNotAuthorized', 'pharmacyNotMarketed',
                          'pharmacyTravelRestricted', 'pharmacyNoLocalName', 'pharmacyAskInstead',
                          'pharmacyGenericName', 'pharmacyBrands', 'pharmacyCountryInfoNote']) {
      expect(fonte, `${chave} deve ser usada via t()`).toContain(`t('${chave}')`);
    }
  });
});

describe('integridade do catálogo — nenhum estado escondido dentro da tradução', () => {
  const MARCADORES = /\b(PROIBIDO|NOT SOLD|BANNED|PROHIBIDO|NÃO VENDIDO|SEM ESTOQUE|RESTRICTED)\b/i;

  it('nenhuma tradução carrega marcador de estado', () => {
    const infratores: string[] = [];
    for (const cat of Object.keys(PREPOPULATED_TRANSLATIONS)) {
      for (const sub of Object.keys(PREPOPULATED_TRANSLATIONS[cat])) {
        for (const it of PREPOPULATED_TRANSLATIONS[cat][sub]) {
          for (const [code, termo] of Object.entries(it.translations)) {
            if (MARCADORES.test(termo)) infratores.push(`${cat}/${sub}/${it.source_term}/${code}: "${termo}"`);
          }
        }
      }
    }
    expect(infratores).toEqual([]);
  });

  it('todo availability declarado usa estados conhecidos e um país existente', () => {
    const codigos = new Set(COUNTRIES.map((c) => c.code));
    const problemas: string[] = [];
    for (const cat of Object.keys(PREPOPULATED_TRANSLATIONS)) {
      for (const sub of Object.keys(PREPOPULATED_TRANSLATIONS[cat])) {
        for (const it of PREPOPULATED_TRANSLATIONS[cat][sub]) {
          for (const [code, info] of Object.entries(it.availability ?? {})) {
            if (!codigos.has(code)) problemas.push(`${it.source_term}: país desconhecido "${code}"`);
            if (info.exists && !['not-authorized', 'not-marketed'].includes(info.exists)) {
              problemas.push(`${it.source_term}/${code}: estado desconhecido "${info.exists}"`);
            }
            if (!info.exists && !info.travel) problemas.push(`${it.source_term}/${code}: entrada vazia`);
          }
        }
      }
    }
    expect(problemas).toEqual([]);
  });

  it('a migração cobriu os 13 itens e os 43 pares item × país', () => {
    let itens = 0, pares = 0;
    for (const cat of Object.keys(PREPOPULATED_TRANSLATIONS)) {
      for (const sub of Object.keys(PREPOPULATED_TRANSLATIONS[cat])) {
        for (const it of PREPOPULATED_TRANSLATIONS[cat][sub]) {
          const n = Object.keys(it.availability ?? {}).length;
          if (n) { itens++; pares += n; }
        }
      }
    }
    expect({ itens, pares }).toEqual({ itens: 13, pares: 43 });
  });
});
