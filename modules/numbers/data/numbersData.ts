
// Módulo "Números" — números por extenso, hora, preço e data.
// Tudo é gerado por regra: poucas listas de palavras cobrem milhares de frases.
// Foco: espanhol da Espanha. uk e ar existem como idiomas de apoio.

import type { LangCode } from '../../location/data/locationData';

export type Text = Record<LangCode, string>;

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
    case 'es': head = t === 1 ? 'mil' : `${below(t)} mil`; break;
    case 'pt': head = t === 1 ? 'mil' : `${below(t)} mil`; break;
    case 'en': head = `${below(t)} thousand`; break;
    case 'fr': head = t === 1 ? 'mille' : `${below(t)} mille`; break;
    case 'it': head = t === 1 ? 'mille' : `${below(t)}mila`; break;
    case 'uk': head = t === 1 ? 'тисяча' : t === 2 ? 'дві тисячі' : t < 5 ? `${below(t)} тисячі` : `${below(t)} тисяч`; break;
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
// PREÇO (em centavos de euro)
// ---------------------------------------------------------------------------
export const buildPrice = (lang: LangCode, totalCents: number): string => {
  const e = Math.floor(totalCents / 100);
  const c = totalCents % 100;

  switch (lang) {
    case 'es': {
      if (e === 0) return `${es1000(c)} céntimos.`;
      const euros = `${e === 1 ? 'un euro' : `${es1000(e)} euros`}`;
      return c ? `${euros} con ${es100(c)}.` : `${euros}.`;
    }
    case 'pt': {
      if (e === 0) return `${pt1000(c)} centavos.`;
      const euros = `${e === 1 ? 'um euro' : `${pt1000(e)} euros`}`;
      return c ? `${euros} e ${pt100(c)}.` : `${euros}.`;
    }
    case 'en': {
      if (e === 0) return `${en1000(c)} cents.`;
      const euros = `${e === 1 ? 'one euro' : `${en1000(e)} euros`}`;
      return c ? `${euros} ${en100(c)}.` : `${euros}.`;
    }
    case 'fr': {
      if (e === 0) return `${fr1000(c)} centimes.`;
      const euros = `${e === 1 ? 'un euro' : `${fr1000(e)} euros`}`;
      return c ? `${euros} ${fr100(c)}.` : `${euros}.`;
    }
    case 'it': {
      if (e === 0) return `${it1000(c)} centesimi.`;
      const euros = e === 1 ? 'un euro' : `${it1000(e)} euro`; // "euro" é invariável
      return c ? `${euros} e ${it100(c)}.` : `${euros}.`;
    }
    case 'uk': {
      if (e === 0) return `${uk1000(c)} центів.`;
      const euros = `${uk1000(e)} євро`;
      return c ? `${euros} ${uk100(c)}.` : `${euros}.`;
    }
    case 'lt': {
      const cents = `${lt1000(c)} ${ltPlural(c, 'centas', 'centai', 'centų')}`;
      if (e === 0) return `${cents}.`;
      const euros = `${lt1000(e)} ${ltPlural(e, 'euras', 'eurai', 'eurų')}`;
      return c ? `${euros} ir ${cents}.` : `${euros}.`;
    }

    default: {
      if (e === 0) return `${ar1000(c)} سنت.`;
      const euros = e === 1 ? 'يورو واحد' : `${ar1000(e)} يورو`;
      return c ? `${euros} و${ar100(c)}.` : `${euros}.`;
    }
  }
};

/**
 * Forma curta, que é como se fala no caixa: "dos con ochenta" (sem dizer "euros").
 * Só existe quando há euros e centavos ao mesmo tempo.
 */
export const buildPriceShort = (lang: LangCode, totalCents: number): string | null => {
  const e = Math.floor(totalCents / 100);
  const c = totalCents % 100;
  if (!e || !c) return null;

  switch (lang) {
    case 'es': return `${es1000(e)} con ${es100(c)}.`;
    case 'pt': return `${pt1000(e)} e ${pt100(c)}.`;
    case 'en': return `${en1000(e)} ${en100(c)}.`;
    case 'fr': return `${fr1000(e)} ${fr100(c)}.`;
    case 'it': return `${it1000(e)} e ${it100(c)}.`;
    case 'uk': return `${uk1000(e)} ${uk100(c)}.`;
    default:   return `${ar1000(e)} و${ar100(c)}.`;
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

/** "4,20 €" para mostrar na etiqueta. */
export const formatPriceTag = (totalCents: number): string =>
  `${Math.floor(totalCents / 100)},${String(totalCents % 100).padStart(2, '0')} €`;

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

/** "el catorce de marzo" — month de 0 a 11. */
export const buildDate = (lang: LangCode, day: number, month: number): string => {
  const M = MONTHS[lang][month];
  switch (lang) {
    case 'es': return `El ${es100(day)} de ${M}.`;
    case 'pt': return `${pt100(day)} de ${M}.`;
    case 'en': return `The ${EN_ORD[day]} of ${M}.`;
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
export const NUM_QUESTIONS: Text[] = [
  { es: '¿Cuánto cuesta?', pt: 'Quanto custa?', en: 'How much is it?', fr: 'Combien ça coûte ?', it: 'Quanto costa?', uk: 'Скільки коштує?', lt: 'Kiek kainuoja?', ar: 'كم الثمن؟' },
  { es: '¿Qué hora es?', pt: 'Que horas são?', en: 'What time is it?', fr: 'Quelle heure est-il ?', it: 'Che ore sono?', uk: 'Котра година?', lt: 'Kelinta valanda?', ar: 'كم الساعة؟' },
  { es: '¿Puede repetirlo más despacio?', pt: 'Pode repetir mais devagar?', en: 'Can you say it more slowly?', fr: 'Pouvez-vous répéter plus lentement ?', it: 'Può ripetere più lentamente?', uk: 'Можете повторити повільніше?', lt: 'Ar galite pakartoti lėčiau?', ar: 'هل يمكنك التكرار ببطء؟' },
  { es: '¿Me lo puede escribir?', pt: 'Pode escrever para mim?', en: 'Can you write it down?', fr: 'Pouvez-vous me l\'écrire ?', it: 'Me lo può scrivere?', uk: 'Можете написати?', lt: 'Ar galite užrašyti?', ar: 'هل يمكنك كتابته؟' },
  { es: '¿A qué hora abren?', pt: 'A que horas abre?', en: 'What time do you open?', fr: 'À quelle heure ouvrez-vous ?', it: 'A che ora aprite?', uk: 'О котрій відкриваєте?', lt: 'Kada atidarote?', ar: 'في أي ساعة تفتحون؟' },
  { es: '¿A qué hora cierran?', pt: 'A que horas fecha?', en: 'What time do you close?', fr: 'À quelle heure fermez-vous ?', it: 'A che ora chiudete?', uk: 'О котрій зачиняєте?', lt: 'Kada uždarote?', ar: 'في أي ساعة تغلقون؟' },
  { es: '¿Aceptan tarjeta?', pt: 'Aceitam cartão?', en: 'Do you take cards?', fr: 'Acceptez-vous la carte ?', it: 'Accettate la carta?', uk: 'Приймаєте картку?', lt: 'Ar priimate korteles?', ar: 'هل تقبلون البطاقة؟' },
  { es: '¿Tiene cambio?', pt: 'Tem troco?', en: 'Do you have change?', fr: 'Avez-vous de la monnaie ?', it: 'Ha da cambiare?', uk: 'У вас є решта?', lt: 'Ar turite grąžos?', ar: 'هل لديك فكة؟' },
];

// Presets rápidos de preço, em centavos.
export const PRICE_PRESETS = [95, 150, 320, 499, 1250, 2000];
