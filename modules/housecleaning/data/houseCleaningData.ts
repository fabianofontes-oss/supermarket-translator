// Módulo "Limpeza da casa" — quem trabalha limpando casa por horas na Espanha.
//
// FRONTEIRA DESTE ARQUIVO, e ela é o ponto mais importante do módulo:
//   • supermercado (`supermarket/data/cleaningData.ts`) → é dono de 96 PRODUTOS de
//     limpeza, com fonética, de `lejía` a `bayeta`. Nada disso se repete aqui.
//   • aqui → o TRABALHO: a tarefa, o cômodo, o que a patroa manda, e o que se combina
//     com ela. O catálogo é o que se COMPRA; este módulo é o que se FAZ.
//   • por isso este módulo NÃO tem lista de objetos para navegar. Objeto só aparece
//     dentro da frase de uma tarefa ("pasar la aspiradora"), nunca como verbete —
//     é o que impede a duplicação de voltar pela porta dos fundos.
//   • cuidar de pessoa é o módulo irmão (`eldercare/`). Aqui não se fala com ninguém
//     que esteja sob cuidado.
//
// ---------------------------------------------------------------------------
// POR QUE ESTE MÓDULO NÃO TEM OS DOIS EIXOS DO IRMÃO
// ---------------------------------------------------------------------------
// Em "Cuidar de idosos" a frase flexiona por tratamento e por gênero porque o objeto
// da frase é UMA PESSOA. Aqui o objeto é o chão. Não há o que concordar, e por isso
// não há botão nenhum — o módulo é mais simples de propósito, e não por descuido.
//
// O que existe é uma ASSIMETRIA de registro, e ela é real: **quem limpa trata a patroa
// de `usted`; a patroa costuma tratar quem limpa de `tú`.** Por isso o modo *A tarefa*
// e o modo *Combinar* estão em `usted`, e o modo *O que ela pede* está em `tú` — porque
// é assim que se ouve. Há uma nota na tela explicando que `puedes` e `puede` são a
// mesma ordem, para ninguém achar que ouviu errado.
//
// ---------------------------------------------------------------------------
// A REGRA DE CONTEÚDO: quem fala aqui é sempre a própria pessoa, em 1ª pessoa.
// ---------------------------------------------------------------------------
// Então nenhuma frase pode ter predicativo que concorde com QUEM FALA. "Vou chegar
// atrasada" e "je suis désolée" denunciam o gênero de quem trabalha, e o app não sabe
// esse gênero — nem deveria perguntar. As saídas usadas no lugar:
//   • pt "um pouco mais tarde" em vez de "atrasada"
//   • fr "toutes mes excuses" em vez de "je suis désolée"
//   • it "non ho potuto entrare" em vez de "non sono riuscita a entrare"
//   • uk "не вдалося увійти" (impessoal) em vez de "я не змогла увійти"
//   • ar "مع بالغ الأسف" em vez de "آسفة"
// O mesmo vale para o quadro "já está feito": o passado ucraniano de 1ª pessoa
// flexiona, então `done.uk` usa o impessoal em -но/-то ("підлогу вже помито"), e o
// lituano usa o particípio passivo ("grindys jau išplautos"). Há teste varrendo isto.
//
// ⚠️ CONTEÚDO NÃO REVISADO POR FALANTE NATIVO. Vale o alerta da seção 10 do AGENTS.md.
// O par que importa é es-ES × pt-BR, e os pontos de maior risco são `fregona`,
// `encimera`, `váter`, `tender`, `trastero`, `persiana` e o uso de `coger`.

import type { LangCode } from '../../location/data/locationData';

export type Text = Record<LangCode, string>;

// ---------------------------------------------------------------------------
// A TAREFA
// ---------------------------------------------------------------------------
// Cada tarefa guarda DUAS formas, e só duas:
//   • `inf`  → sintagma no infinitivo, que serve a três dos quatro quadros
//   • `done` → a oração de "já está feito", que não é derivável do infinitivo em
//              ucraniano nem em lituano, onde a construção é impessoal ou passiva
// Foi assim que o arquivo coube em duas tabelas em vez de quatro: todo quadro que
// pôde ser construído sobre o infinitivo foi.

export type TaskGroup = 'rooms' | 'beds' | 'kitchen' | 'bath' | 'laundry';

/** Ordem em que os grupos aparecem na tela. */
export const TASK_GROUPS: TaskGroup[] = ['rooms', 'beds', 'kitchen', 'bath', 'laundry'];

export const TASK_GROUP_LABELS: Record<TaskGroup, Text> = {
  // "Pela casa" e não "Os cômodos": o seletor de lugar logo acima já se chama
  // "Em que cômodo", e os dois títulos quase iguais a dois dedos de distância
  // faziam a pessoa procurar a tarefa na lista de cômodos.
  rooms: { es: 'Por la casa', pt: 'Pela casa', en: 'Around the house', fr: 'Dans la maison', it: 'Per casa', uk: 'По оселі', lt: 'Po namus', ar: 'في أنحاء البيت' },
  beds: { es: 'Las camas', pt: 'As camas', en: 'The beds', fr: 'Les lits', it: 'I letti', uk: 'Ліжка', lt: 'Lovos', ar: 'الأسرّة' },
  kitchen: { es: 'La cocina', pt: 'A cozinha', en: 'The kitchen', fr: 'La cuisine', it: 'La cucina', uk: 'Кухня', lt: 'Virtuvė', ar: 'المطبخ' },
  bath: { es: 'El baño', pt: 'O banheiro', en: 'The bathroom', fr: 'La salle de bain', it: 'Il bagno', uk: 'Ванна', lt: 'Vonia', ar: 'الحمام' },
  laundry: { es: 'La ropa', pt: 'A roupa', en: 'The laundry', fr: 'Le linge', it: 'Il bucato', uk: 'Білизна', lt: 'Skalbiniai', ar: 'الغسيل' },
};

export interface Task {
  key: string;
  group: TaskGroup;
  /** Rótulo do botão, na língua de quem lê. */
  labels: Text;
  /** Infinitivo com o complemento pronto. Em árabe, o masdar. */
  inf: Text;
  /** "Já está feito", oração fechada e sem sujeito de 1ª pessoa flexionado. */
  done: Text;
  /** Aceita um cômodo depois? Onde não aceita, a seção some da tela. */
  takesPlace?: boolean;
  /** Armadilha de palavra, na língua de quem lê. */
  note?: Text;
}

export const TASKS: Task[] = [
  {
    key: 'mopFloor', group: 'rooms', takesPlace: true,
    labels: { es: 'Fregar el suelo', pt: 'Passar pano no chão', en: 'Mop the floor', fr: 'Laver le sol', it: 'Lavare il pavimento', uk: 'Мити підлогу', lt: 'Plauti grindis', ar: 'مسح الأرضية' },
    inf: { es: 'fregar el suelo', pt: 'passar pano no chão', en: 'mop the floor', fr: 'laver le sol', it: 'lavare il pavimento', uk: 'мити підлогу', lt: 'plauti grindis', ar: 'مسح الأرضية' },
    done: { es: 'ya he fregado el suelo', pt: 'já passei pano no chão', en: "I've already mopped the floor", fr: "j'ai déjà lavé le sol", it: 'ho già lavato il pavimento', uk: 'підлогу вже помито', lt: 'grindys jau išplautos', ar: 'تم مسح الأرضية' },
    note: {
      es: 'La "fregona" es el palo con la cabeza de tiras y el cubo con escurridor. No es la "mopa", que va en seco.',
      pt: 'A "fregona" é o esfregão de cabo com o balde de espremer — não tem palavra única em português. Não confundir com "mopa", que é seca e só tira pó.',
      en: 'A "fregona" is the Spanish mop with a spin bucket. It is not a "mopa", which is used dry.',
      fr: "La « fregona » est le balai-serpillière espagnol avec son seau essoreur. Ce n'est pas la « mopa », qui s'utilise à sec.",
      it: 'La "fregona" è il mocio spagnolo con il secchio strizzatore. Non è la "mopa", che si usa a secco.',
      uk: '«Fregona» — це іспанська швабра з відром-віджималкою. Це не «mopa», якою витирають насухо.',
      lt: '„Fregona“ — ispaniška šluostė su gręžimo kibiru. Tai ne „mopa“, kuri naudojama sausai.',
      ar: '«fregona» هي الممسحة الإسبانية بدلوها العاصر، وليست «mopa» التي تُستعمل جافة.',
    },
  },
  {
    key: 'vacuum', group: 'rooms', takesPlace: true,
    labels: { es: 'Pasar la aspiradora', pt: 'Passar o aspirador', en: 'Vacuum', fr: "Passer l'aspirateur", it: "Passare l'aspirapolvere", uk: 'Пилососити', lt: 'Siurbti dulkes', ar: 'الكنس بالمكنسة' },
    inf: { es: 'pasar la aspiradora', pt: 'passar o aspirador', en: 'vacuum', fr: "passer l'aspirateur", it: "passare l'aspirapolvere", uk: 'пилососити', lt: 'siurbti dulkes', ar: 'الكنس بالمكنسة' },
    done: { es: 'ya he pasado la aspiradora', pt: 'já passei o aspirador', en: "I've already vacuumed", fr: "j'ai déjà passé l'aspirateur", it: "ho già passato l'aspirapolvere", uk: 'вже пропилососено', lt: 'dulkės jau išsiurbtos', ar: 'تم الكنس بالمكنسة' },
    note: {
      es: 'En España se oye "la aspiradora" y "el aspirador"; las dos valen. El verbo es "pasar", no "usar".',
      pt: 'Na Espanha se ouve "la aspiradora" e "el aspirador" — as duas valem. O verbo é "pasar la aspiradora", não "usar".',
      en: 'In Spain both "la aspiradora" and "el aspirador" are heard. The verb is "pasar", not "usar".',
      fr: "En Espagne on entend « la aspiradora » et « el aspirador » ; les deux se disent. Le verbe est « pasar ».",
      it: 'In Spagna si sente sia "la aspiradora" sia "el aspirador". Il verbo è "pasar".',
      uk: 'В Іспанії кажуть і «la aspiradora», і «el aspirador» — обидва варіанти правильні. Дієслово — «pasar».',
      lt: 'Ispanijoje sakoma ir „la aspiradora“, ir „el aspirador“ — abu tinka. Veiksmažodis — „pasar“.',
      ar: 'في إسبانيا تُسمع «la aspiradora» و«el aspirador» وكلاهما صحيح. الفعل المستعمل هو «pasar».',
    },
  },
  {
    key: 'dust', group: 'rooms', takesPlace: true,
    labels: { es: 'Quitar el polvo', pt: 'Tirar o pó', en: 'Dust', fr: 'Faire la poussière', it: 'Spolverare', uk: 'Витирати пил', lt: 'Valyti dulkes', ar: 'إزالة الغبار' },
    inf: { es: 'quitar el polvo', pt: 'tirar o pó', en: 'dust', fr: 'faire la poussière', it: 'spolverare', uk: 'витирати пил', lt: 'valyti dulkes', ar: 'إزالة الغبار' },
    done: { es: 'ya he quitado el polvo', pt: 'já tirei o pó', en: "I've already dusted", fr: "j'ai déjà fait la poussière", it: 'ho già spolverato', uk: 'пил уже витерто', lt: 'dulkės jau nuvalytos', ar: 'تمت إزالة الغبار' },
  },
  {
    key: 'windows', group: 'rooms', takesPlace: true,
    labels: { es: 'Limpiar los cristales', pt: 'Limpar os vidros', en: 'Clean the windows', fr: 'Faire les vitres', it: 'Pulire i vetri', uk: 'Мити вікна', lt: 'Valyti langus', ar: 'تنظيف الزجاج' },
    inf: { es: 'limpiar los cristales', pt: 'limpar os vidros', en: 'clean the windows', fr: 'faire les vitres', it: 'pulire i vetri', uk: 'мити вікна', lt: 'valyti langus', ar: 'تنظيف الزجاج' },
    done: { es: 'ya he limpiado los cristales', pt: 'já limpei os vidros', en: "I've already cleaned the windows", fr: "j'ai déjà fait les vitres", it: 'ho già pulito i vetri', uk: 'вікна вже помито', lt: 'langai jau nuvalyti', ar: 'تم تنظيف الزجاج' },
    note: {
      es: '"Cristal" es el vidrio; "ventana" es la ventana entera, con el marco. Se limpian los cristales.',
      pt: 'Em espanhol se limpa "los cristales", o vidro. "Ventana" é a janela inteira, com o caixilho — pedir para limpar "las ventanas" soa a lavar tudo.',
      en: '"Cristal" is the glass; "ventana" is the whole window with its frame. You clean the "cristales".',
      fr: "« Cristal » c'est la vitre ; « ventana » c'est la fenêtre entière avec le cadre. On nettoie les « cristales ».",
      it: '"Cristal" è il vetro; "ventana" è la finestra intera con il telaio. Si puliscono i "cristales".',
      uk: '«Cristal» — це скло; «ventana» — усе вікно з рамою. Миють саме «cristales».',
      lt: '„Cristal“ — stiklas; „ventana“ — visas langas su rėmu. Valomi būtent „cristales“.',
      ar: '«cristal» هو الزجاج، أما «ventana» فهي النافذة كاملة بإطارها. المقصود تنظيف الـ«cristales».',
    },
  },
  {
    key: 'tidyUp', group: 'rooms', takesPlace: true,
    labels: { es: 'Ordenar', pt: 'Arrumar', en: 'Tidy up', fr: 'Ranger', it: 'Mettere in ordine', uk: 'Прибирати', lt: 'Tvarkyti', ar: 'الترتيب' },
    inf: { es: 'ordenar', pt: 'arrumar', en: 'tidy up', fr: 'ranger', it: 'mettere in ordine', uk: 'прибирати', lt: 'tvarkyti', ar: 'الترتيب' },
    done: { es: 'ya lo he ordenado todo', pt: 'já arrumei tudo', en: "I've already tidied up", fr: "j'ai déjà tout rangé", it: 'ho già messo tutto in ordine', uk: 'уже прибрано', lt: 'jau sutvarkyta', ar: 'تم الترتيب' },
  },
  {
    key: 'makeBeds', group: 'beds',
    labels: { es: 'Hacer las camas', pt: 'Arrumar as camas', en: 'Make the beds', fr: 'Faire les lits', it: 'Rifare i letti', uk: 'Заправляти ліжка', lt: 'Kloti lovas', ar: 'ترتيب الأسرّة' },
    inf: { es: 'hacer las camas', pt: 'arrumar as camas', en: 'make the beds', fr: 'faire les lits', it: 'rifare i letti', uk: 'заправляти ліжка', lt: 'kloti lovas', ar: 'ترتيب الأسرّة' },
    done: { es: 'ya he hecho las camas', pt: 'já arrumei as camas', en: "I've already made the beds", fr: "j'ai déjà fait les lits", it: 'ho già rifatto i letti', uk: 'ліжка вже заправлено', lt: 'lovos jau paklotos', ar: 'تم ترتيب الأسرّة' },
  },
  {
    key: 'changeSheets', group: 'beds',
    labels: { es: 'Cambiar las sábanas', pt: 'Trocar os lençóis', en: 'Change the sheets', fr: 'Changer les draps', it: 'Cambiare le lenzuola', uk: 'Міняти постіль', lt: 'Keisti patalynę', ar: 'تغيير الملاءات' },
    inf: { es: 'cambiar las sábanas', pt: 'trocar os lençóis', en: 'change the sheets', fr: 'changer les draps', it: 'cambiare le lenzuola', uk: 'міняти постіль', lt: 'keisti patalynę', ar: 'تغيير الملاءات' },
    done: { es: 'ya he cambiado las sábanas', pt: 'já troquei os lençóis', en: "I've already changed the sheets", fr: "j'ai déjà changé les draps", it: 'ho già cambiato le lenzuola', uk: 'постіль уже змінено', lt: 'patalynė jau pakeista', ar: 'تم تغيير الملاءات' },
  },
  {
    key: 'dishes', group: 'kitchen',
    labels: { es: 'Fregar los platos', pt: 'Lavar a louça', en: 'Wash the dishes', fr: 'Faire la vaisselle', it: 'Lavare i piatti', uk: 'Мити посуд', lt: 'Plauti indus', ar: 'غسل الصحون' },
    inf: { es: 'fregar los platos', pt: 'lavar a louça', en: 'wash the dishes', fr: 'faire la vaisselle', it: 'lavare i piatti', uk: 'мити посуд', lt: 'plauti indus', ar: 'غسل الصحون' },
    done: { es: 'ya he fregado los platos', pt: 'já lavei a louça', en: "I've already washed the dishes", fr: "j'ai déjà fait la vaisselle", it: 'ho già lavato i piatti', uk: 'посуд уже помито', lt: 'indai jau išplauti', ar: 'تم غسل الصحون' },
    note: {
      es: 'En España los platos se "friegan", no se "lavan". "Lavar" se usa para la ropa.',
      pt: 'Na Espanha a louça se "friega", não se "lava" — "lavar" fica para a roupa. E a máquina de louça é "el lavavajillas", que não é a de roupa.',
      en: 'In Spain dishes are "fregados", not "lavados"; "lavar" is for clothes. The dishwasher is "el lavavajillas".',
      fr: "En Espagne on « friega » la vaisselle, on ne la « lava » pas ; « lavar » c'est pour le linge.",
      it: 'In Spagna i piatti si "friegan", non si "lavan"; "lavar" è per i vestiti.',
      uk: 'В Іспанії посуд «friegan», а не «lavan» — «lavar» стосується одягу.',
      lt: 'Ispanijoje indai „friegan“, o ne „lavan“ — „lavar“ vartojamas drabužiams.',
      ar: 'في إسبانيا تُغسل الصحون بفعل «fregar» لا «lavar»؛ و«lavar» تُستعمل للملابس.',
    },
  },
  {
    key: 'worktop', group: 'kitchen',
    labels: { es: 'Limpiar la encimera', pt: 'Limpar a bancada', en: 'Clean the worktop', fr: 'Nettoyer le plan de travail', it: 'Pulire il piano di lavoro', uk: 'Витирати стільницю', lt: 'Valyti stalviršį', ar: 'تنظيف سطح المطبخ' },
    inf: { es: 'limpiar la encimera', pt: 'limpar a bancada', en: 'clean the worktop', fr: 'nettoyer le plan de travail', it: 'pulire il piano di lavoro', uk: 'витирати стільницю', lt: 'valyti stalviršį', ar: 'تنظيف سطح المطبخ' },
    done: { es: 'ya he limpiado la encimera', pt: 'já limpei a bancada', en: "I've already cleaned the worktop", fr: "j'ai déjà nettoyé le plan de travail", it: 'ho già pulito il piano di lavoro', uk: 'стільницю вже витерто', lt: 'stalviršis jau nuvalytas', ar: 'تم تنظيف سطح المطبخ' },
  },
  {
    key: 'oven', group: 'kitchen',
    labels: { es: 'Limpiar el horno', pt: 'Limpar o forno', en: 'Clean the oven', fr: 'Nettoyer le four', it: 'Pulire il forno', uk: 'Мити духовку', lt: 'Valyti orkaitę', ar: 'تنظيف الفرن' },
    inf: { es: 'limpiar el horno', pt: 'limpar o forno', en: 'clean the oven', fr: 'nettoyer le four', it: 'pulire il forno', uk: 'мити духовку', lt: 'valyti orkaitę', ar: 'تنظيف الفرن' },
    done: { es: 'ya he limpiado el horno', pt: 'já limpei o forno', en: "I've already cleaned the oven", fr: "j'ai déjà nettoyé le four", it: 'ho già pulito il forno', uk: 'духовку вже помито', lt: 'orkaitė jau išvalyta', ar: 'تم تنظيف الفرن' },
  },
  {
    key: 'bins', group: 'kitchen',
    labels: { es: 'Sacar la basura', pt: 'Levar o lixo', en: 'Take out the rubbish', fr: 'Sortir les poubelles', it: 'Portare fuori la spazzatura', uk: 'Виносити сміття', lt: 'Išnešti šiukšles', ar: 'إخراج القمامة' },
    inf: { es: 'sacar la basura', pt: 'levar o lixo', en: 'take out the rubbish', fr: 'sortir les poubelles', it: 'portare fuori la spazzatura', uk: 'виносити сміття', lt: 'išnešti šiukšles', ar: 'إخراج القمامة' },
    done: { es: 'ya he sacado la basura', pt: 'já levei o lixo', en: "I've already taken out the rubbish", fr: "j'ai déjà sorti les poubelles", it: 'ho già portato fuori la spazzatura', uk: 'сміття вже винесено', lt: 'šiukšlės jau išneštos', ar: 'تم إخراج القمامة' },
    note: {
      es: '"La basura" es lo que se tira; "el cubo" es el recipiente. Se saca la basura, no el cubo.',
      pt: '"La basura" é o lixo; "el cubo" é a lixeira. Diz-se "sacar la basura" — quem diz "sacar el cubo" está falando de levar o balde inteiro.',
      en: '"La basura" is the rubbish; "el cubo" is the bin itself. You take out the rubbish, not the bin.',
      fr: "« La basura » ce sont les ordures ; « el cubo » c'est la poubelle. On sort la basura, pas le cubo.",
      it: '"La basura" è la spazzatura; "el cubo" è il bidone. Si porta fuori la basura, non il cubo.',
      uk: '«La basura» — це сміття, «el cubo» — відро. Виносять «la basura», а не «el cubo».',
      lt: '„La basura“ — šiukšlės, „el cubo“ — kibiras. Išnešama „la basura“, ne „el cubo“.',
      ar: '«la basura» هي القمامة، و«el cubo» هو السطل. يُخرَج «la basura» لا «el cubo».',
    },
  },
  {
    key: 'toilet', group: 'bath',
    labels: { es: 'Limpiar el váter', pt: 'Limpar o vaso', en: 'Clean the toilet', fr: 'Nettoyer les WC', it: 'Pulire il water', uk: 'Мити унітаз', lt: 'Valyti unitazą', ar: 'تنظيف المرحاض' },
    inf: { es: 'limpiar el váter', pt: 'limpar o vaso', en: 'clean the toilet', fr: 'nettoyer les WC', it: 'pulire il water', uk: 'мити унітаз', lt: 'valyti unitazą', ar: 'تنظيف المرحاض' },
    done: { es: 'ya he limpiado el váter', pt: 'já limpei o vaso', en: "I've already cleaned the toilet", fr: "j'ai déjà nettoyé les WC", it: 'ho già pulito il water', uk: 'унітаз уже помито', lt: 'unitazas jau išvalytas', ar: 'تم تنظيف المرحاض' },
    note: {
      es: '"El váter" es la taza; "el baño" es la habitación entera.',
      pt: '"El váter" (do inglês water closet) é o vaso sanitário. "El baño" é o cômodo inteiro — são coisas diferentes na hora de combinar a tarefa.',
      en: '"El váter" is the toilet bowl; "el baño" is the whole room.',
      fr: "« El váter » c'est la cuvette ; « el baño » c'est la pièce entière.",
      it: '"El váter" è la tazza; "el baño" è tutta la stanza.',
      uk: '«El váter» — це унітаз, «el baño» — уся кімната.',
      lt: '„El váter“ — unitazas, „el baño“ — visas kambarys.',
      ar: '«el váter» هو المرحاض نفسه، أما «el baño» فهي الغرفة كاملة.',
    },
  },
  {
    key: 'showerClean', group: 'bath',
    labels: { es: 'Limpiar la ducha', pt: 'Limpar o box', en: 'Clean the shower', fr: 'Nettoyer la douche', it: 'Pulire la doccia', uk: 'Мити душ', lt: 'Valyti dušą', ar: 'تنظيف الدش' },
    inf: { es: 'limpiar la ducha', pt: 'limpar o box', en: 'clean the shower', fr: 'nettoyer la douche', it: 'pulire la doccia', uk: 'мити душ', lt: 'valyti dušą', ar: 'تنظيف الدش' },
    done: { es: 'ya he limpiado la ducha', pt: 'já limpei o box', en: "I've already cleaned the shower", fr: "j'ai déjà nettoyé la douche", it: 'ho già pulito la doccia', uk: 'душ уже помито', lt: 'dušas jau išvalytas', ar: 'تم تنظيف الدش' },
  },
  {
    key: 'washing', group: 'laundry',
    labels: { es: 'Poner la lavadora', pt: 'Botar a máquina', en: 'Put a wash on', fr: 'Lancer une machine', it: 'Fare una lavatrice', uk: 'Запускати пралку', lt: 'Paleisti skalbimo mašiną', ar: 'تشغيل الغسالة' },
    inf: { es: 'poner la lavadora', pt: 'botar a máquina', en: 'put a wash on', fr: 'lancer une machine', it: 'fare una lavatrice', uk: 'запускати пралку', lt: 'paleisti skalbimo mašiną', ar: 'تشغيل الغسالة' },
    done: { es: 'ya he puesto la lavadora', pt: 'já botei a máquina', en: "I've already put a wash on", fr: "j'ai déjà lancé une machine", it: 'ho già fatto una lavatrice', uk: 'пралку вже запущено', lt: 'skalbimo mašina jau paleista', ar: 'تم تشغيل الغسالة' },
    note: {
      es: '"Lavadora" es la de la ropa; "lavavajillas" es la de los platos. Se dice "poner la lavadora".',
      pt: '"Lavadora" é a máquina de roupa; "lavavajillas" é a de louça. E o verbo é "poner la lavadora", não "encender".',
      en: '"Lavadora" is the washing machine; "lavavajillas" is the dishwasher. The verb is "poner".',
      fr: "« Lavadora » c'est le lave-linge ; « lavavajillas » le lave-vaisselle. Le verbe est « poner ».",
      it: '"Lavadora" è la lavatrice; "lavavajillas" è la lavastoviglie. Il verbo è "poner".',
      uk: '«Lavadora» — пральна машина, «lavavajillas» — посудомийна. Дієслово — «poner».',
      lt: '„Lavadora“ — skalbimo mašina, „lavavajillas“ — indaplovė. Veiksmažodis — „poner“.',
      ar: '«lavadora» غسالة الملابس، و«lavavajillas» غسالة الصحون. الفعل المستعمل «poner».',
    },
  },
  {
    key: 'hang', group: 'laundry',
    labels: { es: 'Tender la ropa', pt: 'Estender a roupa', en: 'Hang the washing', fr: 'Étendre le linge', it: 'Stendere il bucato', uk: 'Розвішувати білизну', lt: 'Džiauti skalbinius', ar: 'نشر الغسيل' },
    inf: { es: 'tender la ropa', pt: 'estender a roupa', en: 'hang the washing', fr: 'étendre le linge', it: 'stendere il bucato', uk: 'розвішувати білизну', lt: 'džiauti skalbinius', ar: 'نشر الغسيل' },
    done: { es: 'ya he tendido la ropa', pt: 'já estendi a roupa', en: "I've already hung the washing", fr: "j'ai déjà étendu le linge", it: 'ho già steso il bucato', uk: 'білизну вже розвішано', lt: 'skalbiniai jau išdžiauti', ar: 'تم نشر الغسيل' },
  },
  {
    key: 'iron', group: 'laundry',
    labels: { es: 'Planchar la ropa', pt: 'Passar a roupa', en: 'Do the ironing', fr: 'Repasser le linge', it: 'Stirare il bucato', uk: 'Прасувати білизну', lt: 'Lyginti skalbinius', ar: 'كي الملابس' },
    inf: { es: 'planchar la ropa', pt: 'passar a roupa', en: 'do the ironing', fr: 'repasser le linge', it: 'stirare il bucato', uk: 'прасувати білизну', lt: 'lyginti skalbinius', ar: 'كي الملابس' },
    done: { es: 'ya he planchado la ropa', pt: 'já passei a roupa', en: "I've already done the ironing", fr: "j'ai déjà repassé le linge", it: 'ho già stirato il bucato', uk: 'білизну вже попрасовано', lt: 'skalbiniai jau išlyginti', ar: 'تم كي الملابس' },
    note: {
      es: '"La plancha" es el aparato y "planchar" la acción. En un menú, "a la plancha" es otra cosa: a la parrilla.',
      pt: '"La plancha" é o ferro e "planchar" é passar. Cuidado num cardápio: "a la plancha" ali quer dizer grelhado, e não tem nada a ver.',
      en: '"La plancha" is the iron, "planchar" is to iron. On a menu, "a la plancha" means grilled.',
      fr: "« La plancha » c'est le fer, « planchar » repasser. Au menu, « a la plancha » veut dire grillé.",
      it: '"La plancha" è il ferro, "planchar" stirare. Al menù, "a la plancha" vuol dire alla piastra.',
      uk: '«La plancha» — праска, «planchar» — прасувати. У меню «a la plancha» означає «на грилі».',
      lt: '„La plancha“ — lygintuvas, „planchar“ — lyginti. Meniu „a la plancha“ reiškia keptą ant grotelių.',
      ar: '«la plancha» هي المكواة و«planchar» هو الكي. أما في قائمة الطعام فـ«a la plancha» تعني مشويّاً على الصاج.',
    },
  },
];

// ---------------------------------------------------------------------------
// O CÔMODO
// ---------------------------------------------------------------------------
// `where` já vem com a preposição pronta e sem espaço na ponta: quem junta é o
// builder. As contrações do espanhol e do português (`del salón`, `do corredor`)
// são escritas à mão, como em `locationData.ts` — regra de contração aqui seria
// maior que a tabela.

export interface Place {
  key: string;
  labels: Text;
  where: Text;
}

export const PLACES: Place[] = [
  {
    key: 'kitchen',
    labels: { es: 'La cocina', pt: 'A cozinha', en: 'The kitchen', fr: 'La cuisine', it: 'La cucina', uk: 'Кухня', lt: 'Virtuvė', ar: 'المطبخ' },
    where: { es: 'de la cocina', pt: 'da cozinha', en: 'in the kitchen', fr: 'de la cuisine', it: 'della cucina', uk: 'на кухні', lt: 'virtuvėje', ar: 'في المطبخ' },
  },
  {
    key: 'living',
    labels: { es: 'El salón', pt: 'A sala', en: 'The living room', fr: 'Le salon', it: 'Il soggiorno', uk: 'Вітальня', lt: 'Svetainė', ar: 'الصالة' },
    where: { es: 'del salón', pt: 'da sala', en: 'in the living room', fr: 'du salon', it: 'del soggiorno', uk: 'у вітальні', lt: 'svetainėje', ar: 'في الصالة' },
  },
  {
    key: 'bath',
    labels: { es: 'El baño', pt: 'O banheiro', en: 'The bathroom', fr: 'La salle de bain', it: 'Il bagno', uk: 'Ванна', lt: 'Vonia', ar: 'الحمام' },
    where: { es: 'del baño', pt: 'do banheiro', en: 'in the bathroom', fr: 'de la salle de bain', it: 'del bagno', uk: 'у ванній', lt: 'vonioje', ar: 'في الحمام' },
  },
  {
    key: 'bedroom',
    labels: { es: 'El dormitorio', pt: 'O quarto', en: 'The bedroom', fr: 'La chambre', it: 'La camera', uk: 'Спальня', lt: 'Miegamasis', ar: 'غرفة النوم' },
    where: { es: 'del dormitorio', pt: 'do quarto', en: 'in the bedroom', fr: 'de la chambre', it: 'della camera', uk: 'у спальні', lt: 'miegamajame', ar: 'في غرفة النوم' },
  },
  {
    key: 'hall',
    labels: { es: 'El pasillo', pt: 'O corredor', en: 'The hallway', fr: 'Le couloir', it: 'Il corridoio', uk: 'Коридор', lt: 'Koridorius', ar: 'الممر' },
    where: { es: 'del pasillo', pt: 'do corredor', en: 'in the hallway', fr: 'du couloir', it: 'del corridoio', uk: 'у коридорі', lt: 'koridoriuje', ar: 'في الممر' },
  },
  {
    key: 'terrace',
    labels: { es: 'La terraza', pt: 'A varanda', en: 'The terrace', fr: 'La terrasse', it: 'Il terrazzo', uk: 'Тераса', lt: 'Terasa', ar: 'الشرفة' },
    where: { es: 'de la terraza', pt: 'da varanda', en: 'on the terrace', fr: 'de la terrasse', it: 'del terrazzo', uk: 'на терасі', lt: 'terasoje', ar: 'في الشرفة' },
  },
  {
    key: 'entrance',
    labels: { es: 'La entrada', pt: 'A entrada', en: 'The entryway', fr: "L'entrée", it: "L'ingresso", uk: 'Передпокій', lt: 'Prieškambaris', ar: 'المدخل' },
    where: { es: 'de la entrada', pt: 'da entrada', en: 'in the entryway', fr: "de l'entrée", it: "dell'ingresso", uk: 'у передпокої', lt: 'prieškambaryje', ar: 'في المدخل' },
  },
];

// ---------------------------------------------------------------------------
// OS QUADROS
// ---------------------------------------------------------------------------
// Três dos quatro quadros são construídos sobre o INFINITIVO, e é por isso que a
// tabela de tarefas tem duas formas e não quatro. O que obriga um quadro a usar
// `done` é o ucraniano e o lituano: "вже помито" e "jau išplautos" não saem de
// "мити підлогу" por regra nenhuma.

export interface TaskFrame {
  key: string;
  labels: Text;
  /** Contém "{t}". */
  templates: Text;
  use: 'inf' | 'done';
}

export const TASK_FRAMES: TaskFrame[] = [
  {
    key: 'going', use: 'inf',
    labels: { es: 'Voy a…', pt: 'Vou…', en: "I'm going to…", fr: 'Je vais…', it: 'Sto per…', uk: 'Зараз буду…', lt: 'Ketinu…', ar: 'سأقوم بـ…' },
    templates: { es: 'Voy a {t}.', pt: 'Vou {t}.', en: "I'm going to {t}.", fr: 'Je vais {t}.', it: 'Sto per {t}.', uk: 'Зараз буду {t}.', lt: 'Ketinu {t}.', ar: 'سأقوم ب{t}.' },
  },
  {
    key: 'need', use: 'inf',
    labels: { es: '¿Hace falta…?', pt: 'Precisa…?', en: 'Do I need to…?', fr: 'Faut-il… ?', it: 'Bisogna…?', uk: 'Чи треба…?', lt: 'Ar reikia…?', ar: 'هل يلزم…؟' },
    templates: { es: '¿Hace falta {t} hoy?', pt: 'Precisa {t} hoje?', en: 'Do I need to {t} today?', fr: 'Faut-il {t} aujourd’hui ?', it: 'Bisogna {t} oggi?', uk: 'Чи треба сьогодні {t}?', lt: 'Ar reikia šiandien {t}?', ar: 'هل يلزم {t} اليوم؟' },
  },
  {
    key: 'done', use: 'done',
    labels: { es: 'Ya está hecho', pt: 'Já está feito', en: 'Already done', fr: "C'est fait", it: 'È già fatto', uk: 'Уже зроблено', lt: 'Jau padaryta', ar: 'تم الأمر' },
    templates: { es: '{t}.', pt: '{t}.', en: '{t}.', fr: '{t}.', it: '{t}.', uk: '{t}.', lt: '{t}.', ar: '{t}.' },
  },
  {
    key: 'noTime', use: 'inf',
    labels: { es: 'No me ha dado tiempo', pt: 'Não deu tempo', en: "I didn't have time", fr: "Pas eu le temps", it: 'Non ho fatto in tempo', uk: 'Не вистачило часу', lt: 'Nespėjau', ar: 'لم يتسع الوقت' },
    // uk impessoal ("не вистачило часу") e lt sem particípio ("nespėjau"): nenhum
    // dos dois denuncia o gênero de quem fala. Ver a regra no cabeçalho.
    templates: { es: 'Hoy no me ha dado tiempo de {t}.', pt: 'Hoje não deu tempo de {t}.', en: "I didn't have time to {t} today.", fr: "Je n'ai pas eu le temps de {t} aujourd'hui.", it: 'Oggi non ho fatto in tempo a {t}.', uk: 'Сьогодні не вистачило часу {t}.', lt: 'Šiandien nespėjau {t}.', ar: 'لم يتسع الوقت اليوم ل{t}.' },
  },
];

// ---------------------------------------------------------------------------
// O QUE ELA PEDE
// ---------------------------------------------------------------------------
// Frases RECEPTIVAS: é o que se OUVE, não o que se diz. Estão em `tú` porque é assim
// que a patroa costuma falar com quem limpa — a assimetria descrita no cabeçalho.
// O árabe aqui é glosa NOMINAL e não imperativo ("الحمام في الأخير" e não "اتركي"):
// o imperativo árabe concorda com o gênero de quem ouve, e a glosa não deve supor
// o gênero de quem lê. Mesma lição do módulo irmão.

export const HEARD: Text[] = [
  { es: 'Hoy no hace falta planchar.', pt: 'Hoje não precisa passar roupa.', en: "You don't need to iron today.", fr: "Pas besoin de repasser aujourd'hui.", it: 'Oggi non serve stirare.', uk: 'Сьогодні прасувати не треба.', lt: 'Šiandien lyginti nereikia.', ar: 'اليوم لا داعي للكي.' },
  { es: 'Deja el baño para el final.', pt: 'Deixe o banheiro para o final.', en: 'Leave the bathroom for last.', fr: 'Garde la salle de bain pour la fin.', it: 'Lascia il bagno per ultimo.', uk: 'Ванну залиш наостанок.', lt: 'Vonią palik pabaigai.', ar: 'الحمام في الأخير.' },
  { es: 'Ten cuidado con eso, que es delicado.', pt: 'Cuidado com isso, é delicado.', en: 'Careful with that, it is delicate.', fr: "Fais attention, c'est fragile.", it: 'Attenzione, è delicato.', uk: 'Обережно з цим, воно делікатне.', lt: 'Atsargiai su tuo, tai trapu.', ar: 'انتباه: هذا شيء حساس.' },
  { es: 'No uses lejía en el parqué.', pt: 'Não use água sanitária no piso de madeira.', en: "Don't use bleach on the wooden floor.", fr: "N'utilise pas d'eau de Javel sur le parquet.", it: 'Non usare la candeggina sul parquet.', uk: 'Не використовуй хлорку на паркеті.', lt: 'Nenaudok baliklio ant parketo.', ar: 'لا تُستعمل مادة التبييض على الباركيه.' },
  { es: 'La ropa de color, aparte.', pt: 'A roupa colorida, separada.', en: 'Colours separately.', fr: 'Le linge de couleur à part.', it: 'I capi colorati a parte.', uk: 'Кольорове — окремо.', lt: 'Spalvotus – atskirai.', ar: 'الملابس الملونة على حدة.' },
  { es: 'Los cristales solo por dentro.', pt: 'Os vidros só por dentro.', en: 'The windows only on the inside.', fr: "Les vitres seulement à l'intérieur.", it: 'I vetri solo dentro.', uk: 'Вікна — лише зсередини.', lt: 'Langus tik iš vidaus.', ar: 'الزجاج من الداخل فقط.' },
  { es: 'El aspirador está en el trastero.', pt: 'O aspirador está no depósito.', en: 'The vacuum is in the storage room.', fr: "L'aspirateur est dans le débarras.", it: "L'aspirapolvere è nello sgabuzzino.", uk: 'Пилосос у комірці.', lt: 'Dulkių siurblys sandėliuke.', ar: 'المكنسة في غرفة التخزين.' },
  { es: 'Cuando termines, cierra con llave.', pt: 'Quando terminar, tranque a porta.', en: 'When you finish, lock the door.', fr: 'Quand tu as fini, ferme à clé.', it: 'Quando finisci, chiudi a chiave.', uk: 'Коли закінчиш, замкни двері.', lt: 'Kai baigsi, užrakink duris.', ar: 'عند الانتهاء، إغلاق الباب بالمفتاح.' },
  { es: 'Puedes coger algo de la nevera.', pt: 'Pode pegar algo na geladeira.', en: 'You can take something from the fridge.', fr: 'Tu peux prendre quelque chose dans le frigo.', it: 'Puoi prendere qualcosa dal frigo.', uk: 'Можеш узяти щось із холодильника.', lt: 'Gali pasiimti ko nors iš šaldytuvo.', ar: 'يمكن أخذ شيء من الثلاجة.' },
  { es: 'Si no llego, deja la llave en el buzón.', pt: 'Se eu não chegar, deixe a chave na caixa de correio.', en: "If I'm not back, leave the key in the letterbox.", fr: "Si je ne suis pas là, laisse la clé dans la boîte aux lettres.", it: 'Se non arrivo, lascia la chiave nella cassetta della posta.', uk: 'Якщо мене не буде, залиш ключ у поштовій скриньці.', lt: 'Jei negrįšiu, palik raktą pašto dėžutėje.', ar: 'إن لم أصل، ترك المفتاح في صندوق البريد.' },
  { es: 'No hace falta que subas la persiana.', pt: 'Não precisa levantar a persiana.', en: "You don't need to open the blind.", fr: 'Pas besoin de lever le store.', it: 'Non serve alzare la tapparella.', uk: 'Жалюзі піднімати не треба.', lt: 'Žaliuzių kelti nereikia.', ar: 'لا داعي لرفع الستارة.' },
  { es: 'Hoy vengo antes, sobre la hora de comer.', pt: 'Hoje eu chego mais cedo, por volta do almoço.', en: "I'll be back earlier today, around lunchtime.", fr: "Je rentre plus tôt aujourd'hui, vers l'heure du déjeuner.", it: 'Oggi torno prima, verso ora di pranzo.', uk: 'Сьогодні повернуся раніше, десь на обід.', lt: 'Šiandien grįšiu anksčiau, apie pietus.', ar: 'اليوم سأعود مبكراً، حوالي وقت الغداء.' },
];

// ---------------------------------------------------------------------------
// COMBINAR E AVISAR
// ---------------------------------------------------------------------------
// Aqui quem fala é a própria pessoa, em `usted`, e em 1ª pessoa — então vale inteira
// a regra do cabeçalho: nenhum predicativo concorda com quem fala.

export type SayGroup = 'deal' | 'warn';

export const SAY_GROUPS: SayGroup[] = ['deal', 'warn'];

export const SAY_GROUP_LABELS: Record<SayGroup, Text> = {
  deal: { es: 'Las condiciones', pt: 'As condições', en: 'The terms', fr: 'Les conditions', it: 'Le condizioni', uk: 'Умови', lt: 'Sąlygos', ar: 'الشروط' },
  warn: { es: 'Avisar de algo', pt: 'Avisar de alguma coisa', en: 'Letting her know', fr: 'Prévenir', it: 'Avvisare', uk: 'Повідомити', lt: 'Pranešti', ar: 'الإبلاغ' },
};

export interface SayPhrase {
  key: string;
  group: SayGroup;
  text: Text;
}

export const SAY_PHRASES: SayPhrase[] = [
  { key: 'hours', group: 'deal', text: { es: '¿Cuántas horas son en total?', pt: 'São quantas horas no total?', en: 'How many hours is it in total?', fr: 'Ça fait combien d’heures en tout ?', it: 'Quante ore sono in tutto?', uk: 'Скільки годин загалом?', lt: 'Kiek iš viso valandų?', ar: 'كم ساعة في المجموع؟' } },
  { key: 'days', group: 'deal', text: { es: '¿Qué días vengo?', pt: 'Que dias eu venho?', en: 'Which days do I come?', fr: 'Quels jours je viens ?', it: 'Che giorni vengo?', uk: 'У які дні мені приходити?', lt: 'Kuriomis dienomis ateiti?', ar: 'في أي أيام آتي؟' } },
  { key: 'keys', group: 'deal', text: { es: '¿Me deja las llaves?', pt: 'Pode me deixar as chaves?', en: 'Could you leave me the keys?', fr: 'Vous pouvez me laisser les clés ?', it: 'Mi può lasciare le chiavi?', uk: 'Ви залишите мені ключі?', lt: 'Ar paliksite man raktus?', ar: 'هل تتركون لي المفاتيح؟' } },
  { key: 'pay', group: 'deal', text: { es: '¿Se paga por horas o por servicio?', pt: 'O pagamento é por hora ou por diária?', en: 'Is it paid by the hour or by the job?', fr: "C'est payé à l'heure ou au forfait ?", it: 'Si paga a ore o a servizio?', uk: 'Оплата погодинна чи за виклик?', lt: 'Mokama už valandas ar už kartą?', ar: 'هل الأجر بالساعة أم بالخدمة؟' } },
  { key: 'ok', group: 'deal', text: { es: '¿Le parece bien así?', pt: 'Está bom assim?', en: 'Is this all right for you?', fr: 'Ça vous convient comme ça ?', it: 'Le va bene così?', uk: 'Вас так влаштовує?', lt: 'Ar jums taip tinka?', ar: 'هل هذا مناسب لكم؟' } },
  { key: 'whereMop', group: 'deal', text: { es: '¿Dónde guarda la fregona?', pt: 'Onde fica o esfregão?', en: 'Where do you keep the mop?', fr: 'Où rangez-vous la serpillière ?', it: 'Dove tiene il mocio?', uk: 'Де ви тримаєте швабру?', lt: 'Kur laikote šluostę?', ar: 'أين تحفظون الممسحة؟' } },
  { key: 'runOut', group: 'warn', text: { es: 'Se ha acabado la lejía.', pt: 'Acabou a água sanitária.', en: 'The bleach has run out.', fr: "Il n'y a plus d'eau de Javel.", it: 'È finita la candeggina.', uk: 'Хлорка закінчилася.', lt: 'Baliklis baigėsi.', ar: 'نفدت مادة التبييض.' } },
  { key: 'broke', group: 'warn', text: { es: 'Se ha roto un vaso, lo siento mucho.', pt: 'Quebrou um copo, sinto muito.', en: 'A glass broke, I am very sorry.', fr: 'Un verre s’est cassé, toutes mes excuses.', it: 'Si è rotto un bicchiere, mi dispiace molto.', uk: 'Розбилася склянка, дуже перепрошую.', lt: 'Sudužo stiklinė, labai atsiprašau.', ar: 'انكسر كوب، مع بالغ الأسف.' } },
  { key: 'noEntry', group: 'warn', text: { es: 'No he podido entrar, no tenía llave.', pt: 'Não consegui entrar, não tinha chave.', en: "I couldn't get in, I didn't have a key.", fr: "Je n'ai pas pu entrer, je n'avais pas de clé.", it: 'Non ho potuto entrare, non avevo la chiave.', uk: 'Не вдалося увійти, не було ключа.', lt: 'Nepavyko įeiti, neturėjau rakto.', ar: 'لم أستطع الدخول، لم يكن معي مفتاح.' } },
  { key: 'late', group: 'warn', text: { es: 'Hoy voy a llegar un poco tarde.', pt: 'Hoje eu vou chegar um pouco mais tarde.', en: 'I will be a little late today.', fr: "Je vais arriver un peu en retard aujourd'hui.", it: 'Oggi arriverò un po’ più tardi.', uk: 'Сьогодні я трохи запізнюся.', lt: 'Šiandien šiek tiek vėluosiu.', ar: 'سأتأخر قليلاً اليوم.' } },
  { key: 'changeDay', group: 'warn', text: { es: '¿Puedo cambiar el día esta semana?', pt: 'Posso trocar o dia esta semana?', en: 'Can I change the day this week?', fr: 'Je peux changer de jour cette semaine ?', it: 'Posso cambiare giorno questa settimana?', uk: 'Чи можу я перенести день цього тижня?', lt: 'Ar galiu pakeisti dieną šią savaitę?', ar: 'هل يمكنني تغيير اليوم هذا الأسبوع؟' } },
  { key: 'gloves', group: 'warn', text: { es: 'Necesito guantes nuevos.', pt: 'Preciso de luvas novas.', en: 'I need new gloves.', fr: "J'ai besoin de gants neufs.", it: 'Ho bisogno di guanti nuovi.', uk: 'Мені потрібні нові рукавички.', lt: 'Man reikia naujų pirštinių.', ar: 'أحتاج قفازات جديدة.' } },
];

// ---------------------------------------------------------------------------
// MONTAGEM
// ---------------------------------------------------------------------------

/** Primeira letra em maiúscula. Em árabe e nas escritas sem caixa é operação nula. */
const cap = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** "Voy a fregar el suelo de la cocina." — o cômodo só entra onde a tarefa aceita. */
export const buildTaskPhrase = (
  lang: LangCode,
  frame: TaskFrame,
  task: Task,
  place: Place | null,
): string => {
  const body = frame.use === 'done' ? task.done[lang] : task.inf[lang];
  const full = place && task.takesPlace ? `${body} ${place.where[lang]}` : body;
  return cap(frame.templates[lang].replace('{t}', full));
};
