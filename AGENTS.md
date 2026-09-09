# Translator Hub — entrega técnica

Documento de transferência. Foi escrito para que outra IA, ou outra pessoa, consiga
trabalhar neste repositório sem ter acompanhado nada do que veio antes.

Companheiro deste arquivo: [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md), que é o registro
de **decisões** e explica por que cada coisa é como é. Este aqui descreve **o que
existe** e **o que está quebrado**. Quando os dois divergirem, o código manda.

Auditado em 9 de setembro de 2026, no commit `9e47b15`, com o app rodando.
Toda medição citada aqui foi feita, não estimada.

Atualizado em 9 de setembro de 2026, no commit `05d4b91`, depois da fase 7 (voz do
TTS). As seções 1, 2 e 12 foram corrigidas; a seção 11 virou registro histórico.

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

A suíte de testes existe: **243 testes em 12 arquivos** (`npm test`), cobrindo i18n,
gramática gerada, seleção de voz do TTS, disponibilidade na farmácia, busca,
acessibilidade, persistência e recuperação de chunk.

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
3. **senão** → cala e explica qual voz falta.

Nenhum caminho fala com região errada.

O endpoint é **não oficial** e pode morrer sem aviso; o nível 3 é a degradação. Ele
também recusa requisição de navegador que mande `Referer` — devolve HTML no lugar do
MP3 —, e é por isso que `index.html` traz `<meta name="referrer" content="no-referrer">`.
Sem essa linha o áudio online não toca. Medido nos dois sentidos.

O painel de idiomas tem um diagnóstico que usa a mesma `pickVoice` e distingue voz
local (✅) de áudio pela rede (🌐).

Verificação de tipos: `npx tsc --noEmit`. Estava limpo na auditoria.

## 3. Pilha e arquitetura

React 19, Vite 6, TypeScript 5.8, Tailwind 3.4, `vite-plugin-pwa` com Workbox.
Capacitor 5 está declarado mas **as pastas `android/` e `ios/` nunca foram geradas**,
então o app nativo é intenção, não realidade.

Não existe roteador. Não existe gerenciador de estado. `App.tsx` guarda tudo em
`useState` e escolhe o módulo com um `switch`:

```
index.tsx  →  App.tsx  →  switch (currentModule)  →  um dos nove módulos
```

`currentModule === null` desenha o hub, que é a grade de módulos. Cada módulo é
carregado com `React.lazy`, então abrir o hub não baixa o catálogo.

Estado que vive em `App.tsx` e desce por props:

| Estado | O que guarda | Persiste? |
|---|---|---|
| `currentModule` | qual módulo está aberto | não |
| `nativeCountry` | "Eu falo" | **não** |
| `targetCountry` | "Estou em" | **não** |
| `activeTab` | home, busca, favoritos, lista | não |
| `expandedItemKey` | qual card está aberto | não |
| listas e favoritos | via `useListManager` | sim, `localStorage` |

O idioma escolhido **não é salvo**. Fechar o app volta tudo para Brasil → Espanha.
Para quem usa o app todo dia isso é um atrito real e é uma das correções mais baratas
que existem aqui.

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

**Generativo** (os outros sete). Não guardam frases prontas. Guardam tabelas pequenas
e **regras de gramática por idioma**, e montam a frase na hora. É o que permite oito
idiomas sem oito listas de frases.

### Como um módulo generativo é montado

Os sete recebem exatamente os mesmos sete campos de `commonProps` e nada mais: os dois
países, `t`, o tema, `onGoHome`, `onOpenLanguageModal` e `handlePlayAudio`. Nenhum
deles conhece favoritos, lista ou busca.

O núcleo de idiomas mora em
[modules/location/data/locationData.ts](modules/location/data/locationData.ts), que
exporta `LangCode`, `SUPPORTED_LANGS` e `toLangCode`. **Os sete componentes e os seis
outros arquivos de dados importam de lá.** Location é, na prática, o módulo base.

```ts
type LangCode = 'pt' | 'es' | 'en' | 'fr' | 'it' | 'uk' | 'ar' | 'lt';
type Text = Record<LangCode, string>;   // completo, o TypeScript exige os 8
```

Esse `Record` completo é a defesa central do projeto: esquecer um idioma numa tabela
nova não compila. As duas únicas exceções são `Pronoun.altPerson` e `Pronoun.dative`,
que são `Partial` de propósito.

Todo módulo calcula o mesmo trio e mostra a língua de destino em destaque e a nativa
como linha de apoio:

```ts
const target = toLangCode(targetCountry.lang);
const native = toLangCode(nativeCountry.lang);
const showNative = native !== target;
```

### Os sete

| Módulo | Dados | Função que monta a frase |
|---|---|---|
| **Onde está?** | 14 objetos, 12 relações | `buildSentence`, `buildQuestion` |
| **Direções** | 8 passos, 4 pontos cardeais, 13 lugares, 8 distâncias | `headingSentence`, e `applyStep` para a geometria |
| **Números** | 20 listas de palavras, 96 nomes de mês, 4 períodos do dia | 8 funções: `numberToWords`, `buildTime`, `buildPrice`, `buildDate`… |
| **Onde dói** | 14 partes do corpo (13 no desenho), 12 sintomas, 5 durações | `buildComplaint` |
| **Café e tapas** | 9 bebidas, 7 modificadores, 10 termos de porção | `buildOrder` |
| **Eu, você, ele** | 8 pronomes, 7 verbos, **1.008 formas verbais** | `buildPhrase` |
| **Medidas** | 6 tabelas, 47 linhas | `buildSizeQuestion` |

**Onde está?** Uma cena com dois emoji: um objeto de referência grande e um menor que
se move para a posição escolhida. Implementa contração românica (`de o → do`,
`di la → della`, `de le → du`), o artigo definido árabe colado sem espaço (`الكرة`),
e **declinação de caso** em ucraniano e lituano: a frase da relação traz um marcador
`{gen}`, `{instr}`, `{loc}` ou `{acc}` que é preenchido pela forma declinada do
substantivo. Ucraniano e árabe não têm cópula, e o verbo simplesmente sai da frase.

**Direções.** Uma grade de cinco por cinco em SVG onde o boneco anda. É o módulo menos
generativo: as frases dos passos estão guardadas inteiras por idioma. O registro do
espanhol é peninsular de propósito, com `manzana` para quarteirão. A única regra viva é
`headingSentence`, e o lituano lá escapa de propósito do acusativo que `į` exigiria,
usando o neutro `Kryptis:`.

**Números.** O mais denso. Hora, preço, data e número solto. Implementa o `y` do
espanhol acima de trinta e a apócope `cien`/`ciento`; a regra do `e` em português
depois de mil; o sistema vigesimal francês inteiro (`quatre-vingt-dix`); a elisão
italiana em `ventuno` e `ventotto`; o plural ucraniano governado por numeral (um, dois
a quatro, cinco ou mais); a regra lituana de `ltPlural`; e, em árabe, a ordem
unidade-antes-de-dezena com `و` mais o plural quebrado das minutos.

Aqui mora a decisão de cultura mais importante do app: na Espanha se **escreve** 24h e
se **fala** 12h com o período do dia. Por isso a hora é escolhida de 00 a 23 e o
período é **deduzido** por `periodFromHour24`. Assim "las diez de la madrugada", que
não existe, fica impossível de montar.

**Onde dói.** Uma figura esquemática em SVG com 13 pontos tocáveis. A gramática está
num par de formas por parte do corpo, `[artigo, locativo]`, e cada idioma usa o par de
um jeito: o inglês guarda **possessivo** (`my head`) porque diz *my head hurts*,
enquanto o espanhol usa dativo (`Me duele la cabeza`); o lituano guarda **acusativo**
(`galvą`, para `Man skauda galvą`); o ucraniano guarda nominativo e locativo.

**Café e tapas.** Desenha a bebida em camadas proporcionais dentro de uma xícara ou
copo. Existe porque `café com leite` não é `café con leche`. O artigo indefinido com
gênero já vem pronto no dado (`un cortado`, `una leche manchada`), então não há lógica
de artigo. Ucraniano e lituano guardam a bebida no **acusativo**, por ser objeto de um
"eu queria" implícito.

**Eu, você, ele.** O maior risco de correção do projeto: 1.008 formas verbais escritas
à mão, sem um teste. Implementa o **do-support** do inglês completo, o `ne … pas`
francês abraçando só o auxiliar (`Je n'ai pas voulu`), a negação colada do lituano
(`nėra`), as três partículas de negação do árabe por tempo (`لا`, `ما`, `لن`), e o
**sujeito no dativo** em lituano, onde `reikia` não conjuga e quem declina é o pronome
(`Man reikia`).

A armadilha que motivou o módulo: o pronome `tu` tem `words.pt = 'você'` mas
`person = 1`, para a linha portuguesa sair natural enquanto a espanhola mostra
`tú quieres`. E `altPerson` corrige o tratamento formal, porque espanhol e italiano
conjugam `usted` na terceira pessoa e inglês, francês, ucraniano, árabe e lituano não.

**Medidas.** Seis tabelas de conversão entre Brasil, Europa, Reino Unido e Estados
Unidos. `systemForCountry` manda tudo que não é `br`, `cl`, `ar`, `gb` ou `us` para o
sistema europeu, o que cobre Ucrânia, Marrocos e Lituânia. Este arquivo importa
`numberToWords` de Números para soletrar o tamanho.

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

Os oito blocos têm **239 chaves cada, sem uma diferença**. Verificado por script:
nenhuma chave duplicada, nenhuma chave usada no código que não exista. Essa parte
está sólida.

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
4. **`.tap`** é a transição padrão de toque, com propriedades explícitas.
5. **`dir="auto"`** em todo texto que venha de tradução, para o árabe virar sozinho.
6. **Movimento reduzido** já está tratado em [index.css](index.css): as animações
   viram opacidade pura em vez de sumirem.
7. Cor de tema vem de `THEMES` em [App.tsx](App.tsx), que tem as quatro formas da cor
   (`color`, `textColor`, `hex`, `borderColor`) justamente para nunca precisar montar
   classe.

## 8. Auditoria: o que está quebrado

Os quatro primeiros e os de acessibilidade foram **reproduzidos no navegador**, com o
app rodando. Os demais foram achados lendo o código e conferidos contra o arquivo, mas
não encenados: onde o defeito ainda não tem como aparecer, o texto diz por quê.

### Graves

**8.1 — Favoritar no Supermercado e mexer na Farmácia apaga o favorito.**
[hooks/useListManager.ts:11](hooks/useListManager.ts#L11)

`favoritesKey` é a string fixa `'favorites'`, sem prefixo, enquanto lista e itens
marcados são prefixados. `App.tsx` instancia o hook **duas vezes**, uma para
supermercado e outra para farmácia. Cada instância tem seu próprio estado de
favoritos em memória, mas as duas escrevem na mesma chave do `localStorage`. Quando
qualquer coisa muda na farmácia, o efeito de salvar dela grava a cópia velha por cima.

Reproduzido: favoritei "Abacate" no Supermercado, `favorites` ficou `["Abacate"]`;
adicionei um item à lista da Farmácia, `favorites` ficou `[]`.

Correção: prefixar a chave, ou tirar favoritos do hook e subir para um estado único
em `App.tsx`. A segunda é melhor, porque favoritos são apresentados como uma lista só.

**8.2 — Itens diferentes compartilham a mesma identidade.**
[utils/itemHelpers.ts:65](utils/itemHelpers.ts#L65)

`key: baseKey`, e `baseKey` é o `source_term`. Existem **139 termos repetidos** no
catálogo, alguns em três subcategorias diferentes ("Soro Fisiológico", "Nebacetin",
"Preservativo"). Dois itens distintos ficam com a mesma chave.

Reproduzido: buscando "Soro Fisiológico" aparecem dois cards; cliquei na estrela de
um e **os dois ficaram marcados**. A lista de compras também não consegue guardar os
dois, e o `key` do React colide.

Correção: `key: ${category}/${subCategory}/${source_term}`. Isso invalida os favoritos
já salvos de quem tiver o app, então precisa de uma migração ou de um descarte
consciente.

**8.3 — Os cards não existem para o teclado.**
[components/TranslationItem.tsx](components/TranslationItem.tsx)

O card inteiro é uma `div` com `onClick`. Medido: **0 de 25 cards** são alcançáveis
por teclado. Dentro da parte que só abre no clique estão a pronúncia e o botão de
adicionar à lista, então quem navega por teclado ou leitor de tela não chega a eles.

Correção: trocar a `div` por `button`, ou dar `role="button"`, `tabIndex={0}` e
tratamento de Enter e Espaço.

**8.4 — O app proíbe aumentar o zoom.**
[index.html:5](index.html#L5)

`user-scalable=no, maximum-scale=1.0`. Falha o critério 1.4.4 da WCAG. Para um app
cujo público inclui gente mais velha lendo bula de remédio numa farmácia estrangeira,
é a barreira errada. Tirar os dois atributos resolve; o `viewport-fit=cover` fica.

### Médias

**8.5 — O preço curto em lituano sai em árabe.**
[modules/numbers/data/numbersData.ts](modules/numbers/data/numbersData.ts)

`buildPriceShort` tem `case` para es, pt, en, fr, it e uk, e um `default:` que devolve
a forma árabe com a conjunção `و`. **Não existe `case 'lt'`**, então o lituano cai no
árabe. Está inofensivo hoje só porque a função é chamada apenas para o idioma de
destino, e a Lituânia nunca é destino. No dia em que for, dispara.

Vale a regra geral: o `default:` dessas funções não é consistente no projeto. Em
`buildQuestion` e `headingSentence` ele é **inglês**; em `buildTime`, `buildPrice`,
`buildDate` e `buildSizeQuestion` ele é **árabe**. Quem lê precisa conferir função por
função.

**8.6 — O passado ucraniano está sempre no masculino.**
[modules/pronouns/data/pronounsData.ts](modules/pronouns/data/pronounsData.ts)

`pastForms.uk` guarda `['хотів', 'хотів', 'хотів', 'хотіли', …]`. O ucraniano marca
gênero no passado singular, então uma mulher dizendo "eu queria" recebe `хотів` em vez
de `хотіла`. Vale para os sete verbos. Não há seletor de gênero em lugar nenhum do app.

**8.7 — A cor de hover dos botões dos cards nunca funcionou.**
[components/TranslationItem.tsx:66](components/TranslationItem.tsx#L66)

```
hover:${theme.textColor}
```

É exatamente a armadilha que o próprio projeto documenta. Confirmei no CSS gerado:
`hover:text-red-600`, `hover:text-emerald-700`, `hover:text-blue-600` e
`hover:text-rose-600` aparecem **zero vezes**. Os botões de ouvir, perguntar,
carrinho e estrela nunca mudaram de cor ao passar o mouse.

**8.8 — Botões sem nome acessível.** Três, todos X de fechar:
o de fechar o painel de favoritos e lista em
[components/ModuleLayout.tsx:195](components/ModuleLayout.tsx#L195), e o do painel de
idiomas em [components/LanguagePanel.tsx:77](components/LanguagePanel.tsx#L77). Um
leitor de tela anuncia "botão" e nada mais.

**8.9 — Alvos de toque abaixo de 44px**, todos sem `.hit`:

| Onde | Tamanho |
|---|---|
| Bandeiras do idioma, no hub | 56×40 |
| X de fechar os painéis deslizantes | 36×36 |
| X do painel de idiomas | 22×22 |
| Botão OK do painel de idiomas | 232×40 |

**8.10 — O painel de idiomas não fecha com Esc, não prende o foco e não é um diálogo.**
Testado: a tecla Esc não faz nada nele. Ele não tem `role="dialog"` nem `aria-modal`.
O padrão certo já existe no projeto, em
[components/CategorySheet.tsx](components/CategorySheet.tsx), escrito do zero na
última mudança. É copiar de lá.

**8.11 — A alça de arrastar do painel é uma `div` com `onClick`.**
[components/ModuleLayout.tsx:183](components/ModuleLayout.tsx#L183). Fecha o painel,
mas não tem papel, nem nome, nem foco. E não arrasta: só clica.

**8.12 — Não existe barreira de erro.** Nenhum `componentDidCatch` no projeto. Com
`React.lazy` e um service worker em `autoUpdate`, uma referência a pedaço velho depois
de um deploy derruba a tela inteira para branco, sem recuperação. Este app **já sofreu
tela branca em produção** antes. Uma `ErrorBoundary` em volta do `Suspense` em
[App.tsx:338](App.tsx#L338) é barata e ataca exatamente esse risco.

**8.13 — Não dá para desligar o som.** São 76 chamadas de `playSound`, uma em quase
todo toque, e nenhuma configuração para silenciar. Numa farmácia ou num caixa de
supermercado isso é constrangedor.

### Pequenas

**8.14 — Áreas de toque sobrepostas na barra de busca.** Os botões de limpar e de voz
têm centros a 41px um do outro, mas cada área `.hit` tem 44px: elas se cruzam em 3px.
Um toque na faixa do meio vai para o botão errado.

**8.15 — Número mágico desalinhado.** O painel deslizante é fixado em `top: '9rem'`
(144px) em [components/ModuleLayout.tsx:172](components/ModuleLayout.tsx#L172), mas
com o painel aberto o cabeçalho mede **158px**. O painel come 14px do cabeçalho. Foi
o novo gatilho de categoria, de 56px, que mudou a conta. Deve ser medido, não fixado.

**8.16 — O painel de categorias entra deslizando e sai seco.** Ele desmonta na hora,
sem transição de saída.

**8.17 — O cabeçalho existe em sete cópias.** Nenhum dos sete módulos generativos usa
[components/ModuleLayout.tsx](components/ModuleLayout.tsx): cada um redesenha à mão o
mesmo cabeçalho com gradiente, botão de início, título e o par de bandeiras. Mexer no
cabeçalho significa mexer em sete arquivos, e é assim que eles saem de sincronia.
Cada um também redeclara a mesma interface de props com outro nome, e cinco redefinem
a própria função `cap()`.

**8.18 — Rótulo de sistema de medidas fixo em português.**
`SYSTEM_LABEL` em [modules/sizes/data/sizesData.ts:13](modules/sizes/data/sizesData.ts#L13)
é `{ BR: 'Brasil', EU: 'Europa', UK: 'Reino Unido', US: 'EUA' }`, sem tradução, e vai
direto para a tela ao lado de rótulos traduzidos. Um ucraniano lê "Reino Unido".

**8.19 — Identificador de SVG repetido.** O `clipPath` do módulo de Café usa o id fixo
`vesselClip`. Só há um copo na tela hoje, então funciona; dois na mesma página passam a
recortar pelo mesmo desenho.

**8.20 — Comentário desatualizado.** [modules/body/data/bodyData.ts:3](modules/body/data/bodyData.ts#L3)
diz "6 durações". São 5.

**8.21 — A divisão em pedaços já está furada.** `sizesData.ts` importa `numberToWords`
de `numbersData.ts`, então abrir Medidas puxa junto todo o soletrador de números.

**8.22 — Dependências declaradas e nunca importadas:** `canvas-confetti`,
`flag-icons` e `@capacitor/core`. Nenhuma aparece em nenhum `import` do projeto.

**8.23 — Código morto:** `AVAILABLE_MODULES` e `CATEGORIES` em `constants.ts`, e doze
ícones em `Icons.tsx` (`WifiOffIcon`, `MenuIcon`, `RocketIcon`, `LockClosedIcon`,
`LockOpenIcon`, `CrownIcon`, `CreditCardIcon`, `QrCodeIcon`, `PixIcon`,
`BarcodeIcon`, `ShareIcon`, `PlusSquareIcon`).

**8.24 — Comentários `eslint-disable` sem ESLint.** Não existe configuração de lint no
repositório. As diretivas não desligam nada.

**8.25 — A ordem da grade da Farmácia contradiz a categoria de estreia.** O módulo
abre em "Dor e Febre" via `defaultCategoryName`, mas `PHARMACY_CATEGORIES` ainda
começa em "Uso Contínuo", então a primeira telha do painel é a de remédio de pressão e
diabetes. Reordenar o array alinha as duas coisas.

**8.26 — A busca ignora acento.** Procurar "acucar" não acha "Açúcar". Para um público
que digita em teclado de celular estrangeiro, normalizar com
`String.prototype.normalize('NFD')` vale muito.

**8.27 — Resultados de busca sem contexto.** Os dois "Soro Fisiológico" aparecem
idênticos, sem mostrar de qual subcategoria vieram.

## 9. O que está saudável

Vale registrar, porque foi conquistado e é fácil quebrar sem perceber.

| Verificação | Resultado |
|---|---|
| Contraste de texto, em 6 telas | **zero falhas** |
| Paridade das traduções | 239 chaves × 8 blocos, exatas |
| Chaves usadas no código sem definição | zero |
| `tsc --noEmit` | limpo |
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
> parte dela. A suíte de testes que este parágrafo pedia existe hoje, com 243 testes.
> Confira no código antes de tratar qualquer item acima como pendência.

## 12. Mapa de arquivos

| Arquivo | Papel |
|---|---|
| [App.tsx](App.tsx) | hub, temas, áudio, estado compartilhado, `switch` de módulo |
| [constants.ts](constants.ts) | países e categorias |
| [types.ts](types.ts) | os três tipos do domínio |
| [translations.ts](translations.ts) | 267 chaves × 8 idiomas, paridade exata |
| [data/catalog.ts](data/catalog.ts) | junta os 12 arquivos de dados do catálogo |
| [modules/CatalogModule.tsx](modules/CatalogModule.tsx) | Supermercado e Farmácia |
| [components/ModuleLayout.tsx](components/ModuleLayout.tsx) | moldura: cabeçalho, painel, barra de baixo |
| [components/TranslationItem.tsx](components/TranslationItem.tsx) | o card de item |
| [components/CategorySheet.tsx](components/CategorySheet.tsx) | painel de categorias, e o padrão de diálogo do projeto |
| [components/categoryMeta.ts](components/categoryMeta.ts) | ícone e tom por categoria |
| [components/LanguagePanel.tsx](components/LanguagePanel.tsx) | escolha de "eu falo" e "estou em" |
| [hooks/useListManager.ts](hooks/useListManager.ts) | favoritos, lista, itens marcados |
| [utils/itemHelpers.ts](utils/itemHelpers.ts) | resolve o item para o par de idiomas |
| [utils/soundUtils.ts](utils/soundUtils.ts) | sons sintetizados em WebAudio |
| [utils/speech.ts](utils/speech.ts) | escolhe a voz do TTS; nunca devolve outro idioma |
| [components/VoiceMissingSheet.tsx](components/VoiceMissingSheet.tsx) | aviso de voz não instalada |
| [index.css](index.css) | tokens, foco, `.hit`, `.tap`, movimento reduzido |
