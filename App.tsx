
import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { COUNTRIES } from './constants';
import type { Country, TranslationItem } from './types';
import SupermarketModule from './modules/SupermarketModule';
import PharmacyModule from './modules/PharmacyModule';
import RestaurantModule from './modules/RestaurantModule';
import { translations } from './translations';
import { useListManager } from './hooks/useListManager';
import { LanguagePanel } from './components/LanguagePanel';
import { FavoritesPanel } from './components/FavoritesPanel';
import { ShoppingListPanel } from './components/ShoppingListPanel';
import { playSound } from './utils/soundUtils';
import { 
    XIcon, 
    ShareIcon, 
    PlusSquareIcon,
    ShoppingBagIcon,
    PillIcon,
    UtensilsIcon,
    TruckIcon,
    BedIcon,
    BankIcon,
    DumbbellIcon,
    HospitalIcon,
    FuelIcon,
    SchoolIcon,
    WrenchIcon,
    PawIcon,
    ShieldCheckIcon,
    EnvelopeIcon,
    ShoppingBagIconSolid,
    CrownIcon,
    CheckIcon,
    CreditCardIcon,
    PixIcon,
    BarcodeIcon,
    QrCodeIcon
} from './components/Icons';

const SUPERMARKET_THEME = {
  color: 'bg-red-600',
  textColor: 'text-red-600',
  hex: '#dc2626',
  borderColor: 'border-red-600'
};

const PHARMACY_THEME = {
  color: 'bg-emerald-600',
  textColor: 'text-emerald-600',
  hex: '#059669',
  borderColor: 'border-emerald-600'
};

const RESTAURANT_THEME = {
  color: 'bg-orange-600',
  textColor: 'text-orange-600',
  hex: '#ea580c',
  borderColor: 'border-orange-600'
};

export default function App() {
    // Navigation State
    const [currentModule, setCurrentModule] = useState<'supermarket' | 'pharmacy' | 'restaurant' | null>(null);

    const [nativeCountry, setNativeCountry] = useState<Country>(COUNTRIES.find(c => c.code === 'br') || COUNTRIES[0]);
    const [targetCountry, setTargetCountry] = useState<Country>(COUNTRIES.find(c => c.code === 'us') || COUNTRIES[4]);
    
    // PWA Install State
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    // Module State
    const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites' | 'list'>('home');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [expandedItemKey, setExpandedItemKey] = useState<string | null>(null);
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

    // Use distinct list managers for each module to keep lists separate
    const supermarketLists = useListManager('supermarket');
    const pharmacyLists = useListManager('pharmacy');
    const restaurantLists = useListManager('restaurant');

    // Helper to get current lists based on active module
    const getCurrentLists = () => {
        if (currentModule === 'pharmacy') return pharmacyLists;
        if (currentModule === 'restaurant') return restaurantLists;
        return supermarketLists;
    };

    const { 
        shoppingList, 
        checkedItems, 
        favorites, 
        toggleShoppingListItem, 
        toggleFavorite 
    } = getCurrentLists();

    const t = (key: string) => {
        const lang = nativeCountry.lang || 'en-US';
        // @ts-ignore
        const terms = translations[lang] || translations['en-US'];
        return terms[key] || key;
    };

    // Reset tab state when switching modules
    useEffect(() => {
        setActiveTab('home');
        setIsSearchActive(false);
        setExpandedItemKey(null);
    }, [currentModule]);

    // PWA Install Logic
    useEffect(() => {
        // Check if already installed
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);

        // Detect iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        // Capture install prompt (Android/Desktop)
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show modal only if not already installed and not recently dismissed
            if (!isStandaloneMode && !localStorage.getItem('installDismissed')) {
                setShowInstallModal(true);
            }
        };

        // Show iOS modal if not installed and not dismissed
        if (isIosDevice && !isStandaloneMode && !localStorage.getItem('installDismissed')) {
             // Small delay to not be intrusive immediately
             setTimeout(() => setShowInstallModal(true), 3000);
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowInstallModal(false);
                playSound('success');
            }
        }
    };

    const handleDismissInstall = () => {
        setShowInstallModal(false);
        localStorage.setItem('installDismissed', 'true');
    };

    // FULL ACCESS
    const currentLimits = {
        allowedCategories: [], // Not used anymore
        allowAudio: true
    };

    // Robust Audio Handling
    const handlePlayAudio = (text: string, lang: string) => {
        // 1. Try Online Google TTS (Higher Quality)
        if (navigator.onLine) {
            try {
                const audio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&total=1&idx=0&textlen=${text.length}&client=gtx`);
                audio.play().catch(e => {
                    console.warn("Online audio failed, falling back to system voice", e);
                    playSystemVoice(text, lang);
                });
            } catch (e) {
                playSystemVoice(text, lang);
            }
        } else {
            // 2. Fallback to System Voice (Offline)
            playSystemVoice(text, lang);
        }
    };

    const playSystemVoice = (text: string, lang: string) => {
        const synth = window.speechSynthesis;
        // Cancel any ongoing speech
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        
        // Try to find a better voice if possible
        const voices = synth.getVoices();
        // Prefer "Google" voices on Android/Chrome as they sound better
        const preferredVoice = voices.find(v => v.lang === lang && v.name.includes('Google'));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        synth.speak(utterance);
    };

    // Initialize voices early to avoid empty list issue on first click
    useEffect(() => {
        window.speechSynthesis.getVoices();
    }, []);

    const handlePlayPhrase = (type: 'ask' | 'want', item: TranslationItem) => {
        const langBase = targetCountry.lang.split('-')[0].toLowerCase();
        const itemName = item.translated_term;
        
        let phrase = itemName;

        const templates: Record<string, { ask: (s: string) => string, want: (s: string) => string }> = {
            'en': { 
                ask: (s) => `Excuse me, where is the ${s}?`, 
                want: (s) => `I would like ${s}, please.` 
            },
            'es': { 
                ask: (s) => `Disculpe, ¿dónde está ${s}?`, 
                want: (s) => `Quiero ${s}, por favor.` 
            },
            'pt': { 
                ask: (s) => `Com licença, onde está ${s}?`, 
                want: (s) => `Eu queria ${s}, por favor.` 
            },
            'fr': { 
                ask: (s) => `Excusez-moi, où est ${s}?`, 
                want: (s) => `Je voudrais ${s}, s'il vous plaît.` 
            },
            'it': { 
                ask: (s) => `Scusi, dov'è ${s}?`, 
                want: (s) => `Vorrei ${s}, per favore.` 
            },
        };

        const tpl = templates[langBase];
        if (tpl) {
            phrase = type === 'ask' ? tpl.ask(itemName.toLowerCase()) : tpl.want(itemName.toLowerCase());
        } else {
             // Fallback
             phrase = type === 'ask' ? `${itemName}?` : `${itemName}, please.`;
        }
        
        handlePlayAudio(phrase, targetCountry.lang);
    };

    // Search Toggle Logic
    const handleToggleSearch = () => {
        playSound('toggle');
        if (isSearchActive) {
            setIsSearchActive(false);
            setActiveTab('home');
        } else {
            setIsSearchActive(true);
            setActiveTab('search');
        }
    };

    let panelContent: React.ReactNode = null;
    let currentTheme;
    if (currentModule === 'pharmacy') currentTheme = PHARMACY_THEME;
    else if (currentModule === 'restaurant') currentTheme = RESTAURANT_THEME;
    else currentTheme = SUPERMARKET_THEME;

    if (activeTab === 'favorites') {
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
            isSpeakerLocked={false}
            isConversationLocked={false}
            theme={currentTheme}
            onOpenPlan={() => {}}
        />;
    } else if (activeTab === 'list') {
        panelContent = <ShoppingListPanel 
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
            theme={currentTheme}
            onOpenPlan={() => {}}
        />;
    }

    // --- HUB RENDER ---
    const renderHub = () => {
        const modules = [
            { id: 'supermarket', name: t('supermarketGuide'), icon: ShoppingBagIcon, active: true, color: 'bg-red-50 text-red-600 border-red-200' },
            { id: 'pharmacy', name: t('modulePharmacy'), icon: PillIcon, active: true, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
            { id: 'restaurant', name: t('moduleRestaurant'), icon: UtensilsIcon, active: true, color: 'bg-orange-50 text-orange-600 border-orange-200' },
            { id: 'transport', name: t('moduleTransport'), icon: TruckIcon, active: false },
            { id: 'hotel', name: t('moduleHotel'), icon: BedIcon, active: false },
            { id: 'bank', name: t('moduleBank'), icon: BankIcon, active: false },
            { id: 'gym', name: t('moduleGym'), icon: DumbbellIcon, active: false },
            { id: 'hospital', name: t('moduleHospital'), icon: HospitalIcon, active: false },
            { id: 'shopping', name: t('moduleShopping'), icon: ShoppingBagIconSolid, active: false },
            { id: 'fuel', name: t('moduleFuel'), icon: FuelIcon, active: false },
            { id: 'school', name: t('moduleSchool'), icon: SchoolIcon, active: false },
            { id: 'mechanic', name: t('moduleMechanic'), icon: WrenchIcon, active: false },
            { id: 'pet', name: t('modulePet'), icon: PawIcon, active: false },
            { id: 'police', name: t('modulePolice'), icon: ShieldCheckIcon, active: false },
            { id: 'post', name: t('modulePost'), icon: EnvelopeIcon, active: false },
        ];

        return (
            <div className="min-h-[100dvh] bg-slate-50 flex flex-col">
                {/* Hub Header */}
                <div className="bg-[#c83745] text-white pb-8 pt-12 px-6 rounded-b-[3rem] shadow-lg relative z-10">
                    <div className="max-w-5xl mx-auto">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-white/80 text-sm font-medium mb-1">{t('welcomeBack')}</p>
                                <h1 className="text-3xl font-extrabold tracking-tight">{t('hubTitle')}</h1>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Modules Grid */}
                <div className="flex-1 px-4 -mt-6 pb-12 overflow-y-auto">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-gray-800 font-bold text-lg mb-4 px-2">{t('hubSubtitle')}</h2>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {modules.map((mod) => (
                                <button
                                    key={mod.id}
                                    onClick={() => {
                                        if (mod.active) {
                                            playSound('click');
                                            setCurrentModule(mod.id as any);
                                        } else {
                                            playSound('lock');
                                        }
                                    }}
                                    disabled={!mod.active}
                                    className={`
                                        aspect-square rounded-3xl flex flex-col items-center justify-center p-4 transition-all duration-200 relative overflow-hidden
                                        ${mod.active 
                                            ? 'bg-white shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer border-2 border-transparent' 
                                            : 'bg-slate-100/50 border border-slate-100 cursor-default opacity-60'
                                        }
                                    `}
                                    style={mod.active && mod.id === 'pharmacy' ? { borderColor: '#10b981' } : mod.active && mod.id === 'restaurant' ? { borderColor: '#f97316' } : mod.active ? { borderColor: '#fecaca' } : {}}
                                >
                                    <div className={`
                                        w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors
                                        ${mod.active 
                                            ? (mod.id === 'pharmacy' ? 'bg-emerald-50 text-emerald-600' : mod.id === 'restaurant' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-[#c83745]') 
                                            : 'bg-slate-200 text-slate-400'
                                        }
                                    `}>
                                        <mod.icon className="w-7 h-7" />
                                    </div>
                                    <span className={`text-sm font-bold text-center leading-tight ${mod.active ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {mod.name}
                                    </span>
                                    
                                    {!mod.active && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                                            <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                                {t('comingSoon')}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Bottom Language Trigger (Hub) */}
                <div className="p-6 flex justify-center relative z-20">
                     <button
                        onClick={() => { playSound('pop'); setIsLanguageModalOpen(true); }}
                        className="w-16 h-16 rounded-full border-4 border-white shadow-xl bg-[#c83745] flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
                    >
                        <img src={targetCountry.image} alt={targetCountry.name} className="w-full h-full object-cover opacity-90" />
                    </button>
                </div>
            </div>
        );
    };

    // Render Logic
    const renderModule = () => {
        if (currentModule === 'supermarket') {
            return (
                <SupermarketModule
                    nativeCountry={nativeCountry}
                    targetCountry={targetCountry}
                    userPlan="master"
                    t={t}
                    onOpenMenu={() => {}}
                    onGoHome={() => {
                        setIsSearchActive(false);
                        setActiveTab('home');
                        setCurrentModule(null);
                    }}
                    theme={SUPERMARKET_THEME}
                    isOnline={navigator.onLine}
                    currentLimits={currentLimits}
                    LanguagePairSelect={() => null}
                    setNativeCountry={setNativeCountry}
                    setTargetCountry={setTargetCountry}
                    countries={COUNTRIES}
                    handlePlayAudio={handlePlayAudio}
                    handlePlayPhrase={handlePlayPhrase}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    isSearchActive={isSearchActive}
                    onToggleSearch={handleToggleSearch}
                    favorites={favorites}
                    shoppingList={shoppingList}
                    checkedItems={checkedItems}
                    toggleFavorite={toggleFavorite}
                    toggleShoppingListItem={toggleShoppingListItem}
                    panelContent={panelContent}
                    expandedItemKey={expandedItemKey}
                    setExpandedItemKey={setExpandedItemKey}
                    onOpenLanguageModal={() => { playSound('pop'); setIsLanguageModalOpen(true); }}
                />
            );
        } else if (currentModule === 'pharmacy') {
            return (
                <PharmacyModule
                    nativeCountry={nativeCountry}
                    targetCountry={targetCountry}
                    userPlan="master"
                    t={t}
                    onOpenMenu={() => {}}
                    onGoHome={() => {
                        setIsSearchActive(false);
                        setActiveTab('home');
                        setCurrentModule(null);
                    }}
                    theme={PHARMACY_THEME}
                    isOnline={navigator.onLine}
                    currentLimits={currentLimits}
                    LanguagePairSelect={() => null}
                    setNativeCountry={setNativeCountry}
                    setTargetCountry={setTargetCountry}
                    countries={COUNTRIES}
                    handlePlayAudio={handlePlayAudio}
                    handlePlayPhrase={handlePlayPhrase}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    isSearchActive={isSearchActive}
                    onToggleSearch={handleToggleSearch}
                    favorites={favorites}
                    shoppingList={shoppingList}
                    checkedItems={checkedItems}
                    toggleFavorite={toggleFavorite}
                    toggleShoppingListItem={toggleShoppingListItem}
                    panelContent={panelContent}
                    expandedItemKey={expandedItemKey}
                    setExpandedItemKey={setExpandedItemKey}
                    onOpenLanguageModal={() => { playSound('pop'); setIsLanguageModalOpen(true); }}
                />
            );
        } else if (currentModule === 'restaurant') {
            return (
                <RestaurantModule
                    nativeCountry={nativeCountry}
                    targetCountry={targetCountry}
                    userPlan="master"
                    t={t}
                    onOpenMenu={() => {}}
                    onGoHome={() => {
                        setIsSearchActive(false);
                        setActiveTab('home');
                        setCurrentModule(null);
                    }}
                    theme={RESTAURANT_THEME}
                    isOnline={navigator.onLine}
                    currentLimits={currentLimits}
                    LanguagePairSelect={() => null}
                    setNativeCountry={setNativeCountry}
                    setTargetCountry={setTargetCountry}
                    countries={COUNTRIES}
                    handlePlayAudio={handlePlayAudio}
                    handlePlayPhrase={handlePlayPhrase}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    isSearchActive={isSearchActive}
                    onToggleSearch={handleToggleSearch}
                    favorites={favorites}
                    shoppingList={shoppingList}
                    checkedItems={checkedItems}
                    toggleFavorite={toggleFavorite}
                    toggleShoppingListItem={toggleShoppingListItem}
                    panelContent={panelContent}
                    expandedItemKey={expandedItemKey}
                    setExpandedItemKey={setExpandedItemKey}
                    onOpenLanguageModal={() => { playSound('pop'); setIsLanguageModalOpen(true); }}
                />
            );
        }
        return renderHub();
    };

    return (
        <>
            {renderModule()}

             <LanguagePanel 
                isOpen={isLanguageModalOpen}
                onClose={() => { playSound('soft'); setIsLanguageModalOpen(false); }}
                nativeCountry={nativeCountry}
                targetCountry={targetCountry}
                onNativeChange={setNativeCountry}
                onTargetChange={setTargetCountry}
                options={COUNTRIES}
                t={t}
                theme={currentTheme}
            />

            {/* INSTALL APP MODAL */}
            {showInstallModal && (
                <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 flex justify-center animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-md border border-gray-100 relative">
                        <button onClick={handleDismissInstall} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600">
                            <XIcon className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-start gap-4">
                            <div className="bg-red-100 p-3 rounded-xl shrink-0">
                                <img src="/vite.svg" alt="App Icon" className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800 text-lg">{t('installApp')}</h3>
                                <p className="text-sm text-gray-500 leading-tight mt-1">{t('installAppDesc')}</p>
                                
                                {isIOS ? (
                                    <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-lg text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            1. {t('iosStep1')} <ShareIcon className="w-4 h-4 text-blue-500 inline" />
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            2. {t('iosStep2')} <PlusSquareIcon className="w-4 h-4 text-gray-500 inline" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex gap-3">
                                        <button 
                                            onClick={handleInstallClick}
                                            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold text-sm shadow-md hover:bg-red-700 transition-colors"
                                        >
                                            {t('install')}
                                        </button>
                                        <button 
                                            onClick={handleDismissInstall}
                                            className="px-4 py-2 text-gray-400 font-medium text-sm hover:text-gray-600"
                                        >
                                            {t('notNow')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
