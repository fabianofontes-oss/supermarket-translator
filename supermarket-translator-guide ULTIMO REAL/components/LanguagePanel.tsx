
import React from 'react';
import type { Country } from '../types';
import { XIcon, CheckIcon } from './Icons';

interface LanguagePanelProps {
  isOpen: boolean;
  onClose: () => void;
  nativeCountry: Country;
  targetCountry: Country;
  onNativeChange: (country: Country) => void;
  onTargetChange: (country: Country) => void;
  options: Country[];
  t: (key: string) => string;
  theme: { color: string; textColor: string; hex: string };
}

export const LanguagePanel: React.FC<LanguagePanelProps> = ({
  isOpen,
  onClose,
  nativeCountry,
  targetCountry,
  onNativeChange,
  onTargetChange,
  options,
  t,
  theme
}) => {
  if (!isOpen) return null;

  const renderFlagButton = (
    opt: Country,
    isSelected: boolean,
    onClick: () => void,
    ringColorClass: string
  ) => (
    <button
      key={opt.code}
      onClick={onClick}
      className={`relative group flex items-center justify-center p-1 rounded-full transition-all duration-300 ${
        isSelected
          ? `bg-white shadow-xl scale-110 z-10 ring-2 ring-offset-1 ${ringColorClass}`
          : 'hover:bg-white/40 hover:scale-105 opacity-80 hover:opacity-100 grayscale hover:grayscale-0'
      }`}
      title={opt.name}
    >
      <img
        src={opt.image}
        alt={opt.name}
        className="w-10 h-10 object-contain drop-shadow-md"
      />
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-[16rem] bg-white rounded-2xl shadow-2xl flex flex-col ring-4 ring-white/20 max-h-[85vh] overflow-y-auto animate-expand-up no-scrollbar">
        
        {/* Close Button */}
        <button 
            onClick={onClose} 
            className="absolute top-1.5 right-1.5 p-1 bg-black/10 rounded-full text-white z-50 hover:bg-black/30 backdrop-blur-md transition-colors"
        >
            <XIcon className="w-3.5 h-3.5" />
        </button>

        {/* Top Section: Native Language (Blue Theme) */}
        <div className="bg-slate-100 flex flex-col shrink-0">
             <div className="bg-slate-700 text-white p-2 px-4 font-bold text-sm shadow-md z-10 relative flex items-center gap-2">
                {t('myLanguage')}...
             </div>
             {/* Optimized padding and gap for small screens */}
             <div className="p-3 grid grid-cols-3 gap-3 justify-items-center">
                {options.map((opt) => 
                    renderFlagButton(
                        opt, 
                        nativeCountry.code === opt.code, 
                        () => onNativeChange(opt),
                        'ring-slate-600'
                    )
                )}
             </div>
        </div>

        {/* Bottom Section: Target Location (Red Theme) */}
        <div className="bg-red-50 flex flex-col relative shrink-0 flex-1">
             <div className="bg-[#c83745] text-white p-2 px-4 font-bold text-sm shadow-md z-10 relative flex items-center gap-2">
                {t('iAmIn')}...
             </div>
             <div className="p-3 grid grid-cols-3 gap-3 pb-2 justify-items-center">
                 {options.map((opt) => 
                    renderFlagButton(
                        opt, 
                        targetCountry.code === opt.code, 
                        () => onTargetChange(opt),
                        'ring-[#c83745]'
                    )
                 )}
             </div>

             {/* OK Button */}
             <div className="px-3 pb-3 pt-1 mt-auto">
                <button
                    onClick={onClose}
                    className="w-full py-2 rounded-xl bg-[#c83745] text-white font-bold shadow-md hover:bg-[#b02a36] active:scale-95 transition-all flex items-center justify-center gap-2 ring-1 ring-white/20"
                >
                    <span>OK</span>
                    <CheckIcon className="w-4 h-4 stroke-[3]" />
                </button>
             </div>
        </div>

      </div>
    </div>
  );
};
