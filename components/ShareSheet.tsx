import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ShareIcon, XIcon, LinkIcon } from './Icons';
import {
  WhatsAppGlyph, TelegramGlyph, FacebookGlyph,
  WHATSAPP_HEX, TELEGRAM_HEX, FACEBOOK_HEX,
} from './BrandIcons';
import { useDialog } from '../hooks/useDialog';
import { playSound } from '../utils/soundUtils';
import { SHARE_URL, SHARE_QR_SRC } from '../constants';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
  theme: { color: string; textColor: string; hex: string };
}

/**
 * Passa o app adiante.
 *
 * O público se organiza por WhatsApp e por indicação boca a boca, muitas vezes
 * cara a cara dentro de uma loja — por isso o QR tem o maior peso visual da
 * folha, e por isso ele é um SVG pré-gerado e precacheado, que aparece com o
 * aparelho offline.
 *
 * Irmã do conteúdo no `App`, nunca filha de um header: o header é `relative z-30`
 * e cria contexto de empilhamento, então um `fixed` lá dentro ficaria preso
 * abaixo da barra de navegação. Mesmo motivo documentado no `CategorySheet`.
 *
 * `z-[105]`: acima de tudo que o usuário abre por vontade própria (CategorySheet
 * 90, LanguagePanel 100) e abaixo dos dois avisos que o sistema impõe
 * (VoiceMissingSheet 110, UpdateSheet 120). O que pode cobrir esta folha são só
 * avisos involuntários, nunca um painel que a pessoa mesma abriu.
 *
 * Ressalva herdada: o `useDialog` registra o listener de teclado em `document`.
 * Duas folhas abertas ao mesmo tempo significam dois traps de Tab disputando e
 * um Esc fechando as duas. Já acontecia entre VoiceMissing e Update; esta folha
 * amplia a superfície sem criar o problema. Não vale código para blindar.
 */
export const ShareSheet: React.FC<ShareSheetProps> = ({ isOpen, onClose, t, theme }) => {
  const [copia, setCopia] = useState<'idle' | 'done' | 'failed'>('idle');
  const botaoCopiarRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const close = useCallback(() => { playSound('pop'); onClose(); }, [onClose]);
  const panelRef = useDialog(isOpen, close);

  // O rótulo do botão volta ao normal sozinho, e o estado não sobrevive a uma
  // reabertura da folha.
  useEffect(() => {
    if (!isOpen) { setCopia('idle'); return; }
    if (copia === 'idle') return;
    const timer = window.setTimeout(() => setCopia('idle'), 2500);
    return () => window.clearTimeout(timer);
  }, [isOpen, copia]);

  const mensagem = t('shareMessage');
  const texto = `${mensagem} ${SHARE_URL}`;

  /**
   * `wa.me`, nunca `whatsapp://send`. O esquema nativo não faz nada em desktop
   * nem dentro de webview embutida (Instagram, Facebook), e no iOS sem o app
   * instalado mostra erro do Safari — botão morto. O `wa.me` degrada sozinho:
   * abre o app quando existe, e a página web quando não existe.
   *
   * O Facebook recebe só a URL: o `sharer.php` ignora texto pré-preenchido e lê
   * título, descrição e imagem das metas Open Graph do `index.html`.
   */
  const canais = [
    {
      nome: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(texto)}`,
      hex: WHATSAPP_HEX,
      Glyph: WhatsAppGlyph,
      destaque: true,
    },
    {
      nome: 'Telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent(mensagem)}`,
      hex: TELEGRAM_HEX,
      Glyph: TelegramGlyph,
      destaque: false,
    },
    {
      nome: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`,
      hex: FACEBOOK_HEX,
      Glyph: FacebookGlyph,
      destaque: false,
    },
  ];

  /**
   * Área de transferência, em dois níveis.
   *
   * O caminho moderno exige contexto seguro. Produção (HTTPS), `capacitor://` e
   * `http://localhost` passam; `http://192.168.x.x:3000` NÃO — e o `vite.config`
   * usa `host: '0.0.0.0'` justamente para testar em celular real na rede local.
   * O fallback depreciado é o que salva esse caso.
   */
  const copiarNaMarra = (): boolean => {
    try {
      const campo = document.createElement('textarea');
      campo.value = SHARE_URL;
      campo.setAttribute('readonly', '');
      campo.style.position = 'fixed';
      campo.style.opacity = '0';
      document.body.appendChild(campo);
      campo.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(campo);
      // O textarea rouba o foco por um instante; devolvê-lo mantém o trap são.
      botaoCopiarRef.current?.focus();
      return ok;
    } catch {
      return false;
    }
  };

  /**
   * Nada de `await` antes da escrita: o iOS Safari só autoriza a área de
   * transferência dentro da mesma tarefa do gesto que a pediu.
   */
  const handleCopiar = () => {
    playSound('click');
    let moderno: Promise<void> | undefined;
    try {
      moderno = navigator.clipboard?.writeText?.(SHARE_URL);
    } catch {
      moderno = undefined;
    }
    if (moderno && typeof moderno.then === 'function') {
      moderno.then(() => setCopia('done')).catch(() => setCopia(copiarNaMarra() ? 'done' : 'failed'));
      return;
    }
    setCopia(copiarNaMarra() ? 'done' : 'failed');
  };

  /**
   * A folha nativa do sistema cobre o que não cabe aqui: Instagram, SMS, e-mail,
   * AirDrop. Só é oferecida quando existe — botão desabilitado seria pior que
   * botão ausente. A chamada é síncrona porque qualquer `await` antes dela
   * desfaz o vínculo com o gesto no iOS, e cancelar lança `AbortError`, que não
   * é erro.
   */
  const temNativo = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleNativo = () => {
    playSound('click');
    try {
      const r = navigator.share({ title: 'Translator Hub', text: mensagem, url: SHARE_URL });
      if (r && typeof r.catch === 'function') r.catch(() => {});
    } catch {
      /* alguns navegadores lançam em vez de rejeitar */
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[105] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={close} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-start gap-3 mb-5">
          {/* O mesmo glifo do botão que abriu a folha: é o que confirma para a
              pessoa que ela chegou onde queria. */}
          <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${theme.hex}1a` }}>
            <ShareIcon className={`w-7 h-7 ${theme.textColor}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id={titleId} className="text-lg font-bold text-gray-900 leading-tight" dir="auto">
              {t('shareTitle')}
            </h3>
            <p className="text-sm text-gray-600 mt-1 leading-snug" dir="auto">{t('shareSubtitle')}</p>
          </div>
          <button onClick={close} aria-label={t('close')} className="hit p-1 -mt-1 -mr-1 shrink-0 text-gray-400 hover:text-gray-600 tap">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Módulos pretos sobre branco, sempre. Tingir o QR com a cor do tema
            derruba a leitura em câmera de celular barato — a cor do módulo vai
            na moldura, onde não atrapalha o contraste do código. */}
        <div className="flex flex-col items-center gap-2 mb-5">
          <div
            className="rounded-2xl border-[3px] bg-white p-3"
            style={{ borderColor: theme.hex, boxShadow: `0 8px 30px ${theme.hex}26` }}
          >
            {/* Decorativo: um QR não diz nada a um leitor de tela. Quem precisa
                do endereço tem a URL em texto logo abaixo. */}
            <img src={SHARE_QR_SRC} alt="" aria-hidden="true" className="w-48 h-48 block" />
          </div>
          <p className="text-xs text-gray-500 text-center leading-snug" dir="auto">{t('shareQrHint')}</p>
          {/* `dir="ltr"` próprio: em árabe o algoritmo bidi reordenaria os
              pedaços da URL e ela viraria um endereço que não existe. */}
          <p className="font-mono text-xs text-gray-500 text-center select-all break-all" dir="ltr">{SHARE_URL}</p>
        </div>

        {/*
          Canais são âncoras, não `window.open`: âncora não é bloqueada como
          popup, é nativa para teclado e leitor de tela, e o `focusableSelector`
          do `useDialog` já inclui `[href]`, então entra no trap de graça.

          Nota para quem gerar as pastas nativas: dentro de uma WebView do
          Capacitor, `target="_blank"` em `https://` depende da configuração — o
          caminho certo lá é o `@capacitor/browser`. Hoje `android/` e `ios/` não
          existem, então ainda não é problema real.

          Nomes de marca não são chave de tradução: são idênticos nos 12 locales.
          O nome acessível é composto com `shareVia`.
        */}
        <div className="flex flex-col gap-2 mb-2">
          {canais.filter((c) => c.destaque).map(({ nome, href, hex, Glyph }) => (
            <a
              key={nome}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound('click')}
              aria-label={`${t('shareVia')} ${nome}`}
              className="flex items-center justify-center gap-3 w-full min-h-[52px] px-4 rounded-xl text-white font-bold shadow-md hover:brightness-95 active:scale-95 tap transition"
              style={{ backgroundColor: hex }}
            >
              <Glyph className="w-6 h-6 shrink-0" />
              <span>{nome}</span>
            </a>
          ))}

          <div className="grid grid-cols-2 gap-2">
            {canais.filter((c) => !c.destaque).map(({ nome, href, hex, Glyph }) => (
              <a
                key={nome}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                aria-label={`${t('shareVia')} ${nome}`}
                className="flex items-center justify-center gap-2 min-h-[48px] px-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 active:scale-95 tap transition"
              >
                <Glyph className="w-5 h-5 shrink-0" style={{ color: hex }} />
                <span className="truncate">{nome}</span>
              </a>
            ))}
          </div>

          <button
            ref={botaoCopiarRef}
            onClick={handleCopiar}
            className="flex items-center justify-center gap-2 w-full min-h-[48px] px-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 active:scale-95 tap transition"
          >
            <LinkIcon className="w-5 h-5 shrink-0" />
            <span dir="auto">
              {t(copia === 'done' ? 'shareCopied' : copia === 'failed' ? 'shareCopyFailed' : 'shareCopyLink')}
            </span>
          </button>

          {temNativo && (
            <button
              onClick={handleNativo}
              className="w-full min-h-[44px] px-4 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 tap transition"
            >
              <span dir="auto">{t('shareMoreOptions')}</span>
            </button>
          )}
        </div>

        {/* Rótulo de botão que muda em silêncio passa despercebido no leitor de
            tela; o resultado da cópia precisa ser anunciado. */}
        <p aria-live="polite" className="sr-only" dir="auto">
          {copia === 'idle' ? '' : t(copia === 'done' ? 'shareCopied' : 'shareCopyFailed')}
        </p>
      </div>
    </div>
  );
};
