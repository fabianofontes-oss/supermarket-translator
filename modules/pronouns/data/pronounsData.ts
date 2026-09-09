
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
  /** Forma no dativo, usada por verbos como o lituano "reikia". */
  dative?: Partial<Record<LangCode, string>>;
  /** Explicação da armadilha, na língua de quem lê. */
  notes?: Text;
}

export const PRONOUNS: Pronoun[] = [
  {
    key: 'yo', person: 0,
    dative: { lt: 'man' },
    words: { es: 'yo', pt: 'eu', en: 'I', fr: 'je', it: 'io', uk: 'я', lt: 'aš', ar: 'أنا' },
  },
  {
    key: 'tu', person: 1,
    dative: { lt: 'tau' },
    words: { es: 'tú', pt: 'você', en: 'you', fr: 'tu', it: 'tu', uk: 'ти', lt: 'tu', ar: 'أنت' },
    notes: {
      es: 'Trato normal en España, incluso con desconocidos jóvenes.',
      pt: 'É o "você" do dia a dia. Na Espanha se usa com quase todo mundo. Atenção: conjuga na 2ª pessoa, "tú quieres", não "tú quiere".',
      en: 'The everyday form in Spain, used with almost everyone.',
      fr: 'La forme courante en Espagne, avec presque tout le monde.',
      it: 'La forma normale in Spagna, con quasi tutti.',
      uk: 'Звичайна форма в Іспанії, майже з усіма.',
      lt: 'Įprasta forma Ispanijoje, beveik su visais.', ar: 'الصيغة العادية في إسبانيا، مع الجميع تقريبًا.',
    },
  },
  {
    key: 'usted', person: 2, tag: 'formal',
    dative: { lt: 'jums' },
    altPerson: { en: 1, fr: 4, uk: 4, ar: 1, lt: 4 },
    words: { es: 'usted', pt: 'o senhor / a senhora', en: 'you', fr: 'vous', it: 'lei', uk: 'ви', lt: 'jūs', ar: 'حضرتك' },
    notes: {
      es: 'Solo con personas mayores o en trámites oficiales. Se conjuga en tercera persona.',
      pt: 'Equivale a "o senhor", não a "você". Use só com idosos ou em repartição pública. Conjuga na 3ª pessoa: "usted quiere".',
      en: 'Only for elderly people or official settings. Takes third-person verbs.',
      fr: 'Seulement avec les personnes âgées ou en administration. Verbe à la 3e personne.',
      it: 'Solo con anziani o negli uffici. Verbo alla terza persona.',
      uk: 'Лише зі старшими або в установах. Дієслово в третій особі.',
      lt: 'Tik su vyresniais žmonėmis arba įstaigose. Veiksmažodis trečiuoju asmeniu.', ar: 'فقط مع كبار السن أو في الدوائر الرسمية. الفعل بصيغة الغائب.',
    },
  },
  {
    key: 'el', person: 2,
    dative: { lt: 'jam' },
    words: { es: 'él / ella', pt: 'ele / ela', en: 'he / she', fr: 'il / elle', it: 'lui / lei', uk: 'він / вона', lt: 'jis / ji', ar: 'هو / هي' },
  },
  {
    key: 'nosotros', person: 3,
    dative: { lt: 'mums' },
    words: { es: 'nosotros', pt: 'nós', en: 'we', fr: 'nous', it: 'noi', uk: 'ми', lt: 'mes', ar: 'نحن' },
  },
  {
    key: 'vosotros', person: 4, tag: 'spain',
    dative: { lt: 'jums' },
    words: { es: 'vosotros', pt: 'vocês', en: 'you all', fr: 'vous', it: 'voi', uk: 'ви', lt: 'jūs', ar: 'أنتم' },
    notes: {
      es: 'Solo se usa en España. En América Latina dicen "ustedes".',
      pt: 'É o "vocês" da Espanha, e só existe aqui. Na América Latina se fala "ustedes". Você vai ouvir muito: "¿queréis algo?"',
      en: 'Used only in Spain. Latin America says "ustedes".',
      fr: 'Utilisé seulement en Espagne. En Amérique latine on dit "ustedes".',
      it: 'Si usa solo in Spagna. In America Latina dicono "ustedes".',
      uk: 'Вживається лише в Іспанії. У Латинській Америці кажуть "ustedes".',
      lt: 'Vartojama tik Ispanijoje. Lotynų Amerikoje sako „ustedes“.', ar: 'تستخدم في إسبانيا فقط. في أمريكا اللاتينية يقولون "ustedes".',
    },
  },
  {
    key: 'ustedes', person: 5, tag: 'formal',
    dative: { lt: 'jums' },
    altPerson: { en: 4, fr: 4, uk: 4, ar: 4, lt: 4 },
    words: { es: 'ustedes', pt: 'os senhores', en: 'you all', fr: 'vous', it: 'loro', uk: 'ви', lt: 'jūs', ar: 'حضراتكم' },
    notes: {
      es: 'En España, la forma formal de "vosotros".',
      pt: 'Na Espanha é a forma formal de "vosotros". Na América Latina é a única forma de plural.',
      en: 'In Spain, the formal version of "vosotros".',
      fr: 'En Espagne, la forme formelle de "vosotros".',
      it: 'In Spagna, la forma formale di "vosotros".',
      uk: 'В Іспанії це ввічлива форма "vosotros".',
      lt: 'Ispanijoje tai mandagioji „vosotros“ forma.', ar: 'في إسبانيا، الصيغة الرسمية لـ "vosotros".',
    },
  },
  {
    key: 'ellos', person: 5,
    dative: { lt: 'jiems' },
    words: { es: 'ellos / ellas', pt: 'eles / elas', en: 'they', fr: 'ils / elles', it: 'loro', uk: 'вони', lt: 'jie / jos', ar: 'هم / هن' },
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
  /** Idiomas em que este verbo pede o sujeito no dativo (lt: "man reikia"). */
  dativeIn?: LangCode[];
  /**
   * A forma verbal carrega preposição ("precisar de", "avoir besoin de") e a
   * frase sem objeto fica truncada. A UI não oferece o chip "nada" para estes.
   */
  requiresComplement?: boolean;
  labels: Text;
  forms: Record<LangCode, [string, string, string, string, string, string]>;
  /** Passado. Em espanhol é o pretérito perfecto, que é o que se ouve na Espanha. */
  pastForms: Record<LangCode, [string, string, string, string, string, string]>;
  /** Futuro. Em espanhol é o perifrástico "voy a", muito mais falado que "querré". */
  futureForms: Record<LangCode, [string, string, string, string, string, string]>;
  /** Complementos que combinam com este verbo. */
  complements: { key: string; texts: Text }[];
}

export const VERBS: Verb[] = [
  {
    key: 'querer', enAux: 'do',
    labels: { es: 'querer', pt: 'querer', en: 'to want', fr: 'vouloir', it: 'volere', uk: 'хотіти', lt: 'norėti', ar: 'يريد' },
    forms: {
      es: ['quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren'],
      pt: ['quero', 'quer', 'quer', 'queremos', 'querem', 'querem'],
      en: ['want', 'want', 'wants', 'want', 'want', 'want'],
      fr: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'],
      it: ['voglio', 'vuoi', 'vuole', 'vogliamo', 'volete', 'vogliono'],
      uk: ['хочу', 'хочеш', 'хоче', 'хочемо', 'хочете', 'хочуть'],
      lt: ['noriu', 'nori', 'nori', 'norime', 'norite', 'nori'], ar: ['أريد', 'تريد', 'يريد', 'نريد', 'تريدون', 'يريدون'],
    },
    pastForms: {
      es: ['he querido', 'has querido', 'ha querido', 'hemos querido', 'habéis querido', 'han querido'],
      pt: ['quis', 'quis', 'quis', 'quisemos', 'quiseram', 'quiseram'],
      en: ['wanted', 'wanted', 'wanted', 'wanted', 'wanted', 'wanted'],
      fr: ['ai voulu', 'as voulu', 'a voulu', 'avons voulu', 'avez voulu', 'ont voulu'],
      it: ['ho voluto', 'hai voluto', 'ha voluto', 'abbiamo voluto', 'avete voluto', 'hanno voluto'],
      uk: ['хотів', 'хотів', 'хотів', 'хотіли', 'хотіли', 'хотіли'],
      ar: ['أردت', 'أردت', 'أراد', 'أردنا', 'أردتم', 'أرادوا'],
      lt: ['norėjau', 'norėjai', 'norėjo', 'norėjome', 'norėjote', 'norėjo'],
    },
    futureForms: {
      es: ['voy a querer', 'vas a querer', 'va a querer', 'vamos a querer', 'vais a querer', 'van a querer'],
      pt: ['vou querer', 'vai querer', 'vai querer', 'vamos querer', 'vão querer', 'vão querer'],
      en: ['will want', 'will want', 'will want', 'will want', 'will want', 'will want'],
      fr: ['vais vouloir', 'vas vouloir', 'va vouloir', 'allons vouloir', 'allez vouloir', 'vont vouloir'],
      it: ['vorrò', 'vorrai', 'vorrà', 'vorremo', 'vorrete', 'vorranno'],
      uk: ['буду хотіти', 'будеш хотіти', 'буде хотіти', 'будемо хотіти', 'будете хотіти', 'будуть хотіти'],
      ar: ['سأريد', 'ستريد', 'سيريد', 'سنريد', 'ستريدون', 'سيريدون'],
      lt: ['norėsiu', 'norėsi', 'norės', 'norėsime', 'norėsite', 'norės'],
    },
    complements: [
      { key: 'coffee', texts: { es: 'un café', pt: 'um café', en: 'a coffee', fr: 'un café', it: 'un caffè', uk: 'каву', lt: 'kavos', ar: 'قهوة' } },
      { key: 'bill', texts: { es: 'la cuenta', pt: 'a conta', en: 'the bill', fr: "l'addition", it: 'il conto', uk: 'рахунок', lt: 'sąskaitos', ar: 'الحساب' } },
      { key: 'this', texts: { es: 'esto', pt: 'isto', en: 'this', fr: 'ceci', it: 'questo', uk: 'це', lt: 'to', ar: 'هذا' } },
    ],
  },
  {
    key: 'tener', enAux: 'do',
    labels: { es: 'tener', pt: 'ter', en: 'to have', fr: 'avoir', it: 'avere', uk: 'мати', lt: 'turėti', ar: 'يملك' },
    forms: {
      es: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
      pt: ['tenho', 'tem', 'tem', 'temos', 'têm', 'têm'],
      en: ['have', 'have', 'has', 'have', 'have', 'have'],
      fr: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
      it: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'],
      uk: ['маю', 'маєш', 'має', 'маємо', 'маєте', 'мають'],
      lt: ['turiu', 'turi', 'turi', 'turime', 'turite', 'turi'], ar: ['لدي', 'لديك', 'لديه', 'لدينا', 'لديكم', 'لديهم'],
    },
    pastForms: {
      es: ['he tenido', 'has tenido', 'ha tenido', 'hemos tenido', 'habéis tenido', 'han tenido'],
      pt: ['tive', 'teve', 'teve', 'tivemos', 'tiveram', 'tiveram'],
      en: ['had', 'had', 'had', 'had', 'had', 'had'],
      fr: ['ai eu', 'as eu', 'a eu', 'avons eu', 'avez eu', 'ont eu'],
      it: ['ho avuto', 'hai avuto', 'ha avuto', 'abbiamo avuto', 'avete avuto', 'hanno avuto'],
      uk: ['мав', 'мав', 'мав', 'мали', 'мали', 'мали'],
      ar: ['كان لدي', 'كان لديك', 'كان لديه', 'كان لدينا', 'كان لديكم', 'كان لديهم'],
      lt: ['turėjau', 'turėjai', 'turėjo', 'turėjome', 'turėjote', 'turėjo'],
    },
    futureForms: {
      es: ['voy a tener', 'vas a tener', 'va a tener', 'vamos a tener', 'vais a tener', 'van a tener'],
      pt: ['vou ter', 'vai ter', 'vai ter', 'vamos ter', 'vão ter', 'vão ter'],
      en: ['will have', 'will have', 'will have', 'will have', 'will have', 'will have'],
      fr: ['vais avoir', 'vas avoir', 'va avoir', 'allons avoir', 'allez avoir', 'vont avoir'],
      it: ['avrò', 'avrai', 'avrà', 'avremo', 'avrete', 'avranno'],
      uk: ['буду мати', 'будеш мати', 'буде мати', 'будемо мати', 'будете мати', 'будуть мати'],
      ar: ['سيكون لدي', 'سيكون لديك', 'سيكون لديه', 'سيكون لدينا', 'سيكون لديكم', 'سيكون لديهم'],
      lt: ['turėsiu', 'turėsi', 'turės', 'turėsime', 'turėsite', 'turės'],
    },
    complements: [
      { key: 'reservation', texts: { es: 'una reserva', pt: 'uma reserva', en: 'a reservation', fr: 'une réservation', it: 'una prenotazione', uk: 'бронювання', lt: 'rezervaciją', ar: 'حجز' } },
      { key: 'time', texts: { es: 'tiempo', pt: 'tempo', en: 'time', fr: 'le temps', it: 'tempo', uk: 'час', lt: 'laiko', ar: 'وقت' } },
      { key: 'change', texts: { es: 'cambio', pt: 'troco', en: 'change', fr: 'de la monnaie', it: 'da cambiare', uk: 'решту', lt: 'grąžos', ar: 'فكة' } },
    ],
  },
  {
    key: 'poder', enAux: 'can',
    labels: { es: 'poder', pt: 'poder', en: 'can', fr: 'pouvoir', it: 'potere', uk: 'могти', lt: 'galėti', ar: 'يستطيع' },
    forms: {
      es: ['puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden'],
      pt: ['posso', 'pode', 'pode', 'podemos', 'podem', 'podem'],
      en: ['can', 'can', 'can', 'can', 'can', 'can'],
      fr: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'],
      it: ['posso', 'puoi', 'può', 'possiamo', 'potete', 'possono'],
      uk: ['можу', 'можеш', 'може', 'можемо', 'можете', 'можуть'],
      lt: ['galiu', 'gali', 'gali', 'galime', 'galite', 'gali'], ar: ['أستطيع', 'تستطيع', 'يستطيع', 'نستطيع', 'تستطيعون', 'يستطيعون'],
    },
    pastForms: {
      es: ['he podido', 'has podido', 'ha podido', 'hemos podido', 'habéis podido', 'han podido'],
      pt: ['pude', 'pôde', 'pôde', 'pudemos', 'puderam', 'puderam'],
      en: ['could', 'could', 'could', 'could', 'could', 'could'],
      fr: ['ai pu', 'as pu', 'a pu', 'avons pu', 'avez pu', 'ont pu'],
      it: ['ho potuto', 'hai potuto', 'ha potuto', 'abbiamo potuto', 'avete potuto', 'hanno potuto'],
      uk: ['міг', 'міг', 'міг', 'могли', 'могли', 'могли'],
      ar: ['استطعت', 'استطعت', 'استطاع', 'استطعنا', 'استطعتم', 'استطاعوا'],
      lt: ['galėjau', 'galėjai', 'galėjo', 'galėjome', 'galėjote', 'galėjo'],
    },
    futureForms: {
      es: ['voy a poder', 'vas a poder', 'va a poder', 'vamos a poder', 'vais a poder', 'van a poder'],
      pt: ['vou poder', 'vai poder', 'vai poder', 'vamos poder', 'vão poder', 'vão poder'],
      en: ['will be able to', 'will be able to', 'will be able to', 'will be able to', 'will be able to', 'will be able to'],
      fr: ['vais pouvoir', 'vas pouvoir', 'va pouvoir', 'allons pouvoir', 'allez pouvoir', 'vont pouvoir'],
      it: ['potrò', 'potrai', 'potrà', 'potremo', 'potrete', 'potranno'],
      uk: ['зможу', 'зможеш', 'зможе', 'зможемо', 'зможете', 'зможуть'],
      ar: ['سأستطيع', 'ستستطيع', 'سيستطيع', 'سنستطيع', 'ستستطيعون', 'سيستطيعون'],
      lt: ['galėsiu', 'galėsi', 'galės', 'galėsime', 'galėsite', 'galės'],
    },
    complements: [
      { key: 'help', texts: { es: 'ayudarme', pt: 'me ajudar', en: 'help me', fr: "m'aider", it: 'aiutarmi', uk: 'мені допомогти', lt: 'man padėti', ar: 'مساعدتي' } },
      { key: 'wait', texts: { es: 'esperar', pt: 'esperar', en: 'wait', fr: 'attendre', it: 'aspettare', uk: 'зачекати', lt: 'palaukti', ar: 'الانتظار' } },
      { key: 'payCard', texts: { es: 'pagar con tarjeta', pt: 'pagar com cartão', en: 'pay by card', fr: 'payer par carte', it: 'pagare con la carta', uk: 'заплатити карткою', lt: 'mokėti kortele', ar: 'الدفع بالبطاقة' } },
    ],
  },
  {
    key: 'necesitar', enAux: 'do', dativeIn: ['lt'], requiresComplement: true,
    labels: { es: 'necesitar', pt: 'precisar', en: 'to need', fr: 'avoir besoin', it: 'avere bisogno', uk: 'потребувати', lt: 'reikėti', ar: 'يحتاج' },
    forms: {
      es: ['necesito', 'necesitas', 'necesita', 'necesitamos', 'necesitáis', 'necesitan'],
      pt: ['preciso de', 'precisa de', 'precisa de', 'precisamos de', 'precisam de', 'precisam de'],
      en: ['need', 'need', 'needs', 'need', 'need', 'need'],
      fr: ["ai besoin d'", "as besoin d'", "a besoin d'", "avons besoin d'", "avez besoin d'", "ont besoin d'"],
      it: ['ho bisogno di', 'hai bisogno di', 'ha bisogno di', 'abbiamo bisogno di', 'avete bisogno di', 'hanno bisogno di'],
      uk: ['потребую', 'потребуєш', 'потребує', 'потребуємо', 'потребуєте', 'потребують'],
      lt: ['reikia', 'reikia', 'reikia', 'reikia', 'reikia', 'reikia'], ar: ['أحتاج', 'تحتاج', 'يحتاج', 'نحتاج', 'تحتاجون', 'يحتاجون'],
    },
    pastForms: {
      es: ['he necesitado', 'has necesitado', 'ha necesitado', 'hemos necesitado', 'habéis necesitado', 'han necesitado'],
      pt: ['precisei de', 'precisou de', 'precisou de', 'precisamos de', 'precisaram de', 'precisaram de'],
      en: ['needed', 'needed', 'needed', 'needed', 'needed', 'needed'],
      fr: ['ai eu besoin d\'', 'as eu besoin d\'', 'a eu besoin d\'', 'avons eu besoin d\'', 'avez eu besoin d\'', 'ont eu besoin d\''],
      it: ['ho avuto bisogno di', 'hai avuto bisogno di', 'ha avuto bisogno di', 'abbiamo avuto bisogno di', 'avete avuto bisogno di', 'hanno avuto bisogno di'],
      uk: ['потребував', 'потребував', 'потребував', 'потребували', 'потребували', 'потребували'],
      ar: ['احتجت', 'احتجت', 'احتاج', 'احتجنا', 'احتجتم', 'احتاجوا'],
      lt: ['reikėjo', 'reikėjo', 'reikėjo', 'reikėjo', 'reikėjo', 'reikėjo'],
    },
    futureForms: {
      es: ['voy a necesitar', 'vas a necesitar', 'va a necesitar', 'vamos a necesitar', 'vais a necesitar', 'van a necesitar'],
      pt: ['vou precisar de', 'vai precisar de', 'vai precisar de', 'vamos precisar de', 'vão precisar de', 'vão precisar de'],
      en: ['will need', 'will need', 'will need', 'will need', 'will need', 'will need'],
      fr: ['vais avoir besoin d\'', 'vas avoir besoin d\'', 'va avoir besoin d\'', 'allons avoir besoin d\'', 'allez avoir besoin d\'', 'vont avoir besoin d\''],
      it: ['avrò bisogno di', 'avrai bisogno di', 'avrà bisogno di', 'avremo bisogno di', 'avrete bisogno di', 'avranno bisogno di'],
      uk: ['буду потребувати', 'будеш потребувати', 'буде потребувати', 'будемо потребувати', 'будете потребувати', 'будуть потребувати'],
      ar: ['سأحتاج', 'ستحتاج', 'سيحتاج', 'سنحتاج', 'ستحتاجون', 'سيحتاجون'],
      lt: ['reikės', 'reikės', 'reikės', 'reikės', 'reikės', 'reikės'],
    },
    complements: [
      { key: 'helpN', texts: { es: 'ayuda', pt: 'ajuda', en: 'help', fr: 'aide', it: 'aiuto', uk: 'допомоги', lt: 'pagalbos', ar: 'مساعدة' } },
      { key: 'doctor', texts: { es: 'un médico', pt: 'um médico', en: 'a doctor', fr: 'un médecin', it: 'un medico', uk: 'лікаря', lt: 'gydytojo', ar: 'طبيب' } },
      { key: 'invoice', texts: { es: 'una factura', pt: 'uma nota fiscal', en: 'an invoice', fr: 'une facture', it: 'una fattura', uk: 'рахунок-фактуру', lt: 'sąskaitos faktūros', ar: 'فاتورة' } },
    ],
  },
  {
    key: 'hablar', enAux: 'do',
    labels: { es: 'hablar', pt: 'falar', en: 'to speak', fr: 'parler', it: 'parlare', uk: 'говорити', lt: 'kalbėti', ar: 'يتكلم' },
    forms: {
      es: ['hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan'],
      pt: ['falo', 'fala', 'fala', 'falamos', 'falam', 'falam'],
      en: ['speak', 'speak', 'speaks', 'speak', 'speak', 'speak'],
      fr: ['parle', 'parles', 'parle', 'parlons', 'parlez', 'parlent'],
      it: ['parlo', 'parli', 'parla', 'parliamo', 'parlate', 'parlano'],
      uk: ['говорю', 'говориш', 'говорить', 'говоримо', 'говорите', 'говорять'],
      lt: ['kalbu', 'kalbi', 'kalba', 'kalbame', 'kalbate', 'kalba'], ar: ['أتكلم', 'تتكلم', 'يتكلم', 'نتكلم', 'تتكلمون', 'يتكلمون'],
    },
    pastForms: {
      es: ['he hablado', 'has hablado', 'ha hablado', 'hemos hablado', 'habéis hablado', 'han hablado'],
      pt: ['falei', 'falou', 'falou', 'falamos', 'falaram', 'falaram'],
      en: ['spoke', 'spoke', 'spoke', 'spoke', 'spoke', 'spoke'],
      fr: ['ai parlé', 'as parlé', 'a parlé', 'avons parlé', 'avez parlé', 'ont parlé'],
      it: ['ho parlato', 'hai parlato', 'ha parlato', 'abbiamo parlato', 'avete parlato', 'hanno parlato'],
      uk: ['говорив', 'говорив', 'говорив', 'говорили', 'говорили', 'говорили'],
      ar: ['تكلمت', 'تكلمت', 'تكلم', 'تكلمنا', 'تكلمتم', 'تكلموا'],
      lt: ['kalbėjau', 'kalbėjai', 'kalbėjo', 'kalbėjome', 'kalbėjote', 'kalbėjo'],
    },
    futureForms: {
      es: ['voy a hablar', 'vas a hablar', 'va a hablar', 'vamos a hablar', 'vais a hablar', 'van a hablar'],
      pt: ['vou falar', 'vai falar', 'vai falar', 'vamos falar', 'vão falar', 'vão falar'],
      en: ['will speak', 'will speak', 'will speak', 'will speak', 'will speak', 'will speak'],
      fr: ['vais parler', 'vas parler', 'va parler', 'allons parler', 'allez parler', 'vont parler'],
      it: ['parlerò', 'parlerai', 'parlerà', 'parleremo', 'parlerete', 'parleranno'],
      uk: ['буду говорити', 'будеш говорити', 'буде говорити', 'будемо говорити', 'будете говорити', 'будуть говорити'],
      ar: ['سأتكلم', 'ستتكلم', 'سيتكلم', 'سنتكلم', 'ستتكلمون', 'سيتكلمون'],
      lt: ['kalbėsiu', 'kalbėsi', 'kalbės', 'kalbėsime', 'kalbėsite', 'kalbės'],
    },
    complements: [
      { key: 'spanish', texts: { es: 'español', pt: 'espanhol', en: 'Spanish', fr: 'espagnol', it: 'spagnolo', uk: 'іспанською', lt: 'ispaniškai', ar: 'الإسبانية' } },
      { key: 'english', texts: { es: 'inglés', pt: 'inglês', en: 'English', fr: 'anglais', it: 'inglese', uk: 'англійською', lt: 'angliškai', ar: 'الإنجليزية' } },
      { key: 'aLittle', texts: { es: 'un poco', pt: 'um pouco', en: 'a little', fr: 'un peu', it: 'un po\'', uk: 'трохи', lt: 'šiek tiek', ar: 'قليلًا' } },
    ],
  },
  {
    key: 'ser', enAux: 'be',
    labels: { es: 'ser', pt: 'ser', en: 'to be', fr: 'être', it: 'essere', uk: 'бути', lt: 'būti', ar: 'يكون' },
    forms: {
      es: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
      pt: ['sou', 'é', 'é', 'somos', 'são', 'são'],
      en: ['am', 'are', 'is', 'are', 'are', 'are'],
      fr: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
      it: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'],
      uk: ['', '', '', '', '', ''],
      lt: ['esu', 'esi', 'yra', 'esame', 'esate', 'yra'], ar: ['', '', '', '', '', ''],
    },
    pastForms: {
      es: ['he sido', 'has sido', 'ha sido', 'hemos sido', 'habéis sido', 'han sido'],
      pt: ['fui', 'foi', 'foi', 'fomos', 'foram', 'foram'],
      en: ['was', 'were', 'was', 'were', 'were', 'were'],
      fr: ['ai été', 'as été', 'a été', 'avons été', 'avez été', 'ont été'],
      it: ['sono stato', 'sei stato', 'è stato', 'siamo stati', 'siete stati', 'sono stati'],
      uk: ['був', 'був', 'був', 'були', 'були', 'були'],
      ar: ['كنت', 'كنت', 'كان', 'كنا', 'كنتم', 'كانوا'],
      lt: ['buvau', 'buvai', 'buvo', 'buvome', 'buvote', 'buvo'],
    },
    futureForms: {
      es: ['voy a ser', 'vas a ser', 'va a ser', 'vamos a ser', 'vais a ser', 'van a ser'],
      pt: ['vou ser', 'vai ser', 'vai ser', 'vamos ser', 'vão ser', 'vão ser'],
      en: ['will be', 'will be', 'will be', 'will be', 'will be', 'will be'],
      fr: ['vais être', 'vas être', 'va être', 'allons être', 'allez être', 'vont être'],
      it: ['sarò', 'sarai', 'sarà', 'saremo', 'sarete', 'saranno'],
      uk: ['буду', 'будеш', 'буде', 'будемо', 'будете', 'будуть'],
      ar: ['سأكون', 'ستكون', 'سيكون', 'سنكون', 'ستكونون', 'سيكونون'],
      lt: ['būsiu', 'būsi', 'bus', 'būsime', 'būsite', 'bus'],
    },
    complements: [
      { key: 'fromBrazil', texts: { es: 'de Brasil', pt: 'do Brasil', en: 'from Brazil', fr: 'du Brésil', it: 'del Brasile', uk: 'з Бразилії', lt: 'iš Brazilijos', ar: 'من البرازيل' } },
      { key: 'newHere', texts: { es: 'nuevo aquí', pt: 'novo aqui', en: 'new here', fr: 'nouveau ici', it: 'nuovo qui', uk: 'тут новий', lt: 'čia naujas', ar: 'جديد هنا' } },
      { key: 'student', texts: { es: 'estudiante', pt: 'estudante', en: 'a student', fr: 'étudiant', it: 'studente', uk: 'студент', lt: 'studentas', ar: 'طالب' } },
    ],
  },
  {
    key: 'estar', enAux: 'be',
    labels: { es: 'estar', pt: 'estar', en: 'to be (state)', fr: 'être (état)', it: 'stare', uk: 'перебувати', lt: 'būti (būsena)', ar: 'يوجد' },
    forms: {
      es: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
      pt: ['estou', 'está', 'está', 'estamos', 'estão', 'estão'],
      en: ['am', 'are', 'is', 'are', 'are', 'are'],
      fr: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
      it: ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno'],
      uk: ['', '', '', '', '', ''],
      lt: ['esu', 'esi', 'yra', 'esame', 'esate', 'yra'], ar: ['', '', '', '', '', ''],
    },
    pastForms: {
      es: ['he estado', 'has estado', 'ha estado', 'hemos estado', 'habéis estado', 'han estado'],
      pt: ['estive', 'esteve', 'esteve', 'estivemos', 'estiveram', 'estiveram'],
      en: ['was', 'were', 'was', 'were', 'were', 'were'],
      fr: ['ai été', 'as été', 'a été', 'avons été', 'avez été', 'ont été'],
      it: ['sono stato', 'sei stato', 'è stato', 'siamo stati', 'siete stati', 'sono stati'],
      uk: ['був', 'був', 'був', 'були', 'були', 'були'],
      ar: ['كنت', 'كنت', 'كان', 'كنا', 'كنتم', 'كانوا'],
      lt: ['buvau', 'buvai', 'buvo', 'buvome', 'buvote', 'buvo'],
    },
    futureForms: {
      es: ['voy a estar', 'vas a estar', 'va a estar', 'vamos a estar', 'vais a estar', 'van a estar'],
      pt: ['vou estar', 'vai estar', 'vai estar', 'vamos estar', 'vão estar', 'vão estar'],
      en: ['will be', 'will be', 'will be', 'will be', 'will be', 'will be'],
      fr: ['vais être', 'vas être', 'va être', 'allons être', 'allez être', 'vont être'],
      it: ['starò', 'starai', 'starà', 'staremo', 'starete', 'staranno'],
      uk: ['буду', 'будеш', 'буде', 'будемо', 'будете', 'будуть'],
      ar: ['سأكون', 'ستكون', 'سيكون', 'سنكون', 'ستكونون', 'سيكونون'],
      lt: ['būsiu', 'būsi', 'bus', 'būsime', 'būsite', 'bus'],
    },
    complements: [
      { key: 'here', texts: { es: 'aquí', pt: 'aqui', en: 'here', fr: 'ici', it: 'qui', uk: 'тут', lt: 'čia', ar: 'هنا' } },
      { key: 'lost', texts: { es: 'perdido', pt: 'perdido', en: 'lost', fr: 'perdu', it: 'perso', uk: 'загублений', lt: 'pasiklydęs', ar: 'تائه' } },
      { key: 'fine', texts: { es: 'bien', pt: 'bem', en: 'fine', fr: 'bien', it: 'bene', uk: 'добре', lt: 'gerai', ar: 'بخير' } },
    ],
  },
];

// ---------------------------------------------------------------------------
// MONTAGEM DA FRASE
// ---------------------------------------------------------------------------
export type Mood = 'affirm' | 'question' | 'negative';
export type Tense = 'past' | 'present' | 'future';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const isVowel = (w: string) => /^[aeiouâêîôûàèéëïœh]/i.test(w);

/** Negação de frase nominal em árabe: "ليس" conjuga por pessoa. */
const AR_NOT: string[] = ['لست', 'لست', 'ليس', 'لسنا', 'لستم', 'ليسوا'];

/** Junta verbo e complemento respeitando terminações que já pedem elisão. */
const joinVerb = (verb: string, comp: string) => (verb.endsWith("'") ? `${verb}${comp}` : `${verb} ${comp}`);

/**
 * Preposição que a forma verbal carrega e que só faz sentido com objeto.
 * Sem complemento, "preciso de" vira "preciso" e "ai besoin d'" vira
 * "ai besoin" — frases curtas, mas corretas.
 */
const TRAILING_PREPOSITION: Partial<Record<LangCode, RegExp>> = {
  pt: /\s+de$/,
  es: /\s+de$/,
  it: /\s+di$/,
  fr: /\s*d['’]$|\s+de$/,
};

const dropDanglingPreposition = (lang: LangCode, form: string): string => {
  const pattern = TRAILING_PREPOSITION[lang];
  return pattern ? form.replace(pattern, '') : form;
};

export const buildPhrase = (
  lang: LangCode,
  pronoun: Pronoun,
  verb: Verb,
  comp: { texts: Text } | null,
  mood: Mood,
  tense: Tense = 'present',
): string => {
  // Ucraniano e árabe dispensam o verbo "ser" no presente, então a forma vem vazia.
  const person = pronoun.altPerson?.[lang] ?? pronoun.person;
  const useDative = verb.dativeIn?.includes(lang) && pronoun.dative?.[lang];
  const p = useDative ? pronoun.dative![lang]! : pronoun.words[lang];
  const table = tense === 'past' ? verb.pastForms : tense === 'future' ? verb.futureForms : verb.forms;
  const c = comp ? comp.texts[lang] : '';
  // Verbos como "precisar de" / "avoir besoin de" / "aver bisogno di" trazem a
  // preposição colada na forma. Sem complemento ela ficava pendurada no fim
  // ("J'ai besoin d'.", "Eu preciso de."). A UI já evita esse estado para
  // verbos que exigem objeto; aqui a função se protege de qualquer jeito.
  const v = c ? table[lang][person] : dropDanglingPreposition(lang, table[lang][person]);
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

    case 'lt': {
      // A negação lituana cola na primeira palavra: noriu -> nenoriu, yra -> nėra.
      if (mood === 'question') return `Ar ${p} ${body}?`;
      if (mood === 'negative') {
        const [head, ...rest] = v.split(' ');
        const neg = head === 'yra' ? 'nėra' : `ne${head}`;
        const tail = [...rest, c].filter(Boolean).join(' ');
        return `${cap(p)} ${tail ? `${neg} ${tail}` : neg}.`;
      }
      return `${cap(p)} ${body}.`;
    }

    case 'ar': {
      // Presente nega com "لا", passado com "ما", futuro com "لن" + presente.
      if (mood === 'question') return `هل ${p} ${body}؟`;
      if (mood === 'negative') {
        if (!v) return `${p} ${AR_NOT[person]} ${body}.`;
        if (tense === 'past') return `${p} ما ${body}.`;
        if (tense === 'future') {
          // لن pede o verbo sem o prefixo de futuro س — é a mesma forma que o
          // projeto usa depois de لن em todos os outros verbos. Para ser/estar
          // o presente é vazio de propósito (o árabe não tem cópula), então a
          // forma sai do futuro tirando o س: سأكون → أكون.
          const present = verb.forms.ar[person] || verb.futureForms.ar[person].replace(/^س/, '');
          return `${p} لن ${c ? joinVerb(present, c) : present}.`;
        }
        return `${p} لا ${body}.`;
      }
      return `${p} ${body}.`;
    }

    case 'fr': {
      // "ne ... pas" abraça só o auxiliar: "je n'ai pas voulu", não "n'ai voulu pas".
      const [aux, ...rest] = v.split(' ');
      const subj = p === 'je' && isVowel(aux) ? "j'" : `${p} `;
      if (mood === 'question') return `Est-ce que ${subj}${body} ?`;
      if (mood === 'negative') {
        // Na negativa quem elide é "ne", não o sujeito: "je n'ai pas", nunca "j'n'ai".
        const ne = isVowel(aux) ? "n'" : 'ne ';
        // `join(' ')` cru quebrava a elisão do complemento: "besoin d' aide".
        // `joinVerb` respeita o apóstrofo, igual à afirmativa.
        const tail = [...rest, c].filter(Boolean).reduce((acc, part) => (acc ? joinVerb(acc, part) : part), '');
        return `${cap(p)} ${ne}${aux} pas${tail ? ` ${tail}` : ''}.`;
      }
      return `${cap(subj)}${body}.`;
    }

    default: {
      // Inglês precisa de auxiliar na pergunta e na negação, e ele muda por tempo.
      const tail = c ? ` ${c}` : '';

      if (tense === 'future') {
        // As formas de futuro vêm como "will want": basta separar o auxiliar.
        const rest = v.replace(/^will /, '');
        if (mood === 'question') return `Will ${p} ${rest}${tail}?`;
        if (mood === 'negative') return `${cap(p)} will not ${rest}${tail}.`;
        return `${cap(p)} ${body}.`;
      }

      const base = verb.forms.en[0];
      if (verb.enAux === 'be') {
        if (mood === 'question') return `${cap(v)} ${p}${tail}?`;
        if (mood === 'negative') return `${cap(p)} ${v} not${tail}.`;
        return `${cap(p)} ${body}.`;
      }
      if (verb.enAux === 'can') {
        const aux = tense === 'past' ? 'could' : 'can';
        if (mood === 'question') return `${cap(aux)} ${p}${tail}?`;
        if (mood === 'negative') return `${cap(p)} ${aux} not${tail}.`;
        return `${cap(p)} ${aux}${tail}.`;
      }
      if (tense === 'past') {
        if (mood === 'question') return `Did ${p} ${base}${tail}?`;
        if (mood === 'negative') return `${cap(p)} did not ${base}${tail}.`;
        return `${cap(p)} ${body}.`;
      }
      const third = person === 2;
      if (mood === 'question') return `${third ? 'Does' : 'Do'} ${p} ${base}${tail}?`;
      if (mood === 'negative') return `${cap(p)} ${third ? "doesn't" : "don't"} ${base}${tail}.`;
      return `${cap(p)} ${body}.`;
    }
  }
};

export const TENSE_LABELS: Record<Tense, Text> = {
  past:    { es: 'pasado', pt: 'passado', en: 'past', fr: 'passé', it: 'passato', uk: 'минуле', ar: 'الماضي', lt: 'praeitis' },
  present: { es: 'presente', pt: 'presente', en: 'present', fr: 'présent', it: 'presente', uk: 'теперішнє', ar: 'الحاضر', lt: 'dabartis' },
  future:  { es: 'futuro', pt: 'futuro', en: 'future', fr: 'futur', it: 'futuro', uk: 'майбутнє', ar: 'المستقبل', lt: 'ateitis' },
};

export const MOOD_LABELS: Record<Mood, Text> = {
  affirm:   { es: 'afirmación', pt: 'afirmação', en: 'statement', fr: 'affirmation', it: 'affermazione', uk: 'ствердження', lt: 'teiginys', ar: 'إثبات' },
  question: { es: 'pregunta', pt: 'pergunta', en: 'question', fr: 'question', it: 'domanda', uk: 'питання', lt: 'klausimas', ar: 'سؤال' },
  negative: { es: 'negación', pt: 'negação', en: 'negative', fr: 'négation', it: 'negazione', uk: 'заперечення', lt: 'neiginys', ar: 'نفي' },
};
