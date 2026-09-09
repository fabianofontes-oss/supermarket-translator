import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PREPOPULATED_TRANSLATIONS } from '../constants';
import type { Category, Country, TranslationItem as TranslationItemType } from '../types';
import { SearchIcon, ChevronDownIcon, MicrophoneIcon, XIcon } from '../components/Icons';
import { TranslationItem } from '../components/TranslationItem';
import { ModuleLayout } from '../components/ModuleLayout';
import { FavoritesPanel } from '../components/FavoritesPanel';
import { ShoppingListPanel } from '../components/ShoppingListPanel';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { mapTranslationItem } from '../utils/itemHelpers';
import { playSound } from '../utils/soundUtils';

/**
 * Módulo genérico de catálogo (Supermercado, Farmácia e futuros módulos de lista).
 * Recebe as categorias e um prefixo de armazenamento; a lógica de busca, abas,
 * favoritos e lista de compras é a mesma para todos.
 */
export interface CatalogModuleProps {
  titleKey: string;
  categories: Category[];
  storagePrefix: string;
  isPharmacy?: boolean;

  nativeCountry: Country;
  targetCountry: Country;
  t: (key: string) => string;
  onGoHome: () => void;
  theme: { color: string; textColor: string; hex: string; borderColor: string };
  handlePlayAudio: (text: string, lang: string) => void;
  handlePlayPhrase: (phraseType: 'ask' | 'want', item: TranslationItemType) => void;

  activeTab: 'home' | 'search' | 'favorites' | 'list';
  onTabChange: (tab: 'home' | 'search' | 'favorites' | 'list') => void;
  isSearchActive: boolean;
  onToggleSearch: () => void;
  favorites: TranslationItemType[];
  shoppingList: TranslationItemType[];
  checkedItems: Set<string>;
  toggleFavorite: (item: TranslationItemType) => void;
  toggleShoppingListItem: (item: TranslationItemType) => void;
  expandedItemKey: string | null;
  setExpandedItemKey: (key: string | null) => void;
  onOpenLanguageModal: () => void;
}

// Cores pastel das abas inativas (efeito de pastas de arquivo)
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

export default function CatalogModule({
  titleKey,
  categories,
  storagePrefix,
  isPharmacy = false,
  nativeCountry,
  targetCountry,
  t,
  onGoHome,
  theme,
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
  expandedItemKey,
  setExpandedItemKey,
  onOpenLanguageModal,
}: CatalogModuleProps) {
  const catKey = `${storagePrefix}_lastCategory`;
  const subKey = `${storagePrefix}_lastSubCategory`;

  const [selectedCategory, setSelectedCategory] = useState<Category>(() => {
    try {
      const saved = localStorage.getItem(catKey);
      const found = saved ? categories.find((c) => c.name === saved) : undefined;
      if (found) return found;
    } catch (e) { console.error('Error loading category from storage', e); }
    return categories[0];
  });

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(subKey);
      if (saved) return saved;
    } catch (e) { console.error('Error loading subcategory from storage', e); }
    return categories[0].subCategories[0];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const isPhrasesCategory = selectedCategory.name === 'phrases';

  const handleVoiceResult = useCallback((text: string) => {
    setSearchTerm(text);
    onTabChange('search');
    setExpandedItemKey(null);
  }, [onTabChange, setExpandedItemKey]);

  const { isListening, startListening } = useVoiceSearch(nativeCountry.lang, handleVoiceResult, t);

  // Persistência da última categoria/subcategoria
  useEffect(() => {
    try { localStorage.setItem(catKey, selectedCategory.name); } catch { /* ignore */ }
  }, [selectedCategory, catKey]);

  useEffect(() => {
    if (selectedSubCategory) {
      try { localStorage.setItem(subKey, selectedSubCategory); } catch { /* ignore */ }
    }
  }, [selectedSubCategory, subKey]);

  // Fecha o menu de categorias ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Garante que a subcategoria pertence à categoria atual
  useEffect(() => {
    if (selectedCategory.subCategories.length > 0) {
      if (!selectedCategory.subCategories.includes(selectedSubCategory)) {
        setSelectedSubCategory(selectedCategory.subCategories[0]);
        if (tabsContainerRef.current) tabsContainerRef.current.scrollLeft = 0;
      }
    } else {
      setSelectedSubCategory('');
    }
    setExpandedItemKey(null);
  }, [selectedCategory, selectedSubCategory, setExpandedItemKey]);

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) searchInputRef.current.focus();
  }, [isSearchActive]);

  const handleToggleExpand = useCallback((itemKey: string) => {
    setExpandedItemKey(expandedItemKey === itemKey ? null : itemKey);
  }, [expandedItemKey, setExpandedItemKey]);

  const searchResults = useMemo((): TranslationItemType[] => {
    let results: TranslationItemType[] = [];

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      for (const categoryName in PREPOPULATED_TRANSLATIONS) {
        if (!categories.some((c) => c.name === categoryName)) continue;
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

    return results.sort((a, b) => a.source_term.localeCompare(b.source_term));
  }, [searchTerm, selectedCategory, selectedSubCategory, nativeCountry, targetCountry, categories]);

  const handleCategoryChange = (categoryKey: string) => {
    setSearchTerm('');
    onTabChange('home');
    playSound('click');
    const newCategory = categories.find((c) => c.name === categoryKey);
    if (newCategory) setSelectedCategory(newCategory);
  };

  const handleSubCategoryClick = (sub: string, index: number) => {
    playSound('page-turn');
    setSelectedSubCategory(sub);
    if (isPhrasesCategory) {
      const element = document.getElementById(`section-${sub}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (tabsContainerRef.current) {
      const tabElement = tabsContainerRef.current.children[index] as HTMLElement | undefined;
      tabElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  // Props comuns a todos os cards
  const itemProps = (item: TranslationItemType, isPhrase: boolean) => ({
    item,
    onPlayAudio: handlePlayAudio,
    onPlayPhrase: handlePlayPhrase,
    nativeCountry,
    targetCountry,
    isInShoppingList: shoppingList.some((i) => i.key === item.key),
    isChecked: checkedItems.has(item.key),
    isFavorite: favorites.some((i) => i.key === item.key),
    isExpanded: expandedItemKey === item.key,
    onToggleExpand: () => handleToggleExpand(item.key),
    onToggleShoppingListItem: toggleShoppingListItem,
    onToggleFavorite: toggleFavorite,
    highlighted: false,
    onHighlightDone: () => {},
    t,
    isSpeakerLocked: false,
    isConversationLocked: false,
    theme,
    isPhrase,
    onOpenPlan: () => {},
    isPharmacy,
  });

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
          className="w-full bg-white text-gray-800 rounded-xl py-3 pl-10 pr-20 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-black/10 transition-shadow h-12"
        />
        <div className="absolute right-1.5 flex items-center gap-1">
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
          <button
            onClick={() => { playSound('click'); startListening(); }}
            className={`p-2 rounded-full tap shadow-sm border ${isListening ? `${theme.color} text-white scale-110 border-transparent animate-pulse` : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'}`}
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
        className="w-full flex items-center justify-between py-1 px-1 tap group"
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
          {categories.map((c) => {
            const isPhrases = c.name === 'phrases';
            const isSelected = selectedCategory.name === c.name;
            return (
              <button
                key={c.name}
                onClick={() => { handleCategoryChange(c.name); setIsCategoryDropdownOpen(false); }}
                className={`w-full px-5 py-3 flex items-center justify-between text-left border-b border-gray-50 last:border-0 tap ${
                  isPhrases ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : isSelected ? `bg-gray-100 ${theme.textColor}`
                  : 'hover:bg-gray-50'
                }`}
              >
                <span className={`text-sm ${isSelected || isPhrases ? 'font-bold' : 'font-medium text-gray-600'}`}>{t(c.name)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const subCategoryContent = useMemo(() => {
    if (activeTab === 'favorites' || activeTab === 'list') return null;
    return (
      <div className="w-full flex justify-center relative z-20">
        <div
          ref={tabsContainerRef}
          className="flex items-end gap-1 px-4 overflow-x-auto no-scrollbar pb-0 w-full max-w-7xl scroll-smooth touch-pan-x overscroll-x-contain cursor-grab active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {selectedCategory.subCategories.map((sub, index) => {
            const isActive = selectedSubCategory === sub;
            const folderColor = FOLDER_COLORS[index % FOLDER_COLORS.length];
            return (
              <button
                key={sub}
                onClick={() => handleSubCategoryClick(sub, index)}
                className={`relative px-4 py-2.5 rounded-t-xl text-sm font-medium tap whitespace-nowrap flex-shrink-0 mb-0 border-t border-l border-r ${
                  isActive
                    ? `bg-slate-50 ${theme.textColor} font-bold shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-20 scale-105 -translate-y-0.5 border-white pb-3`
                    : `${folderColor} opacity-95 hover:opacity-100 hover:scale-100 scale-95 translate-y-0.5 z-0 border-white/20 shadow-inner`
                }`}
              >
                {t(sub)}
              </button>
            );
          })}
          <div className="w-6 flex-shrink-0"></div>
        </div>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedCategory, selectedSubCategory, t, theme]);

  // Painéis deslizantes (favoritos e lista)
  let panelTitle: string | undefined;
  let panelContent: React.ReactNode = null;
  if (activeTab === 'favorites') {
    panelTitle = t('favorites');
    panelContent = (
      <FavoritesPanel
        favorites={favorites}
        t={t}
        onPlayAudio={handlePlayAudio}
        onPlayPhrase={handlePlayPhrase}
        nativeCountry={nativeCountry}
        targetCountry={targetCountry}
        shoppingList={shoppingList}
        checkedItems={checkedItems}
        expandedItemKey={expandedItemKey}
        setExpandedItemKey={setExpandedItemKey}
        toggleShoppingListItem={toggleShoppingListItem}
        toggleFavorite={toggleFavorite}
        isSpeakerLocked={false}
        isConversationLocked={false}
        theme={theme}
        onOpenPlan={() => {}}
        isPharmacy={isPharmacy}
      />
    );
  } else if (activeTab === 'list') {
    panelTitle = t('shoppingListLabel');
    panelContent = (
      <ShoppingListPanel
        shoppingList={shoppingList}
        favorites={favorites}
        checkedItems={checkedItems}
        t={t}
        onPlayAudio={handlePlayAudio}
        onPlayPhrase={handlePlayPhrase}
        nativeCountry={nativeCountry}
        targetCountry={targetCountry}
        expandedItemKey={expandedItemKey}
        setExpandedItemKey={setExpandedItemKey}
        toggleShoppingListItem={toggleShoppingListItem}
        toggleFavorite={toggleFavorite}
        isSpeakerLocked={false}
        isConversationLocked={false}
        theme={theme}
        onOpenPlan={() => {}}
        isPharmacy={isPharmacy}
      />
    );
  }

  const showPhraseSections = isPhrasesCategory && !isSearchActive;

  return (
    <ModuleLayout
      title={t(titleKey)}
      theme={theme}
      t={t}
      onGoHome={onGoHome}
      targetCountry={targetCountry}
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
        {isSearchActive && searchResults.length === 0 && (
          <p className="text-center text-gray-400 mt-10">{t('noItemsFoundFor')}</p>
        )}

        {showPhraseSections && (
          <div className="space-y-6 max-w-3xl mx-auto">
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
                      return <TranslationItem key={item.key} {...itemProps(item, true)} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!showPhraseSections && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {searchResults.map((item) => (
              <TranslationItem key={item.key} {...itemProps(item, item.category === 'phrases')} />
            ))}
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
