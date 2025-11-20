
import React from 'react';
import {
  HomeIcon,
  SearchIcon,
  CrownIcon,
  StarIconSolid,
  ShoppingBagIconSolid,
  XIcon
} from './Icons';
import type { Country } from '../types';

interface ModuleLayoutProps {
  title: string;
  theme: { color: string; textColor: string; hex: string };
  userPlan: 'free' | 'premium' | 'master';
  t: (key: string) => string;
  onGoHome: () => void;
  onOpenMenu: () => void;
  
  nativeCountry: Country;
  targetCountry: Country;
  setNativeCountry: (c: Country) => void;
  setTargetCountry: (c: Country) => void;
  countries: Country[];
  LanguagePairSelect: React.FC<any>;

  activeTab: 'home' | 'search' | 'favorites' | 'list' | 'language';
  onTabChange: (tab: 'home' | 'search' | 'favorites' | 'list' | 'language') => void;
  
  favoritesCount: number;
  listCount: number;

  searchBarSlot?: React.ReactNode;
  categorySelectorSlot?: React.ReactNode;
  subCategorySlot?: React.ReactNode;
  children: React.ReactNode;
  
  panelContent?: React.ReactNode;
  panelTitle?: string;

  isSearchActive: boolean;
  onToggleSearch: () => void;
}

export const ModuleLayout: React.FC<ModuleLayoutProps> = ({
  title,
  theme,
  userPlan,
  t,
  onGoHome,
  onOpenMenu,
  nativeCountry,
  targetCountry,
  setNativeCountry,
  setTargetCountry,
  countries,
  LanguagePairSelect,
  activeTab,
  onTabChange,
  favoritesCount,
  listCount,
  searchBarSlot,
  categorySelectorSlot,
  subCategorySlot,
  children,
  panelContent,
  panelTitle,
  isSearchActive,
  onToggleSearch
}) => {
  
  const isPanelOpen = activeTab === 'favorites' || activeTab === 'list' || activeTab === 'language';

  return (
    <div className="w-full max-w-md bg-white text-gray-800 shadow-2xl flex flex-col h-[100dvh] relative overflow-hidden font-sans mx-auto">
      
      {/* Header with Gradient and Premium Feel - Compressed */}
      <header className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-${theme.color.replace('bg-', '')} to-${theme.color.replace('bg-', '')}/90 text-white shadow-lg z-50 transition-all duration-300 flex flex-col rounded-b-3xl`}>
        
        {/* Top Row: Title & Search - Compact & Centered */}
        <div className="relative flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
           
           {/* Left: Home Button */}
           <button 
               onClick={onGoHome}
               className="p-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm flex-shrink-0 z-20 text-white hover:bg-white/20 transition-colors"
           >
              <HomeIcon className="w-5 h-5" />
           </button>

           {/* Center: Title */}
           <button 
               onClick={onGoHome}
               className="flex-1 mx-2 text-center truncate z-10 outline-none"
           >
               <h1 className="font-bold text-2xl uppercase tracking-tight shadow-sm text-white truncate">
                  {title}
               </h1>
           </button>

           {/* Right: Search */}
           <div className="flex-shrink-0 z-20">
               <button 
                  onClick={() => onTabChange(isSearchActive ? 'home' : 'search')}
                  className={`p-2 rounded-full transition-all active:scale-95 ${isSearchActive ? 'bg-white text-current shadow-lg' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`}
                  style={{ color: isSearchActive ? theme.hex : 'white' }}
               >
                  <SearchIcon className="w-5 h-5" />
               </button>
           </div>
        </div>

        {/* Search Bar Area */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isSearchActive ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
           {searchBarSlot}
        </div>

        {/* Main Header Content (Category & Plan) - Compact Layout */}
        {!isSearchActive && (
            <div className="px-4 py-1 flex items-center justify-between gap-2 relative z-20">
                <div className="flex-1 min-w-0">
                    {categorySelectorSlot}
                </div>
                
                <button
                  onClick={onOpenMenu}
                  className={`h-9 w-auto min-w-fit rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center px-4 gap-1.5 shadow-md backdrop-blur-md border border-white/20 transition-all active:scale-95 flex-shrink-0 overflow-hidden ${
                      userPlan === 'free' 
                      ? 'bg-black/20 text-white hover:bg-black/30' 
                      : 'bg-gradient-to-r from-amber-300 to-amber-500 text-amber-950 border-amber-300/50'
                  }`}
               >
                  {userPlan !== 'free' && <CrownIcon className="w-4 h-4 flex-shrink-0" />}
                  <span className="truncate leading-none">
                      {t(userPlan === 'free' ? 'planFree' : (userPlan === 'premium' ? 'planPremium' : 'planMaster'))}
                  </span>
               </button>
            </div>
        )}

        {/* Subcategories - Reduced Padding */}
        {!isSearchActive && !isPanelOpen && (
            <div className={`pb-3 pt-2 px-4 min-h-[3.5rem] flex items-center overflow-hidden`}>
                {subCategorySlot}
            </div>
        )}
        
        {/* Spacer when panel is open */}
        {isPanelOpen && <div className="h-4"></div>}
      </header>

      {/* Adjusted Padding Top for Main Content */}
      <main className="flex-1 bg-slate-50 p-4 overflow-y-auto pb-32 pt-44">
        {children}
      </main>

      {/* Sliding Panel */}
      <div 
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-20 transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) flex flex-col overflow-hidden border-t border-gray-100`}
        style={{ 
            top: '11rem', // Moved up slightly due to smaller header
            bottom: '0',
            transform: isPanelOpen ? 'translateY(0)' : 'translateY(100%)'
        }}
      >
          {/* Panel Header Area */}
          <div className={`w-full flex flex-col items-center pt-3 pb-2 relative transition-colors duration-300 ${panelTitle ? theme.color : 'bg-white'}`}>
               {/* Drag Handle */}
              <div 
                className={`w-12 h-1.5 rounded-full cursor-pointer mb-3 ${panelTitle ? 'bg-white/30' : 'bg-gray-200'}`} 
                onClick={() => onTabChange('home')}
              ></div>
              
              {/* Panel Title */}
              {panelTitle && (
                  <div className="flex items-center justify-between w-full px-6 pb-3">
                      <div className="w-9"></div> 
                      <h2 className="text-xl font-bold uppercase tracking-widest text-center text-white shadow-sm">
                          {panelTitle}
                      </h2>
                      <button 
                        onClick={() => onTabChange('home')}
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
      <nav className={`absolute bottom-0 w-full ${theme.color} grid grid-cols-3 h-20 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.15)] items-end pb-0 transition-all duration-300`}>
           
           {/* Favorites Tab */}
           <button 
              onClick={() => onTabChange('favorites')}
              className={`flex flex-col justify-end items-center w-full transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                  activeTab === 'favorites' 
                  ? 'bg-white rounded-t-2xl h-24 pb-6 pt-4 shadow-[0_-4px_15px_rgba(0,0,0,0.1)] translate-y-0 z-10' 
                  : 'h-20 pb-6 translate-y-2 opacity-80 hover:opacity-100'
              }`}
           >
              <div className="relative mb-1 transition-transform duration-300 group-hover:scale-110">
                  <StarIconSolid className={`w-7 h-7 transition-colors duration-300 ${activeTab === 'favorites' ? theme.textColor : 'text-white'}`} />
                  {favoritesCount > 0 && activeTab !== 'favorites' && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full ring-2 ring-red-600/50 shadow-sm"></span>
                  )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 px-2 text-center leading-tight ${activeTab === 'favorites' ? theme.textColor : 'text-white'}`}>
                  {t('favorites')}
              </span>
           </button>

           {/* Center Language Selector Panel Trigger */}
           <div className="relative h-full w-full flex justify-center pointer-events-none">
                <button
                    onClick={() => onTabChange(activeTab === 'language' ? 'home' : 'language')}
                    className={`w-20 h-20 rounded-full border-[6px] flex items-center justify-center bg-slate-800 overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer absolute bottom-8 z-50 pointer-events-auto shadow-xl ${activeTab === 'language' ? 'ring-4 ring-white/40 scale-105' : ''}`}
                    style={{ borderColor: theme.hex }}
                >
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full z-30 pointer-events-none"></div>
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"></div>
                    
                    <img
                    src={`https://flagcdn.com/${targetCountry.code}.svg`}
                    alt={targetCountry.name}
                    className="w-full h-full object-cover z-10"
                    />
                </button>
           </div>

           {/* Shopping List Tab */}
           <button 
              onClick={() => onTabChange('list')}
              className={`flex flex-col justify-end items-center w-full transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                  activeTab === 'list' 
                  ? 'bg-white rounded-t-2xl h-24 pb-6 pt-4 shadow-[0_-4px_15px_rgba(0,0,0,0.1)] translate-y-0 z-10' 
                  : 'h-20 pb-6 translate-y-2 opacity-80 hover:opacity-100'
              }`}
           >
              <div className="relative mb-1 transition-transform duration-300 group-hover:scale-110">
                  <ShoppingBagIconSolid className={`w-7 h-7 transition-colors duration-300 ${activeTab === 'list' ? theme.textColor : 'text-white'}`} />
                  {listCount > 0 && (
                      <span className={`absolute -top-2 -right-2 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full text-[9px] font-bold shadow-sm transition-colors ${activeTab === 'list' ? 'bg-red-600 text-white' : 'bg-white text-red-600'}`}>
                      {listCount}
                      </span>
                  )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 px-1 text-center leading-tight ${activeTab === 'list' ? theme.textColor : 'text-white'}`}>
                  {t('shoppingListLabel')}
              </span>
           </button>
      </nav>

    </div>
  );
};
