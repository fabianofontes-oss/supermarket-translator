
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CATEGORIES, PREPOPULATED_TRANSLATIONS } from '../constants';
import type { Category, Country, TranslationItem as TranslationItemType } from '../types';
import {
  SearchIcon,
  ChevronDownIcon,
  MicrophoneIcon
} from '../components/Icons';
import { TranslationItem } from '../components/TranslationItem';
import { ModuleLayout } from '../components/ModuleLayout';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { mapTranslationItem } from '../utils/itemHelpers';

interface SupermarketModuleProps {
  nativeCountry: Country;
  targetCountry: Country;
  userPlan: 'free' | 'premium' | 'master';
  t: (key: string) => string;
  onOpenMenu: () => void;
  onGoHome: () => void;
  theme: { color: string; textColor: string; hex: string };
  isOnline: boolean;
  currentLimits: { allowedCategories: string[]; allowAudio: boolean };
  LanguagePairSelect: React.FC<any>;
  setNativeCountry: (c: Country) => void;
  setTargetCountry: (c: Country) => void;
  countries: Country[];
  handlePlayAudio: (text: string, lang: string) => void;
  handlePlayPhrase: (phraseType: 'ask' | 'want', item: TranslationItemType) => void;

  // State & Handlers from App.tsx
  activeTab: 'home' | 'search' | 'favorites' | 'list';
  onTabChange: (tab: 'home' | 'search' | 'favorites' | 'list') => void;
  isSearchActive: boolean;
  onToggleSearch: () => void;
  favorites: TranslationItemType[];
  shoppingList: TranslationItemType[];
  checkedItems: Set<string>;
  toggleFavorite: (item: TranslationItemType) => void;
  toggleShoppingListItem: (item: TranslationItemType) => void;
  panelContent: React.ReactNode;
  expandedItemKey: string | null;
  setExpandedItemKey: (key: string | null) => void;
  onOpenLanguageModal: () => void;
}

const FREE_PHRASE_LIMIT = 8;

export default function SupermarketModule({
  nativeCountry,
  targetCountry,
  userPlan,
  t,
  onOpenMenu,
  onGoHome,
  theme,
  isOnline,
  currentLimits,
  LanguagePairSelect,
  setNativeCountry,
  setTargetCountry,
  countries,
  handlePlayAudio,
  handlePlayPhrase,
  activeTab,
  onTabChange,
  isSearchActive,
  onToggleSearch,
  favorites,
  shoppingList,
  checkedItems,
  toggleFavorite,
  toggleShoppingListItem,
  panelContent,
  expandedItemKey,
  setExpandedItemKey,
  onOpenLanguageModal
}: SupermarketModuleProps) {
  
  const [selectedCategory, setSelectedCategory] = useState<Category>(() => {
    try {
      const savedCatName = localStorage.getItem('supermarket_lastCategory');
      if (savedCatName) {
        const found = CATEGORIES.find(c => c.name === savedCatName);
        if (found) return found;
      }
    } catch (e) { console.error("Error loading category from storage", e); }
    return CATEGORIES[0];
  });

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(() => {
    try {
        const savedSub = localStorage.getItem('supermarket_lastSubCategory');
        if (savedSub) return savedSub;
    } catch (e) { console.error("Error loading subcategory from storage", e); }
    return CATEGORIES[0].subCategories[0];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Courtesy Limit State
  const [dailyPhraseCount, setDailyPhraseCount] = useState(0);

  const handleVoiceResult = useCallback((text: string) => {
    setSearchTerm(text);
    onTabChange('search');
    setExpandedItemKey(null);
  }, [onTabChange, setExpandedItemKey]);

  const { isListening, startListening } = useVoiceSearch(nativeCountry.lang, handleVoiceResult, t);

  // Effects
  useEffect(() => {
    if (selectedCategory.name !== 'favorites') {
        localStorage.setItem('supermarket_lastCategory', selectedCategory.name);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubCategory) {
        localStorage.setItem('supermarket_lastSubCategory', selectedSubCategory);
    }
  }, [selectedSubCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedCategory.name !== 'favorites') {
      if (selectedCategory.subCategories.length > 0) {
        if (!selectedCategory.subCategories.includes(selectedSubCategory)) {
           setSelectedSubCategory(selectedCategory.subCategories[0]);
        }
      } else {
        setSelectedSubCategory('');
      }
    }
    setExpandedItemKey(null);
  }, [selectedCategory, selectedSubCategory, setExpandedItemKey]); 

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  // Daily Limit Management for Phrases
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('phraseLimitDate');
    
    if (storedDate !== today) {
      // New day, reset count
      setDailyPhraseCount(0);
      localStorage.setItem('phraseLimitDate', today);
      localStorage.setItem('phraseCount', '0');
    } else {
      // Same day, load count
      const count = parseInt(localStorage.getItem('phraseCount') || '0', 10);
      setDailyPhraseCount(count);
    }
  }, []);

  const incrementPhraseCount = useCallback(() => {
    if (userPlan !== 'free') return;
    
    const newCount = dailyPhraseCount + 1;
    setDailyPhraseCount(newCount);
    localStorage.setItem('phraseCount', newCount.toString());
  }, [dailyPhraseCount, userPlan]);

  const redirectSafeCategory = useCallback(() => {
      const safeCat = CATEGORIES.find(c => c.name === 'produce');
      if (safeCat) {
          setSelectedCategory(safeCat);
          setSelectedSubCategory(safeCat.subCategories[0]);
      }
  }, []);

  const handlePlayAudioWrapper = useCallback((text: string, lang: string) => {
      // Logic for Phrases Courtesy Limit
      if (selectedCategory.name === 'phrases' && userPlan === 'free') {
          if (dailyPhraseCount >= FREE_PHRASE_LIMIT) {
              onOpenMenu();
              redirectSafeCategory();
              return;
          }
          incrementPhraseCount();
      }
      handlePlayAudio(text, lang);
  }, [handlePlayAudio, selectedCategory, userPlan, dailyPhraseCount, onOpenMenu, incrementPhraseCount, redirectSafeCategory]);

  // Wrapper for conversation phrases (Ask/Want buttons)
  const handlePlayPhraseWrapper = useCallback((phraseType: 'ask' | 'want', item: TranslationItemType) => {
      // Even though phrases items usually don't have Ask/Want buttons, 
      // if we ever use this handler for restricted items, we should check logic.
      // Currently, standard items in unlocked categories don't have a limit, 
      // only "Useful Phrases" category has the daily limit.
      handlePlayPhrase(phraseType, item);
  }, [handlePlayPhrase]);


  const handleToggleExpandWrapper = useCallback((itemKey: string) => {
        // Logic for Phrases Courtesy Limit on Expansion
        if (selectedCategory.name === 'phrases' && userPlan === 'free') {
            // Only count when expanding a new item (not collapsing)
            if (expandedItemKey !== itemKey) {
                 if (dailyPhraseCount >= FREE_PHRASE_LIMIT) {
                     onOpenMenu();
                     redirectSafeCategory();
                     return;
                 }
                 incrementPhraseCount();
            }
        }
        setExpandedItemKey(expandedItemKey === itemKey ? null : itemKey);
  }, [expandedItemKey, setExpandedItemKey, selectedCategory, userPlan, dailyPhraseCount, onOpenMenu, incrementPhraseCount, redirectSafeCategory]);

  const searchResults = useMemo((): TranslationItemType[] => {
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      const results: TranslationItemType[] = [];

      for (const categoryName in PREPOPULATED_TRANSLATIONS) {
        if (!currentLimits.allowedCategories.includes(categoryName) && userPlan === 'free') continue;
        for (const subCategoryName in PREPOPULATED_TRANSLATIONS[categoryName]) {
            PREPOPULATED_TRANSLATIONS[categoryName][subCategoryName]
            .filter((item) => {
              const nativeTerm = (nativeCountry.code === 'br' ? item.source_term : item.translations[nativeCountry.code] || item.source_term).toLowerCase();
              const targetTerm = (targetCountry.code === 'br' ? item.source_term : item.translations[targetCountry.code] || item.source_term).toLowerCase();
              return nativeTerm.includes(term) || targetTerm.includes(term);
            })
            .forEach((item) => results.push(mapTranslationItem(item, categoryName, subCategoryName, nativeCountry, targetCountry)));
        }
      }
      return results;
    } else {
      const categoryData = PREPOPULATED_TRANSLATIONS[selectedCategory.name];
      if (categoryData && categoryData[selectedSubCategory]) {
        return categoryData[selectedSubCategory].map((item) =>
          mapTranslationItem(item, selectedCategory.name, selectedSubCategory, nativeCountry, targetCountry),
        );
      }
      return [];
    }
  }, [searchTerm, selectedCategory, selectedSubCategory, nativeCountry, targetCountry, userPlan, currentLimits]);


  const handleCategoryChange = (categoryKey: string) => {
    setSearchTerm('');
    onTabChange('home');
    
    // Check if the category is 'phrases' and the user has exceeded the limit
    if (categoryKey === 'phrases' && userPlan === 'free' && dailyPhraseCount >= FREE_PHRASE_LIMIT) {
        onOpenMenu();
        return;
    }

    if (userPlan === 'free' && !currentLimits.allowedCategories.includes(categoryKey)) {
        onOpenMenu(); 
        return; 
    }

    const newCategory = CATEGORIES.find((c) => c.name === categoryKey);
    if (newCategory) {
      setSelectedCategory(newCategory);
    }
  };

  const handleSubCategoryClick = (sub: string) => {
      setSelectedSubCategory(sub);
      if (selectedCategory.name === 'phrases') {
          const element = document.getElementById(`section-${sub}`);
          if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  const getCounterColor = () => {
      if (dailyPhraseCount >= 8) return 'bg-red-500';
      if (dailyPhraseCount >= 5) return 'bg-orange-500';
      return 'bg-green-500';
  };

  const getCounterTextColor = () => {
      if (dailyPhraseCount >= 8) return 'text-red-500';
      if (dailyPhraseCount >= 5) return 'text-orange-500';
      return 'text-green-500';
  };

  const searchBarContent = (
     <div className="px-4 pb-2 pt-1">
        <div className="relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#c83745] transition-colors" />
            <input
                ref={searchInputRef}
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setExpandedItemKey(null); }}
                className="w-full bg-white text-gray-800 rounded-xl py-2.5 pl-9 pr-9 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-shadow"
            />
            <button onClick={startListening} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all ${isListening ? 'bg-red-500 text-white shadow-md scale-110' : 'text-gray-400 hover:bg-gray-100'}`}>
                <MicrophoneIcon className="w-4 h-4" />
            </button>
        </div>
     </div>
  );

  const categorySelectorContent = (
    <div className="relative" ref={categoryDropdownRef}>
        <button 
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="w-full flex items-center justify-between py-1 px-1 transition-all group"
        >
            <div className="flex items-baseline gap-1.5 overflow-hidden">
              <span className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm truncate">
                  {t(selectedCategory.name)}
              </span>
              <ChevronDownIcon className={`w-4 h-4 text-white/70 transition-transform duration-300 flex-shrink-0 ${isCategoryDropdownOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
            </div>
        </button>

        {isCategoryDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white text-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto ring-1 ring-black/5 animate-fade-in origin-top">
                {CATEGORIES.map((c) => {
                    const isPhrases = c.name === 'phrases';
                    // Check if category is generally allowed in current plan
                    const isAllowed = currentLimits.allowedCategories.includes(c.name);
                    
                    // Phrases lock logic: strictly lock if limit reached
                    const isPhrasesLimitReached = isPhrases && userPlan === 'free' && dailyPhraseCount >= FREE_PHRASE_LIMIT;
                    
                    const isLocked = (!isAllowed && userPlan === 'free');
                    const isSelected = selectedCategory.name === c.name;
                    
                    return (
                        <button
                            key={c.name}
                            onClick={() => { handleCategoryChange(c.name); setIsCategoryDropdownOpen(false); }}
                            className={`w-full px-5 py-3 flex items-center justify-between text-left border-b border-gray-50 last:border-0 transition-all ${
                                isPhrases ? 'bg-gray-900 text-white hover:bg-gray-800' : 
                                isSelected ? 'bg-red-50 text-[#c83745]' : 'hover:bg-gray-50'
                            }`}
                        >
                            <span className={`text-sm ${isSelected || isPhrases ? 'font-bold' : 'font-medium text-gray-600'} ${isPhrases ? 'text-white' : ''}`}>{t(c.name)}</span>
                            <div className="flex items-center gap-2">
                                {isPhrases ? (
                                     // If limit reached, show closed lock. Else show open lock (courtesy).
                                     <>
                                        {userPlan === 'free' && (
                                            <span className={`text-xs font-bold ${getCounterTextColor()}`}>
                                                {dailyPhraseCount}/{FREE_PHRASE_LIMIT}
                                            </span>
                                        )}
                                        <span className="text-lg">{isPhrasesLimitReached ? '🔒' : '🔓'}</span>
                                     </>
                                ) : isLocked ? (
                                     <span className="text-lg">🔒</span>
                                ) : null}
                            </div>
                        </button>
                    )
                })}
            </div>
        )}
    </div>
  );

  const subCategoryContent = useMemo(() => {
      if (activeTab === 'favorites' || activeTab === 'list') {
          return null;
      }
      return (
        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar items-center h-10 pl-1">
            {selectedCategory.subCategories.map((sub) => (
                <button
                    key={sub}
                    onClick={() => handleSubCategoryClick(sub)}
                    className={`px-5 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                        selectedSubCategory === sub 
                        ? 'bg-white text-[#c83745] shadow-lg scale-100' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    {t(sub)}
                </button>
            ))}
        </div>
      );
  }, [activeTab, selectedCategory, selectedSubCategory, t]);

  let panelTitle;
  if (activeTab === 'favorites') panelTitle = t('favorites');
  else if (activeTab === 'list') panelTitle = t('shoppingListLabel');

  return (
    <ModuleLayout
        title={t('supermarketGuide')}
        theme={theme}
        userPlan={userPlan}
        t={t}
        onGoHome={onGoHome}
        onOpenMenu={onOpenMenu}
        nativeCountry={nativeCountry}
        targetCountry={targetCountry}
        setNativeCountry={setNativeCountry}
        setTargetCountry={setTargetCountry}
        countries={countries}
        LanguagePairSelect={LanguagePairSelect}
        activeTab={activeTab}
        onTabChange={onTabChange}
        favoritesCount={favorites.length}
        listCount={shoppingList.length}
        isSearchActive={isSearchActive}
        onToggleSearch={onToggleSearch}
        searchBarSlot={searchBarContent}
        categorySelectorSlot={categorySelectorContent}
        subCategorySlot={subCategoryContent}
        panelContent={panelContent}
        panelTitle={panelTitle}
        onOpenLanguageModal={onOpenLanguageModal}
    >
        <div className="space-y-4 pb-4">
            {isSearchActive && searchResults.length === 0 && <p className="text-center text-gray-400 mt-10">{t('noItemsFoundFor')}</p>}
            
            {selectedCategory.name === 'phrases' && !isSearchActive && (
                 <div className="space-y-6">
                    {/* Phrases Limit Counter */}
                    {userPlan === 'free' && (
                        <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-md border border-gray-800 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">{t('freePhrasesLimit')}</span>
                                <span className={`text-sm font-bold ${getCounterTextColor()}`}>{dailyPhraseCount}/{FREE_PHRASE_LIMIT}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div 
                                    className={`${getCounterColor()} h-full rounded-full transition-all duration-500 ease-out`}
                                    style={{ width: `${Math.min(100, (dailyPhraseCount / FREE_PHRASE_LIMIT) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {selectedCategory.subCategories.map((sub) => {
                        const subCategoryItems = PREPOPULATED_TRANSLATIONS['phrases']?.[sub] || [];
                        if (subCategoryItems.length === 0) return null;

                        return (
                            <div key={sub} id={`section-${sub}`} className="scroll-mt-40 bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 ml-1">
                                    {t(sub)}
                                </h3>
                                <div className="space-y-3">
                                    {subCategoryItems.map((rawItem) => {
                                        const item = mapTranslationItem(rawItem, 'phrases', sub, nativeCountry, targetCountry);
                                        return (
                                            <TranslationItem
                                                key={item.key}
                                                item={item}
                                                onPlayAudio={handlePlayAudioWrapper}
                                                onPlayPhrase={handlePlayPhraseWrapper}
                                                nativeCountry={nativeCountry}
                                                targetCountry={targetCountry}
                                                isInShoppingList={shoppingList.some((i) => i.key === item.key)}
                                                isChecked={checkedItems.has(item.key)}
                                                isFavorite={favorites.some((i) => i.key === item.key)}
                                                isExpanded={expandedItemKey === item.key}
                                                onToggleExpand={() => handleToggleExpandWrapper(item.key)}
                                                onToggleShoppingListItem={toggleShoppingListItem}
                                                onToggleFavorite={toggleFavorite}
                                                highlighted={false}
                                                onHighlightDone={() => {}}
                                                t={t}
                                                // Important: Phrases are visually unlocked (🔓 in dropdown) so we pass false here to show Speaker icon,
                                                // but restriction is handled in handlePlayAudioWrapper and handleToggleExpandWrapper
                                                isSpeakerLocked={false} 
                                                isConversationLocked={userPlan === 'free'}
                                                theme={theme}
                                                isPhrase={true}
                                                onOpenPlan={onOpenMenu}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {(isSearchActive || selectedCategory.name !== 'phrases') && searchResults.map((item) => {
                return (
                    <TranslationItem
                    key={item.key}
                    item={item}
                    onPlayAudio={handlePlayAudioWrapper}
                    onPlayPhrase={handlePlayPhraseWrapper}
                    nativeCountry={nativeCountry}
                    targetCountry={targetCountry}
                    isInShoppingList={shoppingList.some((i) => i.key === item.key)}
                    isChecked={checkedItems.has(item.key)}
                    isFavorite={favorites.some((i) => i.key === item.key)}
                    isExpanded={expandedItemKey === item.key}
                    onToggleExpand={() => handleToggleExpandWrapper(item.key)}
                    onToggleShoppingListItem={toggleShoppingListItem}
                    onToggleFavorite={toggleFavorite}
                    highlighted={false}
                    onHighlightDone={() => {}}
                    t={t}
                    isSpeakerLocked={!currentLimits.allowAudio}
                    isConversationLocked={userPlan === 'free'}
                    theme={theme}
                    isPhrase={false}
                    onOpenPlan={onOpenMenu}
                    />
                );
            })}
        </div>
    </ModuleLayout>
  );
}
