
// Módulo "Direções" — instruções de rua, bússola, perguntas e vocabulário.
// Foco: Espanha (manzana, gira, sigue recto, coge la primera...).
// Os demais idiomas de destino existem para o app não quebrar ao trocar o destino.
// Ucraniano (uk) e árabe (ar) são idiomas de origem: aparecem como apoio, em letra pequena.

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
  turn: 0 | 1 | -1 | 2;
  forward: number | 'end';
  arrive?: boolean;
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
    key: 'right', icon: '↪️', turn: 1, forward: 1,
    labels:  { es: 'a la derecha', pt: 'à direita', en: 'turn right', fr: 'à droite', it: 'a destra', uk: 'праворуч', lt: 'į dešinę', ar: 'إلى اليمين' },
    phrases: { es: 'En la esquina, gira a la derecha.', pt: 'Na esquina, vire à direita.', en: 'At the corner, turn right.', fr: 'Au coin, tournez à droite.', it: "All'angolo, gira a destra.", uk: 'На розі поверніть праворуч.', lt: 'Kampe pasukite į dešinę.', ar: 'عند الزاوية، انعطف يمينًا.' },
  },
  {
    key: 'left', icon: '↩️', turn: -1, forward: 1,
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
    key: 'back', icon: '🔄', turn: 2, forward: 0,
    labels:  { es: 'da la vuelta', pt: 'dê a volta', en: 'turn around', fr: 'demi-tour', it: 'torna indietro', uk: 'розверніться', lt: 'apsisukite', ar: 'ارجع' },
    phrases: { es: 'Da la vuelta.', pt: 'Dê a volta.', en: 'Turn around.', fr: 'Faites demi-tour.', it: 'Torna indietro.', uk: 'Розверніться.', lt: 'Apsisukite.', ar: 'ارجع إلى الخلف.' },
  },
  {
    key: 'arrive', icon: '📍', turn: 0, forward: 0, arrive: true,
    labels:  { es: 'has llegado', pt: 'chegou', en: 'arrived', fr: 'arrivé', it: 'arrivato', uk: 'прибули', lt: 'atvykote', ar: 'وصلت' },
    phrases: { es: 'Ya has llegado. Está justo ahí.', pt: 'Você chegou. É bem ali.', en: "You have arrived. It's right there.", fr: "Vous êtes arrivé. C'est juste là.", it: 'Sei arrivato. È proprio lì.', uk: 'Ви прибули. Це прямо тут.', lt: 'Jūs atvykote. Tai čia pat.', ar: 'لقد وصلت. إنه هنا تمامًا.' },
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
// PERGUNTAS ÚTEIS
// ---------------------------------------------------------------------------
export const DIR_QUESTIONS: Text[] = [
  { es: '¿Cómo llego a la estación?', pt: 'Como chego à estação?', en: 'How do I get to the station?', fr: 'Comment aller à la gare ?', it: 'Come arrivo alla stazione?', uk: 'Як дійти до вокзалу?', lt: 'Kaip nueiti į stotį?', ar: 'كيف أصل إلى المحطة؟' },
  { es: '¿Está lejos?', pt: 'É longe?', en: 'Is it far?', fr: "C'est loin ?", it: 'È lontano?', uk: 'Це далеко?', lt: 'Ar toli?', ar: 'هل هو بعيد؟' },
  { es: '¿Se puede ir andando?', pt: 'Dá para ir a pé?', en: 'Can I walk there?', fr: 'On peut y aller à pied ?', it: 'Si può andare a piedi?', uk: 'Можна дійти пішки?', lt: 'Ar galima nueiti pėsčiomis?', ar: 'هل يمكن الذهاب مشيًا؟' },
  { es: '¿Cuánto se tarda?', pt: 'Quanto tempo leva?', en: 'How long does it take?', fr: 'Ça prend combien de temps ?', it: 'Quanto ci vuole?', uk: 'Скільки часу це займе?', lt: 'Kiek užtrunka?', ar: 'كم يستغرق الوقت؟' },
  { es: '¿Dónde está la parada de autobús?', pt: 'Onde fica o ponto de ônibus?', en: 'Where is the bus stop?', fr: "Où est l'arrêt de bus ?", it: "Dov'è la fermata dell'autobus?", uk: 'Де автобусна зупинка?', lt: 'Kur yra autobusų stotelė?', ar: 'أين موقف الحافلة؟' },
  { es: '¿Me lo puede señalar en el mapa?', pt: 'Pode me mostrar no mapa?', en: 'Can you show me on the map?', fr: 'Pouvez-vous me montrer sur la carte ?', it: 'Me lo può indicare sulla mappa?', uk: 'Можете показати на карті?', lt: 'Ar galite parodyti žemėlapyje?', ar: 'هل يمكنك أن تريني على الخريطة؟' },
  { es: '¿Puede repetir, por favor?', pt: 'Pode repetir, por favor?', en: 'Can you repeat, please?', fr: "Pouvez-vous répéter, s'il vous plaît ?", it: 'Può ripetere, per favore?', uk: 'Повторіть, будь ласка.', lt: 'Pakartokite, prašau.', ar: 'هل يمكنك التكرار من فضلك؟' },
  { es: 'Estoy perdido.', pt: 'Estou perdido.', en: 'I am lost.', fr: 'Je suis perdu.', it: 'Mi sono perso.', uk: 'Я заблукав.', lt: 'Aš pasiklydau.', ar: 'لقد ضللت الطريق.' },
];

// ---------------------------------------------------------------------------
// VOCABULÁRIO DA RUA
// ---------------------------------------------------------------------------
export interface Vocab { emoji: string; names: Text }

export const DIR_PLACES: Vocab[] = [
  { emoji: '🏢', names: { es: 'la esquina', pt: 'a esquina', en: 'the corner', fr: 'le coin', it: "l'angolo", uk: 'ріг', lt: 'kampas', ar: 'الزاوية' } },
  { emoji: '🏘️', names: { es: 'la manzana', pt: 'o quarteirão', en: 'the block', fr: 'le pâté de maisons', it: "l'isolato", uk: 'квартал', lt: 'kvartalas', ar: 'المربع السكني' } },
  { emoji: '🚦', names: { es: 'el semáforo', pt: 'o semáforo', en: 'the traffic light', fr: 'le feu', it: 'il semaforo', uk: 'світлофор', lt: 'šviesoforas', ar: 'إشارة المرور' } },
  { emoji: '🔄', names: { es: 'la rotonda', pt: 'a rotatória', en: 'the roundabout', fr: 'le rond-point', it: 'la rotonda', uk: "кільцева розв'язка", lt: 'žiedinė sankryža', ar: 'الدوار' } },
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
// Grade de GRID x GRID cruzamentos. Começa embaixo, no meio, olhando para o norte.
// ---------------------------------------------------------------------------
// 7x7 cruzamentos = 6x6 quarteirões. Era 5x5, e com o mapa mostrando a cidade
// continuando para todo lado, a borda do bairro virou uma parede invisível: os
// botões apagavam sem nada explicar por quê. Bairro maior, esbarrão mais raro.
export const GRID = 7;
export const HEADINGS = [
  { dx: 0, dy: -1 }, // 0 = norte
  { dx: 1, dy: 0 },  // 1 = leste
  { dx: 0, dy: 1 },  // 2 = sul
  { dx: -1, dy: 0 }, // 3 = oeste
];

export interface Walker { x: number; y: number; heading: number }
// Embaixo, no meio da largura, olhando para o norte.
export const START: Walker = { x: (GRID - 1) / 2, y: GRID - 1, heading: 0 };

const inBounds = (x: number, y: number) => x >= 0 && x < GRID && y >= 0 && y < GRID;

/** Aplica um passo. Retorna null se sair do mapa. */
export const applyStep = (w: Walker, step: DirStep): { next: Walker; path: Walker[] } | null => {
  const heading = (w.heading + step.turn + 4) % 4;
  const { dx, dy } = HEADINGS[heading];
  let { x, y } = w;
  const path: Walker[] = [];

  if (step.forward === 'end') {
    let moved = 0;
    while (inBounds(x + dx, y + dy)) { x += dx; y += dy; moved++; path.push({ x, y, heading }); }
    if (moved === 0) return null;
  } else {
    for (let i = 0; i < step.forward; i++) {
      if (!inBounds(x + dx, y + dy)) return null;
      x += dx; y += dy;
      path.push({ x, y, heading });
    }
  }
  return { next: { x, y, heading }, path };
};
