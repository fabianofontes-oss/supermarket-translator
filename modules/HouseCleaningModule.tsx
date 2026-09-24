import React, { useId, useMemo, useState } from 'react';
import { ModuleShell } from '../components/ModuleShell';
import { ModeTabs, panelProps } from '../components/ModeTabs';
import { PhraseCard } from '../components/PhraseCard';
import type { Country } from '../types';
import { SpeakerIcon, SpeakerOffIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import type { VoiceStatus } from '../utils/speech';
import { toLangCode } from './location/data/locationData';
import {
  TASKS, TASK_GROUPS, TASK_GROUP_LABELS, PLACES, TASK_FRAMES,
  HEARD, SAY_PHRASES, SAY_GROUPS, SAY_GROUP_LABELS, TIP_LABEL,
  buildTaskPhrase,
  type Task, type Place, type TaskFrame,
} from './housecleaning/data/houseCleaningData';

type Theme = { color: string; textColor: string; hex: string; borderColor: string };
type Glyph = React.FC<{ className?: string }>;

interface HouseCleaningModuleProps {
  nativeCountry: Country;
  targetCountry: Country;
  t: (key: string) => string;
  theme: Theme;
  onGoHome: () => void;
  onOpenLanguageModal: () => void;
  onOpenShare: () => void;
  handlePlayAudio: (text: string, lang: string) => void;
  /** Voz do idioma de destino no aparelho; 'missing' apaga os botões de áudio. */
  voiceStatus?: VoiceStatus;
}

/*
 * Piso de 14px, como no módulo irmão: o corpo é `text-base` e a linha de apoio é
 * `text-sm`, nunca menos. Quem usa esta
 * tela lê de pé, no meio do trabalho, muitas vezes de óculos. A tarefa, que é a
 * escolha principal, tem rótulo de 16px; e nenhum texto em português fica em
 * cinza-claro (`gray-600` no mínimo).
 *
 * Os ajudantes ficam fora do componente porque, definidos dentro, seriam funções
 * novas a cada render e o React remontaria a subárvore a cada toque. São cópias dos
 * de `ElderCareModule.tsx` de propósito: os dois módulos são irmãos hoje, mas um tem
 * seletores de flexão e o outro não, e acoplá-los faria uma mudança num mexer no
 * outro. Mesma escolha que o projeto já fez para o cabeçalho (AGENTS.md 8.17).
 */

/** Título de grupo: rótulo curto em caixa alta. */
const ROTULO = 'text-sm font-bold uppercase tracking-widest text-gray-600 dark:text-slate-300 mb-2 px-1';
/** Título que é PERGUNTA ("Qual serviço?"): frase normal, 16px, cor escura. */
const PERGUNTA = 'text-base font-bold text-gray-900 dark:text-slate-100 mb-2 px-1';

/** Grade de escolhas rotuladas. Uma seção por grupo. */
function Chips<T extends { key: string }>({ theme, items, active, onPick, label }: {
  theme: Theme; items: T[]; active: string | null; onPick: (item: T) => void; label: (item: T) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => {
        const on = item.key === active;
        return (
          <button
            key={item.key}
            aria-pressed={on}
            onClick={() => { playSound('click'); onPick(item); }}
            className={`rounded-2xl border p-3 text-left tap active:scale-95 ${on ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border-gray-100 dark:border-slate-700'}`}
          >
            <span className="block text-base font-bold leading-tight" dir="auto">{label(item)}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Fila de escolhas soltas, para os quadros. */
function Pills<T extends { key: string }>({ theme, items, active, onPick, label }: {
  theme: Theme; items: T[]; active: string | null; onPick: (item: T) => void; label: (item: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const on = item.key === active;
        return (
          <button
            key={item.key}
            aria-pressed={on}
            onClick={() => { playSound('toggle'); onPick(item); }}
            className={`rounded-xl px-3 py-2.5 text-sm font-bold tap active:scale-95 border ${on ? `${theme.color} text-white border-transparent shadow` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700'}`}
          >
            <span dir="auto">{label(item)}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Lista de frases prontas, com áudio por linha e o costume que a frase supõe. */
const PhraseList: React.FC<{
  items: { key: string; target: string; native: string | null; note?: string | null }[];
  Listen: Glyph; listenLabel: string; textColor: string; onSpeak: (text: string) => void;
}> = ({ items, Listen, listenLabel, textColor, onSpeak }) => (
  <ul className="divide-y divide-gray-100 dark:divide-slate-700">
    {items.map((item) => (
      <li key={item.key} className="py-1">
        <button onClick={() => onSpeak(item.target)} className="w-full py-2 flex items-center gap-3 text-left tap active:scale-[0.98]" aria-label={listenLabel}>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold leading-snug" dir="auto">{item.target}</p>
            {item.native && <p className="text-sm text-gray-600 dark:text-slate-300 leading-snug" dir="auto">{item.native}</p>}
          </div>
          <Listen className={`w-6 h-6 flex-shrink-0 ${textColor}`} />
        </button>
        {/* A nota fica FORA do botão: é para ler, não para falar, e dentro dele
            entraria no nome acessível da frase. */}
        {item.note && <p className="text-sm text-gray-600 dark:text-slate-300 leading-snug pb-2 pr-9" dir="auto">{item.note}</p>}
      </li>
    ))}
  </ul>
);

export default function HouseCleaningModule({
  nativeCountry,
  targetCountry,
  t,
  theme,
  onGoHome,
  onOpenLanguageModal,
  onOpenShare,
  handlePlayAudio,
  voiceStatus = 'unknown',
}: HouseCleaningModuleProps) {
  const target = toLangCode(targetCountry.lang);
  const native = toLangCode(nativeCountry.lang);
  const showNative = native !== target;
  /** A língua em que se EXPLICA: a de quem lê. A frase sai sempre no destino. */
  const read = showNative ? native : target;
  /**
   * Toda nota deste módulo explica uma palavra ESPANHOLA — fregona, trastero,
   * coger, o tú da patroa. Nos EUA e na França ela explicava uma palavra que não
   * estava na tela, e a pessoa achava que era ela quem não tinha entendido. Então
   * nota, dica e a linha do tú/usted só existem com destino Espanha.
   */
  const naEspanha = targetCountry.code === 'es';

  /** Liga cada aba ao seu painel. `useId` evita colisão se dois módulos
   *  chegarem a existir na mesma árvore. */
  const tabsId = useId();
  const [mode, setMode] = useState<'task' | 'heard' | 'say'>('task');
  const [task, setTask] = useState<Task>(TASKS[0]);
  const [frame, setFrame] = useState<TaskFrame>(TASK_FRAMES[0]);
  /**
   * Começa na cozinha, e não vazio: a tela abre dizendo "Voy a limpiar la
   * cocina.", a frase que quem limpa casa mais diz, com os três botões que a
   * formam acesos (Vou…, Limpar, A cozinha). Um toque na cozinha desfaz.
   */
  const [place, setPlace] = useState<Place | null>(PLACES[0]);

  const phrase = useMemo(() => buildTaskPhrase(target, frame, task, place), [target, frame, task, place]);
  const phraseNative = useMemo(() => buildTaskPhrase(native, frame, task, place), [native, frame, task, place]);

  // Sem voz do idioma de destino, `handlePlayAudio` recusa falar e abre o
  // aviso — falar com a voz padrão ensinaria outra pronúncia. Aqui só o botão
  // conta isso antes do toque.
  const voiceMissing = voiceStatus === 'missing';
  const Listen = voiceMissing ? SpeakerOffIcon : SpeakerIcon;
  const listen = voiceMissing ? `${t('locListen')} — ${t('voiceMissingLabel')}` : t('locListen');

  const speak = (text: string) => {
    playSound('click');
    handlePlayAudio(text, targetCountry.lang);
  };

  /**
   * Trocar de tarefa NÃO descarta o cômodo escolhido, mesmo quando a tarefa nova
   * não aceita cômodo nenhum: quem escolheu "a cozinha" e passou por "sacar la
   * basura" teria de escolher de novo ao voltar para "fregar el suelo". Quem
   * filtra é o builder; a seção simplesmente some da tela. Mesma decisão que a
   * Maquiagem tomou com o tom da pele.
   */
  const pickTask = (x: Task) => {
    playSound('click');
    setTask(x);
  };

  return (
    <ModuleShell
      title={t('hcTitle')}
      theme={theme}
      t={t}
      nativeCountry={nativeCountry}
      targetCountry={targetCountry}
      onGoHome={onGoHome}
      onOpenLanguageModal={onOpenLanguageModal}
      onOpenShare={onOpenShare}
      // A dica diz "escolha o serviço, o cômodo é opcional, a frase é para a
      // patroa" — só é verdade na aba que monta frase. Na aba "A patroa diz" ela
      // contradiria o aviso de cima (lá a frase vem DA patroa).
      dica={mode === 'task' ? t('hintHouseCleaning') : undefined}
      // A linha de gesto diz "toque aqui embaixo e a frase lá em cima muda". Nas
      // outras duas abas a banda não tem frase — em "A patroa diz", ainda por
      // cima, a frase nem é para falar. Lá ela prometeria o que não acontece.
      gesto={mode === 'task'}
      pinned={(
        <>
          {/* Seletor de modo. Dizer o que se vai fazer, ENTENDER o que mandaram e
              combinar as condições são três coisas diferentes — e a do meio é a
              única do app inteiro em que a frase é para ouvir, não para falar. */}
          <ModeTabs<'task' | 'heard' | 'say'>
            idPrefix={tabsId}
            label={t('moduleHouseCleaning')}
            value={mode}
            options={[{ key: 'task', label: t('hcModeTask') }, { key: 'heard', label: t('hcModeHeard') }, { key: 'say', label: t('hcModeSay') }]}
            onChange={setMode}
            theme={theme}
          />
          {/* Na aba que monta frase, a banda mostra a frase. Em "A patroa diz", mostra
              o aviso de que ali é para RECONHECER, não para falar — e ele mora aqui, e
              não na rolagem, porque na rolagem sumia ao descer, e a lista ficava igual
              à de "Combinar", com o mesmo alto-falante. Em "Combinar" a banda fica só
              com as abas: as frases já vêm prontas em lista, e isso é resposta, não
              falta. */}
          {mode === 'task' && (
            <PhraseCard theme={theme} phrase={phrase} alt={showNative ? phraseNative : null} Listen={Listen} listenLabel={listen} onSpeak={speak} />
          )}
          {mode === 'heard' && (
            <div className="px-1 space-y-1">
              <p className="text-base font-semibold leading-snug text-gray-900 dark:text-slate-100" dir="auto">{t('hcHeardNote')}</p>
              {naEspanha && (
                <p className="text-base leading-snug text-gray-700 dark:text-slate-200" dir="auto">{t('hcHeardNoteSpain')}</p>
              )}
            </div>
          )}
        </>
      )}
    >
      {/* O painel que as abas apontam. Só o do modo escolhido existe, então
          um `div` basta: ele assume o id e o rótulo do modo atual. */}
      <div {...panelProps(tabsId, mode)} className="space-y-4">

        {/* ------------------------------------------------------ A TAREFA */}
        {mode === 'task' && (
          <>
            <section>
              <h2 className={ROTULO} dir="auto">{t('hcHowToSay')}</h2>
              <Pills<TaskFrame>
                theme={theme}
                items={TASK_FRAMES}
                active={frame.key}
                onPick={setFrame}
                label={(f) => f.labels[read]}
              />
            </section>

            {/* A tarefa vem antes do cômodo, sob uma pergunta que diz o que
                escolher. Antes a ordem era dica, "Como dizer", sete cômodos, e só
                no pé da primeira tela as tarefas, sob títulos ("PELA CASA", "A
                COZINHA") que pareciam lugares e não ações. */}
            <section>
              <h2 className={PERGUNTA} dir="auto">{t('hcWhatTask')}</h2>
              <div className="space-y-4">
                {TASK_GROUPS.map((g) => {
                  const aqui = g === task.group;
                  const comodo = aqui && !!task.placeMode;
                  const dica = aqui && naEspanha ? task.note?.[read] : undefined;
                  return (
                    <div key={g}>
                      <h3 className={ROTULO} dir="auto">{TASK_GROUP_LABELS[g][read]}</h3>
                      <Chips<Task>
                        theme={theme}
                        items={TASKS.filter((x) => x.group === g)}
                        active={task.key}
                        onPick={pickTask}
                        label={(x) => x.labels[read]}
                      />
                      {/* O que depende da tarefa escolhida mora logo abaixo dela,
                          perto do dedo: o cômodo (que muda a frase) e a dica (que
                          explica a palavra). Antes os dois ficavam lá em cima, e a
                          dica trocava onde ninguém estava olhando. A caixa tem o
                          tom da banda da frase: é um pedaço dela, não outro grupo
                          de tarefas — senão "A cozinha" (cômodo) e "A COZINHA"
                          (grupo) viravam a mesma coisa. */}
                      {(comodo || dica) && (
                        <div className="mt-2 rounded-2xl p-3 space-y-3" style={{ backgroundColor: `${theme.hex}14` }}>
                          {/* O cômodo só existe para a tarefa que o aceita. Some da
                              tela em vez de ficar apagado — mesma regra que as
                              Direções adotaram: botão que passa a vida apagado
                              ensina a pessoa a parar de olhar para ali. */}
                          {comodo && (
                            <div>
                              <h4 className={PERGUNTA} dir="auto">{t('hcWhere')}</h4>
                              {/* Um toque no cômodo já escolhido desfaz a escolha. */}
                              <Pills<Place>
                                theme={theme}
                                items={PLACES}
                                active={place?.key ?? null}
                                onPick={(p) => setPlace(place?.key === p.key ? null : p)}
                                label={(p) => p.labels[read]}
                              />
                            </div>
                          )}
                          {dica && (
                            <p className="text-base leading-snug text-gray-800 dark:text-slate-100 px-1" dir="auto">
                              <b>{TIP_LABEL[read]}</b> {dica}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* --------------------------------------------- A PATROA DIZ */}
        {/* O aviso de "é para reconhecer" está na banda fixa, lá em cima. */}
        {mode === 'heard' && (
          <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
            <PhraseList
              items={HEARD.map((h) => ({
                key: h.key,
                target: h.text[target],
                native: showNative ? h.text[native] : null,
                note: naEspanha ? h.note?.[read] ?? null : null,
              }))}
              Listen={Listen} listenLabel={listen} textColor={theme.textColor} onSpeak={speak}
            />
          </section>
        )}

        {/* ------------------------------------------------------ COMBINAR */}
        {/* Os avisos vêm primeiro (ver `SAY_GROUPS`). */}
        {mode === 'say' && SAY_GROUPS.map((g) => (
          <section key={g} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-600 dark:text-slate-300 mb-1" dir="auto">{SAY_GROUP_LABELS[g][read]}</h2>
            <PhraseList
              items={SAY_PHRASES.filter((s) => s.group === g).map((s) => ({
                key: s.key, target: s.text[target], native: showNative ? s.text[native] : null,
              }))}
              Listen={Listen} listenLabel={listen} textColor={theme.textColor} onSpeak={speak}
            />
          </section>
        ))}
      </div>
    </ModuleShell>
  );
}
