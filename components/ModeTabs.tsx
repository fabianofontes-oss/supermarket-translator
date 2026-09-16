import React, { useRef } from 'react';
import { playSound } from '../utils/soundUtils';

/**
 * O seletor de modo dos módulos que têm mais de uma metade.
 *
 * Existe porque o padrão estava pela metade em três módulos: havia `role="tab"`
 * dentro de `role="tablist"`, e **nenhum `role="tabpanel"`, nenhum
 * `aria-controls` e nenhuma navegação por setas**. O leitor de tela anunciava
 * "aba 1 de 3" e não encontrava o painel; o teclado passava aba por aba em vez
 * de andar com as setas, como manda o padrão. Meia implementação é pior que
 * nenhuma: `role="tab"` promete um contrato, e quem usa leitor de tela confia
 * nele. Aqui o contrato está inteiro, num lugar só.
 *
 * Ativação automática (seta já troca de modo) e não manual: são três modos que
 * apenas trocam o conteúdo, sem custo em errar, e é o que o padrão recomenda
 * para esse caso.
 */

export type ShellTheme = { color: string; textColor: string; hex: string; borderColor: string };

export interface ModeOption<T extends string> {
  key: T;
  label: string;
}

/** Os ids que ligam a aba ao painel. O módulo usa o mesmo prefixo nos dois. */
export const tabId = (prefix: string, key: string) => `${prefix}-tab-${key}`;
export const panelId = (prefix: string, key: string) => `${prefix}-panel-${key}`;

/** Props do painel ativo. Só o painel do modo escolhido é renderizado. */
export const panelProps = (prefix: string, activeKey: string) => ({
  role: 'tabpanel' as const,
  id: panelId(prefix, activeKey),
  'aria-labelledby': tabId(prefix, activeKey),
});

export function ModeTabs<T extends string>({ idPrefix, label, value, options, onChange, theme }: {
  idPrefix: string;
  label: string;
  value: T;
  options: ModeOption<T>[];
  onChange: (key: T) => void;
  theme: ShellTheme;
}) {
  const lista = useRef<HTMLDivElement>(null);

  const mover = (delta: number) => {
    const i = options.findIndex((o) => o.key === value);
    const proximo = options[(i + delta + options.length) % options.length];
    onChange(proximo.key);
    // O foco acompanha a seleção, senão o teclado fica falando de uma aba e
    // olhando para outra.
    lista.current?.querySelector<HTMLButtonElement>(`#${CSS.escape(tabId(idPrefix, proximo.key))}`)?.focus();
  };

  const aoTeclar = (e: React.KeyboardEvent) => {
    // Em RTL a seta da direita anda para trás: a seta segue a direção da
    // leitura, não a posição física na tela.
    const rtl = document.documentElement.dir === 'rtl';
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); mover(rtl ? -1 : 1); break;
      case 'ArrowLeft': e.preventDefault(); mover(rtl ? 1 : -1); break;
      case 'Home': e.preventDefault(); onChange(options[0].key); break;
      case 'End': e.preventDefault(); onChange(options[options.length - 1].key); break;
      default:
    }
  };

  return (
    <div
      ref={lista}
      role="tablist"
      aria-label={label}
      onKeyDown={aoTeclar}
      className="bg-gray-200/70 dark:bg-slate-700/70 rounded-2xl p-1 flex gap-1"
    >
      {options.map((o) => {
        const ativa = o.key === value;
        return (
          <button
            key={o.key}
            id={tabId(idPrefix, o.key)}
            role="tab"
            aria-selected={ativa}
            /*
             * `aria-controls` SÓ na aba escolhida, e isto foi medido: o módulo
             * renderiza apenas o painel do modo atual, então nas outras duas o
             * atributo apontava para um id que não existe na página. IDREF
             * pendurada é defeito — o leitor de tela promete "vá para o painel"
             * e não há para onde ir. Apontar só onde há painel deixa a relação
             * sempre verdadeira, e como a ativação é automática, a aba que tem
             * foco é sempre a que tem painel.
             */
            aria-controls={ativa ? panelId(idPrefix, o.key) : undefined}
            /* Tabindex móvel: o Tab entra e sai do grupo de uma vez, e por
               dentro anda com as setas. */
            tabIndex={ativa ? 0 : -1}
            onClick={() => { playSound('page-turn'); onChange(o.key); }}
            // py-3 e não py-2: com py-2 o botão fica em 36px de altura, que é
            // exatamente o que a auditoria 8.9 lista como defeito.
            className={`flex-1 rounded-xl py-3 text-sm font-bold tap ${ativa ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-gray-600 dark:text-slate-300'}`}
            style={ativa ? { color: 'var(--tema-texto)' } : undefined}
          >
            <span dir="auto">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
