// Módulo "Cuidar de idosos" — quem trabalha cuidando de uma pessoa idosa na casa dela.
//
// FRONTEIRA DESTE ARQUIVO, para ninguém responder a mesma pergunta duas vezes:
//   • aqui   → falar COM a pessoa cuidada, relatar SOBRE ela, e os objetos do cuidado
//   • "Onde dói" (`body/data/bodyData.ts`) → a própria pessoa descreve o PRÓPRIO corpo
//     em 1ª pessoa, ao farmacêutico. Nada daquele boneco, daqueles sintomas nem
//     daquelas durações é repetido aqui: o que falta lá é justamente a inversão da
//     pessoa, e é só isso que este módulo acrescenta.
//   • farmácia (`pharmacy/data/`) → remédio, princípio ativo, marca, equivalência
//   • limpeza da casa é MÓDULO IRMÃO, ainda por escrever. Nada de tarefa doméstica aqui.
//
// ---------------------------------------------------------------------------
// A REGRA QUE ORGANIZA O ARQUIVO: cada eixo é dono de metade, e eles NUNCA se multiplicam.
// ---------------------------------------------------------------------------
//   • falar COM ela  → eixo TRATAMENTO (usted/tú). Nenhuma frase leva adjetivo que
//     concorde com o gênero dela: usa-se `tener` + substantivo ("¿Tiene frío?",
//     "¿Tiene sueño?") no lugar de `estar` + adjetivo ("¿Está destemplado?"). É o
//     mesmo desvio que `makeupData.ts` adotou para não concordar com o produto.
//   • falar SOBRE ela → eixo GÊNERO (senhora/senhor). Não tem tratamento: não se
//     trata ninguém de "usted" quando se fala DELA para a família.
//   • objetos e emergência → nenhum eixo.
// Nenhuma frase chega a quatro formas. No máximo duas.
//
// EXCEÇÃO, e ela precisa estar aqui em cima: em ÁRABE a 2ª pessoa e o imperativo
// concordam com o gênero de QUEM OUVE (`اجلسي` / `اجلس`), e a cortesia é lexical
// (`حضرتك`), nunca morfológica. Não modele cortesia árabe como conjugação. Por isso
// o lado "falar com ela" guarda `usted.ar` (feminino) e `arM` (masculino) — um eixo,
// duas formas — e a linha de apoio mostra as duas separadas por barra, porque ali não
// existe seletor de gênero. Árabe é `originOnly`: nunca é destino, nunca é falado.
//
// SEGUNDA ARMADILHA DE GÊNERO, a que quase passa batida: em UCRANIANO o passado
// concorda com o SUJEITO, então "я допомогла" denunciaria o gênero de quem CUIDA —
// um terceiro eixo que não pode entrar. Por isso o lado "falar com ela" evita passado
// e condicional de 1ª pessoa em `uk` (usa-se "Вам допомогти?", infinitivo). Pelo mesmo
// motivo `medTaken` em `uk` é impessoal ("Ранкова таблетка вже випита?") e por isso
// coincide nos dois tratamentos — junto com `pt`, são os dois únicos idiomas em que a
// coincidência é aceitável, e há teste garantindo que es/fr/it/lt sempre diferem.
//
// ---------------------------------------------------------------------------
// SEGURANÇA — a regra que decide se o módulo pode existir
// ---------------------------------------------------------------------------
// NUNCA nome de medicamento, NUNCA dose, NUNCA quantidade de comprimido. Horário e
// adesão sim ("a pastilha da manhã"); o resto é a Farmácia. Período do dia, nunca
// relógio: hora é o módulo Números. O único algarismo permitido no arquivo é o 112,
// e só dentro de `EMERGENCY`. Há teste varrendo todas as strings dos oito idiomas.
//
// ⚠️ CONTEÚDO NÃO REVISADO POR FALANTE NATIVO, e aqui o risco é maior que na
// Maquiagem: lá errar é constrangimento, aqui é dano. Vale o alerta da seção 10 do
// AGENTS.md. O par que importa é es-ES × pt-BR, e os pontos de maior risco são, nesta
// ordem: `absorbente`, `empapador`, `pasamanos`, `bastón`, `tensiómetro`, `andador`,
// e a naturalidade das reescritas sem concordância em espanhol peninsular.

import type { LangCode } from '../../location/data/locationData';

export type Text = Record<LangCode, string>;

/** Tratamento com que se fala COM a pessoa cuidada. */
export type Treat = 'usted' | 'tu';

/** Gênero da pessoa cuidada. Só o relato usa. */
export type Gender = 'f' | 'm';

/**
 * Frase dita A ELA.
 *
 * `treat` → flexiona por tratamento. `en` fica de fora de `tu` porque o inglês não
 *           distingue, e `ar` também, porque lá quem flexiona é o gênero de quem ouve
 *           (ver o cabeçalho): `usted.ar` guarda o feminino e `arM` o masculino.
 * `same`  → não flexiona em língua nenhuma. Existe para que "não muda" seja uma
 *           afirmação escrita no dado, e não um campo esquecido.
 */
export type Spoken =
  | {
      kind: 'treat';
      usted: Text;
      tu: Record<Exclude<LangCode, 'en' | 'ar'>, string>;
      /** Árabe, 2ª pessoa masculina. */
      arM: string;
    }
  | { kind: 'same'; text: Text };

/**
 * Frase dita SOBRE ela, à família ou ao médico. Nunca tem tratamento.
 * `m` ausente num idioma = aquele idioma não muda (espanhol, português e italiano
 * com particípio de `haber`/`ter`/`avere` não concordam, e é por isso que a maioria
 * dos eventos só traz `en`, `fr`, `uk`, `lt` e `ar` aqui).
 */
export interface Told {
  f: Text;
  m?: Partial<Record<LangCode, string>>;
}

/** Resolve a frase dita a ela. Em árabe mostra as duas formas: não há seletor ali. */
export const say = (s: Spoken, lang: LangCode, treat: Treat): string => {
  if (s.kind === 'same') return s.text[lang];
  if (lang === 'ar') return s.usted.ar === s.arM ? s.usted.ar : `${s.usted.ar} / ${s.arM}`;
  if (lang === 'en' || treat === 'usted') return s.usted[lang];
  return s.tu[lang];
};

/** Resolve a frase dita sobre ela. Idioma sem forma masculina = idioma que não muda. */
export const tellClause = (t: Told, lang: LangCode, g: Gender): string =>
  (g === 'm' ? t.m?.[lang] : undefined) ?? t.f[lang];

// ---------------------------------------------------------------------------
// FALAR COM ELA
// ---------------------------------------------------------------------------

export type CareGroup = 'move' | 'hygiene' | 'dress' | 'meal' | 'meds' | 'rest' | 'comfort' | 'outing';

/** Ordem em que os grupos aparecem na tela. */
export const CARE_GROUPS: CareGroup[] = ['move', 'hygiene', 'dress', 'meal', 'meds', 'rest', 'comfort', 'outing'];

export interface CareAction {
  key: string;
  group: CareGroup;
  /** Rótulo curto do botão, na língua de quem lê. */
  labels: Text;
  says: Spoken;
  /** Armadilha, na língua de quem lê. */
  note?: Text;
}

export const CARE_ACTIONS: CareAction[] = [
  {
    key: 'sit', group: 'move',
    labels: { es: 'Sentarse', pt: 'Sentar', en: 'Sit down', fr: "S'asseoir", it: 'Sedersi', uk: 'Сісти', lt: 'Atsisėsti', ar: 'الجلوس' },
    says: {
      kind: 'treat',
      usted: { es: 'Siéntese, por favor.', pt: 'Sente-se, por favor.', en: 'Please sit down.', fr: "Asseyez-vous, s'il vous plaît.", it: 'Si sieda, per favore.', uk: 'Сідайте, будь ласка.', lt: 'Atsisėskite, prašau.', ar: 'اجلسي من فضلك.' },
      tu: { es: 'Siéntate, por favor.', pt: 'Senta aqui, por favor.', fr: "Assieds-toi, s'il te plaît.", it: 'Siediti, per favore.', uk: 'Сідай, будь ласка.', lt: 'Atsisėsk, prašau.' },
      arM: 'اجلس من فضلك.',
    },
  },
  {
    key: 'standUp', group: 'move',
    labels: { es: 'Levantarse', pt: 'Levantar', en: 'Get up', fr: 'Se lever', it: 'Alzarsi', uk: 'Встати', lt: 'Atsikelti', ar: 'النهوض' },
    // Inclusiva ("vamos"): não há 2ª pessoa, então não há o que flexionar.
    says: { kind: 'same', text: { es: 'Vamos a levantarnos despacio.', pt: 'Vamos levantar devagar.', en: "Let's get up slowly.", fr: 'On va se lever doucement.', it: 'Alziamoci piano.', uk: 'Вставаймо поволі.', lt: 'Kelkimės pamažu.', ar: 'لنقم ببطء.' } },
  },
  {
    key: 'leanOnMe', group: 'move',
    labels: { es: 'Apoyarse', pt: 'Se apoiar', en: 'Lean on me', fr: "S'appuyer", it: 'Appoggiarsi', uk: 'Спертися', lt: 'Atsiremti', ar: 'الاتكاء' },
    says: {
      kind: 'treat',
      usted: { es: 'Apóyese en mi brazo.', pt: 'Apoie-se no meu braço.', en: 'Lean on my arm.', fr: 'Appuyez-vous sur mon bras.', it: 'Si appoggi al mio braccio.', uk: 'Тримайтеся за мою руку.', lt: 'Atsiremkite į mano ranką.', ar: 'اتكئي على ذراعي.' },
      tu: { es: 'Apóyate en mi brazo.', pt: 'Apoia no meu braço.', fr: 'Appuie-toi sur mon bras.', it: 'Appoggiati al mio braccio.', uk: 'Тримайся за мою руку.', lt: 'Atsiremk į mano ranką.' },
      arM: 'اتكئ على ذراعي.',
    },
    note: {
      es: 'En italiano el pronombre cambia de lado: "Si appoggi" con usted, "Appoggiati" con tú. No es una terminación: es otra palabra en otro sitio.',
      pt: 'Em italiano o pronome troca de lado: "Si appoggi" no formal, "Appoggiati" no informal. Não é só a terminação que muda — é outra palavra em outro lugar da frase.',
      en: 'In Italian the pronoun moves: "Si appoggi" formally, "Appoggiati" informally. Not just an ending — a different word in a different place.',
      fr: "En italien le pronom change de place : « Si appoggi » au vouvoiement, « Appoggiati » au tutoiement.",
      it: 'In spagnolo il pronome resta attaccato al verbo in entrambi i casi: "Apóyese", "Apóyate".',
      uk: 'В італійській займенник змінює місце: «Si appoggi» на «ви», «Appoggiati» на «ти».',
      lt: 'Italų kalboje įvardis keičia vietą: „Si appoggi“ mandagiai, „Appoggiati“ familiariai.',
      ar: 'في الإيطالية يتغير موضع الضمير: «Si appoggi» في المخاطبة الرسمية و«Appoggiati» في غير الرسمية.',
    },
  },
  {
    key: 'step', group: 'move',
    labels: { es: 'El escalón', pt: 'O degrau', en: 'The step', fr: 'La marche', it: 'Il gradino', uk: 'Сходинка', lt: 'Laiptelis', ar: 'الدرجة' },
    // Nominal em árabe de propósito: "انتبه" seria imperativo, e imperativo árabe
    // concorda com quem ouve. "هنا درجة" não tem verbo e serve aos dois.
    says: { kind: 'same', text: { es: 'Cuidado, aquí hay un escalón.', pt: 'Cuidado, aqui tem um degrau.', en: "Careful, there's a step here.", fr: 'Attention, il y a une marche.', it: "Attenzione, c'è un gradino.", uk: 'Обережно, тут сходинка.', lt: 'Atsargiai, čia laiptelis.', ar: 'هنا درجة.' } },
  },
  {
    key: 'shower', group: 'hygiene',
    labels: { es: 'La ducha', pt: 'O banho', en: 'Shower', fr: 'La douche', it: 'La doccia', uk: 'Душ', lt: 'Dušas', ar: 'الاستحمام' },
    says: {
      kind: 'treat',
      // uk: infinitivo ("Вам допомогти?") e não "щоб я допомогла" — o passado
      // ucraniano de 1ª pessoa denunciaria o gênero de quem cuida.
      usted: { es: '¿Quiere que le ayude con la ducha?', pt: 'Quer que eu ajude no banho?', en: 'Would you like help with the shower?', fr: 'Voulez-vous que je vous aide pour la douche ?', it: "Vuole che L'aiuti con la doccia?", uk: 'Вам допомогти з душем?', lt: 'Ar norite pagalbos duše?', ar: 'هل تريدين مساعدة في الاستحمام؟' },
      tu: { es: '¿Quieres que te ayude con la ducha?', pt: 'Quer que eu ajude no banho?', fr: "Tu veux que je t'aide pour la douche ?", it: 'Vuoi che ti aiuti con la doccia?', uk: 'Тобі допомогти з душем?', lt: 'Ar nori pagalbos duše?' },
      arM: 'هل تريد مساعدة في الاستحمام؟',
    },
  },
  {
    key: 'waterTemp', group: 'hygiene',
    labels: { es: 'La temperatura', pt: 'A temperatura', en: 'Temperature', fr: 'La température', it: 'La temperatura', uk: 'Температура', lt: 'Temperatūra', ar: 'الحرارة' },
    says: { kind: 'same', text: { es: '¿Está buena el agua?', pt: 'A água está boa?', en: 'Is the water okay?', fr: "L'eau est bonne ?", it: "L'acqua va bene?", uk: 'Вода нормальна?', lt: 'Ar vanduo geras?', ar: 'هل الماء مناسب؟' } },
  },
  {
    key: 'jacket', group: 'dress',
    labels: { es: 'La chaqueta', pt: 'O casaco', en: 'The jacket', fr: 'La veste', it: 'La giacca', uk: 'Кофта', lt: 'Striukė', ar: 'السترة' },
    says: {
      kind: 'treat',
      usted: { es: '¿Quiere ponerse la chaqueta?', pt: 'Quer vestir o casaco?', en: 'Would you like to put on your jacket?', fr: 'Voulez-vous mettre votre veste ?', it: 'Vuole mettersi la giacca?', uk: 'Хочете вдягнути кофту?', lt: 'Ar norite apsivilkti striukę?', ar: 'هل تريدين ارتداء السترة؟' },
      tu: { es: '¿Quieres ponerte la chaqueta?', pt: 'Quer vestir o casaco?', fr: 'Tu veux mettre ta veste ?', it: 'Vuoi metterti la giacca?', uk: 'Хочеш вдягнути кофту?', lt: 'Ar nori apsivilkti striukę?' },
      arM: 'هل تريد ارتداء السترة؟',
    },
  },
  {
    key: 'hungry', group: 'meal',
    labels: { es: 'Hambre', pt: 'Fome', en: 'Hungry', fr: 'Faim', it: 'Fame', uk: 'Голод', lt: 'Alkis', ar: 'الجوع' },
    says: {
      kind: 'treat',
      // "¿Tiene hambre?" e não "¿Está hambriento?": substantivo não concorda com ela.
      // Em uk e lt o mesmo motivo obriga "хочете їсти" / "norite valgyti", porque
      // "голодний/голодна" e "alkanas/alkana" flexionam.
      usted: { es: '¿Tiene hambre?', pt: 'Está com fome?', en: 'Are you hungry?', fr: 'Avez-vous faim ?', it: 'Ha fame?', uk: 'Ви хочете їсти?', lt: 'Ar norite valgyti?', ar: 'هل تشعرين بالجوع؟' },
      tu: { es: '¿Tienes hambre?', pt: 'Está com fome?', fr: 'Tu as faim ?', it: 'Hai fame?', uk: 'Ти хочеш їсти?', lt: 'Ar nori valgyti?' },
      arM: 'هل تشعر بالجوع؟',
    },
  },
  {
    key: 'water', group: 'meal',
    labels: { es: 'Agua', pt: 'Água', en: 'Water', fr: 'Eau', it: 'Acqua', uk: 'Вода', lt: 'Vanduo', ar: 'ماء' },
    says: {
      kind: 'treat',
      usted: { es: 'Le traigo un vaso de agua.', pt: 'Vou trazer um copo de água.', en: "I'll bring you a glass of water.", fr: "Je vous apporte un verre d'eau.", it: "Le porto un bicchiere d'acqua.", uk: 'Я принесу вам склянку води.', lt: 'Atnešiu jums stiklinę vandens.', ar: 'سأحضر لكِ كوب ماء.' },
      tu: { es: 'Te traigo un vaso de agua.', pt: 'Vou trazer um copo de água.', fr: "Je t'apporte un verre d'eau.", it: "Ti porto un bicchiere d'acqua.", uk: 'Я принесу тобі склянку води.', lt: 'Atnešiu tau stiklinę vandens.' },
      arM: 'سأحضر لك كوب ماء.',
    },
  },
  {
    key: 'medTaken', group: 'meds',
    labels: { es: 'La pastilla', pt: 'O comprimido', en: 'The pill', fr: 'Le cachet', it: 'La pastiglia', uk: 'Таблетка', lt: 'Tabletė', ar: 'الحبة' },
    says: {
      kind: 'treat',
      // uk impessoal nas duas formas: o passado ucraniano concorda com quem ouve
      // ("випив"/"випила") e aqui não existe seletor de gênero. Ver o cabeçalho.
      usted: { es: '¿Ya se ha tomado la pastilla de la mañana?', pt: 'Já tomou o comprimido da manhã?', en: 'Have you taken your morning pill?', fr: 'Avez-vous pris votre cachet du matin ?', it: 'Ha già preso la pastiglia del mattino?', uk: 'Ранкова таблетка вже випита?', lt: 'Ar jau išgėrėte rytinę tabletę?', ar: 'هل أخذتِ حبة الصباح؟' },
      tu: { es: '¿Ya te has tomado la pastilla de la mañana?', pt: 'Já tomou o comprimido da manhã?', fr: 'Tu as pris ton cachet du matin ?', it: 'Hai già preso la pastiglia del mattino?', uk: 'Ранкова таблетка вже випита?', lt: 'Ar jau išgėrei rytinę tabletę?' },
      arM: 'هل أخذتَ حبة الصباح؟',
    },
    note: {
      es: 'Pregunte por el momento, nunca por la cantidad. El nombre del medicamento y la dosis son cosa del médico y de la farmacia; esta app no entra ahí.',
      pt: 'Pergunte pelo horário, nunca pela quantidade. Nome do remédio e dose são conversa de médico e de farmácia — o app não entra aí, e é de propósito.',
      en: 'Ask about timing, never about amount. Drug names and doses belong to the doctor and the pharmacy; this app stays out of it.',
      fr: "Demandez le moment, jamais la quantité. Le nom du médicament et la dose relèvent du médecin et de la pharmacie ; l'appli n'y touche pas.",
      it: 'Chieda il momento, mai la quantità. Nome del farmaco e dose sono cosa del medico e della farmacia; qui non si entra.',
      uk: 'Питайте про час, ніколи про кількість. Назва ліків і доза — справа лікаря й аптеки, і застосунок туди не втручається.',
      lt: 'Klauskite apie laiką, niekada apie kiekį. Vaisto pavadinimas ir dozė — gydytojo ir vaistinės reikalas.',
      ar: 'اسألي عن الوقت، لا عن الكمية أبداً. اسم الدواء والجرعة من شأن الطبيب والصيدلية، والتطبيق لا يدخل في ذلك.',
    },
  },
  {
    key: 'medTime', group: 'meds',
    labels: { es: 'Hora de la pastilla', pt: 'Hora do comprimido', en: 'Pill time', fr: "L'heure du cachet", it: 'Ora della pastiglia', uk: 'Час таблетки', lt: 'Tabletės laikas', ar: 'وقت الحبة' },
    // Período do dia, nunca relógio: hora é o módulo Números.
    says: { kind: 'same', text: { es: 'Es la hora de la pastilla de la noche.', pt: 'Está na hora do comprimido da noite.', en: "It's time for the evening pill.", fr: "C'est l'heure du cachet du soir.", it: "È l'ora della pastiglia della sera.", uk: 'Час вечірньої таблетки.', lt: 'Metas vakarinei tabletei.', ar: 'حان وقت حبة المساء.' } },
  },
  {
    key: 'sleepy', group: 'rest',
    labels: { es: 'Sueño', pt: 'Sono', en: 'Sleepy', fr: 'Sommeil', it: 'Sonno', uk: 'Сон', lt: 'Miegas', ar: 'النعاس' },
    says: {
      kind: 'treat',
      usted: { es: '¿Tiene sueño?', pt: 'Está com sono?', en: 'Are you sleepy?', fr: 'Avez-vous sommeil ?', it: 'Ha sonno?', uk: 'Ви хочете спати?', lt: 'Ar norite miego?', ar: 'هل تشعرين بالنعاس؟' },
      tu: { es: '¿Tienes sueño?', pt: 'Está com sono?', fr: 'Tu as sommeil ?', it: 'Hai sonno?', uk: 'Ти хочеш спати?', lt: 'Ar nori miego?' },
      arM: 'هل تشعر بالنعاس؟',
    },
  },
  {
    key: 'lieDown', group: 'rest',
    labels: { es: 'Echarse', pt: 'Deitar', en: 'Lie down', fr: "S'allonger", it: 'Sdraiarsi', uk: 'Лягти', lt: 'Atsigulti', ar: 'الاستلقاء' },
    says: {
      kind: 'treat',
      usted: { es: '¿Quiere echarse un rato?', pt: 'Quer deitar um pouco?', en: 'Would you like to lie down for a while?', fr: 'Voulez-vous vous allonger un moment ?', it: 'Vuole sdraiarsi un momento?', uk: 'Хочете трохи полежати?', lt: 'Ar norite šiek tiek pagulėti?', ar: 'هل تريدين الاستلقاء قليلاً؟' },
      tu: { es: '¿Quieres echarte un rato?', pt: 'Quer deitar um pouco?', fr: "Tu veux t'allonger un moment ?", it: 'Vuoi sdraiarti un momento?', uk: 'Хочеш трохи полежати?', lt: 'Ar nori šiek tiek pagulėti?' },
      arM: 'هل تريد الاستلقاء قليلاً؟',
    },
  },
  {
    key: 'cold', group: 'comfort',
    labels: { es: 'Frío', pt: 'Frio', en: 'Cold', fr: 'Froid', it: 'Freddo', uk: 'Холод', lt: 'Šalta', ar: 'البرد' },
    says: {
      kind: 'treat',
      usted: { es: '¿Tiene frío?', pt: 'Está com frio?', en: 'Are you cold?', fr: 'Avez-vous froid ?', it: 'Ha freddo?', uk: 'Вам холодно?', lt: 'Ar jums šalta?', ar: 'هل تشعرين بالبرد؟' },
      tu: { es: '¿Tienes frío?', pt: 'Está com frio?', fr: 'Tu as froid ?', it: 'Hai freddo?', uk: 'Тобі холодно?', lt: 'Ar tau šalta?' },
      arM: 'هل تشعر بالبرد؟',
    },
  },
  {
    key: 'pain', group: 'comfort',
    labels: { es: 'Dolor', pt: 'Dor', en: 'Pain', fr: 'Douleur', it: 'Dolore', uk: 'Біль', lt: 'Skausmas', ar: 'الألم' },
    says: {
      kind: 'treat',
      usted: { es: '¿Le duele algo?', pt: 'Está doendo alguma coisa?', en: 'Does anything hurt?', fr: 'Avez-vous mal quelque part ?', it: 'Le fa male qualcosa?', uk: 'Вас щось болить?', lt: 'Ar jums kas nors skauda?', ar: 'هل يؤلمكِ شيء؟' },
      tu: { es: '¿Te duele algo?', pt: 'Está doendo alguma coisa?', fr: 'Tu as mal quelque part ?', it: 'Ti fa male qualcosa?', uk: 'Тебе щось болить?', lt: 'Ar tau kas nors skauda?' },
      arM: 'هل يؤلمك شيء؟',
    },
  },
  {
    key: 'here', group: 'comfort',
    labels: { es: 'Estoy aquí', pt: 'Estou aqui', en: "I'm here", fr: 'Je suis là', it: 'Sono qui', uk: 'Я поруч', lt: 'Aš čia', ar: 'أنا هنا' },
    says: {
      kind: 'treat',
      usted: { es: 'Estoy aquí, no se preocupe.', pt: 'Estou aqui, não se preocupe.', en: "I'm here, don't worry.", fr: "Je suis là, ne vous inquiétez pas.", it: 'Sono qui, non si preoccupi.', uk: 'Я поруч, не хвилюйтеся.', lt: 'Aš čia, nesijaudinkite.', ar: 'أنا هنا، لا تقلقي.' },
      tu: { es: 'Estoy aquí, no te preocupes.', pt: 'Estou aqui, não precisa se preocupar.', fr: "Je suis là, ne t'inquiète pas.", it: 'Sono qui, non ti preoccupare.', uk: 'Я поруч, не хвилюйся.', lt: 'Aš čia, nesijaudink.' },
      arM: 'أنا هنا، لا تقلق.',
    },
  },
  {
    key: 'walk', group: 'outing',
    labels: { es: 'Pasear', pt: 'Passear', en: 'Go for a walk', fr: 'Se promener', it: 'Passeggiare', uk: 'Прогулянка', lt: 'Pasivaikščiojimas', ar: 'النزهة' },
    says: {
      kind: 'treat',
      usted: { es: '¿Quiere salir a dar un paseo?', pt: 'Quer sair para dar uma volta?', en: 'Would you like to go for a walk?', fr: 'Voulez-vous sortir vous promener ?', it: 'Vuole uscire a fare due passi?', uk: 'Хочете вийти прогулятися?', lt: 'Ar norite išeiti pasivaikščioti?', ar: 'هل تريدين الخروج للتنزه؟' },
      tu: { es: '¿Quieres salir a dar un paseo?', pt: 'Quer sair para dar uma volta?', fr: 'Tu veux sortir te promener ?', it: 'Vuoi uscire a fare due passi?', uk: 'Хочеш вийти прогулятися?', lt: 'Ar nori išeiti pasivaikščioti?' },
      arM: 'هل تريد الخروج للتنزه؟',
    },
  },
];

// ---------------------------------------------------------------------------
// CONTAR À FAMÍLIA
// ---------------------------------------------------------------------------
// As orações vêm SEM maiúscula inicial e SEM ponto: quem capitaliza e fecha é
// `buildReport`, porque o marcador de tempo entra na frente. Nenhuma oração traz
// tempo embutido — senão "cette nuit elle n'a pas dormi de la nuit".

export type ReportGroup = 'meal' | 'rest' | 'body' | 'mood' | 'incident';

export const REPORT_GROUPS: ReportGroup[] = ['meal', 'rest', 'body', 'mood', 'incident'];

export interface ReportEvent {
  key: string;
  group: ReportGroup;
  labels: Text;
  says: Told;
}

export const REPORT_EVENTS: ReportEvent[] = [
  {
    key: 'ateLittle', group: 'meal',
    labels: { es: 'Poca comida', pt: 'Pouca comida', en: 'Little food', fr: 'Peu mangé', it: 'Poco cibo', uk: 'Мало їжі', lt: 'Mažai maisto', ar: 'أكل قليل' },
    says: {
      f: { es: 'ha comido poco', pt: 'comeu pouco', en: 'she ate very little', fr: 'elle a peu mangé', it: 'ha mangiato poco', uk: 'вона мало їла', lt: 'ji mažai valgė', ar: 'أكلت قليلاً' },
      m: { en: 'he ate very little', fr: 'il a peu mangé', uk: 'він мало їв', lt: 'jis mažai valgė', ar: 'أكل قليلاً' },
    },
  },
  {
    key: 'refusedPill', group: 'meal',
    labels: { es: 'Pastilla rechazada', pt: 'Recusa do comprimido', en: 'Pill refused', fr: 'Cachet refusé', it: 'Pastiglia rifiutata', uk: 'Відмова від таблетки', lt: 'Tabletės atsisakymas', ar: 'رفض الحبة' },
    says: {
      f: { es: 'no ha querido tomarse la pastilla', pt: 'não quis tomar o comprimido', en: "she didn't want to take her pill", fr: "elle n'a pas voulu prendre son cachet", it: 'non ha voluto prendere la pastiglia', uk: 'вона не захотіла випити таблетку', lt: 'ji nenorėjo išgerti tabletės', ar: 'لم ترد أخذ الحبة' },
      m: { en: "he didn't want to take his pill", fr: "il n'a pas voulu prendre son cachet", uk: 'він не захотів випити таблетку', lt: 'jis nenorėjo išgerti tabletės', ar: 'لم يرد أخذ الحبة' },
    },
  },
  {
    key: 'noSleep', group: 'rest',
    labels: { es: 'Mal sueño', pt: 'Sono ruim', en: 'Poor sleep', fr: 'Mauvais sommeil', it: 'Sonno disturbato', uk: 'Поганий сон', lt: 'Blogas miegas', ar: 'نوم سيئ' },
    says: {
      f: { es: 'no ha dormido bien', pt: 'não dormiu bem', en: "she didn't sleep well", fr: "elle n'a pas bien dormi", it: 'non ha dormito bene', uk: 'вона погано спала', lt: 'ji blogai miegojo', ar: 'لم تنم جيداً' },
      m: { en: "he didn't sleep well", fr: "il n'a pas bien dormi", uk: 'він погано спав', lt: 'jis blogai miegojo', ar: 'لم ينم جيداً' },
    },
  },
  {
    key: 'fever', group: 'body',
    labels: { es: 'Fiebre', pt: 'Febre', en: 'Fever', fr: 'Fièvre', it: 'Febbre', uk: 'Температура', lt: 'Temperatūra', ar: 'حمى' },
    says: {
      f: { es: 'ha tenido fiebre', pt: 'teve febre', en: "she's had a fever", fr: 'elle a eu de la fièvre', it: 'ha avuto la febbre', uk: 'у неї була температура', lt: 'jai buvo temperatūros', ar: 'كانت لديها حمى' },
      m: { en: "he's had a fever", fr: 'il a eu de la fièvre', uk: 'у нього була температура', lt: 'jam buvo temperatūros', ar: 'كانت لديه حمى' },
    },
  },
  {
    key: 'dizzy', group: 'body',
    labels: { es: 'Mareos', pt: 'Tontura', en: 'Dizziness', fr: 'Vertiges', it: 'Giramenti di testa', uk: 'Запаморочення', lt: 'Galvos svaigimas', ar: 'دوار' },
    says: {
      f: { es: 'ha tenido mareos', pt: 'teve tontura', en: "she's been dizzy", fr: 'elle a eu des vertiges', it: 'ha avuto giramenti di testa', uk: 'у неї паморочилася голова', lt: 'jai svaigo galva', ar: 'شعرت بدوار' },
      m: { en: "he's been dizzy", fr: 'il a eu des vertiges', uk: 'у нього паморочилася голова', lt: 'jam svaigo galva', ar: 'شعر بدوار' },
    },
  },
  {
    key: 'painComplaint', group: 'body',
    labels: { es: 'Dolor', pt: 'Dor', en: 'Pain', fr: 'Douleur', it: 'Dolore', uk: 'Біль', lt: 'Skausmas', ar: 'ألم' },
    says: {
      f: { es: 'se ha quejado de dolor', pt: 'reclamou de dor', en: 'she complained of pain', fr: "elle s'est plainte de douleurs", it: 'si è lamentata di dolori', uk: 'вона скаржилася на біль', lt: 'ji skundėsi skausmu', ar: 'اشتكت من ألم' },
      m: { en: 'he complained of pain', fr: "il s'est plaint de douleurs", it: 'si è lamentato di dolori', uk: 'він скаржився на біль', lt: 'jis skundėsi skausmu', ar: 'اشتكى من ألم' },
    },
  },
  {
    key: 'walked', group: 'body',
    labels: { es: 'Paseo por casa', pt: 'Caminhada em casa', en: 'A short walk', fr: 'Petite marche', it: 'Due passi in casa', uk: 'Коротка прогулянка', lt: 'Trumpas pasivaikščiojimas', ar: 'مشي قصير' },
    says: {
      f: { es: 'ha caminado un poco por el pasillo', pt: 'caminhou um pouco pelo corredor', en: 'she walked a little in the hallway', fr: 'elle a marché un peu dans le couloir', it: "ha camminato un po' in corridoio", uk: 'вона трохи пройшлася коридором', lt: 'ji šiek tiek pavaikščiojo koridoriuje', ar: 'مشت قليلاً في الممر' },
      m: { en: 'he walked a little in the hallway', fr: 'il a marché un peu dans le couloir', uk: 'він трохи пройшовся коридором', lt: 'jis šiek tiek pavaikščiojo koridoriuje', ar: 'مشى قليلاً في الممر' },
    },
  },
  {
    key: 'calm', group: 'mood',
    labels: { es: 'Tranquilidad', pt: 'Tranquilidade', en: 'Calm', fr: 'Calme', it: 'Tranquillità', uk: 'Спокій', lt: 'Ramybė', ar: 'هدوء' },
    // Aqui os OITO idiomas mudam: é o exemplo de que o eixo de gênero é real e
    // não um enfeite. Compare com `ateLittle`, em que es/pt/it não mudam.
    says: {
      f: { es: 'ha estado tranquila', pt: 'esteve tranquila', en: "she's been calm", fr: 'elle a été tranquille', it: 'è stata tranquilla', uk: 'вона була спокійна', lt: 'ji buvo rami', ar: 'كانت هادئة' },
      m: { es: 'ha estado tranquilo', pt: 'esteve tranquilo', en: "he's been calm", fr: 'il a été tranquille', it: 'è stato tranquillo', uk: 'він був спокійний', lt: 'jis buvo ramus', ar: 'كان هادئاً' },
    },
  },
  {
    key: 'disoriented', group: 'mood',
    labels: { es: 'Desorientación', pt: 'Desorientação', en: 'Confusion', fr: 'Désorientation', it: 'Disorientamento', uk: 'Розгубленість', lt: 'Pasimetimas', ar: 'تشوش' },
    says: {
      f: { es: 'ha estado más desorientada', pt: 'esteve mais desorientada', en: "she's been more confused", fr: 'elle a été plus désorientée', it: 'è stata più disorientata', uk: 'вона була більш розгублена', lt: 'ji buvo labiau pasimetusi', ar: 'كانت أكثر تشوشاً' },
      m: { es: 'ha estado más desorientado', pt: 'esteve mais desorientado', en: "he's been more confused", fr: 'il a été plus désorienté', it: 'è stato più disorientato', uk: 'він був більш розгублений', lt: 'jis buvo labiau pasimetęs', ar: 'كان أكثر تشوشاً' },
    },
  },
  {
    key: 'fell', group: 'incident',
    labels: { es: 'Caída', pt: 'Queda', en: 'A fall', fr: 'Chute', it: 'Caduta', uk: 'Падіння', lt: 'Griuvimas', ar: 'سقوط' },
    says: {
      // O `у`/`в` protético do ucraniano segue o som anterior: depois de "вона"
      // (vogal) vem "впала", depois de "він" (consoante) vem "упав". As duas formas
      // são escritas à mão justamente porque nenhuma regra acerta isso sozinha.
      f: { es: 'se ha caído en el baño', pt: 'caiu no banheiro', en: 'she fell in the bathroom', fr: 'elle est tombée dans la salle de bain', it: 'è caduta in bagno', uk: 'вона впала у ванній', lt: 'ji nukrito vonioje', ar: 'سقطت في الحمام' },
      m: { en: 'he fell in the bathroom', fr: 'il est tombé dans la salle de bain', it: 'è caduto in bagno', uk: 'він упав у ванній', lt: 'jis nukrito vonioje', ar: 'سقط في الحمام' },
    },
  },
  {
    key: 'leak', group: 'incident',
    labels: { es: 'Escape', pt: 'Escape', en: 'Accident', fr: 'Fuite', it: 'Incidente', uk: 'Конфуз', lt: 'Nelaimė', ar: 'تسرب' },
    // Sem `m` de propósito, e o motivo muda de língua para língua: em es/pt/it o
    // verbo não concorda com ninguém (`ha tenido`, `houve`), e nas outras a
    // construção é impessoal de raiz. O resultado é o mesmo: uma forma só.
    says: {
      f: { es: 'ha tenido un escape', pt: 'houve um escape', en: 'there was an accident', fr: 'il y a eu une fuite', it: "c'è stato un incidente", uk: 'стався конфуз', lt: 'įvyko nelaimė', ar: 'حدث تسرب' },
    },
  },
  {
    key: 'callDoctor', group: 'incident',
    labels: { es: 'Llamar al médico', pt: 'Chamar o médico', en: 'Call the doctor', fr: 'Appeler le médecin', it: 'Chiamare il medico', uk: 'Викликати лікаря', lt: 'Kviesti gydytoją', ar: 'استدعاء الطبيب' },
    says: {
      f: { es: 'creo que habría que llamar al médico', pt: 'acho que seria bom chamar o médico', en: 'I think we should call the doctor', fr: "je pense qu'il faudrait appeler le médecin", it: 'credo che bisognerebbe chiamare il medico', uk: 'думаю, треба викликати лікаря', lt: 'manau, reikėtų kviesti gydytoją', ar: 'أعتقد أنه ينبغي استدعاء الطبيب' },
    },
  },
];

export interface WhenTag {
  key: string;
  /** Fragmento sem espaço na ponta: quem junta é `buildReport`. */
  phrases: Text;
}

export const WHEN_TAGS: WhenTag[] = [
  { key: 'today', phrases: { es: 'hoy', pt: 'hoje', en: 'today', fr: "aujourd'hui", it: 'oggi', uk: 'сьогодні', lt: 'šiandien', ar: 'اليوم' } },
  { key: 'morning', phrases: { es: 'esta mañana', pt: 'hoje de manhã', en: 'this morning', fr: 'ce matin', it: 'stamattina', uk: 'сьогодні вранці', lt: 'šį rytą', ar: 'هذا الصباح' } },
  { key: 'night', phrases: { es: 'esta noche', pt: 'esta noite', en: 'last night', fr: 'cette nuit', it: 'stanotte', uk: 'цієї ночі', lt: 'šią naktį', ar: 'الليلة الماضية' } },
  { key: 'yesterday', phrases: { es: 'desde ayer', pt: 'desde ontem', en: 'since yesterday', fr: 'depuis hier', it: 'da ieri', uk: 'від учора', lt: 'nuo vakar', ar: 'منذ أمس' } },
  { key: 'week', phrases: { es: 'esta semana', pt: 'esta semana', en: 'this week', fr: 'cette semaine', it: 'questa settimana', uk: 'цього тижня', lt: 'šią savaitę', ar: 'هذا الأسبوع' } },
];

// ---------------------------------------------------------------------------
// OBJETOS DO CUIDADO
// ---------------------------------------------------------------------------
// CONVENÇÃO DE CASO, e ela varia POR QUADRO — é onde este arquivo é mais difícil
// que o da Maquiagem, em que o caso era fixo por módulo:
//   • `Ar turite…?` (lt) → ACUSATIVO      ("turėti" rege acusativo)
//   • `Ieškau…`    (lt) → GENITIVO        (igual à Maquiagem)
//   • `Я шукаю…`   (uk) → ACUSATIVO
//   • ar → INDEFINIDO, sem o artigo "ال". É o OPOSTO de `locationData.ts`. Há teste.
// Ucraniano NÃO ganha um quadro com "потрібна/потрібен": esse adjetivo concorda com
// a COISA, não com a pessoa, e um `{item}` único sairia errado em metade dos objetos.

export type ToolGroup = 'mobility' | 'bed' | 'health' | 'bath';

export const TOOL_GROUPS: ToolGroup[] = ['mobility', 'bed', 'health', 'bath'];

export interface CareTool {
  key: string;
  group: ToolGroup;
  /** Nominativo / definido. É o rótulo, e o que o quadro de preço usa. */
  names: Text;
  /** Indefinido / acusativo. Entra nos quadros de pedido. */
  askFor: Text;
  /** Genitivo, onde o verbo do quadro reger. */
  gen?: { uk?: string; lt?: string };
  /** Idiomas em que o objeto é PLURAL. Marcado só onde for; o resto é singular. */
  num?: Partial<Record<LangCode, 'pl'>>;
  /** Armadilha de nome, na língua de quem lê. */
  note?: Text;
}

export const CARE_TOOLS: CareTool[] = [
  {
    key: 'walker', group: 'mobility',
    names: { es: 'el andador', pt: 'o andador', en: 'the walking frame', fr: 'le déambulateur', it: 'il deambulatore', uk: 'ходунки', lt: 'vaikštynė', ar: 'مشاية' },
    askFor: { es: 'un andador', pt: 'um andador', en: 'a walking frame', fr: 'un déambulateur', it: 'un deambulatore', uk: 'ходунки', lt: 'vaikštynę', ar: 'مشاية' },
    gen: { uk: 'ходунків', lt: 'vaikštynės' },
    num: { uk: 'pl' },
    note: {
      es: 'En casa mucha gente dice "taca-taca". En la ortopedia y en el médico la palabra es "andador".',
      pt: 'Em casa muita gente diz "taca-taca", mas quem trabalha na ortopedia e o médico usam "andador". Vale saber as duas.',
      en: 'At home many people say "taca-taca" in Spain. At the orthopaedic shop and the doctor, the word is "andador".',
      fr: "En Espagne, beaucoup disent « taca-taca » à la maison ; chez l'orthopédiste, c'est « andador ».",
      it: 'In Spagna in casa molti dicono "taca-taca"; in ortopedia si dice "andador".',
      uk: 'В Іспанії вдома часто кажуть «taca-taca», але в ортопедії та в лікаря — «andador».',
      lt: 'Ispanijoje namuose dažnai sako „taca-taca“, bet ortopedijoje ir pas gydytoją — „andador“.',
      ar: 'في إسبانيا يقول كثيرون في البيت «taca-taca»، أما في محل الأجهزة الطبية وعند الطبيب فالكلمة «andador».',
    },
  },
  {
    key: 'wheelchair', group: 'mobility',
    names: { es: 'la silla de ruedas', pt: 'a cadeira de rodas', en: 'the wheelchair', fr: 'le fauteuil roulant', it: 'la sedia a rotelle', uk: 'візок', lt: 'vežimėlis', ar: 'كرسي متحرك' },
    askFor: { es: 'una silla de ruedas', pt: 'uma cadeira de rodas', en: 'a wheelchair', fr: 'un fauteuil roulant', it: 'una sedia a rotelle', uk: 'візок', lt: 'vežimėlį', ar: 'كرسي متحرك' },
    gen: { uk: 'візка', lt: 'vežimėlio' },
    note: {
      es: 'En francés es "fauteuil roulant", nunca "chaise roulante".',
      pt: 'Em francês é "fauteuil roulant", nunca "chaise roulante" — a tradução direta de "cadeira" não funciona aqui.',
      en: 'In French it is "fauteuil roulant", never "chaise roulante".',
      fr: '« Chaise roulante » ne se dit pas : c\'est « fauteuil roulant ».',
      it: 'In francese si dice "fauteuil roulant", mai "chaise roulante".',
      uk: 'Французькою — «fauteuil roulant», ніколи «chaise roulante».',
      lt: 'Prancūziškai — „fauteuil roulant“, niekada „chaise roulante“.',
      ar: 'بالفرنسية تُقال «fauteuil roulant» ولا تُقال «chaise roulante» أبداً.',
    },
  },
  {
    key: 'cane', group: 'mobility',
    names: { es: 'el bastón', pt: 'a bengala', en: 'the walking stick', fr: 'la canne', it: 'il bastone', uk: 'палиця', lt: 'lazda', ar: 'عصا' },
    askFor: { es: 'un bastón', pt: 'uma bengala', en: 'a walking stick', fr: 'une canne', it: 'un bastone', uk: 'палицю', lt: 'lazdą', ar: 'عصا' },
    gen: { uk: 'палиці', lt: 'lazdos' },
    note: {
      es: 'En portugués "bengala" es el bastón; en español "bengala" es fuego artificial de mano. El apoyo para andar es "el bastón".',
      pt: 'Cuidado: "bengala" em espanhol é fogo de artifício de mão. O apoio de andar é "el bastón" — pedir "una bengala" na ortopedia dá confusão.',
      en: 'Spanish "bengala" is a sparkler, not a walking stick. The walking aid is "el bastón".',
      fr: "En espagnol « bengala » est un cierge magique. La canne se dit « el bastón ».",
      it: 'In spagnolo "bengala" è la stella filante; il bastone da passeggio è "el bastón".',
      uk: 'Іспанською «bengala» — це бенгальський вогонь. Палиця для ходьби — «el bastón».',
      lt: 'Ispaniškai „bengala“ — bengališka ugnelė. Vaikščiojimo lazda yra „el bastón“.',
      ar: 'كلمة «bengala» بالإسبانية تعني شمعة الألعاب النارية. عصا المشي هي «el bastón».',
    },
  },
  {
    key: 'handrail', group: 'mobility',
    names: { es: 'el pasamanos', pt: 'o corrimão', en: 'the handrail', fr: 'la rampe', it: 'il corrimano', uk: 'поручень', lt: 'turėklas', ar: 'درابزين' },
    askFor: { es: 'un pasamanos', pt: 'um corrimão', en: 'a handrail', fr: 'une rampe', it: 'un corrimano', uk: 'поручень', lt: 'turėklą', ar: 'درابزين' },
    gen: { uk: 'поручня', lt: 'turėklo' },
    note: {
      es: 'Termina en -s y aun así es singular: "el pasamanos", "cuánto cuesta", nunca "cuestan".',
      pt: 'Termina em -s e mesmo assim é singular: "el pasamanos", "¿cuánto cuesta?", nunca "cuestan". A terminação engana.',
      en: 'It ends in -s but is singular: "el pasamanos", "cuánto cuesta", never "cuestan".',
      fr: "Se termine par -s mais reste singulier : « el pasamanos », « cuánto cuesta ».",
      it: 'Finisce in -s ma è singolare: "el pasamanos", "cuánto cuesta", mai "cuestan".',
      uk: 'Закінчується на -s, але однина: «el pasamanos», «cuánto cuesta», ніколи «cuestan».',
      lt: 'Baigiasi -s, bet yra vienaskaita: „el pasamanos“, „cuánto cuesta“, niekada „cuestan“.',
      ar: 'تنتهي بحرف -s لكنها مفردة: «el pasamanos» مع «cuánto cuesta» لا «cuestan».',
    },
  },
  {
    key: 'bedPad', group: 'bed',
    names: { es: 'el empapador', pt: 'o resguardo de cama', en: 'the bed pad', fr: "l'alèse", it: 'la traversa', uk: 'пелюшка', lt: 'paklotas', ar: 'واقي الفراش' },
    askFor: { es: 'un empapador', pt: 'um resguardo de cama', en: 'a bed pad', fr: 'une alèse', it: 'una traversa', uk: 'пелюшку', lt: 'paklotą', ar: 'واقي فراش' },
    gen: { uk: 'пелюшки', lt: 'pakloto' },
    note: {
      es: '"Resguardo" en español es el recibo de una compra. El protector de cama es "el empapador".',
      pt: 'Cuidado: "resguardo" em espanhol é recibo, comprovante. O forro de cama é "el empapador" — pedir "un resguardo" na farmácia devolve um papel.',
      en: 'Spanish "resguardo" means a receipt. The bed protector is "el empapador".',
      fr: "En espagnol « resguardo » veut dire reçu. L'alèse se dit « el empapador ».",
      it: 'In spagnolo "resguardo" è la ricevuta. La traversa è "el empapador".',
      uk: 'Іспанською «resguardo» — це квитанція. Захисна пелюшка — «el empapador».',
      lt: 'Ispaniškai „resguardo“ reiškia kvitą. Lovos apsauga yra „el empapador“.',
      ar: 'كلمة «resguardo» بالإسبانية تعني إيصالاً. واقي الفراش هو «el empapador».',
    },
  },
  {
    key: 'bedRail', group: 'bed',
    names: { es: 'la barandilla', pt: 'a grade da cama', en: 'the bed rail', fr: 'la barrière de lit', it: 'la sponda del letto', uk: 'бортик', lt: 'lovos apsauga', ar: 'حاجز السرير' },
    askFor: { es: 'una barandilla', pt: 'uma grade de cama', en: 'a bed rail', fr: 'une barrière de lit', it: 'una sponda del letto', uk: 'бортик', lt: 'lovos apsaugą', ar: 'حاجز سرير' },
    gen: { uk: 'бортика', lt: 'lovos apsaugos' },
  },
  {
    key: 'bedpan', group: 'bed',
    names: { es: 'la cuña', pt: 'a comadre', en: 'the bedpan', fr: 'le bassin', it: 'la padella', uk: 'судно', lt: 'basonas', ar: 'قصرية' },
    askFor: { es: 'una cuña', pt: 'uma comadre', en: 'a bedpan', fr: 'un bassin', it: 'una padella', uk: 'судно', lt: 'basoną', ar: 'قصرية' },
    gen: { uk: 'судна', lt: 'basono' },
  },
  {
    key: 'pad', group: 'bed',
    names: { es: 'el absorbente', pt: 'a fralda geriátrica', en: 'the incontinence pad', fr: 'la protection', it: 'il pannolone', uk: 'підгузок', lt: 'sauskelnės', ar: 'حفاض' },
    askFor: { es: 'un absorbente', pt: 'uma fralda geriátrica', en: 'an incontinence pad', fr: 'une protection', it: 'un pannolone', uk: 'підгузок', lt: 'sauskelnes', ar: 'حفاض' },
    gen: { uk: 'підгузка', lt: 'sauskelnių' },
    num: { lt: 'pl' },
    note: {
      es: '"Pañal" hace pensar en bebé. En la farmacia y en geriatría la palabra es "el absorbente".',
      pt: '"Pañal" faz pensar em bebê. Na farmácia e na geriatria a palavra é "el absorbente" — é a que evita constrangimento no balcão.',
      en: '"Pañal" suggests a baby. In the pharmacy and in geriatrics the word is "el absorbente".',
      fr: "« Pañal » évoque le bébé. En pharmacie et en gériatrie, on dit « el absorbente ».",
      it: '"Pañal" fa pensare al neonato. In farmacia e in geriatria si dice "el absorbente".',
      uk: '«Pañal» асоціюється з немовлям. В аптеці та в геріатрії кажуть «el absorbente».',
      lt: '„Pañal“ primena kūdikį. Vaistinėje ir geriatrijoje vartojama „el absorbente“.',
      ar: 'كلمة «pañal» توحي بالرضيع. في الصيدلية وطب المسنين تُستعمل «el absorbente».',
    },
  },
  {
    key: 'bpMonitor', group: 'health',
    names: { es: 'el tensiómetro', pt: 'o medidor de pressão', en: 'the blood pressure monitor', fr: 'le tensiomètre', it: 'il misuratore di pressione', uk: 'тонометр', lt: 'kraujospūdžio matuoklis', ar: 'جهاز قياس الضغط' },
    askFor: { es: 'un tensiómetro', pt: 'um medidor de pressão', en: 'a blood pressure monitor', fr: 'un tensiomètre', it: 'un misuratore di pressione', uk: 'тонометр', lt: 'kraujospūdžio matuoklį', ar: 'جهاز قياس ضغط' },
    gen: { uk: 'тонометра', lt: 'kraujospūdžio matuoklio' },
    note: {
      es: 'En España se toma "la tensión", no "la presión". El aparato es "el tensiómetro".',
      pt: 'Na Espanha se toma "la tensión", não "la presión" — e o aparelho é "el tensiómetro". "Medidor de presión" ninguém usa.',
      en: 'In Spain you take "la tensión", not "la presión", and the device is "el tensiómetro".',
      fr: "En Espagne on prend « la tensión », pas « la presión » ; l'appareil est « el tensiómetro ».",
      it: 'In Spagna si misura "la tensión", non "la presión"; lo strumento è "el tensiómetro".',
      uk: 'В Іспанії міряють «la tensión», а не «la presión»; прилад — «el tensiómetro».',
      lt: 'Ispanijoje matuojama „la tensión“, ne „la presión“; prietaisas — „el tensiómetro“.',
      ar: 'في إسبانيا يُقاس «la tensión» لا «la presión»، والجهاز اسمه «el tensiómetro».',
    },
  },
  {
    key: 'pillBox', group: 'health',
    names: { es: 'el pastillero', pt: 'a caixa de comprimidos', en: 'the pill organiser', fr: 'le pilulier', it: 'il portapillole', uk: 'таблетниця', lt: 'tablečių dėžutė', ar: 'علبة الأدوية' },
    askFor: { es: 'un pastillero', pt: 'uma caixa de comprimidos', en: 'a pill organiser', fr: 'un pilulier', it: 'un portapillole', uk: 'таблетницю', lt: 'tablečių dėžutę', ar: 'علبة أدوية' },
    gen: { uk: 'таблетниці', lt: 'tablečių dėžutės' },
  },
  {
    key: 'thermometer', group: 'health',
    names: { es: 'el termómetro', pt: 'o termômetro', en: 'the thermometer', fr: 'le thermomètre', it: 'il termometro', uk: 'термометр', lt: 'termometras', ar: 'ميزان الحرارة' },
    askFor: { es: 'un termómetro', pt: 'um termômetro', en: 'a thermometer', fr: 'un thermomètre', it: 'un termometro', uk: 'термометр', lt: 'termometrą', ar: 'ميزان حرارة' },
    gen: { uk: 'термометра', lt: 'termometro' },
  },
  {
    key: 'showerChair', group: 'bath',
    names: { es: 'la silla de ducha', pt: 'a cadeira de banho', en: 'the shower chair', fr: 'la chaise de douche', it: 'la sedia da doccia', uk: 'стілець для душу', lt: 'dušo kėdė', ar: 'كرسي الاستحمام' },
    askFor: { es: 'una silla de ducha', pt: 'uma cadeira de banho', en: 'a shower chair', fr: 'une chaise de douche', it: 'una sedia da doccia', uk: 'стілець для душу', lt: 'dušo kėdę', ar: 'كرسي استحمام' },
    gen: { uk: 'стільця для душу', lt: 'dušo kėdės' },
  },
  {
    key: 'nonSlipMat', group: 'bath',
    names: { es: 'la alfombrilla antideslizante', pt: 'o tapete antiderrapante', en: 'the non-slip mat', fr: 'le tapis antidérapant', it: 'il tappetino antiscivolo', uk: 'нековзний килимок', lt: 'neslystantis kilimėlis', ar: 'سجادة مانعة للانزلاق' },
    askFor: { es: 'una alfombrilla antideslizante', pt: 'um tapete antiderrapante', en: 'a non-slip mat', fr: 'un tapis antidérapant', it: 'un tappetino antiscivolo', uk: 'нековзний килимок', lt: 'neslystantį kilimėlį', ar: 'سجادة مانعة للانزلاق' },
    gen: { uk: 'нековзного килимка', lt: 'neslystančio kilimėlio' },
  },
  {
    key: 'bib', group: 'bath',
    names: { es: 'el babero', pt: 'o babador', en: 'the clothing protector', fr: 'le bavoir', it: 'il bavaglino', uk: 'слинявчик', lt: 'seilinukas', ar: 'مريلة' },
    askFor: { es: 'un babero', pt: 'um babador', en: 'a clothing protector', fr: 'un bavoir', it: 'un bavaglino', uk: 'слинявчик', lt: 'seilinuką', ar: 'مريلة' },
    gen: { uk: 'слинявчика', lt: 'seilinuko' },
  },
];

export interface ToolFrame {
  key: string;
  labels: Text;
  /** Contém "{item}". */
  templates: Text;
  /** Versão para objeto plural, onde o verbo do quadro concordar em número. */
  templatesPl?: Text;
  /** `askFor` = indefinido/acusativo; `names` = definido/nominativo. */
  use: 'askFor' | 'names';
  /** Idiomas em que o verbo do quadro rege genitivo. */
  gen?: LangCode[];
}

export const TOOL_FRAMES: ToolFrame[] = [
  {
    key: 'have', use: 'askFor',
    labels: { es: '¿Tienen…?', pt: 'Vocês têm…?', en: 'Do you have…?', fr: 'Avez-vous… ?', it: 'Avete…?', uk: 'Ви маєте…?', lt: 'Ar turite…?', ar: 'هل لديكم…؟' },
    templates: { es: '¿Tienen {item}?', pt: 'Vocês têm {item}?', en: 'Do you have {item}?', fr: 'Avez-vous {item} ?', it: 'Avete {item}?', uk: 'Ви маєте {item}?', lt: 'Ar turite {item}?', ar: 'هل لديكم {item}؟' },
  },
  {
    key: 'looking', use: 'askFor',
    // "Ieškau" rege GENITIVO em lituano; "Я шукаю" rege acusativo em ucraniano.
    gen: ['lt'],
    labels: { es: 'Busco…', pt: 'Estou procurando…', en: "I'm looking for…", fr: 'Je cherche…', it: 'Cerco…', uk: 'Я шукаю…', lt: 'Ieškau…', ar: 'أبحث عن…' },
    templates: { es: 'Busco {item}.', pt: 'Estou procurando {item}.', en: "I'm looking for {item}.", fr: 'Je cherche {item}.', it: 'Cerco {item}.', uk: 'Я шукаю {item}.', lt: 'Ieškau {item}.', ar: 'أبحث عن {item}.' },
  },
  {
    key: 'where', use: 'names',
    labels: { es: '¿Dónde está…?', pt: 'Onde está…?', en: 'Where is…?', fr: 'Où est… ?', it: "Dov'è…?", uk: 'Де…?', lt: 'Kur yra…?', ar: 'أين…؟' },
    templates: { es: '¿Dónde está {item}?', pt: 'Onde está {item}?', en: 'Where is {item}?', fr: 'Où est {item} ?', it: "Dov'è {item}?", uk: 'Де {item}?', lt: 'Kur yra {item}?', ar: 'أين {item}؟' },
    templatesPl: { es: '¿Dónde están {item}?', pt: 'Onde estão {item}?', en: 'Where are {item}?', fr: 'Où sont {item} ?', it: 'Dove sono {item}?', uk: 'Де {item}?', lt: 'Kur yra {item}?', ar: 'أين {item}؟' },
  },
  {
    key: 'price', use: 'names',
    labels: { es: '¿Cuánto cuesta…?', pt: 'Quanto custa…?', en: 'How much is…?', fr: 'Combien coûte… ?', it: 'Quanto costa…?', uk: 'Скільки коштує…?', lt: 'Kiek kainuoja…?', ar: 'كم ثمن…؟' },
    templates: { es: '¿Cuánto cuesta {item}?', pt: 'Quanto custa {item}?', en: 'How much is {item}?', fr: 'Combien coûte {item} ?', it: 'Quanto costa {item}?', uk: 'Скільки коштує {item}?', lt: 'Kiek kainuoja {item}?', ar: 'كم ثمن {item}؟' },
    templatesPl: { es: '¿Cuánto cuestan {item}?', pt: 'Quanto custam {item}?', en: 'How much are {item}?', fr: 'Combien coûtent {item} ?', it: 'Quanto costano {item}?', uk: 'Скільки коштують {item}?', lt: 'Kiek kainuoja {item}?', ar: 'كم ثمن {item}؟' },
  },
];

// ---------------------------------------------------------------------------
// EMERGÊNCIA
// ---------------------------------------------------------------------------
// Lista FIXA. Nada aqui é montado, nada aqui flexiona: é o único lugar do módulo em
// que a frase errada custa tempo de ambulância. O sujeito é "la persona" — substantivo
// próprio, de gênero próprio — justamente para que nenhuma frase precise saber se é
// senhor ou senhora, já que aqui não existe seletor.

/** Número único de emergência na União Europeia. */
export const EMERGENCY_NUMBER = '112';

export const EMERGENCY: Text[] = [
  { es: 'Necesito una ambulancia.', pt: 'Preciso de uma ambulância.', en: 'I need an ambulance.', fr: "J'ai besoin d'une ambulance.", it: "Ho bisogno di un'ambulanza.", uk: 'Мені потрібна швидка допомога.', lt: 'Reikia greitosios pagalbos.', ar: 'أحتاج سيارة إسعاف.' },
  { es: 'Ha habido una caída.', pt: 'Houve uma queda.', en: 'There has been a fall.', fr: 'Il y a eu une chute.', it: "C'è stata una caduta.", uk: 'Сталося падіння.', lt: 'Įvyko griuvimas.', ar: 'حدث سقوط.' },
  { es: 'La persona no responde.', pt: 'A pessoa não responde.', en: 'The person is not responding.', fr: 'La personne ne réagit pas.', it: 'La persona non risponde.', uk: 'Людина не реагує.', lt: 'Žmogus nereaguoja.', ar: 'الشخص لا يستجيب.' },
  { es: 'La persona tiene dificultad para respirar.', pt: 'A pessoa está com dificuldade para respirar.', en: 'The person is having trouble breathing.', fr: 'La personne a du mal à respirer.', it: 'La persona ha difficoltà a respirare.', uk: 'Людині важко дихати.', lt: 'Žmogui sunku kvėpuoti.', ar: 'الشخص يجد صعوبة في التنفس.' },
  { es: 'Es urgente, por favor vengan.', pt: 'É urgente, por favor venham.', en: 'It is urgent, please come.', fr: "C'est urgent, venez s'il vous plaît.", it: 'È urgente, per favore venite.', uk: 'Це терміново, будь ласка, приїздіть.', lt: 'Tai skubu, prašau atvykite.', ar: 'الأمر عاجل، أرجوكم تعالوا.' },
  { es: 'Ahora le doy la dirección.', pt: 'Vou passar o endereço.', en: 'I will give you the address now.', fr: "Je vous donne l'adresse.", it: "Ora le do l'indirizzo.", uk: 'Зараз продиктую адресу.', lt: 'Dabar pasakysiu adresą.', ar: 'سأعطيكم العنوان الآن.' },
];

// ---------------------------------------------------------------------------
// MONTAGEM
// ---------------------------------------------------------------------------

/** Primeira letra em maiúscula. Em árabe e nas escritas sem caixa é operação nula. */
const cap = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** "Siéntese, por favor." — o quadro já vem pronto; aqui só se escolhe a forma. */
export const buildCareLine = (lang: LangCode, action: CareAction, treat: Treat): string =>
  say(action.says, lang, treat);

/** "Hoy ha comido poco." — o marcador de tempo entra na frente, e o ponto no fim. */
export const buildReport = (lang: LangCode, event: ReportEvent, when: WhenTag | null, g: Gender): string => {
  const clause = tellClause(event.says, lang, g);
  const body = when ? `${when.phrases[lang]} ${clause}` : clause;
  return `${cap(body)}.`;
};

/** "¿Tenéis un andador?", "Ieškau vaikštynės." — caso e número saem do quadro. */
export const buildToolPhrase = (lang: LangCode, frame: ToolFrame, tool: CareTool): string => {
  const wantsGen = frame.gen?.includes(lang) ?? false;
  const genitive = lang === 'uk' ? tool.gen?.uk : lang === 'lt' ? tool.gen?.lt : undefined;
  const item = frame.use === 'names' ? tool.names[lang] : (wantsGen ? genitive : undefined) ?? tool.askFor[lang];
  const plural = tool.num?.[lang] === 'pl';
  const molde = (plural && frame.templatesPl ? frame.templatesPl : frame.templates)[lang];
  return molde.replace('{item}', item);
};

// ---------------------------------------------------------------------------
// RÓTULOS DE GRUPO
// ---------------------------------------------------------------------------
// Ficam aqui e não em `translations.ts` porque são CONTEÚDO na língua de quem lê,
// como `labels` e `note`, e não moldura da interface. Junto do resto, o `Record`
// completo garante que nenhum idioma fique para trás; espalhados em 8 blocos de
// tradução, ficariam longe da tabela que nomeiam.

export const CARE_GROUP_LABELS: Record<CareGroup, Text> = {
  move: { es: 'Levantar y andar', pt: 'Levantar e andar', en: 'Getting up and walking', fr: 'Se lever et marcher', it: 'Alzarsi e camminare', uk: 'Вставати і ходити', lt: 'Kėlimasis ir ėjimas', ar: 'النهوض والمشي' },
  hygiene: { es: 'Aseo y ducha', pt: 'Higiene e banho', en: 'Washing and bathing', fr: 'Toilette et douche', it: 'Igiene e doccia', uk: 'Гігієна і душ', lt: 'Higiena ir dušas', ar: 'النظافة والاستحمام' },
  dress: { es: 'Vestirse', pt: 'Vestir', en: 'Getting dressed', fr: "S'habiller", it: 'Vestirsi', uk: 'Одягання', lt: 'Apsirengimas', ar: 'الملابس' },
  meal: { es: 'Comer y beber', pt: 'Comer e beber', en: 'Eating and drinking', fr: 'Manger et boire', it: 'Mangiare e bere', uk: 'Їжа і напої', lt: 'Valgymas ir gėrimas', ar: 'الأكل والشرب' },
  meds: { es: 'La pastilla', pt: 'O comprimido', en: 'Medication times', fr: 'Le cachet', it: 'La pastiglia', uk: 'Таблетки', lt: 'Tabletės', ar: 'الدواء' },
  rest: { es: 'Descanso', pt: 'Descanso', en: 'Rest', fr: 'Repos', it: 'Riposo', uk: 'Відпочинок', lt: 'Poilsis', ar: 'الراحة' },
  comfort: { es: 'Estar a gusto', pt: 'Conforto', en: 'Comfort', fr: 'Confort', it: 'Conforto', uk: 'Комфорт', lt: 'Patogumas', ar: 'الطمأنينة' },
  outing: { es: 'Salir', pt: 'Sair', en: 'Going out', fr: 'Sortir', it: 'Uscire', uk: 'Прогулянка', lt: 'Išėjimas', ar: 'الخروج' },
};

export const REPORT_GROUP_LABELS: Record<ReportGroup, Text> = {
  meal: { es: 'Comida y pastilla', pt: 'Comida e comprimido', en: 'Food and pills', fr: 'Repas et cachet', it: 'Cibo e pastiglia', uk: 'Їжа і таблетки', lt: 'Maistas ir tabletės', ar: 'الطعام والدواء' },
  rest: { es: 'Sueño', pt: 'Sono', en: 'Sleep', fr: 'Sommeil', it: 'Sonno', uk: 'Сон', lt: 'Miegas', ar: 'النوم' },
  body: { es: 'Cuerpo', pt: 'Corpo', en: 'Body', fr: 'Corps', it: 'Corpo', uk: 'Тіло', lt: 'Kūnas', ar: 'الجسم' },
  mood: { es: 'Ánimo', pt: 'Ânimo', en: 'Mood', fr: 'Humeur', it: 'Umore', uk: 'Настрій', lt: 'Nuotaika', ar: 'المزاج' },
  incident: { es: 'Lo que ha pasado', pt: 'O que aconteceu', en: 'What happened', fr: "Ce qui s'est passé", it: 'Cosa è successo', uk: 'Що сталося', lt: 'Kas nutiko', ar: 'ما حدث' },
};

export const TOOL_GROUP_LABELS: Record<ToolGroup, Text> = {
  mobility: { es: 'Para andar', pt: 'Para andar', en: 'For walking', fr: 'Pour marcher', it: 'Per camminare', uk: 'Для ходьби', lt: 'Vaikščiojimui', ar: 'للمشي' },
  bed: { es: 'Para la cama', pt: 'Para a cama', en: 'For the bed', fr: 'Pour le lit', it: 'Per il letto', uk: 'Для ліжка', lt: 'Lovai', ar: 'للسرير' },
  health: { es: 'Para el control', pt: 'Para o controle', en: 'For monitoring', fr: 'Pour le suivi', it: 'Per il controllo', uk: 'Для контролю', lt: 'Kontrolei', ar: 'للمتابعة' },
  bath: { es: 'Para el baño', pt: 'Para o banho', en: 'For the bathroom', fr: 'Pour la salle de bain', it: 'Per il bagno', uk: 'Для ванної', lt: 'Voniai', ar: 'للحمام' },
};
