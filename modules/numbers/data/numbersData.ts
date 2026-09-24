
// Módulo "Números" — números por extenso, hora, preço e data.
// Tudo é gerado por regra: poucas listas de palavras cobrem milhares de frases.
// Foco: espanhol da Espanha. uk e ar existem como idiomas de apoio.
//
// A MOEDA SAI DO PAÍS DE DESTINO, não do idioma. Os Estados Unidos são destino
// aberto, e lá o preço é "$4.20", dito "four dollars and twenty cents". Antes o
// módulo inteiro era em euro, e quem escolhia EUA via "4,20 €" e ouvia "four
// euros twenty" — moeda errada na primeira ida ao mercado, e aí ela deixa de
// confiar no resto. `currencyForCountry` é o único lugar que decide isso.

import type { LangCode } from '../../location/data/locationData';

export type Text = Record<LangCode, string>;

/** As abas do módulo. Mora aqui porque as perguntas dizem em que aba aparecem. */
export type NumTab = 'time' | 'price' | 'date' | 'number';

// ---------------------------------------------------------------------------
// NÚMEROS POR EXTENSO
// ---------------------------------------------------------------------------
const ES_U = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
const ES_T = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const ES_H = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

const PT_U = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const PT_T = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const PT_H = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

const EN_U = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_T = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

const FR_U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const FR_T = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

const IT_U = ['zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove'];
const IT_T = ['', '', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta'];

const UK_U = ['нуль', 'один', 'два', 'три', 'чотири', "п'ять", 'шість', 'сім', 'вісім', "дев'ять", 'десять', 'одинадцять', 'дванадцять', 'тринадцять', 'чотирнадцять', "п'ятнадцять", 'шістнадцять', 'сімнадцять', 'вісімнадцять', "дев'ятнадцять"];
const UK_T = ['', '', 'двадцять', 'тридцять', 'сорок', "п'ятдесят", 'шістдесят', 'сімдесят', 'вісімдесят', "дев'яносто"];
const UK_H = ['', 'сто', 'двісті', 'триста', 'чотириста', "п'ятсот", 'шістсот', 'сімсот', 'вісімсот', "дев'ятсот"];

const AR_U = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const AR_T = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const LT_U = ['nulis', 'vienas', 'du', 'trys', 'keturi', 'penki', 'šeši', 'septyni', 'aštuoni', 'devyni', 'dešimt', 'vienuolika', 'dvylika', 'trylika', 'keturiolika', 'penkiolika', 'šešiolika', 'septyniolika', 'aštuoniolika', 'devyniolika'];
const LT_T = ['', '', 'dvidešimt', 'trisdešimt', 'keturiasdešimt', 'penkiasdešimt', 'šešiasdešimt', 'septyniasdešimt', 'aštuoniasdešimt', 'devyniasdešimt'];

const AR_H = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة'];

// --- abaixo de 100 ---
const es100 = (n: number): string => (n < 30 ? ES_U[n] : ES_T[Math.floor(n / 10)] + (n % 10 ? ` y ${ES_U[n % 10]}` : ''));
const pt100 = (n: number): string => (n < 20 ? PT_U[n] : PT_T[Math.floor(n / 10)] + (n % 10 ? ` e ${PT_U[n % 10]}` : ''));
const en100 = (n: number): string => (n < 20 ? EN_U[n] : EN_T[Math.floor(n / 10)] + (n % 10 ? `-${EN_U[n % 10]}` : ''));
const uk100 = (n: number): string => (n < 20 ? UK_U[n] : UK_T[Math.floor(n / 10)] + (n % 10 ? ` ${UK_U[n % 10]}` : ''));
const lt100 = (n: number): string => (n < 20 ? LT_U[n] : LT_T[Math.floor(n / 10)] + (n % 10 ? ` ${LT_U[n % 10]}` : ''));
const ar100 = (n: number): string => (n < 20 ? AR_U[n] : (n % 10 ? `${AR_U[n % 10]} و` : '') + AR_T[Math.floor(n / 10)]);

const fr100 = (n: number): string => {
  if (n < 20) return FR_U[n];
  if (n < 70) {
    const t = Math.floor(n / 10), u = n % 10;
    if (u === 0) return FR_T[t];
    if (u === 1) return `${FR_T[t]} et un`;
    return `${FR_T[t]}-${FR_U[u]}`;
  }
  if (n < 80) {
    const r = n - 60;
    if (r === 0) return 'soixante';
    if (r === 1) return 'soixante et un';
    if (r === 11) return 'soixante et onze';
    return `soixante-${FR_U[r]}`;
  }
  const r = n - 80;
  if (r === 0) return 'quatre-vingts';
  return `quatre-vingt-${FR_U[r]}`;
};

const it100 = (n: number): string => {
  if (n < 20) return IT_U[n];
  const t = IT_T[Math.floor(n / 10)], u = n % 10;
  if (u === 0) return t;
  if (u === 1 || u === 8) return t.slice(0, -1) + IT_U[u]; // ventuno, ventotto
  if (u === 3) return `${t}tré`;                            // ventitré
  return t + IT_U[u];
};

// --- abaixo de 1000 ---
const es1000 = (n: number): string => {
  if (n < 100) return es100(n);
  if (n === 100) return 'cien';
  const h = Math.floor(n / 100), r = n % 100;
  return ES_H[h] + (r ? ` ${es100(r)}` : '');
};
const pt1000 = (n: number): string => {
  if (n < 100) return pt100(n);
  if (n === 100) return 'cem';
  const h = Math.floor(n / 100), r = n % 100;
  return PT_H[h] + (r ? ` e ${pt100(r)}` : '');
};
const en1000 = (n: number): string => {
  if (n < 100) return en100(n);
  const h = Math.floor(n / 100), r = n % 100;
  return `${EN_U[h]} hundred` + (r ? ` and ${en100(r)}` : '');
};
const fr1000 = (n: number): string => {
  if (n < 100) return fr100(n);
  const h = Math.floor(n / 100), r = n % 100;
  const head = h === 1 ? 'cent' : `${FR_U[h]} cent${r ? '' : 's'}`;
  return head + (r ? ` ${fr100(r)}` : '');
};
const it1000 = (n: number): string => {
  if (n < 100) return it100(n);
  const h = Math.floor(n / 100), r = n % 100;
  return (h === 1 ? 'cento' : `${IT_U[h]}cento`) + (r ? it100(r) : '');
};
const uk1000 = (n: number): string => {
  if (n < 100) return uk100(n);
  const h = Math.floor(n / 100), r = n % 100;
  return UK_H[h] + (r ? ` ${uk100(r)}` : '');
};
const ar1000 = (n: number): string => {
  if (n < 100) return ar100(n);
  const h = Math.floor(n / 100), r = n % 100;
  return AR_H[h] + (r ? ` و${ar100(r)}` : '');
};

const lt1000 = (n: number): string => {
  if (n < 100) return lt100(n);
  const h = Math.floor(n / 100), r = n % 100;
  return (h === 1 ? 'šimtas' : `${LT_U[h]} šimtai`) + (r ? ` ${lt100(r)}` : '');
};

/** Lituano flexiona o substantivo contado: 1 euras, 2-9 eurai, 10+ eurų. */
const ltPlural = (n: number, one: string, few: string, many: string): string => {
  const last2 = n % 100, last = n % 10;
  if (last === 1 && last2 !== 11) return one;
  if (last >= 2 && last <= 9 && (last2 < 11 || last2 > 19)) return few;
  return many;
};

/** Ucraniano: 1 → один/одна, 2-4 → few, 5+ e 11-14 → many. */
const ukPlural = (n: number, one: string, few: string, many: string): string => {
  const last2 = n % 100, last = n % 10;
  if (last2 >= 11 && last2 <= 14) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
};

/**
 * Espanhol: "uno" perde o "o" antes de substantivo masculino e de "mil" —
 * "veintiún euros", "treinta y un mil", "un céntimo". Sem isto saía
 * "veintiuno euros", que nenhum caixa diz.
 */
const esApocope = (words: string): string =>
  words.replace(/veintiuno$/, 'veintiún').replace(/(^|\s)uno$/, '$1un');

const BELOW_1000: Record<LangCode, (n: number) => string> = {
  es: es1000, pt: pt1000, en: en1000, fr: fr1000, it: it1000, uk: uk1000, ar: ar1000, lt: lt1000,
};

/** Número por extenso, de 0 a 999.999. */
export const numberToWords = (lang: LangCode, n: number): string => {
  const below = BELOW_1000[lang];
  if (n < 1000) return below(n);

  const t = Math.floor(n / 1000), r = n % 1000;
  let head: string;
  switch (lang) {
    case 'es': head = t === 1 ? 'mil' : `${esApocope(below(t))} mil`; break;
    case 'pt': head = t === 1 ? 'mil' : `${below(t)} mil`; break;
    case 'en': head = `${below(t)} thousand`; break;
    // "quatre-vingt mille", "deux cent mille": o "s" do plural cai antes de "mille".
    case 'fr': head = t === 1 ? 'mille' : `${below(t).replace(/(vingt|cent)s$/, '$1')} mille`; break;
    // "ventunmila", "trentunmila": a dezena terminada em "uno" perde o "o".
    case 'it': head = t === 1 ? 'mille' : `${below(t).replace(/tuno$/, 'tun')}mila`; break;
    case 'uk': {
      // "тисяча" é feminino: 21 000 é "двадцять одна тисяча", 22 000 "двадцять дві тисячі".
      if (t === 1) { head = 'тисяча'; break; }
      const last2 = t % 100;
      const num = last2 >= 11 && last2 <= 19 ? below(t) : below(t).replace(/один$/, 'одна').replace(/два$/, 'дві');
      head = `${num} ${ukPlural(t, 'тисяча', 'тисячі', 'тисяч')}`;
      break;
    }
    case 'lt': head = t === 1 ? 'tūkstantis' : `${below(t)} ${ltPlural(t, 'tūkstantis', 'tūkstančiai', 'tūkstančių')}`; break;
    default:   head = t === 1 ? 'ألف' : t === 2 ? 'ألفان' : `${below(t)} آلاف`; break;
  }
  if (!r) return head;
  // pt liga com "e" só quando o resto é curto ou centena redonda: "mil e cinquenta", "mil duzentos e cinquenta".
  const sep =
    lang === 'ar' ? ' و'
    : lang === 'it' ? ''
    : lang === 'pt' ? (r < 100 || r % 100 === 0 ? ' e ' : ' ')
    : ' ';
  return `${head}${sep}${below(r)}`;
};

// ---------------------------------------------------------------------------
// HORA
// ---------------------------------------------------------------------------
// Formas femininas / ordinais usadas para as horas.
const ES_HOUR = (h: number) => (h === 1 ? 'una' : es100(h));
const PT_HOUR = (h: number) => (h === 1 ? 'uma' : h === 2 ? 'duas' : pt100(h));
const UK_HOUR = ['', 'перша', 'друга', 'третя', 'четверта', "п'ята", 'шоста', 'сьома', 'восьма', "дев'ята", 'десята', 'одинадцята', 'дванадцята'];
const UK_HOUR_ACC = ['', 'першу', 'другу', 'третю', 'четверту', "п'яту", 'шосту', 'сьому', 'восьму', "дев'яту", 'десяту', 'одинадцяту', 'дванадцяту'];
const AR_HOUR = ['', 'الواحدة', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة', 'الحادية عشرة', 'الثانية عشرة'];

const LT_HOUR = ['', 'pirma', 'antra', 'trečia', 'ketvirta', 'penkta', 'šešta', 'septinta', 'aštunta', 'devinta', 'dešimta', 'vienuolikta', 'dvylikta'];

const to12 = (h: number) => (h % 12 === 0 ? 12 : h % 12);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Árabe: 3 a 10 pedem plural quebrado. */
const arMin = (n: number) => (n >= 3 && n <= 10 ? 'دقائق' : 'دقيقة');

/** "Son las tres y media." — h de 0 a 23, m de 0 a 59. */
export const buildTime = (lang: LangCode, h: number, m: number): string => {
  const cur = to12(h);
  const nxt = to12(h + 1);

  switch (lang) {
    case 'es': {
      const p = (x: number) => (x === 1 ? 'Es la' : 'Son las');
      if (m === 0) return `${p(cur)} ${ES_HOUR(cur)} en punto.`;
      if (m === 15) return `${p(cur)} ${ES_HOUR(cur)} y cuarto.`;
      if (m === 30) return `${p(cur)} ${ES_HOUR(cur)} y media.`;
      if (m === 45) return `${p(nxt)} ${ES_HOUR(nxt)} menos cuarto.`;
      if (m < 30) return `${p(cur)} ${ES_HOUR(cur)} y ${es100(m)}.`;
      return `${p(nxt)} ${ES_HOUR(nxt)} menos ${es100(60 - m)}.`;
    }
    case 'pt': {
      const p = (x: number) => (x === 1 ? 'É uma' : `São ${PT_HOUR(x)}`);
      if (m === 0) return `${p(cur)} ${cur === 1 ? 'hora' : 'horas'} em ponto.`;
      if (m === 30) return `${p(cur)} e meia.`;
      if (m < 30) return `${p(cur)} e ${pt100(m)}.`;
      return `São ${pt100(60 - m)} para ${nxt === 1 ? 'a uma' : `as ${PT_HOUR(nxt)}`}.`;
    }
    case 'en': {
      if (m === 0) return `It's ${EN_U[cur] || en100(cur)} o'clock.`;
      if (m === 15) return `It's a quarter past ${en100(cur)}.`;
      if (m === 30) return `It's half past ${en100(cur)}.`;
      if (m === 45) return `It's a quarter to ${en100(nxt)}.`;
      if (m < 30) return `It's ${en100(m)} past ${en100(cur)}.`;
      return `It's ${en100(60 - m)} to ${en100(nxt)}.`;
    }
    case 'fr': {
      const hw = (x: number) => (x === 1 ? 'une heure' : `${fr100(x)} heures`);
      if (m === 0) return `Il est ${hw(cur)}.`;
      if (m === 15) return `Il est ${hw(cur)} et quart.`;
      if (m === 30) return `Il est ${hw(cur)} et demie.`;
      if (m === 45) return `Il est ${hw(nxt)} moins le quart.`;
      if (m < 30) return `Il est ${hw(cur)} ${fr100(m)}.`;
      return `Il est ${hw(nxt)} moins ${fr100(60 - m)}.`;
    }
    case 'it': {
      const p = (x: number) => (x === 1 ? "È l'una" : `Sono le ${it100(x)}`);
      if (m === 0) return `${p(cur)} in punto.`;
      if (m === 15) return `${p(cur)} e un quarto.`;
      if (m === 30) return `${p(cur)} e mezza.`;
      if (m === 45) return `${p(nxt)} meno un quarto.`;
      if (m < 30) return `${p(cur)} e ${it100(m)}.`;
      return `${p(nxt)} meno ${it100(60 - m)}.`;
    }
    case 'uk': {
      if (m === 0) return `${cap(UK_HOUR[cur])} година.`;
      if (m === 15) return `Чверть на ${UK_HOUR_ACC[nxt]}.`;
      if (m === 30) return `Пів на ${UK_HOUR_ACC[nxt]}.`;
      if (m === 45) return `За чверть ${UK_HOUR[nxt]}.`;
      return `${cap(UK_HOUR[cur])} ${uk100(m)}.`;
    }
    case 'lt': {
      if (m === 0) return `${cap(LT_HOUR[cur])} valanda.`;
      return `${cap(LT_HOUR[cur])} valanda ${lt100(m)}.`;
    }

    default: {
      if (m === 0) return `الساعة ${AR_HOUR[cur]}.`;
      if (m === 15) return `${AR_HOUR[cur]} والربع.`;
      if (m === 30) return `${AR_HOUR[cur]} والنصف.`;
      if (m === 45) return `${AR_HOUR[nxt]} إلا ربعًا.`;
      if (m < 30) return `${AR_HOUR[cur]} و${ar100(m)} ${arMin(m)}.`;
      return `${AR_HOUR[nxt]} إلا ${ar100(60 - m)} ${arMin(60 - m)}.`;
    }
  }
};

// ---------------------------------------------------------------------------
// PERÍODO DO DIA
// Na Espanha se escreve em 24 horas (placa, bilhete, horário) mas se fala em
// 12 horas mais o período: "las nueve de la noche", nunca "las veintiuna".
// ---------------------------------------------------------------------------
export interface DayPeriod { key: string; labels: Text; phrases: Text }

export const DAY_PERIODS: DayPeriod[] = [
  {
    key: 'madrugada',
    labels:  { es: 'madrugada', pt: 'madrugada', en: 'night', fr: 'nuit', it: 'notte', uk: 'ніч', ar: 'فجر', lt: 'naktis' },
    phrases: { es: 'de la madrugada', pt: 'da madrugada', en: 'at night', fr: 'du matin', it: 'di notte', uk: 'ночі', ar: 'فجرًا', lt: 'nakties' },
  },
  {
    key: 'manana',
    labels:  { es: 'mañana', pt: 'manhã', en: 'morning', fr: 'matin', it: 'mattina', uk: 'ранок', ar: 'صباح', lt: 'rytas' },
    phrases: { es: 'de la mañana', pt: 'da manhã', en: 'in the morning', fr: 'du matin', it: 'di mattina', uk: 'ранку', ar: 'صباحًا', lt: 'ryto' },
  },
  {
    key: 'tarde',
    labels:  { es: 'tarde', pt: 'tarde', en: 'afternoon', fr: 'après-midi', it: 'pomeriggio', uk: 'день', ar: 'بعد الظهر', lt: 'diena' },
    phrases: { es: 'de la tarde', pt: 'da tarde', en: 'in the afternoon', fr: "de l'après-midi", it: 'di pomeriggio', uk: 'дня', ar: 'بعد الظهر', lt: 'dienos' },
  },
  {
    key: 'noche',
    labels:  { es: 'noche', pt: 'noite', en: 'evening', fr: 'soir', it: 'sera', uk: 'вечір', ar: 'مساء', lt: 'vakaras' },
    phrases: { es: 'de la noche', pt: 'da noite', en: 'in the evening', fr: 'du soir', it: 'di sera', uk: 'вечора', ar: 'مساءً', lt: 'vakaro' },
  },
];

/**
 * O período é deduzido da hora de 24, não escolhido. Assim não existe
 * combinação impossível: às 22 o app diz "de la noche" e ponto.
 */
export const periodFromHour24 = (h24: number): string => {
  if (h24 <= 5) return 'madrugada';
  if (h24 <= 11) return 'manana';
  if (h24 <= 19) return 'tarde';
  return 'noche';
};

/**
 * Estados Unidos e Reino Unido escrevem 8:45 PM; o resto escreve 20:45.
 * É o formato que a pessoa vai ver na placa, no bilhete e no celular.
 */
export const uses12hClock = (countryCode: string): boolean =>
  countryCode === 'us' || countryCode === 'gb';

export const formatClockDisplay = (h24: number, m: number, twelve: boolean): string => {
  const mm = String(m).padStart(2, '0');
  if (twelve) return `${h24 % 12 === 0 ? 12 : h24 % 12}:${mm} ${h24 < 12 ? 'AM' : 'PM'}`;
  return `${String(h24).padStart(2, '0')}:${mm}`;
};

/** Acrescenta o período à frase: "Son las ocho menos cuarto de la tarde." */
export const withPeriod = (sentence: string, periodPhrase: string): string =>
  sentence.replace(/[.．]$/, ` ${periodPhrase}.`);

// ---------------------------------------------------------------------------
// PREÇO (em centavos da moeda do destino)
// ---------------------------------------------------------------------------

/** A moeda do país onde ela está. */
export type Currency = 'eur' | 'usd';

/**
 * O ÚNICO lugar que decide a moeda. Estados Unidos → dólar; Espanha e França,
 * os outros dois destinos abertos → euro.
 *
 * Chile, Argentina e Reino Unido também caem no euro, e para eles isso está
 * ERRADO (peso, peso, libra). Hoje não aparece porque os três estão fechados no
 * recorte do lançamento. Quem abrir um deles precisa ensinar a moeda dele aqui
 * antes — senão volta exatamente o defeito que este arquivo corrigiu nos EUA.
 */
export const currencyForCountry = (countryCode: string): Currency =>
  countryCode === 'us' ? 'usd' : 'eur';

/**
 * Árabe: o substantivo contado muda com o número. 1 e 2 têm forma própria
 * (singular e dual), 3 a 10 pedem plural, 11 a 99 pedem singular acusativo, e
 * as centenas redondas voltam ao singular — "مئة دولار".
 */
const arCounted = (
  n: number,
  w: { one: string; two: string; few: string; acc: string; bare: string },
): string => {
  if (n === 1) return w.one;
  if (n === 2) return w.two;
  const num = numberToWords('ar', n);
  const last2 = n % 100;
  if (last2 >= 3 && last2 <= 10) return `${num} ${w.few}`;
  if (last2 >= 11) return `${num} ${w.acc}`;
  return `${num} ${w.bare}`;
};
const AR_CENT = { one: 'سنت واحد', two: 'سنتان', few: 'سنتات', acc: 'سنتًا', bare: 'سنت' };
const AR_DOLLAR = { one: 'دولار واحد', two: 'دولاران', few: 'دولارات', acc: 'دولارًا', bare: 'دولار' };

/**
 * O preço por extenso. `totalCents` vai até 999.999 (9.999,99), e por isso a
 * parte inteira passa por `numberToWords`: os `*1000` só sabem até 999, e o
 * espanhol dizia "undefined cincuenta euros" para 1.250,00.
 *
 * A moeda é opcional e o padrão é o euro, que é o que o módulo sempre foi.
 * Com o euro o registro é o do caixa ("cuatro euros con veinte"); com o dólar
 * vem inteiro ("four dollars and twenty cents"), que é como se diz nos EUA.
 */
export const buildPrice = (lang: LangCode, totalCents: number, currency: Currency = 'eur'): string => {
  const e = Math.floor(totalCents / 100);
  const c = totalCents % 100;
  const usd = currency === 'usd';

  switch (lang) {
    case 'es': {
      // "céntimo" é o do euro na Espanha; o do dólar é "centavo". A apócope vale
      // aqui também, porque vem substantivo depois: "veintiún céntimos".
      const sub = c === 1 ? `un ${usd ? 'centavo' : 'céntimo'}` : `${esApocope(es100(c))} ${usd ? 'centavos' : 'céntimos'}`;
      if (e === 0) return `${sub}.`;
      // Apócope: "veintiún euros", "treinta y un dólares", nunca "veintiuno euros".
      const main = e === 1 ? `un ${usd ? 'dólar' : 'euro'}` : `${esApocope(numberToWords('es', e))} ${usd ? 'dólares' : 'euros'}`;
      if (!c) return `${main}.`;
      return usd ? `${main} con ${sub}.` : `${main} con ${es100(c)}.`;
    }
    case 'pt': {
      const sub = c === 1 ? 'um centavo' : `${pt100(c)} centavos`;
      if (e === 0) return `${sub}.`;
      const main = e === 1 ? `um ${usd ? 'dólar' : 'euro'}` : `${numberToWords('pt', e)} ${usd ? 'dólares' : 'euros'}`;
      if (!c) return `${main}.`;
      return usd ? `${main} e ${sub}.` : `${main} e ${pt100(c)}.`;
    }
    case 'en': {
      const sub = c === 1 ? 'one cent' : `${en100(c)} cents`;
      if (e === 0) return `${sub}.`;
      const main = e === 1 ? `one ${usd ? 'dollar' : 'euro'}` : `${numberToWords('en', e)} ${usd ? 'dollars' : 'euros'}`;
      if (!c) return `${main}.`;
      return usd ? `${main} and ${sub}.` : `${main} ${en100(c)}.`;
    }
    case 'fr': {
      const sub = c === 1 ? `un ${usd ? 'cent' : 'centime'}` : `${fr100(c)} ${usd ? 'cents' : 'centimes'}`;
      if (e === 0) return `${sub}.`;
      const main = e === 1 ? `un ${usd ? 'dollar' : 'euro'}` : `${numberToWords('fr', e)} ${usd ? 'dollars' : 'euros'}`;
      return c ? `${main} ${fr100(c)}.` : `${main}.`;
    }
    case 'it': {
      const sub = c === 1 ? 'un centesimo' : `${it100(c)} centesimi`;
      if (e === 0) return `${sub}.`;
      // "euro" é invariável; "dollaro" não.
      const main = e === 1 ? `un ${usd ? 'dollaro' : 'euro'}` : `${numberToWords('it', e)} ${usd ? 'dollari' : 'euro'}`;
      if (!c) return `${main}.`;
      return usd ? `${main} e ${sub}.` : `${main} e ${it100(c)}.`;
    }
    case 'uk': {
      const sub = `${uk100(c)} ${ukPlural(c, 'цент', 'центи', 'центів')}`;
      if (e === 0) return `${sub}.`;
      // "євро" é invariável; "долар" flexiona como o numeral pede.
      const num = numberToWords('uk', e);
      const main = usd ? `${num} ${ukPlural(e, 'долар', 'долари', 'доларів')}` : `${num} євро`;
      if (!c) return `${main}.`;
      return usd ? `${main} ${sub}.` : `${main} ${uk100(c)}.`;
    }
    case 'lt': {
      const sub = `${lt100(c)} ${ltPlural(c, 'centas', 'centai', 'centų')}`;
      if (e === 0) return `${sub}.`;
      const unit = usd ? ltPlural(e, 'doleris', 'doleriai', 'dolerių') : ltPlural(e, 'euras', 'eurai', 'eurų');
      const main = `${numberToWords('lt', e)} ${unit}`;
      return c ? `${main} ir ${sub}.` : `${main}.`;
    }

    default: {
      const sub = arCounted(c, AR_CENT);
      if (e === 0) return `${sub}.`;
      // "يورو" é empréstimo invariável; "دولار" segue a regra do numeral.
      const main = usd ? arCounted(e, AR_DOLLAR) : e === 1 ? 'يورو واحد' : `${numberToWords('ar', e)} يورو`;
      if (!c) return `${main}.`;
      return usd ? `${main} و${sub}.` : `${main} و${ar100(c)}.`;
    }
  }
};

/**
 * Forma curta, que é como se fala no caixa: "dos con ochenta" (sem dizer "euros").
 * Só existe quando há a parte inteira e os centavos ao mesmo tempo.
 *
 * O FRANCÊS NÃO TEM FORMA CURTA, e devolve a forma inteira de propósito. Tirar a
 * moeda de "quatre euros vingt" deixa "quatre vingt", que no ouvido é
 * "quatre-vingts" — oitenta. No caixa francês a moeda fica na frase justamente
 * por isso. O módulo esconde a linha quando ela repete a frase de cima.
 */
export const buildPriceShort = (lang: LangCode, totalCents: number, currency: Currency = 'eur'): string | null => {
  const e = Math.floor(totalCents / 100);
  const c = totalCents % 100;
  if (!e || !c) return null;

  switch (lang) {
    case 'es': return `${numberToWords('es', e)} con ${es100(c)}.`;
    case 'pt': return `${numberToWords('pt', e)} e ${pt100(c)}.`;
    // "four oh five": abaixo de dez, o inglês fala o zero.
    case 'en': return `${numberToWords('en', e)} ${c < 10 ? `oh ${EN_U[c]}` : en100(c)}.`;
    case 'fr': return buildPrice('fr', totalCents, currency);
    case 'it': return `${numberToWords('it', e)} e ${it100(c)}.`;
    case 'uk': return `${numberToWords('uk', e)} ${uk100(c)}.`;
    // Sem este `case` o lituano caía no `default:`, que é árabe. A conjunção é
    // "ir", a mesma que `buildPrice` já usa para lituano.
    case 'lt': return `${numberToWords('lt', e)} ir ${lt100(c)}.`;
    default:   return `${numberToWords('ar', e)} و${ar100(c)}.`;
  }
};

/** Palavra da vírgula decimal. */
export const DECIMAL_WORD: Text = {
  es: 'coma', pt: 'vírgula', en: 'point', fr: 'virgule', it: 'virgola', uk: 'кома', lt: 'kablelis', ar: 'فاصلة',
};

/**
 * Número decimal por extenso: "dos coma ochenta".
 * Com zero à esquerda lê dígito a dígito ("cero cinco"), que é como se diz.
 */
export const buildDecimal = (lang: LangCode, intPart: number, dec: string): string => {
  const intWords = numberToWords(lang, intPart);
  if (!dec) return `${intWords}.`;

  const decWords =
    dec[0] === '0'
      ? dec.split('').map((d) => numberToWords(lang, Number(d))).join(' ')
      : numberToWords(lang, Number(dec));

  return `${intWords} ${DECIMAL_WORD[lang]} ${decWords}.`;
};

/** "4,20 €" ou "$4.20" para mostrar na etiqueta, como está escrito no país. */
export const formatPriceTag = (totalCents: number, currency: Currency = 'eur'): string => {
  const int = Math.floor(totalCents / 100);
  const cc = String(totalCents % 100).padStart(2, '0');
  return currency === 'usd' ? `$${int}.${cc}` : `${int},${cc} €`;
};

/**
 * O separador decimal escrito no país: ponto nos EUA e no Reino Unido, vírgula
 * no resto. O módulo guarda o número sempre com vírgula ("37,5") e só troca na
 * hora de mostrar — a mesma tela que escreve "$4.20" não pode escrever "37,5".
 */
export const decimalSeparatorFor = (countryCode: string): ',' | '.' =>
  countryCode === 'us' || countryCode === 'gb' ? '.' : ',';

// ---------------------------------------------------------------------------
// NÚMERO SOLTO — exemplos com a situação escrita
// ---------------------------------------------------------------------------
// A aba "Número" abria com "21" e um teclado, sem dizer para que serve. Hora,
// preço e data têm uma situação óbvia; número solto não. Cada exemplo diz
// ONDE aquele número aparece na vida dela. O rótulo vai na língua de quem lê.
export interface NumberExample {
  /** Como o módulo guarda: sempre com vírgula. */
  value: string;
  label: Text;
}

const FEBRE: Text = { es: 'fiebre', pt: 'febre', en: 'fever', fr: 'fièvre', it: 'febbre', uk: 'температура', ar: 'حرارة', lt: 'temperatūra' };
// "1,5 litro": em português, fração abaixo de dois fica no singular.
const LITRO: NumberExample = { value: '1,5', label: { es: 'litros', pt: 'litro', en: 'liters', fr: 'litre', it: 'litri', uk: 'літра', ar: 'لتر', lt: 'litro' } };

/** Os exemplos do sistema métrico, com a febre em graus Celsius. */
export const NUMBER_EXAMPLES: NumberExample[] = [
  { value: '37,5', label: FEBRE },
  { value: '250', label: { es: 'gramos', pt: 'gramas', en: 'grams', fr: 'grammes', it: 'grammi', uk: 'грамів', ar: 'غرام', lt: 'gramų' } },
  LITRO,
];

/**
 * Nos EUA, a febre é em Fahrenheit e o balcão pesa em onças. Quem dissesse
 * "thirty-seven point five" ao farmacêutico americano para falar de febre não
 * seria entendida: lá 37,5 °C é 99.5. O litro fica — garrafa de água e de
 * refrigerante se vende em litro também nos EUA.
 */
export const NUMBER_EXAMPLES_US: NumberExample[] = [
  { value: '99,5', label: FEBRE },
  // 8: plural em todas. uk "унцій" (5 ou mais pede genitivo plural), lt
  // "uncijos" (2 a 9 pedem nominativo plural), ar "أونصات" (3 a 10, plural).
  { value: '8', label: { es: 'onzas', pt: 'onças', en: 'ounces', fr: 'onces', it: 'once', uk: 'унцій', ar: 'أونصات', lt: 'uncijos' } },
  LITRO,
];

/**
 * Os exemplos do país onde ela está. Mesmo critério de `currencyForCountry`:
 * só os EUA fogem do métrico entre os destinos abertos. O Reino Unido, fechado
 * no recorte, pesa em gramas e mede febre em Celsius, e fica no padrão.
 */
export const numberExamplesFor = (countryCode: string): NumberExample[] =>
  countryCode === 'us' ? NUMBER_EXAMPLES_US : NUMBER_EXAMPLES;

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------
export const MONTHS: Record<LangCode, string[]> = {
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
  uk: ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'],
  lt: ['sausio', 'vasario', 'kovo', 'balandžio', 'gegužės', 'birželio', 'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio'], ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};

const EN_ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth', 'thirtieth', 'thirty-first'];

/**
 * "El catorce de marzo."
 *
 * @param day   dia do mês, base 1
 * @param month índice do mês, **base ZERO** — igual a `Date.prototype.getMonth()`,
 *              que é de onde o módulo tira o valor. Passar 12 devolve `undefined`.
 * @param countryCode opcional, o país de destino. Só muda o inglês: nos EUA se
 *              diz "September twenty-third", e "the twenty-third of September"
 *              é o jeito britânico. Os EUA são destino aberto.
 */
export const buildDate = (lang: LangCode, day: number, month: number, countryCode?: string): string => {
  const M = MONTHS[lang][month];
  switch (lang) {
    case 'es': return `El ${es100(day)} de ${M}.`;
    case 'pt': return `${pt100(day)} de ${M}.`;
    case 'en': return countryCode === 'us' ? `${M} ${EN_ORD[day]}.` : `The ${EN_ORD[day]} of ${M}.`;
    case 'fr': return `Le ${day === 1 ? 'premier' : fr100(day)} ${M}.`;
    case 'it': return `Il ${day === 1 ? 'primo' : it100(day)} ${M}.`;
    case 'uk': return `${day} ${M}.`;
    case 'lt': return `${M} ${day} d.`;
    default:   return `${day} ${M}.`;
  }
};

// ---------------------------------------------------------------------------
// PERGUNTAS ÚTEIS
// ---------------------------------------------------------------------------
// Cada pergunta diz em que aba aparece. Antes a lista era a mesma nas quatro, e
// a aba Data oferecia "¿Aceptan tarjeta?" e "¿Tiene cambio?".
//
// A ORDEM É A DA TELA. As duas primeiras valem em toda aba e vêm no topo de
// propósito: são as que salvam no caixa quando ela não entende o número.
export interface NumQuestion {
  key: string;
  tabs: NumTab[];
  text: Text;
}

const EM_TODAS: NumTab[] = ['time', 'price', 'date', 'number'];

export const NUM_QUESTIONS: NumQuestion[] = [
  { key: 'repeatSlowly', tabs: EM_TODAS, text: { es: '¿Puede repetirlo más despacio?', pt: 'Pode repetir mais devagar?', en: 'Can you say it more slowly?', fr: 'Pouvez-vous répéter plus lentement ?', it: 'Può ripetere più lentamente?', uk: 'Можете повторити повільніше?', lt: 'Ar galite pakartoti lėčiau?', ar: 'هل يمكنك التكرار ببطء؟' } },
  { key: 'writeDown', tabs: EM_TODAS, text: { es: '¿Me lo puede escribir?', pt: 'Pode escrever para mim?', en: 'Can you write it down?', fr: 'Pouvez-vous me l\'écrire ?', it: 'Me lo può scrivere?', uk: 'Можете написати?', lt: 'Ar galite užrašyti?', ar: 'هل يمكنك كتابته؟' } },
  { key: 'whatTime', tabs: ['time'], text: { es: '¿Qué hora es?', pt: 'Que horas são?', en: 'What time is it?', fr: 'Quelle heure est-il ?', it: 'Che ore sono?', uk: 'Котра година?', lt: 'Kelinta valanda?', ar: 'كم الساعة؟' } },
  { key: 'whenOpen', tabs: ['time'], text: { es: '¿A qué hora abren?', pt: 'A que horas abre?', en: 'What time do you open?', fr: 'À quelle heure ouvrez-vous ?', it: 'A che ora aprite?', uk: 'О котрій відкриваєте?', lt: 'Kada atidarote?', ar: 'في أي ساعة تفتحون؟' } },
  { key: 'whenClose', tabs: ['time'], text: { es: '¿A qué hora cierran?', pt: 'A que horas fecha?', en: 'What time do you close?', fr: 'À quelle heure fermez-vous ?', it: 'A che ora chiudete?', uk: 'О котрій зачиняєте?', lt: 'Kada uždarote?', ar: 'في أي ساعة تغلقون؟' } },
  { key: 'howMuch', tabs: ['price'], text: { es: '¿Cuánto cuesta?', pt: 'Quanto custa?', en: 'How much is it?', fr: 'Combien ça coûte ?', it: 'Quanto costa?', uk: 'Скільки коштує?', lt: 'Kiek kainuoja?', ar: 'كم الثمن؟' } },
  { key: 'card', tabs: ['price'], text: { es: '¿Aceptan tarjeta?', pt: 'Aceitam cartão?', en: 'Do you take cards?', fr: 'Acceptez-vous la carte ?', it: 'Accettate la carta?', uk: 'Приймаєте картку?', lt: 'Ar priimate korteles?', ar: 'هل تقبلون البطاقة؟' } },
  { key: 'change', tabs: ['price'], text: { es: '¿Tiene cambio?', pt: 'Tem troco?', en: 'Do you have change?', fr: 'Avez-vous de la monnaie ?', it: 'Ha da cambiare?', uk: 'У вас є решта?', lt: 'Ar turite grąžos?', ar: 'هل لديك فكة؟' } },
  { key: 'whatDate', tabs: ['date'], text: { es: '¿Qué día es hoy?', pt: 'Que dia é hoje?', en: "What's the date today?", fr: 'Quelle est la date aujourd\'hui ?', it: 'Che giorno è oggi?', uk: 'Яке сьогодні число?', lt: 'Kokia šiandien data?', ar: 'ما تاريخ اليوم؟' } },
  // Marcar médico, combinar com a patroa: é aqui que a data aparece na vida dela.
  { key: 'whichDay', tabs: ['date'], text: { es: '¿Para qué día?', pt: 'Para que dia?', en: 'For which day?', fr: 'Pour quel jour ?', it: 'Per che giorno?', uk: 'На який день?', lt: 'Kuriai dienai?', ar: 'لأي يوم؟' } },
  // A aba Número não tem pergunta própria: "¿Cuántos?" / "¿Cuántas?" concorda
  // com a coisa contada, que a aba não conhece. Fica só com as duas de socorro.
];

/** As perguntas de uma aba, na ordem da tela. */
export const questionsFor = (tab: NumTab): NumQuestion[] =>
  NUM_QUESTIONS.filter((q) => q.tabs.includes(tab));

/** Chave inexistente estoura, em vez de abrir a tela com um buraco. */
export const numQuestionByKey = (key: string): NumQuestion => {
  const q = NUM_QUESTIONS.find((x) => x.key === key);
  if (!q) throw new Error(`Pergunta desconhecida: ${key}`);
  return q;
};

// Presets rápidos de preço, em centavos. Servem às duas moedas: "$4.99" e
// "4,99 €" são preços de prateleira nos dois lados.
export const PRICE_PRESETS = [95, 150, 320, 499, 1250, 2000];
