
import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import confetti from 'canvas-confetti';
import { CATEGORIES, COUNTRIES, AVAILABLE_MODULES } from './constants';
import { translations } from './translations';
import type { Category, Country, TranslationItem } from './types';
import {
  XIcon,
  ChevronDownIcon,
  RocketIcon,
  PillIcon,
  TruckIcon,
  UtensilsIcon,
  CrownIcon,
  HomeIcon,
  BankIcon,
  DumbbellIcon,
  HospitalIcon,
  BedIcon,
  FuelIcon,
  SchoolIcon,
  WrenchIcon,
  PawIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  CreditCardIcon,
  QrCodeIcon,
  ShoppingBagIcon,
  CartIcon,
  PixIcon,
  BarcodeIcon,
  CheckIcon,
  StarIconSolid,
  ShoppingBagIconSolid
} from './components/Icons';
import { useListManager } from './hooks/useListManager';
import { FavoritesPanel } from './components/FavoritesPanel';
import { ShoppingListPanel } from './components/ShoppingListPanel';
import { LanguagePanel } from './components/LanguagePanel';

// Lazy Load Modules for Performance
const SupermarketModule = React.lazy(() => import('./modules/SupermarketModule'));

type ActiveModule = 'supermarket' | 'pharmacy' | 'restaurant' | 'transport' | 'hotel' | 'bank' | 'gym' | 'hospital' | 'shopping' | 'fuel' | 'school' | 'mechanic' | 'pet' | 'police' | 'post' | null;
type ActiveTab = 'home' | 'search' | 'favorites' | 'list';

// Module Configuration with Colors
const MODULE_THEMES: Record<string, { color: string; lightColor: string; cardBg: string; borderColor: string; icon: any; textColor: string; hex: string }> = {
    supermarket: { color: 'bg-[#c83745]', lightColor: 'bg-red-100', cardBg: 'bg-red-50', borderColor: 'border-red-100', textColor: 'text-[#c83745]', icon: ShoppingBagIcon, hex: '#c83745' },
    pharmacy: { color: 'bg-cyan-600', lightColor: 'bg-cyan-100', cardBg: 'bg-cyan-50', borderColor: 'border-cyan-100', textColor: 'text-cyan-600', icon: PillIcon, hex: '#0891b2' },
    restaurant: { color: 'bg-orange-500', lightColor: 'bg-orange-100', cardBg: 'bg-orange-50', borderColor: 'border-orange-100', textColor: 'text-orange-600', icon: UtensilsIcon, hex: '#f97316' },
    transport: { color: 'bg-amber-500', lightColor: 'bg-amber-100', cardBg: 'bg-amber-50', borderColor: 'border-amber-100', textColor: 'text-amber-600', icon: TruckIcon, hex: '#f59e0b' },
    hotel: { color: 'bg-indigo-600', lightColor: 'bg-indigo-100', cardBg: 'bg-indigo-50', borderColor: 'border-indigo-100', textColor: 'text-indigo-600', icon: BedIcon, hex: '#4f46e5' },
    bank: { color: 'bg-slate-700', lightColor: 'bg-slate-200', cardBg: 'bg-slate-100', borderColor: 'border-slate-200', textColor: 'text-slate-700', icon: BankIcon, hex: '#334155' },
    gym: { color: 'bg-emerald-600', lightColor: 'bg-emerald-100', cardBg: 'bg-emerald-50', borderColor: 'border-emerald-100', textColor: 'text-emerald-600', icon: DumbbellIcon, hex: '#059669' },
    hospital: { color: 'bg-rose-600', lightColor: 'bg-rose-100', cardBg: 'bg-rose-50', borderColor: 'border-rose-100', textColor: 'text-rose-600', icon: HospitalIcon, hex: '#e11d48' },
    shopping: { color: 'bg-pink-500', lightColor: 'bg-pink-100', cardBg: 'bg-pink-50', borderColor: 'border-pink-100', textColor: 'text-pink-600', icon: CartIcon, hex: '#ec4899' },
    fuel: { color: 'bg-blue-700', lightColor: 'bg-blue-100', cardBg: 'bg-blue-50', borderColor: 'border-blue-100', textColor: 'text-blue-700', icon: FuelIcon, hex: '#1d4ed8' },
    school: { color: 'bg-teal-600', lightColor: 'bg-teal-100', cardBg: 'bg-teal-50', borderColor: 'border-teal-100', textColor: 'text-teal-600', icon: SchoolIcon, hex: '#0d9488' },
    mechanic: { color: 'bg-zinc-600', lightColor: 'bg-zinc-200', cardBg: 'bg-zinc-100', borderColor: 'border-zinc-200', textColor: 'text-zinc-600', icon: WrenchIcon, hex: '#52525b' },
    pet: { color: 'bg-lime-600', lightColor: 'bg-lime-100', cardBg: 'bg-lime-50', borderColor: 'border-lime-100', textColor: 'text-lime-600', icon: PawIcon, hex: '#65a30d' },
    police: { color: 'bg-blue-900', lightColor: 'bg-blue-200', cardBg: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-900', icon: ShieldCheckIcon, hex: '#1e3a8a' },
    post: { color: 'bg-yellow-500', lightColor: 'bg-yellow-100', cardBg: 'bg-yellow-50', borderColor: 'border-yellow-100', textColor: 'text-yellow-600', icon: EnvelopeIcon, hex: '#eab308' },
};

const getInitialCountries = (): { native: Country; target: Country } => {
  let native = COUNTRIES.find((c) => c.code === 'us')!;

  if (typeof navigator !== 'undefined' && navigator.language) {
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    const langMap: Record<string, string> = {
      pt: 'br',
      en: 'us',
      es: 'cl',
      fr: 'fr',
      it: 'it',
    };
    const defaultCountryCode = langMap[browserLang];
    if (defaultCountryCode) {
      const foundCountry = COUNTRIES.find((c) => c.code === defaultCountryCode);
      if (foundCountry) native = foundCountry;
    }
  } else {
    native = COUNTRIES.find((c) => c.code === 'br')!;
  }

  const target =
    native.code === 'br'
      ? COUNTRIES.find((c) => c.code === 'cl')!
      : COUNTRIES.find((c) => c.code === 'br')!;

  return { native, target };
};

const initialCountries = getInitialCountries();

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
};

const LoadingSpinner = () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c83745]"></div>
    </div>
);

const App: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [activeModule, setActiveModule] = useState<ActiveModule>(null);
  const [nativeCountry, setNativeCountry] = useState<Country>(initialCountries.native);
  const [targetCountry, setTargetCountry] = useState<Country>(initialCountries.target);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'premium' | 'master'>('free');
  
  // Popup state for Language
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // Module-specific UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [expandedItemKey, setExpandedItemKey] = useState<string | null>(null);

  // Determine current theme based on active module
  const currentTheme = useMemo(() => {
      if (!activeModule) return MODULE_THEMES['supermarket']; 
      return MODULE_THEMES[activeModule] || MODULE_THEMES['supermarket'];
  }, [activeModule]);

  // Plan Restrictions
  const PLAN_LIMITS = {
      free: {
          allowedCategories: ['produce', 'butcher', 'phrases'],
          allowAudio: true,
      },
      premium: {
          allowedCategories: CATEGORIES.map(c => c.name),
          allowAudio: true,
      },
      master: {
          allowedCategories: CATEGORIES.map(c => c.name),
          allowAudio: true,
      }
  };

  const currentLimits = PLAN_LIMITS[userPlan];

  // Initialize list manager based on active module to scope storage
  const { 
    shoppingList, 
    checkedItems, 
    favorites, 
    toggleShoppingListItem, 
    toggleCheckedItem, 
    toggleFavorite 
  } = useListManager(activeModule || ''); 


  const t = useCallback(
    (key: string): string => {
      const lang = nativeCountry.lang as keyof typeof translations;
      const langSet = translations[lang] || translations['en-US'];
      return langSet[key as keyof typeof langSet] || key;
    },
    [nativeCountry],
  );

  // Module Management
  useEffect(() => {
      const savedModule = localStorage.getItem('activeModule');
      if (savedModule && MODULE_THEMES[savedModule] && AVAILABLE_MODULES.includes(savedModule)) {
          setActiveModule(savedModule as ActiveModule);
      }
      const savedPlan = localStorage.getItem('userPlan');
      if (savedPlan && (savedPlan === 'free' || savedPlan === 'premium' || savedPlan === 'master')) {
           setUserPlan(savedPlan as 'free' | 'premium' | 'master');
      }
  }, []);

  useEffect(() => {
    localStorage.setItem('userPlan', userPlan);
  }, [userPlan]);

  const handleModuleSelect = (moduleName: ActiveModule) => {
      if (moduleName === null) {
          setActiveModule(null);
          localStorage.removeItem('activeModule');
          return;
      }
      
      if (!AVAILABLE_MODULES.includes(moduleName)) {
          return;
      }

      setActiveModule(moduleName);
      localStorage.setItem('activeModule', moduleName);
      setIsMenuOpen(false);
  };

  useEffect(() => {
    if (globalError) {
      const timer = setTimeout(() => setGlobalError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [globalError]);

  const handlePlayAudio = useCallback(
    (text: string, lang: string) => {
      if (!isOnline) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang; 
            const voices = window.speechSynthesis.getVoices();
            const nativeVoice = voices.find(v => v.lang === lang);
            if (nativeVoice) {
                utterance.voice = nativeVoice;
            }
            window.speechSynthesis.speak(utterance);
            setGlobalError(t('usingOfflineVoice'));
        } else {
            setGlobalError(t('audioUnavailableOffline'));
        }
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      let audioLang = lang;
      if (lang === 'es-CL' || lang === 'es-AR') {
          audioLang = 'es-US';
      }

      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${audioLang}&client=tw-ob&q=${encodeURIComponent(text)}`;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onerror = (e) => {
        console.error("Google TTS playback error", e);
        if ('speechSynthesis' in window) {
             const utterance = new SpeechSynthesisUtterance(text);
             utterance.lang = lang;
             window.speechSynthesis.speak(utterance);
             setGlobalError(t('usingOfflineVoice'));
        } else {
             setGlobalError(t('audioPlaybackError'));
        }
      };
      audio.play().catch((err) => console.error("Play failed", err));
    },
    [isOnline, t],
  );

  const handlePlayPhrase = useCallback((phraseType: 'ask' | 'want', item: TranslationItem) => {
      // Removed explicit restriction based on free plan here, logic is now handled by UI locking
      const lang = targetCountry.lang;
       let phrase = '';
      if (phraseType === 'want') {
        if (lang === 'pt-BR' || lang === 'pt-PT') {
          const article = item.gender_pt === 'f' ? 'a ' : item.gender_pt === 'm' ? 'o ' : '';
          phrase = `Vou levar ${article}${item.key}, por favor.`;
        } else {
          const phrases: Record<string, string> = {
            'es-CL': `Llevaré ${item.translated_term}, por favor.`,
            'es-AR': `Llevaré ${item.translated_term}, por favor.`,
            'es-ES': `Me llevaré ${item.translated_term}, por favor.`,
            'en-GB': `I'll take ${item.translated_term}, please.`,
            'en-US': `I'll take ${item.translated_term}, please.`,
            'fr-FR': `Je vais prendre ${item.translated_term}, s'il vous plaît.`,
            'it-IT': `Prendo ${item.translated_term}, per favore.`,
          };
          phrase = phrases[lang] || `I'll take ${item.translated_term}, please.`;
        }
      } else { 
        const phraseTemplates: Record<string, string> = {
          'pt-BR': `Com licença, você tem ${item.translated_term}?`,
          'pt-PT': `Com licença, tem ${item.translated_term}?`,
          'es-CL': `Disculpe, ¿tiene ${item.translated_term}?`,
          'es-AR': `Disculpe, ¿tiene ${item.translated_term}?`,
          'es-ES': `Perdone, ¿tiene ${item.translated_term}?`,
          'en-GB': `Excuse me, do you have ${item.translated_term}?`,
          'en-US': `Excuse me, do you have ${item.translated_term}?`,
          'fr-FR': `Excusez-moi, avez-vous ${item.translated_term} ?`,
          'it-IT': `Mi scusi, ha ${item.translated_term}?`,
        };
        phrase = phraseTemplates[lang] || `Do you have ${item.translated_term}?`;
      }
      handlePlayAudio(phrase, lang);
    },
    [handlePlayAudio, targetCountry],
  );

  const handleTabChange = (tab: ActiveTab) => {
      if (tab === activeTab) {
          setActiveTab('home');
          return;
      }
      setActiveTab(tab);
      
      if (tab === 'home' || tab === 'favorites' || tab === 'list') {
          setIsSearchActive(false);
      } else if (tab === 'search') {
          setIsSearchActive(true);
      }
  };


  // --- RENDER MODULES ---
  let panelContent = null;
  let panelTitle = null;

  if (activeTab === 'favorites') {
    panelTitle = t('favorites');
    panelContent = <FavoritesPanel 
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
        isSpeakerLocked={!currentLimits.allowAudio}
        isConversationLocked={userPlan === 'free'}
        theme={currentTheme}
        onOpenPlan={() => setIsMenuOpen(true)}
    />
  } else if (activeTab === 'list') {
      panelTitle = t('shoppingListLabel');
      panelContent = <ShoppingListPanel 
          shoppingList={shoppingList}
          favorites={favorites}
          t={t}
          onPlayAudio={handlePlayAudio}
          onPlayPhrase={handlePlayPhrase}
          nativeCountry={nativeCountry}
          targetCountry={targetCountry}
          checkedItems={checkedItems}
          expandedItemKey={expandedItemKey}
          setExpandedItemKey={setExpandedItemKey}
          toggleShoppingListItem={toggleShoppingListItem}
          toggleFavorite={toggleFavorite}
          isSpeakerLocked={!currentLimits.allowAudio}
          isConversationLocked={userPlan === 'free'}
          theme={currentTheme}
          onOpenPlan={() => setIsMenuOpen(true)}
      />
  }

  // --- RENDER HUB (LANDING PAGE) ---
  if (activeModule === null) {
      const modules = Object.keys(MODULE_THEMES).map(key => {
           const theme = MODULE_THEMES[key];
           const isImplemented = AVAILABLE_MODULES.includes(key);
           
           const isLocked = !isImplemented; 

           return {
               id: key,
               icon: <theme.icon className="w-8 h-8" />,
               label: t(key === 'supermarket' ? 'supermarketGuide' : `module${key.charAt(0).toUpperCase() + key.slice(1)}`),
               color: `${theme.lightColor} ${theme.textColor}`,
               cardBg: theme.cardBg,
               borderColor: theme.borderColor,
               locked: isLocked,
               isComingSoon: !isImplemented
           }
      });

      const isPanelOpen = activeTab === 'favorites' || activeTab === 'list';

      return (
          <div className="bg-gray-100 min-h-screen font-sans flex justify-center">
            <div className="w-full max-w-md bg-white text-gray-800 shadow-2xl flex flex-col h-screen relative overflow-hidden">
                 <header className={`p-6 pb-10 ${currentTheme.color} text-white shadow-md rounded-b-3xl z-30 transition-colors duration-300 relative`}>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-sm opacity-80">{t('welcomeBack')}</p>
                            <h1 className="text-2xl font-bold">{t('hubTitle')}</h1>
                        </div>
                    </div>
                    
                    <div 
                        className={`p-3 rounded-xl text-white text-sm flex items-center gap-2 shadow-sm cursor-pointer transition-all ${
                            userPlan === 'free' 
                            ? 'bg-white/20 hover:bg-white/30' 
                            : 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:opacity-90 shadow-md'
                        }`}
                        onClick={() => setIsMenuOpen(true)}
                    >
                        {userPlan !== 'free' && <CrownIcon className="w-4 h-4" />}
                        <span className="font-bold uppercase tracking-wider flex-1">
                            {t('planLabel')} - {t(userPlan === 'free' ? 'planFree' : (userPlan === 'premium' ? 'planPremium' : 'planMaster'))}
                        </span>
                        {userPlan === 'free' && (
                             <span className="text-xs opacity-80 underline">{t('unlockExperience')}</span>
                        )}
                    </div>
                 </header>

                 <main className="flex-1 p-6 overflow-y-auto pb-32">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">{t('hubSubtitle')}</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {modules.map((mod) => (
                            <button 
                                key={mod.id}
                                onClick={() => !mod.locked && handleModuleSelect(mod.id as ActiveModule)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl shadow-sm border aspect-square justify-center group relative overflow-hidden ${mod.locked ? 'cursor-not-allowed bg-gray-50 border-gray-100' : `${mod.cardBg} ${mod.borderColor} hover:shadow-md transition-all hover:scale-105`}`}
                            >
                                <div className={`flex flex-col items-center gap-2 w-full h-full justify-center ${mod.locked ? 'filter blur-[2px] opacity-50 grayscale' : ''}`}>
                                    <div className={`p-3 rounded-full ${mod.color} ${!mod.locked && 'group-hover:brightness-110 transition-all'}`}>
                                        {mod.icon}
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 text-center leading-tight">{mod.label}</span>
                                </div>
                                {mod.locked && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                        {mod.isComingSoon ? (
                                            <div className="bg-gray-800/80 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-sm backdrop-blur-sm">
                                                {t('comingSoon')}
                                            </div>
                                        ) : (
                                            <div className="bg-white p-2 rounded-full shadow-md ring-1 ring-red-200 flex items-center justify-center">
                                                <span className="text-xl">🔒</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                 </main>

                 {/* Sliding Panel */}
                 <div 
                    className={`absolute inset-x-0 bottom-0 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-40 transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) flex flex-col overflow-hidden border-t border-gray-100`}
                    style={{ 
                        top: '11rem', 
                        bottom: '0',
                        transform: isPanelOpen ? 'translateY(0)' : 'translateY(100%)'
                    }}
                  >
                      {/* Panel Header */}
                      <div className={`w-full flex flex-col items-center pt-3 pb-2 relative transition-colors duration-300 ${panelTitle ? currentTheme.color : 'bg-white'}`}>
                          <div 
                            className={`w-12 h-1.5 rounded-full cursor-pointer mb-3 ${panelTitle ? 'bg-white/30' : 'bg-gray-200'}`} 
                            onClick={() => handleTabChange('home')}
                          ></div>
                          {panelTitle && (
                              <div className="flex items-center justify-between w-full px-6 pb-3">
                                  <div className="w-9"></div> 
                                  <h2 className="text-xl font-bold uppercase tracking-widest text-center text-white shadow-sm">
                                      {panelTitle}
                                  </h2>
                                  <button 
                                    onClick={() => handleTabChange('home')}
                                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                                  >
                                    <XIcon className="w-5 h-5" />
                                  </button>
                              </div>
                          )}
                      </div>
                      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4 bg-white">
                          {panelContent}
                      </div>
                 </div>

                 {/* Navigation Bar */}
                 <nav className={`absolute bottom-0 w-full ${currentTheme.color} grid grid-cols-3 h-20 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.15)] items-end pb-0 transition-all duration-300`}>
                      {/* Favorites Tab */}
                      <button 
                          onClick={() => handleTabChange('favorites')}
                          className={`flex flex-col justify-end items-center w-full transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                              activeTab === 'favorites' 
                              ? 'bg-white rounded-t-2xl h-24 pb-6 pt-4 shadow-[0_-4px_15px_rgba(0,0,0,0.1)] translate-y-0 z-10' 
                              : 'h-20 pb-6 translate-y-2 opacity-80 hover:opacity-100'
                          }`}
                      >
                          <div className="relative mb-1 transition-transform duration-300 group-hover:scale-110">
                              <StarIconSolid className={`w-7 h-7 transition-colors duration-300 ${activeTab === 'favorites' ? currentTheme.textColor : 'text-white'}`} />
                              {favorites.length > 0 && activeTab !== 'favorites' && (
                                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full ring-2 ring-red-600/50 shadow-sm"></span>
                              )}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 px-2 text-center leading-tight ${activeTab === 'favorites' ? currentTheme.textColor : 'text-white'}`}>
                              {t('favorites')}
                          </span>
                      </button>

                      {/* Center Language Selector Panel Trigger */}
                      <div className="relative h-full w-full flex justify-center pointer-events-none">
                            <button
                                onClick={() => setIsLanguageModalOpen(true)}
                                className={`w-20 h-20 rounded-full border-[6px] flex items-center justify-center bg-slate-800 overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer absolute bottom-8 z-50 pointer-events-auto shadow-xl`}
                                style={{ borderColor: currentTheme.hex }}
                            >
                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full z-30 pointer-events-none"></div>
                                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"></div>
                                
                                <img
                                src={targetCountry.image}
                                alt={targetCountry.name}
                                className="w-full h-full object-cover z-10"
                                />
                            </button>
                      </div>

                      {/* Shopping List Tab */}
                      <button 
                          onClick={() => handleTabChange('list')}
                          className={`flex flex-col justify-end items-center w-full transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                              activeTab === 'list' 
                              ? 'bg-white rounded-t-2xl h-24 pb-6 pt-4 shadow-[0_-4px_15px_rgba(0,0,0,0.1)] translate-y-0 z-10' 
                              : 'h-20 pb-6 translate-y-2 opacity-80 hover:opacity-100'
                          }`}
                      >
                          <div className="relative mb-1 transition-transform duration-300 group-hover:scale-110">
                              <ShoppingBagIconSolid className={`w-7 h-7 transition-colors duration-300 ${activeTab === 'list' ? currentTheme.textColor : 'text-white'}`} />
                              {shoppingList.length > 0 && (
                                  <span className={`absolute -top-2 -right-2 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full text-[9px] font-bold shadow-sm transition-colors ${activeTab === 'list' ? 'bg-red-600 text-white' : 'bg-white text-red-600'}`}>
                                  {shoppingList.length}
                                  </span>
                              )}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 px-1 text-center leading-tight ${activeTab === 'list' ? currentTheme.textColor : 'text-white'}`}>
                              {t('shoppingListLabel')}
                          </span>
                      </button>
                 </nav>
            </div>
            
            {/* Global Language Modal */}
            <LanguagePanel 
                 isOpen={isLanguageModalOpen}
                 onClose={() => setIsLanguageModalOpen(false)}
                 nativeCountry={nativeCountry}
                 targetCountry={targetCountry}
                 onNativeChange={setNativeCountry}
                 onTargetChange={setTargetCountry}
                 options={COUNTRIES}
                 t={t}
                 theme={currentTheme}
            />

            {isMenuOpen && (
                <MenuModal 
                   t={t} 
                   userPlan={userPlan} 
                   setUserPlan={setUserPlan} 
                   onClose={() => setIsMenuOpen(false)}
                   activeModule={null}
                   onSelectModule={handleModuleSelect}
                   currentLimits={currentLimits}
                   openCategory={null}
                   theme={currentTheme}
                />
            )}
          </div>
      );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen font-sans flex justify-center">
        
        {globalError && (
            <div className="fixed top-0 left-0 right-0 p-3 text-center text-sm shadow-lg flex justify-between items-center z-[100] bg-yellow-400 text-black max-w-md mx-auto">
              <span>{globalError}</span>
              <button onClick={() => { setGlobalError(null); }}>
                <XIcon className="w-5 h-5" />
              </button>
            </div>
        )}

        <Suspense fallback={<LoadingSpinner />}>
            {activeModule === 'supermarket' && (
                <SupermarketModule 
                    nativeCountry={nativeCountry}
                    targetCountry={targetCountry}
                    userPlan={userPlan}
                    t={t}
                    onOpenMenu={() => setIsMenuOpen(true)}
                    onGoHome={() => handleModuleSelect(null)}
                    theme={currentTheme}
                    isOnline={isOnline}
                    currentLimits={currentLimits}
                    LanguagePairSelect={LanguagePairSelect}
                    setNativeCountry={setNativeCountry}
                    setTargetCountry={setTargetCountry}
                    countries={COUNTRIES}
                    handlePlayAudio={handlePlayAudio}
                    handlePlayPhrase={handlePlayPhrase}
                    // State and handlers from App.tsx
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    isSearchActive={isSearchActive}
                    onToggleSearch={() => setIsSearchActive(!isSearchActive)}
                    favorites={favorites}
                    shoppingList={shoppingList}
                    checkedItems={checkedItems}
                    toggleFavorite={toggleFavorite}
                    toggleShoppingListItem={toggleShoppingListItem}
                    panelContent={panelContent}
                    expandedItemKey={expandedItemKey}
                    setExpandedItemKey={setExpandedItemKey}
                    onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
                />
            )}

            {activeModule !== 'supermarket' && activeModule !== null && AVAILABLE_MODULES.includes(activeModule) && (
                <div className="w-full max-w-md bg-white text-gray-800 shadow-2xl flex flex-col h-screen relative">
                    <header className={`p-4 ${currentTheme.color} text-white flex items-center justify-between shadow-md transition-colors duration-300`}>
                        <button onClick={() => handleModuleSelect(null)} className="p-2 bg-white/20 rounded-full">
                            <HomeIcon className="w-5 h-5" />
                        </button>
                        <h1 className="font-bold text-lg">{t(`module${activeModule.charAt(0).toUpperCase() + activeModule.slice(1)}`)}</h1>
                        <div className="w-9"></div>
                    </header>
                    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        {React.createElement(currentTheme.icon, { className: `w-20 h-20 ${currentTheme.textColor} opacity-20 mb-4` })}
                        <RocketIcon className="w-16 h-16 text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-700">{t('comingSoon')}</h2>
                        <p className="text-gray-500 mt-2">This module is enabled but content is loading...</p>
                        <button onClick={() => handleModuleSelect(null)} className={`mt-8 px-6 py-3 rounded-full ${currentTheme.color} text-white font-bold shadow-lg`}>
                            {t('changeModule')}
                        </button>
                    </main>
                </div>
            )}
        </Suspense>
        
        {/* Global Language Modal */}
        <LanguagePanel 
             isOpen={isLanguageModalOpen}
             onClose={() => setIsLanguageModalOpen(false)}
             nativeCountry={nativeCountry}
             targetCountry={targetCountry}
             onNativeChange={setNativeCountry}
             onTargetChange={setTargetCountry}
             options={COUNTRIES}
             t={t}
             theme={currentTheme}
        />

        {isMenuOpen && (
          <MenuModal 
            t={t} 
            userPlan={userPlan} 
            setUserPlan={setUserPlan} 
            onClose={() => setIsMenuOpen(false)} 
            activeModule={activeModule}
            onSelectModule={handleModuleSelect}
            currentLimits={currentLimits}
            openCategory={null}
            theme={currentTheme}
          />
        )}

    </div>
  );
};

// --- SHARED COMPONENTS ---

const MenuModal: React.FC<{ 
    t: any; 
    userPlan: any; 
    setUserPlan: any; 
    onClose: any;
    activeModule: ActiveModule;
    onSelectModule: (mod: ActiveModule) => void;
    currentLimits: any;
    openCategory: any;
    theme: { color: string; textColor: string };
}> = ({ t, userPlan, setUserPlan, onClose, activeModule, onSelectModule, currentLimits, theme }) => {
    const [step, setStep] = useState<'plans' | 'checkout'>('plans');
    const [selectedPlan, setSelectedPlan] = useState<'premium' | 'master' | null>(null);
    const [paymentCountry, setPaymentCountry] = useState<'cl' | 'br'>('cl');
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

    const handlePlanSelect = (plan: 'premium' | 'master') => {
        setSelectedPlan(plan);
        setStep('checkout');
    };

    const handleSubscribe = (plan: 'free' | 'premium' | 'master') => {
        setUserPlan(plan);
        // Celebrate
        const duration = 1.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
        const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
            return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
        
        confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
        colors: ['#c83745', '#fbbf24', '#ffffff'] 
        });

        setTimeout(() => {
            onClose();
        }, 1500);
    };

    const getPriceDisplay = () => {
        if (!selectedPlan) return '';
        if (paymentCountry === 'br') {
            return selectedPlan === 'premium' ? t('priceTravelerBR').split('/')[0] : t('priceMasterBR').split('/')[0];
        }
        if (paymentCountry === 'cl') {
            const price = selectedPlan === 'premium' ? t('priceTravelerCL') : t('priceMasterCL');
            // Ensure we only get the price part if it has /month
            return price.split('/')[0];
        }
        return selectedPlan === 'premium' ? t('priceTraveler').split('/')[0] : t('priceMaster').split('/')[0];
    };

    const getCurrencyCode = () => {
        return paymentCountry === 'br' ? 'BRL' : 'CLP';
    };

    return (
        <div className="absolute inset-0 z-50 bg-gray-100 flex flex-col animate-fade-in">
            <div className={`${theme.color} p-4 pt-6 text-white shadow-lg flex items-center justify-between transition-colors duration-300`}>
              <h2 className="text-2xl font-bold">{step === 'checkout' ? t('subscriptionCheckout') : t('menu')}</h2>
              <button onClick={() => {
                  if(step === 'checkout') setStep('plans');
                  else onClose();
              }} className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                {step === 'checkout' ? <ChevronDownIcon className="w-6 h-6 rotate-90" /> : <XIcon className="w-6 h-6" />}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {step === 'plans' && (
                <>
                  {activeModule && (
                      <button 
                        onClick={() => onSelectModule(null)}
                        className={`w-full bg-white border-2 ${theme.textColor.replace('text', 'border')} ${theme.textColor} font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-colors`}
                      >
                          <HomeIcon className="w-5 h-5" />
                          {t('changeModule')}
                      </button>
                  )}

                  <section>
                    <h3 className="text-gray-800 font-bold text-lg mb-3 flex items-center gap-2">
                      <RocketIcon className={`w-5 h-5 ${theme.textColor}`} />
                      {t('plans')}
                    </h3>
                    <div className="space-y-4">
                      <div className={`bg-white rounded-xl p-4 shadow-sm border-2 relative ${userPlan === 'free' ? 'border-gray-400' : 'border-transparent'}`}>
                        {userPlan === 'free' && (
                            <div className="absolute top-3 right-3 bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                              {t('currentPlan')}
                            </div>
                        )}
                        <h4 className="text-xl font-bold text-gray-800">{t('planFree')}</h4>
                        <p className="text-gray-500 text-sm mt-1">{t('planFreeDesc')}</p>
                        <button onClick={() => { setUserPlan('free'); onClose(); }} className="mt-4 w-full bg-gray-200 text-gray-900 font-bold py-3 rounded-xl border border-gray-300 hover:bg-gray-300 transition-colors">
                            {t('stayOnFree')}
                        </button>
                      </div>

                      <div className={`bg-gradient-to-r from-[#c83745] to-[#e65c6a] rounded-xl p-4 shadow-md text-white relative overflow-hidden ${userPlan === 'premium' ? 'ring-4 ring-[#c83745]/30' : ''}`}>
                        <div className="absolute -right-4 -top-4 bg-white/20 w-24 h-24 rounded-full blur-xl"></div>
                        {userPlan === 'premium' && (
                            <div className="absolute top-3 right-3 bg-white text-[#c83745] text-xs font-bold px-2 py-1 rounded shadow">
                              {t('currentPlan')}
                            </div>
                        )}
                        <h4 className="text-xl font-bold flex items-center gap-2">
                          {t('planPremium')}
                          <CrownIcon className="w-5 h-5 fill-current text-yellow-300" />
                        </h4>
                        <p className="text-white/90 text-sm mt-1">{t('planPremiumDesc')}</p>
                        <p className="text-white font-bold text-lg mt-2">{t('priceTraveler')}</p>
                        {userPlan !== 'premium' && (
                            <button onClick={() => handlePlanSelect('premium')} className="mt-4 w-full bg-white text-[#c83745] font-bold py-2 rounded-lg shadow hover:bg-gray-50 transition-colors">
                              {t('subscribe')}
                            </button>
                        )}
                      </div>

                      <div className={`bg-gray-900 rounded-xl p-4 shadow-md text-white border border-gray-700 ${userPlan === 'master' ? 'ring-4 ring-gray-500/50' : ''}`}>
                        {userPlan === 'master' && (
                            <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded shadow">
                              {t('currentPlan')}
                            </div>
                        )}
                        <h4 className="text-xl font-bold text-yellow-400">{t('planMaster')}</h4>
                        <p className="text-gray-400 text-sm mt-1">{t('planMasterDesc')}</p>
                        <p className="text-white font-bold text-lg mt-2">{t('priceMaster')}</p>
                          {userPlan !== 'master' && (
                            <button onClick={() => handlePlanSelect('master')} className="mt-4 w-full bg-gray-700 text-white font-bold py-2 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600">
                              {t('subscribe')}
                            </button>
                          )}
                      </div>
                    </div>
                  </section>
                </>
              )}

              {step === 'checkout' && selectedPlan && (
                  <div className="space-y-4">
                      
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                         <h4 className="text-gray-500 text-xs uppercase font-bold mb-3">{t('billingCountry')}</h4>
                         <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={() => { setPaymentCountry('cl'); setPaymentMethod(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-all ${paymentCountry === 'cl' ? 'border-[#c83745] bg-red-50' : 'border-gray-200 grayscale'}`}
                            >
                                <img src="https://flagcdn.com/cl.svg" alt="Chile" className="w-6 h-4 rounded shadow-sm" />
                                <span className={`text-sm font-bold ${paymentCountry === 'cl' ? 'text-gray-800' : 'text-gray-500'}`}>Chile</span>
                            </button>
                            <button 
                                onClick={() => { setPaymentCountry('br'); setPaymentMethod(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-all ${paymentCountry === 'br' ? 'border-[#c83745] bg-red-50' : 'border-gray-200 grayscale'}`}
                            >
                                <img src="https://flagcdn.com/br.svg" alt="Brazil" className="w-6 h-4 rounded shadow-sm" />
                                <span className={`text-sm font-bold ${paymentCountry === 'br' ? 'text-gray-800' : 'text-gray-500'}`}>Brasil</span>
                            </button>
                         </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                          <h4 className="text-gray-500 text-xs uppercase font-bold mb-1">{t('totalToPay')}</h4>
                          <div className="flex justify-between items-center">
                              <span className="text-2xl font-bold text-gray-800">
                                  {getPriceDisplay()}
                              </span>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{getCurrencyCode()}</span>
                          </div>
                      </div>
                      
                      <div>
                          <h4 className="text-gray-800 font-bold mb-3">{t('selectPaymentMethod')}</h4>
                          <div className="space-y-3">
                              
                              {paymentCountry === 'cl' && (
                                  <>
                                    <button 
                                        onClick={() => setPaymentMethod('debit_cl')}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'debit_cl' ? 'border-[#c83745] bg-red-50' : 'border-gray-200 bg-white'}`}
                                    >
                                        <div className="bg-orange-500 p-2 rounded text-white flex-shrink-0">
                                            <CreditCardIcon className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-800 text-sm">{t('methodDebit')}</p>
                                            <p className="text-xs text-gray-500">Webpay / Redcompra / Cuenta RUT</p>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('credit_cl')}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'credit_cl' ? 'border-[#c83745] bg-red-50' : 'border-gray-200 bg-white'}`}
                                    >
                                        <div className="bg-blue-600 p-2 rounded text-white flex-shrink-0">
                                            <CreditCardIcon className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-800 text-sm">{t('methodCredit')}</p>
                                            <p className="text-xs text-gray-500">Visa / Mastercard / Amex</p>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('mercadopago_cl')}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'mercadopago_cl' ? 'border-[#c83745] bg-red-50' : 'border-gray-200 bg-white'}`}
                                    >
                                        <div className="bg-blue-400 p-2 rounded text-white flex-shrink-0">
                                            <QrCodeIcon className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-800 text-sm">{t('methodMercadoPago')}</p>
                                            <p className="text-xs text-gray-500">App / QR / Saldo</p>
                                        </div>
                                    </button>
                                  </>
                              )}

                              {paymentCountry === 'br' && (
                                  <>
                                    <button 
                                        onClick={() => setPaymentMethod('pix')}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'pix' ? 'border-[#c83745] bg-red-50' : 'border-gray-200 bg-white'}`}
                                    >
                                        <div className="bg-teal-600 p-2 rounded text-white flex-shrink-0">
                                            <PixIcon className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-800 text-sm">{t('methodPix')}</p>
                                            <p className="text-xs text-gray-500">Aprovação imediata</p>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('credit_br')}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'credit_br' ? 'border-[#c83745] bg-red-50' : 'border-gray-200 bg-white'}`}
                                    >
                                        <div className="bg-blue-600 p-2 rounded text-white flex-shrink-0">
                                            <CreditCardIcon className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-800 text-sm">{t('methodCredit')}</p>
                                            <p className="text-xs text-gray-500">Até 12x sem juros</p>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('boleto')}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'boleto' ? 'border-[#c83745] bg-red-50' : 'border-gray-200 bg-white'}`}
                                    >
                                        <div className="bg-gray-600 p-2 rounded text-white flex-shrink-0">
                                            <BarcodeIcon className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-800 text-sm">{t('methodBoleto')}</p>
                                            <p className="text-xs text-gray-500">Aprovação em 1-2 dias úteis</p>
                                        </div>
                                    </button>
                                  </>
                              )}
                          </div>
                      </div>
                      <button 
                          disabled={!paymentMethod}
                          onClick={() => handleSubscribe(selectedPlan)}
                          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg mt-8 transition-all ${paymentMethod ? 'bg-[#c83745] hover:bg-[#b02a36]' : 'bg-gray-300 cursor-not-allowed'}`}
                      >
                          {t('payNow')}
                      </button>
                  </div>
              )}
            </div>
          </div>
    )
}

const LanguagePairSelect: React.FC<{
  nativeCountry: Country;
  targetCountry: Country;
  onNativeChange: (country: Country) => void;
  onTargetChange: (country: Country) => void;
  options: Country[];
  t: (key: string) => string;
  alignment?: 'center' | 'right';
  triggerClassName?: string;
  style?: React.CSSProperties;
}> = ({ nativeCountry, targetCountry, onNativeChange, onTargetChange, options, t, alignment = 'center', triggerClassName, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Countries that are not fully supported yet
  const comingSoonCodes = ['us', 'pt', 'es', 'fr', 'it'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderOption = (opt: Country, isSelected: boolean, onClick: () => void) => {
      const isComingSoon = comingSoonCodes.includes(opt.code);

      return (
        <div key={opt.code} className="relative flex flex-col items-center group">
             <button
                onClick={onClick}
                className={`rounded-full cursor-pointer w-12 h-12 flex items-center justify-center transition-all duration-300 relative overflow-hidden border-[3px] bg-white ${
                    isSelected 
                    ? 'border-slate-800 shadow-lg scale-110 z-10 ring-2 ring-offset-1 ring-slate-400 grayscale-0 opacity-100' 
                    : 'border-gray-300 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-105'
                }`}
                title={opt.name}
            >
                <img
                    src={opt.image}
                    alt={opt.name}
                    className="w-full h-full object-cover z-10"
                />
            </button>
            {isComingSoon && (
                <div className="absolute -bottom-2 z-20 bg-gray-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-gray-600 pointer-events-none whitespace-nowrap">
                    Em breve
                </div>
            )}
        </div>
      );
  };

  return (
    <div className="relative z-[60]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClassName || "w-20 h-20 rounded-full border-[5px] border-slate-800 shadow-2xl relative overflow-hidden transform transition-transform hover:scale-105 bg-slate-800 group"}
        style={style}
      >
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-t-full z-30 pointer-events-none"></div>
        
        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] z-20 pointer-events-none"></div>
        
        <img
          src={targetCountry.image}
          alt={targetCountry.name}
          className="w-full h-full object-cover z-10"
        />
      </button>
      {isOpen && (
        <div className={`absolute z-[70] top-full mt-3 w-80 bg-white rounded-xl shadow-2xl flex flex-col ring-1 ring-black/5 animate-expand-down origin-top ${alignment === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}>
          <div className={`absolute -top-2 w-4 h-4 bg-slate-700 rotate-45 ${alignment === 'right' ? 'right-6' : 'left-1/2 -translate-x-1/2'} z-0`}></div>

          <div className="bg-slate-100 rounded-t-xl z-10 relative overflow-hidden">
            <div className="bg-slate-700 text-white p-2 px-4 font-bold text-sm uppercase tracking-wider flex items-center shadow-sm relative z-10">
                {t('myLanguage')}...
            </div>
            <div className="p-4 grid grid-cols-4 gap-x-2 gap-y-4">
              {options.map((opt) => renderOption(opt, nativeCountry.code === opt.code, () => onNativeChange(opt)))}
            </div>
          </div>

          <div className="bg-red-50 rounded-b-xl z-10 relative overflow-hidden">
             <div className="bg-[#c83745] text-white p-2 px-4 font-bold text-sm uppercase tracking-wider flex items-center shadow-sm relative z-10">
                {t('iAmIn')}...
            </div>
            <div className="p-4 grid grid-cols-4 gap-x-2 gap-y-4">
               {options.map((opt) => renderOption(opt, targetCountry.code === opt.code, () => onTargetChange(opt)))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
