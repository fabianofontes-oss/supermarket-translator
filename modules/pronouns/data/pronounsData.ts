
// Módulo "Eu, você, ele" — pronomes e conjugação, virando frase inteira.
// O erro mais comum de brasileiro na Espanha: "você" é informal em português mas
// se conjuga na 3ª pessoa, então a pessoa fala "usted quiere" quando deveria
// falar "tú quieres". E "vosotros" existe na Espanha e não na América Latina.

import type { LangCode } from '../../location/data/locationData';

export type Text = Record<LangCode, string>;

/** Índice da forma verbal: 0=eu, 1=tu, 2=ele/ela, 3=nós, 4=vós, 5=eles. */
export type Person = 0 | 1 | 2 | 3 | 4 | 5;

export interface Pronoun {
  key: string;
  person: Person;
  /** 'formal' = usted/ustedes. 'spain' = só se usa na Espanha. */
  tag?: 'formal' | 'spain';
  /**
   * Nem toda língua conjuga o tratamento formal na mesma pessoa que o espanhol.
   * Espanhol e italiano usam a 3ª pessoa; inglês, francês, ucraniano e árabe usam a 2ª.
   */
  altPerson?: Partial<Record<LangCode, Person>>;
  words: Text;
  /** Explicação da armadilha, na língua de quem lê. */
  notes?: Text;
}

export const PRONOUNS: Pronoun[] = [
  {
    key: 'yo', person: 0,
    words: { es: 'yo', pt: 'eu', en: 'I', fr: 'je', it: 'io', uk: 'я', ar: 'أنا' },
  },
  {
    key: 'tu', person: 1,
    words: { es: 'tú', pt: 'você', en: 'you', fr: 'tu', it: 'tu', uk: 'ти', ar: 'أنت' },
    notes: {
      es: 'Trato normal en España, incluso con desconocidos jóvenes.',
      pt: 'É o "você" do dia a dia. Na Espanha se usa com quase todo mundo. Atenção: conjuga na 2ª pessoa, "tú quieres", não "tú quiere".',
      en: 'The everyday form in Spain, used with almost everyone.',
      fr: 'La forme courante en Espagne, avec presque tout le monde.',
      it: 'La forma normale in Spagna, con quasi tutti.',
      uk: 'Звичайна форма в Іспанії, майже з усіма.',
      ar: 'الصيغة العادية في إسبانيا، مع الجميع تقريبًا.',
    },
  },
  {
    key: 'usted', person: 2, tag: 'formal',
    altPerson: { en: 1, fr: 4, uk: 4, ar: 1 },
    words: { es: 'usted', pt: 'o senhor / a senhora', en: 'you (formal)', fr: 'vous (formel)', it: 'lei (formale)', uk: 'ви (ввічливо)', ar: 'حضرتك' },
    notes: {
      es: 'Solo con personas mayores o en trámites oficiales. Se conjuga en tercera persona.',
      pt: 'Equivale a "o senhor", não a "você". Use só com idosos ou em repartição pública. Conjuga na 3ª pessoa: "usted quiere".',
      en: 'Only for elderly people or official settings. Takes third-person verbs.',
      fr: 'Seulement avec les personnes âgées ou en administration. Verbe à la 3e personne.',
      it: 'Solo con anziani o negli uffici. Verbo alla terza persona.',
      uk: 'Лише зі старшими або в установах. Дієслово в третій особі.',
      ar: 'فقط مع كبار السن أو في الدوائر الرسمية. الفعل بصيغة الغائب.',
    },
  },
  {
    key: 'el', person: 2,
    words: { es: 'él / ella', pt: 'ele / ela', en: 'he / she', fr: 'il / elle', it: 'lui / lei', uk: 'він / вона', ar: 'هو / هي' },
  },
  {
    key: 'nosotros', person: 3,
    words: { es: 'nosotros', pt: 'nós', en: 'we', fr: 'nous', it: 'noi', uk: 'ми', ar: 'نحن' },
  },
  {
    key: 'vosotros', person: 4, tag: 'spain',
    words: { es: 'vosotros', pt: 'vocês', en: 'you all', fr: 'vous', it: 'voi', uk: 'ви', ar: 'أنتم' },
    notes: {
      es: 'Solo se usa en España. En América Latina dicen "ustedes".',
      pt: 'É o "vocês" da Espanha, e só existe aqui. Na América Latina se fala "ustedes". Você vai ouvir muito: "¿queréis algo?"',
      en: 'Used only in Spain. Latin America says "ustedes".',
      fr: 'Utilisé seulement en Espagne. En Amérique latine on dit "ustedes".',
      it: 'Si usa solo in Spagna. In America Latina dicono "ustedes".',
      uk: 'Вживається лише в Іспанії. У Латинській Америці кажуть "ustedes".',
      ar: 'تستخدم في إسبانيا فقط. في أمريكا اللاتينية يقولون "ustedes".',
    },
  },
  {
    key: 'ustedes', person: 5, tag: 'formal',
    altPerson: { en: 4, fr: 4, uk: 4, ar: 4 },
    words: { es: 'ustedes', pt: 'os senhores', en: 'you all (formal)', fr: 'vous (formel)', it: 'loro (formale)', uk: 'ви (ввічливо)', ar: 'حضراتكم' },
    notes: {
      es: 'En España, la forma formal de "vosotros".',
      pt: 'Na Espanha é a forma formal de "vosotros". Na América Latina é a única forma de plural.',
      en: 'In Spain, the formal version of "vosotros".',
      fr: 'En Espagne, la forme formelle de "vosotros".',
      it: 'In Spagna, la forma formale di "vosotros".',
      uk: 'В Іспанії це ввічлива форма "vosotros".',
      ar: 'في إسبانيا، الصيغة الرسمية لـ "vosotros".',
    },
  },
  {
    key: 'ellos', person: 5,
    words: { es: 'ellos / ellas', pt: 'eles / elas', en: 'they', fr: 'ils / elles', it: 'loro', uk: 'вони', ar: 'هم / هن' },
  },
];

// ---------------------------------------------------------------------------
// VERBOS — seis formas: [eu, tu, ele, nós, vós, eles]
// ---------------------------------------------------------------------------
/** Como o inglês monta pergunta e negação. */
type EnAux = 'do' | 'be' | 'can';

export interface Verb {
  key: string;
  enAux: EnAux;
  labels: Text;
  forms: Record<LangCode, [string, string, string, string, string, string]>;
  /** Complementos que combinam com este verbo. */
  complements: { key: string; texts: Text }[];
}

export const VERBS: Verb[] = [
  {
    key: 'querer', enAux: 'do',
    labels: { es: 'querer', pt: 'querer', en: 'to want', fr: 'vouloir', it: 'volere', uk: 'хотіти', ar: 'يريد' },
    forms: {
      es: ['quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren'],
      pt: ['quero', 'quer', 'quer', 'queremos', 'querem', 'querem'],
      en: ['want', 'want', 'wants', 'want', 'want', 'want'],
      fr: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'],
      it: ['voglio', 'vuoi', 'vuole', 'vogliamo', 'volete', 'vogliono'],
      uk: ['хочу', 'хочеш', 'хоче', 'хочемо', 'хочете', 'хочуть'],
      ar: ['أريد', 'تريد', 'يريد', 'نريد', 'تريدون', 'يريدون'],
    },
    complements: [
      { key: 'coffee', texts: { es: 'un café', pt: 'um café', en: 'a coffee', fr: 'un café', it: 'un caffè', uk: 'каву', ar: 'قهوة' } },
      { key: 'bill', texts: { es: 'la cuenta', pt: 'a conta', en: 'the bill', fr: "l'addition", it: 'il conto', uk: 'рахунок', ar: 'الحساب' } },
      { key: 'this', texts: { es: 'esto', pt: 'isto', en: 'this', fr: 'ceci', it: 'questo', uk: 'це', ar: 'هذا' } },
    ],
  },
  {
    key: 'tener', enAux: 'do',
    labels: { es: 'tener', pt: 'ter', en: 'to have', fr: 'avoir', it: 'avere', uk: 'мати', ar: 'يملك' },
    forms: {
      es: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
      pt: ['tenho', 'tem', 'tem', 'temos', 'têm', 'têm'],
      en: ['have', 'have', 'has', 'have', 'have', 'have'],
      fr: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
      it: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'],
      uk: ['маю', 'маєш', 'має', 'маємо', 'маєте', 'мають'],
      ar: ['لدي', 'لديك', 'لديه', 'لدينا', 'لديكم', 'لديهم'],
    },
    complements: [
      { key: 'reservation', texts: { es: 'una reserva', pt: 'uma reserva', en: 'a reservation', fr: 'une réservation', it: 'una prenotazione', uk: 'бронювання', ar: 'حجز' } },
      { key: 'time', texts: { es: 'tiempo', pt: 'tempo', en: 'time', fr: 'le temps', it: 'tempo', uk: 'час', ar: 'وقت' } },
      { key: 'change', texts: { es: 'cambio', pt: 'troco', en: 'change', fr: 'de la monnaie', it: 'da cambiare', uk: 'решту', ar: 'فكة' } },
    ],
  },
  {
    key: 'poder', enAux: 'can',
    labels: { es: 'poder', pt: 'poder', en: 'can', fr: 'pouvoir', it: 'potere', uk: 'могти', ar: 'يستطيع' },
    forms: {
      es: ['puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden'],
      pt: ['posso', 'pode', 'pode', 'podemos', 'podem', 'podem'],
      en: ['can', 'can', 'can', 'can', 'can', 'can'],
      fr: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'],
      it: ['posso', 'puoi', 'può', 'possiamo', 'potete', 'possono'],
      uk: ['можу', 'можеш', 'може', 'можемо', 'можете', 'можуть'],
      ar: ['أستطيع', 'تستطيع', 'يستطيع', 'نستطيع', 'تستطيعون', 'يستطيعون'],
    },
    complements: [
      { key: 'help', texts: { es: 'ayudarme', pt: 'me ajudar', en: 'help me', fr: "m'aider", it: 'aiutarmi', uk: 'мені допомогти', ar: 'مساعدتي' } },
      { key: 'wait', texts: { es: 'esperar', pt: 'esperar', en: 'wait', fr: 'attendre', it: 'aspettare', uk: 'зачекати', ar: 'الانتظار' } },
      { key: 'payCard', texts: { es: 'pagar con tarjeta', pt: 'pagar com cartão', en: 'pay by card', fr: 'payer par carte', it: 'pagare con la carta', uk: 'заплатити карткою', ar: 'الدفع بالبطاقة' } },
    ],
  },
  {
    key: 'necesitar', enAux: 'do',
    labels: { es: 'necesitar', pt: 'precisar', en: 'to need', fr: 'avoir besoin', it: 'avere bisogno', uk: 'потребувати', ar: 'يحتاج' },
    forms: {
      es: ['necesito', 'necesitas', 'necesita', 'necesitamos', 'necesitáis', 'necesitan'],
      pt: ['preciso de', 'precisa de', 'precisa de', 'precisamos de', 'precisam de', 'precisam de'],
      en: ['need', 'need', 'needs', 'need', 'need', 'need'],
      fr: ["ai besoin d'", "as besoin d'", "a besoin d'", "avons besoin d'", "avez besoin d'", "ont besoin d'"],
      it: ['ho bisogno di', 'hai bisogno di', 'ha bisogno di', 'abbiamo bisogno di', 'avete bisogno di', 'hanno bisogno di'],
      uk: ['потребую', 'потребуєш', 'потребує', 'потребуємо', 'потребуєте', 'потребують'],
      ar: ['أحتاج', 'تحتاج', 'يحتاج', 'نحتاج', 'تحتاجون', 'يحتاجون'],
    },
    complements: [
      { key: 'helpN', texts: { es: 'ayuda', pt: 'ajuda', en: 'help', fr: 'aide', it: 'aiuto', uk: 'допомоги', ar: 'مساعدة' } },
      { key: 'doctor', texts: { es: 'un médico', pt: 'um médico', en: 'a doctor', fr: 'un médecin', it: 'un medico', uk: 'лікаря', ar: 'طبيب' } },
      { key: 'invoice', texts: { es: 'una factura', pt: 'uma nota fiscal', en: 'an invoice', fr: 'une facture', it: 'una fattura', uk: 'рахунок-фактуру', ar: 'فاتورة' } },
    ],
  },
  {
    key: 'hablar', enAux: 'do',
    labels: { es: 'hablar', pt: 'falar', en: 'to speak', fr: 'parler', it: 'parlare', uk: 'говорити', ar: 'يتكلم' },
    forms: {
      es: ['hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan'],
      pt: ['falo', 'fala', 'fala', 'falamos', 'falam', 'falam'],
      en: ['speak', 'speak', 'speaks', 'speak', 'speak', 'speak'],
      fr: ['parle', 'parles', 'parle', 'parlons', 'parlez', 'parlent'],
      it: ['parlo', 'parli', 'parla', 'parliamo', 'parlate', 'parlano'],
      uk: ['говорю', 'говориш', 'говорить', 'говоримо', 'говорите', 'говорять'],
      ar: ['أتكلم', 'تتكلم', 'يتكلم', 'نتكلم', 'تتكلمون', 'يتكلمون'],
    },
    complements: [
      { key: 'spanish', texts: { es: 'español', pt: 'espanhol', en: 'Spanish', fr: 'espagnol', it: 'spagnolo', uk: 'іспанською', ar: 'الإسبانية' } },
      { key: 'english', texts: { es: 'inglés', pt: 'inglês', en: 'English', fr: 'anglais', it: 'inglese', uk: 'англійською', ar: 'الإنجليزية' } },
      { key: 'aLittle', texts: { es: 'un poco', pt: 'um pouco', en: 'a little', fr: 'un peu', it: 'un po\'', uk: 'трохи', ar: 'قليلًا' } },
    ],
  },
  {
    key: 'ser', enAux: 'be',
    labels: { es: 'ser', pt: 'ser', en: 'to be', fr: 'être', it: 'essere', uk: 'бути', ar: 'يكون' },
    forms: {
      es: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
      pt: ['sou', 'é', 'é', 'somos', 'são', 'são'],
      en: ['am', 'are', 'is', 'are', 'are', 'are'],
      fr: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
      it: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'],
      uk: ['', '', '', '', '', ''],
      ar: ['', '', '', '', '', ''],
    },
    complements: [
      { key: 'fromBrazil', texts: { es: 'de Brasil', pt: 'do Brasil', en: 'from Brazil', fr: 'du Brésil', it: 'del Brasile', uk: 'з Бразилії', ar: 'من البرازيل' } },
      { key: 'newHere', texts: { es: 'nuevo aquí', pt: 'novo aqui', en: 'new here', fr: 'nouveau ici', it: 'nuovo qui', uk: 'тут новий', ar: 'جديد هنا' } },
      { key: 'student', texts: { es: 'estudiante', pt: 'estudante', en: 'a student', fr: 'étudiant', it: 'studente', uk: 'студент', ar: 'طالب' } },
    ],
  },
  {
    key: 'estar', enAux: 'be',
    labels: { es: 'estar', pt: 'estar', en: 'to be (state)', fr: 'être (état)', it: 'stare', uk: 'перебувати', ar: 'يوجد' },
    forms: {
      es: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
      pt: ['estou', 'está', 'está', 'estamos', 'estão', 'estão'],
      en: ['am', 'are', 'is', 'are', 'are', 'are'],
      fr: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
      it: ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno'],
      uk: ['', '', '', '', '', ''],
      ar: ['', '', '', '', '', ''],
    },
    complements: [
      { key: 'here', texts: { es: 'aquí', pt: 'aqui', en: 'here', fr: 'ici', it: 'qui', uk: 'тут', ar: 'هنا' } },
      { key: 'lost', texts: { es: 'perdido', pt: 'perdido', en: 'lost', fr: 'perdu', it: 'perso', uk: 'загублений', ar: 'تائه' } },
      { key: 'fine', texts: { es: 'bien', pt: 'bem', en: 'fine', fr: 'bien', it: 'bene', uk: 'добре', ar: 'بخير' } },
    ],
  },
];

// ---------------------------------------------------------------------------
// MONTAGEM DA FRASE
// ---------------------------------------------------------------------------
export type Mood = 'affirm' | 'question' | 'negative';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const isVowel = (w: string) => /^[aeiouâêîôûàèéëïœh]/i.test(w);

/** Negação de frase nominal em árabe: "ليس" conjuga por pessoa. */
const AR_NOT: string[] = ['لست', 'لست', 'ليس', 'لسنا', 'لستم', 'ليسوا'];

/** Junta verbo e complemento respeitando terminações que já pedem elisão. */
const joinVerb = (verb: string, comp: string) => (verb.endsWith("'") ? `${verb}${comp}` : `${verb} ${comp}`);

export const buildPhrase = (
  lang: LangCode,
  pronoun: Pronoun,
  verb: Verb,
  comp: { texts: Text } | null,
  mood: Mood,
): string => {
  // Ucraniano e árabe dispensam o verbo "ser" no presente, então a forma vem vazia.
  const person = pronoun.altPerson?.[lang] ?? pronoun.person;
  const p = pronoun.words[lang];
  const v = verb.forms[lang][person];
  const c = comp ? comp.texts[lang] : '';
  const body = (v ? (c ? joinVerb(v, c) : v) : c).trim();

  if (!body) return `${cap(p)}.`;

  switch (lang) {
    case 'es':
      if (mood === 'question') return `¿${cap(p)} ${body}?`;
      if (mood === 'negative') return `${cap(p)} no ${body}.`;
      return `${cap(p)} ${body}.`;

    case 'pt':
      if (mood === 'question') return `${cap(p)} ${body}?`;
      if (mood === 'negative') return `${cap(p)} não ${body}.`;
      return `${cap(p)} ${body}.`;

    case 'it':
      if (mood === 'question') return `${cap(p)} ${body}?`;
      if (mood === 'negative') return `${cap(p)} non ${body}.`;
      return `${cap(p)} ${body}.`;

    case 'uk':
      if (mood === 'question') return `${cap(p)} ${body}?`;
      if (mood === 'negative') return `${cap(p)} не ${body}.`;
      return `${cap(p)} ${body}.`;

    case 'ar':
      // Sem verbo, a frase é nominal e a negação usa "ليس" em vez de "لا".
      if (mood === 'question') return `هل ${p} ${body}؟`;
      if (mood === 'negative') return `${p} ${v ? 'لا' : AR_NOT[person]} ${body}.`;
      return `${p} ${body}.`;

    case 'fr': {
      // "je" vira "j'" antes de vogal, e a negação é ne ... pas.
      const subj = p === 'je' && isVowel(v) ? "j'" : `${p} `;
      if (mood === 'question') return `Est-ce que ${subj}${body} ?`;
      if (mood === 'negative') {
        const ne = isVowel(v) ? "n'" : 'ne ';
        return `${cap(subj)}${ne}${v} pas${c ? ` ${c}` : ''}.`;
      }
      return `${cap(subj)}${body}.`;
    }

    default: {
      // Inglês precisa de auxiliar na pergunta e na negação.
      const third = person === 2;
      const base = verb.forms.en[0];
      if (verb.enAux === 'be') {
        if (mood === 'question') return `${cap(v)} ${p}${c ? ` ${c}` : ''}?`;
        if (mood === 'negative') return `${cap(p)} ${v} not${c ? ` ${c}` : ''}.`;
        return `${cap(p)} ${body}.`;
      }
      if (verb.enAux === 'can') {
        if (mood === 'question') return `Can ${p}${c ? ` ${c}` : ''}?`;
        if (mood === 'negative') return `${cap(p)} cannot${c ? ` ${c}` : ''}.`;
        return `${cap(p)} can${c ? ` ${c}` : ''}.`;
      }
      if (mood === 'question') return `${third ? 'Does' : 'Do'} ${p} ${base}${c ? ` ${c}` : ''}?`;
      if (mood === 'negative') return `${cap(p)} ${third ? "doesn't" : "don't"} ${base}${c ? ` ${c}` : ''}.`;
      return `${cap(p)} ${body}.`;
    }
  }
};

export const MOOD_LABELS: Record<Mood, Text> = {
  affirm:   { es: 'afirmación', pt: 'afirmação', en: 'statement', fr: 'affirmation', it: 'affermazione', uk: 'ствердження', ar: 'إثبات' },
  question: { es: 'pregunta', pt: 'pergunta', en: 'question', fr: 'question', it: 'domanda', uk: 'питання', ar: 'سؤال' },
  negative: { es: 'negación', pt: 'negação', en: 'negative', fr: 'négation', it: 'negazione', uk: 'заперечення', ar: 'نفي' },
};
