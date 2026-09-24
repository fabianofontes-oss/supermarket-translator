
// Módulo "Direções" — instruções de rua, bússola, perguntas e vocabulário.
// O espanhol é o da Espanha (manzana, gira, sigue recto, coge la primera...).
// Inglês e francês também são destino de verdade (EUA e França estão abertos),
// então precisam soar naturais lá, e não só "não quebrar".
// Ucraniano (uk), árabe (ar) e lituano (lt) são idiomas de origem: aparecem só na
// linha de apoio, nunca na frase falada.
//
// A REGRA DE GÊNERO (vale para o app inteiro): o app não sabe o gênero de quem
// usa. Nenhuma frase pode concordar com ele — nem na boca dela ("Estoy perdido")
// nem na de quem responde a ela ("Vous êtes arrivé", "Sei arrivato"). Por isso
// "Me he perdido", "Vous y êtes", "Ci sei". tests/directions.test.ts varre isto.

import type { LangCode } from '../../location/data/locationData';

export type Text = Record<LangCode, string>;

// ---------------------------------------------------------------------------
// PASSOS DO PERCURSO
// turn: 0 = mantém, 1 = direita, -1 = esquerda, 2 = meia-volta
// forward: quantos quarteirões anda; 'end' = até o fim da rua
// ---------------------------------------------------------------------------
export interface DirStep {
  key: string;
  icon: string;
  /**
   * Giro em oitavos de volta (45°), positivo para a direita.
   *
   * Era em quartos, e 4 direções bastavam enquanto a cidade só tinha ruas em
   * cruz. A bifurcação é uma rua DIAGONAL: sem 45° ela seria desenho, não
   * caminho. Então: 2 = direita, -2 = esquerda, 4 = meia-volta, e 1 / -1 são os
   * desvios da bifurcação.
   */
  turn: number;
  forward: number | 'end';
  arrive?: boolean;
  /** Só pode ser usado parado neste lugar. Sem isto, vale em qualquer esquina. */
  at?: 'rotatoria';
  labels: Text;
  phrases: Text;
}

export const DIR_STEPS: DirStep[] = [
  {
    key: 'straight', icon: '⬆️', turn: 0, forward: 1,
    labels:  { es: 'sigue recto', pt: 'siga reto', en: 'go straight', fr: 'tout droit', it: 'vai dritto', uk: 'прямо', lt: 'tiesiai', ar: 'مباشرة' },
    phrases: { es: 'Sigue recto.', pt: 'Siga reto.', en: 'Go straight.', fr: 'Continuez tout droit.', it: 'Vai dritto.', uk: 'Йдіть прямо.', lt: 'Eikite tiesiai.', ar: 'استمر مباشرة.' },
  },
  {
    key: 'straight2', icon: '⏫', turn: 0, forward: 2,
    labels:  { es: 'dos manzanas', pt: 'dois quarteirões', en: 'two blocks', fr: 'deux pâtés', it: 'due isolati', uk: 'два квартали', lt: 'du kvartalus', ar: 'شارعان' },
    phrases: { es: 'Sigue recto dos manzanas.', pt: 'Siga reto dois quarteirões.', en: 'Go straight for two blocks.', fr: 'Continuez tout droit sur deux pâtés de maisons.', it: 'Vai dritto per due isolati.', uk: 'Йдіть прямо два квартали.', lt: 'Eikite tiesiai du kvartalus.', ar: 'امشِ مباشرة مسافة شارعين.' },
  },
  {
    key: 'right', icon: '↪️', turn: 2, forward: 1,
    labels:  { es: 'a la derecha', pt: 'à direita', en: 'turn right', fr: 'à droite', it: 'a destra', uk: 'праворуч', lt: 'į dešinę', ar: 'إلى اليمين' },
    phrases: { es: 'En la esquina, gira a la derecha.', pt: 'Na esquina, vire à direita.', en: 'At the corner, turn right.', fr: 'Au coin, tournez à droite.', it: "All'angolo, gira a destra.", uk: 'На розі поверніть праворуч.', lt: 'Kampe pasukite į dešinę.', ar: 'عند الزاوية، انعطف يمينًا.' },
  },
  {
    key: 'left', icon: '↩️', turn: -2, forward: 1,
    labels:  { es: 'a la izquierda', pt: 'à esquerda', en: 'turn left', fr: 'à gauche', it: 'a sinistra', uk: 'ліворуч', lt: 'į kairę', ar: 'إلى اليسار' },
    phrases: { es: 'En la esquina, gira a la izquierda.', pt: 'Na esquina, vire à esquerda.', en: 'At the corner, turn left.', fr: 'Au coin, tournez à gauche.', it: "All'angolo, gira a sinistra.", uk: 'На розі поверніть ліворуч.', lt: 'Kampe pasukite į kairę.', ar: 'عند الزاوية، انعطف يسارًا.' },
  },
  {
    key: 'cross', icon: '🚸', turn: 0, forward: 1,
    labels:  { es: 'cruza la calle', pt: 'atravesse', en: 'cross', fr: 'traversez', it: 'attraversa', uk: 'перейдіть', lt: 'pereikite', ar: 'اعبر' },
    phrases: { es: 'Cruza la calle por el paso de peatones.', pt: 'Atravesse a rua na faixa.', en: 'Cross the street at the crosswalk.', fr: 'Traversez la rue au passage piéton.', it: 'Attraversa la strada sulle strisce.', uk: 'Перейдіть вулицю по пішохідному переходу.', lt: 'Pereikite gatvę per perėją.', ar: 'اعبر الشارع من ممر المشاة.' },
  },
  {
    key: 'endStreet', icon: '🏁', turn: 0, forward: 'end',
    labels:  { es: 'hasta el final', pt: 'até o final', en: 'to the end', fr: "jusqu'au bout", it: 'fino in fondo', uk: 'до кінця', lt: 'iki galo', ar: 'حتى النهاية' },
    phrases: { es: 'Sigue hasta el final de la calle.', pt: 'Siga até o final da rua.', en: 'Go to the end of the street.', fr: "Allez jusqu'au bout de la rue.", it: 'Vai fino alla fine della strada.', uk: 'Йдіть до кінця вулиці.', lt: 'Eikite iki gatvės galo.', ar: 'استمر حتى نهاية الشارع.' },
  },
  {
    // "Dê a volta", no Brasil, é CONTORNAR (dar a volta no quarteirão), não
    // voltar para trás. A glosa em pt ensinava o contrário do que o boneco faz.
    key: 'back', icon: '🔄', turn: 4, forward: 0,
    labels:  { es: 'da la vuelta', pt: 'meia-volta', en: 'turn around', fr: 'demi-tour', it: 'torna indietro', uk: 'розверніться', lt: 'apsisukite', ar: 'ارجع' },
    phrases: { es: 'Da la vuelta.', pt: 'Dê meia-volta.', en: 'Turn around.', fr: 'Faites demi-tour.', it: 'Torna indietro.', uk: 'Розверніться.', lt: 'Apsisukite.', ar: 'ارجع إلى الخلف.' },
  },
  {
    // Francês e italiano diziam "arrivé" / "arrivato": concordavam com quem
    // OUVE, e o app não sabe se é ela ou ele. "Vous y êtes" e "Ci sei" não
    // concordam com ninguém e são o que se diz na rua.
    key: 'arrive', icon: '📍', turn: 0, forward: 0, arrive: true,
    labels:  { es: 'has llegado', pt: 'chegou', en: 'arrived', fr: 'vous y êtes', it: 'ci sei', uk: 'прибули', lt: 'atvykote', ar: 'وصلت' },
    phrases: { es: 'Ya has llegado. Está justo ahí.', pt: 'Você chegou. É bem ali.', en: "You have arrived. It's right there.", fr: "Vous y êtes. C'est juste là.", it: 'Ci sei. È proprio lì.', uk: 'Ви прибули. Це прямо тут.', lt: 'Jūs atvykote. Tai čia pat.', ar: 'لقد وصلت. إنه هنا تمامًا.' },
  },
];


// ---------------------------------------------------------------------------
// PASSOS QUE SÓ EXISTEM NUM LUGAR
// A rotatória pede estar nela; a bifurcação se recusa sozinha, porque a rua
// diagonal só existe entre dois cruzamentos (ver DIAGONAIS).
// ---------------------------------------------------------------------------
export const DIR_PLACE_STEPS: DirStep[] = [
  {
    key: 'exit1', icon: '1\uFE0F\u20E3', turn: 2, forward: 1, at: 'rotatoria',
    labels:  { es: 'primera salida', pt: 'primeira saída', en: 'first exit', fr: 'première sortie', it: 'prima uscita', uk: 'перший з\'їзд', lt: 'pirmas išvažiavimas', ar: 'المخرج الأول' },
    phrases: { es: 'En la rotonda, toma la primera salida.', pt: 'Na rotatória, pegue a primeira saída.', en: 'At the roundabout, take the first exit.', fr: 'Au rond-point, prenez la première sortie.', it: 'Alla rotonda, prendi la prima uscita.', uk: 'На кільці зверніть на перший з\'їзд.', lt: 'Žiedinėje sankryžoje sukite į pirmą išvažiavimą.', ar: 'في الدوار، اسلك المخرج الأول.' },
  },
  {
    key: 'exit2', icon: '2\uFE0F\u20E3', turn: 0, forward: 1, at: 'rotatoria',
    labels:  { es: 'segunda salida', pt: 'segunda saída', en: 'second exit', fr: 'deuxième sortie', it: 'seconda uscita', uk: 'другий з\'їзд', lt: 'antras išvažiavimas', ar: 'المخرج الثاني' },
    phrases: { es: 'En la rotonda, toma la segunda salida.', pt: 'Na rotatória, pegue a segunda saída.', en: 'At the roundabout, take the second exit.', fr: 'Au rond-point, prenez la deuxième sortie.', it: 'Alla rotonda, prendi la seconda uscita.', uk: 'На кільці зверніть на другий з\'їзд.', lt: 'Žiedinėje sankryžoje sukite į antrą išvažiavimą.', ar: 'في الدوار، اسلك المخرج الثاني.' },
  },
  {
    key: 'exit3', icon: '3\uFE0F\u20E3', turn: -2, forward: 1, at: 'rotatoria',
    labels:  { es: 'tercera salida', pt: 'terceira saída', en: 'third exit', fr: 'troisième sortie', it: 'terza uscita', uk: 'третій з\'їзд', lt: 'trečias išvažiavimas', ar: 'المخرج الثالث' },
    phrases: { es: 'En la rotonda, toma la tercera salida.', pt: 'Na rotatória, pegue a terceira saída.', en: 'At the roundabout, take the third exit.', fr: 'Au rond-point, prenez la troisième sortie.', it: 'Alla rotonda, prendi la terza uscita.', uk: 'На кільці зверніть на третій з\'їзд.', lt: 'Žiedinėje sankryžoje sukite į trečią išvažiavimą.', ar: 'في الدوار، اسلك المخرج الثالث.' },
  },
  {
    key: 'forkRight', icon: '\u2197\uFE0F', turn: 1, forward: 1,
    labels:  { es: 'desvío derecha', pt: 'desvio à direita', en: 'right branch', fr: 'fourche à droite', it: 'bivio a destra', uk: 'розвилка праворуч', lt: 'atšaka į dešinę', ar: 'مفترق يمين' },
    phrases: { es: 'En la bifurcación, coge el desvío de la derecha.', pt: 'Na bifurcação, pegue o desvio à direita.', en: 'At the fork, take the right branch.', fr: 'À la fourche, prenez à droite.', it: 'Al bivio, prendi a destra.', uk: 'На розвилці тримайтеся правого боку.', lt: 'Sankryžoje laikykitės dešinės.', ar: 'عند المفترق، اسلك اليمين.' },
  },
  {
    key: 'forkLeft', icon: '\u2196\uFE0F', turn: -1, forward: 1,
    labels:  { es: 'desvío izquierda', pt: 'desvio à esquerda', en: 'left branch', fr: 'fourche à gauche', it: 'bivio a sinistra', uk: 'розвилка ліворуч', lt: 'atšaka į kairę', ar: 'مفترق يسار' },
    phrases: { es: 'En la bifurcación, coge el desvío de la izquierda.', pt: 'Na bifurcação, pegue o desvio à esquerda.', en: 'At the fork, take the left branch.', fr: 'À la fourche, prenez à gauche.', it: 'Al bivio, prendi a sinistra.', uk: 'На розвилці тримайтеся лівого боку.', lt: 'Sankryžoje laikykitės kairės.', ar: 'عند المفترق، اسلك اليسار.' },
  },
];

// ---------------------------------------------------------------------------
// BÚSSOLA
// ---------------------------------------------------------------------------
export interface Compass { key: 'N' | 'E' | 'S' | 'W'; deg: number; names: Text }

export const COMPASS: Compass[] = [
  { key: 'N', deg: 0,   names: { es: 'Norte', pt: 'Norte', en: 'North', fr: 'Nord',  it: 'Nord',  uk: 'Північ',  lt: 'Šiaurė', ar: 'الشمال' } },
  { key: 'E', deg: 90,  names: { es: 'Este',  pt: 'Leste', en: 'East',  fr: 'Est',   it: 'Est',   uk: 'Схід',    lt: 'Rytai', ar: 'الشرق' } },
  { key: 'S', deg: 180, names: { es: 'Sur',   pt: 'Sul',   en: 'South', fr: 'Sud',   it: 'Sud',   uk: 'Південь', lt: 'Pietūs', ar: 'الجنوب' } },
  { key: 'W', deg: 270, names: { es: 'Oeste', pt: 'Oeste', en: 'West',  fr: 'Ouest', it: 'Ovest', uk: 'Захід',   lt: 'Vakarai', ar: 'الغرب' } },
];

/** "Vas hacia el norte." */
export const headingSentence = (lang: LangCode, c: Compass): string => {
  const n = c.names[lang];
  switch (lang) {
    case 'es': return `Vas hacia el ${n.toLowerCase()}.`;
    case 'pt': return `Você está indo para o ${n.toLowerCase()}.`;
    case 'fr': return `Vous allez vers le ${n.toLowerCase()}.`;
    case 'it': return `Stai andando verso ${n.toLowerCase()}.`;
    case 'uk': return `Ви йдете на ${n.toLowerCase()}.`;
    case 'ar': return `أنت تتجه نحو ${n}.`;
    // "į" pede acusativo, então usamos a forma neutra "Kryptis: ...".
    case 'lt': return `Kryptis: ${n.toLowerCase()}.`;
    default:   return `You are heading ${n.toLowerCase()}.`;
  }
};

// ---------------------------------------------------------------------------
// COMO CHEGO A…
//
// Era uma frase só, "¿Cómo llego a la estación?", e quem precisava da farmácia
// teria de juntar sozinha "Cómo llego a" + "el metro" — e ainda acertar "AL
// metro". O app inteiro monta frases, e justo aqui a frase era pronta e servia a
// um lugar. Agora é uma frase inteira por lugar, com a contração já feita em
// cada língua (al, au, alla, ao, à).
//
// O emoji é o mesmo do mapa (💊, 🏥, 🚇, 🚏, 🚉, 🏦): quem viu o lugar desenhado
// acha a ficha dele pelo desenho, sem ler.
//
// Equivalência, não tradução: o "centro de salud" espanhol é o "posto de saúde"
// de quem lê em português, e "the clinic" para quem pergunta nos EUA.
// ---------------------------------------------------------------------------
export interface GoTo { key: string; emoji: string; phrase: Text }

export const DIR_GO_TO: GoTo[] = [
  { key: 'pharmacy', emoji: '💊', phrase: { es: '¿Cómo llego a la farmacia?', pt: 'Como chego à farmácia?', en: 'How do I get to the pharmacy?', fr: 'Comment aller à la pharmacie ?', it: 'Come arrivo alla farmacia?', uk: 'Як дійти до аптеки?', lt: 'Kaip nueiti į vaistinę?', ar: 'كيف أصل إلى الصيدلية؟' } },
  { key: 'health', emoji: '🏥', phrase: { es: '¿Cómo llego al centro de salud?', pt: 'Como chego ao posto de saúde?', en: 'How do I get to the clinic?', fr: 'Comment aller au centre de santé ?', it: 'Come arrivo al centro medico?', uk: 'Як дійти до поліклініки?', lt: 'Kaip nueiti į polikliniką?', ar: 'كيف أصل إلى المركز الصحي؟' } },
  { key: 'metro', emoji: '🚇', phrase: { es: '¿Cómo llego al metro?', pt: 'Como chego ao metrô?', en: 'How do I get to the subway?', fr: 'Comment aller au métro ?', it: 'Come arrivo alla metropolitana?', uk: 'Як дійти до метро?', lt: 'Kaip nueiti į metro?', ar: 'كيف أصل إلى المترو؟' } },
  { key: 'bus', emoji: '🚏', phrase: { es: '¿Cómo llego a la parada de autobús?', pt: 'Como chego ao ponto de ônibus?', en: 'How do I get to the bus stop?', fr: "Comment aller à l'arrêt de bus ?", it: "Come arrivo alla fermata dell'autobus?", uk: 'Як дійти до автобусної зупинки?', lt: 'Kaip nueiti į autobusų stotelę?', ar: 'كيف أصل إلى موقف الحافلة؟' } },
  { key: 'station', emoji: '🚉', phrase: { es: '¿Cómo llego a la estación?', pt: 'Como chego à estação?', en: 'How do I get to the station?', fr: 'Comment aller à la gare ?', it: 'Come arrivo alla stazione?', uk: 'Як дійти до вокзалу?', lt: 'Kaip nueiti į stotį?', ar: 'كيف أصل إلى المحطة؟' } },
  { key: 'bank', emoji: '🏦', phrase: { es: '¿Cómo llego al banco?', pt: 'Como chego ao banco?', en: 'How do I get to the bank?', fr: 'Comment aller à la banque ?', it: 'Come arrivo alla banca?', uk: 'Як дійти до банку?', lt: 'Kaip nueiti į banką?', ar: 'كيف أصل إلى البنك؟' } },
  { key: 'supermarket', emoji: '🛒', phrase: { es: '¿Cómo llego al supermercado?', pt: 'Como chego ao supermercado?', en: 'How do I get to the supermarket?', fr: 'Comment aller au supermarché ?', it: 'Come arrivo al supermercato?', uk: 'Як дійти до супермаркету?', lt: 'Kaip nueiti į prekybos centrą?', ar: 'كيف أصل إلى السوبرماركت؟' } },
];

// ---------------------------------------------------------------------------
// PERGUNTAS ÚTEIS
// A da estação saiu daqui: virou uma das fichas de DIR_GO_TO.
// ---------------------------------------------------------------------------
export const DIR_QUESTIONS: Text[] = [
  { es: '¿Está lejos?', pt: 'É longe?', en: 'Is it far?', fr: "C'est loin ?", it: 'È lontano?', uk: 'Це далеко?', lt: 'Ar toli?', ar: 'هل هو بعيد؟' },
  { es: '¿Se puede ir andando?', pt: 'Dá para ir a pé?', en: 'Can I walk there?', fr: 'On peut y aller à pied ?', it: 'Si può andare a piedi?', uk: 'Можна дійти пішки?', lt: 'Ar galima nueiti pėsčiomis?', ar: 'هل يمكن الذهاب مشيًا؟' },
  { es: '¿Cuánto se tarda?', pt: 'Quanto tempo leva?', en: 'How long does it take?', fr: 'Ça prend combien de temps ?', it: 'Quanto ci vuole?', uk: 'Скільки часу це займе?', lt: 'Kiek užtrunka?', ar: 'كم يستغرق الوقت؟' },
  { es: '¿Dónde está la parada de autobús?', pt: 'Onde fica o ponto de ônibus?', en: 'Where is the bus stop?', fr: "Où est l'arrêt de bus ?", it: "Dov'è la fermata dell'autobus?", uk: 'Де автобусна зупинка?', lt: 'Kur yra autobusų stotelė?', ar: 'أين موقف الحافلة؟' },
  { es: '¿Me lo puede señalar en el mapa?', pt: 'Pode me mostrar no mapa?', en: 'Can you show me on the map?', fr: 'Pouvez-vous me montrer sur la carte ?', it: 'Me lo può indicare sulla mappa?', uk: 'Можете показати на карті?', lt: 'Ar galite parodyti žemėlapyje?', ar: 'هل يمكنك أن تريني على الخريطة؟' },
  { es: '¿Puede repetir, por favor?', pt: 'Pode repetir, por favor?', en: 'Can you repeat, please?', fr: "Pouvez-vous répéter, s'il vous plaît ?", it: 'Può ripetere, per favore?', uk: 'Повторіть, будь ласка.', lt: 'Pakartokite, prašau.', ar: 'هل يمكنك التكرار من فضلك؟' },
  // A frase que mais ajuda a ENTENDER a resposta, e não existia.
  { es: '¿Puede hablar más despacio?', pt: 'Pode falar mais devagar?', en: 'Can you speak more slowly?', fr: 'Pouvez-vous parler plus lentement ?', it: 'Può parlare più lentamente?', uk: 'Говоріть повільніше, будь ласка.', lt: 'Ar galite kalbėti lėčiau?', ar: 'هل يمكنك التحدث ببطء؟' },
  // Era "Estoy perdido" / "Estou perdido": masculino, na boca de um público que
  // é sobretudo mulher. Estas não concordam com quem fala.
  { es: 'Me he perdido.', pt: 'Me perdi.', en: "I'm lost.", fr: 'Je ne trouve pas mon chemin.', it: 'Non trovo la strada.', uk: 'Я не можу знайти дорогу.', lt: 'Aš pasiklydau.', ar: 'لقد ضللت الطريق.' },
];

// ---------------------------------------------------------------------------
// VOCABULÁRIO DA RUA
// ---------------------------------------------------------------------------
export interface Vocab { emoji: string; names: Text }

export const DIR_PLACES: Vocab[] = [
  { emoji: '🏢', names: { es: 'la esquina', pt: 'a esquina', en: 'the corner', fr: 'le coin', it: "l'angolo", uk: 'ріг', lt: 'kampas', ar: 'الزاوية' } },
  { emoji: '🏘️', names: { es: 'la manzana', pt: 'o quarteirão', en: 'the block', fr: 'le pâté de maisons', it: "l'isolato", uk: 'квартал', lt: 'kvartalas', ar: 'المربع السكني' } },
  { emoji: '🚦', names: { es: 'el semáforo', pt: 'o semáforo', en: 'the traffic light', fr: 'le feu', it: 'il semaforo', uk: 'світлофор', lt: 'šviesoforas', ar: 'إشارة المرور' } },
  // ⭕ e não 🔄: o 🔄 é o passo "da la vuelta", e com o mesmo desenho nos dois
  // ela via o ícone sem saber qual das duas coisas era.
  { emoji: '⭕', names: { es: 'la rotonda', pt: 'a rotatória', en: 'the roundabout', fr: 'le rond-point', it: 'la rotonda', uk: "кільцева розв'язка", lt: 'žiedinė sankryža', ar: 'الدوار' } },
  { emoji: '➕', names: { es: 'el cruce', pt: 'o cruzamento', en: 'the intersection', fr: 'le carrefour', it: "l'incrocio", uk: 'перехрестя', lt: 'sankryža', ar: 'التقاطع' } },
  { emoji: '🚸', names: { es: 'el paso de peatones', pt: 'a faixa de pedestres', en: 'the crosswalk', fr: 'le passage piéton', it: 'le strisce pedonali', uk: 'пішохідний перехід', lt: 'pėsčiųjų perėja', ar: 'ممر المشاة' } },
  { emoji: '⛲', names: { es: 'la plaza', pt: 'a praça', en: 'the square', fr: 'la place', it: 'la piazza', uk: 'площа', lt: 'aikštė', ar: 'الساحة' } },
  { emoji: '🌉', names: { es: 'el puente', pt: 'a ponte', en: 'the bridge', fr: 'le pont', it: 'il ponte', uk: 'міст', lt: 'tiltas', ar: 'الجسر' } },
  { emoji: '🚏', names: { es: 'la parada de autobús', pt: 'o ponto de ônibus', en: 'the bus stop', fr: "l'arrêt de bus", it: "la fermata dell'autobus", uk: 'автобусна зупинка', lt: 'autobusų stotelė', ar: 'موقف الحافلة' } },
  { emoji: '🛣️', names: { es: 'la calle', pt: 'a rua', en: 'the street', fr: 'la rue', it: 'la via', uk: 'вулиця', lt: 'gatvė', ar: 'الشارع' } },
  { emoji: '🏙️', names: { es: 'la avenida', pt: 'a avenida', en: 'the avenue', fr: "l'avenue", it: 'il viale', uk: 'проспект', lt: 'prospektas', ar: 'الجادة' } },
  { emoji: '🚇', names: { es: 'el metro', pt: 'o metrô', en: 'the subway', fr: 'le métro', it: 'la metropolitana', uk: 'метро', lt: 'metro', ar: 'المترو' } },
  { emoji: '🚉', names: { es: 'la estación', pt: 'a estação', en: 'the station', fr: 'la gare', it: 'la stazione', uk: 'вокзал', lt: 'stotis', ar: 'المحطة' } },
];

export const DIR_DISTANCES: Vocab[] = [
  { emoji: '📏', names: { es: 'a 200 metros', pt: 'a 200 metros', en: '200 meters away', fr: 'à 200 mètres', it: 'a 200 metri', uk: 'за 200 метрів', lt: 'už 200 metrų', ar: 'على بعد 200 متر' } },
  { emoji: '🚶', names: { es: 'a cinco minutos andando', pt: 'a cinco minutos a pé', en: 'five minutes on foot', fr: 'à cinq minutes à pied', it: 'a cinque minuti a piedi', uk: "п'ять хвилин пішки", lt: 'penkios minutės pėsčiomis', ar: 'خمس دقائق مشيًا' } },
  { emoji: '1️⃣', names: { es: 'la primera calle', pt: 'a primeira rua', en: 'the first street', fr: 'la première rue', it: 'la prima via', uk: 'перша вулиця', lt: 'pirma gatvė', ar: 'الشارع الأول' } },
  { emoji: '2️⃣', names: { es: 'la segunda calle', pt: 'a segunda rua', en: 'the second street', fr: 'la deuxième rue', it: 'la seconda via', uk: 'друга вулиця', lt: 'antra gatvė', ar: 'الشارع الثاني' } },
  { emoji: '🏁', names: { es: 'al final de la calle', pt: 'no final da rua', en: 'at the end of the street', fr: 'au bout de la rue', it: 'in fondo alla strada', uk: 'у кінці вулиці', lt: 'gatvės gale', ar: 'في نهاية الشارع' } },
  { emoji: '↔️', names: { es: 'enfrente', pt: 'em frente', en: 'across the street', fr: 'en face', it: 'di fronte', uk: 'навпроти', lt: 'priešais', ar: 'في الجهة المقابلة' } },
  { emoji: '🏦', names: { es: 'al lado del banco', pt: 'ao lado do banco', en: 'next to the bank', fr: 'à côté de la banque', it: 'accanto alla banca', uk: 'біля банку', lt: 'šalia banko', ar: 'بجانب البنك' } },
  { emoji: '💊', names: { es: 'después de la farmacia', pt: 'depois da farmácia', en: 'after the pharmacy', fr: 'après la pharmacie', it: 'dopo la farmacia', uk: 'після аптеки', lt: 'po vaistinės', ar: 'بعد الصيدلية' } },
];

// ---------------------------------------------------------------------------
// SIMULAÇÃO DO PERCURSO NO MAPA
// Grade de GRID x GRID cruzamentos. Começa no MEIO do bairro, olhando para o norte.
// ---------------------------------------------------------------------------
// 7x7 cruzamentos = 6x6 quarteirões. Era 5x5, e com o mapa mostrando a cidade
// continuando para todo lado, a borda do bairro virou uma parede invisível: os
// botões apagavam sem nada explicar por quê. Bairro maior, esbarrão mais raro.
export const GRID = 7;

/** Teto do percurso. Dez passos já enchem o cartão fixo, que tem rolagem própria. */
export const MAX_STEPS = 10;

/** Oito direções, de 45 em 45, do norte girando pela direita. */
export const HEADINGS = [
  { dx: 0,  dy: -1 }, // 0 = norte
  { dx: 1,  dy: -1 }, // 1 = nordeste
  { dx: 1,  dy: 0 },  // 2 = leste
  { dx: 1,  dy: 1 },  // 3 = sudeste
  { dx: 0,  dy: 1 },  // 4 = sul
  { dx: -1, dy: 1 },  // 5 = sudoeste
  { dx: -1, dy: 0 },  // 6 = oeste
  { dx: -1, dy: -1 }, // 7 = noroeste
];

/** A rotatória. Os passos de saída só valem parado aqui. */
export const ROTATORIA = { x: 4, y: 3 };

/**
 * A avenida diagonal — a bifurcação.
 *
 * Andar na diagonal só é possível NESTES trechos. É o que separa uma
 * bifurcação de uma esquina: numa esquina você vira 90°, na bifurcação a rua
 * se abre em 45° e continua. Fora destes trechos não há chão diagonal, e o
 * passo se recusa sozinho.
 */
export const DIAGONAIS = [
  { a: { x: 1, y: 5 }, b: { x: 2, y: 4 } },
  { a: { x: 2, y: 4 }, b: { x: 3, y: 3 } },
];

const temDiagonal = (x: number, y: number, nx: number, ny: number) =>
  DIAGONAIS.some((e) =>
    (e.a.x === x && e.a.y === y && e.b.x === nx && e.b.y === ny) ||
    (e.b.x === x && e.b.y === y && e.a.x === nx && e.a.y === ny));

export interface Walker { x: number; y: number; heading: number }
/**
 * No meio do bairro, olhando para o norte.
 *
 * Começava na borda de baixo, e aí metade do mapa era cidade de enfeite: rua
 * desenhada à frente depois de uma meia-volta, e o botão "sigue recto" sumido. O
 * mapa dizia "pode ir" e os botões diziam "não pode". No meio, todos os passos de
 * andar valem no primeiro toque, e a rotatória (um quarteirão à direita) e a
 * bifurcação (que termina aqui) já aparecem no primeiro quadro.
 */
export const START: Walker = { x: (GRID - 1) / 2, y: (GRID - 1) / 2, heading: 0 };

const inBounds = (x: number, y: number) => x >= 0 && x < GRID && y >= 0 && y < GRID;

/** Aplica um passo. Retorna null se sair do mapa. */
/**
 * "Vire à direita" quer dizer *pegue a próxima rua à direita*, não *gire 90°*.
 *
 * Na grade em cruz dá no mesmo e nada muda. Saindo da avenida diagonal, não:
 * 90° a partir de uma diagonal cai no meio de um quarteirão, onde não há rua, e
 * o passo apagava — o fim da diagonal virava beco sem saída. Por isso, depois do
 * giro cheio, tenta-se o mais aberto, que é o que reencontra a grade.
 */
const candidatosDeGiro = (turn: number) =>
  turn === 2 || turn === -2 ? [turn, turn / 2] : [turn];

/**
 * `turn` no retorno é o giro REALMENTE aplicado, que pode não ser o do passo
 * quando entra o de reserva. Quem gira o mapa tem que ler daqui: usando o do
 * passo, o mapa giraria 90° enquanto o caminhante virou 45°.
 */
export const applyStep = (w: Walker, step: DirStep): { next: Walker; path: Walker[]; turn: number } | null => {
  for (const giro of candidatosDeGiro(step.turn)) {
    const r = tentarGiro(w, step, giro);
    if (r) return r;
  }
  return null;
};

const tentarGiro = (w: Walker, step: DirStep, turn: number): { next: Walker; path: Walker[]; turn: number } | null => {
  const heading = (w.heading + turn + 8) % 8;
  const { dx, dy } = HEADINGS[heading];
  const naDiagonal = dx !== 0 && dy !== 0;
  let { x, y } = w;
  const path: Walker[] = [];

  // Na diagonal não basta estar dentro do mapa: é preciso haver rua diagonal
  // ligando os dois cruzamentos.
  const podeAndar = (nx: number, ny: number) =>
    inBounds(nx, ny) && (!naDiagonal || temDiagonal(x, y, nx, ny));

  if (step.forward === 'end') {
    let moved = 0;
    while (podeAndar(x + dx, y + dy)) { x += dx; y += dy; moved++; path.push({ x, y, heading }); }
    if (moved === 0) return null;
  } else {
    for (let i = 0; i < step.forward; i++) {
      if (!podeAndar(x + dx, y + dy)) return null;
      x += dx; y += dy;
      path.push({ x, y, heading });
    }
  }
  return { next: { x, y, heading }, path, turn };
};
