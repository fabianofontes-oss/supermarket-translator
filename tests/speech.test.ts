import { describe, it, expect } from 'vitest';
import { pickVoice, googleTtsUrl, TTS_MAX_CHARS, type VoiceLike } from '../utils/speech';
import { COUNTRIES } from '../constants';

/**
 * Seleção de voz e origem do áudio.
 *
 * A regra do produto é a REGIÃO, não o idioma. Texto do Brasil não pode sair na
 * voz de Portugal, espanhol da Espanha não pode sair na voz mexicana, italiano
 * não pode sair na voz americana. Foi região errada que dois revisores nativos
 * reprovaram — e uma versão anterior deste código caía de propósito para outra
 * região, transformando o defeito em comportamento oficial.
 */

const v = (name: string, lang: string): VoiceLike => ({ name, lang });

describe('pickVoice — só a região exata serve', () => {
  it('[it-IT] + it-IT → ok', () => {
    const r = pickVoice([v('Elsa', 'it-IT')], 'it-IT');
    expect(r.status === 'ok' && r.voice.lang).toBe('it-IT');
  });

  it('[pt-PT] + pt-BR → missing — a regra que os revisores exigiram', () => {
    expect(pickVoice([v('Joana', 'pt-PT')], 'pt-BR')).toEqual({ status: 'missing' });
  });

  it('[pt-BR] + pt-PT → missing, e o inverso também vale', () => {
    expect(pickVoice([v('Luciana', 'pt-BR')], 'pt-PT')).toEqual({ status: 'missing' });
  });

  it('[es-US] + es-ES → missing — o caso da captura do dono', () => {
    expect(pickVoice([v('espanhol Estados Unidos', 'es-US')], 'es-ES')).toEqual({ status: 'missing' });
  });

  it('[en-US] + en-GB → missing', () => {
    expect(pickVoice([v('inglês Estados Unidos', 'en-US')], 'en-GB')).toEqual({ status: 'missing' });
  });

  it('[it-CH] + it-IT → missing; outra região não substitui', () => {
    expect(pickVoice([v('Italiano Svizzera', 'it-CH')], 'it-IT')).toEqual({ status: 'missing' });
  });

  it('[it] + it-IT → missing; idioma sem região não é a região', () => {
    expect(pickVoice([v('Italian', 'it')], 'it-IT')).toEqual({ status: 'missing' });
  });

  it('escolhe a certa quando a errada está na lista junto', () => {
    const r = pickVoice([v('Joana', 'pt-PT'), v('Luciana', 'pt-BR')], 'pt-BR');
    expect(r.status === 'ok' && r.voice.lang).toBe('pt-BR');
  });
});

describe('pickVoice — preferência de qualidade', () => {
  it('premium vence comum dentro da MESMA região', () => {
    const r = pickVoice([v('Microsoft Elsa', 'it-IT'), v('Google italiano', 'it-IT')], 'it-IT');
    expect(r.status === 'ok' && r.voice.name).toBe('Google italiano');
  });

  it('premium de região errada não vence nada — nem existe como opção', () => {
    const r = pickVoice([v('Google Português Premium', 'pt-PT')], 'pt-BR');
    expect(r).toEqual({ status: 'missing' });
  });
});

describe('pickVoice — normalização', () => {
  it.each(['pt_BR', 'PT-br', 'PT-BR', ' pt-BR '])('aceita %s', (lang) => {
    expect(pickVoice([v('Luciana', 'pt-BR')], lang).status).toBe('ok');
  });

  it('normaliza também o lang da voz', () => {
    expect(pickVoice([v('Luciana', 'pt_BR')], 'pt-BR').status).toBe('ok');
  });
});

describe('pickVoice — lista vazia', () => {
  it('voices=[] → unknown, nunca missing', () => {
    expect(pickVoice([], 'pt-BR')).toEqual({ status: 'unknown' });
  });
});

describe('pickVoice — o aparelho real do dono', () => {
  // Exatamente o que a captura mostrou: duas vozes, nenhuma de região certa
  // além do inglês americano.
  const APARELHO = [
    v('espanhol Estados Unidos', 'es-US'),
    v('inglês Estados Unidos', 'en-US'),
  ];

  it('só os Estados Unidos têm voz de região correta', () => {
    const comVoz = COUNTRIES.filter((c) => pickVoice(APARELHO, c.lang).status === 'ok').map((c) => c.name);
    expect(comVoz).toEqual(['Estados Unidos']);
  });

  it('nenhum resultado tem lang diferente do pedido', () => {
    const erradas: string[] = [];
    for (const country of COUNTRIES) {
      const r = pickVoice(APARELHO, country.lang);
      if (r.status === 'ok' && r.voice.lang.toLowerCase() !== country.lang.toLowerCase()) {
        erradas.push(`${country.name} → ${r.voice.name} [${r.voice.lang}]`);
      }
    }
    expect(erradas).toEqual([]);
  });
});

describe('googleTtsUrl — o áudio com o sotaque certo', () => {
  it('manda o locale COMPLETO, que é o que separa pt-BR de pt-PT', () => {
    const url = googleTtsUrl('bom dia', 'pt-BR')!;
    expect(url).toContain('tl=pt-BR');
    expect(url).not.toContain('tl=pt&');
  });

  it('pt-PT e pt-BR produzem pedidos diferentes', () => {
    expect(googleTtsUrl('bom dia', 'pt-BR')).not.toBe(googleTtsUrl('bom dia', 'pt-PT'));
  });

  it('escapa o texto', () => {
    const url = googleTtsUrl('¿dónde está?', 'es-ES')!;
    expect(url).not.toContain('¿dónde está?');
    expect(new URL(url).searchParams.get('q')).toBe('¿dónde está?');
  });

  it('recusa texto acima do limite, em vez de reproduzir meia frase', () => {
    expect(googleTtsUrl('a'.repeat(TTS_MAX_CHARS + 1), 'pt-BR')).toBeNull();
    expect(googleTtsUrl('a'.repeat(TTS_MAX_CHARS), 'pt-BR')).not.toBeNull();
  });

  it('recusa texto vazio', () => {
    expect(googleTtsUrl('   ', 'pt-BR')).toBeNull();
  });

  it('cobre todos os 12 países', () => {
    for (const c of COUNTRIES) {
      const url = googleTtsUrl('teste', c.lang);
      expect(url, c.name).not.toBeNull();
      expect(new URL(url!).searchParams.get('tl')).toBe(c.lang);
    }
  });
});
