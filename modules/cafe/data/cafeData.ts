
// Módulo "Café e Tapas" — o que pedir num bar da Espanha.
// Aqui a tradução literal não serve: "café com leite" no Brasil e "café con leche"
// na Espanha não são a mesma bebida. Por isso cada item tem o nome local,
// uma explicação na língua de quem lê, e a proporção desenhada no copo.

import type { LangCode } from '../../location/data/locationData';

export type Text = Record<LangCode, string>;

// ---------------------------------------------------------------------------
// BEBIDAS
// ---------------------------------------------------------------------------
export type LayerKind = 'coffee' | 'milk' | 'water' | 'condensed' | 'liquor' | 'ice' | 'foam';

export const LAYER_COLOR: Record<LayerKind, string> = {
  coffee: '#4b2e1e',
  milk: '#f7f0e4',
  water: '#cbb49c',
  condensed: '#e6c67e',
  liquor: '#c07b3a',
  ice: '#dbeafe',
  foam: '#fffaf2',
};

export interface Drink {
  key: string;
  /** taza = xícara, vaso = copo de vidro. Na Espanha isso muda o pedido. */
  vessel: 'cup' | 'glass';
  /** Camadas de baixo para cima, somando 100. */
  layers: { kind: LayerKind; pct: number }[];
  names: Text;
  /** Frase de pedido já com artigo: "un cortado", "una leche manchada". */
  orders: Text;
  descs: Text;
}

export const DRINKS: Drink[] = [
  {
    key: 'solo', vessel: 'cup',
    layers: [{ kind: 'coffee', pct: 100 }],
    names: { es: 'café solo', pt: 'café expresso', en: 'espresso', fr: 'expresso', it: 'caffè', uk: 'еспресо', lt: 'juoda kava', ar: 'قهوة سادة' },
    orders: { es: 'un café solo', pt: 'um expresso', en: 'an espresso', fr: 'un expresso', it: 'un caffè', uk: 'еспресо', lt: 'juodą kavą', ar: 'قهوة سادة' },
    descs: { es: 'Solo café, en taza pequeña.', pt: 'Só café, na xícara pequena. É o cafezinho puro.', en: 'Just coffee, small cup.', fr: 'Café seul, petite tasse.', it: 'Solo caffè, tazzina piccola.', uk: 'Тільки кава, маленька чашка.', lt: 'Tik kava, mažame puodelyje.', ar: 'قهوة فقط، فنجان صغير.' },
  },
  {
    key: 'cortado', vessel: 'glass',
    layers: [{ kind: 'coffee', pct: 72 }, { kind: 'milk', pct: 28 }],
    names: { es: 'cortado', pt: 'pingado', en: 'macchiato', fr: 'noisette', it: 'macchiato', uk: 'макіато', lt: 'kava su lašeliu pieno', ar: 'قهوة بقليل من الحليب' },
    orders: { es: 'un cortado', pt: 'um pingado', en: 'a macchiato', fr: 'une noisette', it: 'un macchiato', uk: 'макіато', lt: 'kavą su lašeliu pieno', ar: 'قهوة بقليل من الحليب' },
    descs: { es: 'Café con un poco de leche, casi siempre en vaso.', pt: 'Café com um pouco de leite, quase sempre no copo. É o mais pedido na Espanha.', en: 'Coffee with a splash of milk, usually in a small glass.', fr: 'Café avec un peu de lait, souvent dans un verre.', it: 'Caffè con poco latte, di solito nel bicchiere.', uk: 'Кава з невеликою кількістю молока, зазвичай у склянці.', lt: 'Kava su truputį pieno, beveik visada stiklinėje. Populiariausia Ispanijoje.', ar: 'قهوة مع قليل من الحليب، عادة في كأس.' },
  },
  {
    key: 'conLeche', vessel: 'cup',
    layers: [{ kind: 'coffee', pct: 50 }, { kind: 'milk', pct: 50 }],
    names: { es: 'café con leche', pt: 'café com leite', en: 'latte', fr: 'café au lait', it: 'caffellatte', uk: 'кава з молоком', lt: 'kava su pienu', ar: 'قهوة بالحليب' },
    orders: { es: 'un café con leche', pt: 'um café com leite', en: 'a latte', fr: 'un café au lait', it: 'un caffellatte', uk: 'каву з молоком', lt: 'kavą su pienu', ar: 'قهوة بالحليب' },
    descs: { es: 'Mitad café, mitad leche, en taza grande.', pt: 'Metade café, metade leite, na xícara grande. É o café da manhã espanhol.', en: 'Half coffee, half milk, large cup.', fr: 'Moitié café, moitié lait, grande tasse.', it: 'Metà caffè, metà latte, tazza grande.', uk: 'Половина кави, половина молока, велика чашка.', lt: 'Pusė kavos, pusė pieno, dideliame puodelyje. Ispaniški pusryčiai.', ar: 'نصف قهوة ونصف حليب، فنجان كبير.' },
  },
  {
    key: 'manchada', vessel: 'glass',
    layers: [{ kind: 'coffee', pct: 15 }, { kind: 'milk', pct: 85 }],
    names: { es: 'leche manchada', pt: 'leite com pingo de café', en: 'milk with a dash of coffee', fr: 'lait taché', it: 'latte macchiato', uk: 'молоко з краплею кави', lt: 'pienas su lašeliu kavos', ar: 'حليب بقليل من القهوة' },
    orders: { es: 'una leche manchada', pt: 'um leite com pingo de café', en: 'a milk with a dash of coffee', fr: 'un lait taché', it: 'un latte macchiato', uk: 'молоко з краплею кави', lt: 'pieną su lašeliu kavos', ar: 'حليب بقليل من القهوة' },
    descs: { es: 'Leche con muy poco café. Lo contrario del cortado.', pt: 'Leite com pouquíssimo café. É o contrário do cortado.', en: 'Milk with just a stain of coffee.', fr: 'Du lait avec très peu de café.', it: 'Latte con pochissimo caffè.', uk: 'Молоко з дуже малою кількістю кави.', lt: 'Pienas su labai mažai kavos. Priešingybė cortado.', ar: 'حليب مع القليل جدًا من القهوة.' },
  },
  {
    key: 'americano', vessel: 'cup',
    layers: [{ kind: 'coffee', pct: 40 }, { kind: 'water', pct: 60 }],
    names: { es: 'café americano', pt: 'café americano', en: 'americano', fr: 'café allongé', it: 'caffè lungo', uk: 'американо', lt: 'amerikietiška kava', ar: 'قهوة أمريكية' },
    orders: { es: 'un café americano', pt: 'um café americano', en: 'an americano', fr: 'un café allongé', it: 'un caffè lungo', uk: 'американо', lt: 'amerikietišką kavą', ar: 'قهوة أمريكية' },
    descs: { es: 'Café solo con agua caliente. Más largo y más suave.', pt: 'Expresso com água quente. Mais longo e mais fraco.', en: 'Espresso with hot water added.', fr: 'Expresso allongé avec de l\'eau chaude.', it: 'Caffè allungato con acqua calda.', uk: 'Еспресо з гарячою водою.', lt: 'Kava su karštu vandeniu. Ilgesnė ir švelnesnė.', ar: 'قهوة مع ماء ساخن.' },
  },
  {
    key: 'bombon', vessel: 'glass',
    layers: [{ kind: 'condensed', pct: 50 }, { kind: 'coffee', pct: 50 }],
    names: { es: 'café bombón', pt: 'café com leite condensado', en: 'espresso with condensed milk', fr: 'café au lait concentré', it: 'caffè con latte condensato', uk: 'кава зі згущеним молоком', lt: 'kava su kondensuotu pienu', ar: 'قهوة بالحليب المكثف' },
    orders: { es: 'un café bombón', pt: 'um café com leite condensado', en: 'an espresso with condensed milk', fr: 'un café au lait concentré', it: 'un caffè con latte condensato', uk: 'каву зі згущеним молоком', lt: 'kavą su kondensuotu pienu', ar: 'قهوة بالحليب المكثف' },
    descs: { es: 'Café con leche condensada. Muy dulce, típico de Valencia.', pt: 'Café com leite condensado. Bem doce, típico de Valência.', en: 'Espresso over condensed milk. Very sweet.', fr: 'Café sur du lait concentré sucré.', it: 'Caffè con latte condensato, molto dolce.', uk: 'Кава зі згущеним молоком, дуже солодка.', lt: 'Kava su kondensuotu pienu. Labai saldi, būdinga Valensijai.', ar: 'قهوة مع حليب مكثف، حلوة جدًا.' },
  },
  {
    key: 'carajillo', vessel: 'glass',
    layers: [{ kind: 'coffee', pct: 78 }, { kind: 'liquor', pct: 22 }],
    names: { es: 'carajillo', pt: 'café com conhaque', en: 'coffee with liquor', fr: 'café arrosé', it: 'caffè corretto', uk: 'кава з алкоголем', lt: 'kava su alkoholiu', ar: 'قهوة بالكحول' },
    orders: { es: 'un carajillo', pt: 'um café com conhaque', en: 'a coffee with liquor', fr: 'un café arrosé', it: 'un caffè corretto', uk: 'каву з алкоголем', lt: 'kavą su alkoholiu', ar: 'قهوة بالكحول' },
    descs: { es: 'Café con un chorro de licor, casi siempre brandy o ron.', pt: 'Café com um pouco de destilado, quase sempre conhaque ou rum.', en: 'Coffee with a shot of brandy or rum.', fr: 'Café avec un trait de brandy ou de rhum.', it: 'Caffè con un goccio di brandy o rum.', uk: 'Кава з бренді або ромом.', lt: 'Kava su brendžiu arba romu.', ar: 'قهوة مع القليل من البراندي أو الروم.' },
  },
  {
    key: 'conHielo', vessel: 'glass',
    layers: [{ kind: 'ice', pct: 55 }, { kind: 'coffee', pct: 45 }],
    names: { es: 'café con hielo', pt: 'café com gelo', en: 'iced coffee', fr: 'café glacé', it: 'caffè freddo', uk: 'кава з льодом', lt: 'kava su ledukais', ar: 'قهوة مثلجة' },
    orders: { es: 'un café con hielo', pt: 'um café com gelo', en: 'an iced coffee', fr: 'un café glacé', it: 'un caffè freddo', uk: 'каву з льодом', lt: 'kavą su ledukais', ar: 'قهوة مثلجة' },
    descs: { es: 'Te dan el café caliente y un vaso con hielo aparte. Lo viertes tú.', pt: 'Vem o café quente e um copo de gelo separado. Você mesmo despeja.', en: 'Hot coffee plus a separate glass of ice. You pour it yourself.', fr: 'Le café chaud et un verre de glaçons à part. Vous versez vous-même.', it: 'Caffè caldo e un bicchiere di ghiaccio a parte. Lo versi tu.', uk: 'Гаряча кава і склянка з льодом окремо. Ви наливаєте самі.', lt: 'Duoda karštą kavą ir atskirai stiklinę su ledukais. Pilate patys.', ar: 'قهوة ساخنة وكأس ثلج منفصل. تسكبها بنفسك.' },
  },
  {
    key: 'descafeinado', vessel: 'cup',
    layers: [{ kind: 'coffee', pct: 45 }, { kind: 'milk', pct: 55 }],
    names: { es: 'descafeinado de máquina', pt: 'descafeinado da máquina', en: 'decaf from the machine', fr: 'déca de la machine', it: 'decaffeinato dalla macchina', uk: 'декаф з кавомашини', lt: 'bekofeininė iš aparato', ar: 'قهوة منزوعة الكافيين من الآلة' },
    orders: { es: 'un descafeinado de máquina con leche', pt: 'um descafeinado da máquina com leite', en: 'a decaf latte from the machine', fr: 'un déca au lait de la machine', it: 'un decaffeinato dalla macchina con latte', uk: 'декаф з кавомашини з молоком', lt: 'bekofeininę kavą su pienu iš aparato', ar: 'قهوة منزوعة الكافيين من الآلة بالحليب' },
    descs: { es: 'Pide "de máquina": si no, te dan un sobre de café soluble.', pt: 'Peça "de máquina". Se não pedir, vem um saquinho de café solúvel para dissolver.', en: 'Ask for "de máquina", otherwise you get an instant coffee sachet.', fr: 'Demandez "de máquina", sinon on vous sert un sachet soluble.', it: 'Chiedi "de máquina", altrimenti ti danno una bustina solubile.', uk: 'Просіть "de máquina", інакше дадуть пакетик розчинної кави.', lt: 'Prašykite „de máquina“, kitaip duos tirpios kavos pakelį.', ar: 'اطلب "de máquina"، وإلا سيعطونك كيس قهوة سريعة الذوبان.' },
  },
];

// ---------------------------------------------------------------------------
// COMO PEDIR (modificadores que entram na frase)
// ---------------------------------------------------------------------------
export interface Modifier { key: string; labels: Text; texts: Text }

export const MODIFIERS: Modifier[] = [
  { key: 'glass',  labels: { es: 'en vaso', pt: 'no copo', en: 'in a glass', fr: 'dans un verre', it: 'nel bicchiere', uk: 'у склянці', lt: 'stiklinėje', ar: 'في كأس' },
                   texts:  { es: ' en vaso', pt: ' no copo', en: ' in a glass', fr: ' dans un verre', it: ' nel bicchiere', uk: ' у склянці', lt: ' stiklinėje', ar: ' في كأس' } },
  { key: 'cup',    labels: { es: 'en taza', pt: 'na xícara', en: 'in a cup', fr: 'en tasse', it: 'in tazza', uk: 'у чашці', lt: 'puodelyje', ar: 'في فنجان' },
                   texts:  { es: ' en taza', pt: ' na xícara', en: ' in a cup', fr: ' en tasse', it: ' in tazza', uk: ' у чашці', lt: ' puodelyje', ar: ' في فنجان' } },
  { key: 'warm',   labels: { es: 'templado', pt: 'morno', en: 'warm', fr: 'tiède', it: 'tiepido', uk: 'теплий', lt: 'drungną', ar: 'دافئ' },
                   texts:  { es: ' templado', pt: ' morno', en: ', warm', fr: ' tiède', it: ' tiepido', uk: ' теплий', lt: ' drungną', ar: ' دافئ' } },
  { key: 'hot',    labels: { es: 'muy caliente', pt: 'bem quente', en: 'very hot', fr: 'très chaud', it: 'molto caldo', uk: 'дуже гарячий', lt: 'labai karštą', ar: 'ساخن جدًا' },
                   texts:  { es: ' muy caliente', pt: ' bem quente', en: ', very hot', fr: ' très chaud', it: ' molto caldo', uk: ' дуже гарячий', lt: ' labai karštą', ar: ' ساخن جدًا' } },
  { key: 'coldMilk', labels: { es: 'con leche fría', pt: 'com leite frio', en: 'with cold milk', fr: 'au lait froid', it: 'con latte freddo', uk: 'з холодним молоком', lt: 'su šaltu pienu', ar: 'بحليب بارد' },
                   texts:  { es: ' con la leche fría', pt: ' com leite frio', en: ' with cold milk', fr: ' au lait froid', it: ' con latte freddo', uk: ' з холодним молоком', lt: ' su šaltu pienu', ar: ' بحليب بارد' } },
  { key: 'noSugar', labels: { es: 'sin azúcar', pt: 'sem açúcar', en: 'no sugar', fr: 'sans sucre', it: 'senza zucchero', uk: 'без цукру', lt: 'be cukraus', ar: 'بدون سكر' },
                   texts:  { es: ' sin azúcar', pt: ' sem açúcar', en: ', no sugar', fr: ' sans sucre', it: ' senza zucchero', uk: ' без цукру', lt: ' be cukraus', ar: ' بدون سكر' } },
  { key: 'takeaway', labels: { es: 'para llevar', pt: 'para viagem', en: 'to take away', fr: 'à emporter', it: 'da portare via', uk: 'з собою', lt: 'išsinešti', ar: 'للأخذ' },
                   texts:  { es: ' para llevar', pt: ' para viagem', en: ' to take away', fr: ' à emporter', it: ' da portare via', uk: ' з собою', lt: ' išsinešti', ar: ' للأخذ' } },
];

// ---------------------------------------------------------------------------
// PORÇÕES E FORMATOS
// ---------------------------------------------------------------------------
export interface Portion { key: string; emoji: string; names: Text; descs: Text }

export const PORTIONS: Portion[] = [
  { key: 'tapa', emoji: '🫒',
    names: { es: 'la tapa', pt: 'a tapa', en: 'the tapa', fr: 'la tapa', it: 'la tapa', uk: 'тапа', lt: 'tapa', ar: 'التاباس' },
    descs: { es: 'Porción pequeña que acompaña a la bebida. En algunas ciudades es gratis.', pt: 'Porção pequena que vem com a bebida. Em algumas cidades é de graça.', en: 'Small portion served with your drink. Free in some cities.', fr: 'Petite portion servie avec la boisson. Gratuite dans certaines villes.', it: 'Piccola porzione servita con la bevanda. In alcune città è gratis.', uk: 'Мала порція до напою. У деяких містах безкоштовно.', lt: 'Maža porcija prie gėrimo. Kai kuriuose miestuose nemokama.', ar: 'حصة صغيرة تقدم مع المشروب. مجانية في بعض المدن.' } },
  { key: 'pincho', emoji: '🍢',
    names: { es: 'el pincho', pt: 'o pincho', en: 'the pincho', fr: 'le pincho', it: 'il pincho', uk: 'пінчо', lt: 'pincho', ar: 'البينتشو' },
    descs: { es: 'Bocado sobre pan, sujeto con un palillo. Se paga y es típico del norte.', pt: 'Petisco sobre pão, preso com palito. É pago e típico do norte.', en: 'A bite on bread held by a toothpick. Paid, typical in the north.', fr: 'Une bouchée sur du pain tenue par un pic. Payant, typique du nord.', it: 'Un boccone su pane con uno stecchino. A pagamento, tipico del nord.', uk: 'Закуска на хлібі зі шпажкою. Платна, типова для півночі.', lt: 'Kąsnelis ant duonos su dantų krapštuku. Mokama, būdinga šiaurei.', ar: 'لقمة على الخبز مثبتة بعود. مدفوعة، شائعة في الشمال.' } },
  { key: 'racion', emoji: '🍽️',
    names: { es: 'la ración', pt: 'a porção inteira', en: 'the full plate', fr: 'la portion entière', it: 'la porzione intera', uk: 'повна порція', lt: 'pilna porcija', ar: 'الطبق الكامل' },
    descs: { es: 'Plato grande para compartir entre varios.', pt: 'Prato grande para dividir entre várias pessoas.', en: 'A big plate meant to be shared.', fr: 'Grande assiette à partager.', it: 'Piatto grande da condividere.', uk: 'Велика тарілка, щоб ділитися.', lt: 'Didelė lėkštė, skirta dalintis.', ar: 'طبق كبير للمشاركة.' } },
  { key: 'media', emoji: '🥄',
    names: { es: 'la media ración', pt: 'a meia porção', en: 'the half plate', fr: 'la demi-portion', it: 'la mezza porzione', uk: 'половина порції', lt: 'pusė porcijos', ar: 'نصف طبق' },
    descs: { es: 'La mitad de una ración. Suele bastar para dos personas.', pt: 'Metade da porção. Costuma dar para duas pessoas.', en: 'Half a ración. Usually enough for two.', fr: 'La moitié d\'une portion. Suffit souvent pour deux.', it: 'Metà porzione. Di solito basta per due.', uk: 'Половина порції. Зазвичай вистачає на двох.', lt: 'Pusė porcijos. Paprastai užtenka dviem.', ar: 'نصف الحصة. تكفي عادة لشخصين.' } },
  { key: 'montadito', emoji: '🥪',
    names: { es: 'el montadito', pt: 'o sanduíche pequeno', en: 'the small sandwich', fr: 'le petit sandwich', it: 'il panino piccolo', uk: 'маленький сендвіч', lt: 'mažas sumuštinis', ar: 'شطيرة صغيرة' },
    descs: { es: 'Bocadillo pequeño, del tamaño de dos bocados.', pt: 'Sanduichinho, do tamanho de duas mordidas.', en: 'A tiny sandwich, about two bites.', fr: 'Un tout petit sandwich, deux bouchées.', it: 'Un panino piccolissimo, due morsi.', uk: 'Маленький сендвіч на два укуси.', lt: 'Labai mažas sumuštinis, dviejų kąsnių dydžio.', ar: 'شطيرة صغيرة بحجم قضمتين.' } },
  { key: 'menu', emoji: '📋',
    names: { es: 'el menú del día', pt: 'o menu do dia', en: 'the set lunch', fr: 'le menu du jour', it: 'il menù del giorno', uk: 'комплексний обід', lt: 'dienos meniu', ar: 'قائمة اليوم' },
    descs: { es: 'Primero, segundo, postre, pan y bebida por un precio fijo. Solo al mediodía.', pt: 'Entrada, prato principal, sobremesa, pão e bebida por preço fixo. Só no almoço.', en: 'Starter, main, dessert, bread and a drink for one fixed price. Lunch only.', fr: 'Entrée, plat, dessert, pain et boisson à prix fixe. Le midi seulement.', it: 'Primo, secondo, dolce, pane e bevanda a prezzo fisso. Solo a pranzo.', uk: 'Перше, друге, десерт, хліб і напій за фіксовану ціну. Тільки в обід.', lt: 'Pirmas, antras patiekalas, desertas, duona ir gėrimas už fiksuotą kainą. Tik per pietus.', ar: 'مقبلات وطبق رئيسي وحلوى وخبز ومشروب بسعر ثابت. وقت الغداء فقط.' } },
  { key: 'primero', emoji: '1️⃣',
    names: { es: 'de primero', pt: 'de entrada', en: 'as a starter', fr: 'en entrée', it: 'come primo', uk: 'на перше', lt: 'pirmas patiekalas', ar: 'كطبق أول' },
    descs: { es: 'El primer plato del menú. Suele ser sopa, ensalada o pasta.', pt: 'O primeiro prato do menu. Costuma ser sopa, salada ou massa.', en: 'The first course. Usually soup, salad or pasta.', fr: 'Le premier plat. Souvent soupe, salade ou pâtes.', it: 'Il primo piatto. Di solito zuppa, insalata o pasta.', uk: 'Перша страва: суп, салат або паста.', lt: 'Pirmas patiekalas: sriuba, salotos arba makaronai.', ar: 'الطبق الأول: شوربة أو سلطة أو معكرونة.' } },
  { key: 'segundo', emoji: '2️⃣',
    names: { es: 'de segundo', pt: 'de prato principal', en: 'as a main', fr: 'en plat principal', it: 'come secondo', uk: 'на друге', lt: 'antras patiekalas', ar: 'كطبق رئيسي' },
    descs: { es: 'El plato principal: carne o pescado.', pt: 'O prato principal: carne ou peixe.', en: 'The main course: meat or fish.', fr: 'Le plat principal : viande ou poisson.', it: 'Il secondo: carne o pesce.', uk: 'Основна страва: м\'ясо або риба.', lt: 'Pagrindinis patiekalas: mėsa arba žuvis.', ar: 'الطبق الرئيسي: لحم أو سمك.' } },
  { key: 'picar', emoji: '🤝',
    names: { es: 'para picar', pt: 'para beliscar', en: 'to nibble', fr: 'à grignoter', it: 'da sgranocchiare', uk: 'щоб перекусити', lt: 'užkandžiauti', ar: 'للتذوق' },
    descs: { es: 'Algo ligero para compartir antes de comer.', pt: 'Algo leve para dividir antes da refeição.', en: 'Something light to share before the meal.', fr: 'Quelque chose de léger à partager avant le repas.', it: 'Qualcosa di leggero da condividere prima.', uk: 'Щось легке, щоб поділитися перед їжею.', lt: 'Kažkas lengvo pasidalinti prieš valgį.', ar: 'شيء خفيف للمشاركة قبل الأكل.' } },
  { key: 'cana', emoji: '🍺',
    names: { es: 'la caña', pt: 'o chope pequeno', en: 'the small draft beer', fr: 'le demi', it: 'la birra piccola', uk: 'мале розливне пиво', lt: 'mažas alus', ar: 'بيرة صغيرة' },
    descs: { es: 'Cerveza de barril en vaso pequeño. Lo normal en un bar.', pt: 'Chope em copo pequeno. É o padrão no bar espanhol.', en: 'Small draft beer. The default order in a bar.', fr: 'Petite bière pression. La commande standard.', it: 'Birra alla spina piccola. L\'ordine standard.', uk: 'Мале розливне пиво. Стандартне замовлення в барі.', lt: 'Mažas išpilstytas alus. Įprastas užsakymas bare.', ar: 'بيرة صغيرة من البرميل. الطلب المعتاد في البار.' } },
];

// ---------------------------------------------------------------------------
// FRASES DO BAR
// ---------------------------------------------------------------------------
export const CAFE_QUESTIONS: Text[] = [
  { es: '¿Qué tapas tenéis?', pt: 'Que tapas vocês têm?', en: 'What tapas do you have?', fr: 'Quelles tapas avez-vous ?', it: 'Che tapas avete?', uk: 'Які у вас тапас?', lt: 'Kokių tapų turite?', ar: 'ما التاباس المتوفرة؟' },
  { es: '¿Tienen menú del día?', pt: 'Tem menu do dia?', en: 'Do you have a set lunch?', fr: 'Avez-vous un menu du jour ?', it: 'Avete il menù del giorno?', uk: 'У вас є комплексний обід?', lt: 'Ar turite dienos meniu?', ar: 'هل لديكم قائمة اليوم؟' },
  { es: '¿La tapa está incluida?', pt: 'A tapa está incluída?', en: 'Is the tapa included?', fr: 'La tapa est-elle comprise ?', it: 'La tapa è inclusa?', uk: 'Тапа входить у ціну?', lt: 'Ar tapa įskaičiuota?', ar: 'هل التاباس مشمولة؟' },
  { es: 'Una ración para compartir, por favor.', pt: 'Uma porção para dividir, por favor.', en: 'One plate to share, please.', fr: 'Une portion à partager, s\'il vous plaît.', it: 'Una porzione da condividere, per favore.', uk: 'Одну порцію, щоб поділитися, будь ласка.', lt: 'Vieną porciją pasidalinti, prašau.', ar: 'حصة واحدة للمشاركة، من فضلك.' },
  { es: '¿Me pones la cuenta?', pt: 'Pode trazer a conta?', en: 'Can I have the bill?', fr: 'L\'addition, s\'il vous plaît ?', it: 'Mi porta il conto?', uk: 'Можна рахунок?', lt: 'Ar galiu gauti sąskaitą?', ar: 'الحساب من فضلك؟' },
  { es: '¿Se puede pagar con tarjeta?', pt: 'Dá para pagar com cartão?', en: 'Can I pay by card?', fr: 'Puis-je payer par carte ?', it: 'Posso pagare con la carta?', uk: 'Можна оплатити карткою?', lt: 'Ar galima mokėti kortele?', ar: 'هل يمكن الدفع بالبطاقة؟' },
  { es: '¿Tiene gluten?', pt: 'Tem glúten?', en: 'Does it contain gluten?', fr: 'Est-ce que ça contient du gluten ?', it: 'Contiene glutine?', uk: 'Чи містить глютен?', lt: 'Ar jame yra glitimo?', ar: 'هل يحتوي على الغلوتين؟' },
  { es: 'Soy vegetariano.', pt: 'Sou vegetariano.', en: 'I am vegetarian.', fr: 'Je suis végétarien.', it: 'Sono vegetariano.', uk: 'Я вегетаріанець.', lt: 'Aš vegetaras.', ar: 'أنا نباتي.' },
];

// ---------------------------------------------------------------------------
// MONTAGEM DO PEDIDO
// ---------------------------------------------------------------------------
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Un cortado en vaso, por favor." */
export const buildOrder = (lang: LangCode, drink: Drink, mods: Modifier[]): string => {
  const body = drink.orders[lang] + mods.map((m) => m.texts[lang]).join('');
  switch (lang) {
    case 'es': return `${cap(body)}, por favor.`;
    case 'pt': return `${cap(body)}, por favor.`;
    case 'en': return `${cap(body)}, please.`;
    case 'fr': return `${cap(body)}, s'il vous plaît.`;
    case 'it': return `${cap(body)}, per favore.`;
    case 'uk': return `${cap(body)}, будь ласка.`;
    case 'lt': return `${cap(body)}, prašau.`;
    default:   return `${body}، من فضلك.`;
  }
};
