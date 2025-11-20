
import React from 'react';
import type { Country } from '../types';

interface LanguagePanelProps {
  nativeCountry: Country;
  targetCountry: Country;
  onNativeChange: (country: Country) => void;
  onTargetChange: (country: Country) => void;
  options: Country[];
  t: (key: string) => string;
  theme: { color: string; textColor: string; hex: string };
}

export const LanguagePanel: React.FC<LanguagePanelProps> = ({
  nativeCountry,
  targetCountry,
  onNativeChange,
  onTargetChange,
  options,
  t,
  theme
}) => {

  const renderOption = (opt: Country, section: 'native' | 'target') => {
    const isSelected = section === 'native' ? nativeCountry.code === opt.code : targetCountry.code === opt.code;
    const onClick = () => section === 'native' ? onNativeChange(opt) : onTargetChange(opt);

    return (
      <button
        key={`${section}-${opt.code}`}
        onClick={onClick}
        className={`flex flex-col items-center gap-2 group w-full transition-all duration-300 relative z-0`}
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all relative overflow-hidden border-[3px] ${
          isSelected 
            ? `border-slate-800 shadow-lg scale-110 ring-4 ${section === 'native' ? 'ring-slate-300/50' : ''} z-10` 
            : `border-gray-300 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:scale-105 ${section === 'native' ? 'hover:border-slate-400' : 'hover:border-[#c83745]/50'}`
        } bg-slate-200`}
        style={isSelected && section === 'target' ? { borderColor: theme.hex, boxShadow: `0 4px 15px ${theme.hex}40`, '--tw-ring-color': `${theme.hex}40` } as any : {}}
        >
            <img
                src={`https://flagcdn.com/${opt.code}.svg`}
                alt={opt.name}
                className="w-full h-full object-cover"
            />
        </div>
        <span className={`text-xs font-bold uppercase text-center truncate w-full px-1 ${isSelected ? (section === 'native' ? 'text-slate-900' : theme.textColor) : 'text-gray-400'}`}>
            {opt.name}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col -mx-4 -mt-4 min-h-[calc(100%+4rem)] relative z-[9999]">
      
      {/* Native Language Section - Blue/Slate Theme */}
      <div className="bg-slate-100 pb-6 pt-2 border-b border-slate-200">
        <div className="bg-slate-800 text-white py-3 px-6 flex items-center gap-3 shadow-sm mb-6 mx-0">
             <div className="bg-white text-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm shrink-0">1</div>
             <h3 className="font-bold text-sm uppercase tracking-wider truncate">
                {t('myLanguage')}
            </h3>
        </div>
        
        <div className="grid grid-cols-3 gap-x-4 gap-y-6 px-6">
            {options.map((opt) => renderOption(opt, 'native'))}
        </div>
      </div>

      {/* Target Country Section - Pink/Theme Theme */}
      <div className="bg-red-50 flex-1 pb-32 pt-2">
        <div className={`${theme.color} text-white py-3 px-6 flex items-center gap-3 shadow-sm mb-6 mx-0`}>
             <div className="bg-white text-[#c83745] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm shrink-0" style={{ color: theme.hex }}>2</div>
             <h3 className="font-bold text-sm uppercase tracking-wider truncate">
                {t('iAmIn')}
            </h3>
        </div>

        <div className="grid grid-cols-3 gap-x-4 gap-y-6 px-6">
            {options.map((opt) => renderOption(opt, 'target'))}
        </div>
      </div>
    </div>
  );
};
