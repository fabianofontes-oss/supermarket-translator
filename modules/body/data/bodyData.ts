
// Módulo "Onde dói" — parte do corpo, sintoma e há quanto tempo.
// A frase é montada: 14 partes × 4 sintomas localizados × 6 durações, mais 8 sintomas gerais.
// Foco: espanhol da Espanha. uk e ar existem como idiomas de apoio.

import type { LangCode } from '../../location/data/locationData';

export type Text = Record<LangCode, string>;

/** [forma com artigo, forma com preposição de lugar] */
type Forms = [art: string, loc: string];

export interface BodyPart {
  key: string;
  /** Posição do marcador no boneco (viewBox 200x400). Sem posição = só aparece na lista. */
  x?: number;
  y?: number;
  names: Record<LangCode, Forms>;
}

// ---------------------------------------------------------------------------
// PARTES DO CORPO
// ---------------------------------------------------------------------------
export const BODY_PARTS: BodyPart[] = [
  { key: 'head',   x: 100, y: 26,  names: { es: ['la cabeza', 'en la cabeza'], pt: ['a cabeça', 'na cabeça'], en: ['my head', 'in my head'], fr: ['la tête', 'à la tête'], it: ['la testa', 'alla testa'], uk: ['голова', 'у голові'], ar: ['الرأس', 'في الرأس'] } },
  { key: 'eye',    x: 86,  y: 42,  names: { es: ['el ojo', 'en el ojo'], pt: ['o olho', 'no olho'], en: ['my eye', 'in my eye'], fr: ["l'œil", "à l'œil"], it: ["l'occhio", "all'occhio"], uk: ['око', 'в оці'], ar: ['العين', 'في العين'] } },
  { key: 'ear',    x: 127, y: 46,  names: { es: ['el oído', 'en el oído'], pt: ['o ouvido', 'no ouvido'], en: ['my ear', 'in my ear'], fr: ["l'oreille", "à l'oreille"], it: ["l'orecchio", "all'orecchio"], uk: ['вухо', 'у вусі'], ar: ['الأذن', 'في الأذن'] } },
  { key: 'tooth',  x: 112, y: 60,  names: { es: ['el diente', 'en el diente'], pt: ['o dente', 'no dente'], en: ['my tooth', 'in my tooth'], fr: ['la dent', 'à la dent'], it: ['il dente', 'al dente'], uk: ['зуб', 'у зубі'], ar: ['السن', 'في السن'] } },
  { key: 'throat', x: 100, y: 78,  names: { es: ['la garganta', 'en la garganta'], pt: ['a garganta', 'na garganta'], en: ['my throat', 'in my throat'], fr: ['la gorge', 'à la gorge'], it: ['la gola', 'alla gola'], uk: ['горло', 'у горлі'], ar: ['الحلق', 'في الحلق'] } },
  { key: 'chest',  x: 100, y: 110, names: { es: ['el pecho', 'en el pecho'], pt: ['o peito', 'no peito'], en: ['my chest', 'in my chest'], fr: ['la poitrine', 'à la poitrine'], it: ['il petto', 'al petto'], uk: ['груди', 'у грудях'], ar: ['الصدر', 'في الصدر'] } },
  { key: 'back',   x: 100, y: 140, names: { es: ['la espalda', 'en la espalda'], pt: ['a coluna', 'na coluna'], en: ['my back', 'in my back'], fr: ['le dos', 'au dos'], it: ['la schiena', 'alla schiena'], uk: ['спина', 'у спині'], ar: ['الظهر', 'في الظهر'] } },
  { key: 'belly',  x: 100, y: 170, names: { es: ['la barriga', 'en la barriga'], pt: ['a barriga', 'na barriga'], en: ['my belly', 'in my belly'], fr: ['le ventre', 'au ventre'], it: ['la pancia', 'alla pancia'], uk: ['живіт', 'у животі'], ar: ['البطن', 'في البطن'] } },
  { key: 'arm',    x: 146, y: 140, names: { es: ['el brazo', 'en el brazo'], pt: ['o braço', 'no braço'], en: ['my arm', 'in my arm'], fr: ['le bras', 'au bras'], it: ['il braccio', 'al braccio'], uk: ['рука', 'у руці'], ar: ['الذراع', 'في الذراع'] } },
  { key: 'hand',   x: 146, y: 205, names: { es: ['la mano', 'en la mano'], pt: ['a mão', 'na mão'], en: ['my hand', 'in my hand'], fr: ['la main', 'à la main'], it: ['la mano', 'alla mano'], uk: ['кисть', 'у кисті'], ar: ['اليد', 'في اليد'] } },
  { key: 'knee',   x: 115, y: 248, names: { es: ['la rodilla', 'en la rodilla'], pt: ['o joelho', 'no joelho'], en: ['my knee', 'in my knee'], fr: ['le genou', 'au genou'], it: ['il ginocchio', 'al ginocchio'], uk: ['коліно', 'у коліні'], ar: ['الركبة', 'في الركبة'] } },
  { key: 'leg',    x: 85,  y: 282, names: { es: ['la pierna', 'en la pierna'], pt: ['a perna', 'na perna'], en: ['my leg', 'in my leg'], fr: ['la jambe', 'à la jambe'], it: ['la gamba', 'alla gamba'], uk: ['нога', 'у нозі'], ar: ['الساق', 'في الساق'] } },
  { key: 'foot',   x: 115, y: 348, names: { es: ['el pie', 'en el pie'], pt: ['o pé', 'no pé'], en: ['my foot', 'in my foot'], fr: ['le pied', 'au pied'], it: ['il piede', 'al piede'], uk: ['стопа', 'у стопі'], ar: ['القدم', 'في القدم'] } },
  { key: 'skin',                   names: { es: ['la piel', 'en la piel'], pt: ['a pele', 'na pele'], en: ['my skin', 'in my skin'], fr: ['la peau', 'à la peau'], it: ['la pelle', 'alla pelle'], uk: ['шкіра', 'на шкірі'], ar: ['الجلد', 'في الجلد'] } },
];

// ---------------------------------------------------------------------------
// SINTOMAS
// {a} = parte com artigo, {l} = parte com preposição de lugar
// ---------------------------------------------------------------------------
export interface Symptom {
  key: string;
  emoji: string;
  /** true = precisa de uma parte do corpo. */
  local: boolean;
  labels: Text;
  templates: Text;
}

export const LOCAL_SYMPTOMS: Symptom[] = [
  {
    key: 'pain', emoji: '😖', local: true,
    labels:    { es: 'me duele', pt: 'dói', en: 'hurts', fr: 'j\'ai mal', it: 'mi fa male', uk: 'болить', ar: 'يؤلمني' },
    templates: { es: 'Me duele {a}', pt: 'Dói {a}', en: '{a} hurts', fr: "J'ai mal {l}", it: 'Mi fa male {a}', uk: 'Болить {a}', ar: 'يؤلمني {a}' },
  },
  {
    key: 'burn', emoji: '🔥', local: true,
    labels:    { es: 'me arde', pt: 'arde', en: 'burns', fr: 'ça brûle', it: 'mi brucia', uk: 'пече', ar: 'حرقة' },
    templates: { es: 'Me arde {a}', pt: 'Arde {a}', en: '{a} burns', fr: 'Ça brûle {l}', it: 'Mi brucia {a}', uk: 'Пече {a}', ar: 'أشعر بحرقة {l}' },
  },
  {
    key: 'itch', emoji: '🖐️', local: true,
    labels:    { es: 'me pica', pt: 'coça', en: 'itches', fr: 'ça démange', it: 'mi prude', uk: 'свербить', ar: 'حكة' },
    templates: { es: 'Me pica {a}', pt: 'Coça {a}', en: '{a} itches', fr: 'Ça me démange {l}', it: 'Mi prude {a}', uk: 'Свербить {a}', ar: 'أشعر بحكة {l}' },
  },
  {
    key: 'swollen', emoji: '🫧', local: true,
    labels:    { es: 'hinchazón', pt: 'inchaço', en: 'swelling', fr: 'gonflement', it: 'gonfiore', uk: 'набряк', ar: 'تورم' },
    templates: { es: 'Tengo una hinchazón {l}', pt: 'Tenho um inchaço {l}', en: 'I have swelling {l}', fr: "J'ai un gonflement {l}", it: 'Ho un gonfiore {l}', uk: 'У мене набряк {l}', ar: 'لدي تورم {l}' },
  },
];

export const GENERAL_SYMPTOMS: Symptom[] = [
  {
    key: 'fever', emoji: '🌡️', local: false,
    labels:    { es: 'fiebre', pt: 'febre', en: 'fever', fr: 'fièvre', it: 'febbre', uk: 'температура', ar: 'حمى' },
    templates: { es: 'Tengo fiebre', pt: 'Estou com febre', en: 'I have a fever', fr: "J'ai de la fièvre", it: 'Ho la febbre', uk: 'У мене температура', ar: 'لدي حمى' },
  },
  {
    key: 'cough', emoji: '😷', local: false,
    labels:    { es: 'tos', pt: 'tosse', en: 'cough', fr: 'toux', it: 'tosse', uk: 'кашель', ar: 'سعال' },
    templates: { es: 'Tengo tos', pt: 'Estou com tosse', en: 'I have a cough', fr: 'Je tousse', it: 'Ho la tosse', uk: 'У мене кашель', ar: 'لدي سعال' },
  },
  {
    key: 'nausea', emoji: '🤢', local: false,
    labels:    { es: 'náuseas', pt: 'enjoo', en: 'nausea', fr: 'nausées', it: 'nausea', uk: 'нудота', ar: 'غثيان' },
    templates: { es: 'Tengo náuseas', pt: 'Estou enjoado', en: 'I feel nauseous', fr: "J'ai des nausées", it: 'Ho la nausea', uk: 'Мене нудить', ar: 'أشعر بالغثيان' },
  },
  {
    key: 'vomit', emoji: '🤮', local: false,
    labels:    { es: 'he vomitado', pt: 'vomitei', en: 'vomited', fr: "j'ai vomi", it: 'ho vomitato', uk: 'блювота', ar: 'تقيؤ' },
    templates: { es: 'He vomitado', pt: 'Eu vomitei', en: 'I have vomited', fr: "J'ai vomi", it: 'Ho vomitato', uk: 'Мене вирвало', ar: 'لقد تقيأت' },
  },
  {
    key: 'dizzy', emoji: '😵‍💫', local: false,
    labels:    { es: 'mareo', pt: 'tontura', en: 'dizzy', fr: 'vertiges', it: 'vertigini', uk: 'запаморочення', ar: 'دوار' },
    templates: { es: 'Estoy mareado', pt: 'Estou tonto', en: 'I feel dizzy', fr: "J'ai des vertiges", it: 'Ho le vertigini', uk: 'У мене паморочиться голова', ar: 'أشعر بالدوار' },
  },
  {
    key: 'diarrhea', emoji: '🚽', local: false,
    labels:    { es: 'diarrea', pt: 'diarreia', en: 'diarrhea', fr: 'diarrhée', it: 'diarrea', uk: 'діарея', ar: 'إسهال' },
    templates: { es: 'Tengo diarrea', pt: 'Estou com diarreia', en: 'I have diarrhea', fr: "J'ai la diarrhée", it: 'Ho la diarrea', uk: 'У мене діарея', ar: 'لدي إسهال' },
  },
  {
    key: 'allergy', emoji: '🤧', local: false,
    labels:    { es: 'alergia', pt: 'alergia', en: 'allergy', fr: 'allergie', it: 'allergia', uk: 'алергія', ar: 'حساسية' },
    templates: { es: 'Tengo alergia', pt: 'Estou com alergia', en: 'I have an allergy', fr: "J'ai une allergie", it: "Ho un'allergia", uk: 'У мене алергія', ar: 'لدي حساسية' },
  },
  {
    key: 'breathe', emoji: '🫁', local: false,
    labels:    { es: 'me falta el aire', pt: 'falta de ar', en: 'short of breath', fr: 'du mal à respirer', it: 'fiato corto', uk: 'важко дихати', ar: 'ضيق تنفس' },
    templates: { es: 'Me cuesta respirar', pt: 'Estou com falta de ar', en: "I can't breathe well", fr: "J'ai du mal à respirer", it: 'Faccio fatica a respirare', uk: 'Мені важко дихати', ar: 'أجد صعوبة في التنفس' },
  },
];

// ---------------------------------------------------------------------------
// HÁ QUANTO TEMPO
// ---------------------------------------------------------------------------
export interface Duration { key: string; labels: Text; phrases: Text }

export const DURATIONS: Duration[] = [
  { key: 'today',     labels: { es: 'hoy', pt: 'hoje', en: 'today', fr: "aujourd'hui", it: 'oggi', uk: 'сьогодні', ar: 'اليوم' },
                      phrases: { es: 'desde hoy', pt: 'desde hoje', en: 'since today', fr: "depuis aujourd'hui", it: 'da oggi', uk: 'з сьогодні', ar: 'منذ اليوم' } },
  { key: 'yesterday', labels: { es: 'ayer', pt: 'ontem', en: 'yesterday', fr: 'hier', it: 'ieri', uk: 'учора', ar: 'الأمس' },
                      phrases: { es: 'desde ayer', pt: 'desde ontem', en: 'since yesterday', fr: 'depuis hier', it: 'da ieri', uk: 'з учора', ar: 'منذ الأمس' } },
  { key: 'twoDays',   labels: { es: '2 días', pt: '2 dias', en: '2 days', fr: '2 jours', it: '2 giorni', uk: '2 дні', ar: 'يومان' },
                      phrases: { es: 'desde hace dos días', pt: 'há dois dias', en: 'for two days', fr: 'depuis deux jours', it: 'da due giorni', uk: 'вже два дні', ar: 'منذ يومين' } },
  { key: 'week',      labels: { es: '1 semana', pt: '1 semana', en: '1 week', fr: '1 semaine', it: '1 settimana', uk: '1 тиждень', ar: 'أسبوع' },
                      phrases: { es: 'desde hace una semana', pt: 'há uma semana', en: 'for a week', fr: 'depuis une semaine', it: 'da una settimana', uk: 'вже тиждень', ar: 'منذ أسبوع' } },
  { key: 'month',     labels: { es: '1 mes', pt: '1 mês', en: '1 month', fr: '1 mois', it: '1 mese', uk: '1 місяць', ar: 'شهر' },
                      phrases: { es: 'desde hace un mes', pt: 'há um mês', en: 'for a month', fr: 'depuis un mois', it: 'da un mese', uk: 'вже місяць', ar: 'منذ شهر' } },
];

// ---------------------------------------------------------------------------
// FRASES DA FARMÁCIA E DO MÉDICO
// ---------------------------------------------------------------------------
export const BODY_QUESTIONS: Text[] = [
  { es: '¿Tiene algo para esto?', pt: 'Tem alguma coisa para isso?', en: 'Do you have something for this?', fr: 'Avez-vous quelque chose pour ça ?', it: 'Ha qualcosa per questo?', uk: 'У вас є щось від цього?', ar: 'هل لديك شيء لهذا؟' },
  { es: '¿Necesito receta?', pt: 'Preciso de receita?', en: 'Do I need a prescription?', fr: "Ai-je besoin d'une ordonnance ?", it: 'Serve la ricetta?', uk: 'Чи потрібен рецепт?', ar: 'هل أحتاج وصفة طبية؟' },
  { es: '¿Cuántas veces al día?', pt: 'Quantas vezes por dia?', en: 'How many times a day?', fr: 'Combien de fois par jour ?', it: 'Quante volte al giorno?', uk: 'Скільки разів на день?', ar: 'كم مرة في اليوم؟' },
  { es: 'Soy alérgico a la penicilina.', pt: 'Sou alérgico a penicilina.', en: 'I am allergic to penicillin.', fr: 'Je suis allergique à la pénicilline.', it: 'Sono allergico alla penicillina.', uk: 'У мене алергія на пеніцилін.', ar: 'لدي حساسية من البنسلين.' },
  { es: 'Estoy embarazada.', pt: 'Estou grávida.', en: 'I am pregnant.', fr: 'Je suis enceinte.', it: 'Sono incinta.', uk: 'Я вагітна.', ar: 'أنا حامل.' },
  { es: 'Necesito un médico.', pt: 'Preciso de um médico.', en: 'I need a doctor.', fr: "J'ai besoin d'un médecin.", it: 'Ho bisogno di un medico.', uk: 'Мені потрібен лікар.', ar: 'أحتاج طبيبًا.' },
  { es: '¿Dónde está el hospital más cercano?', pt: 'Onde fica o hospital mais próximo?', en: 'Where is the nearest hospital?', fr: "Où est l'hôpital le plus proche ?", it: "Dov'è l'ospedale più vicino?", uk: 'Де найближча лікарня?', ar: 'أين أقرب مستشفى؟' },
  { es: 'Es urgente.', pt: 'É urgente.', en: "It's urgent.", fr: "C'est urgent.", it: 'È urgente.', uk: 'Це терміново.', ar: 'الأمر عاجل.' },
];

// ---------------------------------------------------------------------------
// MONTAGEM DA FRASE
// ---------------------------------------------------------------------------
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Me duele la cabeza desde hace dos días." */
export const buildComplaint = (
  lang: LangCode,
  symptom: Symptom,
  part: BodyPart | null,
  duration: Duration | null,
): string => {
  let base = symptom.templates[lang];

  if (symptom.local && part) {
    const [art, loc] = part.names[lang];
    base = base.replace('{a}', art).replace('{l}', loc);
  }

  const tail = duration ? ` ${duration.phrases[lang]}` : '';
  return `${cap(base)}${tail}.`;
};
