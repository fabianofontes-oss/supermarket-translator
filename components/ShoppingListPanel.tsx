
import React, { useMemo } from 'react';
import type { TranslationItem as TranslationItemType, Country } from '../types';
import { ShoppingBagIcon } from './Icons';
import { TranslationItem } from './TranslationItem';


interface ShoppingListPanelProps {
    shoppingList: TranslationItemType[];
    favorites: TranslationItemType[];
    checkedItems: Set<string>;
    t: (key: string) => string;
    onPlayAudio: (text: string, langCode: string) => void;
    onPlayPhrase: (phraseType: 'ask' | 'want', item: TranslationItemType) => void;
    nativeCountry: Country;
    targetCountry: Country;
    expandedItemKey: string | null;
    setExpandedItemKey: (key: string | null) => void;
    toggleShoppingListItem: (item: TranslationItemType) => void;
    toggleFavorite: (item: TranslationItemType) => void;
    isSpeakerLocked: boolean;
    isConversationLocked: boolean;
    theme: { color: string; textColor: string };
    onOpenPlan: () => void;
}

const groupItemsByHierarchy = (items: TranslationItemType[]) => {
  const groups: Record<string, Record<string, TranslationItemType[]>> = {};
  
  items.forEach(item => {
    const cat = item.category || 'others';
    const sub = item.subCategory || 'others';

    if (!groups[cat]) {
      groups[cat] = {};
    }
    if (!groups[cat][sub]) {
      groups[cat][sub] = [];
    }
    groups[cat][sub].push(item);
  });

  return groups;
};

export const ShoppingListPanel: React.FC<ShoppingListPanelProps> = ({ 
    shoppingList, 
    favorites,
    checkedItems,
    t, 
    onPlayAudio,
    onPlayPhrase,
    nativeCountry,
    targetCountry,
    expandedItemKey,
    setExpandedItemKey,
    toggleShoppingListItem,
    toggleFavorite,
    isSpeakerLocked,
    isConversationLocked,
    theme,
    onOpenPlan
}) => {

    const groupedShoppingList = useMemo(() => {
        return groupItemsByHierarchy(shoppingList);
    }, [shoppingList]);

    if (shoppingList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 opacity-50">
                <ShoppingBagIcon className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-center text-gray-500">{t('listIsEmpty')}</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6 animate-fade-in">
            {Object.entries(groupedShoppingList).map(([category, subCategories]) => (
            <div key={category}>
                <h3 className={`font-bold text-sm ${theme.textColor} uppercase tracking-wider mb-3 pb-2 border-b border-gray-100`}>{t(category)}</h3>
                {Object.entries(subCategories).map(([subCategory, items]) => (
                <div key={subCategory} className="mb-4">
                    <h4 className="text-xs font-bold text-gray-400 mb-3 ml-1 uppercase">{t(subCategory)}</h4>
                    <div className="space-y-3">
                        {items.map((item) => {
                           return (
                             <TranslationItem
                                key={item.key}
                                item={item}
                                onPlayAudio={onPlayAudio}
                                onPlayPhrase={onPlayPhrase}
                                nativeCountry={nativeCountry}
                                targetCountry={targetCountry}
                                isInShoppingList={true}
                                isChecked={false} // This feature is simplified out
                                isFavorite={favorites.some((i) => i.key === item.key)}
                                isExpanded={expandedItemKey === item.key}
                                // FIX: The functional update `(prev) => ...` was causing a TypeScript error.
                                // Replaced with a direct value update based on the `expandedItemKey` prop.
                                onToggleExpand={() => setExpandedItemKey(expandedItemKey === item.key ? null : item.key)}
                                onToggleShoppingListItem={toggleShoppingListItem}
                                onToggleFavorite={toggleFavorite}
                                highlighted={false}
                                onHighlightDone={() => {}}
                                t={t}
                                isSpeakerLocked={isSpeakerLocked}
                                isConversationLocked={isConversationLocked}
                                theme={theme}
                                isPhrase={item.category === 'phrases'}
                                onOpenPlan={onOpenPlan}
                            />
                           )
                        })}
                    </div>
                </div>
                ))}
            </div>
            ))}
        </div>
    );
};
