
// Módulo "Onde está?" — dados e gramática para frases de posição espacial.
// A frase principal é sempre no idioma de DESTINO (o que o imigrante está aprendendo).
// O idioma nativo aparece só como apoio, em letra pequena.
//
// Idiomas: pt, es, en, fr, it (destinos) + uk (ucraniano) e ar (árabe padrão) como origem.
// Ucraniano não tem artigo mas declina o substantivo: cada objeto traz genitivo, instrumental e locativo.
// Árabe usa o artigo "ال" colado ao substantivo e não tem verbo "estar" no presente.

export type LangCode = 'pt' | 'es' | 'en' | 'fr' | 'it' | 'uk' | 'ar';

export const SUPPORTED_LANGS: LangCode[] = ['pt', 'es', 'en', 'fr', 'it', 'uk', 'ar'];

/** Converte "pt-BR", "es-CL", "uk-UA", "ar-MA"... para o código base usado nos dados. */
export const toLangCode = (lang: string): LangCode => {
  const base = lang.split('-')[0] as LangCode;
  return SUPPORTED_LANGS.includes(base) ? base : 'en';
};

interface NounForm {
  n: string;                                        // substantivo sem artigo (nominativo)
  g?: 'm' | 'f';                                    // gênero (línguas com artigo)
  cases?: { gen: string; instr: string; loc: string }; // declinação (ucraniano)
}

export interface LocObject {
  key: string;
  emoji: string;
  names: Record<LangCode, NounForm>;
}

export interface LocRelation {
  key: string;
  /** Frase terminando na preposição, ex: "à direita de". Em ucraniano usa {gen}/{instr}/{loc}. */
  phrases: Record<LangCode, string>;
  /** Rótulo curto para o botão, ex: "à direita". */
  labels: Record<LangCode, string>;
}

// ---------------------------------------------------------------------------
// OBJETOS (todos no singular para manter a concordância simples)
// ---------------------------------------------------------------------------
export const LOC_OBJECTS: LocObject[] = [
  { key: 'ball',  emoji: '⚽', names: { pt: { n: 'bola', g: 'f' },     es: { n: 'pelota', g: 'f' },   en: { n: 'ball' },  fr: { n: 'ballon', g: 'm' },    it: { n: 'palla', g: 'f' },    uk: { n: "м'яч",    cases: { gen: "м'яча",    instr: "м'ячем",    loc: "м'ячі" } },    ar: { n: 'كرة' } } },
  { key: 'box',   emoji: '📦', names: { pt: { n: 'caixa', g: 'f' },    es: { n: 'caja', g: 'f' },     en: { n: 'box' },   fr: { n: 'boîte', g: 'f' },     it: { n: 'scatola', g: 'f' },  uk: { n: 'коробка', cases: { gen: 'коробки',  instr: 'коробкою',  loc: 'коробці' } },  ar: { n: 'صندوق' } } },
  { key: 'key',   emoji: '🔑', names: { pt: { n: 'chave', g: 'f' },    es: { n: 'llave', g: 'f' },    en: { n: 'key' },   fr: { n: 'clé', g: 'f' },       it: { n: 'chiave', g: 'f' },   uk: { n: 'ключ',    cases: { gen: 'ключа',    instr: 'ключем',    loc: 'ключі' } },    ar: { n: 'مفتاح' } } },
  { key: 'phone', emoji: '📱', names: { pt: { n: 'celular', g: 'm' },  es: { n: 'teléfono', g: 'm' }, en: { n: 'phone' }, fr: { n: 'téléphone', g: 'm' }, it: { n: 'telefono', g: 'm' }, uk: { n: 'телефон', cases: { gen: 'телефону', instr: 'телефоном', loc: 'телефоні' } }, ar: { n: 'هاتف' } } },
  { key: 'book',  emoji: '📖', names: { pt: { n: 'livro', g: 'm' },    es: { n: 'libro', g: 'm' },    en: { n: 'book' },  fr: { n: 'livre', g: 'm' },     it: { n: 'libro', g: 'm' },    uk: { n: 'книга',   cases: { gen: 'книги',    instr: 'книгою',    loc: 'книзі' } },    ar: { n: 'كتاب' } } },
  { key: 'bag',   emoji: '👜', names: { pt: { n: 'bolsa', g: 'f' },    es: { n: 'bolso', g: 'm' },    en: { n: 'bag' },   fr: { n: 'sac', g: 'm' },       it: { n: 'borsa', g: 'f' },    uk: { n: 'сумка',   cases: { gen: 'сумки',    instr: 'сумкою',    loc: 'сумці' } },    ar: { n: 'حقيبة' } } },
  { key: 'cup',   emoji: '☕', names: { pt: { n: 'xícara', g: 'f' },   es: { n: 'taza', g: 'f' },     en: { n: 'cup' },   fr: { n: 'tasse', g: 'f' },     it: { n: 'tazza', g: 'f' },    uk: { n: 'чашка',   cases: { gen: 'чашки',    instr: 'чашкою',    loc: 'чашці' } },    ar: { n: 'كوب' } } },
  { key: 'chair', emoji: '🪑', names: { pt: { n: 'cadeira', g: 'f' },  es: { n: 'silla', g: 'f' },    en: { n: 'chair' }, fr: { n: 'chaise', g: 'f' },    it: { n: 'sedia', g: 'f' },    uk: { n: 'стілець', cases: { gen: 'стільця',  instr: 'стільцем',  loc: 'стільці' } },  ar: { n: 'كرسي' } } },
  { key: 'sofa',  emoji: '🛋️', names: { pt: { n: 'sofá', g: 'm' },     es: { n: 'sofá', g: 'm' },     en: { n: 'sofa' },  fr: { n: 'canapé', g: 'm' },    it: { n: 'divano', g: 'm' },   uk: { n: 'диван',   cases: { gen: 'дивана',   instr: 'диваном',   loc: 'дивані' } },   ar: { n: 'أريكة' } } },
  { key: 'bed',   emoji: '🛏️', names: { pt: { n: 'cama', g: 'f' },     es: { n: 'cama', g: 'f' },     en: { n: 'bed' },   fr: { n: 'lit', g: 'm' },       it: { n: 'letto', g: 'm' },    uk: { n: 'ліжко',   cases: { gen: 'ліжка',    instr: 'ліжком',    loc: 'ліжку' } },    ar: { n: 'سرير' } } },
  { key: 'door',  emoji: '🚪', names: { pt: { n: 'porta', g: 'f' },    es: { n: 'puerta', g: 'f' },   en: { n: 'door' },  fr: { n: 'porte', g: 'f' },     it: { n: 'porta', g: 'f' },    uk: { n: 'двері',   cases: { gen: 'дверей',   instr: 'дверима',   loc: 'дверях' } },   ar: { n: 'باب' } } },
  { key: 'car',   emoji: '🚗', names: { pt: { n: 'carro', g: 'm' },    es: { n: 'coche', g: 'm' },    en: { n: 'car' },   fr: { n: 'voiture', g: 'f' },   it: { n: 'macchina', g: 'f' }, uk: { n: 'машина',  cases: { gen: 'машини',   instr: 'машиною',   loc: 'машині' } },   ar: { n: 'سيارة' } } },
  { key: 'cat',   emoji: '🐱', names: { pt: { n: 'gato', g: 'm' },     es: { n: 'gato', g: 'm' },     en: { n: 'cat' },   fr: { n: 'chat', g: 'm' },      it: { n: 'gatto', g: 'm' },    uk: { n: 'кіт',     cases: { gen: 'кота',     instr: 'котом',     loc: 'коті' } },     ar: { n: 'قط' } } },
  { key: 'dog',   emoji: '🐶', names: { pt: { n: 'cachorro', g: 'm' }, es: { n: 'perro', g: 'm' },    en: { n: 'dog' },   fr: { n: 'chien', g: 'm' },     it: { n: 'cane', g: 'm' },     uk: { n: 'собака',  cases: { gen: 'собаки',   instr: 'собакою',   loc: 'собаці' } },   ar: { n: 'كلب' } } },
];

// ---------------------------------------------------------------------------
// RELAÇÕES ESPACIAIS
// ---------------------------------------------------------------------------
export const LOC_RELATIONS: LocRelation[] = [
  {
    key: 'right',
    phrases: { pt: 'à direita de', es: 'a la derecha de', en: 'to the right of', fr: 'à droite de', it: 'a destra di', uk: 'праворуч від {gen}', ar: 'على يمين' },
    labels:  { pt: 'à direita',    es: 'a la derecha',    en: 'right',           fr: 'à droite',    it: 'a destra',    uk: 'праворуч',           ar: 'يمين' },
  },
  {
    key: 'left',
    phrases: { pt: 'à esquerda de', es: 'a la izquierda de', en: 'to the left of', fr: 'à gauche de', it: 'a sinistra di', uk: 'ліворуч від {gen}', ar: 'على يسار' },
    labels:  { pt: 'à esquerda',    es: 'a la izquierda',    en: 'left',           fr: 'à gauche',    it: 'a sinistra',    uk: 'ліворуч',           ar: 'يسار' },
  },
  {
    key: 'above',
    phrases: { pt: 'acima de', es: 'por encima de', en: 'above', fr: 'au-dessus de', it: 'sopra', uk: 'над {instr}', ar: 'فوق' },
    labels:  { pt: 'acima',    es: 'por encima',    en: 'above', fr: 'au-dessus',    it: 'sopra', uk: 'над',         ar: 'فوق' },
  },
  {
    key: 'onTop',
    phrases: { pt: 'em cima de', es: 'encima de', en: 'on top of', fr: 'sur', it: 'in cima a', uk: 'на {loc}', ar: 'على' },
    labels:  { pt: 'em cima',    es: 'encima',    en: 'on top',    fr: 'sur', it: 'in cima',   uk: 'зверху',   ar: 'على' },
  },
  {
    key: 'under',
    phrases: { pt: 'embaixo de', es: 'debajo de', en: 'under', fr: 'sous', it: 'sotto', uk: 'під {instr}', ar: 'تحت' },
    labels:  { pt: 'embaixo',    es: 'debajo',    en: 'under', fr: 'sous', it: 'sotto', uk: 'під',         ar: 'تحت' },
  },
  {
    key: 'behind',
    phrases: { pt: 'atrás de', es: 'detrás de', en: 'behind', fr: 'derrière', it: 'dietro', uk: 'за {instr}', ar: 'خلف' },
    labels:  { pt: 'atrás',    es: 'detrás',    en: 'behind', fr: 'derrière', it: 'dietro', uk: 'позаду',     ar: 'خلف' },
  },
  {
    key: 'inFront',
    phrases: { pt: 'na frente de', es: 'delante de', en: 'in front of', fr: 'devant', it: 'davanti a', uk: 'перед {instr}', ar: 'أمام' },
    labels:  { pt: 'na frente',    es: 'delante',    en: 'in front',    fr: 'devant', it: 'davanti',   uk: 'попереду',      ar: 'أمام' },
  },
  {
    key: 'inside',
    phrases: { pt: 'dentro de', es: 'dentro de', en: 'inside', fr: 'dans', it: 'dentro', uk: 'всередині {gen}', ar: 'داخل' },
    labels:  { pt: 'dentro',    es: 'dentro',    en: 'inside', fr: 'dans', it: 'dentro', uk: 'всередині',       ar: 'داخل' },
  },
  {
    key: 'outside',
    phrases: { pt: 'fora de', es: 'fuera de', en: 'outside', fr: 'en dehors de', it: 'fuori da', uk: 'поза {instr}', ar: 'خارج' },
    labels:  { pt: 'fora',    es: 'fuera',    en: 'outside', fr: 'en dehors',    it: 'fuori',    uk: 'зовні',        ar: 'خارج' },
  },
  {
    key: 'nextTo',
    phrases: { pt: 'ao lado de', es: 'al lado de', en: 'next to', fr: 'à côté de', it: 'accanto a', uk: 'поруч із {instr}', ar: 'بجانب' },
    labels:  { pt: 'ao lado',    es: 'al lado',    en: 'next to', fr: 'à côté',    it: 'accanto',   uk: 'поруч',            ar: 'بجانب' },
  },
  {
    key: 'near',
    phrases: { pt: 'perto de', es: 'cerca de', en: 'near', fr: 'près de', it: 'vicino a', uk: 'біля {gen}', ar: 'قرب' },
    labels:  { pt: 'perto',    es: 'cerca',    en: 'near', fr: 'près',    it: 'vicino',   uk: 'біля',       ar: 'قريب' },
  },
  {
    key: 'far',
    phrases: { pt: 'longe de', es: 'lejos de', en: 'far from', fr: 'loin de', it: 'lontano da', uk: 'далеко від {gen}', ar: 'بعيدًا عن' },
    labels:  { pt: 'longe',    es: 'lejos',    en: 'far',      fr: 'loin',    it: 'lontano',    uk: 'далеко',           ar: 'بعيد' },
  },
];

// ---------------------------------------------------------------------------
// GRAMÁTICA: artigos, contrações, declinação e montagem da frase
// ---------------------------------------------------------------------------
/** Verbo "estar". Vazio nas línguas sem cópula no presente (ucraniano, árabe). */
const VERB_IS: Record<LangCode, string> = { pt: 'está', es: 'está', en: 'is', fr: 'est', it: 'è', uk: '', ar: '' };

const startsWithVowel = (word: string) => /^[aeiouáéíóúàèìòùâêîôûäëïöüh]/i.test(word);

/** Artigo definido para o substantivo no idioma ('' = sem artigo). */
const articleFor = (lang: LangCode, noun: NounForm): string => {
  switch (lang) {
    case 'pt': return noun.g === 'f' ? 'a' : 'o';
    case 'es': return noun.g === 'f' ? 'la' : 'el';
    case 'en': return 'the';
    case 'fr': return startsWithVowel(noun.n) ? "l'" : (noun.g === 'f' ? 'la' : 'le');
    case 'it': return startsWithVowel(noun.n) ? "l'" : (noun.g === 'f' ? 'la' : 'il');
    case 'ar': return 'ال';
    case 'uk': return '';
  }
};

/** "a bola", "la pelota", "l'armoire", "الكرة", "м'яч"... */
export const nounPhrase = (lang: LangCode, obj: LocObject): string => {
  const noun = obj.names[lang] || obj.names.en;
  const art = articleFor(lang, noun);
  if (!art) return noun.n;
  if (lang === 'ar' || art.endsWith("'")) return `${art}${noun.n}`;
  return `${art} ${noun.n}`;
};

/** Contrações preposição + artigo (de + a = da, de + el = del, di + la = della...). */
const CONTRACTIONS: Record<LangCode, Record<string, string>> = {
  pt: { 'de o': 'do', 'de a': 'da', 'em o': 'no', 'em a': 'na' },
  es: { 'de el': 'del', 'a el': 'al' },
  en: {},
  fr: { 'de le': 'du', 'à le': 'au' },
  it: {
    'di il': 'del', 'di la': 'della', "di l'": "dell'",
    'a il': 'al',   'a la': 'alla',   "a l'": "all'",
    'da il': 'dal', 'da la': 'dalla', "da l'": "dall'",
  },
  uk: {},
  ar: {},
};

/** Junta a preposição da relação com o objeto (artigo/contração ou caso declinado). */
const relationWithObject = (lang: LangCode, rel: LocRelation, obj: LocObject): string => {
  const phrase = rel.phrases[lang] || rel.phrases.en;
  const noun = obj.names[lang] || obj.names.en;

  // Línguas com declinação: a frase indica o caso pedido pela preposição.
  if (phrase.includes('{')) {
    const cases = noun.cases;
    return phrase.replace(/\{(gen|instr|loc)\}/, (_, c: 'gen' | 'instr' | 'loc') => (cases ? cases[c] : noun.n));
  }

  const art = articleFor(lang, noun);
  const words = phrase.split(' ');
  const prep = words[words.length - 1];
  const contracted = CONTRACTIONS[lang][`${prep} ${art}`];

  if (contracted) {
    const head = words.slice(0, -1).join(' ');
    const joined = contracted.endsWith("'") ? `${contracted}${noun.n}` : `${contracted} ${noun.n}`;
    return head ? `${head} ${joined}` : joined;
  }
  return `${phrase} ${nounPhrase(lang, obj)}`;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "A bola está à direita da caixa." / "М'яч праворуч від коробки." / "الكرة على يمين الصندوق." */
export const buildSentence = (lang: LangCode, subject: LocObject, rel: LocRelation, reference: LocObject): string => {
  const a = capitalize(nounPhrase(lang, subject));
  const parts = [a, VERB_IS[lang], relationWithObject(lang, rel, reference)].filter(Boolean);
  return `${parts.join(' ')}.`;
};

/** "Onde está a bola?" */
export const buildQuestion = (lang: LangCode, subject: LocObject): string => {
  const a = nounPhrase(lang, subject);
  switch (lang) {
    case 'pt': return `Onde está ${a}?`;
    case 'es': return `¿Dónde está ${a}?`;
    case 'fr': return `Où est ${a} ?`;
    case 'it': return `Dov'è ${a}?`;
    case 'uk': return `Де ${a}?`;
    case 'ar': return `أين ${a}؟`;
    default:   return `Where is ${a}?`;
  }
};
