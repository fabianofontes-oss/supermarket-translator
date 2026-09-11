
// Módulo "Maquiagem" — comprar cosmético e reconhecer acessório numa perfumaria.
//
// FRONTEIRA DESTE ARQUIVO, para ninguém responder a mesma pergunta duas vezes:
//   • aqui  → produto de maquiagem (base, batom, rímel…) e acessório (pincel, pinça…)
//   • farmácia (`pharmacy/data/cosmeticsData.ts`) → skincare: acne, hidratação, protetor solar
//   • supermercado (`supermarket/data/hygieneData.ts`) → já é dono de "Demaquilante"
//   • salão e serviço (corte, sobrancelha, unha) estão FORA do escopo
//
// O substantivo é a parte fácil: "batom" → "labial" é dicionário. O que trava na
// loja é a especificação — tom, subtom, cobertura, acabamento, tipo de pele — e é
// isso que o módulo monta. O mesmo vale do outro lado: o que trava é não saber que
// pincel, brocha e escova são três palavras diferentes em espanhol.
//
// ⚠️ CONTEÚDO NÃO REVISADO POR FALANTE NATIVO. Vale o mesmo alerta da seção 10 do
// AGENTS.md: as equivalências foram escritas por IA. O par que importa é es-ES ×
// pt-BR, e os pontos de maior risco são `colorete`, `pintalabios`, `unos polvos`,
// `brocha` vs `pincel`, `bastoncillos`, `neceser` e `diadema`.

import type { LangCode } from '../../location/data/locationData';

export type Text = Record<LangCode, string>;

// ---------------------------------------------------------------------------
// CONCORDÂNCIA
// ---------------------------------------------------------------------------
// Só UMA dimensão tem adjetivo que concorda com o produto: `color`. Todas as
// outras são sintagmas fechados, com gênero próprio e fixo ("de tono claro",
// "de cobertura media", "para piel grasa"), e por isso não concordam com nada.
//
// As formas são escritas à mão, nunca derivadas por regra: `rosa` é invariável em
// gênero E em número no espanhol (`unos polvos rosa`), `marrón` flexiona só no
// plural (`marrones`), `nude` e `coral` são invariáveis, e o francês tem
// `clair/claire` mas `marron` totalmente invariável. Uma regra que acerte esses
// casos é maior e mais frágil que a tabela.

/** Casa em que o adjetivo entra. Plural existe porque `unos polvos` é plural. */
export type AgreeSlot = 'm' | 'f' | 'mpl' | 'fpl';

/** String = invariável naquele idioma. Objeto = as quatro formas. */
export type Agreed = Record<LangCode, string | { m: string; f: string; mpl: string; fpl: string }>;

// ---------------------------------------------------------------------------
// PRODUTOS
// ---------------------------------------------------------------------------
// CONVENÇÃO DE CASO em `orders`, e ela DIVERGE do módulo Café — leia antes de copiar:
//   • uk → ACUSATIVO      ("Шукаю" rege acusativo)
//   • lt → GENITIVO       ("Ieškau" rege genitivo, NÃO acusativo como "norėti")
//   • ar → INDEFINIDO, sem o artigo "ال". É o OPOSTO de `locationData.ts`, onde o
//          artigo vem colado. Há teste trancando isto.

export type DimKey =
  | 'depth' | 'undertone' | 'color' | 'coverage' | 'finish' | 'skin' | 'effect' | 'form' | 'lasting';

export interface Product {
  key: string;
  /** Qual figura em SVG desenha este produto. */
  figure: 'face' | 'lips' | 'eye' | 'nail';
  /** Dimensões que este produto aceita, NA ORDEM em que entram na frase. */
  dims: DimKey[];
  names: Text;
  /** Já com artigo e caso prontos. Ver a convenção acima. */
  orders: Text;
  /** Slot que o adjetivo de `color` usa. O gênero muda de idioma para idioma. */
  agree: Record<LangCode, AgreeSlot>;
  descs: Text;
}

export const MAKEUP_PRODUCTS: Product[] = [
  {
    key: 'base', figure: 'face',
    dims: ['depth', 'undertone', 'coverage', 'finish', 'skin'],
    names: { es: 'la base de maquillaje', pt: 'a base', en: 'foundation', fr: 'le fond de teint', it: 'il fondotinta', uk: 'тональний крем', lt: 'makiažo pagrindas', ar: 'كريم أساس' },
    orders: { es: 'una base de maquillaje', pt: 'uma base', en: 'a foundation', fr: 'un fond de teint', it: 'un fondotinta', uk: 'тональний крем', lt: 'makiažo pagrindo', ar: 'كريم أساس' },
    agree: { es: 'f', pt: 'f', en: 'm', fr: 'm', it: 'm', uk: 'm', lt: 'm', ar: 'm' },
    descs: { es: 'Unifica el tono de la piel. Se elige por tono y subtono.', pt: 'Uniformiza a pele. Escolhe-se por tom e subtom — é o produto mais difícil de acertar sem testar.', en: 'Evens out skin tone. Chosen by shade and undertone.', fr: 'Unifie le teint. Se choisit par teinte et sous-ton.', it: 'Uniforma il colorito. Si sceglie per tonalità e sottotono.', uk: 'Вирівнює тон шкіри. Підбирається за відтінком і підтоном.', lt: 'Išlygina odos toną. Renkamas pagal atspalvį ir potonį.', ar: 'يوحّد لون البشرة. يُختار حسب الدرجة ودرجة الأساس.' },
  },
  {
    key: 'corrector', figure: 'face',
    dims: ['depth', 'undertone', 'coverage'],
    names: { es: 'el corrector', pt: 'o corretivo', en: 'concealer', fr: 'le correcteur', it: 'il correttore', uk: 'коректор', lt: 'maskuoklis', ar: 'خافي عيوب' },
    orders: { es: 'un corrector', pt: 'um corretivo', en: 'a concealer', fr: 'un correcteur', it: 'un correttore', uk: 'коректор', lt: 'maskuoklio', ar: 'خافي عيوب' },
    agree: { es: 'm', pt: 'm', en: 'm', fr: 'm', it: 'm', uk: 'm', lt: 'm', ar: 'm' },
    descs: { es: 'Tapa ojeras y marcas. Suele ir un tono más claro que la base.', pt: 'Cobre olheiras e marcas. Costuma ser um tom mais claro que a base.', en: 'Covers dark circles and marks. Usually one shade lighter than foundation.', fr: 'Couvre les cernes et les marques. Souvent un ton plus clair que le fond de teint.', it: 'Copre occhiaie e segni. Di solito un tono più chiaro del fondotinta.', uk: 'Приховує синці під очима й плями. Зазвичай на тон світліший за тональний крем.', lt: 'Slepia paakių ratilus ir dėmes. Paprastai vienu tonu šviesesnis už pagrindą.', ar: 'يغطي الهالات والعلامات. عادة أفتح بدرجة من كريم الأساس.' },
  },
  {
    key: 'polvo', figure: 'face',
    dims: ['depth', 'undertone', 'finish', 'skin'],
    names: { es: 'los polvos compactos', pt: 'o pó compacto', en: 'compact powder', fr: 'la poudre compacte', it: 'la cipria compatta', uk: 'компактна пудра', lt: 'kompaktinė pudra', ar: 'بودرة مضغوطة' },
    orders: { es: 'unos polvos compactos', pt: 'um pó compacto', en: 'a compact powder', fr: 'une poudre compacte', it: 'una cipria compatta', uk: 'компактну пудру', lt: 'kompaktinės pudros', ar: 'بودرة مضغوطة' },
    agree: { es: 'mpl', pt: 'm', en: 'm', fr: 'f', it: 'f', uk: 'f', lt: 'f', ar: 'f' },
    descs: { es: 'Fija el maquillaje y quita brillos. En español se pide en plural: "unos polvos".', pt: 'Fixa a maquiagem e tira o brilho. Em espanhol se pede no plural: "unos polvos".', en: 'Sets makeup and removes shine. Asked for in the plural in Spanish.', fr: 'Fixe le maquillage et matifie. Se demande au pluriel en espagnol.', it: 'Fissa il trucco e opacizza. In spagnolo si chiede al plurale.', uk: 'Закріплює макіяж і прибирає блиск. Іспанською просять у множині.', lt: 'Fiksuoja makiažą ir slopina blizgesį. Ispaniškai prašoma daugiskaita.', ar: 'تثبّت المكياج وتزيل اللمعان. تُطلب بصيغة الجمع بالإسبانية.' },
  },
  {
    key: 'colorete', figure: 'face',
    dims: ['color', 'finish'],
    names: { es: 'el colorete', pt: 'o blush', en: 'blush', fr: 'le blush', it: 'il fard', uk: 'рум\'яна', lt: 'skaistalai', ar: 'أحمر خدود' },
    orders: { es: 'un colorete', pt: 'um blush', en: 'a blush', fr: 'un blush', it: 'un fard', uk: 'рум\'яна', lt: 'skaistalų', ar: 'أحمر خدود' },
    agree: { es: 'm', pt: 'm', en: 'm', fr: 'm', it: 'm', uk: 'mpl', lt: 'mpl', ar: 'm' },
    descs: { es: 'Color para las mejillas.', pt: 'Cor para as maçãs do rosto. Na Espanha é "colorete" — "rubor" não se usa, e "blush" quase ninguém entende.', en: 'Colour for the cheeks.', fr: 'Couleur pour les joues.', it: 'Colore per le guance.', uk: 'Колір для щік.', lt: 'Spalva skruostams.', ar: 'لون للخدود.' },
  },
  {
    key: 'labial', figure: 'lips',
    dims: ['color', 'finish', 'lasting'],
    names: { es: 'el pintalabios', pt: 'o batom', en: 'lipstick', fr: 'le rouge à lèvres', it: 'il rossetto', uk: 'помада', lt: 'lūpdažis', ar: 'أحمر شفاه' },
    orders: { es: 'un pintalabios', pt: 'um batom', en: 'a lipstick', fr: 'un rouge à lèvres', it: 'un rossetto', uk: 'помаду', lt: 'lūpdažio', ar: 'أحمر شفاه' },
    agree: { es: 'm', pt: 'm', en: 'm', fr: 'm', it: 'm', uk: 'f', lt: 'm', ar: 'm' },
    descs: { es: 'Color para los labios. También se dice "barra de labios".', pt: 'Cor para os lábios. Na Espanha é "pintalabios" ou "barra de labios" — "labial" sozinho não se usa.', en: 'Colour for the lips.', fr: 'Couleur pour les lèvres.', it: 'Colore per le labbra.', uk: 'Колір для губ.', lt: 'Spalva lūpoms.', ar: 'لون للشفاه.' },
  },
  {
    key: 'mascara', figure: 'eye',
    dims: ['effect'],
    names: { es: 'el rímel', pt: 'o rímel', en: 'mascara', fr: 'le mascara', it: 'il mascara', uk: 'туш для вій', lt: 'blakstienų tušas', ar: 'ماسكارا' },
    orders: { es: 'un rímel', pt: 'um rímel', en: 'a mascara', fr: 'un mascara', it: 'un mascara', uk: 'туш для вій', lt: 'blakstienų tušo', ar: 'ماسكارا' },
    agree: { es: 'm', pt: 'm', en: 'm', fr: 'm', it: 'm', uk: 'f', lt: 'm', ar: 'f' },
    descs: { es: 'Para las pestañas. En España se dice "rímel", no "máscara".', pt: 'Para os cílios. Na Espanha se diz "rímel" — "máscara de pestañas" existe, mas no balcão é "rímel".', en: 'For the eyelashes.', fr: 'Pour les cils.', it: 'Per le ciglia.', uk: 'Для вій.', lt: 'Blakstienoms.', ar: 'للرموش.' },
  },
  {
    key: 'delineador', figure: 'eye',
    dims: ['color', 'form'],
    names: { es: 'el delineador de ojos', pt: 'o delineador', en: 'eyeliner', fr: 'l\'eye-liner', it: 'l\'eyeliner', uk: 'підводка для очей', lt: 'akių kontūro pieštukas', ar: 'محدد عيون' },
    orders: { es: 'un delineador de ojos', pt: 'um delineador', en: 'an eyeliner', fr: 'un eye-liner', it: 'un eyeliner', uk: 'підводку для очей', lt: 'akių kontūro pieštuko', ar: 'محدد عيون' },
    agree: { es: 'm', pt: 'm', en: 'm', fr: 'm', it: 'm', uk: 'f', lt: 'm', ar: 'm' },
    descs: { es: 'Traza la línea del ojo. Hay en lápiz, líquido, rotulador y gel.', pt: 'Faz o traço no olho. Existe em lápis, líquido, caneta e gel.', en: 'Draws the line along the eye.', fr: 'Trace la ligne de l\'œil.', it: 'Traccia la linea dell\'occhio.', uk: 'Малює лінію на оці.', lt: 'Brėžia liniją ant akies.', ar: 'يرسم خط العين.' },
  },
  {
    key: 'sombra', figure: 'eye',
    dims: ['color', 'finish'],
    names: { es: 'la sombra de ojos', pt: 'a sombra', en: 'eyeshadow', fr: 'le fard à paupières', it: 'l\'ombretto', uk: 'тіні для повік', lt: 'akių šešėliai', ar: 'ظل عيون' },
    orders: { es: 'una sombra de ojos', pt: 'uma sombra', en: 'an eyeshadow', fr: 'un fard à paupières', it: 'un ombretto', uk: 'тіні для повік', lt: 'akių šešėlių', ar: 'ظل عيون' },
    agree: { es: 'f', pt: 'f', en: 'm', fr: 'm', it: 'm', uk: 'fpl', lt: 'mpl', ar: 'm' },
    descs: { es: 'Color para el párpado.', pt: 'Cor para a pálpebra.', en: 'Colour for the eyelid.', fr: 'Couleur pour la paupière.', it: 'Colore per la palpebra.', uk: 'Колір для повіки.', lt: 'Spalva vokui.', ar: 'لون للجفن.' },
  },
  {
    key: 'esmalte', figure: 'nail',
    dims: ['color', 'finish'],
    names: { es: 'el esmalte de uñas', pt: 'o esmalte', en: 'nail polish', fr: 'le vernis à ongles', it: 'lo smalto', uk: 'лак для нігтів', lt: 'nagų lakas', ar: 'طلاء أظافر' },
    orders: { es: 'un esmalte de uñas', pt: 'um esmalte', en: 'a nail polish', fr: 'un vernis à ongles', it: 'uno smalto', uk: 'лак для нігтів', lt: 'nagų lako', ar: 'طلاء أظافر' },
    agree: { es: 'm', pt: 'm', en: 'm', fr: 'm', it: 'm', uk: 'm', lt: 'm', ar: 'm' },
    descs: { es: 'Color para las uñas. También se dice "pintaúñas".', pt: 'Cor para as unhas. Na Espanha também se diz "pintaúñas".', en: 'Colour for the nails.', fr: 'Couleur pour les ongles.', it: 'Colore per le unghie.', uk: 'Колір для нігтів.', lt: 'Spalva nagams.', ar: 'لون للأظافر.' },
  },
];

// ---------------------------------------------------------------------------
// DIMENSÕES
// ---------------------------------------------------------------------------
// Nenhum fragmento leva espaço na ponta: quem junta é o builder.

export interface Option {
  key: string;
  labels: Text;
  texts: Agreed;
  /** Cor da amostra. O objeto existe onde o subtom desloca a matiz. */
  swatch?: string | { cool: string; neutral: string; warm: string };
  /** Lista de PERMISSÃO: produto novo não faz aparecer opção sem revisão. */
  only?: string[];
}

export interface Dimension {
  key: DimKey;
  /** Chave de translations.ts para o título da seção. */
  labelKey: string;
  /** true só em `color`: o fragmento é adjetivo e concorda com o produto. */
  agrees: boolean;
  /** true = desenha régua de amostras. */
  visual: boolean;
  options: Option[];
}

export const DIMENSIONS: Dimension[] = [
  {
    key: 'depth', labelKey: 'mkDepth', agrees: false, visual: true,
    options: [
      { key: 'muyClaro',
        labels: { es: 'Muy claro', pt: 'Muito claro', en: 'Very light', fr: 'Très clair', it: 'Molto chiaro', uk: 'Дуже світлий', lt: 'Labai šviesus', ar: 'فاتح جدًا' },
        texts: { es: 'de tono muy claro', pt: 'de tom muito claro', en: 'in a very light shade', fr: 'de teinte très claire', it: 'di tonalità molto chiara', uk: 'дуже світлого відтінку', lt: 'labai šviesaus atspalvio', ar: 'بدرجة فاتحة جدًا' },
        swatch: { cool: '#F6DDD2', neutral: '#F5DCC8', warm: '#F6D9B8' } },
      { key: 'claro',
        labels: { es: 'Claro', pt: 'Claro', en: 'Light', fr: 'Clair', it: 'Chiaro', uk: 'Світлий', lt: 'Šviesus', ar: 'فاتح' },
        texts: { es: 'de tono claro', pt: 'de tom claro', en: 'in a light shade', fr: 'de teinte claire', it: 'di tonalità chiara', uk: 'світлого відтінку', lt: 'šviesaus atspalvio', ar: 'بدرجة فاتحة' },
        swatch: { cool: '#E8BCA8', neutral: '#E7BB9C', warm: '#E9B888' } },
      { key: 'medio',
        labels: { es: 'Medio', pt: 'Médio', en: 'Medium', fr: 'Moyen', it: 'Medio', uk: 'Середній', lt: 'Vidutinis', ar: 'متوسط' },
        texts: { es: 'de tono medio', pt: 'de tom médio', en: 'in a medium shade', fr: 'de teinte moyenne', it: 'di tonalità media', uk: 'середнього відтінку', lt: 'vidutinio atspalvio', ar: 'بدرجة متوسطة' },
        swatch: { cool: '#C68E72', neutral: '#C68C66', warm: '#C68A56' } },
      { key: 'oscuro',
        labels: { es: 'Oscuro', pt: 'Escuro', en: 'Dark', fr: 'Foncé', it: 'Scuro', uk: 'Темний', lt: 'Tamsus', ar: 'غامق' },
        texts: { es: 'de tono oscuro', pt: 'de tom escuro', en: 'in a dark shade', fr: 'de teinte foncée', it: 'di tonalità scura', uk: 'темного відтінку', lt: 'tamsaus atspalvio', ar: 'بدرجة غامقة' },
        swatch: { cool: '#8E5A42', neutral: '#8D5738', warm: '#8E552C' } },
      { key: 'muyOscuro',
        labels: { es: 'Muy oscuro', pt: 'Muito escuro', en: 'Very deep', fr: 'Très foncé', it: 'Molto scuro', uk: 'Дуже темний', lt: 'Labai tamsus', ar: 'غامق جدًا' },
        texts: { es: 'de tono muy oscuro', pt: 'de tom muito escuro', en: 'in a very deep shade', fr: 'de teinte très foncée', it: 'di tonalità molto scura', uk: 'дуже темного відтінку', lt: 'labai tamsaus atspalvio', ar: 'بدرجة غامقة جدًا' },
        swatch: { cool: '#4E2E22', neutral: '#4D2C1C', warm: '#4E2B15' } },
    ],
  },
  {
    key: 'undertone', labelKey: 'mkUndertone', agrees: false, visual: false,
    options: [
      { key: 'frio',
        labels: { es: 'Frío', pt: 'Frio', en: 'Cool', fr: 'Froid', it: 'Freddo', uk: 'Холодний', lt: 'Šaltas', ar: 'بارد' },
        texts: { es: 'de subtono frío', pt: 'de subtom frio', en: 'with a cool undertone', fr: 'au sous-ton froid', it: 'dal sottotono freddo', uk: 'з холодним підтоном', lt: 'su šaltu potoniu', ar: 'بأساس بارد' } },
      { key: 'neutro',
        labels: { es: 'Neutro', pt: 'Neutro', en: 'Neutral', fr: 'Neutre', it: 'Neutro', uk: 'Нейтральний', lt: 'Neutralus', ar: 'محايد' },
        texts: { es: 'de subtono neutro', pt: 'de subtom neutro', en: 'with a neutral undertone', fr: 'au sous-ton neutre', it: 'dal sottotono neutro', uk: 'з нейтральним підтоном', lt: 'su neutraliu potoniu', ar: 'بأساس محايد' } },
      { key: 'calido',
        labels: { es: 'Cálido', pt: 'Quente', en: 'Warm', fr: 'Chaud', it: 'Caldo', uk: 'Теплий', lt: 'Šiltas', ar: 'دافئ' },
        texts: { es: 'de subtono cálido', pt: 'de subtom quente', en: 'with a warm undertone', fr: 'au sous-ton chaud', it: 'dal sottotono caldo', uk: 'з теплим підтоном', lt: 'su šiltu potoniu', ar: 'بأساس دافئ' } },
    ],
  },
  {
    key: 'color', labelKey: 'mkColor', agrees: true, visual: true,
    options: [
      { key: 'rojo',
        labels: { es: 'Rojo', pt: 'Vermelho', en: 'Red', fr: 'Rouge', it: 'Rosso', uk: 'Червоний', lt: 'Raudona', ar: 'أحمر' },
        texts: {
          es: { m: 'rojo', f: 'roja', mpl: 'rojos', fpl: 'rojas' },
          pt: { m: 'vermelho', f: 'vermelha', mpl: 'vermelhos', fpl: 'vermelhas' },
          en: 'in red',
          fr: { m: 'rouge', f: 'rouge', mpl: 'rouges', fpl: 'rouges' },
          it: { m: 'rosso', f: 'rossa', mpl: 'rossi', fpl: 'rosse' },
          uk: { m: 'червоний', f: 'червону', mpl: 'червоні', fpl: 'червоні' },
          lt: { m: 'raudono', f: 'raudonos', mpl: 'raudonų', fpl: 'raudonų' },
          ar: { m: 'أحمر', f: 'حمراء', mpl: 'حمراء', fpl: 'حمراء' },
        },
        swatch: '#C2283C' },
      { key: 'rosa',
        labels: { es: 'Rosa', pt: 'Rosa', en: 'Pink', fr: 'Rose', it: 'Rosa', uk: 'Рожевий', lt: 'Rožinė', ar: 'وردي' },
        texts: {
          es: 'rosa',
          pt: { m: 'rosa', f: 'rosa', mpl: 'rosa', fpl: 'rosa' },
          en: 'in pink',
          fr: { m: 'rose', f: 'rose', mpl: 'roses', fpl: 'roses' },
          it: 'rosa',
          uk: { m: 'рожевий', f: 'рожеву', mpl: 'рожеві', fpl: 'рожеві' },
          lt: { m: 'rožinio', f: 'rožinės', mpl: 'rožinių', fpl: 'rožinių' },
          ar: { m: 'وردي', f: 'وردية', mpl: 'وردية', fpl: 'وردية' },
        },
        swatch: '#E38AA8' },
      { key: 'nude',
        labels: { es: 'Nude', pt: 'Nude', en: 'Nude', fr: 'Nude', it: 'Nude', uk: 'Нюд', lt: 'Nude', ar: 'بلون البشرة' },
        texts: {
          es: 'nude',
          pt: 'nude',
          en: 'in nude',
          fr: 'nude',
          it: 'nude',
          uk: { m: 'нюдовий', f: 'нюдову', mpl: 'нюдові', fpl: 'нюдові' },
          lt: { m: 'kūno spalvos', f: 'kūno spalvos', mpl: 'kūno spalvos', fpl: 'kūno spalvos' },
          ar: 'بلون البشرة',
        },
        swatch: '#C99B80', only: ['labial', 'sombra', 'esmalte', 'colorete'] },
      { key: 'coral',
        labels: { es: 'Coral', pt: 'Coral', en: 'Coral', fr: 'Corail', it: 'Corallo', uk: 'Кораловий', lt: 'Koralinė', ar: 'مرجاني' },
        texts: {
          es: 'coral',
          pt: 'coral',
          en: 'in coral',
          fr: 'corail',
          it: 'corallo',
          uk: { m: 'кораловий', f: 'коралову', mpl: 'коралові', fpl: 'коралові' },
          lt: { m: 'koralinio', f: 'koralinės', mpl: 'koralinių', fpl: 'koralinių' },
          ar: { m: 'مرجاني', f: 'مرجانية', mpl: 'مرجانية', fpl: 'مرجانية' },
        },
        swatch: '#F0785A' },
      { key: 'vino',
        labels: { es: 'Vino', pt: 'Vinho', en: 'Burgundy', fr: 'Bordeaux', it: 'Bordeaux', uk: 'Винний', lt: 'Vyno', ar: 'خمري' },
        texts: {
          es: 'color vino',
          pt: { m: 'vinho', f: 'vinho', mpl: 'vinho', fpl: 'vinho' },
          en: 'in burgundy',
          fr: 'bordeaux',
          it: 'bordeaux',
          uk: { m: 'винний', f: 'винну', mpl: 'винні', fpl: 'винні' },
          lt: { m: 'vyno spalvos', f: 'vyno spalvos', mpl: 'vyno spalvos', fpl: 'vyno spalvos' },
          ar: { m: 'خمري', f: 'خمرية', mpl: 'خمرية', fpl: 'خمرية' },
        },
        swatch: '#6E1F35', only: ['labial', 'sombra', 'esmalte'] },
      { key: 'marron',
        labels: { es: 'Marrón', pt: 'Marrom', en: 'Brown', fr: 'Marron', it: 'Marrone', uk: 'Коричневий', lt: 'Ruda', ar: 'بني' },
        texts: {
          es: { m: 'marrón', f: 'marrón', mpl: 'marrones', fpl: 'marrones' },
          pt: { m: 'marrom', f: 'marrom', mpl: 'marrons', fpl: 'marrons' },
          en: 'in brown',
          fr: 'marron',
          it: { m: 'marrone', f: 'marrone', mpl: 'marroni', fpl: 'marroni' },
          uk: { m: 'коричневий', f: 'коричневу', mpl: 'коричневі', fpl: 'коричневі' },
          lt: { m: 'rudo', f: 'rudos', mpl: 'rudų', fpl: 'rudų' },
          ar: { m: 'بني', f: 'بنية', mpl: 'بنية', fpl: 'بنية' },
        },
        swatch: '#7A4A32' },
      { key: 'negro',
        labels: { es: 'Negro', pt: 'Preto', en: 'Black', fr: 'Noir', it: 'Nero', uk: 'Чорний', lt: 'Juoda', ar: 'أسود' },
        texts: {
          es: { m: 'negro', f: 'negra', mpl: 'negros', fpl: 'negras' },
          pt: { m: 'preto', f: 'preta', mpl: 'pretos', fpl: 'pretas' },
          en: 'in black',
          fr: { m: 'noir', f: 'noire', mpl: 'noirs', fpl: 'noires' },
          it: { m: 'nero', f: 'nera', mpl: 'neri', fpl: 'nere' },
          uk: { m: 'чорний', f: 'чорну', mpl: 'чорні', fpl: 'чорні' },
          lt: { m: 'juodo', f: 'juodos', mpl: 'juodų', fpl: 'juodų' },
          ar: { m: 'أسود', f: 'سوداء', mpl: 'سوداء', fpl: 'سوداء' },
        },
        swatch: '#1C1C20', only: ['delineador', 'sombra', 'esmalte'] },
      { key: 'transparente',
        labels: { es: 'Transparente', pt: 'Transparente', en: 'Clear', fr: 'Transparent', it: 'Trasparente', uk: 'Прозорий', lt: 'Skaidri', ar: 'شفاف' },
        texts: {
          es: { m: 'transparente', f: 'transparente', mpl: 'transparentes', fpl: 'transparentes' },
          pt: { m: 'transparente', f: 'transparente', mpl: 'transparentes', fpl: 'transparentes' },
          en: 'in clear',
          fr: { m: 'transparent', f: 'transparente', mpl: 'transparents', fpl: 'transparentes' },
          it: { m: 'trasparente', f: 'trasparente', mpl: 'trasparenti', fpl: 'trasparenti' },
          uk: { m: 'прозорий', f: 'прозору', mpl: 'прозорі', fpl: 'прозорі' },
          lt: { m: 'skaidraus', f: 'skaidrios', mpl: 'skaidrių', fpl: 'skaidrių' },
          ar: { m: 'شفاف', f: 'شفافة', mpl: 'شفافة', fpl: 'شفافة' },
        },
        only: ['esmalte', 'labial'] },
    ],
  },
  {
    key: 'coverage', labelKey: 'mkCoverage', agrees: false, visual: false,
    options: [
      { key: 'ligera',
        labels: { es: 'Ligera', pt: 'Leve', en: 'Light', fr: 'Légère', it: 'Leggera', uk: 'Легке', lt: 'Lengvas', ar: 'خفيفة' },
        texts: { es: 'de cobertura ligera', pt: 'de cobertura leve', en: 'with light coverage', fr: 'à couvrance légère', it: 'a coprenza leggera', uk: 'з легким покриттям', lt: 'su lengvu padengimu', ar: 'بتغطية خفيفة' } },
      { key: 'media',
        labels: { es: 'Media', pt: 'Média', en: 'Medium', fr: 'Moyenne', it: 'Media', uk: 'Середнє', lt: 'Vidutinis', ar: 'متوسطة' },
        texts: { es: 'de cobertura media', pt: 'de cobertura média', en: 'with medium coverage', fr: 'à couvrance moyenne', it: 'a coprenza media', uk: 'із середнім покриттям', lt: 'su vidutiniu padengimu', ar: 'بتغطية متوسطة' } },
      { key: 'alta',
        labels: { es: 'Alta', pt: 'Alta', en: 'Full', fr: 'Élevée', it: 'Alta', uk: 'Високе', lt: 'Didelis', ar: 'عالية' },
        texts: { es: 'de cobertura alta', pt: 'de cobertura alta', en: 'with full coverage', fr: 'à couvrance élevée', it: 'a coprenza alta', uk: 'з високим покриттям', lt: 'su dideliu padengimu', ar: 'بتغطية عالية' } },
    ],
  },
  {
    key: 'finish', labelKey: 'mkFinish', agrees: false, visual: false,
    options: [
      { key: 'mate',
        labels: { es: 'Mate', pt: 'Matte', en: 'Matte', fr: 'Mat', it: 'Opaco', uk: 'Матовий', lt: 'Matinis', ar: 'مطفي' },
        texts: { es: 'con acabado mate', pt: 'com acabamento matte', en: 'with a matte finish', fr: 'au fini mat', it: 'con finish opaco', uk: 'з матовим фінішем', lt: 'matinio efekto', ar: 'بلمسة مطفية' } },
      { key: 'satinado',
        labels: { es: 'Satinado', pt: 'Acetinado', en: 'Satin', fr: 'Satiné', it: 'Satinato', uk: 'Сатиновий', lt: 'Satininis', ar: 'ساتان' },
        texts: { es: 'con acabado satinado', pt: 'com acabamento acetinado', en: 'with a satin finish', fr: 'au fini satiné', it: 'con finish satinato', uk: 'із сатиновим фінішем', lt: 'satininio efekto', ar: 'بلمسة ساتان' } },
      { key: 'natural',
        labels: { es: 'Natural', pt: 'Natural', en: 'Natural', fr: 'Naturel', it: 'Naturale', uk: 'Натуральний', lt: 'Natūralus', ar: 'طبيعي' },
        texts: { es: 'con acabado natural', pt: 'com acabamento natural', en: 'with a natural finish', fr: 'au fini naturel', it: 'con finish naturale', uk: 'з натуральним фінішем', lt: 'natūralaus efekto', ar: 'بلمسة طبيعية' } },
      { key: 'brillante',
        labels: { es: 'Brillante', pt: 'Brilhante', en: 'Glossy', fr: 'Brillant', it: 'Lucido', uk: 'Блискучий', lt: 'Blizgus', ar: 'لامع' },
        texts: { es: 'con acabado brillante', pt: 'com acabamento brilhante', en: 'with a glossy finish', fr: 'au fini brillant', it: 'con finish lucido', uk: 'з блискучим фінішем', lt: 'blizgaus efekto', ar: 'بلمسة لامعة' } },
    ],
  },
  {
    key: 'skin', labelKey: 'mkSkin', agrees: false, visual: false,
    options: [
      { key: 'grasa',
        labels: { es: 'Grasa', pt: 'Oleosa', en: 'Oily', fr: 'Grasse', it: 'Grassa', uk: 'Жирна', lt: 'Riebi', ar: 'دهنية' },
        texts: { es: 'para piel grasa', pt: 'para pele oleosa', en: 'for oily skin', fr: 'pour peau grasse', it: 'per pelle grassa', uk: 'для жирної шкіри', lt: 'riebiai odai', ar: 'للبشرة الدهنية' } },
      { key: 'seca',
        labels: { es: 'Seca', pt: 'Seca', en: 'Dry', fr: 'Sèche', it: 'Secca', uk: 'Суха', lt: 'Sausa', ar: 'جافة' },
        texts: { es: 'para piel seca', pt: 'para pele seca', en: 'for dry skin', fr: 'pour peau sèche', it: 'per pelle secca', uk: 'для сухої шкіри', lt: 'sausai odai', ar: 'للبشرة الجافة' } },
      { key: 'mixta',
        labels: { es: 'Mixta', pt: 'Mista', en: 'Combination', fr: 'Mixte', it: 'Mista', uk: 'Комбінована', lt: 'Mišri', ar: 'مختلطة' },
        texts: { es: 'para piel mixta', pt: 'para pele mista', en: 'for combination skin', fr: 'pour peau mixte', it: 'per pelle mista', uk: 'для комбінованої шкіри', lt: 'mišriai odai', ar: 'للبشرة المختلطة' } },
      { key: 'sensible',
        labels: { es: 'Sensible', pt: 'Sensível', en: 'Sensitive', fr: 'Sensible', it: 'Sensibile', uk: 'Чутлива', lt: 'Jautri', ar: 'حساسة' },
        texts: { es: 'para piel sensible', pt: 'para pele sensível', en: 'for sensitive skin', fr: 'pour peau sensible', it: 'per pelle sensibile', uk: 'для чутливої шкіри', lt: 'jautriai odai', ar: 'للبشرة الحساسة' } },
    ],
  },
  {
    key: 'effect', labelKey: 'mkEffect', agrees: false, visual: false,
    options: [
      { key: 'volumen',
        labels: { es: 'Volumen', pt: 'Volume', en: 'Volume', fr: 'Volume', it: 'Volume', uk: 'Об\'єм', lt: 'Apimtis', ar: 'كثافة' },
        texts: { es: 'de volumen', pt: 'de volume', en: 'for volume', fr: 'volumateur', it: 'volumizzante', uk: 'для об\'єму', lt: 'apimčiai', ar: 'لزيادة الكثافة' } },
      { key: 'alargador',
        labels: { es: 'Alargador', pt: 'Alongador', en: 'Length', fr: 'Allongeant', it: 'Allungante', uk: 'Подовження', lt: 'Ilgis', ar: 'إطالة' },
        texts: { es: 'alargador', pt: 'alongador', en: 'for length', fr: 'allongeant', it: 'allungante', uk: 'для довжини', lt: 'ilgiui', ar: 'لإطالة الرموش' } },
      { key: 'waterproof',
        labels: { es: 'Resistente al agua', pt: 'À prova d\'água', en: 'Waterproof', fr: 'Waterproof', it: 'Waterproof', uk: 'Водостійкий', lt: 'Atsparus vandeniui', ar: 'مقاوم للماء' },
        texts: { es: 'resistente al agua', pt: 'à prova d\'água', en: 'waterproof', fr: 'waterproof', it: 'waterproof', uk: 'водостійкої', lt: 'atsparaus vandeniui', ar: 'مقاوم للماء' } },
      { key: 'curvador',
        labels: { es: 'Que riza', pt: 'Que curva', en: 'Curling', fr: 'Recourbant', it: 'Incurvante', uk: 'Підкручування', lt: 'Garbanojantis', ar: 'تجعيد' },
        texts: { es: 'que riza', pt: 'que curva os cílios', en: 'for curl', fr: 'recourbant', it: 'incurvante', uk: 'для підкручування', lt: 'garbanojančio', ar: 'لتجعيد الرموش' } },
    ],
  },
  {
    key: 'form', labelKey: 'mkForm', agrees: false, visual: false,
    options: [
      { key: 'lapiz',
        labels: { es: 'Lápiz', pt: 'Lápis', en: 'Pencil', fr: 'Crayon', it: 'Matita', uk: 'Олівець', lt: 'Pieštukas', ar: 'قلم' },
        texts: { es: 'en lápiz', pt: 'em lápis', en: 'in pencil form', fr: 'en crayon', it: 'in matita', uk: 'у вигляді олівця', lt: 'pieštuko formos', ar: 'على شكل قلم' } },
      { key: 'liquido',
        labels: { es: 'Líquido', pt: 'Líquido', en: 'Liquid', fr: 'Liquide', it: 'Liquido', uk: 'Рідкий', lt: 'Skystas', ar: 'سائل' },
        texts: { es: 'líquido', pt: 'líquido', en: 'in liquid form', fr: 'liquide', it: 'liquido', uk: 'рідкої форми', lt: 'skysto', ar: 'سائل' } },
      { key: 'rotulador',
        labels: { es: 'Rotulador', pt: 'Caneta', en: 'Pen', fr: 'Feutre', it: 'Pennarello', uk: 'Фломастер', lt: 'Flomasteris', ar: 'قلم تحديد' },
        texts: { es: 'en rotulador', pt: 'em caneta', en: 'in pen form', fr: 'en feutre', it: 'a pennarello', uk: 'у вигляді фломастера', lt: 'flomasterio formos', ar: 'على شكل قلم تحديد' } },
      { key: 'gel',
        labels: { es: 'Gel', pt: 'Gel', en: 'Gel', fr: 'Gel', it: 'Gel', uk: 'Гель', lt: 'Gelis', ar: 'جل' },
        texts: { es: 'en gel', pt: 'em gel', en: 'in gel form', fr: 'en gel', it: 'in gel', uk: 'у вигляді гелю', lt: 'gelio formos', ar: 'على شكل جل' } },
    ],
  },
  {
    key: 'lasting', labelKey: 'mkLasting', agrees: false, visual: false,
    options: [
      { key: 'largaDuracion',
        labels: { es: 'Larga duración', pt: 'Longa duração', en: 'Long-lasting', fr: 'Longue tenue', it: 'Lunga tenuta', uk: 'Тривка', lt: 'Ilgai išliekantis', ar: 'ثبات طويل' },
        texts: { es: 'de larga duración', pt: 'de longa duração', en: 'long-lasting', fr: 'longue tenue', it: 'a lunga tenuta', uk: 'тривалої дії', lt: 'ilgai išliekančio', ar: 'بثبات طويل' } },
    ],
  },
];

/** Opções que existem para este produto. Lista de permissão, não de bloqueio. */
export const optionsFor = (dim: Dimension, product: Product): Option[] =>
  dim.options.filter((o) => !o.only || o.only.includes(product.key));

// ---------------------------------------------------------------------------
// FERRAMENTAS E ACESSÓRIOS
// ---------------------------------------------------------------------------
// Vocabulário visual, não catálogo. O objetivo é a pessoa saber NOMEAR o objeto.
//
// `askFor` segue a mesma convenção de caso de `orders`: uk ACUSATIVO, ar SEM "ال".
// Em lt, `askFor` é ACUSATIVO (para "Ar turite…?") e `gen` guarda o genitivo que
// "Ieškau" exige — são quadros de frase diferentes regendo casos diferentes.

export type ToolGroup = 'apply' | 'hair' | 'clean' | 'carry';

export interface Tool {
  key: string;
  group: ToolGroup;
  /** Nominativo / definido. É o rótulo, e o que o quadro de preço usa. */
  names: Text;
  /** Indefinido / acusativo. Entra nos quadros de pedido. */
  askFor: Text;
  /** Genitivo, onde o verbo do quadro reger. */
  gen?: { uk?: string; lt?: string };
  /** Armadilha de nome, na língua de quem lê. */
  note?: Text;
}

export const TOOLS: Tool[] = [
  // --- aplicar ---
  {
    key: 'pincel', group: 'apply',
    names: { es: 'el pincel', pt: 'o pincel', en: 'the brush', fr: 'le pinceau', it: 'il pennello', uk: 'пензлик', lt: 'teptukas', ar: 'فرشاة صغيرة' },
    askFor: { es: 'un pincel', pt: 'um pincel', en: 'a brush', fr: 'un pinceau', it: 'un pennello', uk: 'пензлик', lt: 'teptuką', ar: 'فرشاة صغيرة' },
    gen: { uk: 'пензлика', lt: 'teptuko' },
    note: { es: 'El pequeño, para ojos y labios. El grande de polvos es "la brocha".', pt: 'É o pequeno, de olho e boca. O grande, de pó e base, é "la brocha" — palavra diferente. E "brush" não se usa na Espanha: ninguém vai entender.', en: 'The small one, for eyes and lips. The big face one is "brocha" in Spanish.', fr: 'Le petit, pour les yeux et les lèvres. Le gros s\'appelle "brocha" en espagnol.', it: 'Il piccolo, per occhi e labbra. Quello grande in spagnolo è "brocha".', uk: 'Малий, для очей і губ. Великий іспанською — "brocha", інше слово.', lt: 'Mažas, akims ir lūpoms. Didelis ispaniškai vadinamas "brocha".', ar: 'الصغيرة للعيون والشفاه. الكبيرة تسمى "brocha" بالإسبانية.' },
  },
  {
    key: 'brocha', group: 'apply',
    names: { es: 'la brocha', pt: 'o pincel de pó', en: 'the face brush', fr: 'le gros pinceau', it: 'il pennello grande', uk: 'пензель для пудри', lt: 'pudros teptukas', ar: 'فرشاة كبيرة' },
    askFor: { es: 'una brocha', pt: 'um pincel de pó', en: 'a face brush', fr: 'un gros pinceau', it: 'un pennello grande', uk: 'пензель для пудри', lt: 'pudros teptuką', ar: 'فرشاة كبيرة' },
    gen: { uk: 'пензля для пудри', lt: 'pudros teptuko' },
    note: { es: 'El grande, para polvos y base.', pt: 'O grande, de pó e base. Em espanhol é "brocha" e não "pincel" — pedir "pincel" traz o pequeno de olho.', en: 'The big one, for powder and foundation. Spanish calls it "brocha", not "pincel".', fr: 'Le gros, pour la poudre et le fond de teint. En espagnol : "brocha".', it: 'Quello grande, per cipria e fondotinta. In spagnolo "brocha".', uk: 'Великий, для пудри й тонального крему. Іспанською "brocha".', lt: 'Didelis, pudrai ir pagrindui. Ispaniškai "brocha".', ar: 'الكبيرة، للبودرة وكريم الأساس. تسمى "brocha" بالإسبانية.' },
  },
  {
    key: 'esponja', group: 'apply',
    names: { es: 'la esponja de maquillaje', pt: 'a esponja de maquiagem', en: 'the makeup sponge', fr: 'l\'éponge à maquillage', it: 'la spugnetta', uk: 'спонж', lt: 'kempinėlė', ar: 'إسفنجة مكياج' },
    askFor: { es: 'una esponja de maquillaje', pt: 'uma esponja de maquiagem', en: 'a makeup sponge', fr: 'une éponge à maquillage', it: 'una spugnetta', uk: 'спонж', lt: 'kempinėlę', ar: 'إسفنجة مكياج' },
    gen: { uk: 'спонжа', lt: 'kempinėlės' },
  },
  {
    key: 'aplicador', group: 'apply',
    names: { es: 'el aplicador', pt: 'o aplicador', en: 'the applicator', fr: 'l\'applicateur', it: 'l\'applicatore', uk: 'аплікатор', lt: 'aplikatorius', ar: 'أداة تطبيق' },
    askFor: { es: 'un aplicador', pt: 'um aplicador', en: 'an applicator', fr: 'un applicateur', it: 'un applicatore', uk: 'аплікатор', lt: 'aplikatorių', ar: 'أداة تطبيق' },
    gen: { uk: 'аплікатора', lt: 'aplikatoriaus' },
  },
  {
    key: 'curvador', group: 'apply',
    names: { es: 'el rizador de pestañas', pt: 'o curvador de cílios', en: 'the eyelash curler', fr: 'le recourbe-cils', it: 'il piegaciglia', uk: 'щипці для вій', lt: 'blakstienų žnyplės', ar: 'جهاز تجعيد الرموش' },
    askFor: { es: 'un rizador de pestañas', pt: 'um curvador de cílios', en: 'an eyelash curler', fr: 'un recourbe-cils', it: 'un piegaciglia', uk: 'щипці для вій', lt: 'blakstienų žnyples', ar: 'جهاز تجعيد الرموش' },
    gen: { uk: 'щипців для вій', lt: 'blakstienų žnyplių' },
    note: { es: 'En España se llama "rizador", de "rizar".', pt: 'Em espanhol é "rizador", de "rizar" (encaracolar). Não lembra nada "curvador" — é uma das palavras que mais trava na loja.', en: 'Spanish calls it "rizador", from "rizar" (to curl).', fr: 'En espagnol : "rizador", de "rizar" (boucler).', it: 'In spagnolo "rizador", da "rizar" (arricciare).', uk: 'Іспанською "rizador", від "rizar" — підкручувати.', lt: 'Ispaniškai "rizador", nuo "rizar" — garbanoti.', ar: 'بالإسبانية "rizador"، من "rizar" أي يجعّد.' },
  },
  {
    key: 'pinza', group: 'apply',
    names: { es: 'las pinzas', pt: 'a pinça', en: 'the tweezers', fr: 'la pince à épiler', it: 'le pinzette', uk: 'пінцет', lt: 'pincetas', ar: 'ملقط' },
    askFor: { es: 'unas pinzas', pt: 'uma pinça', en: 'tweezers', fr: 'une pince à épiler', it: 'delle pinzette', uk: 'пінцет', lt: 'pincetą', ar: 'ملقط' },
    gen: { uk: 'пінцета', lt: 'pinceto' },
    note: { es: 'Siempre en plural: "unas pinzas".', pt: 'Em espanhol vai sempre no plural: "unas pinzas". No singular, "una pinza" é a presilha de cabelo — objeto diferente.', en: 'Always plural in Spanish: "unas pinzas". The singular means a hair clip.', fr: 'Toujours au pluriel en espagnol : "unas pinzas". Au singulier, c\'est une pince à cheveux.', it: 'Sempre al plurale in spagnolo: "unas pinzas". Al singolare è una molletta.', uk: 'Іспанською завжди у множині: "unas pinzas". В однині це заколка.', lt: 'Ispaniškai visada daugiskaita: "unas pinzas". Vienaskaita reiškia plaukų segtuką.', ar: 'دائمًا بالجمع بالإسبانية: "unas pinzas". المفرد يعني مشبك شعر.' },
  },
  {
    key: 'apontador', group: 'apply',
    names: { es: 'el sacapuntas', pt: 'o apontador', en: 'the sharpener', fr: 'le taille-crayon', it: 'il temperamatite', uk: 'стругачка', lt: 'drožtukas', ar: 'براية' },
    askFor: { es: 'un sacapuntas', pt: 'um apontador', en: 'a sharpener', fr: 'un taille-crayon', it: 'un temperamatite', uk: 'стругачку', lt: 'drožtuką', ar: 'براية' },
    gen: { uk: 'стругачки', lt: 'drožtuko' },
    note: { es: 'Para los lápices de ojos y labios.', pt: 'Para lápis de olho e de boca. Em espanhol é "sacapuntas" — literalmente "tira-pontas", nada parecido com "apontador".', en: 'For eye and lip pencils. Spanish: "sacapuntas".', fr: 'Pour les crayons yeux et lèvres. En espagnol : "sacapuntas".', it: 'Per le matite occhi e labbra. In spagnolo "sacapuntas".', uk: 'Для олівців для очей і губ. Іспанською "sacapuntas".', lt: 'Akių ir lūpų pieštukams. Ispaniškai "sacapuntas".', ar: 'لأقلام العيون والشفاه. بالإسبانية "sacapuntas".' },
  },
  {
    key: 'cilios', group: 'apply',
    names: { es: 'las pestañas postizas', pt: 'os cílios postiços', en: 'the false lashes', fr: 'les faux cils', it: 'le ciglia finte', uk: 'накладні вії', lt: 'dirbtinės blakstienos', ar: 'رموش صناعية' },
    askFor: { es: 'unas pestañas postizas', pt: 'uns cílios postiços', en: 'false lashes', fr: 'des faux cils', it: 'delle ciglia finte', uk: 'накладні вії', lt: 'dirbtines blakstienas', ar: 'رموش صناعية' },
    gen: { uk: 'накладних вій', lt: 'dirbtinių blakstienų' },
  },
  // --- cabelo ---
  {
    key: 'escova', group: 'hair',
    names: { es: 'el cepillo del pelo', pt: 'a escova de cabelo', en: 'the hairbrush', fr: 'la brosse à cheveux', it: 'la spazzola', uk: 'щітка для волосся', lt: 'plaukų šepetys', ar: 'فرشاة شعر' },
    askFor: { es: 'un cepillo del pelo', pt: 'uma escova de cabelo', en: 'a hairbrush', fr: 'une brosse à cheveux', it: 'una spazzola', uk: 'щітку для волосся', lt: 'plaukų šepetį', ar: 'فرشاة شعر' },
    gen: { uk: 'щітки для волосся', lt: 'plaukų šepečio' },
    note: { es: 'Es "cepillo", no "pincel" ni "brocha".', pt: 'Em espanhol é "cepillo" — palavra completamente diferente de "pincel" (maquiagem) e "brocha" (pó). São três objetos e três palavras.', en: 'Spanish uses "cepillo" here — not "pincel" or "brocha".', fr: 'En espagnol : "cepillo", ni "pincel" ni "brocha".', it: 'In spagnolo è "cepillo", non "pincel" né "brocha".', uk: 'Іспанською це "cepillo", а не "pincel" чи "brocha".', lt: 'Ispaniškai tai "cepillo", ne "pincel" ir ne "brocha".', ar: 'بالإسبانية "cepillo"، وليست "pincel" أو "brocha".' },
  },
  {
    key: 'pente', group: 'hair',
    names: { es: 'el peine', pt: 'o pente', en: 'the comb', fr: 'le peigne', it: 'il pettine', uk: 'гребінець', lt: 'šukos', ar: 'مشط' },
    askFor: { es: 'un peine', pt: 'um pente', en: 'a comb', fr: 'un peigne', it: 'un pettine', uk: 'гребінець', lt: 'šukas', ar: 'مشط' },
    gen: { uk: 'гребінця', lt: 'šukų' },
  },
  {
    key: 'faixa', group: 'hair',
    names: { es: 'la diadema', pt: 'a faixa de cabelo', en: 'the headband', fr: 'le serre-tête', it: 'il cerchietto', uk: 'обідок для волосся', lt: 'plaukų lankelis', ar: 'ربطة رأس' },
    askFor: { es: 'una diadema', pt: 'uma faixa de cabelo', en: 'a headband', fr: 'un serre-tête', it: 'un cerchietto', uk: 'обідок для волосся', lt: 'plaukų lankelį', ar: 'ربطة رأس' },
    gen: { uk: 'обідка для волосся', lt: 'plaukų lankelio' },
    note: { es: 'En España se dice "diadema".', pt: 'Na Espanha é "diadema" — que em português soa a joia de cabeça, mas ali é a faixa comum de segurar o cabelo.', en: 'Spain says "diadema" for a plain headband.', fr: 'En Espagne on dit "diadema".', it: 'In Spagna si dice "diadema".', uk: 'В Іспанії кажуть "diadema".', lt: 'Ispanijoje sakoma "diadema".', ar: 'في إسبانيا تسمى "diadema".' },
  },
  {
    key: 'presilha', group: 'hair',
    names: { es: 'la pinza del pelo', pt: 'a presilha', en: 'the hair clip', fr: 'la pince à cheveux', it: 'la molletta', uk: 'заколка', lt: 'plaukų segtukas', ar: 'مشبك شعر' },
    askFor: { es: 'una pinza del pelo', pt: 'uma presilha', en: 'a hair clip', fr: 'une pince à cheveux', it: 'una molletta', uk: 'заколку', lt: 'plaukų segtuką', ar: 'مشبك شعر' },
    gen: { uk: 'заколки', lt: 'plaukų segtuko' },
    note: { es: 'Di "del pelo": "unas pinzas" a secas son las de cejas.', pt: 'Diga sempre "del pelo". "Unas pinzas" sozinho é a pinça de sobrancelha — outro objeto.', en: 'Say "del pelo": plain "unas pinzas" means tweezers.', fr: 'Dites "del pelo" : "unas pinzas" seul veut dire pince à épiler.', it: 'Dì "del pelo": "unas pinzas" da solo sono le pinzette.', uk: 'Кажіть "del pelo": саме "unas pinzas" — це пінцет.', lt: 'Sakykite "del pelo": vien "unas pinzas" reiškia pincetą.', ar: 'قل "del pelo": كلمة "unas pinzas" وحدها تعني الملقط.' },
  },
  {
    key: 'elastico', group: 'hair',
    names: { es: 'la goma del pelo', pt: 'o elástico de cabelo', en: 'the hair tie', fr: 'l\'élastique à cheveux', it: 'l\'elastico per capelli', uk: 'резинка для волосся', lt: 'plaukų gumytė', ar: 'مطاط شعر' },
    askFor: { es: 'una goma del pelo', pt: 'um elástico de cabelo', en: 'a hair tie', fr: 'un élastique à cheveux', it: 'un elastico per capelli', uk: 'резинку для волосся', lt: 'plaukų gumytę', ar: 'مطاط شعر' },
    gen: { uk: 'резинки для волосся', lt: 'plaukų gumytės' },
  },
  // --- limpar ---
  {
    key: 'demaquilante', group: 'clean',
    names: { es: 'el desmaquillante', pt: 'o demaquilante', en: 'the makeup remover', fr: 'le démaquillant', it: 'lo struccante', uk: 'засіб для зняття макіяжу', lt: 'makiažo valiklis', ar: 'مزيل مكياج' },
    askFor: { es: 'un desmaquillante', pt: 'um demaquilante', en: 'a makeup remover', fr: 'un démaquillant', it: 'uno struccante', uk: 'засіб для зняття макіяжу', lt: 'makiažo valiklį', ar: 'مزيل مكياج' },
    gen: { uk: 'засобу для зняття макіяжу', lt: 'makiažo valiklio' },
  },
  {
    key: 'algodao', group: 'clean',
    names: { es: 'los discos de algodón', pt: 'os discos de algodão', en: 'the cotton pads', fr: 'les disques de coton', it: 'i dischetti di cotone', uk: 'ватні диски', lt: 'vatos diskeliai', ar: 'أقراص قطنية' },
    askFor: { es: 'unos discos de algodón', pt: 'uns discos de algodão', en: 'cotton pads', fr: 'des disques de coton', it: 'dei dischetti di cotone', uk: 'ватні диски', lt: 'vatos diskelius', ar: 'أقراص قطنية' },
    gen: { uk: 'ватних дисків', lt: 'vatos diskelių' },
  },
  {
    key: 'cotonete', group: 'clean',
    names: { es: 'los bastoncillos', pt: 'os cotonetes', en: 'the cotton buds', fr: 'les cotons-tiges', it: 'i cotton fioc', uk: 'ватні палички', lt: 'vatos pagaliukai', ar: 'أعواد قطنية' },
    askFor: { es: 'unos bastoncillos', pt: 'uns cotonetes', en: 'cotton buds', fr: 'des cotons-tiges', it: 'dei cotton fioc', uk: 'ватні палички', lt: 'vatos pagaliukus', ar: 'أعواد قطنية' },
    gen: { uk: 'ватних паличок', lt: 'vatos pagaliukų' },
    note: { es: 'En España son "bastoncillos".', pt: 'Em espanhol é "bastoncillos" — "cotonete" é marca brasileira e ninguém entende ali.', en: 'Spain says "bastoncillos".', fr: 'En Espagne : "bastoncillos".', it: 'In Spagna si dice "bastoncillos".', uk: 'В Іспанії — "bastoncillos".', lt: 'Ispanijoje — "bastoncillos".', ar: 'في إسبانيا تسمى "bastoncillos".' },
  },
  {
    key: 'lenco', group: 'clean',
    names: { es: 'las toallitas desmaquillantes', pt: 'os lenços demaquilantes', en: 'the makeup wipes', fr: 'les lingettes démaquillantes', it: 'le salviette struccanti', uk: 'серветки для зняття макіяжу', lt: 'makiažo valymo servetėlės', ar: 'مناديل مزيلة للمكياج' },
    askFor: { es: 'unas toallitas desmaquillantes', pt: 'uns lenços demaquilantes', en: 'makeup wipes', fr: 'des lingettes démaquillantes', it: 'delle salviette struccanti', uk: 'серветки для зняття макіяжу', lt: 'makiažo valymo servetėles', ar: 'مناديل مزيلة للمكياج' },
    gen: { uk: 'серветок для зняття макіяжу', lt: 'makiažo valymo servetėlių' },
  },
  // --- levar e ver ---
  {
    key: 'espelho', group: 'carry',
    names: { es: 'el espejo', pt: 'o espelho', en: 'the mirror', fr: 'le miroir', it: 'lo specchio', uk: 'дзеркало', lt: 'veidrodis', ar: 'مرآة' },
    askFor: { es: 'un espejo', pt: 'um espelho', en: 'a mirror', fr: 'un miroir', it: 'uno specchio', uk: 'дзеркало', lt: 'veidrodį', ar: 'مرآة' },
    gen: { uk: 'дзеркала', lt: 'veidrodžio' },
  },
  {
    key: 'espelhoMaq', group: 'carry',
    names: { es: 'el espejo de maquillaje', pt: 'o espelho de maquiagem', en: 'the makeup mirror', fr: 'le miroir de maquillage', it: 'lo specchio da trucco', uk: 'дзеркало для макіяжу', lt: 'makiažo veidrodis', ar: 'مرآة مكياج' },
    askFor: { es: 'un espejo de maquillaje', pt: 'um espelho de maquiagem', en: 'a makeup mirror', fr: 'un miroir de maquillage', it: 'uno specchio da trucco', uk: 'дзеркало для макіяжу', lt: 'makiažo veidrodį', ar: 'مرآة مكياج' },
    gen: { uk: 'дзеркала для макіяжу', lt: 'makiažo veidrodžio' },
  },
  {
    key: 'necessaire', group: 'carry',
    names: { es: 'el neceser', pt: 'a nécessaire', en: 'the makeup bag', fr: 'la trousse de maquillage', it: 'il beauty case', uk: 'косметичка', lt: 'kosmetinė', ar: 'حقيبة مكياج' },
    askFor: { es: 'un neceser', pt: 'uma nécessaire', en: 'a makeup bag', fr: 'une trousse de maquillage', it: 'un beauty case', uk: 'косметичку', lt: 'kosmetinę', ar: 'حقيبة مكياج' },
    gen: { uk: 'косметички', lt: 'kosmetinės' },
    note: { es: 'En España es "neceser".', pt: 'Na Espanha é "neceser" — vem do francês, como "nécessaire", mas escreve-se e diz-se diferente.', en: 'Spain says "neceser".', fr: 'En Espagne : "neceser".', it: 'In Spagna si dice "neceser".', uk: 'В Іспанії — "neceser".', lt: 'Ispanijoje — "neceser".', ar: 'في إسبانيا تسمى "neceser".' },
  },
  {
    key: 'estojo', group: 'carry',
    names: { es: 'el estuche', pt: 'o estojo', en: 'the case', fr: 'l\'étui', it: 'l\'astuccio', uk: 'футляр', lt: 'dėklas', ar: 'علبة' },
    askFor: { es: 'un estuche', pt: 'um estojo', en: 'a case', fr: 'un étui', it: 'un astuccio', uk: 'футляр', lt: 'dėklą', ar: 'علبة' },
    gen: { uk: 'футляра', lt: 'dėklo' },
  },
];

// ---------------------------------------------------------------------------
// QUADROS DE FRASE DOS ACESSÓRIOS
// ---------------------------------------------------------------------------
// Todos com OBJETO DIRETO de propósito: nenhum usa "preciso de", que abriria
// contração de preposição em pt, fr e it (`de + une → d'une`).

export interface ToolFrame {
  key: string;
  labels: Text;
  /** Contém "{item}". */
  templates: Text;
  /** `askFor` = indefinido/acusativo; `names` = definido/nominativo. */
  use: 'askFor' | 'names';
  /** Idiomas em que o verbo do quadro rege genitivo. */
  gen?: LangCode[];
}

export const TOOL_FRAMES: ToolFrame[] = [
  {
    key: 'have', use: 'askFor',
    labels: { es: '¿Tenéis…?', pt: 'Vocês têm…?', en: 'Do you have…?', fr: 'Avez-vous… ?', it: 'Avete…?', uk: 'Ви маєте…?', lt: 'Ar turite…?', ar: 'هل لديكم…؟' },
    templates: { es: '¿Tenéis {item}?', pt: 'Vocês têm {item}?', en: 'Do you have {item}?', fr: 'Avez-vous {item} ?', it: 'Avete {item}?', uk: 'Ви маєте {item}?', lt: 'Ar turite {item}?', ar: 'هل لديكم {item}؟' },
  },
  {
    key: 'looking', use: 'askFor', gen: ['lt'],
    labels: { es: 'Estoy buscando…', pt: 'Estou procurando…', en: 'I\'m looking for…', fr: 'Je cherche…', it: 'Sto cercando…', uk: 'Шукаю…', lt: 'Ieškau…', ar: 'أبحث عن…' },
    templates: { es: 'Estoy buscando {item}.', pt: 'Estou procurando {item}.', en: 'I\'m looking for {item}.', fr: 'Je cherche {item}.', it: 'Sto cercando {item}.', uk: 'Шукаю {item}.', lt: 'Ieškau {item}.', ar: 'أبحث عن {item}.' },
  },
  {
    key: 'show', use: 'askFor',
    labels: { es: '¿Me enseñáis…?', pt: 'Pode me mostrar…?', en: 'Could you show me…?', fr: 'Pouvez-vous me montrer… ?', it: 'Mi può mostrare…?', uk: 'Покажіть…', lt: 'Ar galite parodyti…?', ar: 'أيمكنكم أن تروني…؟' },
    templates: { es: '¿Me enseñáis {item}?', pt: 'Pode me mostrar {item}?', en: 'Could you show me {item}?', fr: 'Pouvez-vous me montrer {item} ?', it: 'Mi può mostrare {item}?', uk: 'Покажіть, будь ласка, {item}.', lt: 'Ar galite parodyti {item}?', ar: 'أيمكنكم أن تروني {item}؟' },
  },
  {
    key: 'price', use: 'names',
    labels: { es: '¿Cuánto cuesta…?', pt: 'Quanto custa…?', en: 'How much is…?', fr: 'Combien coûte… ?', it: 'Quanto costa…?', uk: 'Скільки коштує…?', lt: 'Kiek kainuoja…?', ar: 'كم سعر…؟' },
    templates: { es: '¿Cuánto cuesta {item}?', pt: 'Quanto custa {item}?', en: 'How much is {item}?', fr: 'Combien coûte {item} ?', it: 'Quanto costa {item}?', uk: 'Скільки коштує {item}?', lt: 'Kiek kainuoja {item}?', ar: 'كم سعر {item}؟' },
  },
];

// ---------------------------------------------------------------------------
// FRASES DA LOJA
// ---------------------------------------------------------------------------
// REGRA: nenhuma pergunta pode ter clítico ou adjetivo que concorde com o
// produto. "¿Puedo probarlo?" fica errado quando o produto é "una base" (seria
// "probarla"), e o produto muda enquanto a frase é fixa. Por isso todas têm
// objeto nominal fixo: "el color", "el tono", "muestras".

export const MAKEUP_QUESTIONS: Text[] = [
  { es: '¿Dónde están los accesorios de maquillaje?', pt: 'Onde ficam os acessórios de maquiagem?', en: 'Where are the makeup accessories?', fr: 'Où sont les accessoires de maquillage ?', it: 'Dove sono gli accessori per il trucco?', uk: 'Де аксесуари для макіяжу?', lt: 'Kur yra makiažo priemonės?', ar: 'أين ملحقات المكياج؟' },
  { es: '¿Me ayudas a encontrar mi tono?', pt: 'Você pode me ajudar a achar o meu tom?', en: 'Can you help me find my shade?', fr: 'Pouvez-vous m\'aider à trouver ma teinte ?', it: 'Mi aiuti a trovare la mia tonalità?', uk: 'Допоможете підібрати мій відтінок?', lt: 'Ar galite padėti rasti mano atspalvį?', ar: 'هل تساعدني في اختيار درجتي؟' },
  { es: 'No sé cuál es mi tono.', pt: 'Não sei qual é o meu tom.', en: 'I don\'t know my shade.', fr: 'Je ne connais pas ma teinte.', it: 'Non so qual è la mia tonalità.', uk: 'Я не знаю свого відтінку.', lt: 'Nežinau savo atspalvio.', ar: 'لا أعرف درجتي.' },
  { es: '¿Tenéis muestras?', pt: 'Vocês têm amostras?', en: 'Do you have samples?', fr: 'Avez-vous des échantillons ?', it: 'Avete dei campioni?', uk: 'У вас є пробники?', lt: 'Ar turite pavyzdžių?', ar: 'هل لديكم عينات؟' },
  { es: '¿Me pones una muestra en la mano?', pt: 'Pode passar uma amostra na minha mão?', en: 'Could you put a sample on my hand?', fr: 'Pouvez-vous mettre un échantillon sur ma main ?', it: 'Mi mette un campione sulla mano?', uk: 'Можете нанести пробник на руку?', lt: 'Ar galite užtepti pavyzdį ant rankos?', ar: 'هل يمكنك وضع عينة على يدي؟' },
  { es: '¿Puedo probar el color?', pt: 'Posso testar a cor?', en: 'Can I try the colour?', fr: 'Puis-je essayer la couleur ?', it: 'Posso provare il colore?', uk: 'Чи можу я спробувати колір?', lt: 'Ar galiu išbandyti spalvą?', ar: 'هل يمكنني تجربة اللون؟' },
  { es: '¿Este tono es frío o cálido?', pt: 'Este tom é frio ou quente?', en: 'Is this shade cool or warm?', fr: 'Cette teinte est-elle froide ou chaude ?', it: 'Questa tonalità è fredda o calda?', uk: 'Цей відтінок холодний чи теплий?', lt: 'Ar šis atspalvis šaltas, ar šiltas?', ar: 'هل هذه الدرجة باردة أم دافئة؟' },
  { es: '¿Tenéis un tono más claro o más oscuro?', pt: 'Vocês têm um tom mais claro ou mais escuro?', en: 'Do you have a lighter or darker shade?', fr: 'Avez-vous une teinte plus claire ou plus foncée ?', it: 'Avete una tonalità più chiara o più scura?', uk: 'У вас є світліший або темніший відтінок?', lt: 'Ar turite šviesesnį ar tamsesnį atspalvį?', ar: 'هل لديكم درجة أفتح أو أغمق؟' },
  { es: '¿Se puede devolver si no me va el tono?', pt: 'Dá para devolver se o tom não servir?', en: 'Is a return possible if the shade is wrong?', fr: 'Le retour est-il possible si la teinte ne me va pas ?', it: 'È possibile il reso se la tonalità non va bene?', uk: 'Чи можна повернути, якщо відтінок не підійде?', lt: 'Ar galima grąžinti, jei atspalvis netiks?', ar: 'هل يمكن الإرجاع إذا لم تناسبني الدرجة؟' },
];

// ---------------------------------------------------------------------------
// MONTAGEM
// ---------------------------------------------------------------------------

/** Ucraniano e lituano põem o adjetivo ANTES do núcleo. É a única exceção de
 *  ordem. O inglês usa fragmento posposto ("in red") de propósito: assim o
 *  artigo de `orders.en` nunca precisa virar "an" por causa do adjetivo. */
const ADJ_BEFORE: LangCode[] = ['uk', 'lt'];

const SEP: Record<LangCode, string> = {
  es: ', ', pt: ', ', en: ', ', fr: ', ', it: ', ', uk: ', ', lt: ', ', ar: '، ',
};

const form = (a: Agreed[LangCode], slot: AgreeSlot): string =>
  typeof a === 'string' ? a : a[slot];

/** "Busco un pintalabios rojo, con acabado mate, por favor." */
export const buildMakeupRequest = (
  lang: LangCode,
  product: Product,
  picks: Partial<Record<DimKey, string>>,
): string => {
  const slot = product.agree[lang];
  let head = product.orders[lang];
  const tail: string[] = [];

  for (const key of product.dims) {          // a ordem da frase vem do produto
    const chosen = picks[key];
    if (!chosen) continue;
    const dim = DIMENSIONS.find((d) => d.key === key);
    const opt = dim?.options.find((o) => o.key === chosen);
    if (!dim || !opt) continue;
    const frag = form(opt.texts[lang], slot);
    if (dim.agrees && ADJ_BEFORE.includes(lang)) head = `${frag} ${head}`;
    else if (dim.agrees) head = `${head} ${frag}`;
    else tail.push(frag);
  }

  const body = head + tail.map((f) => SEP[lang] + f).join('');
  switch (lang) {
    case 'es': return `Busco ${body}, por favor.`;
    case 'pt': return `Estou procurando ${body}, por favor.`;
    case 'en': return `I'm looking for ${body}, please.`;
    case 'fr': return `Je cherche ${body}, s'il vous plaît.`;
    case 'it': return `Cerco ${body}, per favore.`;
    case 'uk': return `Шукаю ${body}, будь ласка.`;
    case 'lt': return `Ieškau ${body}, prašau.`;
    case 'ar': return `أبحث عن ${body}، من فضلك.`;
    default:   return `أبحث عن ${body}، من فضلك.`;
  }
};

/** "¿Tenéis una brocha?" */
export const buildToolPhrase = (lang: LangCode, frame: ToolFrame, tool: Tool): string => {
  const wantsGen = frame.gen?.includes(lang) ?? false;
  const genitive = lang === 'uk' ? tool.gen?.uk : lang === 'lt' ? tool.gen?.lt : undefined;
  const item = frame.use === 'names'
    ? tool.names[lang]
    : (wantsGen ? genitive : undefined) ?? tool.askFor[lang];
  return frame.templates[lang].replace('{item}', item);
};
