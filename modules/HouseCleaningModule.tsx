import React, { useMemo, useState } from 'react';
import type { Country } from '../types';
import { HomeIcon, SpeakerIcon, SpeakerOffIcon } from '../components/Icons';
import { playSound } from '../utils/soundUtils';
import { ShareButton } from '../components/ShareButton';
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

/** Cartão da frase. Destino grande; nativo logo abaixo, em 14px e não em 10. */
const PhraseCard: React.FC<{
  theme: Theme; phrase: string; alt: string | null;
  Listen: Glyph; listenLabel: string; onSpeak: (text: string) => void;
}> = ({ theme, phrase, alt, Listen, listenLabel, onSpeak }) => (
  <div className={`rounded-3xl p-4 text-white shadow-md ${theme.color}`}>
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold leading-snug" dir="auto">{phrase}</p>
        {alt && <p className="text-sm text-white mt-1 leading-snug" dir="auto">{alt}</p>}
      </div>
      <button
        onClick={() => onSpeak(phrase)}
        className="p-3 rounded-full bg-white shadow active:scale-95 transition-transform flex-shrink-0"
        style={{ color: theme.hex }}
        aria-label={listenLabel} title={listenLabel}
      >
        <Listen className="w-6 h-6" />
      </button>
    </div>
  </div>
);

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
            className={`rounded-2xl border p-3 text-left tap active:scale-95 ${on ? `${theme.color} text-white border-transparent shadow-md` : 'bg-white text-gray-700 border-gray-100'}`}
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
            className={`rounded-xl px-3 py-2.5 text-sm font-bold tap active:scale-95 border ${on ? `${theme.color} text-white border-transparent shadow` : 'bg-white text-gray-700 border-gray-100'}`}
          >
            <span dir="auto">{label(item)}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Lista de frases prontas, com áudio por linha. */
const PhraseList: React.FC<{
  items: { key: string; target: string; native: string | null }[];
  Listen: Glyph; listenLabel: string; textColor: string; onSpeak: (text: string) => void;
}> = ({ items, Listen, listenLabel, textColor, onSpeak }) => (
  <ul className="divide-y divide-gray-100">
    {items.map((item) => (
      <li key={item.key}>
        <button onClick={() => onSpeak(item.target)} className="w-full py-3 flex items-center gap-3 text-left" aria-label={listenLabel}>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold leading-snug" dir="auto">{item.target}</p>
            {item.native && <p className="text-sm text-gray-500 leading-snug" dir="auto">{item.native}</p>}
          </div>
          <Listen className={`w-6 h-6 flex-shrink-0 ${textColor}`} />
        </button>
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
    <div className="w-full bg-slate-50 text-gray-800 flex flex-col h-[100dvh] relative overflow-hidden font-sans">
      <header className="flex-shrink-0 text-white shadow-lg z-30 rounded-b-3xl" style={{ background: `linear-gradient(to bottom, ${theme.hex}, ${theme.hex}e6)` }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-4 max-w-3xl mx-auto">
          <button onClick={() => { playSound('click'); onGoHome(); }} aria-label={t('a11yHome')} className="hit p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors">
            <HomeIcon className="w-5 h-5" />
          </button>
          {/* `hcTitle` e não `moduleHouseCleaning`: o <h1> tem 190px úteis a 375px
              de largura, e "LIMPEZA DA CASA" não cabe. O cartão do hub tem a linha
              inteira e quebra, então lá continua o nome completo. */}
          <h1 className="flex-1 mx-2 text-center font-bold text-2xl uppercase tracking-tight truncate">{t('hcTitle')}</h1>
          {/* Cluster da direita. `gap-2` não é escolha estética: a área de
              toque de `.hit` é 44px centrada no botão, e com menos espaço
              que isso as duas se sobrepõem e uma para de responder. */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ShareButton onClick={onOpenShare} t={t} variant="onColor" />
            <button onClick={() => { playSound('click'); onOpenLanguageModal(); }} aria-label={t('languageSettings')} className="hit p-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors">
              <div className="flex items-center -space-x-2">
                <img src={nativeCountry.image} alt="" aria-hidden="true" className="w-6 h-6 rounded-full border border-white object-cover" />
                <img src={targetCountry.image} alt="" aria-hidden="true" className="w-6 h-6 rounded-full border border-white object-cover" />
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-10">
        <div className="px-4 pt-4 max-w-3xl mx-auto w-full space-y-4">

          {/* Seletor de modo. Dizer o que se vai fazer, ENTENDER o que mandaram e
              combinar as condições são três coisas diferentes — e a do meio é a
              única do app inteiro em que a frase é para ouvir, não para falar. */}
          <div className="bg-gray-200/70 rounded-2xl p-1 flex gap-1" role="tablist" aria-label={t('moduleHouseCleaning')}>
            {([['task', 'hcModeTask'], ['heard', 'hcModeHeard'], ['say', 'hcModeSay']] as const).map(([key, labelKey]) => {
              const active = mode === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => { playSound('page-turn'); setMode(key); }}
                  // py-3 e não py-2: com py-2 o botão fica em 36px de altura,
                  // que é exatamente o que a auditoria 8.9 lista como defeito.
                  className={`flex-1 rounded-xl py-3 text-sm font-bold tap ${active ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                  style={active ? { color: theme.hex } : undefined}
                >
                  <span dir="auto">{t(labelKey)}</span>
                </button>
              );
            })}
          </div>

          {/* ------------------------------------------------------ A TAREFA */}
          {mode === 'task' && (
            <>
              <PhraseCard theme={theme} phrase={phrase} alt={showNative ? phraseNative : null} Listen={Listen} listenLabel={listen} onSpeak={speak} />

              {task.note && (
                <p className="text-sm text-gray-600 leading-snug px-1" dir="auto">{task.note[read]}</p>
              )}

              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('hcHowToSay')}</h2>
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
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">{t('hcWhere')}</h2>
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
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2 px-1" dir="auto">{TASK_GROUP_LABELS[g][read]}</h2>
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
              <p className="text-sm text-gray-600 leading-snug bg-white rounded-3xl border border-gray-100 p-4" dir="auto">
                {t('hcHeardNote')}
              </p>

              <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
                <PhraseList
                  items={HEARD.map((h, i) => ({ key: `h${i}`, target: h[target], native: showNative ? h[native] : null }))}
                  Listen={Listen} listenLabel={listen} textColor={theme.textColor} onSpeak={speak}
                />
              </section>
            </>
          )}

          {/* ------------------------------------------------------ COMBINAR */}
          {mode === 'say' && SAY_GROUPS.map((g) => (
            <section key={g} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-1" dir="auto">{SAY_GROUP_LABELS[g][read]}</h2>
              <PhraseList
                items={SAY_PHRASES.filter((s) => s.group === g).map((s) => ({
                  key: s.key, target: s.text[target], native: showNative ? s.text[native] : null,
                }))}
                Listen={Listen} listenLabel={listen} textColor={theme.textColor} onSpeak={speak}
              />
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
