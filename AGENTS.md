# Aqui se diz — entrega técnica

Documento de transferência. Foi escrito para que outra IA, ou outra pessoa, consiga
trabalhar neste repositório sem ter acompanhado nada do que veio antes.

Companheiro deste arquivo: [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md), que é o registro
de **decisões** e explica por que cada coisa é como é. Este aqui descreve **o que
existe** e **o que está quebrado**. Quando os dois divergirem, o código manda.

Auditado em 9 de setembro de 2026, no commit `9e47b15`, com o app rodando.
Toda medição citada aqui foi feita, não estimada.

Atualizado em 9 de setembro de 2026, no commit `05d4b91`, depois da fase 7 (voz do
TTS). As seções 1, 2 e 12 foram corrigidas; a seção 11 virou registro histórico.

Atualizado de novo em 24 de setembro de 2026, sobre o commit `8b86ae2`, depois da
**auditoria de usabilidade de 23/09/2026** (o porquê de cada mudança está no
PROJECT_CONTEXT.md, seção "Auditoria de usabilidade"). Mudaram as seções 1, 2, 3, 5,
6, 7, 8, 9, 10 e 12. A seção 8 foi conferida item por item contra o código: o que já está
resolvido diz RESOLVIDO no título.

---

## 1. O que é o app

Guia de sobrevivência para quem acabou de imigrar. A ideia central não é traduzir
palavra por palavra: é mostrar **o produto equivalente de verdade** no país onde a
pessoa está. Dipirona não vira "dipirona" em espanhol, vira Nolotil.

O dono é brasileiro morando na Espanha. O público pretendido são brasileiros,
marroquinos, ucranianos e lituanos vivendo na Espanha.

Estado real: **zero usuários conhecidos**, mas o app está publicado.

Produção é <https://translator-zeta-weld.vercel.app>, hospedada na Vercel e ligada
ao repositório: **todo push na `main` publica sozinho**, sem passo manual. Não
procure script de deploy, porque não existe — quem publica é a Vercel.

A suíte de testes existe: **735 testes em 30 arquivos** (`npm test`; contados em
24/09/2026 com `npx vitest run`), cobrindo i18n, gramática gerada, seleção de voz do
TTS, o tocador de áudio, disponibilidade na farmácia, busca, acessibilidade,
persistência, recuperação de chunk, o recorte do lançamento, a moldura (dica, tela
Mostrar, pergunta de país, convite de instalar) e um arquivo por módulo generativo.
Vários testes montam a tela com `userEvent` e ficam lentos com a suíte inteira em
paralelo; por isso `vitest.config.ts` tem `testTimeout` de 15 s, e o motivo está
escrito lá: a suíte é a única rede antes do push na `main`, e intermitente ela deixa
de ser rede. Teste que chegue perto do limite se conserta pela causa (consulta
`getByRole` repetida, `import()` frio dentro do tempo do teste), não subindo o número.

O que continua não existindo é o app nativo: as pastas `android/` e `ios/` nunca
foram geradas.

## 2. Como rodar

```bash
npm install
npm run dev
```

O modo `dev` não ativa o service worker. Para testar offline é preciso o build:

```bash
npm run build
npm run preview
```

Sem chaves de API, sem back-end, sem banco. Todo o conteúdo está no bundle e o áudio
usa a voz do sistema operacional (`speechSynthesis`). Isso é deliberado: o app precisa
funcionar dentro de um supermercado sem sinal.

A regra é a **região**, não o idioma: `pt-BR` ≠ `pt-PT`, `es-ES` ≠ `es-US`,
`en-GB` ≠ `en-US`. Texto do Brasil na voz de Portugal é o defeito que dois revisores
nativos reprovaram. `pickVoice` em [`utils/speech.ts`](utils/speech.ts) só aceita
locale exato — não existe nível de "mesmo idioma, outra região", porque é ele que
produz a substituição errada.

Consequência prática: quase nenhum aparelho real tem a voz certa. O do dono tem duas
vozes ao todo, e nenhuma serve para 8 dos 9 destinos. Por isso o áudio tem três
níveis, nesta ordem:

1. **voz da região exata instalada** → fala pelo aparelho; offline e instantâneo;
2. **senão, com rede** → busca o MP3 no endpoint do Google Translate com o locale
   completo (`tl=pt-BR`, nunca `tl=pt`), que é o que entrega o sotaque certo num
   celular sem voz nenhuma;
3. **senão** → cala e abre a folha "Sem som agora", que manda **mostrar a frase
   escrita** (botão que abre a tela Mostrar) e diz o motivo certo: sem rede, ou
   rede com o som que não carregou. Os passos de instalar a voz ficam recolhidos,
   só com o sistema do aparelho, e nenhum código de locale aparece na tela.

Nenhum caminho fala com região errada.

Quem toca é [utils/tocador.ts](utils/tocador.ts), um só para o app inteiro: um som
de cada vez, a mesma frase de novo em até 15 s sai mais devagar, frase acima de 180
caracteres vira pedaços tocados em sequência (o endpoint recusa acima de 200, e a
recusa virava um falso "sem internet"), e o MP3 espera até 6 s antes de desistir. Ver
a seção 7, item 16.

O endpoint é **não oficial** e pode morrer sem aviso; o nível 3 é a degradação. Ele
também recusa requisição de navegador que mande `Referer` — devolve HTML no lugar do
MP3 —, e é por isso que `index.html` traz `<meta name="referrer" content="no-referrer">`.
Sem essa linha o áudio online não toca. Medido nos dois sentidos.

O painel de idiomas tem um diagnóstico que usa a mesma `pickVoice` e distingue voz
local (✅) de áudio pela rede (🌐).

Verificação de tipos: `npx tsc --noEmit`. Estava limpo na auditoria, e continua
limpo em 24/09/2026.

## 3. Pilha e arquitetura

React 19, Vite 6, TypeScript 5.8, Tailwind 3.4, `vite-plugin-pwa` com Workbox.
Capacitor 5 está declarado mas **as pastas `android/` e `ios/` nunca foram geradas**,
então o app nativo é intenção, não realidade.

Não existe biblioteca de roteamento nem gerenciador de estado. Cada módulo tem um
endereço próprio, com nome em espanhol (`/donde-duele`, `/limpieza`…), mapeado em
[utils/rotas.ts](utils/rotas.ts); mas quem desenha continua sendo `App.tsx`, que
guarda tudo em `useState` e escolhe o módulo com um `switch`:

```
index.tsx  →  App.tsx  →  switch (currentModule)  →  um dos doze módulos
```

`currentModule === null` desenha o hub, que é a grade de módulos. Cada módulo é
carregado com `React.lazy`, então abrir o hub não baixa o catálogo.

Estado que vive em `App.tsx` e desce por props:

| Estado | O que guarda | Persiste? |
|---|---|---|
| `currentModule` | qual módulo está aberto | não |
| `nativeCountry` | "Eu falo" | sim, `localStorage` (`useCountryPair`) |
| `targetCountry` | "Estou em" | sim, `localStorage` (`useCountryPair`) |
| `activeTab` | home, busca, favoritos, lista | não |
| `expandedItemKey` | qual card está aberto | não |
| listas e favoritos | via `useListManager` e `useFavorites` | sim, `localStorage` |

Até a fase 7 o par de países não era salvo e o app voltava para Brasil → Espanha a
cada abertura; hoje é, por código de país. Na primeira abertura, quando há mais de um
destino aberto e nenhum salvo, o app **pergunta** "Em que país você está agora?"
(ver seção 6).

Três coisas **não** descem por prop, de propósito, porque obrigariam os dez módulos
a repassar um campo novo: o estado do som (`utils/audioState.ts`, lido com
`useSyncExternalStore`), a função de tradução dentro do `PhraseCard`
(`hooks/useT.ts`, um contexto que o `App` publica) e a marca "já tocou num
alto-falante" (`localStorage`, lida pela moldura).

## 4. Modelo de dados

Três tipos, em [types.ts](types.ts):

- **`Country`** — nome, `lang` (BCP-47, ex.: `es-ES`), `code` de duas letras, caminho
  da bandeira, e `originOnly?`.
- **`Category`** — um nome e uma lista de subcategorias. São **chaves de tradução**,
  não texto: `"produce"`, `"painFever"`.
- **`TranslationItem`** — o item já resolvido para o par de idiomas atual.

### A convenção que governa o catálogo

O catálogo é um `Record<categoria, Record<subcategoria, item[]>>`. Cada item bruto:

```ts
{
  source_term: "Maçã",              // sempre pt-BR, e serve de identidade
  image: "",
  gender_pt: "f",
  translations: { cl: "Manzana", ar: "Manzana", gb: "Apple", us: "Apple",
                  pt: "Maçã", es: "Manzana", fr: "Pomme", it: "Mela" },
  phonetics:    { br: "/maˈsɐ̃/", es: "/manˈθana/", ... }
}
```

**A chave de tradução é o código do país, não o código do idioma.** `es` é Espanha,
`cl` é Chile, `ar` é **Argentina**, `us` e `gb` são separados. Isso permite dizer
"Plátano" no Chile e "Plátano" na Espanha mas "Frutilla" só no Chile.

> **Armadilha.** `ar` já significa Argentina. Se alguém adicionar árabe usando `ar`,
> vai sobrescrever a Argentina em silêncio, sem erro de tipo. O árabe tem que usar
> `ma` (Marrocos), que é o código do país, como o resto.

`br` **não existe** dentro de `translations`. Quando o país é `br`, o app devolve o
`source_term`. A cadeia de fallback está em [utils/itemHelpers.ts](utils/itemHelpers.ts):
código do país → código do idioma base → inglês → `source_term`.

### Tamanho real do catálogo

| Medida | Valor |
|---|---|
| Itens no catálogo | **1.333** |
| Cobertura de `translations` | 100% nas 8 chaves (cl, ar, gb, us, pt, es, fr, it) |
| Cobertura de `phonetics` na chave `br` | 100% |
| Cobertura de `phonetics` na chave `gb` | 34% |
| Cobertura de `phonetics` na chave `ar` (Argentina) | 35% |
| Cobertura de `phonetics` na chave `es` (Espanha) | 56% |
| Itens com `image` preenchida | **0 de 1.333** |

A documentação dizia 1.351, número que vinha de um `grep` ingênuo contando também as
18 linhas de declaração de tipo. Corrigido em todos os lugares nesta auditoria.

Duas leituras importantes dessa tabela.

O campo `image` existe no tipo, é passado por toda a cadeia de props e **nunca tem
conteúdo**. É peso morto em três arquivos.

E a pronúncia, que é justamente o que serve para falar com o atendente, **falta em 44%
dos itens no caso de uso principal**, que é um brasileiro na Espanha. O card mostra a
pronúncia só quando existe, então quase metade das vezes ele abre sem ela.

## 5. Os dois tipos de módulo

**Catálogo** (Supermercado, Farmácia). Um só componente,
[modules/CatalogModule.tsx](modules/CatalogModule.tsx), parametrizado por categorias e
por um prefixo de armazenamento. Tem busca, busca por voz, favoritos, lista de compras
e o painel de categorias.

**Generativo** (os outros dez). Não guardam frases prontas. Guardam tabelas pequenas
e **regras de gramática por idioma**, e montam a frase na hora. É o que permite oito
idiomas sem oito listas de frases.

### Como um módulo generativo é montado

Os dez recebem exatamente os mesmos nove campos de `commonProps` e nada mais: os dois
países, `t`, o tema, `onGoHome`, `onOpenLanguageModal`, `onOpenShare`,
`handlePlayAudio` e `voiceStatus`. Nenhum deles conhece favoritos, lista ou busca. A
auditoria de 23/09 acrescentou dica, pulso do alto-falante, tela Mostrar e linha de
gesto **sem nenhuma prop nova**: o que precisava chegar aos dez chega por store
(`utils/audioState.ts`), por contexto (`hooks/useT.ts`) ou pela moldura.

O núcleo de idiomas mora em
[modules/location/data/locationData.ts](modules/location/data/locationData.ts), que
exporta `LangCode`, `SUPPORTED_LANGS` e `toLangCode`. **Os nove componentes e os oito
outros arquivos de dados importam de lá.** Location é, na prática, o módulo base.

```ts
type LangCode = 'pt' | 'es' | 'en' | 'fr' | 'it' | 'uk' | 'ar' | 'lt';
type Text = Record<LangCode, string>;   // completo, o TypeScript exige os 8
```

Esse `Record` completo é a defesa central do projeto: esquecer um idioma numa tabela
nova não compila. As duas únicas exceções são `Pronoun.altPerson` e `Pronoun.dative`,
que são `Partial` de propósito.

**A frase montada mora na banda fixa da moldura**, entre o cabeçalho e a rolagem, e
nunca sai da tela — junto com as abas, onde o módulo as tem. Cada módulo tem UMA frase
ativa por vez (onde há abas, cada aba tem a sua, mas só uma é renderizada), e é isso que
permite um cartão só. Quem trocava uma palavra lá embaixo deixava de ver o que estava
montando, e ver a frase se formar **é** o módulo.

O cartão é [components/PhraseCard.tsx](components/PhraseCard.tsx), um só para os nove
(Direções tem lista, não frase). **O tamanho sai do comprimento da própria frase** —
30px até 30 caracteres, depois 24, 20 e 18 —, porque a Maquiagem com todas as dimensões
produz 131 caracteres e a 30px isso viraria sete linhas empurrando a tela. Contar
caracteres vale como medida porque a frase falada é **sempre** em alfabeto latino:
ucraniano, árabe e lituano são `originOnly` e nunca podem ser destino.

O cartão sabe três coisas sem prop nenhuma: **pulsa** (`animate-pulse` e `aria-busy`)
enquanto o som da própria frase carrega ou sai, lendo `useFalando`; **anota a glosa**
(`anotarGlosa`) antes de pedir o som, para a folha "Sem som agora" poder mostrar a
frase inteira; e tem no rodapé, alinhado à direita, o botão **Mostrar**, que abre
[components/ShowPhraseScreen.tsx](components/ShowPhraseScreen.tsx) — a frase em tela
cheia, de 48 a 28px conforme o comprimento, para virar o celular para quem está do
outro lado do balcão. A esquerda do rodapé fica vazia de propósito: é o lugar
reservado ao futuro "☆ Guardar". Quem fala sem o `PhraseCard` (as fichas e passos das
Direções, a pergunta do Onde está) repete à mão o `anotarGlosa` e o `useFalando`.

Todo módulo calcula o mesmo trio e mostra a língua de destino em destaque e a nativa
como linha de apoio (nunca abaixo de 14px; seção 7, item 12):

```ts
const target = toLangCode(targetCountry.lang);
const native = toLangCode(nativeCountry.lang);
const showNative = native !== target;
```

### Como cada módulo se explica

O diagnóstico da auditoria foi "o app funciona, mas não se explica". Todo módulo
generativo segue hoje as mesmas quatro regras:

1. **Dica de propósito**: `ModuleShell` recebe `dica={t('hint…')}`, uma linha de 16px
   que é o primeiro item da rolagem e diz PARA QUE o módulo serve. A Limpeza só a
   passa na aba *A tarefa*.
2. **Linha de gesto**: acima da dica, tingida com a cor do módulo, "Toque nas opções
   aqui embaixo e a frase lá em cima muda…". Aparece nos dez até o primeiro toque num
   alto-falante e some para sempre (`aquisediz:gestoAprendido`). O módulo a desliga
   com `gesto={false}` onde a banda não tem frase (Limpeza, *A patroa diz* e
   *Combinar*), senão a promessa contradiz a tela.
3. **Primeira frase da vida real**: a tela abre com algo que ela diria hoje, não com
   um exemplo de gramática (tabela abaixo).
4. **Nome longo no hub, título curto no cabeçalho**: o nome do hub diz o que o módulo
   faz; o `<h1>` tem ~190px a 375px e usa a chave curta.

| Hub (`module…`) | Cabeçalho | Abre com |
|---|---|---|
| Onde está a chave? | Onde está? (`locTitle`) | *La llave está debajo del sofá.* |
| Pedir caminho | Caminho (`dirTitle`) | cartão vazio que explica o que vão te dizer |
| Hora, preço e data | Números (`numTitle`) | a hora do celular, minutos de 5 em 5 |
| Onde dói | Onde dói | *Me duele la cabeza.* |
| Café e tapas | Café e tapas | *Un cortado, por favor.* |
| Quero, posso, preciso | Quero, posso (`pronTitle`) | *¿Puedes ayudarme?* / *Can you help me?* / *Est-ce que vous pouvez m'aider ?* |
| Roupa e sapato | Tamanhos (`szTitle`) | sapato, BR 40 |
| Maquiagem | Maquiagem | a base, sem nenhuma dimensão |
| Cuidar de idosos | Idosos (`ecTitle`) | *Siéntese, por favor.* |
| Limpeza da casa | Limpeza (`hcTitle`) | *Voy a limpiar la cocina.* |

### Os dez

| Módulo | Dados | Função que monta a frase |
|---|---|---|
| **Onde está a chave?** | 14 objetos, 12 relações | `buildSentence`, `buildQuestion` |
| **Pedir caminho** | 8 passos, 5 passos de lugar, 4 pontos cardeais, 7 "Como chego a…", 8 perguntas, 13 lugares, 8 distâncias | `headingSentence`, e `applyStep` para a geometria |
| **Hora, preço e data** | 20 listas de palavras, 96 nomes de mês, 4 períodos do dia, 10 perguntas repartidas pelas abas, 3 exemplos (outros 3 nos EUA) | 8 funções: `numberToWords`, `buildTime`, `buildPrice`, `buildDate`… |
| **Onde dói** | 14 partes do corpo (12 no desenho), 4 sintomas localizados e 8 gerais, 5 durações, 3 frases de urgência | `buildComplaint` |
| **Café e tapas** | 9 bebidas, 7 modificadores, 10 termos de porção, 9 frases de bar | `buildOrder` |
| **Quero, posso, preciso** | 11 pronomes, 7 verbos, **1.008 formas verbais** mais 56 femininas, 5 frases prontas | `buildPhrase` |
| **Roupa e sapato** | 6 tabelas, 47 linhas | `buildSizeQuestion`, `sizeQuestions` |
| **Maquiagem** | 9 produtos, 9 dimensões (36 opções), 21 acessórios, 4 quadros | `buildMakeupRequest`, `buildToolPhrase` |
| **Cuidar de idosos** | 18 falas, 12 relatos, 5 marcadores de tempo, 14 objetos, 4 quadros, 6 frases de emergência | `buildCareLine`, `buildReport`, `reportLabel`, `buildToolPhrase` |
| **Limpeza da casa** | 17 tarefas, 7 cômodos, 4 quadros, 12 frases que se ouvem, 12 que se dizem | `buildTaskPhrase` |

Todo módulo tem hoje o seu arquivo de teste em `tests/` (`location`, `directions`,
`numbers`, `body`, `cafe`, `pronouns`, `sizes`, `makeup`, `eldercare`,
`housecleaning`), além de `grammar.test.ts`, que varre as 21.384 frases dos Pronomes.

**Onde está a chave?** (era "Onde está?", que continua no cabeçalho). Uma cena com
dois emoji: um objeto de referência grande e um menor que se move para a posição
escolhida. Implementa contração românica (`de o → do`,
`di la → della`, `de le → du`), o artigo definido árabe colado sem espaço (`الكرة`),
e **declinação de caso** em ucraniano e lituano: a frase da relação traz um marcador
`{gen}`, `{instr}`, `{loc}` ou `{acc}` que é preenchido pela forma declinada do
substantivo. Ucraniano e árabe não têm cópula, e o verbo simplesmente sai da frase.

Abre com a chave embaixo do sofá, que é o que se perde na casa da patroa, e não com
bola e caixa. A frase inicial mora em `LOC_START`, resolvida por `locObjectByKey` e
`locRelationByKey`, que dão erro se a chave não existir — assim um erro de digitação
não abre a tela vazia. A rolagem segue a ordem da frase: *O que você procura* → *Em
que lugar* → *Ponto de referência*. Os cartões de objeto têm 96px para o quarto
aparecer cortado e mostrar que a fileira continua; na abertura, a fileira rola
sozinha (só na horizontal) até o objeto escolhido, senão o sofá nasceria escondido.
O botão da pergunta usa o mesmo alto-falante da frase: o antigo "?" era lido como
"ajuda".

**Pedir caminho** (era "Direções"; cabeçalho "Caminho"). Um bairro de 7×7 cruzamentos
em SVG que gira com o caminhante (ver PROJECT_CONTEXT.md). É o módulo menos
generativo: as frases dos passos estão guardadas inteiras por idioma. O registro do
espanhol é peninsular de propósito, com `manzana` para quarteirão. A única regra viva é `headingSentence`, e o lituano lá escapa de
propósito do acusativo que `į` exigiria, usando o neutro `Kryptis:`.

A tela diz **quem fala o quê**: o cartão fixo é *O que vão te dizer*, a grade é *O que
a pessoa diz*, as perguntas são *O que você pergunta*. Com o percurso vazio o cartão é
só um parágrafo explicando isso. No topo das perguntas ficam as sete fichas "¿Cómo
llego a…?" (`DIR_GO_TO`: farmácia, centro de saúde, metrô, ônibus, estação, banco,
supermercado), com a contração já feita em cada idioma. O caminhante começa no meio do
bairro (`START`), para a rotatória e a bifurcação aparecerem na primeira imagem; ao
chegar, ou ao bater o teto de `MAX_STEPS` (10), a grade diz isso em vez de ficar
vazia, e manda tocar "Começar de novo". A bússola volta a seguir o boneco a cada
passo e mora no fim da página. O mapa tem no máximo `min(240px, 32dvh)` e só gruda no
topo em tela de 800px de altura ou mais. Direções **não** usa o `PhraseCard`, então
não tem o botão Mostrar (ideia registrada como pendência).

**Hora, preço e data** (era "Números", que continua sendo o título do cabeçalho). O
mais denso. Hora, preço, data e número solto. Implementa o `y` do espanhol acima de
trinta e a apócope `cien`/`ciento`; a regra do `e` em português
depois de mil; o sistema vigesimal francês inteiro (`quatre-vingt-dix`); a elisão
italiana em `ventuno` e `ventotto`; o plural ucraniano governado por numeral (um, dois
a quatro, cinco ou mais); a regra lituana de `ltPlural`; e, em árabe, a ordem
unidade-antes-de-dezena com `و` mais o plural quebrado das minutos.

Aqui mora a decisão de cultura mais importante do app: na Espanha se **escreve** 24h e
se **fala** 12h com o período do dia. Por isso a hora é escolhida de 00 a 23 e o
período é **deduzido** por `periodFromHour24`. Assim "las diez de la madrugada", que
não existe, fica impossível de montar.

**A moeda sai do destino.** `currencyForCountry` é o único lugar que decide: `us` →
dólar, todo o resto → euro. Nos EUA o preço sai `$4.20`, *Four dollars and twenty
cents.*, curto *Four twenty.*, glosa "quatro dólares e vinte centavos", e os oito
idiomas sabem dizer dólar e cent. Chile, Argentina e Reino Unido também caem no euro,
o que está **errado** para eles (peso, peso, libra) — inofensivo só enquanto o recorte
os mantiver fechados. Nos EUA também mudam o separador decimal na tela (ponto, por
`decimalSeparatorFor`), a data (*September twenty-third.*, pelo 4º parâmetro de
`buildDate`) e os exemplos da aba Número (99.5 de febre em Fahrenheit, 8 onças, 1.5
litro, por `numberExamplesFor`). O francês não tem mais forma curta ambígua: devolve a
forma inteira, e a tela esconde a linha quando ela repete a de cima. `buildPrice` passou
a soletrar a parte inteira com `numberToWords` — antes dizia "undefined" a partir de
1.000,00.

A tela abre na hora do celular (minutos de 5 em 5). No teclado de preço e de número o
**primeiro toque começa um valor novo** — antes, tocar 5 com 4,20 na tela virava
42,05 —, e "Apagar" zera; o 7º algarismo mostra "Até 6 algarismos". As perguntas
dependem da aba (`questionsFor`), com "¿Puede repetirlo más despacio?" e "¿Me lo puede
escribir?" no topo de todas, e "¿Qué hora es?" logo abaixo do relógio. Os números do
mostrador respondem ao toque (atalho; a grade de horas continua sendo o caminho do
teclado), com letra de 14,1 e 15px na tela e alvos que não se sobrepõem.

**Onde dói.** Uma figura esquemática em SVG com 12 pontos tocáveis e rosto (olhos,
orelhas, boca, em `FACE`), com a linha "Toque no lugar que dói" em cima e o nome da
parte escolhida embaixo. "Costas" saiu do meio do tronco — quem tocava ali pedia *Me
duele la espalda* querendo a barriga — e ficou só na lista, como a pele. Nenhum par
de alvos se sobrepõe (`MARKER_HIT_R`). A gramática está num par de formas por parte
do corpo, `[artigo, locativo]`, e cada idioma usa o par de
um jeito: o inglês guarda **possessivo** (`my head`) porque diz *my head hurts*,
enquanto o espanhol usa dativo (`Me duele la cabeza`); o lituano guarda **acusativo**
(`galvą`, para `Man skauda galvą`); o ucraniano guarda nominativo e locativo.

No topo, antes do boneco, fica a faixa vermelha **"Urgência: médico e hospital"**
(`BODY_URGENT`, três frases), fechada, no mesmo desenho da Emergência do Cuidar de
idosos; ela não mostra número de emergência. Abaixo do boneco vêm "Como dói nesse
lugar?" e logo depois "Febre, tosse, enjoo e outros" (antes, a lista de partes ficava
no meio e empurrava febre e tosse uma tela para baixo); a lista de partes vem depois,
com o título "Não achou no boneco? Escolha aqui".
Toda frase é neutra em gênero (*Tengo mareos*, *Tengo alergia a la penicilina*,
*Tengo vómitos*) e há teste exigindo que o rótulo de cada botão apareça dentro da
frase que ele monta, em todo idioma que pode ser destino. A única frase com gênero é
*Estoy embarazada*, exceção declarada e testada: o gênero vem do conteúdo. A duração
mais curta é "desde esta mañana" / "desde hoje cedo" (`morning`): "Tengo fiebre desde
hoy" soa quebrado nas duas línguas.

**Café e tapas.** Desenha a bebida em camadas proporcionais dentro de uma xícara ou
copo. Existe porque `café com leite` não é `café con leche`. O artigo indefinido com
gênero já vem pronto no dado (`un cortado`, `una leche manchada`), então não há lógica
de artigo. Ucraniano e lituano guardam a bebida no **acusativo**, por ser objeto de um
"eu queria" implícito.

É o único módulo que **só vale na Espanha**, e diz isso: fora dela, o primeiro item da
rolagem é "Este módulo mostra como se pede num bar da Espanha." (`cafeSpainOnly`); as
notas continuam, porque o aviso já enquadra. O recipiente do desenho sai de
`vesselFor` ("en vaso" manda sobre o padrão da bebida) e os modificadores que não
fazem sentido somem por `modsFor` — "con leche fría" só onde há leite, "templado" nunca
com gelo —, sem apagar a escolha, no mesmo padrão do `optionsFor` da Maquiagem. As
explicações das palavras do cardápio ficam sempre à vista. A primeira frase do bar é
*Una caña, por favor.*, e *Soy vegetariano* virou *No como carne ni pescado*.

**Quero, posso, preciso** (era "Eu, você, ele"; a pasta continua `pronouns/`). O maior
risco de correção do projeto: 1.008 formas verbais escritas à mão, mais 56 femininas,
hoje varridas por `grammar.test.ts` (as 21.384 frases) e `pronouns.test.ts`.
Implementa o **do-support** do inglês completo, o `ne … pas` francês abraçando só o
auxiliar (`Je n'ai pas voulu`), a negação colada do lituano
(`nėra`), as três partículas de negação do árabe por tempo (`لا`, `ما`, `لن`), e o
**sujeito no dativo** em lituano, onde `reikia` não conjuga e quem declina é o pronome
(`Man reikia`).

A armadilha que motivou o módulo: o pronome `tu` tem `words.pt = 'você'` mas
`person = 1`, para a linha portuguesa sair natural enquanto a espanhola mostra
`tú quieres`. E `altPerson` corrige o tratamento formal, porque espanhol e italiano
conjugam `usted` na terceira pessoa e inglês, francês, ucraniano, árabe e lituano não.

**A grade depende do destino**, e isso mora em funções puras do dado, não na tela:
`pronounsFor(lang, countryCode)` mostra os 11 na Espanha, 8 na França (um `vous` só),
6 em inglês, e tira `vosotros` do espanhol fora da Espanha; `pronounBadge` só põe o
selo ESPANHA com destino Espanha e nunca põe FORMAL em inglês; e cada pronome tem
notas por lugar (`NoteRegion`: `spain`, `france`, `english`), das quais `noteFor` só
devolve a do lugar atual. Espanha é o **país** `es`, não a língua: Chile e Argentina
não veem `vosotros` nem nota.

`él / ella` e `ellos / ellas` viraram quatro pronomes, e entrou `nosotras` (só em
espanhol). O feminino **não é seletor**: só vale onde o gênero já é a própria palavra.
`Pronoun.gender` e `Verb.fem` guardam o que concorda — o passado ucraniano (`вона
хотіла`) e o árabe nos três tempos (`هي تريد`) —, e `verbForm` é a única porta, usada
pela frase e pela tabela, para as duas nunca discordarem.

No topo ficam as **Frases prontas** (`readyPhrasesFor`): Pode me ajudar? / Não falo
(a língua do lugar) / Falo um pouco / Posso pagar com cartão? / Preciso de um médico. O
rótulo é o próprio `buildPhrase` na língua de quem lê, e tocar só aciona os seletores
de sempre. Enquanto a frase pronta estiver intacta, ela sai **sem o pronome sujeito**
em es/pt/it (`buildPhrase(…, { semSujeito: true })`: *¿Puedes ayudarme?*, *Necesito
un médico.*); qualquer seletor tocado devolve o pronome. A tela abre nela, com o "você"
do lugar (`youPronoun`: tú na Espanha, vous na França, you nos EUA). Os seletores de
modo dizem "dizer / perguntar / dizer NÃO", e as notas não usam "2ª pessoa" nem
"forma formal". `ser` e `estar` trocaram "nuevo aquí", "estudiante" e "perdido" por
"de aquí" e "en casa", e o passado italiano deles foi para o imperfetto (`ero`,
`stavo`), porque `sono stato/stata` concorda com quem fala.

**Maquiagem.** Duas metades num seletor de modo, porque são interações diferentes: em
*Produtos* a pessoa **configura** um pedido (produto × tom × subtom × cobertura ×
acabamento × pele), em *Acessórios* ela **navega** e aponta 21 objetos desenhados.
Três convenções de caso que **divergem** do Café e precisam ser respeitadas: `orders.uk`
é **acusativo** (`Шукаю`), `orders.lt` é **genitivo** (`Ieškau`, não `norėti`), e
`orders.ar` é **indefinido, sem `ال`** — o oposto de `locationData.ts`. Só a dimensão
`color` tem adjetivo que concorda com o produto, com as quatro formas escritas à mão
(`rosa` é invariável em gênero e número no espanhol, `marrón` só flexiona no plural), e
só `uk`/`lt` antepõem o adjetivo. O estado **não é podado** ao trocar de produto: o tom
descreve a pessoa, e quem filtra é o builder, por `optionsFor`. Tabela e concordância
são varridas por `tests/makeup.test.ts`.

O que o produto **é** e o que é **da Espanha** estão separados no dado: `descs` é
neutro nos oito idiomas ("Cor para as maçãs do rosto.") e aparece em qualquer
destino; a armadilha de nome ("na Espanha é colorete") foi para `Product.spainNote`
(polvo, colorete, labial, mascara, esmalte) e só aparece com `naEspanha`. As notas dos
acessórios também só aparecem na Espanha, e agora **dentro do `PhraseCard` da banda
fixa**, separadas por um filete: mudam junto com o toque lá embaixo e continuam à
vista. Logo abaixo da grade de produtos vem "Toque só no que você souber. O que ficar
em branco, a vendedora pergunta." (`mkOptional`), e os rótulos em português se
explicam ("Frio (fundo rosado)", "Alta (cobre manchas)"). As duas grades passaram a
duas colunas, que é o que cabe com o piso de 14px. A linha "Mostre esta tela para quem
atende" saiu: o botão Mostrar do cartão faz isso. O inglês do módulo é britânico
("colour", "cotton buds") e vale também para o destino EUA — pendência registrada na
seção 8.

**Cuidar de idosos.** O primeiro módulo em que o app fala **com uma pessoa** e não com
um balconista: nos outros dez todo interlocutor é comerciante ou desconhecido na rua, e
toda frase é em 1ª pessoa sobre si (`Me duele la cabeza`). Aqui a frase vai **para** ela
(`¿Le duele algo?`) e **sobre** ela, para a família (`Hoy ha comido poco`).

Tem **dois eixos de flexão, e a regra é que eles nunca se multipliquem**: tratamento
(usted/tú) vive só no modo *Falar com ela*; gênero da pessoa cuidada vive só no modo
*Contar à família*, onde tratamento nem se aplica porque o interlocutor é outro. Os dois
seletores nunca aparecem na mesma tela, então a combinação é impossível pelo uso, e não
só pelo tipo. Nenhuma frase passa de duas formas. Para isso o lado "falar com ela" segue
uma regra de conteúdo: nenhum adjetivo concorda com o gênero dela — usa-se `tener` +
substantivo (`¿Tiene frío?`) no lugar de `estar` + adjetivo. Mesmo desvio que a
Maquiagem adotou para não concordar com o produto.

Duas exceções estão escritas no cabeçalho de `elderCareData.ts` e não devem ser
"corrigidas": em **árabe** a 2ª pessoa concorda com o gênero de quem OUVE e a cortesia é
lexical (`حضرتك`), nunca morfológica — por isso a célula `ar` guarda `{f, m}` e a linha de
apoio mostra as duas formas; em **ucraniano** o passado de 1ª pessoa denunciaria o gênero
de quem CUIDA (`я допомогла`), que é um terceiro eixo proibido, e por isso aquele lado
evita passado. Consequência: só `uk` pode coincidir nos dois tratamentos; `es`, `fr`,
`it`, `lt` **e `pt`** têm garantia de diferir — há teste para cada uma dessas coisas.
O português passou a diferir nesta auditoria: a glosa diz "A senhora…" ou "Você…", porque com
o sujeito oculto 15 das 18 falas saíam iguais nos dois lados do seletor e ele parecia
quebrado. "A senhora" é a palavra do próprio seletor, não um terceiro eixo.

**O botão mostra a frase, não um assunto.** Em *Falar com ela* cada botão é a frase
inteira na língua de quem lê, já no tratamento escolhido, numa coluna de 16px; em
*Contar à família* o rótulo é calculado por `reportLabel` ("Comeu pouco", "Esteve
tranquila" / "Esteve tranquilo") e segue o seletor. Os `labels` curtos continuam no
dado só como nome estável do item. O seletor de tratamento se chama "Você chama ela
de… Senhora / Você", some quando o destino é inglês (fica travado no formal, para a
glosa não seguir um seletor que ninguém vê) e, só na Espanha, traz embaixo "comece com
usted; passe para tú só se ela pedir". O relato "chamar o médico" não aceita marcador
de tempo (`semTempo`): a fila *Quando* fica desligada, não escondida, para a lista não
pular debaixo do dedo. Queda e caminhada perderam o lugar fixo ("se ha caído"), e o
comprimido virou duas perguntas, manhã e noite, mais o aviso sem período.

As notas têm `noteIn`, o código do **país** de destino em que valem (`visibleNote`):
"taca-taca", "la tensión" e "el empapador" só aparecem na Espanha, a da cadeira de
rodas só na França. E aparecem logo abaixo do grupo tocado, nunca acima da lista.

O caso gramatical aqui **varia por quadro**, e não por módulo como na Maquiagem:
`Ar turite` rege acusativo e `Ieškau` rege genitivo, no mesmo arquivo, sobre o mesmo
objeto. E há uma **regra de segurança que não é negociável**: nunca nome de medicamento,
nunca dose, nunca quantidade de comprimido — horário e adesão sim, o resto é a Farmácia.
Os únicos algarismos do arquivo são **os números de emergência de cada país**, fora das
tabelas: `EMERGENCY_NUMBERS = { us: '911' }`, com `112` como padrão, lidos por
`emergencyNumberFor(targetCountry.code)`. A faixa vermelha fechada mostra
"EMERGÊNCIA · FRASES", o número e uma seta; aberta, traz no topo o link
`<a href="tel:…">` "Ligar 112" / "Ligar 911", depois a dica e as seis frases.
`tests/eldercare.test.ts` varre todas as strings dos oito idiomas atrás de unidade de
dose, quantidade e princípio ativo, e exige 911 em `us` e 112 no resto. **É o único
teste do projeto cuja falha não é bug: é motivo para não publicar.**

Foi o primeiro módulo com **piso de 14px**, quando os outros desciam a `text-[10px]`
na linha de apoio. Desde 23/09/2026 o piso é regra do app inteiro (seção 7, item 12).

**Limpeza da casa.** O irmão do anterior, e a comparação entre os dois é o que ensina a
regra: lá a frase flexiona porque o objeto dela é uma **pessoa**; aqui o objeto é o
**chão**, não há o que concordar, e por isso o módulo **não tem seletor nenhum**. Isso é
decisão, não descuido — e está escrito no cabeçalho dos dados para o próximo agente não
"consertar" acrescentando um botão.

O achado do módulo é uma **assimetria de registro**: quem limpa trata a patroa de
`usted`, e a patroa costuma tratar quem limpa de `tú`. Por isso *A tarefa* e *Combinar*
estão em `usted` e *A patroa diz* (era "O que ela pede") está em `tú` — e este é o
**único modo do app inteiro em que a frase é para RECONHECER, não para falar**. O aviso
que diz isso ("São para você reconhecer quando ouvir, não para falar") mora na **banda
fixa**, e não na rolagem, onde sumia ao descer; embaixo dele, só na Espanha, "Ela vai
te chamar de 'tú' e você chama ela de 'usted'. É normal." Nessa aba e em *Combinar* o
módulo desliga a linha de gesto e a dica, que prometeriam uma frase montada em cima.

A tela de *A tarefa* abre em **"Voy a limpiar la cocina."**: a tarefa `clean` ("Limpar")
é a primeira de `TASKS` e a cozinha já vem escolhida — antes não havia como dizer o mais
básico. A ordem é *Como dizer* → **"Qual serviço?"** → grupos de tarefa, e o cômodo
("Em que cômodo? (se quiser)") desce para uma caixa tingida logo abaixo do grupo da
tarefa escolhida, seguida da dica daquela tarefa com o rótulo "Dica:" (`TIP_LABEL`, só na
Espanha). Em *Combinar*, "Avisar de alguma coisa" vem antes de "Combinar o trabalho".
A junção árabe `لِ` + `الـ` sai `لل` (`للتنظيف`), e há teste varrendo as frases.

A regra de conteúdo aqui é a de 1ª pessoa: **quem fala é sempre a própria pessoa, e o app
não sabe o gênero dela.** Nenhum predicativo pode concordar com quem fala — nada de
"vou chegar atrasada", `je suis désolée`, `non sono riuscita` nem `я не змогла`. O quadro
"já está feito" é o ponto mais fácil de estragar: `done.uk` usa o impessoal em -но/-то
(`підлогу вже помито`) e `done.lt` o particípio passivo (`grindys jau išplautos`), e é só
por isso que a tarefa guarda duas formas em vez de uma. Os outros três quadros vivem do
infinitivo, e foi assim que a tabela coube em duas formas em vez de quatro.

A **fronteira com o catálogo** é o ponto mais importante do arquivo: o Supermercado já é
dono de 96 produtos de limpeza em `supermarket/data/cleaningData.ts`. Este módulo é o
TRABALHO, não a compra, e por isso **não tem lista de objetos para navegar** — objeto só
aparece dentro da frase de uma tarefa. `tests/housecleaning.test.ts` falha se alguém
exportar uma tabela com `TOOLS`, `PRODUCTS`, `ITEMS` ou `OBJECTS` no nome.

### O campo `note` é o lugar da equivalência

Vale para os dois módulos de trabalho, e é a regra que os liga ao que o app sempre foi.
O primeiro commit do projeto traz `"Pão Francês"` virando **`Marraqueta`** no Chile e
**`Papo-seco`** em Portugal: não é tradução, é outro pão que ocupa o mesmo lugar na vida.
O app nasceu dicionário de **equivalência**.

Como cada origem tem sua língua (pt = Brasil, uk = Ucrânia, ar = Marrocos, lt = Lituânia),
**`note[lang]` já é uma nota por país de origem** — a mesma chave que o catálogo usa com
`cl`, `ar`, `pt`, `us`. Não falta estrutura; o que falta é conteúdo do tipo certo.

**A regra do conteúdo, e ela não é estilo:** a nota diz o que se faz **na Espanha**, na
língua de quem lê — **nunca** o que se faz no país dela. Dá para conferir que aqui a roupa
vai no *tendedero*; não dá para afirmar como se seca roupa em Vílnius sem inventar
etnografia sobre a casa da própria leitora. Dizer com segurança o lado espanhol já entrega
a diferença: ela mesma nota.

**E por isso a nota só aparece na Espanha.** Com os EUA e a França abertos no recorte,
quem estava em Miami lia "a fregona é o esfregão…" embaixo de uma frase em inglês. A
Limpeza e a Maquiagem filtram com `naEspanha`; o Cuidar de idosos, cujas notas falam
de países diferentes, usa `noteIn` por nota (seção 7, item 14).

E a **glosa continua fiel**: a linha no idioma dela é para conferir que vai dizer a coisa
certa, e se fosse "adaptada" ela perderia a única forma de verificar. Equivalência mora na
`note`, nunca na glosa — a mesma separação que Café e Maquiagem já fazem entre
`names[target]` e `descs[read]`.

**Roupa e sapato** (era "Medidas"; a pasta continua `sizes/`). Seis tabelas de
conversão entre Brasil, Europa, Reino Unido e Estados Unidos. `systemForCountry` manda
tudo que não é `br`, `cl`, `ar`, `gb` ou `us` para o sistema europeu, o que cobre
Ucrânia, Marrocos e Lituânia. Este arquivo importa `numberToWords` de Números para
soletrar o tamanho.

A tela lê de cima para baixo: o tipo de roupa (primeiro item da rolagem — saiu da banda
fixa, que com letra de 14px passava do teto de 45dvh e cortava a frase), a pergunta
("Qual número você calça no Brasil?", escolhida por `askKeyFor`), os números, e o
quadro "No Brasil → Peça este aqui" com as duas bandeiras. A tabela completa fica
fechada atrás de "Ver tabela completa", com as colunas na ordem origem, destino e
resto. Cada categoria guarda a própria escolha, a partir de `defaultRow` (sapato
abre em BR 40): antes, tocar em roupa pulava para 48/XXXL. Nos EUA o meio número sai
com ponto ("8.5") e por extenso na frase (*size eight and a half*; `spellSize` faz o
mesmo nos outros idiomas, menos lituano). "Maior/menor" tem versão de sapato e de
roupa (`sizeQuestions(kind)`): *un número más* × *una talla más*.

> Consequência da estrutura: como ucraniano, árabe e lituano **nunca podem ser destino**,
> todo ramo `case 'uk'`, `case 'lt'` e o `default:` árabe dessas funções só é exercitado
> na linha de apoio, nunca na frase falada. Um terço da gramática escrita está sem uso
> real, e portanto sem prova.


## 6. Idiomas

Doze países em [constants.ts](constants.ts), oito blocos de tradução em
[translations.ts](translations.ts).

| Bloco | Serve os países |
|---|---|
| `enUS` | `en-US`, `en-GB` |
| `ptBR` | `pt-BR`, `pt-PT` |
| `esCL` | `es-CL`, `es-AR`, **`es-ES`** |
| `frFR`, `itIT`, `ukUA`, `arMA`, `ltLT` | um cada |

Os oito blocos têm **387 chaves cada, sem uma diferença** (eram 341 antes da auditoria
de 23/09; contadas de novo em 24/09 nos doze locales). Verificado por script: nenhuma
chave duplicada, nenhuma chave usada no código que não exista — e o teste de
`tests/i18n.test.tsx` que confere isso hoje varre os dez módulos generativos e as
peças da moldura, lê os dois lados de um ternário (`t(chegou ? 'dirArrived' :
'dirMaxSteps')`) e confere os doze locales. Essa parte está sólida.

Sobraram de propósito, sem uso na tela, as treze chaves `module…` dos módulos "em
breve" que saíram do hub (Restaurante, Transporte, Hotel…): não foram substituídas, e
`tests/moldura.test.tsx` usa quatro delas para provar que não aparecem.

O nome `esCL` é herança do começo do projeto, quando o destino era o Chile. Hoje ele
atende a Espanha, que é o foco. Renomear é cosmético mas evita confusão.

### Países só de origem

Ucrânia, Marrocos e Lituânia têm `originOnly: true`. Aparecem em "Eu falo" e nunca em
"Estou em", porque o catálogo não tem tradução para esses idiomas. Consequência:
Supermercado e Farmácia ficam **desabilitados no hub** para quem escolhe um deles.

Testei o caminho inteiro: escolhendo Ucrânia, a interface fica em ucraniano, os dois
módulos de catálogo aparecem bloqueados, e Direções compõe pares espanhol/ucraniano
corretamente. Funciona.

O rótulo do bloqueio diz "Em breve", que não é bem verdade: o motivo é falta de dados
para aquele idioma, não uma data futura.

### Recorte do lançamento (temporário)

Por cima de tudo isso vale hoje um recorte em [lancamento.ts](lancamento.ts): "Eu falo"
só aceita o Brasil, "Estou em" só aceita Estados Unidos, França e Espanha, e Supermercado e
Farmácia estão fechados para todo mundo. **Não é defeito, e nada foi removido**: o que
está fora aparece desativado. Para abrir de novo, basta afrouxar as três funções desse
arquivo. O porquê está no PROJECT_CONTEXT.md.

Como o recorte aparece no hub desde 23/09: os dois módulos fechados vão para o **fim**
da grade (ordenação estável por `estaBloqueado`), e não mais para a primeira linha. O
Supermercado continua "Em breve" e não responde. A **Farmácia fechada** mostra
`Use "Onde dói"` e o toque abre o Onde dói (`DESVIO_SE_FECHADO` em `App.tsx`), porque é
a telha que quem sente dor procura; a rota `/farmacia` continua trancada. As treze
telhas cinzas de módulos que não existem (Restaurante, Hospital…) saíram.

**Os três destinos abertos continuam abertos, e o app agora está certo nos três.** A
regra é que nada da Espanha aparece como verdade fora da Espanha (seção 7, item 14).
O que muda por destino, hoje:

| | Espanha | Estados Unidos | França |
|---|---|---|---|
| Notas e dicas culturais ("na Espanha…", fregona, taca-taca, tú/usted da patroa) | sim | não | não |
| Café e tapas | normal | aviso "Este módulo mostra como se pede num bar da Espanha" | idem |
| Emergência no Cuidar de idosos | 112 | **911** | 112 |
| Moeda nos Números | euro | **dólar** (`$4.20`) | euro |
| Pronomes na grade | 11, com `vosotros` e notas da Espanha | 6, sem FORMAL | 8, um `vous` só |
| Numeração de roupa e sapato | europeia | americana; meio número com ponto ("8.5") e por extenso na frase | europeia |
| Data e exemplos de número | — | *September twenty-third*; 99.5 °F, 8 onças | — |
| Seletor de tratamento (Idosos) | sim, com a dica do usted | some (inglês não distingue) | sim |

**A pergunta de país.** Na primeira abertura, se houver mais de um destino aberto e
nenhum destino aberto salvo, sobe a folha "Em que país você está agora?"
([components/CountrySheet.tsx](components/CountrySheet.tsx)), com um botão grande por
destino. Escolher salva; fechar sem escolher fica na Espanha e não pergunta de novo
(`aquisediz:paisPerguntado`). Um destino salvo que o recorte fechou (ex.: Itália) conta
como "sem destino", e a pergunta aparece. No hub, o par de bandeiras virou um botão
"Estou em: **Espanha** ▾", com o dois-pontos para servir a qualquer país sem guardar
o artigo ("na França", "nos Estados Unidos"). A regra é pura, em
[utils/primeiraAbertura.ts](utils/primeiraAbertura.ts) (`devePerguntarPais`), junto
com a do convite de instalar, que só abre depois da primeira frase ouvida de fato ou
na segunda abertura, nunca antes da pergunta de país, só no hub e com a tela livre, e
volta 7 dias depois de "Agora não".

**Pendente para quando o recorte cair** (não foi anotado em `lancamento.ts`, que é do
dono, e por isso fica aqui): o texto de compartilhar (`shareMessage`, nos oito
blocos) e a prévia do link (`description` e `og:description` em `index.html`) deixaram
de citar Supermercado e Farmácia de propósito, e devem **voltar a citá-los** quando os
dois abrirem. E antes de abrir Chile, Argentina ou Reino Unido, `currencyForCountry`
precisa aprender peso e libra. Já a descrição do manifesto do PWA (`vite.config.ts`)
ficou de fora desta implementação e ainda promete "supermercado, farmácia" (seção 8,
item 8.28).

## 7. Convenções que precisam ser respeitadas

1. **Classe do Tailwind nunca se monta por concatenação.** `bg-${cor}` não gera CSS,
   e não dá erro: a cor simplesmente some. O projeto já caiu nisso duas vezes, e
   **ainda está caído em um lugar** (ver seção 8). Cor vai por extenso em
   [components/categoryMeta.ts](components/categoryMeta.ts) ou por `style` inline com
   o `hex` do tema.
2. **Ícone é SVG autoral**, `viewBox="0 0 24 24"`, `strokeWidth={1.8}`,
   `stroke="currentColor"`. Ícones de categoria moram em
   [components/CategoryIcons.tsx](components/CategoryIcons.tsx) e **não** em
   `Icons.tsx`, de propósito: assim caem no pedaço adiado do catálogo.
3. **`.hit`** amplia a área de toque para 44px por pseudo-elemento, sem mexer no
   desenho. Todo botão só de ícone precisa dela.
4. **`.tap`** é a transição padrão de toque, com propriedades explícitas
   (`transform 150ms var(--ease-out)` e as cores), nunca `all`.
5. **Todo pressável dá retorno ao dedo.** `.tap` + `active:scale-*`, e a escala é
   por tamanho de alvo: `scale-90` em botão só de ícone, `scale-95` em chip,
   `scale-[0.97]`–`[0.98]` em cartão ou linha de largura inteira — 5% numa faixa
   larga lê como a tela pulando. **Exceção declarada:** trilhos de duas posições e
   abas de modo ficam de fora, porque neles a troca de estado JÁ é o retorno — a
   pastilha branca pula para o outro lado no mesmo instante, e somar escala seria
   animar por animar. Antes desta regra, 83 dos 140 botões do Supermercado não
   respondiam ao toque, incluindo o de áudio de cada item da lista.
6. **`dir="auto"`** em todo texto que venha de tradução, para o árabe virar sozinho.
7. **Movimento reduzido** já está tratado em [index.css](index.css): as animações
   viram opacidade pura em vez de sumirem.
8. Cor de tema vem de `THEMES` em [App.tsx](App.tsx), que tem as quatro formas da cor
   (`color`, `textColor`, `hex`, `borderColor`) justamente para nunca precisar montar
   classe.
9. **Toda superfície neutra tem par no escuro.** `bg-white` sem `dark:bg-slate-800`
   ao lado é defeito, e [tests/darkMode.test.ts](tests/darkMode.test.ts) reprova.
   Duas coisas ficam **de fora** e nunca devem ganhar par: `text-white` e
   `bg-white/NN` — os dois vivem sobre a cor do módulo, que é a mesma nos dois
   temas. É por isso que a barra do alfa entra na fronteira do regex.
10. **Desenho não tem cor cravada.** As cores dos SVGs são papéis declarados em
    [index.css](index.css) — `--art-ground`, `--art-tint`, `--art-edge`,
    `--art-fill`, `--art-line`, `--art-ink`, `--art-plate`, `--art-paint`,
    mais `--art-label` para texto dentro do desenho e `--art-skin`/`--art-green`
    fora da rampa. A rampa inverte inteira no escuro, na mesma ordem, e é por isso
    que nenhum desenho troca de figura e fundo. Cor de marca (WhatsApp, Telegram,
    Facebook, em [components/BrandIcons.tsx](components/BrandIcons.tsx)) é a única
    exceção: marca é fixa por definição.
11. **A cor do módulo como texto passa por `--tema-texto`, nunca por `theme.hex`.**
    `App.tsx` publica `--tema` na raiz do documento a cada troca de módulo; o CSS
    deriva dali um tom legível. As doze cores foram escolhidas para texto sobre
    branco e reprovam sobre o cartão escuro — o vermelho do Supermercado dá
    3,03:1. E como `theme.hex` chega por `style` inline, vindo do JS, **nenhuma
    variante `dark:` o alcança**: o token é o único caminho. Vale para texto,
    borda e anel; onde a cor do módulo É o fundo, o hex cru continua certo.

Os itens 12 a 17 vieram da auditoria de usabilidade de 23/09/2026. Quem usa o app é
uma brasileira recém-chegada, de pouca escolaridade, de óculos, com o celular numa mão
só; cada regra abaixo existe por causa dela.

12. **Piso de 14px no app inteiro.** Todo texto que a pessoa LÊ — linha de apoio em
    português, rótulo de botão, título de seção, aviso — é no mínimo `text-sm`. Nada
    de `text-[9px]`, `text-[10px]`, `text-[11px]` ou `text-xs` em conteúdo; o único
    `text-xs` tolerado é selo decorativo que repete informação (o FORMAL dos
    Pronomes). Corpo corrido prefere `text-base`. O português **não fica apagado**:
    sem `opacity-70`; no botão inativo, `text-gray-600 dark:text-slate-300`, no ativo,
    branco. Nos botões de escolha a ordem **não se inverte**: o idioma de destino em
    cima (é o que ela aprende), o português embaixo, os dois ≥ 14px — o Cuidar de
    idosos, que já punha o português em cima, ficou como está. Onde o texto maior não
    couber, a grade perde uma coluna; a letra não encolhe. Vários arquivos de teste
    varrem o próprio módulo atrás de `text-xs` e `text-[Npx]`.
13. **Nenhuma frase concorda com o gênero de quem fala**, no app inteiro e nos oito
    idiomas. O app não sabe o gênero dela e não pergunta: *Tengo alergia*, *Me he
    perdido*, *Tengo mareos*, *No como carne ni pescado*, e nunca *Soy alérgico*,
    *Estoy perdido*, *je suis désolée*. Vale também para quem OUVE: *Vous y êtes*, *Ci
    sei*, e não *Vous êtes arrivé*. Os testes de gramática usam fronteira `\p{L}`,
    porque o `\b` do JavaScript não enxerga letra acentuada nem cirílica. Exceção
    declarada: *Estoy embarazada*, cujo gênero vem do conteúdo. Pendência conhecida:
    o passado ucraniano de 1ª pessoa nos Pronomes (item 8.6).
14. **`naEspanha`.** Nota ou dica cultural que fala da Espanha (fregona, taca-taca,
    tú/usted da patroa, "na Espanha se usa…") só aparece com
    `const naEspanha = targetCountry.code === 'es'` — o **país**, não a língua: Chile
    e Argentina falam espanhol e não são a Espanha. Fora dela, a nota some (ou fica a
    versão neutra, se houver). Onde as notas falam de países diferentes, a nota traz o
    país (`noteIn` no Cuidar de idosos). O que é dado por país tem **um lugar só que
    decide**: `emergencyNumberFor` (911 nos EUA, 112 no resto), `currencyForCountry`
    (dólar nos EUA, euro no resto), `pronounsFor`/`noteFor` nos Pronomes.
15. **Dica por módulo, pela moldura.** Todo módulo generativo passa
    `dica={t('hint…')}` ao `ModuleShell` (16px, primeiro item da rolagem) e usa o
    título curto no cabeçalho quando o nome do hub é longo (`locTitle`, `dirTitle`,
    `numTitle`, `pronTitle`, `szTitle`, `ecTitle`, `hcTitle`). A linha de gesto vem de
    graça; desligue com `gesto={false}` onde a banda não tem frase. A primeira frase
    de cada módulo é algo que ela diria hoje, não exemplo de gramática.
16. **Áudio: um de cada vez, e repetir sai mais devagar.** Todo som passa por
    `handlePlayAudio` do `App`, que usa [utils/tocador.ts](utils/tocador.ts): cada
    toque cala o anterior (inclusive `speechSynthesis`), e trocar de módulo cala tudo;
    a mesma frase de novo em até 15 s sai devagar (voz do aparelho a 0.7, MP3 a 0.75
    no MESMO elemento `Audio`, sem baixar de novo), e o terceiro toque volta ao normal
    — mas só se o som anterior saiu de fato; tocar de novo enquanto carrega é nova
    tentativa, em velocidade normal. O estado (`parado`, `carregando`, `falando`)
    mora em [utils/audioState.ts](utils/audioState.ts): quem desenha um botão de ouvir
    lê `useFalando(frase)` para pulsar e pôr `aria-busy`, e chama `anotarGlosa(frase,
    glosa)` antes de pedir o som. Nunca crie `new Audio()` nem chame
    `speechSynthesis.speak` fora do tocador.
17. **Tela Mostrar.** Todo `PhraseCard` tem no rodapé o botão "Mostrar" (as fichas
    das Direções ainda não; ver seção 8), e a folha "Sem som agora" oferece o mesmo
    como botão principal. Os dois abrem
    [components/ShowPhraseScreen.tsx](components/ShowPhraseScreen.tsx) em portal no
    `document.body`: fundo branco (`dark:bg-slate-900`), frase de 48 a 28px, glosa em
    18px, alto-falante e "Fechar" largo. É diálogo de verdade (role dialog,
    `aria-modal`, Esc, foco preso) pelo `useDialog`, que mantém uma **pilha**: só o
    diálogo de cima responde a Esc e Tab, porque a folha "Sem som agora" pode abrir
    por cima da tela Mostrar. Se o som falha dentro da tela Mostrar, "Mostrar a frase"
    só fecha a folha (`fraseJaNaTela`), em vez de empilhar uma segunda tela igual.
    Escala de camadas: `LanguagePanel` 100, `CountrySheet` 102, `ShareSheet` 105,
    `ShowPhraseScreen` 108, `VoiceMissingSheet` 110, `UpdateSheet` 120.

## 8. Auditoria: o que está quebrado

Os quatro primeiros e os de acessibilidade foram **reproduzidos no navegador**, com o
app rodando. Os demais foram achados lendo o código e conferidos contra o arquivo, mas
não encenados: onde o defeito ainda não tem como aparecer, o texto diz por quê.

**Estado em 24/09/2026.** Cada item foi conferido de novo contra o código. O texto
original fica, como registro; o que já foi consertado diz RESOLVIDO no título, e uma
linha em itálico diz como está hoje. A maior parte saiu no commit `c358244` ("seis
fases de correção"); o resto, na auditoria de usabilidade (`8b86ae2`). Os itens 8.28
em diante são novos: achados durante a auditoria de usabilidade e deixados abertos.

### Graves

**8.1 — RESOLVIDO. Favoritar no Supermercado e mexer na Farmácia apaga o favorito.**
[hooks/useListManager.ts:11](hooks/useListManager.ts#L11)

*Hoje: favoritos saíram do hook e vivem em `hooks/useFavorites.ts`, uma lista só,
montada uma vez em `App.tsx`.*

`favoritesKey` é a string fixa `'favorites'`, sem prefixo, enquanto lista e itens
marcados são prefixados. `App.tsx` instancia o hook **duas vezes**, uma para
supermercado e outra para farmácia. Cada instância tem seu próprio estado de
favoritos em memória, mas as duas escrevem na mesma chave do `localStorage`. Quando
qualquer coisa muda na farmácia, o efeito de salvar dela grava a cópia velha por cima.

Reproduzido: favoritei "Abacate" no Supermercado, `favorites` ficou `["Abacate"]`;
adicionei um item à lista da Farmácia, `favorites` ficou `[]`.

Correção: prefixar a chave, ou tirar favoritos do hook e subir para um estado único
em `App.tsx`. A segunda é melhor, porque favoritos são apresentados como uma lista só.

**8.2 — RESOLVIDO. Itens diferentes compartilham a mesma identidade.**
[utils/itemHelpers.ts:65](utils/itemHelpers.ts#L65)

*Hoje: a chave é `makeItemKey(category, subCategory, source_term)`
([utils/itemIdentity.ts](utils/itemIdentity.ts)), com teste próprio.*

`key: baseKey`, e `baseKey` é o `source_term`. Existem **139 termos repetidos** no
catálogo, alguns em três subcategorias diferentes ("Soro Fisiológico", "Nebacetin",
"Preservativo"). Dois itens distintos ficam com a mesma chave.

Reproduzido: buscando "Soro Fisiológico" aparecem dois cards; cliquei na estrela de
um e **os dois ficaram marcados**. A lista de compras também não consegue guardar os
dois, e o `key` do React colide.

Correção: `key: ${category}/${subCategory}/${source_term}`. Isso invalida os favoritos
já salvos de quem tiver o app, então precisa de uma migração ou de um descarte
consciente.

**8.3 — RESOLVIDO. Os cards não existem para o teclado.**
[components/TranslationItem.tsx](components/TranslationItem.tsx)

*Hoje: o gatilho do card é um `<button>` de verdade (Tab, Enter e Espaço).*

O card inteiro é uma `div` com `onClick`. Medido: **0 de 25 cards** são alcançáveis
por teclado. Dentro da parte que só abre no clique estão a pronúncia e o botão de
adicionar à lista, então quem navega por teclado ou leitor de tela não chega a eles.

Correção: trocar a `div` por `button`, ou dar `role="button"`, `tabIndex={0}` e
tratamento de Enter e Espaço.

**8.4 — RESOLVIDO. O app proíbe aumentar o zoom.**
[index.html:5](index.html#L5)

*Hoje: o `viewport` é só `width=device-width, initial-scale=1.0, viewport-fit=cover`.*

`user-scalable=no, maximum-scale=1.0`. Falha o critério 1.4.4 da WCAG. Para um app
cujo público inclui gente mais velha lendo bula de remédio numa farmácia estrangeira,
é a barreira errada. Tirar os dois atributos resolve; o `viewport-fit=cover` fica.

### Médias

**8.5 — RESOLVIDO. O preço curto em lituano sai em árabe.**
[modules/numbers/data/numbersData.ts](modules/numbers/data/numbersData.ts)

*Hoje: `buildPriceShort` tem `case 'lt'`. A regra geral do parágrafo de baixo, sobre
o `default:` inconsistente, continua valendo.*

`buildPriceShort` tem `case` para es, pt, en, fr, it e uk, e um `default:` que devolve
a forma árabe com a conjunção `و`. **Não existe `case 'lt'`**, então o lituano cai no
árabe. Está inofensivo hoje só porque a função é chamada apenas para o idioma de
destino, e a Lituânia nunca é destino. No dia em que for, dispara.

Vale a regra geral: o `default:` dessas funções não é consistente no projeto. Em
`buildQuestion` e `headingSentence` ele é **inglês**; em `buildTime`, `buildPrice`,
`buildDate` e `buildSizeQuestion` ele é **árabe**. Quem lê precisa conferir função por
função.

**8.6 — EM PARTE. O passado ucraniano está sempre no masculino.**
[modules/pronouns/data/pronounsData.ts](modules/pronouns/data/pronounsData.ts)

*Hoje: com `ella`/`ellas` separados de `él`/`ellos`, a 3ª pessoa feminina sai certa
(`вона хотіла`, por `Verb.fem`). Continua masculino o singular de 1ª e 2ª pessoa
(`я хотів`), e isso fere a regra de gênero da seção 7, item 13. O ucraniano não tem
forma neutra: consertar é reescrever com construção impessoal (`мені хотілося…`),
trabalho para falante nativo e decisão do dono. `tests/grammar.test.ts`, Parte 7,
registra o estado atual e falha quando ele mudar. Só aparece na linha de apoio, e
"Eu falo" Ucrânia está fechado no recorte.*

`pastForms.uk` guarda `['хотів', 'хотів', 'хотів', 'хотіли', …]`. O ucraniano marca
gênero no passado singular, então uma mulher dizendo "eu queria" recebe `хотів` em vez
de `хотіла`. Vale para os sete verbos. Não há seletor de gênero em lugar nenhum do app.

**8.7 — A cor de hover dos botões dos cards nunca funcionou.** (aberto)
[components/TranslationItem.tsx:86](components/TranslationItem.tsx#L86)

```
hover:${theme.textColor}
```

É exatamente a armadilha que o próprio projeto documenta. Confirmei no CSS gerado:
`hover:text-red-600`, `hover:text-emerald-700`, `hover:text-blue-600` e
`hover:text-rose-600` aparecem **zero vezes**. Os botões de ouvir, perguntar,
carrinho e estrela nunca mudaram de cor ao passar o mouse.

**8.8 — RESOLVIDO. Botões sem nome acessível.** Três, todos X de fechar:
o de fechar o painel de favoritos e lista em
[components/ModuleLayout.tsx:195](components/ModuleLayout.tsx#L195), e o do painel de
idiomas em [components/LanguagePanel.tsx:77](components/LanguagePanel.tsx#L77). Um
leitor de tela anuncia "botão" e nada mais.

*Hoje: os dois X e a alça do painel têm `aria-label={t('close')}`.*

**8.9 — RESOLVIDO. Alvos de toque abaixo de 44px**, todos sem `.hit`:

| Onde | Tamanho |
|---|---|
| Bandeiras do idioma, no hub | 56×40 |
| X de fechar os painéis deslizantes | 36×36 |
| X do painel de idiomas | 22×22 |
| Botão OK do painel de idiomas | 232×40 |

*Hoje: no hub, o par de bandeiras virou o botão "Estou em: Espanha ▾" com
`min-h-[44px]`; os dois X têm `.hit` (o do painel de idiomas também ganhou fundo
`bg-black/40` e ícone de 20px); o OK tem `min-h-[44px]`.*

**8.10 — RESOLVIDO. O painel de idiomas não fecha com Esc, não prende o foco e não é um diálogo.**

*Hoje: `role="dialog"`, `aria-modal` e o comportamento de `hooks/useDialog.ts`, que
virou o padrão de todo diálogo do app (e mantém uma pilha: só o de cima responde).
Na auditoria de usabilidade o painel ganhou o nome do país embaixo de cada bandeira,
as bandeiras livres sempre coloridas (o cinza ficou só para as bloqueadas, e o nome
delas continua legível) e largura `max-w-xs`.*
Testado: a tecla Esc não faz nada nele. Ele não tem `role="dialog"` nem `aria-modal`.
O padrão certo já existe no projeto, em
[components/CategorySheet.tsx](components/CategorySheet.tsx), escrito do zero na
última mudança. É copiar de lá.

**8.11 — RESOLVIDO. A alça de arrastar do painel é uma `div` com `onClick`.**
[components/ModuleLayout.tsx:183](components/ModuleLayout.tsx#L183). Fecha o painel,
mas não tem papel, nem nome, nem foco. E não arrasta: só clica.

*Hoje: é um `<button>` com nome, `.hit` e retorno de toque. Continua sem arrastar.*

**8.12 — RESOLVIDO. Não existe barreira de erro.** Nenhum `componentDidCatch` no projeto. Com
`React.lazy` e um service worker em `autoUpdate`, uma referência a pedaço velho depois
de um deploy derruba a tela inteira para branco, sem recuperação. Este app **já sofreu
tela branca em produção** antes. Uma `ErrorBoundary` em volta do `Suspense` em
[App.tsx:338](App.tsx#L338) é barata e ataca exatamente esse risco.

*Hoje: `components/ErrorBoundary.tsx` envolve o `Suspense`, com `ErrorFallback` e
recuperação de pedaço velho (`tests/errorBoundary.test.tsx`,
`tests/chunkRecovery.test.ts`).*

**8.13 — Não dá para desligar o som.** (aberto) São 76 chamadas de `playSound`, uma em
quase todo toque, e nenhuma configuração para silenciar. Numa farmácia ou num caixa de
supermercado isso é constrangedor.

*Em 24/09 são 100 chamadas fora dos testes, e continua sem configuração. Não confundir
com a frase falada, que é outra coisa e passa pelo tocador.*

### Pequenas

**8.14 — Áreas de toque sobrepostas na barra de busca.** (aberto, não reconferido na
tela) Os botões de limpar e de voz
têm centros a 41px um do outro, mas cada área `.hit` tem 44px: elas se cruzam em 3px.
Um toque na faixa do meio vai para o botão errado.

**8.15 — Número mágico desalinhado.** O painel deslizante é fixado em `top: '9rem'`
(144px) em [components/ModuleLayout.tsx:172](components/ModuleLayout.tsx#L172), mas
com o painel aberto o cabeçalho mede **158px**. O painel come 14px do cabeçalho. Foi
o novo gatilho de categoria, de 56px, que mudou a conta. Deve ser medido, não fixado.
*Continua `top: '9rem'` em 24/09.*

**8.16 — RESOLVIDO. O painel de categorias entra deslizando e sai seco.** Ele desmonta
na hora, sem transição de saída.

*Hoje: `hooks/usePresenca.ts` mantém a folha montada enquanto ela sai, e as sete
sobreposições o usam (categorias, idiomas, país, compartilhar, Mostrar, sem som,
atualização).*

**8.17 — RESOLVIDO. O cabeçalho existia em dez cópias.** Os dez módulos generativos
redesenhavam à mão o mesmo cabeçalho; mexer nele significava mexer em dez arquivos, e
era assim que saíam de sincronia. Agora usam [components/ModuleShell.tsx](components/ModuleShell.tsx),
que traz o cabeçalho e a **banda fixa** onde mora a frase montada.
`tests/share.test.tsx` recusa qualquer módulo que volte a escrever `<header>` ou
`<ShareButton>` por conta própria, ou que esqueça o `pinned`.

**Continua aberto do 8.17:** cada módulo ainda redeclara a mesma interface de props com
outro nome, e sete arquivos redefinem a própria função `cap()` (seis de dados e o
`NumbersModule.tsx`, contados em 24/09).

**8.18 — RESOLVIDO. Rótulo de sistema de medidas fixo em português.**
`SYSTEM_LABEL` em [modules/sizes/data/sizesData.ts:13](modules/sizes/data/sizesData.ts#L13)
é `{ BR: 'Brasil', EU: 'Europa', UK: 'Reino Unido', US: 'EUA' }`, sem tradução, e vai
direto para a tela ao lado de rótulos traduzidos. Um ucraniano lê "Reino Unido".

*Hoje: `SYSTEM_LABEL` guarda chaves de tradução (`sizeSystemBR`…). E o quadro de
conversão nem mostra mais o sistema: mostra as bandeiras, com "No Brasil" e "Peça
este aqui"; o sistema só aparece no cabeçalho da tabela completa.*

**8.19 — Identificador de SVG repetido.** (aberto) O `clipPath` do módulo de Café usa o
id fixo
`vesselClip`. Só há um copo na tela hoje, então funciona; dois na mesma página passam a
recortar pelo mesmo desenho.

**8.20 — RESOLVIDO. Comentário desatualizado.** [modules/body/data/bodyData.ts:3](modules/body/data/bodyData.ts#L3)
diz "6 durações". São 5.

*Hoje o cabeçalho diz "14 partes (12 com marcador no boneco) × 4 sintomas localizados
× 5 durações".*

**8.21 — A divisão em pedaços já está furada.** `sizesData.ts` importa `numberToWords`
de `numbersData.ts`, então abrir Medidas puxa junto todo o soletrador de números.
*Continua em 24/09 (o módulo hoje se chama Roupa e sapato).*

**8.22 — Dependências declaradas e nunca importadas:** `canvas-confetti`,
`flag-icons` e `@capacitor/core`. Nenhuma aparece em nenhum `import` do projeto.
*Continua em 24/09.*

**8.23 — Código morto:** `AVAILABLE_MODULES` e `CATEGORIES` em `constants.ts`, e doze
ícones em `Icons.tsx` (`WifiOffIcon`, `MenuIcon`, `RocketIcon`, `LockClosedIcon`,
`LockOpenIcon`, `CrownIcon`, `CreditCardIcon`, `QrCodeIcon`, `PixIcon`,
`BarcodeIcon`, `ShareIcon`, `PlusSquareIcon`).

*Em 24/09: `RocketIcon` (folha de atualização) e `ShareIcon` (compartilhar) passaram a
ser usados; os outros dez continuam mortos, e `AVAILABLE_MODULES`/`CATEGORIES` também.
A auditoria de usabilidade apagou do hub as treze telhas "em breve" e deixou sem uso
mais doze ícones (`TruckIcon`, `UtensilsIcon`, `BankIcon`, `DumbbellIcon`,
`HospitalIcon`, `BedIcon`, `FuelIcon`, `SchoolIcon`, `WrenchIcon`, `PawIcon`,
`ShieldCheckIcon`, `EnvelopeIcon`) e as treze chaves `module…` correspondentes. Foram
**mantidos de propósito**: são nome e desenho de módulos futuros, não foram
substituídos, e `tests/moldura.test.tsx` usa quatro dessas chaves para provar que elas
não aparecem. Apagar ou não fica com o dono. `MapPinIcon`, `NumbersIcon` e
`SizesIcon`, que o hub trocou por chave, relógio e camiseta, foram apagados.*

**8.24 — Comentários `eslint-disable` sem ESLint.** Não existe configuração de lint no
repositório. As diretivas não desligam nada. *Continuam quatro em 24/09.*

**8.25 — A ordem da grade da Farmácia contradiz a categoria de estreia.** O módulo
abre em "Dor e Febre" via `defaultCategoryName`, mas `PHARMACY_CATEGORIES` ainda
começa em "Uso Contínuo", então a primeira telha do painel é a de remédio de pressão e
diabetes. Reordenar o array alinha as duas coisas. *Continua em 24/09; a Farmácia está
fechada no recorte.*

**8.26 — RESOLVIDO. A busca ignora acento.** Procurar "acucar" não acha "Açúcar". Para
um público
que digita em teclado de celular estrangeiro, normalizar com
`String.prototype.normalize('NFD')` vale muito.

*Hoje: [utils/searchText.ts](utils/searchText.ts) normaliza (`tests/search.test.tsx`).*

**8.27 — RESOLVIDO. Resultados de busca sem contexto.** Os dois "Soro Fisiológico"
aparecem idênticos, sem mostrar de qual subcategoria vieram.

*Hoje: nos resultados de busca o card mostra de onde o item vem, para separar
homônimos.*

### Abertos, achados na auditoria de usabilidade (23/09/2026)

**8.28 — O manifesto do PWA ainda promete o que está fechado.**
[vite.config.ts:60](vite.config.ts#L60) diz "Guia de sobrevivência para imigrantes:
supermercado, farmácia, direções e mais." O texto de compartilhar e a prévia do link
já foram trocados; o manifesto ficou de fora porque o arquivo não estava no escopo da
etapa. É o texto que o Android mostra ao instalar.

**8.29 — O inglês da Maquiagem é britânico, e os EUA estão abertos.** `LangCode` tem um
`en` só, e o módulo diz *colour* e *cotton buds*; no balcão americano seria *color* e
*cotton swabs*. O Cuidar de idosos já trocou *walking frame*/*walking stick* por
*walker*/*cane*, que o Reino Unido também entende. Falta a mesma passada aqui.

**8.30 — Moeda errada nos destinos fechados.** `currencyForCountry` só conhece dólar e
euro: Chile, Argentina e Reino Unido cairiam no euro. Inofensivo enquanto o recorte os
mantiver fechados; precisa ser resolvido **antes** de abrir qualquer um deles. Também
não há separador de milhar (`1250,00 €`, `$1250.00`).

**8.31 — As fichas das Direções não têm o botão Mostrar.** Direções não usa o
`PhraseCard`, e "¿Cómo llego a la farmacia?" é justamente a frase que ela mostraria na
rua. Quando o som falha, a folha "Sem som agora" já mostra a frase com a glosa (a glosa
é anotada antes de cada som); falta o botão direto.

**8.32 — O árabe de `tener` na negação é agramatical nos Pronomes.** `هو لا لديه` /
`هو لن لديه` deveriam ser `ليس لديه` / `لن يكون لديه`, e a forma feminina nova repete o
padrão. Erro anterior a esta implementação; o árabe só aparece na linha de apoio.

**8.33 — A faixa de urgência do Onde dói não tem número nem botão de ligar.** Ela copia
o desenho da Emergência do Cuidar de idosos, mas abre só as três frases. Acrescentar
exige o número por país, que hoje mora em `elderCareData.ts`
(`emergencyNumberFor`); os dois módulos estavam sendo mexidos ao mesmo tempo e não foram
ligados. Se entrar, que seja lendo a mesma função, e não uma segunda tabela.

**8.34 — Textos do bloco `ptBR` dizem "no Brasil", e o bloco serve também `pt-PT`.**
`szFrom`, `szAskShoe`, `szAskClothes`, `szAskKids` e `hintSizes`. Hoje não aparece,
porque "Eu falo" só aceita o Brasil. Se Portugal virar origem, precisam de variante —
e Portugal usa a numeração europeia, então a tabela também muda de sentido.

**8.35 — A barra de baixo do catálogo não foi conferida na tela.** Com o piso de 14px,
"Lista de Compras" pode quebrar em duas linhas a 375px; os rótulos ganharam
`leading-none` e as abas trocaram `pb-6` por `pb-5`, pela conta (28 + 4 + 28 = 60px)
que está num comentário em `ModuleLayout.tsx`. O catálogo está fechado no recorte, e
nenhuma etapa pôde abrir navegador. Conferir antes de reabrir.

**8.36 — Armadilha para teste futuro no Onde está.** O módulo abre com a pergunta
"Onde está a chave?" na glosa em português, que é o mesmo texto do nome do módulo no
hub (`moduleLocation`). Nenhum teste quebra hoje, mas um `findByText(t('moduleLocation'))`
feito com o módulo aberto acha a pergunta da tela, e não o ladrilho do hub — e, conforme
o par de idiomas, mais de um elemento.

## 9. O que está saudável

Vale registrar, porque foi conquistado e é fácil quebrar sem perceber.

| Verificação | Resultado |
|---|---|
| Contraste de texto, em 6 telas | **zero falhas** |
| Paridade das traduções | 387 chaves × 8 blocos, exatas (24/09) |
| Chaves usadas no código sem definição | zero |
| `tsc --noEmit` | limpo (24/09) |
| Suíte de testes | 735 verdes em 30 arquivos (24/09) |
| Texto abaixo de 14px | zero `text-[9–13px]`; um só `text-xs`, o selo FORMAL dos Pronomes (24/09) |
| Alvos de toque nas telas de catálogo | zero abaixo de 44px |
| Caminho ucraniano ponta a ponta | funciona, com bloqueio correto |
| Movimento reduzido | tratado, mantendo opacidade |
| Foco visível | anel branco com halo, só em `:focus-visible` |

**Divisão do pacote.** O pedaço inicial é de 282 KB e o catálogo, de 463 KB, só baixa
ao abrir Supermercado ou Farmácia. O service worker pré-carrega 51 arquivos, 1,1 MB no
total, e é isso que faz o app funcionar offline de verdade.

Uma nota sobre a medição de contraste: o medidor precisa entender gradiente. Os
cabeçalhos usam `background-image`, não `background-color`; um script que só olha
`backgroundColor` cai no branco do body e acusa falha onde não existe.

## 10. Conteúdo: o risco que não é técnico

A base da farmácia tem **582 itens** e foi escrita por IA. **Nenhum farmacêutico
revisou.** Não é um detalhe de qualidade, é o maior risco do produto.

### O que o módulo se propõe a fazer

**Dar o nome, não autorizar a compra.** Quem chega numa farmácia estrangeira não sabe
como se chama ali o remédio que toma a vida inteira. Saber que a dipirona é metamizol,
e que na Espanha o metamizol é o Nolotil, é o serviço. Vale mesmo quando a pessoa não
pode simplesmente pegar na prateleira: com o nome certo ela fala com o médico, entende
a caixa, e pergunta a coisa certa ao farmacêutico. Sem o nome, ela não tem nem por onde
começar.

Isso precisa ficar claro para quem for mexer aqui, porque a leitura oposta leva a
mutilar o catálogo: **remédio de receita não deve ser removido**. O nome é a
informação.

### O que falta, e é do mesmo tipo

O que o app não diz é **em que condição** cada item é vendido. Isso não é uma trava, é
mais uma informação do mesmo naipe do nome: a pessoa quer saber se entra e compra, se
precisa passar no médico antes, ou se aquilo não existe naquele país.

Hoje o app tem só dois estados, e eles vivem **dentro do texto traduzido**: 13 itens
carregam as palavras `PROIBIDO` e `NOT SOLD` no meio da tradução, lidas por
`parsePharmacyData` em [components/TranslationItem.tsx](components/TranslationItem.tsx).
Conteúdo servindo de código, e só em português e inglês. O resto dos 582 itens não diz
nada.

O caminho é trocar isso por um campo próprio no dado, por país:

```ts
availability?: Record<string, 'livre' | 'receita' | 'nao-existe'>
```

Um selo discreto no card resolve as duas coisas de uma vez: tira a palavra-marcador de
dentro da tradução, e dá à pessoa a informação que ela precisa para não fazer a viagem
à toa. A dipirona, por exemplo, mostraria "receita" na Espanha e "não existe" no Reino
Unido, com o nome do remédio bem visível nos dois casos.

*Estado em 24/09/2026: feito numa fase anterior. `TranslationItem.availability` existe
no tipo, o selo aparece no card (`tests/pharmacyAvailability.test.tsx`), e as palavras
`PROIBIDO`/`NOT SOLD` saíram do texto dos dados. A revisão por farmacêutico, abaixo,
continua pendente.*

### O risco que continua

Nada disso substitui revisão humana. As equivalências foram escritas por IA e podem
estar simplesmente erradas: nome trocado, princípio ativo diferente, marca que não
existe mais. Um farmacêutico passando os olhos nos 582 itens é o item de maior retorno
do projeto inteiro, e não é trabalho de programação.

## 11. Ordem sugerida de trabalho

1. Favoritos apagados (8.1) e chave duplicada (8.2). São perda de dados do usuário.
2. Barreira de erro (8.12). É o que separa um bug de uma tela branca.
3. Zoom liberado (8.4) e cards no teclado (8.3).
4. Campo de disponibilidade na farmácia (seção 10). É informação a mais no card, nunca
   motivo para tirar item do catálogo.
5. Salvar o idioma escolhido, que hoje volta para Brasil → Espanha a cada abertura.
6. Nomes acessíveis e Esc no painel de idiomas (8.8 e 8.10), copiando o padrão que já
   existe em `CategorySheet`.
7. O resto da seção 8, que é acabamento.

> **Esta seção 11 é registro histórico.** Era a ordem de trabalho da auditoria de
> 9/9/2026 e descreve o estado de antes das fases 1 a 7, que já resolveram a maior
> parte dela. A suíte de testes que este parágrafo pedia existe hoje, com 735 testes
> (eram 243 na fase 7). Confira no código antes de tratar qualquer item acima como
> pendência; a seção 8 diz, item por item, o que já foi resolvido.

## 12. Mapa de arquivos

| Arquivo | Papel |
|---|---|
| [App.tsx](App.tsx) | hub, temas, áudio, estado compartilhado, `switch` de módulo; desvio da Farmácia fechada para o Onde dói |
| [lancamento.ts](lancamento.ts) | o recorte do lançamento, em três funções; é do dono |
| [constants.ts](constants.ts) | países e categorias |
| [types.ts](types.ts) | os três tipos do domínio |
| [translations.ts](translations.ts) | 387 chaves × 8 idiomas, paridade exata |
| [data/catalog.ts](data/catalog.ts) | junta os 12 arquivos de dados do catálogo |
| [modules/CatalogModule.tsx](modules/CatalogModule.tsx) | Supermercado e Farmácia |
| [modules/makeup/data/makeupData.ts](modules/makeup/data/makeupData.ts) | Maquiagem: produtos, dimensões, 21 acessórios, os dois builders |
| [modules/makeup/MakeupGlyphs.tsx](modules/makeup/MakeupGlyphs.tsx) | os 21 glifos de acessório, no pedaço adiado do módulo |
| [modules/eldercare/data/elderCareData.ts](modules/eldercare/data/elderCareData.ts) | Cuidar de idosos: os dois eixos, as cinco tabelas, a regra de segurança |
| [modules/eldercare/ElderCareGlyphs.tsx](modules/eldercare/ElderCareGlyphs.tsx) | os 14 glifos de objeto de cuidado, no pedaço adiado do módulo |
| [modules/housecleaning/data/houseCleaningData.ts](modules/housecleaning/data/houseCleaningData.ts) | Limpeza da casa: tarefas, cômodos, o que se ouve e o que se diz |
| [components/ModuleLayout.tsx](components/ModuleLayout.tsx) | moldura do catálogo: cabeçalho, busca, painéis, barra de baixo |
| [components/ModuleShell.tsx](components/ModuleShell.tsx) | moldura dos dez generativos: cabeçalho, banda fixa da frase, `dica` e linha de gesto |
| [components/PhraseCard.tsx](components/PhraseCard.tsx) | o cartão da frase dos nove: tamanho pelo comprimento, pulso do som, botão Mostrar |
| [components/ShowPhraseScreen.tsx](components/ShowPhraseScreen.tsx) | **novo** — a tela Mostrar: a frase em tela cheia para virar para o balcão |
| [components/CountrySheet.tsx](components/CountrySheet.tsx) | **novo** — a pergunta "Em que país você está agora?" da primeira abertura |
| [components/TranslationItem.tsx](components/TranslationItem.tsx) | o card de item |
| [components/CategorySheet.tsx](components/CategorySheet.tsx) | painel de categorias |
| [hooks/useDialog.ts](hooks/useDialog.ts) | o padrão de diálogo do projeto: foco preso, Esc, pilha de camadas |
| [hooks/useT.ts](hooks/useT.ts) | **novo** — a função de tradução por contexto, para o `PhraseCard` não precisar de prop |
| [components/categoryMeta.ts](components/categoryMeta.ts) | ícone e tom por categoria |
| [components/LanguagePanel.tsx](components/LanguagePanel.tsx) | escolha de "eu falo" e "estou em" |
| [hooks/useListManager.ts](hooks/useListManager.ts) | lista e itens marcados de um módulo de catálogo |
| [hooks/useFavorites.ts](hooks/useFavorites.ts) | favoritos, uma lista só para o app |
| [hooks/useCountryPair.ts](hooks/useCountryPair.ts) | o par "Eu falo" / "Estou em", salvo por código de país |
| [utils/itemHelpers.ts](utils/itemHelpers.ts) | resolve o item para o par de idiomas |
| [utils/soundUtils.ts](utils/soundUtils.ts) | sons sintetizados em WebAudio |
| [utils/speech.ts](utils/speech.ts) | escolhe a voz do TTS; nunca devolve outro idioma; `partirParaTts` corta frase longa |
| [utils/tocador.ts](utils/tocador.ts) | **novo** — quem toca o som: um de cada vez, repetir mais devagar, pedaços |
| [utils/audioState.ts](utils/audioState.ts) | **novo** — o estado do som, a glosa da última frase e a marca "já tocou" |
| [utils/primeiraAbertura.ts](utils/primeiraAbertura.ts) | **novo** — quando perguntar o país e quando convidar a instalar |
| [utils/rotas.ts](utils/rotas.ts) | um endereço por módulo, com nome em espanhol |
| [components/VoiceMissingSheet.tsx](components/VoiceMissingSheet.tsx) | a folha "Sem som agora": mostre a frase, o motivo, e a voz recolhida |
| [tests/moldura.test.tsx](tests/moldura.test.tsx) | **novo** — hub, pergunta de país, convite de instalar, tocador, tela Mostrar, dica |
| [index.css](index.css) | tokens, foco, `.hit`, `.tap`, movimento reduzido |
