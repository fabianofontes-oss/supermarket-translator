
import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { COUNTRIES } from './constants';
import type { Country, TranslationItem } from './types';
import SupermarketModule from './modules/SupermarketModule';
import PharmacyModule from './modules/PharmacyModule';
import { translations } from './translations';
import { useListManager } from './hooks/useListManager';
import { LanguagePanel } from './components/LanguagePanel';
import { playSound } from './utils/soundUtils';
import { 
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
    StarIcon
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

export default function App() {
    // Navigation State
    const [currentModule, setCurrentModule] = useState<'supermarket' | 'pharmacy' | null>(null);

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

    // Helper to get current lists based on active module
    const getCurrentLists = () => {
        if (currentModule === 'pharmacy') return pharmacyLists;
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

    // FULL ACCESS (No Plans)
    const currentLimits = {
        allowedCategories: [], 
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
        const itemName = item.translated_term;
        
        // Simple templates for phrases
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
            }
        };

        const langBase = targetCountry.lang.split('-')[0];
        const template = templates[langBase] || templates['en'];
        const textToPlay = type === 'ask' ? template.ask(itemName) : template.want(itemName);
        
        handlePlayAudio(textToPlay, targetCountry.lang);
    };

    // --- Render Functions ---

    // Language Selector Component (Passed to Modules)
    const LanguagePairSelect = () => null; // Placeholder if modules need it, but we use the panel now

    const renderContent = () => {
        switch (currentModule) {
            case 'supermarket':
                return (
                    <SupermarketModule
                        nativeCountry={nativeCountry}
                        targetCountry={targetCountry}
                        userPlan={'master'}
                        t={t}
                        onOpenMenu={() => {}}
                        onGoHome={() => setCurrentModule(null)}
                        theme={SUPERMARKET_THEME}
                        isOnline={navigator.onLine}
                        currentLimits={currentLimits}
                        LanguagePairSelect={LanguagePairSelect}
                        setNativeCountry={setNativeCountry}
                        setTargetCountry={setTargetCountry}
                        countries={COUNTRIES}
                        handlePlayAudio={handlePlayAudio}
                        handlePlayPhrase={handlePlayPhrase}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        isSearchActive={isSearchActive}
                        onToggleSearch={() => setIsSearchActive(!isSearchActive)}
                        favorites={favorites}
                        shoppingList={shoppingList}
                        checkedItems={checkedItems}
                        toggleFavorite={toggleFavorite}
                        toggleShoppingListItem={toggleShoppingListItem}
                        panelContent={
                            activeTab === 'favorites' ? (
                                <div className="mt-2">
                                    {/* Favorites Panel Content would go here if extracted */}
                                </div>
                            ) : null
                        }
                        expandedItemKey={expandedItemKey}
                        setExpandedItemKey={setExpandedItemKey}
                        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
                    />
                );
            case 'pharmacy':
                return (
                    <PharmacyModule
                        nativeCountry={nativeCountry}
                        targetCountry={targetCountry}
                        userPlan={'master'}
                        t={t}
                        onOpenMenu={() => {}}
                        onGoHome={() => setCurrentModule(null)}
                        theme={PHARMACY_THEME}
                        isOnline={navigator.onLine}
                        currentLimits={currentLimits}
                        LanguagePairSelect={LanguagePairSelect}
                        setNativeCountry={setNativeCountry}
                        setTargetCountry={setTargetCountry}
                        countries={COUNTRIES}
                        handlePlayAudio={handlePlayAudio}
                        handlePlayPhrase={handlePlayPhrase}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        isSearchActive={isSearchActive}
                        onToggleSearch={() => setIsSearchActive(!isSearchActive)}
                        favorites={favorites}
                        shoppingList={shoppingList}
                        checkedItems={checkedItems}
                        toggleFavorite={toggleFavorite}
                        toggleShoppingListItem={toggleShoppingListItem}
                        panelContent={null}
                        expandedItemKey={expandedItemKey}
                        setExpandedItemKey={setExpandedItemKey}
                        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
                    />
                );
            default:
                return (
                    <div className="min-h-screen bg-gray-50 flex flex-col">
                        {/* Header */}
                        <header className="bg-white shadow-sm pt-12 pb-6 px-6 sticky top-0 z-10">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">{t('hubTitle')}</h1>
                                    <p className="text-gray-500 text-sm">{t('hubSubtitle')}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsLanguageModalOpen(true)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                                        <div className="flex items-center -space-x-2">
                                            <img src={nativeCountry.image} alt={nativeCountry.name} className="w-6 h-6 rounded-full border border-white" />
                                            <img src={targetCountry.image} alt={targetCountry.name} className="w-6 h-6 rounded-full border border-white" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </header>

                        {/* Module Grid */}
                        <main className="flex-1 p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-20">
                                {/* Supermarket Module */}
                                <button 
                                    onClick={() => { playSound('click'); setCurrentModule('supermarket'); }}
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:shadow-md transition-all active:scale-95"
                                >
                                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                        <ShoppingBagIconSolid className="w-7 h-7" />
                                    </div>
                                    <span className="font-bold text-gray-700 text-sm">{t('supermarketGuide')}</span>
                                </button>

                                {/* Pharmacy Module */}
                                <button 
                                    onClick={() => { playSound('click'); setCurrentModule('pharmacy'); }}
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:shadow-md transition-all active:scale-95"
                                >
                                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <PillIcon className="w-7 h-7" />
                                    </div>
                                    <span className="font-bold text-gray-700 text-sm">{t('modulePharmacy')}</span>
                                </button>

                                {/* Inactive Modules (Coming Soon) */}
                                {[
                                    { icon: UtensilsIcon, label: 'moduleRestaurant', color: 'orange' },
                                    { icon: TruckIcon, label: 'moduleTransport', color: 'blue' },
                                    { icon: BedIcon, label: 'moduleHotel', color: 'indigo' },
                                    { icon: BankIcon, label: 'moduleBank', color: 'green' },
                                    { icon: DumbbellIcon, label: 'moduleGym', color: 'purple' },
                                    { icon: HospitalIcon, label: 'moduleHospital', color: 'red' },
                                    { icon: ShoppingBagIcon, label: 'moduleShopping', color: 'pink' },
                                    { icon: FuelIcon, label: 'moduleFuel', color: 'yellow' },
                                    { icon: SchoolIcon, label: 'moduleSchool', color: 'cyan' },
                                    { icon: WrenchIcon, label: 'moduleMechanic', color: 'slate' },
                                    { icon: PawIcon, label: 'modulePet', color: 'orange' },
                                    { icon: ShieldCheckIcon, label: 'modulePolice', color: 'blue' },
                                    { icon: EnvelopeIcon, label: 'modulePost', color: 'yellow' },
                                ].map((mod, idx) => (
                                    <button 
                                        key={idx}
                                        className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col items-center gap-3 opacity-60"
                                        disabled
                                    >
                                        <div className={`w-14 h-14 rounded-full bg-${mod.color}-100 flex items-center justify-center text-${mod.color}-500 grayscale`}>
                                            <mod.icon className="w-7 h-7" />
                                        </div>
                                        <span className="font-medium text-gray-400 text-sm">{t(mod.label)}</span>
                                    </button>
                                ))}
                            </div>
                        </main>
                    </div>
                );
        }
    };

    return (
        <>
            {renderContent()}

            <LanguagePanel
                isOpen={isLanguageModalOpen}
                onClose={() => setIsLanguageModalOpen(false)}
                nativeCountry={nativeCountry}
                targetCountry={targetCountry}
                onNativeChange={setNativeCountry}
                onTargetChange={setTargetCountry}
                options={COUNTRIES}
                t={t}
                theme={currentModule === 'pharmacy' ? PHARMACY_THEME : SUPERMARKET_THEME}
            />

            {/* PWA Install Modal */}
            {showInstallModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl transform transition-all animate-slide-up">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <ShoppingBagIconSolid className="w-8 h-8 text-red-600" />
                            </div>
                            <button onClick={handleDismissInstall} className="text-gray-400 hover:text-gray-600 p-1">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('installApp')}</h3>
                        <p className="text-gray-600 mb-6">{t('installAppDesc')}</p>
                        
                        {isIOS ? (
                            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-700 space-y-2">
                                <p className="flex items-center gap-2">1. {t('iosStep1')} <span className="text-blue-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></span></p>
                                <p className="flex items-center gap-2">2. {t('iosStep2')} <span className="text-gray-900 font-bold">+</span></p>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleDismissInstall}
                                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {t('notNow')}
                                </button>
                                <button 
                                    onClick={handleInstallClick}
                                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold shadow-lg hover:bg-red-700 transition-colors"
                                >
                                    {t('install')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
