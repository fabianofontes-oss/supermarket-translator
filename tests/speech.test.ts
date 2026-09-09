import { describe, it, expect } from 'vitest';
import { pickVoice, type VoiceLike } from '../utils/speech';
import { COUNTRIES } from '../constants';

/**
 * Seleção de voz do TTS.
 *
 * O defeito que estes testes prendem: com destino Itália, o app falava texto
 * italiano com voz americana. A voz padrão do sistema entrava porque nenhuma
 * voz italiana existia e o código falava assim mesmo. A regra aqui é absoluta —
 * idioma-base diferente do destino nunca sai daqui.
 */

const v = (name: string, lang: string): VoiceLike => ({ name, lang });

const baseOf = (lang: string) => lang.replace(/_/g, '-').toLowerCase().split('-')[0];

describe('pickVoice — compatibilidade de idioma', () => {
  it('locale exato vence outra região do mesmo idioma', () => {
    const voices = [v('Italiano Svizzera', 'it-CH'), v('Elsa', 'it-IT')];
    const r = pickVoice(voices, 'it-IT');
    expect(r.status).toBe('ok');
    expect(r.status === 'ok' && r.voice.lang).toBe('it-IT');
  });

  it('[it-IT] + it-IT → ok', () => {
    const r = pickVoice([v('Elsa', 'it-IT')], 'it-IT');
    expect(r.status === 'ok' && r.voice.lang).toBe('it-IT');
  });

  it('[it] + it-IT → ok (mesma língua, sem região)', () => {
    const r = pickVoice([v('Italian', 'it')], 'it-IT');
    expect(r.status === 'ok' && r.voice.lang).toBe('it');
  });

  it('[it-CH] + it-IT → ok (mesma língua, região diferente)', () => {
    const r = pickVoice([v('Italiano Svizzera', 'it-CH')], 'it-IT');
    expect(r.status === 'ok' && r.voice.lang).toBe('it-CH');
  });

  it('[en-US, es-ES] + it-IT → missing', () => {
    const r = pickVoice([v('English US', 'en-US'), v('Spanish', 'es-ES')], 'it-IT');
    expect(r).toEqual({ status: 'missing' });
  });

  it('[pt-BR, es-ES] + fr-FR → missing', () => {
    const r = pickVoice([v('Luciana', 'pt-BR'), v('Mónica', 'es-ES')], 'fr-FR');
    expect(r).toEqual({ status: 'missing' });
  });
});

describe('pickVoice — preferência de qualidade', () => {
  it('voz premium do idioma certo vence a comum do idioma certo', () => {
    const voices = [v('Microsoft Elsa', 'it-IT'), v('Google italiano', 'it-IT')];
    const r = pickVoice(voices, 'it-IT');
    expect(r.status === 'ok' && r.voice.name).toBe('Google italiano');
  });

  it('voz premium do idioma ERRADO não vence voz comum do idioma certo', () => {
    const voices = [v('Google US English Premium', 'en-US'), v('Elsa', 'it-IT')];
    const r = pickVoice(voices, 'it-IT');
    expect(r.status === 'ok' && r.voice.lang).toBe('it-IT');
    expect(r.status === 'ok' && r.voice.name).toBe('Elsa');
  });

  it('qualidade não promove região errada acima do locale exato', () => {
    const voices = [v('Google Italiano Natural', 'it-CH'), v('Elsa', 'it-IT')];
    const r = pickVoice(voices, 'it-IT');
    expect(r.status === 'ok' && r.voice.lang).toBe('it-IT');
  });
});

describe('pickVoice — normalização', () => {
  const elsa = v('Elsa', 'it-IT');

  it.each(['it_IT', 'IT-it', 'IT-IT', 'it-it', ' it-IT '])('aceita %s', (lang) => {
    const r = pickVoice([elsa], lang);
    expect(r.status === 'ok' && r.voice.lang).toBe('it-IT');
  });

  it('normaliza também o lang da voz', () => {
    const r = pickVoice([v('Elsa', 'it_IT')], 'it-IT');
    expect(r.status).toBe('ok');
  });
});

describe('pickVoice — lista vazia', () => {
  it('voices=[] → unknown, nunca missing', () => {
    expect(pickVoice([], 'it-IT')).toEqual({ status: 'unknown' });
  });

  it('unknown significa "ainda não sei", não "não existe"', () => {
    // O motor TTS do WebView pode listar vozes só depois. Concluir `missing`
    // aqui mostraria um aviso falso na primeira pintura.
    const r = pickVoice([], 'pt-BR');
    expect(r.status).not.toBe('missing');
  });
});

describe('pickVoice — invariante sobre todos os países', () => {
  // Uma lista realista de aparelho brasileiro: nenhum italiano, nenhum lituano.
  const DEVICE = [
    v('Microsoft Daniel', 'pt-BR'),
    v('Google português do Brasil', 'pt-BR'),
    v('Microsoft David', 'en-US'),
    v('Microsoft Zira', 'en-US'),
    v('Google español', 'es-ES'),
  ];

  it('nenhum resultado tem idioma-base diferente do pedido', () => {
    const erradas: string[] = [];
    for (const country of COUNTRIES) {
      const r = pickVoice(DEVICE, country.lang);
      if (r.status === 'ok' && baseOf(r.voice.lang) !== baseOf(country.lang)) {
        erradas.push(`${country.name} (${country.lang}) → ${r.voice.name} [${r.voice.lang}]`);
      }
    }
    expect(erradas).toEqual([]);
  });

  it('os 12 países são avaliáveis sem exceção e só devolvem ok/missing/unknown', () => {
    expect(COUNTRIES).toHaveLength(12);
    for (const country of COUNTRIES) {
      expect(['ok', 'missing', 'unknown']).toContain(pickVoice(DEVICE, country.lang).status);
    }
  });

  it('neste aparelho, Itália e Lituânia dão missing e Brasil dá ok', () => {
    const byName = (n: string) => COUNTRIES.find((c) => c.name === n)!;
    expect(pickVoice(DEVICE, byName('Itália').lang).status).toBe('missing');
    expect(pickVoice(DEVICE, byName('Lituânia').lang).status).toBe('missing');
    expect(pickVoice(DEVICE, byName('Brasil').lang).status).toBe('ok');
  });
});

describe('regressão direta — o bug relatado', () => {
  /**
   * Destino Itália, aparelho sem voz italiana. Antes disto o app falava com
   * `Microsoft David` (en-US) e ensinava pronúncia inglesa de texto italiano.
   * Dois revisores nativos reprovaram o app por causa exatamente disto.
   */
  it('destino it-IT em aparelho com [en-US, es-ES] devolve missing, nunca uma voz', () => {
    const voices = [
      { name: 'English US', lang: 'en-US' },
      { name: 'Spanish', lang: 'es-ES' },
    ];

    const r = pickVoice(voices, 'it-IT');

    expect(r).toEqual({ status: 'missing' });
    expect(r).not.toHaveProperty('voice');
  });
});
