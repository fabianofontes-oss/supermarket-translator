
import React, { useEffect, useRef } from 'react';
import {
  SpeakerIcon,
  QuestionMarkCircleIcon,
  CartIcon,
  CheckIcon,
  ShoppingBagIcon,
  StarIcon
} from './Icons';
import type { TranslationItem as TranslationItemType, Country } from '../types';

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
  isPhrase = false
}) => {
  // If locked, use a light red background
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

  const handleCardClick = () => {
    // Always expand/collapse on click, regardless of whether it is a phrase or product
    onToggleExpand();
  };

  const renderButton = (
    phraseType: 'listen' | 'ask' | 'want',
    icon: React.ReactNode,
    title: string,
    locked: boolean
  ) => {
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (phraseType === 'listen') {
        onPlayAudio(item.translated_term, targetCountry.lang);
      } else {
        if (!locked) {
            onPlayPhrase(phraseType, item);
        }
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
                <div className="w-7 h-7 rounded-full border-2 border-slate-600 shadow-sm overflow-hidden relative flex-shrink-0 bg-slate-800">
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-full z-20 pointer-events-none"></div>
                  <img
                    src={`https://flagcdn.com/${nativeCountry.code}.svg`}
                    alt={nativeCountry.name}
                    className="w-full h-full object-cover z-10"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="text-gray-800 font-bold text-lg truncate pr-2 leading-tight">{item.source_term}</p>
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
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
                 <div className="w-7 h-7 rounded-full border-2 border-slate-600 shadow-sm overflow-hidden relative flex-shrink-0 bg-slate-800">
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-full z-20 pointer-events-none"></div>
                    <img
                      src={`https://flagcdn.com/${targetCountry.code}.svg`}
                      alt={targetCountry.name}
                      className="w-full h-full object-cover z-10"
                      loading="lazy"
                      decoding="async"
                    />
                </div>
                <p className="text-gray-600 font-medium uppercase truncate pr-2 leading-tight">
                  {item.translated_term}
                </p>
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

      {/* Expandable area for products (Add to list) AND Phrases (Phonetics) */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-32' : 'max-h-0'
        }`}
      >
        {isExpanded && (
          <div className="px-3 pb-3 pt-0 flex flex-row justify-between items-center border-t border-gray-100 mt-1 pt-2">
            
            {/* Phonetics Section - Show for both Products and Phrases */}
            <div className="flex items-center gap-4 flex-1">
              {item.phonetic && (
                <div className="text-left">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t('pronunciation')}</p>
                  <p className="text-gray-800 font-mono text-lg">{item.phonetic}</p>
                </div>
              )}
            </div>

            {/* Action Button - Only for Products (Not Phrases) */}
            {!isPhrase && (
                <button
                onClick={(e) => {
                    e.stopPropagation();
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
    </div>
  );
};
