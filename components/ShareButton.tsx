import React from 'react';
import { ShareIcon } from './Icons';
import { playSound } from '../utils/soundUtils';

interface ShareButtonProps {
  onClick: () => void;
  t: (key: string) => string;
  /** `onColor` para os headers com gradiente do tema; `onLight` para o hub. */
  variant?: 'onColor' | 'onLight';
}

/**
 * O gatilho da folha de compartilhar, presente no header das nove telas.
 *
 * Mapa estático, nunca `bg-${x}`: o Tailwind varre o fonte e não gera classe que
 * só existe depois de concatenada (AGENTS.md §7.1).
 */
const VARIANTES = {
  onColor: 'bg-white/10 border border-white/10 text-white hover:bg-white/20',
  onLight: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
} as const;

/**
 * Vive no cluster da direita de cada header, SEMPRE antes do controle que já
 * estava lá (bandeiras nos módulos, busca no catálogo) e com `gap-2` de distância
 * dele — ver o comentário sobre a matemática do `.hit` em `ShareSheet.tsx`.
 */
export const ShareButton: React.FC<ShareButtonProps> = ({ onClick, t, variant = 'onColor' }) => (
  <button
    onClick={() => { playSound('click'); onClick(); }}
    aria-label={t('shareApp')}
    className={`hit p-2 rounded-full tap active:scale-95 transition-colors ${VARIANTES[variant]}`}
  >
    <ShareIcon className="w-5 h-5" />
  </button>
);
