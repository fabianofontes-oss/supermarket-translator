import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PREPOPULATED_TRANSLATIONS } from '../data/catalog';
import type { Category, Country, TranslationItem as TranslationItemType } from '../types';
import { SearchIcon, ChevronDownIcon, MicrophoneIcon, XIcon } from '../components/Icons';
import { TranslationItem } from '../components/TranslationItem';
import { CategorySheet } from '../components/CategorySheet';
import { metaFor } from '../components/categoryMeta';
import { ModuleLayout } from '../components/ModuleLayout';
import { FavoritesPanel } from '../components/FavoritesPanel';
import { ShoppingListPanel } from '../components/ShoppingListPanel';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { mapTranslationItem } from '../utils/itemHelpers';
import { MAX_SEARCH_RESULTS, MIN_SEARCH_LENGTH, matchesSearch, normalizeForSearch } from '../utils/searchText';
import { playSound } from '../utils/soundUtils';
import type { VoiceStatus } from '../utils/speech';

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
  /** Categoria de estreia. Só vale para quem nunca abriu este módulo. */
  defaultCategoryName?: string;

  nativeCountry: Country;
  targetCountry: Country;
  t: (key: string) => string;
  onGoHome: () => void;
  theme: { color: string; textColor: string; hex: string; borderColor: string };
  handlePlayAudio: (text: string, lang: string) => void;
  handlePlayPhrase: (phraseType: 'ask' | 'want', item: TranslationItemType) => void;
  /** Voz do idioma de destino no aparelho; 'missing' apaga os botões de áudio. */
  voiceStatus?: VoiceStatus;

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
  onOpenShare: () => void;
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

/** O que a tela precisa saber para decidir o que mostrar. */
type SearchOutcome = {
  /** browse = sem termo; tooShort = 1 caractere; results = busca de verdade. */
  mode: 'browse' | 'tooShort' | 'results';
  items: TranslationItemType[];
  /** Total encontrado antes do teto de exibição. */
  total: number;
};

export default function CatalogModule({
  titleKey,
  categories,
  storagePrefix,
  isPharmacy = false,
  defaultCategoryName,
  nativeCountry,
  targetCountry,
  t,
  onGoHome,
  theme,
  handlePlayAudio,
  handlePlayPhrase,
  voiceStatus = 'unknown',
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
  onOpenShare,
}: CatalogModuleProps) {
  const catKey = `${storagePrefix}_lastCategory`;
  const subKey = `${storagePrefix}_lastSubCategory`;

  // Resolvida uma vez, na montagem. Quem já usou volta para a sua categoria;
  // só quem nunca abriu cai na de estreia.
  const initialCategory = useMemo(() => {
    try {
      const saved = localStorage.getItem(catKey);
      const found = saved ? categories.find((c) => c.name === saved) : undefined;
      if (found) return found;
    } catch (e) { console.error('Error loading category from storage', e); }
    return categories.find((c) => c.name === defaultCategoryName) ?? categories[0];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- valor de montagem
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(subKey);
      // A subcategoria salva só serve se pertencer à categoria que foi resolvida.
      // Sem esta checagem o app grava a subcategoria de outra categoria antes do
      // efeito consertar, e a primeira abertura fica errada.
      if (saved && initialCategory.subCategories.includes(saved)) return saved;
    } catch (e) { console.error('Error loading subcategory from storage', e); }
    return initialCategory.subCategories[0] ?? '';
  });

  const [searchTerm, setSearchTerm] = useState('');
  // O campo responde na hora; a varredura espera a digitação parar.
  const [debouncedTerm, setDebouncedTerm] = useState('');
  useEffect(() => {
    // Limpar e apagar são imediatos: só adiar quando há o que procurar.
    if (!searchTerm.trim()) { setDebouncedTerm(''); return; }
    const timer = window.setTimeout(() => setDebouncedTerm(searchTerm), 150);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

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

  // O painel fecha sozinho quando a tela muda debaixo dele: na busca o gatilho
  // some, e nos painéis de favoritos e lista ele fica inacessível.
  useEffect(() => {
    if (isSearchActive || activeTab !== 'home') setIsCategorySheetOpen(false);
  }, [isSearchActive, activeTab]);

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

  /**
   * Índice de busca do módulo: cada item já resolvido pelo MESMO
   * `mapTranslationItem` que o card usa para desenhar.
   *
   * Antes a busca tinha a própria regra (`translations[code] || source_term`),
   * de um passo só, enquanto o card usava a cadeia de quatro passos. Onde
   * faltasse a chave do país, a busca comparava um texto e o card mostrava
   * outro — o item aparecia como "Apple" e não era encontrado por "Apple".
   *
   * Recalculado só quando muda o par de idiomas (ou o módulo), não a cada
   * tecla: o custo de mapear o catálogo sai do caminho da digitação.
   */
  const searchIndex = useMemo(() => {
    const entries: { item: TranslationItemType; haystack: string }[] = [];
    for (const categoryName in PREPOPULATED_TRANSLATIONS) {
      if (!categories.some((c) => c.name === categoryName)) continue;
      for (const subCategoryName in PREPOPULATED_TRANSLATIONS[categoryName]) {
        for (const raw of PREPOPULATED_TRANSLATIONS[categoryName][subCategoryName]) {
          const item = mapTranslationItem(raw, categoryName, subCategoryName, nativeCountry, targetCountry);
          // Exatamente os dois textos que o card mostra: nada de campo extra.
          entries.push({
            item,
            haystack: `${normalizeForSearch(item.source_term)}\n${normalizeForSearch(item.translated_term)}`,
          });
        }
      }
    }
    return entries.sort((a, b) => a.item.source_term.localeCompare(b.item.source_term));
  }, [categories, nativeCountry, targetCountry]);

  const search = useMemo((): SearchOutcome => {
    const term = normalizeForSearch(debouncedTerm);

    if (!term) {
      const categoryData = PREPOPULATED_TRANSLATIONS[selectedCategory.name];
      const items = categoryData?.[selectedSubCategory]
        ? categoryData[selectedSubCategory]
            .map((raw) => mapTranslationItem(raw, selectedCategory.name, selectedSubCategory, nativeCountry, targetCountry))
            .sort((a, b) => a.source_term.localeCompare(b.source_term))
        : [];
      return { mode: 'browse', items, total: items.length };
    }

    // Uma letra varria o catálogo inteiro e devolvia 669 cards.
    if (term.length < MIN_SEARCH_LENGTH) return { mode: 'tooShort', items: [], total: 0 };

    const found = searchIndex.filter((e) => matchesSearch(e.haystack, term));
    return {
      mode: 'results',
      items: found.slice(0, MAX_SEARCH_RESULTS).map((e) => e.item),
      total: found.length,
    };
  }, [debouncedTerm, searchIndex, selectedCategory, selectedSubCategory, nativeCountry, targetCountry]);

  const searchResults = search.items;

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
    voiceStatus,
  });

  const searchBarContent = (
    <div className="px-4 pb-2 pt-1">
      <div className="relative group flex items-center max-w-3xl mx-auto w-full">
        <SearchIcon className="absolute left-3 w-5 h-5 text-gray-500 pointer-events-none z-10" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setExpandedItemKey(null); }}
          className="w-full bg-white text-gray-800 rounded-xl py-3 pl-10 pr-20 text-sm shadow-md focus:ring-2 focus:ring-black/10 transition-shadow h-12"
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
            aria-label={t('dirClear')}
            className="hit p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => { playSound('click'); startListening(); }}
            aria-label={t('a11yVoice')}
            className={`hit p-2 rounded-full tap shadow-sm border ${isListening ? `${theme.color} text-white scale-110 border-transparent animate-pulse` : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'}`}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const currentMeta = metaFor(selectedCategory.name);
  const CurrentIcon = currentMeta.icon;

  // Antes isto era só um texto branco enorme, maior que o próprio título da
  // página, então lia como cabeçalho e ninguém tocava. Agora é uma linha
  // branca com ícone, rótulo e seta à direita: a gramática de um seletor.
  const categorySelectorContent = (
    <button
      onClick={() => { playSound('click'); setIsCategorySheetOpen(true); }}
      aria-haspopup="dialog"
      aria-expanded={isCategorySheetOpen}
      aria-label={`${t('categoryLabel')}: ${t(selectedCategory.name)}`}
      className="w-full h-14 flex items-center gap-3 px-3 rounded-2xl bg-white shadow-md ring-1 ring-black/5 tap active:scale-[0.98]"
    >
      <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${currentMeta.iconClass}`}>
        <CurrentIcon className="w-5 h-5" />
      </span>
      <span className="flex-1 min-w-0 text-left">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-none" dir="auto">
          {t('categoryLabel')}
        </span>
        <span className={`block text-base font-bold truncate leading-tight ${theme.textColor}`} dir="auto">
          {t(selectedCategory.name)}
        </span>
      </span>
      <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${theme.hex}1a` }}>
        <ChevronDownIcon className={`w-4 h-4 ${theme.textColor} transition-transform duration-300 ${isCategorySheetOpen ? 'rotate-180' : ''}`} />
      </span>
    </button>
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
                className={`hit relative px-4 py-2.5 rounded-t-xl text-sm font-medium tap whitespace-nowrap flex-shrink-0 mb-0 border-t border-l border-r ${
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
        voiceStatus={voiceStatus}
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
        voiceStatus={voiceStatus}
      />
    );
  }

  const showPhraseSections = isPhrasesCategory && !isSearchActive;

  return (
    <>
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
      onOpenShare={onOpenShare}
    >
      <div className="space-y-4">
        {/* Uma letra não é "nada encontrado": é um pedido de mais letras. */}
        {search.mode === 'tooShort' && (
          <p className="text-center text-gray-500 mt-10" dir="auto">{t('searchMinChars')}</p>
        )}

        {search.mode === 'results' && search.total === 0 && (
          <p className="text-center text-gray-500 mt-10" dir="auto">{t('noItemsFoundFor')}</p>
        )}

        {/* Nunca esconder em silêncio que existem mais. */}
        {search.mode === 'results' && search.total > searchResults.length && (
          <p className="text-center text-xs text-gray-500 -mb-1" dir="auto">
            {t('searchShowingOf')
              .replace('{shown}', String(searchResults.length))
              .replace('{total}', String(search.total))}
          </p>
        )}

        {showPhraseSections && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {selectedCategory.subCategories.map((sub) => {
              const subCategoryItems = PREPOPULATED_TRANSLATIONS['phrases']?.[sub] || [];
              if (subCategoryItems.length === 0) return null;
              return (
                <div key={sub} id={`section-${sub}`} className="scroll-mt-40 bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 ml-1">
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
              <TranslationItem
                key={item.key}
                {...itemProps(item, item.category === 'phrases')}
                // Dois "Soro Fisiológico" só se distinguem pela posição no
                // catálogo. A identidade da Fase 1 já os separa por dentro;
                // aqui é o usuário que precisa enxergar a diferença.
                contextLabel={search.mode === 'results' && item.category && item.subCategory
                  ? `${t(item.category)} › ${t(item.subCategory)}`
                  : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </ModuleLayout>

      <CategorySheet
        isOpen={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
        categories={categories}
        selectedName={selectedCategory.name}
        onSelect={(name) => { handleCategoryChange(name); setIsCategorySheetOpen(false); }}
        theme={theme}
        t={t}
      />
    </>
  );
}
