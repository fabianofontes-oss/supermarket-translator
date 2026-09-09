
import React, { useEffect, useId, useRef } from 'react';
import {
  SpeakerIcon,
  QuestionMarkCircleIcon,
  CartIcon,
  CheckIcon,
  ShoppingBagIcon,
  StarIcon,
  XIcon,
} from './Icons';
import type { TranslationItem as TranslationItemType, Country } from '../types';
import { playSound } from '../utils/soundUtils';

interface TranslationItemProps {
  item: TranslationItemType;
  onPlayAudio: (text: string, langCode: string) => void;
  onPlayPhrase: (phraseType: 'ask' | 'want', item: TranslationItemType) => void;
  nativeCountry: Country;
  targetCountry: Country;
  isInShoppingList: boolean;
  isChecked: boolean;
  isFavorite: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleShoppingListItem: (item: TranslationItemType) => void;
  onToggleFavorite: (item: TranslationItemType) => void;
  highlighted: boolean;
  onHighlightDone: () => void;
  t: (key: string) => string;
  isSpeakerLocked: boolean;
  isConversationLocked: boolean;
  theme: { color: string; textColor: string };
  isPhrase?: boolean;
  onOpenPlan: () => void;
  isPharmacy?: boolean;
  /**
   * Onde o item vive no catálogo. Só nos resultados de busca, onde dois itens
   * podem exibir o mesmo nome e a posição é o que os distingue.
   */
  contextLabel?: string;
}

export const TranslationItem: React.FC<TranslationItemProps> = ({
  item,
  onPlayAudio,
  onPlayPhrase,
  nativeCountry,
  targetCountry,
  isInShoppingList,
  isChecked,
  isFavorite,
  isExpanded,
  onToggleExpand,
  onToggleShoppingListItem,
  onToggleFavorite,
  highlighted,
  onHighlightDone,
  t,
  isSpeakerLocked,
  isConversationLocked,
  theme,
  isPhrase = false,
  onOpenPlan,
  isPharmacy = false,
  contextLabel
}) => {
  const getButtonClasses = (locked: boolean) => 
    `hit p-2 rounded-full transition-colors duration-200 ${
      locked 
        ? 'bg-red-50 hover:bg-red-100' 
        : `hover:bg-gray-100 text-gray-500 hover:${theme.textColor}`
    }`;

  // Ids estáveis para ligar o gatilho ao painel (aria-controls) e ao próprio
  // texto (aria-labelledby): o leitor anuncia 'Abacate, AGUACATE, recolhido'.
  const ids = useId();
  const panelId = ids + '-panel';
  const nameId = ids + '-name';
  const termId = ids + '-term';
  const badgeId = ids + '-badge';
  const contextId = ids + '-context';

  const baseIconClasses = 'w-6 h-6';
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlighted && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const tempHighlightClass = 'bg-blue-100';
      itemRef.current.classList.add(tempHighlightClass, 'tap', 'duration-300');
      const timer = setTimeout(() => {
        itemRef.current?.classList.remove(tempHighlightClass);
        onHighlightDone();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [highlighted, onHighlightDone]);

  // Auto-scroll when expanded to ensure full card visibility
  useEffect(() => {
    if (isExpanded && itemRef.current) {
      // Increased delay to 200ms to ensure transition is well underway/finished
      const timer = setTimeout(() => {
        itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200); 
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const handleCardClick = () => {
    playSound('click');
    onToggleExpand();
  };

  /**
   * Separa o nome do que vem entre parênteses. É só apresentação — nome e
   * marcas —, nunca estado do produto. O estado mora em `item.availability`.
   */
  const splitNameAndBrands = (text: string) => {
      const match = text.match(/^(.*?)\s*\((.*?)\)$/);
      const generic = match ? match[1].trim() : text;
      const details = match ? match[2].trim() : '';
      const brands = details ? details.split(/,|\//).map((b) => b.trim()).filter(Boolean) : [];
      return { generic, brands };
  };

  const { generic, brands } = splitNameAndBrands(item.translated_term);

  /**
   * Resolvido contra o país de DESTINO atual, e não contra o que estava salvo:
   * favoritos e lista guardam o mapa inteiro, então trocar de país troca o
   * estado na hora e a restrição de um país não vaza para outro.
   */
  const availability = item.availability?.[targetCountry.code];
  const localNameUnknown = !!availability?.localNameUnknown;

  /**
   * O que o botão de ouvir fala. Restrição NUNCA tira o áudio: quando existe
   * nome local, é ele. O botão só some quando o catálogo não tem texto nenhum
   * naquela língua para falar — e aí a alternativa, quando existe, é o que
   * a pessoa precisa pedir no balcão.
   */
  const spokenText = localNameUnknown ? (availability?.alternative ?? '') : generic;

  const displayTerm = item.translated_term;

  const renderButton = (
    phraseType: 'listen' | 'ask' | 'want',
    icon: React.ReactNode,
    title: string,
    locked: boolean
  ) => {
    // Sem texto na língua de destino não há o que pronunciar. Note que isto
    // olha para a existência do texto, não para a restrição.
    if (phraseType === 'listen' && isPharmacy && !spokenText) {
        return null;
    }

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();

      if (locked) {
        playSound('lock');
        onOpenPlan();
        return;
      }

      if (phraseType === 'listen') {
        // Na farmácia fala só o nome, sem a lista de marcas entre parênteses.
        const textToPlay = isPharmacy ? spokenText : item.translated_term;

        onPlayAudio(textToPlay, targetCountry.lang);
      } else {
        onPlayPhrase(phraseType, item);
      }
    };

    return (
      <button
        onClick={handleClick}
        className={getButtonClasses(locked)}
        aria-label={locked ? t('lockedAudio') : title}
        title={locked ? t('lockedAudio') : title}
      >
        {locked ? <span className="text-lg">🔒</span> : icon}
      </button>
    );
  };

  const isHighlighted = isInShoppingList && !isChecked;

  return (
    <div
      ref={itemRef}
      className={`rounded-xl tap bg-white ${
        isExpanded ? `shadow-md border-2 ${theme.textColor.replace('text', 'border')}` : 'shadow-sm'
      } ${isHighlighted ? 'bg-yellow-100' : 'bg-white'} overflow-hidden`}
    >
      {/*
        Antes o card inteiro era uma `div` com `onClick`: invisível para o
        teclado (0 de 25 cards alcançáveis) e sem estado para o leitor de tela.
        Agora o gatilho é um `<button>` de verdade — Tab, Enter e Espaço vêm
        de graça — e os botões de ação ficam FORA dele, como irmãos, porque
        botão dentro de botão é HTML inválido.
      */}
      <div className="px-3 py-2 flex items-stretch gap-2">
        <button
          type="button"
          onClick={handleCardClick}
          aria-expanded={isExpanded}
          aria-controls={panelId}
          aria-labelledby={[contextLabel && contextId, nameId, termId, availability && badgeId].filter(Boolean).join(' ')}
          className="flex-1 min-w-0 flex flex-col gap-1 text-left rounded-lg"
        >
            {/* Contexto: só na busca, para separar homônimos. */}
            {contextLabel && (
              <span
                id={contextId}
                className="text-[10px] font-bold uppercase tracking-wide text-gray-500 truncate"
                dir="auto"
              >
                {contextLabel}
              </span>
            )}

            {/* Linha 1: termo de origem */}
            <span className="flex items-center gap-3 overflow-hidden">
                <span className="w-7 h-7 rounded-full border border-slate-300 shadow-sm overflow-hidden relative flex-shrink-0 bg-white">
                  <img
                    src={nativeCountry.image}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span id={nameId} className="text-gray-800 font-bold text-lg truncate pr-2 leading-tight" dir="auto">{item.source_term}</span>
            </span>

            {/* Linha 2: termo de destino */}
            <span className="flex items-center gap-3 overflow-hidden">
                 <span className="w-7 h-7 rounded-full border border-slate-300 shadow-sm overflow-hidden relative flex-shrink-0 bg-white">
                    <img
                      src={targetCountry.image}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                </span>
                <span className="flex flex-col leading-tight pr-2 min-w-0">
                    {/*
                      O nome local manda na linha. A restrição vira um selo ao
                      lado — nunca ocupa o lugar do nome, que é a informação
                      que a pessoa veio buscar.
                    */}
                    <span
                      id={termId}
                      className={localNameUnknown
                        ? 'text-gray-500 font-medium italic text-sm'
                        : 'text-gray-600 font-medium uppercase'}
                      dir="auto"
                    >
                        {localNameUnknown ? t('pharmacyNoLocalName') : displayTerm}
                    </span>
                    {availability && (
                      <span
                        id={badgeId}
                        className={`mt-0.5 self-start text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                          availability.travel
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                        dir="auto"
                      >
                        {availability.travel
                          ? t('pharmacyTravelRestricted')
                          : availability.exists === 'not-marketed'
                            ? t('pharmacyNotMarketed')
                            : t('pharmacyNotAuthorized')}
                      </span>
                    )}
                </span>
            </span>
        </button>

        {/* Ações: irmãs do gatilho, não filhas. */}
        <div className="flex flex-col justify-between items-end flex-shrink-0">
            <button
                onClick={() => {
                    playSound(isFavorite ? 'click' : 'success');
                    onToggleFavorite(item);
                }}
                className="hit p-1 rounded-full flex-shrink-0 -mr-1 text-gray-500 hover:text-gray-500"
                aria-label={t('favorites')}
                aria-pressed={isFavorite}
            >
                <StarIcon className={`w-6 h-6 ${isFavorite ? 'text-yellow-400 fill-current' : ''}`} />
            </button>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {renderButton(
                'listen',
                <SpeakerIcon className={baseIconClasses} />,
                t('listenPronunciation'),
                isSpeakerLocked
              )}
              {!isPhrase && renderButton(
                'ask',
                <QuestionMarkCircleIcon className={baseIconClasses} />,
                t('askForItem'),
                isConversationLocked
              )}
              {!isPhrase && renderButton(
                'want',
                <CartIcon className={baseIconClasses} />,
                t('sayYouWantItem'),
                isConversationLocked
              )}
            </div>
        </div>
      </div>

      {/* Expandable Area */}
      <div
        id={panelId}
        className={`tap ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-96' : 'max-h-0'
        }`}
      >
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-slate-50/50">
            
            {/* PHARMACY SPECIFIC UI */}
            {isPharmacy ? (
                <div className="space-y-3">

                    {/*
                      Selo de estado do PAÍS. Fala sobre o produto existir ali,
                      ou sobre restrição para levar — nunca sobre a farmácia
                      vender, que é decisão do balcão e o app não sabe.
                    */}
                    <div
                      data-testid="pharmacy-status"
                      className={`flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg shadow-sm ${
                        availability?.travel
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : availability
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                        {availability ? (
                            <><XIcon className="w-5 h-5 flex-shrink-0" />
                             <span dir="auto">
                               {availability.travel
                                 ? t('pharmacyTravelRestricted')
                                 : availability.exists === 'not-marketed'
                                   ? t('pharmacyNotMarketed')
                                   : t('pharmacyNotAuthorized')}
                             </span></>
                        ) : (
                            <><CheckIcon className="w-5 h-5 flex-shrink-0" />
                             <span dir="auto">{t('pharmacyAvailable')}</span></>
                        )}
                    </div>

                    {availability && (
                      <p className="text-[11px] text-gray-500 leading-snug -mt-1" dir="auto">
                        {t('pharmacyCountryInfoNote')}
                      </p>
                    )}

                    {/*
                      O nome local aparece sempre que existe, com restrição ou
                      sem. Quando o catálogo não tem o nome daquele país, diz
                      isso — em vez de inventar um ou de mostrar o estado no
                      lugar do nome.
                    */}
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5" dir="auto">
                          {t('pharmacyGenericName')}
                        </p>
                        {localNameUnknown ? (
                          <p className="text-sm text-gray-500 italic leading-tight" dir="auto">{t('pharmacyNoLocalName')}</p>
                        ) : (
                          <p className="text-lg font-bold text-gray-800 leading-tight" dir="auto">{generic}</p>
                        )}
                    </div>

                    {!localNameUnknown && brands.length > 0 && (
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2" dir="auto">
                              {t('pharmacyBrands')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {brands.slice(0, 5).map((brand, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm font-medium">
                                        {brand}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sugestão que já vinha no próprio catálogo. */}
                    {availability?.alternative && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="text-[10px] text-blue-500 uppercase font-bold mb-1" dir="auto">{t('pharmacyAskInstead')}</p>
                            <p className="text-blue-800 font-bold text-sm" dir="auto">{availability.alternative}</p>
                        </div>
                    )}

                    {/* Add to List Button - Replaces Audio Button in Expanded View */}
                    {!isPhrase && (
                         <div className="pt-2 border-t border-gray-200/50 flex justify-end">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    playSound(isInShoppingList ? 'click' : 'success');
                                    onToggleShoppingListItem(item);
                                }}
                                className={`flex items-center gap-2 font-semibold py-2 px-6 rounded-full text-sm transition-transform hover:scale-105 shadow-lg flex-shrink-0 ${
                                    isInShoppingList
                                    ? 'bg-gray-700 text-white hover:bg-gray-800'
                                    : `${theme.color} text-white hover:opacity-90`
                                }`}
                            >
                                {isInShoppingList ? (
                                    <>
                                    <CheckIcon className="w-5 h-5" />
                                    <span>{t('onList')}</span>
                                    </>
                                ) : (
                                    <>
                                    <ShoppingBagIcon className="w-5 h-5" />
                                    <span>{t('add')}</span>
                                    </>
                                )}
                            </button>
                         </div>
                    )}
                </div>
            ) : (
                // SUPERMARKET / DEFAULT UI
                <div className="flex flex-row justify-between items-center">
                    <div className="flex items-center gap-4 flex-1">
                    {item.phonetic && (
                        <div className="text-left">
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{t('pronunciation')}</p>
                        <p className="text-gray-800 font-mono text-lg">{item.phonetic}</p>
                        </div>
                    )}
                    </div>

                    {!isPhrase && (
                        <button
                        onClick={(e) => {
                            e.stopPropagation();
                            playSound(isInShoppingList ? 'click' : 'success');
                            onToggleShoppingListItem(item);
                        }}
                        className={`flex items-center gap-2 font-semibold py-2 px-6 rounded-full text-sm transition-transform hover:scale-105 shadow-lg flex-shrink-0 ml-4 ${
                            isInShoppingList
                            ? 'bg-gray-700 text-white hover:bg-gray-800'
                            : `${theme.color} text-white hover:opacity-90`
                        }`}
                        >
                        {isInShoppingList ? (
                            <>
                            <CheckIcon className="w-5 h-5" />
                            <span>{t('onList')}</span>
                            </>
                        ) : (
                            <>
                            <ShoppingBagIcon className="w-5 h-5" />
                            <span>{t('add')}</span>
                            </>
                        )}
                        </button>
                    )}
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
