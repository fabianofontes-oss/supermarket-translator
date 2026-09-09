import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { COUNTRIES, SUPERMARKET_CATEGORIES, PHARMACY_CATEGORIES } from './constants';
import type { Country, TranslationItem } from './types';
// Cada módulo vira um pedaço próprio: abrir o hub não baixa o catálogo
// inteiro nem os dados dos outros oito módulos.
const CatalogModule = lazy(() => import('./modules/CatalogModule'));
const LocationModule = lazy(() => import('./modules/LocationModule'));
const DirectionsModule = lazy(() => import('./modules/DirectionsModule'));
const NumbersModule = lazy(() => import('./modules/NumbersModule'));
const BodyModule = lazy(() => import('./modules/BodyModule'));
const CafeModule = lazy(() => import('./modules/CafeModule'));
const PronounsModule = lazy(() => import('./modules/PronounsModule'));
const SizesModule = lazy(() => import('./modules/SizesModule'));
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
  MapPinIcon,
  SignpostIcon,
  NumbersIcon,
  BodyIcon,
  CafeIcon,
  PronounsIcon,
  SizesIcon,
} from './components/Icons';

type ModuleKey =
  | 'supermarket' | 'pharmacy' | 'location' | 'directions'
  | 'numbers' | 'body' | 'cafe' | 'pronouns' | 'sizes';
type Tab = 'home' | 'search' | 'favorites' | 'list';

export interface Theme { color: string; textColor: string; hex: string; borderColor: string }

const THEMES: Record<ModuleKey, Theme> = {
  supermarket: { color: 'bg-red-600',     textColor: 'text-red-600',     hex: '#dc2626', borderColor: 'border-red-600' },
  pharmacy:    { color: 'bg-emerald-700', textColor: 'text-emerald-700', hex: '#047857', borderColor: 'border-emerald-700' },
  location:    { color: 'bg-blue-600',    textColor: 'text-blue-600',    hex: '#2563eb', borderColor: 'border-blue-600' },
  directions:  { color: 'bg-amber-700',   textColor: 'text-amber-700',   hex: '#b45309', borderColor: 'border-amber-700' },
  numbers:     { color: 'bg-violet-600',  textColor: 'text-violet-600',  hex: '#7c3aed', borderColor: 'border-violet-600' },
  body:        { color: 'bg-rose-600',    textColor: 'text-rose-600',    hex: '#e11d48', borderColor: 'border-rose-600' },
  cafe:        { color: 'bg-orange-800',  textColor: 'text-orange-800',  hex: '#9a3412', borderColor: 'border-orange-800' },
  pronouns:    { color: 'bg-teal-700',    textColor: 'text-teal-700',    hex: '#0f766e', borderColor: 'border-teal-700' },
  sizes:       { color: 'bg-indigo-600',  textColor: 'text-indigo-600',  hex: '#4f46e5', borderColor: 'border-indigo-600' },
};

// Módulos ativos do hub (classes escritas por extenso para o Tailwind gerar o CSS)
// needsCatalog: depende dos 1.351 itens traduzidos; fica bloqueado para países só de origem (uk, ar).
const ACTIVE_MODULES: { key: ModuleKey; labelKey: string; icon: React.FC<{ className?: string }>; iconClass: string; needsCatalog?: boolean }[] = [
  { key: 'supermarket', labelKey: 'supermarketGuide', icon: ShoppingBagIconSolid, iconClass: 'bg-red-100 text-red-600', needsCatalog: true },
  { key: 'pharmacy',    labelKey: 'modulePharmacy',   icon: PillIcon,             iconClass: 'bg-emerald-100 text-emerald-700', needsCatalog: true },
  { key: 'location',    labelKey: 'moduleLocation',   icon: MapPinIcon,           iconClass: 'bg-blue-100 text-blue-600' },
  { key: 'directions',  labelKey: 'moduleDirections', icon: SignpostIcon,         iconClass: 'bg-amber-100 text-amber-700' },
  { key: 'numbers',     labelKey: 'moduleNumbers',    icon: NumbersIcon,          iconClass: 'bg-violet-100 text-violet-600' },
  { key: 'body',        labelKey: 'moduleBody',       icon: BodyIcon,             iconClass: 'bg-rose-100 text-rose-600' },
  { key: 'cafe',        labelKey: 'moduleCafe',       icon: CafeIcon,             iconClass: 'bg-orange-100 text-orange-800' },
  { key: 'pronouns',    labelKey: 'modulePronouns',   icon: PronounsIcon,         iconClass: 'bg-teal-100 text-teal-700' },
  { key: 'sizes',       labelKey: 'moduleSizes',      icon: SizesIcon,            iconClass: 'bg-indigo-100 text-indigo-600' },
];

// Módulos ainda não implementados (aparecem desativados)
const COMING_SOON: { labelKey: string; icon: React.FC<{ className?: string }>; iconClass: string }[] = [
  { labelKey: 'moduleRestaurant', icon: UtensilsIcon,    iconClass: 'bg-orange-100 text-orange-500' },
  { labelKey: 'moduleTransport',  icon: TruckIcon,       iconClass: 'bg-blue-100 text-blue-500' },
  { labelKey: 'moduleHotel',      icon: BedIcon,         iconClass: 'bg-indigo-100 text-indigo-500' },
  { labelKey: 'moduleBank',       icon: BankIcon,        iconClass: 'bg-green-100 text-green-500' },
  { labelKey: 'moduleGym',        icon: DumbbellIcon,    iconClass: 'bg-purple-100 text-purple-500' },
  { labelKey: 'moduleHospital',   icon: HospitalIcon,    iconClass: 'bg-red-100 text-red-500' },
  { labelKey: 'moduleShopping',   icon: ShoppingBagIcon, iconClass: 'bg-pink-100 text-pink-500' },
  { labelKey: 'moduleFuel',       icon: FuelIcon,        iconClass: 'bg-yellow-100 text-yellow-500' },
  { labelKey: 'moduleSchool',     icon: SchoolIcon,      iconClass: 'bg-cyan-100 text-cyan-500' },
  { labelKey: 'moduleMechanic',   icon: WrenchIcon,      iconClass: 'bg-slate-100 text-slate-500' },
  { labelKey: 'modulePet',        icon: PawIcon,         iconClass: 'bg-orange-100 text-orange-500' },
  { labelKey: 'modulePolice',     icon: ShieldCheckIcon, iconClass: 'bg-blue-100 text-blue-500' },
  { labelKey: 'modulePost',       icon: EnvelopeIcon,    iconClass: 'bg-yellow-100 text-yellow-500' },
];

const normalizeLang = (l: string) => l.replace('_', '-').toLowerCase();

export default function App() {
  const [currentModule, setCurrentModule] = useState<ModuleKey | null>(null);
  const [nativeCountry, setNativeCountry] = useState<Country>(COUNTRIES.find((c) => c.code === 'br') || COUNTRIES[0]);
  const [targetCountry, setTargetCountry] = useState<Country>(COUNTRIES.find((c) => c.code === 'es') || COUNTRIES[0]);

  // PWA install
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Cascata só nos primeiros instantes de vida do app. Voltar ao hub é
  // navegação repetida, e o que se repete muito não deve animar.
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setIntroDone(true), 800);
    return () => window.clearTimeout(timer);
  }, []);
  const stagger = !introDone;

  // Estado compartilhado dos módulos de catálogo
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [expandedItemKey, setExpandedItemKey] = useState<string | null>(null);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const supermarketLists = useListManager('supermarket');
  const pharmacyLists = useListManager('pharmacy');
  const lists = currentModule === 'pharmacy' ? pharmacyLists : supermarketLists;

  const t = useCallback((key: string) => {
    const lang = nativeCountry.lang || 'en-US';
    const terms = translations[lang] || translations['en-US'];
    return terms[key] || key;
  }, [nativeCountry.lang]);

  // Zera abas ao trocar de módulo
  useEffect(() => {
    setActiveTab('home');
    setIsSearchActive(false);
    setExpandedItemKey(null);
  }, [currentModule]);

  // Lógica de instalação do PWA
  useEffect(() => {
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    let dismissed = false;
    try { dismissed = !!localStorage.getItem('installDismissed'); } catch { /* ignore */ }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandaloneMode && !dismissed) setShowInstallModal(true);
    };

    let iosTimer: number | undefined;
    if (isIosDevice && !isStandaloneMode && !dismissed) {
      iosTimer = window.setTimeout(() => setShowInstallModal(true), 3000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallModal(false);
      playSound('success');
    }
  };

  const handleDismissInstall = () => {
    setShowInstallModal(false);
    try { localStorage.setItem('installDismissed', 'true'); } catch { /* ignore */ }
  };

  // ----- Áudio (voz do sistema, funciona offline) -----
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const load = () => { voicesRef.current = synth.getVoices(); };
    load();
    synth.addEventListener('voiceschanged', load);
    return () => synth.removeEventListener('voiceschanged', load);
  }, []);

  const handlePlayAudio = useCallback((text: string, lang: string) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;

    const voices = voicesRef.current.length ? voicesRef.current : synth.getVoices();
    const wanted = normalizeLang(lang);
    const base = wanted.split('-')[0];
    const exact = voices.filter((v) => normalizeLang(v.lang) === wanted);
    const preferred =
      exact.find((v) => /google|natural|premium|enhanced/i.test(v.name)) ||
      exact[0] ||
      voices.find((v) => normalizeLang(v.lang).startsWith(base));
    if (preferred) utterance.voice = preferred;

    synth.speak(utterance);
  }, []);

  const handlePlayPhrase = useCallback((type: 'ask' | 'want', item: TranslationItem) => {
    const name = item.translated_term;
    const templates: Record<string, { ask: (s: string) => string; want: (s: string) => string }> = {
      en: { ask: (s) => `Excuse me, where is the ${s}?`, want: (s) => `I would like ${s}, please.` },
      es: { ask: (s) => `Disculpe, ¿dónde está ${s}?`, want: (s) => `Quiero ${s}, por favor.` },
      pt: { ask: (s) => `Com licença, onde está ${s}?`, want: (s) => `Eu queria ${s}, por favor.` },
      fr: { ask: (s) => `Excusez-moi, où est ${s} ?`, want: (s) => `Je voudrais ${s}, s'il vous plaît.` },
      it: { ask: (s) => `Scusi, dov'è ${s}?`, want: (s) => `Vorrei ${s}, per favore.` },
    };
    const template = templates[targetCountry.lang.split('-')[0]] || templates.en;
    handlePlayAudio(type === 'ask' ? template.ask(name) : template.want(name), targetCountry.lang);
  }, [targetCountry.lang, handlePlayAudio]);

  // ----- Render -----
  const theme = currentModule ? THEMES[currentModule] : THEMES.supermarket;

  const commonProps = {
    nativeCountry,
    targetCountry,
    t,
    theme,
    onGoHome: () => setCurrentModule(null),
    onOpenLanguageModal: () => setIsLanguageModalOpen(true),
    handlePlayAudio,
  };

  const catalogProps = {
    ...commonProps,
    handlePlayPhrase,
    activeTab,
    onTabChange: setActiveTab,
    isSearchActive,
    onToggleSearch: () => setIsSearchActive((v) => !v),
    favorites: lists.favorites,
    shoppingList: lists.shoppingList,
    checkedItems: lists.checkedItems,
    toggleFavorite: lists.toggleFavorite,
    toggleShoppingListItem: lists.toggleShoppingListItem,
    expandedItemKey,
    setExpandedItemKey,
  };

  const renderContent = () => {
    switch (currentModule) {
      case 'supermarket':
        return <CatalogModule {...catalogProps} titleKey="supermarketGuide" categories={SUPERMARKET_CATEGORIES} storagePrefix="supermarket" />;
      case 'pharmacy':
        return <CatalogModule {...catalogProps} titleKey="modulePharmacy" categories={PHARMACY_CATEGORIES} storagePrefix="pharmacy" defaultCategoryName="painFever" isPharmacy />;
      case 'location':
        return <LocationModule {...commonProps} />;
      case 'directions':
        return <DirectionsModule {...commonProps} />;
      case 'numbers':
        return <NumbersModule {...commonProps} />;
      case 'body':
        return <BodyModule {...commonProps} />;
      case 'cafe':
        return <CafeModule {...commonProps} />;
      case 'pronouns':
        return <PronounsModule {...commonProps} />;
      case 'sizes':
        return <SizesModule {...commonProps} />;
      default: {
        return (
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm pt-12 pb-6 px-6 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{t('hubTitle')}</h1>
                  <p className="text-gray-500 text-sm">{t('hubSubtitle')}</p>
                </div>
                <button onClick={() => setIsLanguageModalOpen(true)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <div className="flex items-center -space-x-2">
                    <img src={nativeCountry.image} alt={nativeCountry.name} className="w-6 h-6 rounded-full border border-white object-cover" />
                    <img src={targetCountry.image} alt={targetCountry.name} className="w-6 h-6 rounded-full border border-white object-cover" />
                  </div>
                </button>
              </div>
            </header>

            <main className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-20">
                {ACTIVE_MODULES.map((mod, i) => {
                  const blocked = !!mod.needsCatalog && !!nativeCountry.originOnly;
                  return (
                    <button
                      key={mod.key}
                      disabled={blocked}
                      style={stagger ? { animationDelay: `${i * 40}ms` } : undefined}
                      onClick={() => { playSound('click'); setCurrentModule(mod.key); }}
                      className={`${blocked
                        ? 'bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col items-center gap-3 opacity-60'
                        : 'bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:shadow-md tap active:scale-95'} ${stagger ? 'animate-rise-in' : ''}`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${mod.iconClass} ${blocked ? 'grayscale' : ''}`}>
                        <mod.icon className="w-7 h-7" />
                      </div>
                      <span className={`text-sm ${blocked ? 'font-medium text-gray-500' : 'font-bold text-gray-700'}`}>{t(mod.labelKey)}</span>
                      {blocked && <span className="text-[10px] uppercase tracking-wider text-gray-500 -mt-2">{t('comingSoon')}</span>}
                    </button>
                  );
                })}

                {COMING_SOON.map((mod) => (
                  <button
                    key={mod.labelKey}
                    disabled
                    className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col items-center gap-3 opacity-60"
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center grayscale ${mod.iconClass}`}>
                      <mod.icon className="w-7 h-7" />
                    </div>
                    <span className="font-medium text-gray-500 text-sm">{t(mod.labelKey)}</span>
                  </button>
                ))}
              </div>
            </main>
          </div>
        );
      }
    }
  };

  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
        {renderContent()}
      </Suspense>

      <LanguagePanel
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        nativeCountry={nativeCountry}
        targetCountry={targetCountry}
        onNativeChange={setNativeCountry}
        onTargetChange={setTargetCountry}
        options={COUNTRIES}
        t={t}
        theme={theme}
        blockOriginOnly={currentModule === 'supermarket' || currentModule === 'pharmacy'}
      />

      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl transform tap animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <ShoppingBagIconSolid className="w-8 h-8 text-red-600" />
              </div>
              <button onClick={handleDismissInstall} className="text-gray-500 hover:text-gray-600 p-1">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('installApp')}</h3>
            <p className="text-gray-600 mb-6">{t('installAppDesc')}</p>

            {isIOS ? (
              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-700 space-y-2">
                <p className="flex items-center gap-2">
                  1. {t('iosStep1')}
                  <span className="text-blue-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  </span>
                </p>
                <p className="flex items-center gap-2">2. {t('iosStep2')} <span className="text-gray-900 font-bold">+</span></p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={handleDismissInstall} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                  {t('notNow')}
                </button>
                <button onClick={handleInstallClick} className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold shadow-lg hover:bg-red-700 transition-colors">
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
