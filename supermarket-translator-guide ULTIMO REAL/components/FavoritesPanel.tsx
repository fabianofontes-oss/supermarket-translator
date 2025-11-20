
import React from 'react';
import type { TranslationItem as TranslationItemType, Country } from '../types';
import { TranslationItem } from './TranslationItem';
import { StarIcon } from './Icons';

interface FavoritesPanelProps {
    favorites: TranslationItemType[];
    t: (key: string) => string;
    // Props for TranslationItem
    onPlayAudio: (text: string, langCode: string) => void;
    onPlayPhrase: (phraseType: 'ask' | 'want', item: TranslationItemType) => void;
    nativeCountry: Country;
    targetCountry: Country;
    shoppingList: TranslationItemType[];
    checkedItems: Set<string>;
    expandedItemKey: string | null;
    setExpandedItemKey: (key: string | null) => void;
    toggleShoppingListItem: (item: TranslationItemType) => void;
    toggleFavorite: (item: TranslationItemType) => void;
    isSpeakerLocked: boolean;
    isConversationLocked: boolean;
    theme: { color: string; textColor: string };
    onOpenPlan: () => void;
}

// Helper to group items by Category
const groupItemsByCategory = (items: TranslationItemType[]) => {
  const groups: Record<string, TranslationItemType[]> = {};
  
  items.forEach(item => {
    const cat = item.category || 'others';
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(item);
  });
  return groups;
};

export const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ 
    favorites, 
    t, 
    onPlayAudio,
    onPlayPhrase,
    nativeCountry,
    targetCountry,
    shoppingList,
    checkedItems,
    expandedItemKey,
    setExpandedItemKey,
    toggleShoppingListItem,
    toggleFavorite,
    isSpeakerLocked,
    isConversationLocked,
    theme,
    onOpenPlan
}) => {
    
    if (favorites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 opacity-50">
                <StarIcon className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-center text-gray-500">{t('noFavoritesYet')}</p>
            </div>
        );
    }

    const groupedFavorites = groupItemsByCategory(favorites);

    return (
        <div className="space-y-6 animate-fade-in">
            {Object.entries(groupedFavorites).map(([category, items]) => (
                <div key={category}>
                    <h2 className={`text-sm font-bold ${theme.textColor} uppercase tracking-wider mb-3 pb-2 border-b border-gray-100`}>{t(category)}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {items.map(item => (
                            <TranslationItem
                                key={item.key}
                                item={item}
                                onPlayAudio={onPlayAudio}
                                onPlayPhrase={onPlayPhrase}
                                nativeCountry={nativeCountry}
                                targetCountry={targetCountry}
                                isInShoppingList={shoppingList.some((i) => i.key === item.key)}
                                isChecked={checkedItems.has(item.key)}
                                isFavorite={true}
                                isExpanded={expandedItemKey === item.key}
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
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
