import React from 'react';
import { HomeIcon } from './Icons';
import { ShareButton } from './ShareButton';
import type { Country } from '../types';
import { playSound } from '../utils/soundUtils';

/**
 * A moldura dos módulos generativos.
 *
 * Nasceu de um defeito anotado: o cabeçalho existia em DEZ cópias idênticas,
 * variando só a chave do título (AGENTS.md 8.17). Mexer nele significava mexer em
 * dez arquivos, e era assim que eles saíam de sincronia. Aqui é um.
 *
 * E traz a barra de baixo com o botão redondo grande da bandeira, igual à do
 * Supermercado e da Farmácia — antes os generativos tinham um par de bandeirinhas
 * de 24px num canto do cabeçalho, para a troca de idioma, que é o controle mais
 * tocado do app. Mesmo tamanho, mesmo anel, mesma sombra do `ModuleLayout`, de
 * propósito: a graça é o app inteiro parecer um app só.
 *
 * OS DOIS SLOTS LATERAIS SÃO OPCIONAIS, e isso é o desenho, não preguiça.
 * No Supermercado os botões de baixo são Favoritos e Lista, que fazem sentido LÁ;
 * em cada módulo outra coisa faz sentido, e em muitos não faz nenhuma. Slot vazio
 * é resposta legítima — a barra fica só com a bandeira no meio. Botão que passa a
 * vida sem função ensina a pessoa a ignorar aquele canto da tela, e o projeto já
 * aprendeu isso nas Direções.
 */

export type ShellTheme = { color: string; textColor: string; hex: string; borderColor: string };

interface ModuleShellProps {
  title: string;
  theme: ShellTheme;
  t: (key: string) => string;
  /** Só o destino: é a bandeira que a barra mostra, como no Supermercado. */
  targetCountry: Country;
  onGoHome: () => void;
  onOpenLanguageModal: () => void;
  onOpenShare: () => void;
  /** Ação da esquerda da barra. Ausente = nada ali. */
  left?: React.ReactNode;
  /** Ação da direita da barra. Ausente = nada ali. */
  right?: React.ReactNode;
  children: React.ReactNode;
}

/** Botão de slot, para os módulos não reinventarem o estilo da barra. */
export const ShellAction: React.FC<{
  icon: React.FC<{ className?: string }>;
  label: string;
  onClick: () => void;
  /** Aberto: vira pastilha branca, como a aba ativa do Supermercado. */
  active?: boolean;
  theme: ShellTheme;
}> = ({ icon: Icon, label, onClick, active = false, theme }) => (
  <button
    onClick={() => { playSound('page-turn'); onClick(); }}
    aria-pressed={active}
    className={`flex flex-col justify-end items-center w-full tap cursor-pointer relative overflow-hidden group ${
      active
        ? 'bg-white rounded-t-2xl h-24 pb-6 pt-4 shadow-[0_-4px_15px_rgba(0,0,0,0.1)] translate-y-0 z-10'
        : 'h-20 pb-6 translate-y-2 opacity-90 hover:opacity-100'
    }`}
  >
    <Icon className={`w-7 h-7 mb-1 transition-colors duration-300 ${active ? theme.textColor : 'text-white'}`} />
    {/* text-xs e não text-[10px]: é o piso de 14px dos módulos de trabalho
        aplicado também à barra, e aqui cabe sem cortar. */}
    <span
      className={`text-xs font-bold uppercase tracking-widest px-2 text-center leading-tight ${active ? theme.textColor : 'text-white'}`}
      dir="auto"
    >
      {label}
    </span>
  </button>
);

export const ModuleShell: React.FC<ModuleShellProps> = ({
  title,
  theme,
  t,
  targetCountry,
  onGoHome,
  onOpenLanguageModal,
  onOpenShare,
  left,
  right,
  children,
}) => (
  <div className="w-full bg-slate-50 text-gray-800 flex flex-col h-[100dvh] relative overflow-hidden font-sans">
    <header
      className="flex-shrink-0 text-white shadow-lg z-30 rounded-b-3xl"
      style={{ background: `linear-gradient(to bottom, ${theme.hex}, ${theme.hex}e6)` }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-4 max-w-3xl mx-auto">
        <button
          onClick={() => { playSound('click'); onGoHome(); }}
          aria-label={t('a11yHome')}
          className="hit p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <HomeIcon className="w-5 h-5" />
        </button>
        <h1 className="flex-1 mx-2 text-center font-bold text-2xl uppercase tracking-tight truncate">{title}</h1>
        {/* O par de bandeirinhas saiu daqui: a troca de idioma passou para o botão
            redondo da barra, como no Supermercado. Sobra o compartilhar, e por isso
            não há mais o `gap-2` que separava dois botões sobrepostos. */}
        <ShareButton onClick={onOpenShare} t={t} variant="onColor" />
      </div>
    </header>

    {/* pb-32 e não pb-10: a barra de baixo tem 96px e cobriria o fim da rolagem. */}
    <main className="flex-1 overflow-y-auto pb-32">
      <div className="px-4 pt-4 max-w-3xl mx-auto w-full space-y-4">{children}</div>
    </main>

    <nav className={`absolute bottom-0 w-full ${theme.color} z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.15)]`}>
      <div className="max-w-3xl mx-auto grid grid-cols-3 h-24 items-end pb-4 tap">
        <div className="flex items-end h-full">{left}</div>

        {/* O botão redondo. Copiado do `ModuleLayout` para serem o mesmo botão de
            verdade — mesmo diâmetro, mesmo anel de 6px na cor do módulo, mesmos
            dois brilhos. Só a bandeira de DESTINO, como lá: a de origem já é a
            língua em que a tela inteira está escrita. */}
        <div className="relative h-full w-full flex justify-center pointer-events-none">
          <button
            onClick={() => { playSound('click'); onOpenLanguageModal(); }}
            aria-label={t('languageSettings')}
            className="w-20 h-20 rounded-full border-[6px] flex items-center justify-center bg-slate-800 overflow-hidden transform tap hover:scale-105 cursor-pointer absolute bottom-10 z-50 pointer-events-auto shadow-xl"
            style={{ borderColor: theme.hex }}
          >
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full z-30 pointer-events-none" />
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none" />
            {/* Decorativa: o nome do botão já diz o que ele faz, e o `alt` do país
                o rebatizaria de "Espanha". Mesma decisão do `ModuleLayout`. */}
            <img src={targetCountry.image} alt="" aria-hidden="true" className="w-full h-full object-cover rounded-full" />
          </button>
        </div>

        <div className="flex items-end h-full">{right}</div>
      </div>
    </nav>
  </div>
);
