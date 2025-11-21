
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PHARMACY_CATEGORIES, PREPOPULATED_TRANSLATIONS } from '../constants';
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
import { playSound } from '../utils/soundUtils';

interface PharmacyModuleProps {
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

// Pastel colors for inactive tabs to look like file folders
const FOLDER_COLORS = [
    'bg-emerald-100 text-emerald-900 border-emerald-200',
    'bg-teal-100 text-teal-900 border-teal-200',
    'bg-cyan-100 text-cyan-900 border-cyan-200',
    'bg-sky-100 text-sky-900 border-sky-200',
    'bg-blue-100 text-blue-900 border-blue-200',
    'bg-indigo-100 text-indigo-900 border-indigo-200',
];

export default function PharmacyModule({
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
}: PharmacyModuleProps) {
  
  const [selectedCategory, setSelectedCategory] = useState<Category>(() => {
    try {
      const savedCatName = localStorage.getItem('pharmacy_lastCategory');
      if (savedCatName) {
        const found = PHARMACY_CATEGORIES.find(c => c.name === savedCatName);
        if (found) return found;
      }
    } catch (e) { console.error("Error loading category from storage", e); }
    return PHARMACY_CATEGORIES[0];
  });

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(() => {
    try {
        const savedSub = localStorage.getItem('pharmacy_lastSubCategory');
        if (savedSub) return savedSub;
    } catch (e) { console.error("Error loading subcategory from storage", e); }
    return PHARMACY_CATEGORIES[0].subCategories[0];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  
  const handleVoiceResult = useCallback((text: string) => {
    setSearchTerm(text);
    onTabChange('search');
    setExpandedItemKey(null);
  }, [onTabChange, setExpandedItemKey]);

  const { isListening, startListening } = useVoiceSearch(nativeCountry.lang, handleVoiceResult, t);

  // Effects
  useEffect(() => {
    if (selectedCategory.name !== 'favorites') {
        localStorage.setItem('pharmacy_lastCategory', selectedCategory.name);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubCategory) {
        localStorage.setItem('pharmacy_lastSubCategory', selectedSubCategory);
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

  const handlePlayAudioWrapper = useCallback((text: string, lang: string) => {
      handlePlayAudio(text, lang);
  }, [handlePlayAudio]);

  // Wrapper for conversation phrases (Ask/Want buttons)
  const handlePlayPhraseWrapper = useCallback((phraseType: 'ask' | 'want', item: TranslationItemType) => {
      handlePlayPhrase(phraseType, item);
  }, [handlePlayPhrase]);


  const handleToggleExpandWrapper = useCallback((itemKey: string) => {
        setExpandedItemKey(expandedItemKey === itemKey ? null : itemKey);
  }, [expandedItemKey, setExpandedItemKey]);

  const searchResults = useMemo((): TranslationItemType[] => {
    let results: TranslationItemType[] = [];

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();

      for (const categoryName in PREPOPULATED_TRANSLATIONS) {
        // Check if the category exists in Pharmacy categories
        const isPharmacyCategory = PHARMACY_CATEGORIES.some(c => c.name === categoryName);
        if (!isPharmacyCategory) continue;

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
    } else {
      const categoryData = PREPOPULATED_TRANSLATIONS[selectedCategory.name];
      if (categoryData && categoryData[selectedSubCategory]) {
        results = categoryData[selectedSubCategory].map((item) =>
          mapTranslationItem(item, selectedCategory.name, selectedSubCategory, nativeCountry, targetCountry),
        );
      }
    }
    
    // Sort alphabetically by native term
    return results.sort((a, b) => a.source_term.localeCompare(b.source_term));
  }, [searchTerm, selectedCategory, selectedSubCategory, nativeCountry, targetCountry]);


  const handleCategoryChange = (categoryKey: string) => {
    setSearchTerm('');
    onTabChange('home');
    
    playSound('click');
    const newCategory = PHARMACY_CATEGORIES.find((c) => c.name === categoryKey);
    if (newCategory) {
      setSelectedCategory(newCategory);
    }
  };

  const handleSubCategoryClick = (sub: string, index: number) => {
      playSound('page-turn'); // Paper sound
      setSelectedSubCategory(sub);
      
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
                className="w-full bg-white text-gray-800 rounded-xl py-3 pl-10 pr-20 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-shadow h-12"
            />
            
            <div className="absolute right-1.5 flex items-center gap-1">
                {/* Close/Clear Button */}
                <button
                    onClick={() => {
                        playSound('click');
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
                    onClick={() => { playSound('click'); startListening(); }} 
                    className={`p-2 rounded-full transition-all shadow-sm border ${isListening ? 'bg-emerald-600 text-white scale-110 border-emerald-700 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'}`}
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
            onClick={() => { playSound('click'); setIsCategoryDropdownOpen(!isCategoryDropdownOpen); }}
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
                {PHARMACY_CATEGORIES.map((c) => {
                    const isSelected = selectedCategory.name === c.name;
                    
                    return (
                        <button
                            key={c.name}
                            onClick={() => { handleCategoryChange(c.name); setIsCategoryDropdownOpen(false); }}
                            className={`w-full px-5 py-3 flex items-center justify-between text-left border-b border-gray-50 last:border-0 transition-all ${
                                isSelected ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-50'
                            }`}
                        >
                            <span className={`text-sm ${isSelected ? 'font-bold' : 'font-medium text-gray-600'}`}>{t(c.name)}</span>
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
        <div className="w-full flex justify-center relative z-20">
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
                                    ? `bg-slate-50 ${theme.textColor} font-bold shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-20 scale-105 -translate-y-0.5 border-white pb-3` 
                                    : `${folderColor} opacity-95 hover:opacity-100 hover:scale-100 scale-95 translate-y-0.5 z-0 border-white/20 shadow-inner`
                                }
                            `}
                        >
                            {t(sub)}
                        </button>
                    )
                })}
                {/* Spacer to ensure last item isn't stuck to edge */}
                <div className="w-6 flex-shrink-0"></div> 
            </div>
        </div>
      );
  }, [activeTab, selectedCategory, selectedSubCategory, t, theme]);

  let panelTitle;
  if (activeTab === 'favorites') panelTitle = t('favorites');
  else if (activeTab === 'list') panelTitle = t('shoppingListLabel');

  return (
    <ModuleLayout
        title={t('modulePharmacy')}
        theme={theme}
        userPlan={'master'}
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                {searchResults.map((item) => {
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
                        isConversationLocked={false}
                        theme={theme}
                        isPhrase={false}
                        onOpenPlan={onOpenMenu}
                        isPharmacy={true}
                        />
                    );
                })}
            </div>
        </div>
    </ModuleLayout>
  );
}
