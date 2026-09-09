import React, { useCallback, useEffect, useRef } from 'react';
import type { Category } from '../types';
import { XIcon, CheckIcon } from './Icons';
import { metaFor } from './categoryMeta';
import { playSound } from '../utils/soundUtils';

interface CategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedName: string;
  onSelect: (name: string) => void;
  theme: { color: string; textColor: string; hex: string };
  t: (key: string) => string;
}

/**
 * Painel de baixo com todas as categorias em grade.
 *
 * Substitui a lista suspensa antiga, que ninguém encontrava. É o primeiro
 * diálogo de verdade do app: nada no projeto tinha `role="dialog"`, tecla Esc
 * ou foco preso, então o comportamento é escrito aqui e o LanguagePanel pode
 * adotar depois.
 *
 * Precisa ser irmão do ModuleLayout, não filho: o cabeçalho é `relative z-30`
 * e cria contexto de empilhamento, então um `fixed` lá dentro ficaria preso
 * abaixo da barra de navegação.
 */
export const CategorySheet: React.FC<CategorySheetProps> = ({
  isOpen, onClose, categories, selectedName, onSelect, theme, t,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  const close = useCallback(() => { playSound('pop'); onClose(); }, [onClose]);

  // Ao abrir, guarda quem tinha o foco e leva o foco para a categoria atual.
  useEffect(() => {
    if (!isOpen) return;
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => selectedRef.current?.focus(), 60);
    return () => {
      window.clearTimeout(timer);
      restoreFocusTo.current?.focus?.();
    };
  }, [isOpen]);

  // Esc fecha, e o Tab circula dentro do painel em vez de escapar para a página.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled])');
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" role="dialog" aria-modal="true" aria-labelledby="category-sheet-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={close} />

      <div
        ref={panelRef}
        className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] max-h-[85vh] flex flex-col animate-slide-up"
      >
        <div className={`${theme.color} rounded-t-[2.5rem] flex flex-col items-center pt-3 pb-3`}>
          <button onClick={close} aria-label={t('close')} className="hit w-12 h-1.5 rounded-full bg-white/40 mb-3 tap" />
          <div className="flex items-center justify-between w-full px-5">
            <span className="w-9" />
            <h2 id="category-sheet-title" className="text-base font-bold uppercase tracking-widest text-white text-center" dir="auto">
              {t('chooseCategory')}
            </h2>
            <button onClick={close} aria-label={t('close')} className="hit p-2 rounded-full bg-white/20 hover:bg-white/30 text-white tap">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-4 grid grid-cols-2 gap-3">
          {categories.map((c) => {
            const meta = metaFor(c.name);
            const active = c.name === selectedName;
            const Icon = meta.icon;
            return (
              <button
                key={c.name}
                ref={active ? selectedRef : undefined}
                onClick={() => { playSound('click'); onSelect(c.name); }}
                aria-current={active ? 'true' : undefined}
                className={`relative min-h-[104px] p-3 rounded-2xl ring-1 tap active:scale-95 flex ${
                  meta.wide
                    ? 'col-span-2 flex-row items-center gap-3 text-left'
                    : 'flex-col items-center justify-center gap-2'
                } ${active ? 'ring-2' : 'ring-gray-100 bg-white'}`}
                style={active ? { backgroundColor: `${theme.hex}14`, ['--tw-ring-color' as string]: theme.hex } : undefined}
              >
                <span className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${meta.iconClass}`}>
                  <Icon className="w-6 h-6" />
                </span>
                <span
                  className={`text-[13px] font-bold leading-tight break-words ${meta.wide ? 'text-left' : 'text-center'} ${active ? theme.textColor : 'text-gray-700'}`}
                  dir="auto"
                >
                  {t(c.name)}
                </span>
                {active && (
                  <span className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full ${theme.color} text-white flex items-center justify-center`}>
                    <CheckIcon className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
