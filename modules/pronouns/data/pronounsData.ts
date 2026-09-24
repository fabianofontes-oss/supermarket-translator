
// Módulo "Quero, posso, preciso" (endereço `pronombres`, nascido "Eu, você, ele").
// Pronomes e conjugação, virando frase inteira.
//
// O erro mais comum de brasileiro na Espanha: "você" é informal em português mas
// se conjuga na 3ª pessoa, então a pessoa fala "usted quiere" quando deveria
// falar "tú quieres". E "vosotros" existe na Espanha e não na América Latina.
//
// ---------------------------------------------------------------------------
// O DESTINO MANDA NA GRADE (auditoria de usabilidade, 23/09/2026)
// ---------------------------------------------------------------------------
// A lista de pessoas, os selos e as notas nasceram para a Espanha e apareciam
// iguais em qualquer destino. Na França a grade mostrava "vous" três vezes e a
// nota de "tu" dizia "use com quase todo mundo" — o contrário do que se faz lá.
// Nos EUA aparecia "you" com selo FORMAL. Agora:
//
// - `pronounsFor` diz quem aparece em cada destino (Espanha: os onze; França: oito,
//   sem vosotros, ustedes nem nosotras; inglês: seis, um "you" só).
// - `pronounBadge` diz qual selo cada um leva ali (ESPANHA só na Espanha; FORMAL
//   nunca em inglês).
// - `notes` é por LUGAR (`NoteRegion`), e só aparece a do lugar onde ela está.
//   Nada da Espanha aparece como verdade fora da Espanha.
//
// O dado não foi podado: os onze continuam aqui, e o filtro é de tela.
//
// ---------------------------------------------------------------------------
// NENHUMA FRASE CONCORDA COM O GÊNERO DE QUEM FALA
// ---------------------------------------------------------------------------
// A regra da Limpeza da casa vale para o app inteiro. Por isso "ser" e "estar"
// não têm mais "nuevo aquí", "estudiante" nem "perdido": viravam "Estoy perdido"
// para a faxineira, e "Nosotros somos estudiante" no plural. E o passado de
// ser/estar em italiano é o imperfeito ("ero", "stavo"), porque o passato
// prossimo com essere concorda ("sono stato/stata").
//
// Única exceção conhecida, e anotada: o passado ucraniano de 1ª pessoa ("я
// хотів") marca gênero e não tem forma neutra. O ucraniano nunca é destino, só
// linha de apoio, e `tests/grammar.test.ts` (Parte 7) documenta a pendência.
//
// Já "ella" e "ellas" são pessoas de gênero CONHECIDO — é a própria palavra. Eles
// viraram pronomes separados de "él" e "ellos" (antes a frase dizia "Él / ella
// quiere", com a barra, e a cuidadora não conseguia dizer "Ella necesita un
// médico"). Onde o verbo concorda com eles (passado ucraniano, árabe), o verbo
// guarda a forma feminina em `fem`.

import type { LangCode } from '../../location/data/locationData';

export type Text = Record<LangCode, string>;

/** Índice da forma verbal: 0=eu, 1=tu, 2=ele/ela, 3=nós, 4=vós, 5=eles. */
export type Person = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * O lugar de onde a nota fala. `spain` é o PAÍS (Espanha, e não o espanhol do
 * Chile); `france` é o francês; `english` serve EUA e Reino Unido.
 */
export type NoteRegion = 'spain' | 'france' | 'english';

export interface Pronoun {
  key: string;
  person: Person;
  /** 'formal' = usted/ustedes. 'spain' = só se usa na Espanha. */
  tag?: 'formal' | 'spain';
  /**
   * 'f' em "ella", "ellas" e "nosotras". No verbo só muda alguma coisa onde ele
   * concorda com o sujeito de 3ª pessoa: passado ucraniano ("вона хотіла") e
   * árabe ("هي تريد"). Em "nosotras" o feminino já está na palavra.
   */
  gender?: 'f';
  /**
   * Nem toda língua conjuga o tratamento formal na mesma pessoa que o espanhol.
   * Espanhol e italiano usam a 3ª pessoa; inglês, francês, ucraniano e árabe usam a 2ª.
   */
  altPerson?: Partial<Record<LangCode, Person>>;
  words: Text;
  /** Forma no dativo, usada por verbos como o lituano "reikia". */
  dative?: Partial<Record<LangCode, string>>;
  /**
   * Explicação da armadilha, por lugar, na língua de quem lê. Sem jargão de
   * escola: nada de "2ª pessoa" ou "forma formal" — quem estudou pouco não sabe
   * o que é isso.
   */
  notes?: Partial<Record<NoteRegion, Text>>;
}

/**
 * A ordem é a da GRADE, em pares de duas colunas: eu/você, ele/ela,
 * usted/ustedes, nosotros/nosotras, ellos/ellas — e vosotros sozinho no fim,
 * porque só existe na Espanha. Na França e nos EUA, com os ocultos fora, os
 * pares continuam de pé (je/tu, il/elle, vous/nous, ils/elles; I/you, he/she,
 * we/they). A tabela de conjugação reordena por pessoa.
 */
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
      // "Use com quase todo mundo" contradizia a Limpeza (a patroa é "usted") e o
      // Cuidar de idosos (comece com "usted"). Uma faxineira tratava a patroa de
      // "tú" por causa desta nota. As três telas agora dizem a mesma coisa.
      spain: {
        es: 'En España se usa con casi todo el mundo, pero con la persona para la que trabajas y con los mayores, usted. Es "tú quieres", con S al final.',
        pt: 'Na Espanha, "tú" é o nosso "você": use com colegas, vizinhos e gente da sua idade. Com a patroa e com gente mais velha, use "usted". É "tú quieres", com S no fim.',
        en: 'In Spain, "tú" is for colleagues, neighbours and people your age. With your employer and with older people, use "usted". It is "tú quieres", with an S at the end.',
        fr: 'En Espagne, « tú » s’utilise avec les collègues, les voisins et les gens de votre âge. Avec la personne qui vous emploie et avec les personnes âgées, dites « usted ». On dit « tú quieres », avec un S à la fin.',
        it: 'In Spagna "tú" si usa con colleghi, vicini e persone della tua età. Con chi ti dà lavoro e con le persone anziane si usa "usted". Si dice "tú quieres", con la S in fondo.',
        uk: 'В Іспанії «tú» кажуть колегам, сусідам і ровесникам. До роботодавця і до старших людей звертаються на «usted». Правильно «tú quieres», із S у кінці.',
        lt: 'Ispanijoje „tú“ sakoma kolegoms, kaimynams ir bendraamžiams. Darbdaviui ir vyresniems žmonėms sakoma „usted“. Sakoma „tú quieres“, su S gale.',
        ar: 'في إسبانيا تُستعمل «tú» مع الزملاء والجيران ومن هم في سنك. ومع صاحب العمل وكبار السن تُستعمل «usted». يقال «tú quieres» بحرف S في الآخر.',
      },
      france: {
        es: 'En Francia, "tu" es solo para amigos, familia y niños. Con quien no conoces (dependiente, jefa, médico), usa "vous".',
        pt: 'Na França, "tu" é só para amigos, família e criança. Com quem você não conhece (vendedor, patroa, médico), use "vous".',
        en: 'In France, "tu" is only for friends, family and children. With people you don’t know (shop staff, your employer, the doctor), use "vous".',
        fr: '« Tu », c’est pour les amis, la famille et les enfants. Avec les personnes qu’on ne connaît pas, on dit « vous ».',
        it: 'In Francia "tu" è solo per amici, famiglia e bambini. Con chi non conosci (commesso, datrice di lavoro, medico) usa "vous".',
        uk: 'У Франції «tu» кажуть лише друзям, рідним і дітям. До незнайомих (продавця, роботодавця, лікаря) звертаються на «vous».',
        lt: 'Prancūzijoje „tu“ sakoma tik draugams, šeimai ir vaikams. Nepažįstamiems (pardavėjui, darbdaviui, gydytojui) sakykite „vous“.',
        ar: 'في فرنسا «tu» للأصدقاء والعائلة والأطفال فقط. مع من لا تعرفهم (البائع، صاحبة العمل، الطبيب) استعمل «vous».',
      },
      english: {
        es: 'En inglés, "you" sirve para todo el mundo, del amigo al médico, y también es el plural.',
        pt: 'Em inglês, "you" serve para todo mundo, do amigo ao médico, e também quer dizer "vocês".',
        en: '"You" works for everyone, from friends to the doctor, and for one person or many.',
        fr: 'En anglais, « you » sert pour tout le monde, de l’ami au médecin, et aussi au pluriel.',
        it: 'In inglese "you" va bene con tutti, dall’amico al medico, e vale anche per "voi".',
        uk: 'В англійській «you» кажуть усім — і другові, і лікарю, і кільком людям одразу.',
        lt: 'Anglų kalboje „you“ tinka visiems – ir draugui, ir gydytojui, ir keliems žmonėms.',
        ar: 'في الإنجليزية «you» تصلح للجميع، من الصديق إلى الطبيب، وللمفرد والجمع.',
      },
    },
  },
  {
    key: 'el', person: 2,
    dative: { lt: 'jam' },
    words: { es: 'él', pt: 'ele', en: 'he', fr: 'il', it: 'lui', uk: 'він', lt: 'jis', ar: 'هو' },
  },
  {
    key: 'ella', person: 2, gender: 'f',
    dative: { lt: 'jai' },
    words: { es: 'ella', pt: 'ela', en: 'she', fr: 'elle', it: 'lei', uk: 'вона', lt: 'ji', ar: 'هي' },
  },
  {
    key: 'usted', person: 2, tag: 'formal',
    dative: { lt: 'jums' },
    altPerson: { en: 1, fr: 4, uk: 4, ar: 1, lt: 4 },
    words: { es: 'usted', pt: 'o senhor / a senhora', en: 'you', fr: 'vous', it: 'lei', uk: 'ви', lt: 'jūs', ar: 'حضرتك' },
    notes: {
      spain: {
        es: '"Usted" es para personas mayores. El verbo va igual que con "él": "usted quiere".',
        pt: '"Usted" é "o senhor / a senhora". Use com gente mais velha. O verbo fica igual ao de "él": "usted quiere".',
        en: '"Usted" is like "sir / madam". Use it with older people. The verb is the same as with "él": "usted quiere".',
        fr: '« Usted », c’est « monsieur / madame ». À utiliser avec les personnes âgées. Le verbe est le même qu’avec « él » : « usted quiere ».',
        it: '"Usted" è come il nostro "Lei". Si usa con le persone anziane. Il verbo è uguale a quello di "él": "usted quiere".',
        uk: '«Usted» — це як «пан / пані». Так звертаються до людей старшого віку. Дієслово таке саме, як з «él»: «usted quiere».',
        lt: '„Usted“ – tai kaip „ponas / ponia“. Taip kreipiamasi į vyresnius žmones. Veiksmažodis toks pat kaip su „él“: „usted quiere“.',
        ar: '«Usted» تعني «حضرتك». تُستعمل مع كبار السن. الفعل مثل الفعل مع «él»: «usted quiere».',
      },
      france: {
        es: '"Vous" es la forma educada para hablar con una persona, y también es el "vosotros". Si dudas, usa "vous".',
        pt: '"Vous" é o jeito educado de falar com uma pessoa, e também é o "vocês". Na dúvida, use "vous".',
        en: '"Vous" is the polite way to talk to one person, and it is also "you all". When in doubt, use "vous".',
        fr: '« Vous » est la forme polie, et sert aussi pour plusieurs personnes. Dans le doute, dites « vous ».',
        it: '"Vous" è il modo educato per parlare a una persona, ed è anche il "voi". Nel dubbio, usa "vous".',
        uk: '«Vous» — ввічливе звертання до однієї людини, і водночас «ви» до кількох. Якщо сумніваєтеся, кажіть «vous».',
        lt: '„Vous“ – mandagus kreipinys į vieną žmogų, ir kartu „jūs“ keliems. Jei abejojate, sakykite „vous“.',
        ar: '«Vous» هي الصيغة المهذبة لمخاطبة شخص واحد، وهي أيضًا للجمع. عند الشك استعمل «vous».',
      },
    },
  },
  {
    key: 'ustedes', person: 5, tag: 'formal',
    dative: { lt: 'jums' },
    altPerson: { en: 4, fr: 4, uk: 4, ar: 4, lt: 4 },
    words: { es: 'ustedes', pt: 'os senhores', en: 'you all', fr: 'vous', it: 'loro', uk: 'ви', lt: 'jūs', ar: 'حضراتكم' },
    notes: {
      spain: {
        es: '"Ustedes" es para un grupo al que tratas de usted. Con amigos, en España se dice "vosotros".',
        pt: '"Ustedes" é "os senhores". Para um grupo de amigos, na Espanha se diz "vosotros".',
        en: '"Ustedes" is the polite "you all". With friends, in Spain people say "vosotros".',
        fr: '« Ustedes », c’est le « vous » poli pour plusieurs personnes. Entre amis, en Espagne on dit « vosotros ».',
        it: '"Ustedes" è il "voi" di cortesia. Con gli amici, in Spagna si dice "vosotros".',
        uk: '«Ustedes» — це ввічливе «ви» до кількох людей. З друзями в Іспанії кажуть «vosotros».',
        lt: '„Ustedes“ – mandagus „jūs“ keliems žmonėms. Su draugais Ispanijoje sakoma „vosotros“.',
        ar: '«Ustedes» هي «حضراتكم» لعدة أشخاص. مع الأصدقاء يقال في إسبانيا «vosotros».',
      },
    },
  },
  {
    key: 'nosotros', person: 3,
    dative: { lt: 'mums' },
    words: { es: 'nosotros', pt: 'nós', en: 'we', fr: 'nous', it: 'noi', uk: 'ми', lt: 'mes', ar: 'نحن' },
  },
  // "Nós" de um grupo só de mulheres. É a regra de gênero de quem fala: sem ele,
  // a faxineira e a colega só conseguiam montar "Nosotros necesitamos…", e duas
  // mulheres falando de si no masculino é erro que o espanhol nota. Nas outras
  // sete línguas "nós" não tem gênero, e por isso a palavra é a mesma de
  // "nosotros" — o que também faz o pronome só aparecer em espanhol
  // (`pronounsFor`). A nota explica a diferença, que a glosa "nós" não mostra.
  {
    key: 'nosotras', person: 3, gender: 'f',
    dative: { lt: 'mums' },
    words: { es: 'nosotras', pt: 'nós', en: 'we', fr: 'nous', it: 'noi', uk: 'ми', lt: 'mes', ar: 'نحن' },
    notes: {
      spain: {
        es: 'Si el grupo es solo de mujeres, se dice "nosotras". Si hay algún hombre, "nosotros".',
        pt: 'Se o grupo for só de mulheres, é "nosotras". Com algum homem no grupo, é "nosotros".',
        en: 'If the group is only women, it is "nosotras". If there is any man in it, "nosotros".',
        fr: 'Si le groupe n’est composé que de femmes, on dit « nosotras ». S’il y a un homme, « nosotros ».',
        it: 'Se il gruppo è di sole donne, si dice "nosotras". Se c’è anche un uomo, "nosotros".',
        uk: 'Якщо в групі лише жінки, кажуть «nosotras». Якщо є хоч один чоловік — «nosotros».',
        lt: 'Jei grupėje tik moterys, sakoma „nosotras“. Jei yra bent vienas vyras – „nosotros“.',
        ar: 'إذا كانت المجموعة من النساء فقط يقال «nosotras». وإذا كان فيها رجل يقال «nosotros».',
      },
    },
  },
  {
    key: 'ellos', person: 5,
    dative: { lt: 'jiems' },
    words: { es: 'ellos', pt: 'eles', en: 'they', fr: 'ils', it: 'loro', uk: 'вони', lt: 'jie', ar: 'هم' },
  },
  {
    key: 'ellas', person: 5, gender: 'f',
    dative: { lt: 'joms' },
    words: { es: 'ellas', pt: 'elas', en: 'they', fr: 'elles', it: 'loro', uk: 'вони', lt: 'jos', ar: 'هن' },
  },
  // Por último, e sozinho na última linha da grade: só existe na Espanha.
  {
    key: 'vosotros', person: 4, tag: 'spain',
    dative: { lt: 'jums' },
    words: { es: 'vosotros', pt: 'vocês', en: 'you all', fr: 'vous', it: 'voi', uk: 'ви', lt: 'jūs', ar: 'أنتم' },
    notes: {
      spain: {
        es: 'Solo se usa en España. En América Latina dicen "ustedes".',
        pt: 'É o "vocês" da Espanha, e só existe aqui. Na América Latina se fala "ustedes". Você vai ouvir muito: "¿queréis algo?"',
        en: 'Used only in Spain. Latin America says "ustedes".',
        fr: 'Utilisé seulement en Espagne. En Amérique latine on dit "ustedes".',
        it: 'Si usa solo in Spagna. In America Latina dicono "ustedes".',
        uk: 'Вживається лише в Іспанії. У Латинській Америці кажуть "ustedes".',
        lt: 'Vartojama tik Ispanijoje. Lotynų Amerikoje sako „ustedes“.', ar: 'تستخدم في إسبانيا فقط. في أمريكا اللاتينية يقولون "ustedes".',
      },
    },
  },
];

export const pronounByKey = (key: string): Pronoun => {
  const p = PRONOUNS.find((x) => x.key === key);
  if (!p) throw new Error(`pronome desconhecido: ${key}`);
  return p;
};

/** A pessoa em que o pronome conjuga NESTA língua (usted: 3ª em es/it, 2ª no resto). */
export const personIn = (p: Pronoun, lang: LangCode): Person => p.altPerson?.[lang] ?? p.person;

// ---------------------------------------------------------------------------
// QUEM APARECE EM CADA DESTINO
// ---------------------------------------------------------------------------

/**
 * Pronomes visíveis por língua de destino. Língua fora daqui mostra todos.
 *
 * - Francês: "vous" uma vez só, na chave `usted` (é a que traz a nota "na
 *   dúvida, use vous"). Vosotros e ustedes também seriam "vous" e somem.
 * - Inglês: um "you" só, sem selo, e "they" uma vez. "You all" não é o que se
 *   ouve na rua; a nota de "you" já diz que ele vale para várias pessoas.
 * - Italiano: "Lei" formal fica; "loro" aparece uma vez.
 */
const VISIBLE: Partial<Record<LangCode, string[]>> = {
  en: ['yo', 'tu', 'el', 'ella', 'nosotros', 'ellos'],
  fr: ['yo', 'tu', 'el', 'ella', 'usted', 'nosotros', 'ellos', 'ellas'],
  it: ['yo', 'tu', 'el', 'ella', 'usted', 'nosotros', 'vosotros', 'ellos'],
};

/** Quem aparece na grade e na tabela, na ordem da grade. */
export const pronounsFor = (lang: LangCode, countryCode: string): Pronoun[] => {
  const keys = VISIBLE[lang];
  if (keys) return PRONOUNS.filter((p) => keys.includes(p.key));
  // "vosotros" só existe na Espanha: no espanhol da América ele some.
  if (lang === 'es' && countryCode !== 'es') return PRONOUNS.filter((p) => p.tag !== 'spain');
  return PRONOUNS;
};

/** O selo que o pronome leva NESTE destino, ou nenhum. */
export const pronounBadge = (p: Pronoun, lang: LangCode, countryCode: string): 'formal' | 'spain' | null => {
  if (p.tag === 'spain') return lang === 'es' && countryCode === 'es' ? 'spain' : null;
  if (p.tag !== 'formal') return null;
  // O inglês não tem "você" formal.
  if (lang === 'en') return null;
  // Fora da Espanha, "ustedes" é o único plural, e não tem nada de formal.
  if (lang === 'es' && countryCode !== 'es' && p.key === 'ustedes') return null;
  return 'formal';
};

/** De que lugar falam as notas, dado onde ela está. `null` = nenhuma nota. */
export const noteRegion = (lang: LangCode, countryCode: string): NoteRegion | null => {
  if (countryCode === 'es') return 'spain';
  if (lang === 'fr') return 'france';
  if (lang === 'en') return 'english';
  return null;
};

/** A nota do pronome para este destino, na língua de quem lê. */
export const noteFor = (p: Pronoun, lang: LangCode, countryCode: string, read: LangCode): string | null => {
  const region = noteRegion(lang, countryCode);
  return (region && p.notes?.[region]?.[read]) || null;
};

/**
 * Quem a frase de abertura trata por "você". Na França e na Itália, com
 * desconhecido, é o formal ("vous", "Lei"); na Espanha e em inglês, "tú"/"you".
 */
export const youPronoun = (lang: LangCode): Pronoun => pronounByKey(lang === 'fr' || lang === 'it' ? 'usted' : 'tu');

// ---------------------------------------------------------------------------
// VERBOS — seis formas: [eu, tu, ele, nós, vós, eles]
// ---------------------------------------------------------------------------
/** Como o inglês monta pergunta e negação. */
type EnAux = 'do' | 'be' | 'can';

type Six = [string, string, string, string, string, string];
type TenseTable = 'forms' | 'pastForms' | 'futureForms';

export interface Complement { key: string; texts: Text }

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
  forms: Record<LangCode, Six>;
  /**
   * Passado. Em espanhol é o pretérito perfecto, que é o que se ouve na Espanha.
   * Em italiano, ser/estar usam o imperfeito ("ero", "stavo"): o passato
   * prossimo com essere concorda com o gênero de quem fala.
   */
  pastForms: Record<LangCode, Six>;
  /** Futuro. Em espanhol é o perifrástico "voy a", muito mais falado que "querré". */
  futureForms: Record<LangCode, Six>;
  /**
   * Feminino de 3ª pessoa, [ella, ellas], só onde o verbo concorda com o
   * sujeito: passado ucraniano e o árabe. Onde não há entrada, vale a tabela
   * comum — o que é certo em es, pt, en, fr, it e lt.
   */
  fem?: Partial<Record<TenseTable, Partial<Record<LangCode, [string, string]>>>>;
  /** Complementos que combinam com este verbo. */
  complements: Complement[];
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
    fem: {
      forms: { ar: ['تريد', 'يردن'] },
      pastForms: { uk: ['хотіла', 'хотіли'], ar: ['أرادت', 'أردن'] },
      futureForms: { ar: ['ستريد', 'سيردن'] },
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
    fem: {
      forms: { ar: ['لديها', 'لديهن'] },
      pastForms: { uk: ['мала', 'мали'], ar: ['كان لديها', 'كان لديهن'] },
      futureForms: { ar: ['سيكون لديها', 'سيكون لديهن'] },
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
    fem: {
      forms: { ar: ['تستطيع', 'يستطعن'] },
      pastForms: { uk: ['могла', 'могли'], ar: ['استطاعت', 'استطعن'] },
      futureForms: { ar: ['ستستطيع', 'سيستطعن'] },
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
    fem: {
      forms: { ar: ['تحتاج', 'يحتجن'] },
      pastForms: { uk: ['потребувала', 'потребували'], ar: ['احتاجت', 'احتجن'] },
      futureForms: { ar: ['ستحتاج', 'سيحتجن'] },
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
    fem: {
      forms: { ar: ['تتكلم', 'يتكلمن'] },
      pastForms: { uk: ['говорила', 'говорили'], ar: ['تكلمت', 'تكلمن'] },
      futureForms: { ar: ['ستتكلم', 'سيتكلمن'] },
    },
    // A língua do lugar tem que estar aqui: sem "francés", na França ela não
    // conseguia dizer "Je ne parle pas français". `LOCAL_LANGUAGE` liga cada
    // destino à sua.
    complements: [
      { key: 'spanish', texts: { es: 'español', pt: 'espanhol', en: 'Spanish', fr: 'espagnol', it: 'spagnolo', uk: 'іспанською', lt: 'ispaniškai', ar: 'الإسبانية' } },
      { key: 'english', texts: { es: 'inglés', pt: 'inglês', en: 'English', fr: 'anglais', it: 'inglese', uk: 'англійською', lt: 'angliškai', ar: 'الإنجليزية' } },
      { key: 'french', texts: { es: 'francés', pt: 'francês', en: 'French', fr: 'français', it: 'francese', uk: 'французькою', lt: 'prancūziškai', ar: 'الفرنسية' } },
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
      it: ['ero', 'eri', 'era', 'eravamo', 'eravate', 'erano'],
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
    // O presente árabe fica vazio de propósito (não há cópula), igual à tabela comum.
    fem: {
      forms: { ar: ['', ''] },
      pastForms: { uk: ['була', 'були'], ar: ['كانت', 'كنّ'] },
      futureForms: { ar: ['ستكون', 'سيكنّ'] },
    },
    // Nada aqui concorda com quem fala. "nuevo aquí" e "estudiante" saíram:
    // viravam "Soy nuevo" para ela e "Nosotros somos estudiante" no plural.
    // "de aquí" não flexiona, e com NÃO dá a frase útil: "No soy de aquí".
    complements: [
      { key: 'fromBrazil', texts: { es: 'de Brasil', pt: 'do Brasil', en: 'from Brazil', fr: 'du Brésil', it: 'del Brasile', uk: 'з Бразилії', lt: 'iš Brazilijos', ar: 'من البرازيل' } },
      { key: 'fromHere', texts: { es: 'de aquí', pt: 'daqui', en: 'from here', fr: "d'ici", it: 'di qui', uk: 'звідси', lt: 'iš čia', ar: 'من هنا' } },
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
      it: ['stavo', 'stavi', 'stava', 'stavamo', 'stavate', 'stavano'],
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
    fem: {
      forms: { ar: ['', ''] },
      pastForms: { uk: ['була', 'були'], ar: ['كانت', 'كنّ'] },
      futureForms: { ar: ['ستكون', 'سيكنّ'] },
    },
    // "perdido" saiu: a faxineira aprendia "Estoy perdido" em vez de "perdida",
    // e "Ellos están perdido" no plural. "en casa" não concorda com ninguém.
    complements: [
      { key: 'here', texts: { es: 'aquí', pt: 'aqui', en: 'here', fr: 'ici', it: 'qui', uk: 'тут', lt: 'čia', ar: 'هنا' } },
      { key: 'home', texts: { es: 'en casa', pt: 'em casa', en: 'at home', fr: 'à la maison', it: 'a casa', uk: 'вдома', lt: 'namie', ar: 'في البيت' } },
      { key: 'fine', texts: { es: 'bien', pt: 'bem', en: 'fine', fr: 'bien', it: 'bene', uk: 'добре', lt: 'gerai', ar: 'بخير' } },
    ],
  },
];

export const verbByKey = (key: string): Verb => {
  const v = VERBS.find((x) => x.key === key);
  if (!v) throw new Error(`verbo desconhecido: ${key}`);
  return v;
};

/** A língua que se fala em cada destino, como complemento de "hablar". */
const LOCAL_LANGUAGE: Partial<Record<LangCode, string>> = { es: 'spanish', en: 'english', fr: 'french' };

/**
 * O complemento que entra quando ela escolhe o verbo. Em "falar" é a língua do
 * lugar ("Je parle français" na França), não sempre o espanhol.
 */
export const defaultComplement = (verb: Verb, lang: LangCode): string => {
  const local = LOCAL_LANGUAGE[lang];
  return (local && verb.complements.some((c) => c.key === local) ? local : verb.complements[0].key);
};

const TABLE_OF: Record<'past' | 'present' | 'future', TenseTable> = {
  past: 'pastForms', present: 'forms', future: 'futureForms',
};

/**
 * A forma do verbo para este sujeito. É aqui, e só aqui, que "ella"/"ellas"
 * pegam o feminino onde o verbo concorda. A frase e a tabela de conjugação da
 * tela passam as duas por esta função, para nunca discordarem.
 */
export const verbForm = (verb: Verb, pronoun: Pronoun, lang: LangCode, tense: Tense): string => {
  const person = personIn(pronoun, lang);
  const table = TABLE_OF[tense];
  if (pronoun.gender === 'f' && (person === 2 || person === 5)) {
    const pair = verb.fem?.[table]?.[lang];
    if (pair) return pair[person === 2 ? 0 : 1];
  }
  return verb[table][lang][person];
};

// ---------------------------------------------------------------------------
// MONTAGEM DA FRASE
// ---------------------------------------------------------------------------
export type Mood = 'affirm' | 'question' | 'negative';
export type Tense = 'past' | 'present' | 'future';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const isVowel = (w: string) => /^[aeiouâêîôûàèéëïœh]/i.test(w);

/** Negação de frase nominal em árabe: "ليس" conjuga por pessoa. */
const AR_NOT: string[] = ['لست', 'لست', 'ليس', 'لسنا', 'لستم', 'ليسوا'];
/** O mesmo "ليس" com sujeito feminino: هي ليست, هن لسن. */
const AR_NOT_FEM: Partial<Record<Person, string>> = { 2: 'ليست', 5: 'لسن' };

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

/**
 * Línguas em que o verbo já diz quem é, e o sujeito pode sumir. Nelas, "Yo
 * necesito un médico" soa enfático ("eu, e não outro"); o natural é "Necesito
 * un médico". Inglês e francês não largam o sujeito; lituano e ucraniano até
 * largam, mas nunca são destino, e o dativo lituano ("Man reikia") é o próprio
 * sujeito.
 */
const SUJEITO_OCULTO: LangCode[] = ['es', 'pt', 'it'];

export interface OpcoesFrase {
  /**
   * Tira o pronome sujeito onde a língua deixa. Só as frases prontas usam: são
   * o que se diz no balcão. A frase montada pelos seletores continua com o
   * pronome, porque ali mostrar o pronome é o objetivo.
   */
  semSujeito?: boolean;
}

export const buildPhrase = (
  lang: LangCode,
  pronoun: Pronoun,
  verb: Verb,
  comp: { texts: Text } | null,
  mood: Mood,
  tense: Tense = 'present',
  opcoes: OpcoesFrase = {},
): string => {
  // Ucraniano e árabe dispensam o verbo "ser" no presente, então a forma vem vazia.
  const person = personIn(pronoun, lang);
  const useDative = verb.dativeIn?.includes(lang) && pronoun.dative?.[lang];
  const p = useDative ? pronoun.dative![lang]! : pronoun.words[lang];
  const c = comp ? comp.texts[lang] : '';
  const form = verbForm(verb, pronoun, lang, tense);
  // Verbos como "precisar de" / "avoir besoin de" / "aver bisogno di" trazem a
  // preposição colada na forma. Sem complemento ela ficava pendurada no fim
  // ("J'ai besoin d'.", "Eu preciso de."). A UI já evita esse estado para
  // verbos que exigem objeto; aqui a função se protege de qualquer jeito.
  const v = c ? form : dropDanglingPreposition(lang, form);
  const body = (v ? (c ? joinVerb(v, c) : v) : c).trim();

  if (!body) return `${cap(p)}.`;

  if (opcoes.semSujeito && SUJEITO_OCULTO.includes(lang)) {
    const nao = { es: 'No', pt: 'Não', it: 'Non' }[lang as 'es' | 'pt' | 'it'];
    if (mood === 'question') return lang === 'es' ? `¿${cap(body)}?` : `${cap(body)}?`;
    if (mood === 'negative') return `${nao} ${body}.`;
    return `${cap(body)}.`;
  }

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
        if (!v) {
          const not = (pronoun.gender === 'f' && AR_NOT_FEM[person]) || AR_NOT[person];
          return `${p} ${not} ${body}.`;
        }
        if (tense === 'past') return `${p} ما ${body}.`;
        if (tense === 'future') {
          // لن pede o verbo sem o prefixo de futuro س — é a mesma forma que o
          // projeto usa depois de لن em todos os outros verbos. Para ser/estar
          // o presente é vazio de propósito (o árabe não tem cópula), então a
          // forma sai do futuro tirando o س: سأكون → أكون.
          const present = verbForm(verb, pronoun, 'ar', 'present')
            || verbForm(verb, pronoun, 'ar', 'future').replace(/^س/, '');
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
      // "que" também elide diante do sujeito: "Est-ce qu'il", "Est-ce qu'elle".
      // Com "il / elle" colados num botão só ninguém via; separados, apareceu.
      const que = /^[aeiou]/i.test(subj) ? "qu'" : 'que ';
      if (mood === 'question') return `Est-ce ${que}${subj}${body} ?`;
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

/**
 * Palavras de fazer, não de escola: "afirmação" e "negação" são termo de aula, e
 * quem estudou pouco não sabe que "negação" quer dizer "pôr o NÃO".
 */
export const MOOD_LABELS: Record<Mood, Text> = {
  affirm:   { es: 'decir', pt: 'dizer', en: 'say', fr: 'dire', it: 'dire', uk: 'сказати', lt: 'pasakyti', ar: 'قول' },
  question: { es: 'preguntar', pt: 'perguntar', en: 'ask', fr: 'demander', it: 'chiedere', uk: 'запитати', lt: 'paklausti', ar: 'سؤال' },
  negative: { es: 'decir NO', pt: 'dizer NÃO', en: 'say NO', fr: 'dire NON', it: 'dire NO', uk: 'сказати НІ', lt: 'pasakyti NE', ar: 'قول «لا»' },
};

// ---------------------------------------------------------------------------
// FRASES PRONTAS
// ---------------------------------------------------------------------------
// As frases de sobrevivência já existiam, mas escondidas atrás de quatro escolhas
// em quatro blocos de uma tela que rola. Com a atendente esperando, ninguém monta
// "yo + hablar + español + negação". Aqui cada uma é um toque.
//
// Não há texto guardado: cada frase pronta é só uma combinação de pronome, verbo,
// complemento e tipo, e o rótulo sai do próprio `buildPhrase` na língua de quem
// lê. Assim o botão nunca diz uma coisa e a frase outra.
//
// E saem SEM o pronome sujeito onde a língua deixa (`semSujeito`): "¿Puedes
// ayudarme?", "Necesito un médico", "Não falo espanhol". Com ele, "¿Yo puedo
// pagar con tarjeta?" ganhava uma ênfase de "e eu, posso?" que nenhum espanhol
// põe no balcão — e era a primeira frase que ela decorava.

export interface ReadyPhrase {
  key: string;
  pronoun: Pronoun;
  verb: Verb;
  comp: Complement;
  mood: Mood;
}

const ready = (key: string, pronoun: Pronoun, verbKey: string, compKey: string, mood: Mood): ReadyPhrase => {
  const verb = verbByKey(verbKey);
  const comp = verb.complements.find((c) => c.key === compKey);
  if (!comp) throw new Error(`complemento desconhecido: ${verbKey}/${compKey}`);
  return { key, pronoun, verb, comp, mood };
};

/**
 * As frases prontas deste destino. A primeira é a de abertura do módulo ("Pode
 * me ajudar?"), e por isso aparece marcada quando a tela abre. "Não falo…"
 * usa a língua do lugar; num destino sem ela, a frase não aparece.
 */
export const readyPhrasesFor = (lang: LangCode): ReadyPhrase[] => {
  const yo = pronounByKey('yo');
  const local = LOCAL_LANGUAGE[lang];
  return [
    ready('help', youPronoun(lang), 'poder', 'help', 'question'),
    ...(local ? [ready('noSpeak', yo, 'hablar', local, 'negative')] : []),
    ready('aLittle', yo, 'hablar', 'aLittle', 'affirm'),
    ready('card', yo, 'poder', 'payCard', 'question'),
    ready('doctor', yo, 'necesitar', 'doctor', 'affirm'),
  ];
};
