
import React, { useEffect, useRef } from 'react';
import {
  SpeakerIcon,
  QuestionMarkCircleIcon,
  CartIcon,
  CheckIcon,
  ShoppingBagIcon,
  StarIcon,
  XIcon,
} from './Icons';
import type { TranslationItem as TranslationItemType, Country } from '../types';
import { playSound } from '../utils/soundUtils';

interface TranslationItemProps {
  item: TranslationItemType;
  onPlayAudio: (text: string, langCode: string) => void;
  onPlayPhrase: (phraseType: 'ask' | 'want', item: TranslationItemType) => void;
  nativeCountry: Country;
  targetCountry: Country;
  isInShoppingList: boolean;
  isChecked: boolean;
  isFavorite: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleShoppingListItem: (item: TranslationItemType) => void;
  onToggleFavorite: (item: TranslationItemType) => void;
  highlighted: boolean;
  onHighlightDone: () => void;
  t: (key: string) => string;
  isSpeakerLocked: boolean;
  isConversationLocked: boolean;
  theme: { color: string; textColor: string };
  isPhrase?: boolean;
  onOpenPlan: () => void;
  isPharmacy?: boolean;
}

export const TranslationItem: React.FC<TranslationItemProps> = ({
  item,
  onPlayAudio,
  onPlayPhrase,
  nativeCountry,
  targetCountry,
  isInShoppingList,
  isChecked,
  isFavorite,
  isExpanded,
  onToggleExpand,
  onToggleShoppingListItem,
  onToggleFavorite,
  highlighted,
  onHighlightDone,
  t,
  isSpeakerLocked,
  isConversationLocked,
  theme,
  isPhrase = false,
  onOpenPlan,
  isPharmacy = false
}) => {
  const getButtonClasses = (locked: boolean) => 
    `p-1.5 rounded-full transition-colors duration-200 ${
      locked 
        ? 'bg-red-50 hover:bg-red-100' 
        : `hover:bg-gray-100 text-gray-500 hover:${theme.textColor}`
    }`;

  const baseIconClasses = 'w-6 h-6';
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlighted && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const tempHighlightClass = 'bg-blue-100';
      itemRef.current.classList.add(tempHighlightClass, 'transition-all', 'duration-300');
      const timer = setTimeout(() => {
        itemRef.current?.classList.remove(tempHighlightClass);
        onHighlightDone();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [highlighted, onHighlightDone]);

  // Auto-scroll when expanded to ensure full card visibility
  useEffect(() => {
    if (isExpanded && itemRef.current) {
      // Increased delay to 200ms to ensure transition is well underway/finished
      const timer = setTimeout(() => {
        itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200); 
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const handleCardClick = () => {
    playSound('click');
    onToggleExpand();
  };

  // --- PHARMACY PARSING LOGIC ---
  const parsePharmacyData = (text: string) => {
      const isForbidden = text.includes('PROIBIDO') || text.includes('Banned');
      const isNotSold = text.includes('NOT SOLD') || isForbidden;

      // Regex to separate "Generic Name" from "(Brands/Notes)"
      // Matches: "Name (Inside)" -> Group 1: "Name ", Group 2: "Inside"
      const match = text.match(/^(.*?)\s*\((.*?)\)$/);
      
      let generic = text;
      let details = '';

      if (match) {
          generic = match[1].trim();
          details = match[2].trim();
      }

      let brands: string[] = [];
      let alternative = '';

      if (isNotSold) {
          // If not sold, the content inside () is usually the alternative suggestion
          // E.g. "NOT SOLD (Use Tylenol)" -> details: "Use Tylenol"
          alternative = details.replace(/^Use\s+/i, ''); // Remove "Use " prefix for cleaner display
      } else {
          // If sold, content inside () are brands
          // E.g. "Paracetamol (Kitadol, Panadol)"
          if (details) {
              brands = details.split(/,|\//).map(b => b.trim()).filter(b => b);
          }
      }

      return { isNotSold, isForbidden, generic, brands, alternative };
  };

  const pharmacyInfo = isPharmacy ? parsePharmacyData(item.translated_term) : null;

  // Display Logic for Collapsed View
  let displayTerm = item.translated_term;
  
  if (isPharmacy && pharmacyInfo) {
       // In collapsed view:
       // If NOT SOLD, show "Produto não disponível" red text (handled in JSX below)
       // If SOLD, show the full string (Generic + Brands) so user sees everything quickly
       displayTerm = item.translated_term; 
  }

  const renderButton = (
    phraseType: 'listen' | 'ask' | 'want',
    icon: React.ReactNode,
    title: string,
    locked: boolean
  ) => {
    // PHARMACY RULE: Hide audio if product is not sold/prohibited
    if (isPharmacy && pharmacyInfo?.isNotSold) {
        return null;
    }

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (locked) {
        playSound('lock');
        onOpenPlan();
        return;
      }

      if (phraseType === 'listen') {
        // For pharmacy, play just the generic name for clarity
        const textToPlay = isPharmacy && pharmacyInfo 
            ? pharmacyInfo.generic 
            : item.translated_term;
            
        onPlayAudio(textToPlay, targetCountry.lang);
      } else {
        onPlayPhrase(phraseType, item);
      }
    };

    return (
      <button
        onClick={handleClick}
        className={getButtonClasses(locked)}
        title={locked ? t('lockedAudio') : title}
      >
        {locked ? <span className="text-lg">🔒</span> : icon}
      </button>
    );
  };

  const isHighlighted = isInShoppingList && !isChecked;

  return (
    <div
      ref={itemRef}
      className={`rounded-xl transition-all duration-300 bg-white ${
        isExpanded ? `shadow-md border-2 ${theme.textColor.replace('text', 'border')}` : 'shadow-sm'
      } ${isHighlighted ? 'bg-yellow-100' : 'bg-white'} overflow-hidden`}
    >
      <div
        onClick={handleCardClick}
        className="px-3 py-2 cursor-pointer flex flex-col gap-1"
      >
        {/* Top Row: Native Term + Star */}
        <div className="flex justify-between items-center">
             <div className="flex items-center gap-3 overflow-hidden">
                {/* 3D Flag Button Effect */}
                <div className="w-7 h-7 rounded-full border border-slate-300 shadow-sm overflow-hidden relative flex-shrink-0 bg-white">
                  <img
                    src={nativeCountry.image}
                    alt={nativeCountry.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="text-gray-800 font-bold text-lg truncate pr-2 leading-tight">{item.source_term}</p>
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    playSound(isFavorite ? 'click' : 'success');
                    onToggleFavorite(item);
                }}
                className="p-1 rounded-full flex-shrink-0 -mr-1 text-gray-400 hover:text-gray-500"
                title={t('favorites')}
            >
                <StarIcon className={`w-6 h-6 ${isFavorite ? 'text-yellow-400 fill-current' : ''}`} />
            </button>
        </div>

        {/* Bottom Row: Translated Term + Actions */}
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                 {/* 3D Flag Button Effect */}
                 <div className="w-7 h-7 rounded-full border border-slate-300 shadow-sm overflow-hidden relative flex-shrink-0 bg-white">
                    <img
                      src={targetCountry.image}
                      alt={targetCountry.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                </div>
                <div className="flex flex-col leading-tight pr-2">
                    <p className={`${isPharmacy && pharmacyInfo?.isNotSold ? 'text-red-600 font-bold text-xs' : 'text-gray-600 font-medium uppercase'}`}>
                        {/* In collapsed view, show the full term or the unavailable message */}
                        {isPharmacy && pharmacyInfo?.isNotSold 
                            ? (pharmacyInfo.isForbidden ? 'PROIBIDO / BANNED' : t('productNotAvailable')) 
                            : displayTerm}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {renderButton(
                'listen',
                <SpeakerIcon className={baseIconClasses} />,
                t('listenPronunciation'),
                isSpeakerLocked
              )}
              {!isPhrase && renderButton(
                'ask',
                <QuestionMarkCircleIcon className={baseIconClasses} />,
                t('askForItem'),
                isConversationLocked
              )}
              {!isPhrase && renderButton(
                'want',
                <CartIcon className={baseIconClasses} />,
                t('sayYouWantItem'),
                isConversationLocked
              )}
            </div>
        </div>
      </div>

      {/* Expandable Area */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-96' : 'max-h-0'
        }`}
      >
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-slate-50/50">
            
            {/* PHARMACY SPECIFIC UI */}
            {isPharmacy && pharmacyInfo ? (
                <div className="space-y-3">
                    
                    {/* Status Banner */}
                    <div className={`flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg shadow-sm ${pharmacyInfo.isNotSold ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                        {pharmacyInfo.isNotSold ? (
                            <><XIcon className="w-5 h-5" /> <span>{pharmacyInfo.isForbidden ? 'PROIBIDO / BANNED' : t('productNotAvailable')}</span></>
                        ) : (
                            <><CheckIcon className="w-5 h-5" /> <span>DISPONÍVEL / AVAILABLE</span></>
                        )}
                    </div>

                    {/* Generic Name (Target Country) */}
                    {!pharmacyInfo.isNotSold && (
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Nome Genérico / Princípio Ativo</p>
                            <p className="text-lg font-bold text-gray-800 leading-tight">{pharmacyInfo.generic}</p>
                        </div>
                    )}

                    {/* Brands List */}
                    {!pharmacyInfo.isNotSold && pharmacyInfo.brands.length > 0 && (
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Marcas nas Prateleiras</p>
                            <div className="flex flex-wrap gap-2">
                                {pharmacyInfo.brands.slice(0, 5).map((brand, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm font-medium">
                                        {brand}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Safe Alternative */}
                    {pharmacyInfo.isNotSold && pharmacyInfo.alternative && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="text-[10px] text-blue-500 uppercase font-bold mb-1">{t('safeAlternative')}</p>
                            <p className="text-blue-800 font-bold text-sm">{pharmacyInfo.alternative}</p>
                        </div>
                    )}
                    
                    {/* Add to List Button - Replaces Audio Button in Expanded View */}
                    {!isPhrase && (
                         <div className="pt-2 border-t border-gray-200/50 flex justify-end">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    playSound(isInShoppingList ? 'click' : 'success');
                                    onToggleShoppingListItem(item);
                                }}
                                className={`flex items-center gap-2 font-semibold py-2 px-6 rounded-full text-sm transition-transform hover:scale-105 shadow-lg flex-shrink-0 ${
                                    isInShoppingList
                                    ? 'bg-gray-700 text-white hover:bg-gray-800'
                                    : `${theme.color} text-white hover:opacity-90`
                                }`}
                            >
                                {isInShoppingList ? (
                                    <>
                                    <CheckIcon className="w-5 h-5" />
                                    <span>{t('onList')}</span>
                                    </>
                                ) : (
                                    <>
                                    <ShoppingBagIcon className="w-5 h-5" />
                                    <span>{t('add')}</span>
                                    </>
                                )}
                            </button>
                         </div>
                    )}
                </div>
            ) : (
                // SUPERMARKET / DEFAULT UI
                <div className="flex flex-row justify-between items-center">
                    <div className="flex items-center gap-4 flex-1">
                    {item.phonetic && (
                        <div className="text-left">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t('pronunciation')}</p>
                        <p className="text-gray-800 font-mono text-lg">{item.phonetic}</p>
                        </div>
                    )}
                    </div>

                    {!isPhrase && (
                        <button
                        onClick={(e) => {
                            e.stopPropagation();
                            playSound(isInShoppingList ? 'click' : 'success');
                            onToggleShoppingListItem(item);
                        }}
                        className={`flex items-center gap-2 font-semibold py-2 px-6 rounded-full text-sm transition-transform hover:scale-105 shadow-lg flex-shrink-0 ml-4 ${
                            isInShoppingList
                            ? 'bg-gray-700 text-white hover:bg-gray-800'
                            : `${theme.color} text-white hover:opacity-90`
                        }`}
                        >
                        {isInShoppingList ? (
                            <>
                            <CheckIcon className="w-5 h-5" />
                            <span>{t('onList')}</span>
                            </>
                        ) : (
                            <>
                            <ShoppingBagIcon className="w-5 h-5" />
                            <span>{t('add')}</span>
                            </>
                        )}
                        </button>
                    )}
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
