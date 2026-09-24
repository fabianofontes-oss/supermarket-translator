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
  HEARD, SAY_PHRASES, SAY_GROUPS, SAY_GROUP_LABELS,
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
 * Piso de 14px, como no módulo irmão e ao contrário dos outros dez: o corpo é
 * `text-base` e a linha de apoio é `text-sm`, nunca `text-[10px]`. Quem usa esta
 * tela lê de pé, no meio do trabalho, muitas vezes de óculos.
 *
 * Os ajudantes ficam fora do componente porque, definidos dentro, seriam funções
 * novas a cada render e o React remontaria a subárvore a cada toque. São cópias dos
 * de `ElderCareModule.tsx` de propósito: os dois módulos são irmãos hoje, mas um tem
 * seletores de flexão e o outro não, e acoplá-los faria uma mudança num mexer no
 * outro. Mesma escolha que o projeto já fez para o cabeçalho (AGENTS.md 8.17).
 */

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
            className={`rounded-2xl border p-3 text-left tap active:scale-95 ${on ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-100 dark:border-slate-700'}`}
          >
            <span className="block text-sm font-bold leading-tight" dir="auto">{label(item)}</span>
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
            {item.native && <p className="text-sm text-gray-500 dark:text-slate-400 leading-snug" dir="auto">{item.native}</p>}
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

  /** Liga cada aba ao seu painel. `useId` evita colisão se dois módulos
   *  chegarem a existir na mesma árvore. */
  const tabsId = useId();
  const [mode, setMode] = useState<'task' | 'heard' | 'say'>('task');
  const [task, setTask] = useState<Task>(TASKS[0]);
  const [frame, setFrame] = useState<TaskFrame>(TASK_FRAMES[0]);
  const [place, setPlace] = useState<Place | null>(null);

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
          {/* Só o modo `A tarefa` monta frase. Nos outros dois as frases já vêm
              prontas em lista, e não há o que ver se formando — a banda fica só
              com as abas, e isso é resposta, não falta. */}
          {mode === 'task' && (
            <PhraseCard theme={theme} phrase={phrase} alt={showNative ? phraseNative : null} Listen={Listen} listenLabel={listen} onSpeak={speak} />
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
            {task.note && (
              <p className="text-sm text-gray-600 dark:text-slate-300 leading-snug px-1" dir="auto">{task.note[read]}</p>
            )}

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1">{t('hcHowToSay')}</h2>
              <Pills<TaskFrame>
                theme={theme}
                items={TASK_FRAMES}
                active={frame.key}
                onPick={setFrame}
                label={(f) => f.labels[read]}
              />
            </section>

            {/* O cômodo só existe para a tarefa que o aceita. Some da tela em vez
                de ficar apagado — mesma regra que as Direções adotaram: botão que
                passa a vida apagado ensina a pessoa a parar de olhar para ali. */}
            {task.placeMode && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1">{t('hcWhere')}</h2>
                {/* Um toque no cômodo já escolhido desfaz a escolha. */}
                <Pills<Place>
                  theme={theme}
                  items={PLACES}
                  active={place?.key ?? null}
                  onPick={(p) => setPlace(place?.key === p.key ? null : p)}
                  label={(p) => p.labels[read]}
                />
              </section>
            )}

            {TASK_GROUPS.map((g) => (
              <section key={g}>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2 px-1" dir="auto">{TASK_GROUP_LABELS[g][read]}</h2>
                <Chips<Task>
                  theme={theme}
                  items={TASKS.filter((x) => x.group === g)}
                  active={task.key}
                  onPick={pickTask}
                  label={(x) => x.labels[read]}
                />
              </section>
            ))}
          </>
        )}

        {/* ---------------------------------------------- O QUE ELA PEDE */}
        {mode === 'heard' && (
          <>
            {/* Único lugar do app em que a frase é para RECONHECER, não para
                falar. Sem esta linha, a pessoa treina a pronúncia de uma ordem
                que ela mesma nunca vai dar. */}
            <p className="text-sm text-gray-600 dark:text-slate-300 leading-snug bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 p-4" dir="auto">
              {t('hcHeardNote')}
            </p>

            <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
              <PhraseList
                items={HEARD.map((h) => ({ key: h.key, target: h.text[target], native: showNative ? h.text[native] : null, note: h.note?.[read] ?? null }))}
                Listen={Listen} listenLabel={listen} textColor={theme.textColor} onSpeak={speak}
              />
            </section>
          </>
        )}

        {/* ------------------------------------------------------ COMBINAR */}
        {mode === 'say' && SAY_GROUPS.map((g) => (
          <section key={g} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-1" dir="auto">{SAY_GROUP_LABELS[g][read]}</h2>
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
