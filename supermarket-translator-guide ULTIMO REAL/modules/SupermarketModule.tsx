
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CATEGORIES, PREPOPULATED_TRANSLATIONS } from '../constants';
import type { Category, Country, TranslationItem as TranslationItemType } from '../types';
import {
  SearchIcon,
  ChevronDownIcon,
  MicrophoneIcon,
  XIcon
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
  theme: { color: string; textColor: string; hex: string; borderColor: string };
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

// Pastel colors for inactive tabs to look like file folders
const FOLDER_COLORS = [
    'bg-orange-100 text-orange-900 border-orange-200',
    'bg-amber-100 text-amber-900 border-amber-200',
    'bg-yellow-100 text-yellow-900 border-yellow-200',
    'bg-lime-100 text-lime-900 border-lime-200',
    'bg-emerald-100 text-emerald-900 border-emerald-200',
    'bg-teal-100 text-teal-900 border-teal-200',
    'bg-cyan-100 text-cyan-900 border-cyan-200',
    'bg-sky-100 text-sky-900 border-sky-200',
    'bg-indigo-100 text-indigo-900 border-indigo-200',
    'bg-violet-100 text-violet-900 border-violet-200',
    'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200',
    'bg-pink-100 text-pink-900 border-pink-200',
    'bg-rose-100 text-rose-900 border-rose-200',
];

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
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  
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
           const firstSub = selectedCategory.subCategories[0];
           setSelectedSubCategory(firstSub);
           // Reset scroll to start when category changes
           if (tabsContainerRef.current) {
               tabsContainerRef.current.scrollLeft = 0;
           }
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

  const handleSubCategoryClick = (sub: string, index: number) => {
      setSelectedSubCategory(sub);
      if (selectedCategory.name === 'phrases') {
          const element = document.getElementById(`section-${sub}`);
          if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Scroll the clicked tab into view and center it
      if (tabsContainerRef.current) {
          const tabElement = tabsContainerRef.current.children[index] as HTMLElement;
          if (tabElement) {
              tabElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                  inline: 'center'
              });
          }
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
        <div className="relative group flex items-center max-w-3xl mx-auto w-full">
            <SearchIcon className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <input
                ref={searchInputRef}
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setExpandedItemKey(null); }}
                className="w-full bg-white text-gray-800 rounded-xl py-3 pl-10 pr-20 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-shadow h-12"
            />
            
            <div className="absolute right-1.5 flex items-center gap-1">
                {/* Close/Clear Button */}
                <button
                    onClick={() => {
                        if (searchTerm) {
                            setSearchTerm('');
                            searchInputRef.current?.focus();
                        } else {
                            onToggleSearch();
                        }
                    }}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                {/* Microphone Button - Enhanced Visibility */}
                <button 
                    onClick={startListening} 
                    className={`p-2 rounded-full transition-all shadow-sm border ${isListening ? 'bg-red-600 text-white scale-110 border-red-700 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'}`}
                >
                    <MicrophoneIcon className="w-5 h-5" />
                </button>
            </div>
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
                    const isAllowed = currentLimits.allowedCategories.includes(c.name);
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
        <div className="w-full flex justify-center">
            <div 
                ref={tabsContainerRef}
                className="flex items-end gap-1 px-4 overflow-x-auto no-scrollbar pb-0 w-full max-w-7xl scroll-smooth touch-pan-x overscroll-x-contain cursor-grab active:cursor-grabbing"
                style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {selectedCategory.subCategories.map((sub, index) => {
                    const isActive = selectedSubCategory === sub;
                    // Cycle through distinct pastel colors for inactive tabs
                    const folderColor = FOLDER_COLORS[index % FOLDER_COLORS.length];
                    
                    return (
                        <button
                            key={sub}
                            onClick={() => handleSubCategoryClick(sub, index)}
                            className={`
                                relative px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 mb-0 border-t border-l border-r
                                ${isActive 
                                    ? `bg-slate-50 ${theme.textColor} font-bold shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-10 scale-105 -translate-y-0.5 border-white pb-3` 
                                    : `${folderColor} opacity-95 hover:opacity-100 hover:scale-100 scale-95 translate-y-0.5 z-0 border-white/20 shadow-inner`
                                }
                            `}
                        >
                            {t(sub)}
                        </button>
                    )
                })}
                {/* Spacer to ensure last item isn't stuck to edge */}
                <div className="w-4 flex-shrink-0"></div> 
            </div>
        </div>
      );
  }, [activeTab, selectedCategory, selectedSubCategory, t, theme]);

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
        <div className="space-y-4">
            {isSearchActive && searchResults.length === 0 && <p className="text-center text-gray-400 mt-10">{t('noItemsFoundFor')}</p>}
            
            {selectedCategory.name === 'phrases' && !isSearchActive && (
                 <div className="space-y-6 max-w-3xl mx-auto">
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

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4 ${selectedCategory.name === 'phrases' && !isSearchActive ? 'hidden' : ''}`}>
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
        </div>
    </ModuleLayout>
  );
}
