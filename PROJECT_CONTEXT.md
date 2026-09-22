
# 📘 Aqui se diz — Contexto do Projeto

**IMPORTANTE:** Cole este arquivo no início de um novo chat para restaurar o contexto do desenvolvimento.

> Este arquivo é o registro de **decisões**: por que cada coisa é como é.
> Para a descrição do sistema, as convenções obrigatórias e a lista de defeitos
> conhecidos, leia [AGENTS.md](AGENTS.md), que é a entrega técnica auditada.

## 1. Conceito do App
O aplicativo é um **Guia de Sobrevivência para Imigrantes e Viajantes**, não um tradutor literal.
*   **Objetivo:** Mostrar o produto **equivalente real** (comercial/cultural/farmacêutico) no país de destino.
*   **Plataforma:** PWA (React + Vite + Tailwind + Capacitor).
*   **Design:** Interface estilo "App Nativo", responsiva, com sons de interação (Haptic/Audio feedback).

## 2. Módulos e Temas

### A. Módulo Supermercado (Vermelho - `#c83745`)
*   Foco: Compras do dia a dia.
*   Funcionalidades: Lista de Compras, Favoritos, Busca por Voz, Áudio TTS.
*   Dados: Categorias padrão (Hortifruti, Açougue, Limpeza, etc.).

### B. Módulo Farmácia (Verde Esmeralda - `#059669`)
*   **Lógica Crítica:** Equivalência Farmacêutica Estrita.
*   **Regra de Segurança:** Se um remédio é proibido ou não existe no destino (ex: Dipirona nos EUA), o app **NUNCA** traduz literalmente. Ele avisa "PROIBIDO" ou "NOT SOLD".

#### Regras de Exibição (Farmácia):
1.  **Lista (Card Fechado):**
    *   Mostra: Nome Nativo (ex: "Dipirona") ↔ Nome Destino (ex: "Metamizol").
    *   Ordenação: **Alfabética** baseada no nome nativo.
    *   Ações: Botões de áudio e frases ("Eu quero", "Perguntar") visíveis.
2.  **Detalhes (Card Aberto):**
    *   **Nome Genérico:** Princípio ativo no país de destino.
    *   **Marcas:** Lista de até 5 marcas reais (ex: Tylenol, Panadol) extraídas dos parênteses.
    *   **Status:** Banner colorido (Verde = Disponível / Vermelho = PROIBIDO/NÃO VENDIDO).
    *   **Alternativa Segura:** Se não vendido, sugere substituto (ex: "Use Tylenol").
    *   **Sem Áudio:** O botão de áudio é **removido** na visão expandida para evitar confusão se o produto não existe.
    *   **Ação:** Botão "Adicionar à Lista" no lugar do áudio.
    *   **Scroll:** Auto-scroll para centralizar o card ao abrir.
    *   **Origem:** Nenhuma referência ao país de origem ("No Brasil...") é exibida.

## 3. Estrutura de Dados (Farmácia)
Os arquivos (`medicineData.ts`, `firstAidData.ts`, `cosmeticsData.ts`) seguem este padrão para permitir o *parsing* inteligente:

```typescript
{ 
  source_term: "Nome no Brasil", 
  image: "", 
  gender_pt: "m", 
  translations: { 
      // Padrão: "Genérico (Marca1, Marca2)" OU "STATUS (Instrução Alternativa)"
      cl: "Paracetamol (Kitadol, Panadol)", 
      us: "PROIBIDO (Use Acetaminophen)", 
      es: "Metamizol (Nolotil)"
  }, 
  phonetics: { ... } 
}
```

## 4. Países Suportados
1.  Brasil (br)
2.  Chile (cl)
3.  Argentina (ar)
4.  Espanha (es)
5.  Portugal (pt)
6.  Estados Unidos (us)
7.  Reino Unido (gb)
8.  Itália (it)
9.  França (fr)
(México foi removido).

## 5. Status do Desenvolvimento (Checklist)
*   ✅ **Base Tecnológica:** Vite, React, Tailwind, PWA, Capacitor, Sons UI.
*   ✅ **Hub:** Tela inicial com grid de módulos.
*   ✅ **Supermercado:** 100% Funcional.
*   ✅ **Farmácia - Lógica:** Parsing de strings, alertas de proibição, layout específico.
*   ✅ **Farmácia - Dados:** 
    *   **Dor e Febre:** ~25 itens por subcategoria (Completo).
    *   **Gripe/Resfriado:** ~25 itens por subcategoria (Completo).
    *   **Alergia:** ~25 itens por subcategoria (Completo).
    *   **Estômago:** ~25 itens por subcategoria (Completo).
    *   **Primeiros Socorros:** ~25 itens por subcategoria (Completo).
    *   **Cosméticos/Pele:** ~25 itens por subcategoria (Completo).
    *   **Uso Contínuo:** Dados básicos de pressão/diabetes implementados.

## 6. Como Continuar
Ao reiniciar o chat, peça para:
1.  Revisar se alguma subcategoria específica precisa de ajustes finos.
2.  Implementar novos módulos (ex: **Restaurante**, **Transporte**) usando o componente `ModuleLayout` já existente.
3.  Manter a regra de não alterar o CSS/Layout global a menos que solicitado.

## 7. Atualizações de setembro de 2026

### Foco de produto
*   Público-alvo atual: imigrantes na **Espanha** (brasileiros, marroquinos, ucranianos). Chile e Argentina ficam em segundo plano.
*   A frase principal é sempre no idioma de **destino**; o idioma nativo aparece pequeno, só como apoio.
*   País de destino padrão: Espanha.

### Novos módulos
*   **Onde está?** (`modules/LocationModule.tsx`, azul): cena visual com objeto e referência, 12 posições, frase montada por gramática (artigos e contrações por idioma).
*   **Direções** (`modules/DirectionsModule.tsx`, laranja): mapa de quarteirões, percurso passo a passo, bússola, perguntas e vocabulário da rua. Espanhol da Espanha (manzana, gira, sigue recto).

### Base técnica (correções)
*   Supermercado e Farmácia agora usam um único `modules/CatalogModule.tsx` (os arquivos antigos podem ser apagados).
*   Painéis de Favoritos e Lista de Compras ligados (antes abriam vazios).
*   Tailwind instalado no build (sem CDN), CSS em `index.css`.
*   PWA via `vite-plugin-pwa`: service worker gerado no build com pré-cache de tudo, atualização automática. Sem `sw.js`/`manifest.json` manuais.
*   Ícones reais em `public/icons/` (gerados por `scripts/generate-icons.mjs`), bandeiras locais em `public/flags/`.
*   ~~Áudio usa só a voz do sistema (`speechSynthesis`), sem endpoint não oficial do Google.~~
    **Revertido em 10/09/2026.** Sem o endpoint, o áudio passou a depender das vozes
    instaladas — e o aparelho do público real tem uma ou duas, nenhuma da região certa.
    O app ficou sem cumprir a própria promessa justamente para quem foi feito. A ordem
    agora é: voz da região exata no aparelho → áudio pela rede com o locale completo →
    calar e explicar. A região nunca é substituída.
*   Interface traduzida também para francês e italiano.
*   Classes do Tailwind nunca são montadas dinamicamente (`bg-${cor}`): usar strings completas ou `style` com o hex do tema.

### Ucrânia e Marrocos (etapa 1, feita)
*   Países `ua` (uk-UA) e `ma` (ar-MA) com `originOnly: true`: aparecem só em "Eu falo", não em "Estou em".
*   Interface traduzida (`ukUA`, `arMA` em `translations.ts`), módulos "Onde está?" e Direções com dados em `uk` e `ar`.
*   Ucraniano: cada objeto traz genitivo, instrumental e locativo; a preposição indica o caso com `{gen}`/`{instr}`/`{loc}`.
*   Árabe: árabe padrão (não darija), artigo `ال` colado, sem cópula. Texto nativo usa `dir="auto"`; o app continua LTR porque o conteúdo principal é espanhol.
*   Etiqueta "PROIBIDO" da farmácia agora é `t('banned')`; o marcador `PROIBIDO` nos dados é só um código interno.
*   Fallback de termo nativo: código do país → idioma base → inglês → pt-BR.
*   **Bloqueios enquanto o catálogo não estiver traduzido:** módulos com `needsCatalog` (Supermercado, Farmácia) ficam desativados no hub quando a origem é um país `originOnly`; dentro desses módulos o painel recebe `blockOriginOnly` e apaga as bandeiras `ua`/`ma` em "Eu falo". Ao concluir a etapa 2, basta remover `originOnly` dos países.
*   O mesmo país não pode ser origem e destino: a bandeira já escolhida de um lado fica desativada do outro.

### Módulos "Números" e "Onde dói" (novos)
*   **Números** (`modules/NumbersModule.tsx`, violeta): quatro abas — hora (relógio), preço (etiqueta + teclado), data (calendário) e número puro. Tudo gerado por regra em `numbersData.ts`: `numberToWords` cobre 0 a 999.999 nos 7 idiomas, mais `buildTime`, `buildPrice` e `buildDate`.
*   **Onde dói** (`modules/BodyModule.tsx`, rosa): boneco em SVG com 13 pontos tocáveis, 14 partes do corpo, 4 sintomas localizados, 8 sintomas gerais e 5 durações. Cada parte guarda duas formas por idioma: com artigo (`la cabeza`) e com preposição de lugar (`en la cabeza`), o que resolve as contrações de fr/it/pt sem lógica extra.
*   Nenhum dos dois depende do catálogo, então já funcionam em ucraniano e árabe.
*   Preço tem duas formas: a completa ("dos euros con ochenta") e a curta que se ouve no caixa ("dos con ochenta"), cada uma com seu áudio. O teclado do preço empurra os centavos como num terminal, com tecla "00"; o de número tem vírgula decimal e lê "dos coma cero cinco" quando há zero à esquerda.
*   Armadilhas cobertas: espanhol `veintidós`/`menos cuarto`/`con` no preço, francês `soixante-dix`/`quatre-vingts`, italiano `ventuno`/`ventotto`, português `mil duzentos e cinquenta` (o "e" só antes de grupo curto), ucraniano `Пів на четверту`, árabe plural quebrado dos minutos.

### Módulos "Café e tapas", "Eu, você, ele" e "Medidas" (novos)
*   **Café e tapas** (`CafeModule.tsx`, marrom): copo ou xícara desenhado com a proporção de café, leite, água, leite condensado, licor ou gelo. Nove bebidas com o nome local por país e uma explicação na língua de quem lê, porque tradução literal não serve aqui. Sete modificadores entram na frase do pedido ("un cortado en vaso sin azúcar"). Dez porções explicadas: tapa, pincho, ración, media ración, montadito, menú del día, primero, segundo, para picar, caña.
*   **Eu, você, ele** (`PronounsModule.tsx`, verde-azulado): 8 pronomes vezes 7 verbos vezes complemento, em afirmação, pergunta e negação. Marca "formal" em usted/ustedes e "Espanha" em vosotros, com aviso explicando a armadilha. O campo `altPerson` resolve o fato de que inglês, francês, ucraniano e árabe conjugam o tratamento formal na 2ª pessoa, enquanto espanhol e italiano usam a 3ª. Ucraniano e árabe têm formas vazias para "ser", porque dispensam a cópula no presente, e o árabe nega frase nominal com "ليس" conjugado.
*   **Medidas** (`SizesModule.tsx`, índigo): conversor de calçado, roupa feminina e masculina entre Brasil, Europa, Reino Unido e EUA. A numeração de origem vem do país nativo e a de destino do país-alvo. Espanhol e francês distinguem calçado ("número", "pointure") de roupa ("talla", "taille"). Traz aviso de que a numeração varia por marca.
*   Nenhum dos três depende do catálogo: funcionam em ucraniano, árabe e lituano.

### Lituano (lt)
*   Sétimo idioma, também `originOnly`: aparece só em "Eu falo".
*   Gramática coberta: genitivo depois de "norėti" e das preposições de lugar, instrumental depois de "po", acusativo depois de "priešais" e de "skauda", locativo para "patinimas". O campo `cases` ganhou `acc`.
*   Negação cola no verbo (`noriu` vira `nenoriu`), com `yra` virando `nėra`.
*   "Precisar" pede sujeito no dativo: `dativeIn` no verbo e `dative` no pronome geram "Man reikia gydytojo".
*   "Jūs" formal conjuga na 2ª pessoa do plural, como o francês.
*   Números flexionam o substantivo contado (1 euras, 2-9 eurai, 10+ eurų) via `ltPlural`. Tamanho de roupa usa algarismo, porque declinar o ordinal seria frágil.

### Polimento de interface (critérios do Emil Kowalski)
*   Tokens de easing em `index.css`: `--ease-out`, `--ease-in-out`, `--ease-drawer`. As curvas nativas do CSS são fracas demais.
*   Classe `.tap` substituiu `transition-all` em 34 lugares: propriedades explícitas e 150ms, que é a faixa de retorno de toque. `all` animava sombra e borda, que forçam repintura.
*   **Bug corrigido:** a curva da gaveta estava escrita como classe Tailwind (`cubic-bezier(...)`) e não compilava. Agora vai em `style`.
*   Saída da gaveta (250ms) é mais rápida que a entrada (450ms).
*   `future.hoverOnlyWhenSupported` no Tailwind: uma linha põe todo `hover:` sob `@media (hover: hover)`. Sem isso o hover fica grudado depois do toque no celular.
*   `prefers-reduced-motion` mantém opacidade e cor, tira o deslocamento. `--scene-duration` cai para 1ms.
*   Ponteiros do relógio giram um `<g>` em vez de animar `x2`/`y2`: atributo geométrico de SVG não vai para a GPU.
*   Cascata no hub só nos primeiros 800ms de vida do app. Voltar ao hub é navegação repetida e não deve animar.

### Relógio: 24h e AM/PM
*   Na Espanha se escreve 24h e se fala 12h mais o período. O módulo mostra os dois lados ao mesmo tempo.
*   **A hora é escolhida de 00 a 23**, e o período (madrugada, mañana, tarde, noche) é **deduzido** por `periodFromHour24`. Escolher o período era um erro: permitia "las diez de la madrugada", que não existe. Deduzindo, a combinação errada deixa de ser possível.
*   O mostrador tem **dois anéis**: o de dentro de 1 a 12, como se fala, e o de fora de 13 a 24, como está escrito. Escolher 22 acende 22 e 10 no mesmo ponto, que é o que explica a relação. A lista de botões (`HOURS`) é separada, de 00 a 23.
*   O digital ao lado começa no formato do país de destino (`uses12hClock`: EUA e Reino Unido usam AM/PM) e tem seletor para trocar.

### Tempos verbais (no mesmo módulo de pronomes)
*   Passado, presente e futuro entraram como um segundo seletor no cartão da frase, ao lado do de afirmação/pergunta/negação. Módulo separado duplicaria a lista de pronomes e a de verbos.
*   Espanhol usa o **pretérito perfecto** ("he querido"), que é o passado que se ouve na Espanha, e o **futuro perifrástico** ("voy a querer"), muito mais falado que "querré".
*   `pastForms` e `futureForms` guardam as seis formas por idioma, como `forms`. Uniforme, sem composição a errar.
*   Os dois seletores têm **forma e rótulo diferentes**, porque são dimensões diferentes: QUANDO é um seletor único dentro de um trilho afundado, COMO são botões soltos e arredondados. Os rótulos seguem o padrão de palavra interrogativa das outras seções (QUEM, VERBO, O QUÊ).
*   Regras por idioma no `buildPhrase`: francês abraça só o auxiliar ("je n'ai pas voulu") e não elide o sujeito antes da negação; lituano cola o "ne" na primeira palavra; árabe nega passado com "ما" e futuro com "لن" mais o presente; inglês troca o auxiliar por tempo (did / will).

### Medidas: seis tabelas
*   Além de calçado, roupa feminina e masculina, entraram **calça** (cintura, com polegadas em UK e EUA), **sutiã** (banda BR, EU e UK/EUA mais medida abaixo do busto) e **roupa infantil** (idade BR, altura EU).

### Acessibilidade e desempenho (audit)
*   **Contraste:** zero falhas nas nove telas. `text-gray-400` virou `gray-500` (4,83:1); sobre fundo colorido o texto que precisa ser lido usa **branco cheio**, e a hierarquia vem de tamanho e peso, porque opacidade de branco não alcança 4,5:1 nos temas médios.
*   **Temas:** Farmácia, Direções e Pronomes reprovavam com texto branco (3,19 a 3,77). Passaram para o tom 700: 5,48, 5,02 e 5,47.
*   **Foco:** o app não tinha estilo próprio e um lugar removia o do navegador. Agora anel branco com halo escuro, visível sobre claro e sobre colorido, só em `:focus-visible`.
*   **Alvo de toque:** classe `.hit` estende a área para 44px por pseudo-elemento, sem mexer no desenho. Botões dos cards subiram de 36 para 40px com espaçamento maior.
*   **Nome acessível:** botões só de ícone (início, busca, limpar, microfone) ganharam `aria-label`.
*   **Divisão do pacote:** cada módulo virou um pedaço próprio com `lazy`, e o catálogo saiu de `constants.ts` para `data/catalog.ts`. O pedaço inicial caiu de **908 KB para 282 KB**; os 452 KB do catálogo só carregam ao abrir Supermercado ou Farmácia.
*   Ordem de títulos corrigida nos Pronomes, e bandeiras do painel com carregamento adiado.

### Categorias: painel em grade no lugar da lista suspensa
*   Quem entrava no Supermercado ou na Farmácia não percebia que havia categorias. A causa era o desenho, não a percepção: o seletor era `text-3xl` branco **sem fundo, sem borda e sem padding**, maior que o próprio título da página, então lia como cabeçalho. Logo abaixo, as abas de subcategoria coloridas prendiam o olho e ninguém subia.
*   O gatilho agora é uma **linha branca com ícone, rótulo em cima e seta à direita**, na altura de 56px. A gramática de um seletor, menor que o título.
*   O `CategorySheet` mostra as nove (Supermercado) e as oito (Farmácia) categorias em **grade de duas colunas**, sem rolagem em 375px. Três colunas não cabem: "Estômago e Intestino" tem 20 caracteres.
*   Ícones desenhados em `components/CategoryIcons.tsx`, **fora de `Icons.tsx` de propósito**, para caírem no pedaço adiado do catálogo e não no pacote inicial.
*   `components/categoryMeta.ts` guarda ícone e tom por categoria com as **classes escritas por extenso**. O Tailwind não monta `bg-${cor}`: o projeto já quebrou assim duas vezes. Cores quentes (âmbar, laranja, lima) precisam do tom 800 para passar em contraste.
*   O painel precisa ser **irmão do `ModuleLayout`, não filho**: o cabeçalho é `relative z-30` e cria contexto de empilhamento, então um `fixed z-[90]` lá dentro ficaria preso abaixo da barra de navegação.
*   É o **primeiro diálogo de verdade do projeto**: nada aqui tinha `role="dialog"`, tecla Esc ou foco preso, nem o `LanguagePanel`, que já é modal. O comportamento foi escrito do zero e o `LanguagePanel` pode adotar depois.
*   Selecionado é marcado por **três sinais** ao mesmo tempo: fundo tingido, anel na cor do tema e um selo de confirmação. Um só não se vê em telha pequena.
*   **A Farmácia abria em "Uso Contínuo"**, que é pressão, colesterol e diabetes: a pior estreia para quem entra precisando de analgésico. Passou a abrir em Dor e Febre por `defaultCategoryName`, que só vale para quem nunca abriu o módulo. Junto veio um defeito: a subcategoria salva era aceita sem checar se pertence à categoria resolvida, e a primeira abertura ficava errada.
*   Falta ainda **animação de saída**: o painel desmonta na hora. Entra deslizando, sai sem transição.

### Compartilhar o app (novo)
*   O app não tinha como ser passado adiante, e o crescimento previsto é por indicação — muitas vezes cara a cara, dentro de uma loja. Por isso o **QR tem o maior peso visual** da folha, e por isso ele é um SVG pré-gerado e precacheado: aparece com o aparelho offline, que é o cenário real.
*   A URL é a constante `SHARE_URL` em `constants.ts`, **nunca `window.location.origin`**. A origem em runtime erra em dois cenários: no Capacitor vira `capacitor://localhost` e num preview da Vercel vira o domínio efêmero do deploy. A mesma constante alimenta o QR, os quatro canais e o texto.
*   `scripts/generate-qr.mjs` gera o QR lendo a URL de `constants.ts` e grava um `<desc>` com ela dentro do SVG. Um QR é ilegível em diff: sem esse `<desc>`, trocar de domínio sem regerar passaria despercebido. O teste compara os dois e quebra a CI em vez de quebrar o usuário.
*   **WhatsApp por `wa.me`, nunca `whatsapp://send`.** O esquema nativo não faz nada em desktop nem em webview embutida, e no iOS sem o app mostra erro do Safari — botão morto. Há teste trancando isso.
*   O `index.html` não tinha **nenhuma meta Open Graph**. Sem elas o link chegava no WhatsApp como URL pelada, e o `sharer.php` do Facebook ficava sem título, descrição e imagem — ele ignora texto pré-preenchido e lê só de OG. `og:image` reaproveita `/icons/pwa-512x512.png`, que já está no precache.
*   Escala de empilhamento hoje: header 30, painel do ModuleLayout 40, nav e modal de instalação 50, `CategorySheet` 90, `LanguagePanel` 100, **`ShareSheet` 105**, `VoiceMissingSheet` 110, `UpdateSheet` 120. O 105 é deliberado: a folha fica acima de tudo que o usuário abre por vontade própria e abaixo dos dois avisos que o sistema impõe.
*   O `ShareIcon` de `Icons.tsx` era uma **bandeja com seta para cima** e nunca tinha sido usado. O nome mentia: lê como baixar ou enviar arquivo. Virou `UploadIcon`, e `ShareIcon` passou a ser o glifo de três pontos ligados, que é o único que ninguém confunde.
*   Glifos de marca ficam em `components/BrandIcons.tsx`, **fora de `Icons.tsx` de propósito**: são marcas registradas com geometria de preenchimento, então a convenção de ícone autoral com `stroke` não se aplica, e o arquivo separado impede a exceção de contaminar o resto.
*   O botão entrou nos **nove headers**, sempre como item mais interno do cluster direito, com `gap-2`. O espaçamento não é estética: a área de toque de `.hit` é 44px centrada no botão, e com menos que isso as duas se sobrepõem e a de baixo no DOM para de responder. Medido: 46px entre centros no catálogo, 54px nos módulos.
*   Como os sete headers de módulo são duplicados, um teste varre os nove arquivos exigindo `<ShareButton`. Um décimo módulo que esqueça o botão não passa na CI.

### Corpo maior em árabe e ucraniano (novo)
*   O dono levantou que a letra em árabe e ucraniano parecia pequena demais. É real, e por dois motivos somados. O primeiro é da escrita: **no mesmo tamanho nominal, árabe e cirílico têm traço mais fino e detalhe distintivo menor que o latino** — 12px em "Supermercado" não valem 12px em "السوبر ماركت". O segundo é de uso, e é o que decide: **quem abre este app está lendo um alfabeto que não conhece**. Não dá para reconhecer a palavra pela silhueta; é preciso resolver glifo por glifo. Aí o tamanho pequeno deixa de ser desconforto e vira barreira.
*   Cada degrau da escala pequena sobe cerca de **2px, com a entrelinha junto** (o árabe leva diacrítico acima e abaixo da linha, e apertar isso encavala as marcas): `text-xs` → 14px, `text-sm` → 16px, `text-base` → 18px, `text-lg` → 20px, `text-xl` → 22px, mais os arbitrários de 9, 10, 11 e 13px.
*   **De `text-2xl` para cima fica como está.** Título já é grande, e crescer ali não melhora leitura — só produz reticências nos cabeçalhos, que são estreitos por causa dos botões nas duas pontas.
*   A regra é `html[lang^='ar']` / `html[lang^='uk']` em `index.css`, depois de `@tailwind utilities`, em `rem` para continuar respeitando o zoom do sistema. Os outros dez locales não mudam **nada** — verificado: pt-BR segue em 14px onde ar-MA vai a 16px. Segue o precedente que já existia no arquivo, o `[dir='rtl'] * { letter-spacing: normal }`.
*   **Uma exceção, e ela tem motivo:** a URL de compartilhamento. É string de máquina em alfabeto latino — ninguém a lê glifo por glifo, copia ou aponta a câmera —, e em `font-mono` a 14px ela deixa de caber na folha e quebra no meio da palavra (`...vercel.ap` / `p`), o que faz o endereço parecer defeito. Ganhou classe própria, `.url-mono`, justamente para que nenhuma regra de idioma a alcance.
*   Verificado nos sete módulos alcançáveis em cada uma das duas línguas (Supermercado e Farmácia são bloqueados para países `originOnly`): **zero elementos passando da borda, zero títulos cortados, página em 375px sem rolagem horizontal**. O que sobra fora da tela são as réguas com `overflow-x-auto`, que já eram roláveis de propósito.

### Mapa de Direções: de planta baixa para GPS (novo)
*   O dono disse que "o mapa chapado a pessoa perde a direção". Estava certo, e a causa é medível: **o mapa era norte-sempre-em-cima e as frases são do ponto de vista de quem anda**. As duas coisas só coincidiam olhando para o norte — de frente para o sul, "gira a la derecha" mandava o boneco para a **esquerda** da tela. Em 3 das 4 direções o mapa discordava da frase; em 1 delas dizia o oposto.
*   Agora o caminhante aponta sempre para cima e **é o mundo que gira por baixo**. "Direita" é direita na tela, nas quatro direções. Mesma escolha do Google Maps e do Waze, pelo mesmo motivo: girar o mapa na cabeça é o que ninguém consegue fazer andando na rua.
*   **A cidade não acaba.** Esta é a peça que destravou tudo. Prender o caminhante no meio da tela parecia impossível: o bairro tinha 4 quarteirões de lado, então a câmera saía do mundo e o mapa sumia do quadro. Foram tentadas e descartadas duas saídas ruins — girar em torno do centro da grade (o boneco era atirado 140px pela tela a cada virada) e ancorar com escala reduzida (um terço do quadro vazio e a grade cortada). A solução é um `<pattern>` repetido: cidade infinita com **um elemento só**, em tom mais claro. O bairro onde dá para andar é desenhado por cima, mais forte, e essa diferença de tom conta sem legenda até onde o percurso pode ir.
*   **Cada passo virou vários tempos.** Antes o boneco deslizava e girava ao mesmo tempo, e a virada — que é o que a frase ensina — passava batida. Agora virar é um tempo próprio, parado na esquina, com uma seta de virada estilo GPS acesa, e cada quarteirão andado é outro tempo. O primeiro tempo sai em 0ms: meio segundo de nada entre o toque e o movimento lia como travado.
*   O giro acumulado é guardado **sem módulo**. Com `% 4`, a passagem de 270° para 0° faria o mapa desandar 270° para trás em vez de seguir 90° adiante — e a animação contaria uma virada que não aconteceu.
*   Emoji, números de passo e a letra do norte levam **contragiro em torno do próprio ponto**, com a mesma duração do mapa: com tempos diferentes eles rodopiariam durante a virada; sem contragiro, ficariam de cabeça para baixo.
*   O quarteirão passou de 60 para **72 unidades** e o bairro de 5x5 para **7x7 cruzamentos**. O bairro maior não é estética: com a cidade continuando à vista, a borda virou parede invisível, e os botões apagavam sem explicar por quê.
*   **Rotatória e bifurcação** entraram no mapa. Estavam no vocabulário do módulo e não tinham figura — eram palavra sem desenho. São cenário: o caminhante passa por elas andando na grade reta. **Não existe passo de "pegue a segunda saída"** — isso seria outro modelo de movimento.

### Rotatória e bifurcação viram passos de verdade (novo)
*   Elas tinham entrado só como desenho. O dono cobrou os botões, e a cobrança estava certa: palavra que o módulo ensina e não se pode usar é vitrine.
*   O que segurava era o modelo: o caminhante só sabia andar em **4 direções**, e a bifurcação é uma rua **diagonal**. Sem 45° ela seria desenho para sempre. `HEADINGS` passou a ter **8 direções** e `turn` passou a ser medido em oitavos de volta: 2 = direita, -2 = esquerda, 4 = meia-volta, e **1 / -1 são os desvios da bifurcação**.
*   Chão diagonal só existe nos trechos listados em `DIAGONAIS` — é o que separa uma bifurcação de uma esquina. Numa esquina você gira 90°; na bifurcação a rua se abre em 45° e continua. Fora desses trechos o passo se recusa sozinho, e por isso a bifurcação **não precisa de teste de posição**: na tela, só o desvio que existe fica aceso.
*   A rotatória precisa de teste, e tem: `at: 'rotatoria'` exige estar nela. As três saídas são primeira (direita), segunda (reto) e terceira (esquerda) — a ordem real de quem entra num anel.
*   **"Vire à direita" quer dizer *pegue a próxima rua à direita*, não *gire 90°*.** Na grade em cruz dá no mesmo; saindo da diagonal, não: 90° a partir de uma diagonal cai no meio de um quarteirão e o passo apagava, transformando o fim da avenida diagonal em beco sem saída. Agora, depois do giro cheio, tenta-se o mais aberto.
*   Consequência que quase passou batida: **`applyStep` devolve o giro REALMENTE aplicado**, e é dele que sai a rotação do mapa. Lendo o giro do passo, o mapa girava 90° enquanto o caminhante virava 45°.
*   **Nenhum passo fica apagado na tela, em lugar nenhum do módulo.** A grade principal passou a mostrar só os que dão para usar dali. Apagado carrega um recado ("a rua acabou") que quase nunca é verdade: com o bairro de 7x7, o mais comum é o passo não valer por um detalhe de geometria que ninguém precisa saber, e o resultado era meia grade cinzenta o tempo todo — que é como se ensina a pessoa a parar de olhar para ali.
*   O preço de sumir é a grade mexer de lugar a cada passo, e **botão que some sem explicação confunde tanto quanto botão apagado**. Por isso a regra vem escrita dentro do cartão ("só aparecem os passos possíveis a partir de onde você está"), e por isso existe a linha do beco sem saída: sem ela, chegar ao destino deixaria a seção vazia sem dizer o que fazer. Agora ela diz — usar Desfazer ou Limpar no percurso.
*   A grade principal fica em **cartão branco**; o tingido é só da rotatória e da bifurcação, e é o que faz elas parecerem novidade quando aparecem.
*   **Rotatória e bifurcação ficam na MESMA grade dos outros passos**, no fim dela, tingidas com a cor do módulo. Tentativa anterior descartada: seção própria logo abaixo da grade. O dono foi procurar o botão da bifurcação na grade de cima e não achou — **botão que aparece fora do lugar onde se olha é botão que não apareceu**. Entram no fim, e não no começo, para os oito de sempre não trocarem de posição a cada passo.
*   A linha de regra do cartão **troca de texto** ao chegar na rotatória ou na bifurcação, com o nome do lugar em destaque: é a explicação chegando onde o olho já está, em vez de num bloco à parte.
*   Os cinco passos de lugar **não ficam na tela**: a seção inteira só existe quando dá para usar algum deles, e mostra apenas os que valem ali (na bifurcação, só o desvio que existe — vira uma coluna só). Botão que passa a vida apagado não ensina a regra dele: ensina a ignorar aquele canto da tela, e ainda ocupa espaço o tempo todo por algo que vale em dois pontos do mapa. Medido: 42 botões e 2382px no início, 51 e 2707px parado na rotatória.
*   Surgindo no momento em que a pessoa chega, viram acontecimento — é o único instante em que ela vai ler o que está escrito ali. Por isso o texto não gasta a linha dizendo **onde** elas ficam (o mapa já mostra) e sim **o que muda na fala**: na rotatória não se diz "vire", conta-se a saída. A descoberta não fica solta: a rotatória e a avenida diagonal estão desenhadas no mapa desde o começo, então há para onde mirar.
*   **A seta de virada virou placa.** A seta curva desenhada à mão ficava esquisita — um risco solto no meio do mapa, sem parentesco com nada. A placa mostra o mesmo símbolo do botão que a pessoa acabou de apertar, o que liga o toque ao que acontece na tela e é como a rua avisa de verdade.

### Módulo "Maquiagem" (novo)

*   **Por que módulo próprio e não categoria da Farmácia.** Categoria herdaria `needsCatalog`, que fica bloqueado para países `originOnly` — ucraniana, marroquina e lituana, que é justamente o público que o projeto acabou de adicionar. Só brasileira veria. Generativo não depende do catálogo e abre para os quatro públicos. Conferido antes: o catálogo tem **zero** itens de maquiagem; o que existe é skincare na Farmácia e "Demaquilante" no Supermercado, e nada foi movido.
*   **A tese.** O substantivo é trivial ("batom" → "labial" é dicionário). O que trava na loja é a **especificação** — tom, subtom, cobertura, acabamento, tipo de pele — e, do outro lado, **não saber o nome do objeto**. Daí as duas metades.
*   **Duas metades num seletor de modo, não numa rolagem só.** Configurar um pedido e navegar um vocabulário são interações diferentes; empilhadas dariam dez seções e um cartão de frase ambíguo. Precedente: os Números usam abas pelo mesmo motivo.
*   **Concordância só onde ela existe de verdade.** `depth` virou sintagma fechado (`de tono claro`), que não concorda com nada — é como se fala no balcão e elimina o problema. Só `color` é adjetivo, e as quatro formas são **escritas à mão**: `rosa` é invariável em gênero *e* número no espanhol, `marrón` só flexiona no plural, `nude` e `coral` não flexionam. Regra de `-o → -a → +s` erraria em série.
*   **Três casos gramaticais no mesmo módulo, e eles divergem do Café:** `Шукаю` rege acusativo, `Ieškau` rege **genitivo** (o Café guarda acusativo por causa de um "eu queria" implícito), e o árabe vai **indefinido, sem `ال`** — o oposto de `locationData.ts`. Do lado dos acessórios, o mesmo objeto aparece em três casos conforme o quadro: `Ar turite {acusativo}`, `Ieškau {genitivo}`, `Kiek kainuoja {nominativo}`.
*   **O verbo do preço concorda em número, e o número muda de língua para língua**: `las pinzas` mas `a pinça`, `les cotons-tiges` mas `o cotonete`. Daí `num` no acessório e `templatesPl` no quadro.
*   **Trocar de produto não apaga escolha nenhuma.** A primeira versão podava o estado e perdia o tom de quem passou pelo batom e voltou para a base — tom e subtom descrevem a **pessoa**, não o produto. Quem filtra é o builder, por `optionsFor`; a seção some da tela sozinha, e isso basta como resposta visual.
*   **`pincel`, `brocha` e `cepillo` são três verbetes, não um.** São objetos diferentes com nomes que não se sobrepõem entre as línguas. **"brush" não virou verbete**: entra como `note`, na língua de quem lê, explicando que na Espanha ninguém usa a palavra. Mesmo tratamento em `unas pinzas` (plural), `bastoncillos`, `neceser`, `diadema` e `sacapuntas`.
*   **Glifos desenhados, não emoji.** Emoji não cobre curvador, apontador, pinça, brocha, cílios postiços nem nécessaire, e misturar emoji com traço fica quebrado justamente no módulo cujo propósito é reconhecer o objeto. O da brocha foi redesenhado depois de conferir na tela: com cabo fino lia como caneta, e a largura do tufo **é** a informação que separa brocha de pincel.
*   **Amostras em HTML, não SVG.** Sem `id`, então o defeito 8.19 não tem como acontecer, e vêm de graça foco por teclado e `aria-pressed`. Nunca só cor: o rótulo em texto fica sempre. "Transparente" é contorno com barra diagonal, porque quadrado branco leria como "muito claro".
*   **Escala de tom só com termos de claro-a-escuro**, nunca descritor étnico nem código numérico de pele. Um rótulo mal escolhido aqui não é imprecisão, é ofensa — e sai em oito idiomas de uma vez. A régua vai de muito claro a muito escuro de verdade, e há teste medindo a luminância dos cinco degraus.
*   **Tema `fuchsia-700` (#a21caf):** 6,32:1 com branco no sólido e 5,46:1 no pé do gradiente do header. O `fuchsia-600` dá 4,71:1 e **cai abaixo de 4,5:1 no gradiente** — é o mesmo ponto em que Farmácia, Direções e Pronomes reprovaram antes de subirem para o tom 700.
*   ⚠️ **Conteúdo não revisado por falante nativo**, e é o mesmo risco da seção 10 do AGENTS.md. O aviso está no cabeçalho de `makeupData.ts` para o próximo agente não herdar a suposição de que está conferido. Os pontos de maior risco são `colorete`, `pintalabios`, `unos polvos`, `brocha`, `bastoncillos`, `neceser` e o vocabulário de subtom, que é jargão e não palavra de todo dia.
*   O `tests/share.test.tsx` tinha lista **fixa** de nove arquivos de header: o décimo módulo não seria varrido, apesar do comentário prometendo que seria. Corrigido. O `tests/i18n.test.tsx` também não varria nenhum módulo generativo — Maquiagem entrou, e estender aos outros sete continua valendo.

### Módulo "Cuidar de idosos" (novo)

*   **Por que este módulo, e por que agora.** Os dez módulos anteriores tratam a pessoa como **consumidora** (supermercado, farmácia, café, maquiagem, medidas) ou **transeunte** (onde está, direções). Nenhum a tratava como **trabalhadora** — e cuidar de idosos e limpar casas é a ocupação real do público declarado na seção 7: brasileira, marroquina, ucraniana e lituana na Espanha. É o primeiro módulo em que errar a palavra custa o emprego, não o constrangimento.
*   **Generativo, e por isso sem `needsCatalog`.** Mesmo raciocínio da Maquiagem: categoria de catálogo ficaria bloqueada para os países `originOnly`, que são justamente quem faz este trabalho. Conferido na tela: com o par ucraniana → Espanha, Supermercado e Farmácia aparecem como "Незабаром" e este módulo abre.
*   **O app nunca tinha falado COM uma pessoa.** Em dez módulos todo interlocutor é balconista, farmacêutico ou desconhecido na rua, e toda frase é em 1ª pessoa sobre si (`Me duele la cabeza`). Aqui a frase vai **para** ela (`¿Le duele algo?`) e **sobre** ela, para a família (`Hoy ha comido poco`). Isso obrigou a decidir o registro, que o projeto vinha adiando: Café e Maquiagem usam `vosotros` (`¿Tenéis…?`), Supermercado usa `usted`, Direções usa `tú` em espanhol e `vous` em francês.
*   **Dois módulos irmãos, não um.** "Limpeza / house cleaner" fica para um segundo commit e reaproveita o eixo de tratamento resolvido aqui. Interlocutores diferentes (a idosa × a patroa), riscos diferentes, e gramática diferente — cuidar é imperativo de cortesia e relato em 3ª pessoa; limpar é verbo de tarefa, cômodo e agenda.
*   **A decisão central: os dois eixos não se multiplicam.** Tratamento (usted/tú) vive só em *Falar com ela*; gênero da pessoa cuidada vive só em *Contar à família*, onde tratamento nem se aplica porque o interlocutor é outro. Os dois seletores nunca aparecem na mesma tela, então a combinação — que levaria a mesma frase a quatro formas em sete idiomas — fica impossível pelo uso, e não só pelo tipo. Nenhuma frase passa de duas formas.
*   **O preço disso é uma regra de conteúdo, e ela é a mesma da Maquiagem.** Lá nenhuma frase podia concordar com o produto; aqui nenhuma frase do lado "falar com ela" pode concordar com o gênero dela. Usa-se `tener` + substantivo (`¿Tiene frío?`, `¿Tiene sueño?`) no lugar de `estar` + adjetivo (`¿Está destemplado?`). Algumas formulações ficam menos naturais, e é troca aceita.
*   **Árabe não tem tratamento, tem gênero de quem ouve.** `اجلسي` / `اجلس` mudam com o gênero de quem escuta, e a cortesia árabe é lexical (`حضرتك`), nunca morfológica. Modelar cortesia árabe como conjugação é o erro que o cabeçalho do arquivo de dados existe para impedir. Como não há seletor de gênero naquele lado, a linha de apoio mostra **as duas formas separadas por barra** — e o árabe nunca é destino, então nunca é falado.
*   **Ucraniano esconde um terceiro eixo: o gênero de quem CUIDA.** "щоб я допомогла" denunciaria que quem fala é mulher. Por isso aquele lado evita passado e condicional de 1ª pessoa em `uk` (usa "Вам допомогти?", infinitivo), e `medTaken` virou impessoal. Consequência assumida: `pt` e `uk` podem coincidir nos dois tratamentos; só `es`, `fr`, `it` e `lt` têm garantia de diferir, e há teste para isso.
*   **As formas são escritas à mão, nunca derivadas.** O clítico italiano **troca de lado** entre os dois tratamentos (`Si appoggi` × `Appoggiati`); uma função que gerasse `tu` a partir de `usted` produziria `Appoggiasi`, string plausível e inexistente. Mesma decisão que a Maquiagem tomou para as quatro formas de `color`.
*   **O caso gramatical varia por QUADRO, e não por módulo.** É onde este arquivo é mais difícil que o da Maquiagem: `Ar turite` rege acusativo e `Ieškau` rege genitivo, sobre o mesmo objeto. E o ucraniano **não** ganhou um quadro com "потрібна/потрібен", porque esse adjetivo concorda com a coisa e não com a pessoa — um `{item}` único sairia errado em metade dos objetos.
*   **Segurança, e esta é a regra que decide se o módulo existe.** Nunca nome de medicamento, nunca dose, nunca quantidade de comprimido. Horário e adesão sim (`¿Ya se ha tomado la pastilla de la mañana?`); o resto é a Farmácia. Período do dia, nunca relógio — hora é o módulo Números. O único algarismo permitido nas tabelas é o `112`, e só em `EMERGENCY`. `tests/eldercare.test.ts` varre todas as strings dos oito idiomas atrás de unidade de dose, quantidade e princípio ativo, e **a falha desse teste não é bug: é motivo para não publicar**.
*   **Emergência fica fora das abas.** Não é um modo que se navega, é uma coisa que se agarra: faixa vermelha (e não na cor do módulo) visível o tempo todo, que abre uma lista **fixa** de seis frases mais o 112. Zero combinatória. O sujeito das frases é "la persona" — substantivo de gênero próprio — justamente para que nenhuma delas precise saber se é senhor ou senhora, já que ali não há seletor.
*   **Rótulo de relato é substantivo, não frase.** Primeira versão usava "Esteve tranquila", e o botão passava a contradizer o próprio resultado assim que o seletor ia para "De um senhor" (`Ha estado tranquilo.`). Virou "Tranquilidade", "Queda", "Desorientação" — substantivo não tem gênero de sujeito. Há teste trancando.
*   **Piso de 14px, e é divergência deliberada.** Os outros dez módulos têm 120 ocorrências de texto abaixo disso (a linha de apoio é `text-[10px]`). Aqui o piso é `text-sm` e o corpo é `text-base`, porque quem usa esta tela lê de pé, com uma pessoa apoiada no braço, e muitas vezes de óculos. Medido na tela: menor fonte renderizada = 14px. **É precedente: vale levar aos outros módulos.**
*   **Nome curto só no cabeçalho.** O `<h1>` tem 190px úteis a 375px de largura, e "CUIDAR DE IDOSOS" mede 213px — saía "CUIDAR DE ID…". O hub continua com o nome inteiro, que lá quebra em duas linhas. Nenhum outro módulo precisou disto porque nenhum outro nome passa de "Supermercado", que mede 186px.
*   **Tema `sky-700` (#0369a1):** 5,93:1 com branco no sólido e 4,87:1 no pé do gradiente do header. O `sky-600` dá 4,10:1 e já reprova no sólido. Mesma armadilha de Farmácia, Direções, Pronomes e Maquiagem.
*   **Falsos amigos mapeados** (vão como `note`, na língua de quem lê): `bengala` é fogo de artifício em espanhol — a bengala é `el bastón`; `resguardo` é recibo — o forro de cama é `el empapador`; na Espanha se toma `la tensión` com `el tensiómetro`, nunca "presión"; fralda de adulto é `el absorbente`, porque "pañal" faz pensar em bebê; e `el pasamanos` é **singular** apesar do `-s`, com asserção nominal no teste porque nenhuma varredura genérica pega isso.
*   ⚠️ **Conteúdo não revisado por falante nativo, e aqui o risco é maior que na Maquiagem**: lá errar é constrangimento, aqui é dano. Pontos de maior risco, nesta ordem: `absorbente`, `empapador`, `pasamanos`, `bastón`, `tensiómetro`, `andador`, e a naturalidade das reescritas sem concordância em espanhol peninsular.

### Módulo "Limpeza da casa" (novo)

*   **É o irmão de "Cuidar de idosos", e a comparação entre os dois é o que ensina a regra.** Lá a frase flexiona por tratamento e por gênero porque o objeto dela é uma **pessoa**. Aqui o objeto é o **chão**: não há o que concordar, e por isso este módulo **não tem seletor nenhum**. Decisão, não descuido — está escrita no cabeçalho dos dados para ninguém "consertar" acrescentando um botão.
*   **O achado: a assimetria de registro.** Quem limpa trata a patroa de `usted`; a patroa costuma tratar quem limpa de `tú`. Por isso *A tarefa* e *Combinar* estão em `usted` e *O que ela pede* está em `tú`. Uniformizar os dois lados ensinaria um registro que ninguém usa, e há teste medindo que cada lado ficou no seu.
*   **O único modo do app inteiro em que a frase é para RECONHECER, não para falar.** *O que ela pede* traz doze instruções como se ouvem na casa. Sem a linha que explica isso, a pessoa treinaria a pronúncia de uma ordem que ela nunca vai dar.
*   **A regra de conteúdo é a de 1ª pessoa:** quem fala é sempre a própria pessoa, e o app não sabe o gênero dela — nem deveria perguntar. Nenhum predicativo concorda com quem fala: "um pouco mais tarde" e não "atrasada", `toutes mes excuses` e não `je suis désolée`, `non ho potuto entrare` e não `non sono riuscita`, `не вдалося увійти` e não `я не змогла`, `مع بالغ الأسف` e não `آسفة`.
*   **Duas formas por tarefa, e não quatro.** Três dos quatro quadros foram construídos sobre o **infinitivo** de propósito. O quarto precisou de forma própria porque "підлогу вже помито" (impessoal em -но/-то) e "grindys jau išplautos" (particípio passivo) não saem de "мити підлогу" por regra nenhuma — e usar o passado de 1ª pessoa ali denunciaria o gênero de quem trabalha.
*   **A fronteira com o catálogo é o ponto mais importante do arquivo.** O Supermercado já é dono de 96 produtos de limpeza, com fonética, de `lejía` a `bayeta`. Este módulo é o TRABALHO, não a compra, e por isso **não tem lista de objetos para navegar**: objeto só aparece dentro da frase de uma tarefa. O teste falha se alguém exportar uma tabela com `TOOLS`, `PRODUCTS`, `ITEMS` ou `OBJECTS` no nome — a duplicação não volta pela porta dos fundos.
*   **O cômodo só existe para a tarefa que o aceita**, e some da tela em vez de ficar apagado — mesma regra que as Direções adotaram. Mas a escolha **não é descartada**: quem escolheu "a cozinha", passou por "levar o lixo" e voltou para "passar pano" encontra a cozinha ainda escolhida. Quem filtra é o builder, como `optionsFor` na Maquiagem.
*   **Rótulo de grupo renomeado depois de ver na tela.** "Os cômodos" ficava dois dedos abaixo de "Em que cômodo", e os dois títulos quase iguais faziam procurar a tarefa na lista de cômodos. Virou "Pela casa".
*   **Nome curto no cabeçalho**, como no irmão: "LIMPEZA DA CASA" não cabe nos 190px do `<h1>`. O hub fica com o nome inteiro.
*   **Tema `lime-800` (#3f6212):** 7,08:1 com branco no sólido e 5,53:1 no pé do gradiente. O verde óbvio para limpeza seria o `green-700`, e ele dá **4,17:1 no pé — reprova**. O `lime-800` também não se confunde com o `emerald-700` da Farmácia, que é mais azulado.
*   **Sem glifos.** No módulo de cuidado o propósito era reconhecer o objeto, e o desenho era a informação. Aqui o propósito é a frase, e desenhar dezesseis verbos seria enfeite — o módulo ficou 5 kB menor por isso.
*   **Lacunas do catálogo cobertas de passagem:** `fregona` e `aspiradora` não existiam em lugar nenhum do repositório, e são os dois objetos número um da limpeza espanhola. Entram como tarefa e como nota, não como verbete de catálogo.
*   ⚠️ **Conteúdo não revisado por falante nativo.** Pontos de maior risco: `fregona`, `encimera`, `váter`, `tender`, `trastero`, `persiana` e o uso de `coger` — que na Espanha é corriqueiro e em boa parte da América Latina é vulgar.

### A nota como equivalência (e não como dicionário)

*   **O que disparou.** Olhando o app pronto: "uma lituana tem sua forma de falar passar o rodo no banheiro, e cada país tem a sua — não pode só traduzir literalmente". Fui ao primeiro commit e a observação se confirma com mais força do que qualquer documento: o primeiro arquivo de dados já traz `"Pão Francês"` → `Marraqueta` (cl), `Papo-seco` (pt), e `"Pão de Queijo"` → `Chipá`. **Marraqueta não é tradução de pão francês.** O app nasceu dicionário de equivalência.
*   **Onde os dois módulos de trabalho já honravam isso:** na gramática (o ucraniano usa o impessoal em `-но`, o lituano usa particípio passivo, o árabe usa masdar — nenhum é decalque do espanhol) e nas armadilhas de palavra (`fregona` × `mopa`, `bengala` × `bastón`, `resguardo` × `empapador`).
*   **Onde não honravam, e era o ponto:** a direção estava invertida. O catálogo parte do que a imigrante **já conhece**; os módulos partiam da **prática espanhola** e glosavam nas outras sete línguas. Ensinavam a *dizer* o costume, sem avisar que o costume é outro. E as notas que existiam eram quase todas de *palavra*, não de *costume*.
*   **A descoberta que tornou o conserto barato:** como cada origem tem sua língua, `note[lang]` **já é uma nota por país de origem** — a mesma chave que o catálogo usa com `cl`, `ar`, `pt`, `us`. Estrutura pronta; faltava conteúdo do tipo certo.
*   **A regra que as notas novas seguem:** dizem o que se faz **na Espanha**, na língua de quem lê, **nunca** o que se faz no país dela. Dá para conferir que aqui a roupa vai no *tendedero*; não dá para afirmar como se seca roupa em Vílnius sem inventar etnografia sobre a casa da leitora. O lado espanhol dito com segurança já entrega a diferença.
*   **A glosa continua fiel, e isso é deliberado.** A linha no idioma dela serve para conferir que vai dizer a coisa certa; se fosse culturalmente adaptada, e portanto diferente do espanhol, ela perderia a única forma de verificar. Equivalência na `note`, nunca na glosa — a separação que Café e Maquiagem já fazem entre `names[target]` e `descs[read]`.
*   **O que ganhou nota:** `tender la ropa` (o tendedero, e que secadora é rara), `el trastero` (fica no porão do prédio, e não é despensa), `la persiana` (é externa, sobe com fita, e se diz *subir*/*bajar*), `coger` (na Espanha é só pegar), `el absorbente` (pede-se por *talla* e por absorção, nunca por marca) e `la cuña` (compra-se na farmácia, no balcão, sem receita).
*   **Mudança estrutural mínima:** `HEARD` era `Text[]` e não tinha onde pendurar nota. Virou `{ key, text, note? }[]`, a mesma forma de `Task` e `CareTool` — e de quebra as chaves do React deixaram de ser índices.
*   **A nota fica FORA do botão de áudio.** Dentro, ela entraria no nome acessível da frase, e quem usa leitor de tela ouviria o parágrafo inteiro antes de saber o que a frase diz.

### A moldura comum aos módulos generativos

*   **O que disparou.** "O layout do supermercado e da farmácia é diferente do restante, e eu gosto do layout do supermercado." Era verdade: o catálogo tinha barra de baixo com o botão redondo grande da bandeira, e os outros dez tinham um par de bandeirinhas de 24px no canto do cabeçalho — para a troca de idioma, que é o controle mais tocado do app.
*   **A observação que definiu o desenho, e é do dono:** "os botões de baixo do supermercado fazem sentido lá; em cada módulo outra coisa fará sentido." Copiar Favoritos e Lista para todos encheria a barra de botão sem função — o erro que o projeto já registrou em Direções. Então a moldura tem **dois slots opcionais**: quem tem o que pôr, põe; quem não tem, fica só com a bandeira no meio.
*   **Não era complicado, e dá para provar:** os dez cabeçalhos eram **idênticos**, variando só a chave do título. A migração foi sobretudo apagar — dez cópias viraram uma —, e de quebra fechou o defeito **8.17** do AGENTS.md, anotado desde antes destes módulos.
*   **Quem ganhou slot, e quem não ganhou.** Cuidar de idosos: **Emergência**, que antes era uma faixa vermelha dentro da rolagem e agora abre e **rola até ela** de qualquer ponto da tela — emergência não é coisa que se procura rolando. Direções **não** ganhou: `Desfazer` e `Limpar` já existem dentro do cartão do percurso, colados ao que eles mexem, e levá-los para a barra separaria a ação da coisa. Os outros oito ficam sem slot, e isso é resposta, não pendência.
*   **O par de bandeirinhas saiu do cabeçalho.** A barra mostra só a bandeira de **destino**, como o Supermercado sempre fez: a de origem já é a língua em que a tela inteira está escrita.
*   **`behavior: 'smooth'` não rola neste WebView.** Medido, não suposto: com ele o painel de emergência abria e a tela ficava onde estava; sem ele, rola. Num botão de emergência, chegar lá vale mais que chegar bonito — e fica o aviso para quem for usar `scrollIntoView` em outro lugar.
*   **O teste ficou melhor do que era.** Antes exigia `<ShareButton` em doze arquivos; agora exige `<ModuleShell` nos dez e **proíbe** `<header>` e `<ShareButton>` à mão. Não basta ter o botão: não se pode redesenhar a moldura, que é exatamente como os dez saíram de sincronia.

### A frase para de sumir, e a barra de baixo sai

*   **O que disparou, palavra do dono:** "a frase que se forma poderia parar abaixo do menu e não sumir, para ficar fácil de ver e trocar as palavras abaixo — daí ela vê formando a frase na hora". É o ponto: ver a frase se formar **é** o módulo, e ela rolava para fora justamente quando a pessoa descia para mexer nas escolhas. Pior caso era "Onde dói", cujo boneco de ~420px já empurrava o cartão para fora da tela.
*   **A informação que fechou o desenho:** "todo módulo tem uma frase principal que você forma". Conferido no código — onde há abas, cada aba tem a sua, mas **só uma existe por vez**. Por isso o `ModuleShell` tem um slot `pinned` só, e o módulo decide qual frase entrega.
*   **Banda fixa, não `position: sticky`.** O `sticky` teria três problemas reais aqui: o `space-y-4` do contêiner injeta margem no elemento grudado; o cartão de *Acessórios* da Maquiagem vive dentro de uma `<section>` curta e descolaria quase na hora; e o `scrollIntoView` do Cuidar passaria a mirar pontos cobertos. A banda está fora do contêiner de rolagem e não depende de onde o cartão está no JSX.
*   **Dois módulos precisaram de corte, e não só de mudança de lugar.** *Eu, você, ele*: o cartão era frase + seis botões (tempo e tipo) e era o mais alto dos dez — na banda foi só a frase, e os botões desceram para a rolagem num cartão claro, que é literalmente o que o dono descreveu. *Direções*: o resultado é uma lista que cresce até dez passos, então foi com teto e rolagem própria — medido, com oito passos a banda para em 296px e o mapa ainda fica com 446px.
*   **A barra de baixo saiu, e a crítica estava certa:** "o menu inferior sem botões perdeu o sentido e perdeu área". Os slots só se justificavam se tivessem função, e em nove dos dez não tinham — 96px de nada em troca de um botão que já cabia no canto do cabeçalho. Com a banda fixa em cima, pagar os dois ficou insustentável. O par de bandeiras voltou para o cabeçalho.
*   **A moldura fica.** Ela nunca foi sobre a barra: era sobre o cabeçalho em dez cópias (defeito 8.17). E agora é o lugar da banda — o que fez a mudança ser num arquivo, e não em dez.
*   **A Emergência do Cuidar voltou para o topo da rolagem**, onde estava antes da barra. Saíram o `sosRef`, o `abrirEmergencia` e o `AlertIcon`: com a banda no alto, a faixa vermelha é a primeira coisa abaixo dela.
*   **O acabamento da banda passou por três versões, e a terceira é do dono.** Na cor da página ela não parecia camada — parecia conteúdo cortado no meio ao rolar. Branca com sombra virava uma terceira cor de fundo na tela. A que ficou: **encostada no cabeçalho, sem canto arredondado entre os dois, com um tom claro da própria cor do módulo** (`${hex}14`, uns 8%) e sombra embaixo. O bloco de cima vira uma peça só, e a tonalidade mostra onde acaba o menu e começa a frase.

### O nome: de "Translator Hub" para "Aqui se diz"

*   **O que disparou:** "uma coisa me incomoda, é o nome tradutor... não é um tradutor." E a contradição já estava escrita aqui mesmo, na seção 1: *"é um Guia de Sobrevivência para Imigrantes e Viajantes, **não um tradutor literal**"*. O primeiro commit do projeto diz o mesmo em dados: `"Pão Francês"` vira `Marraqueta` no Chile — outro pão que ocupa o mesmo lugar na vida, não uma tradução.
*   **Circulavam SETE nomes ao mesmo tempo:** `Translator Hub` (tela e docs), `Translator` (rótulo do Android, sozinho embaixo do ícone), `translator-hub` (npm), `com.translatorhub.app` (appId), `Manual do Imigrante` (título deste arquivo), `Guia do Imigrante` (README) e `supermarket-translator` (remote do git).
*   **O nome novo diz o que o app faz:** mostra como se diz **aqui**, no país onde a pessoa está. Nega o "tradutor" sem precisar argumentar.
*   **E ele se traduz.** A primeira decisão foi marca fixa, e foi revista: o argumento mais forte para marca fixa é ser encontrada na loja de apps, e este app não está em loja nenhuma — é PWA, instalado por link e por QR, e o botão de compartilhar existe justamente para isso. Do outro lado, "Aqui se diz" é **frase**, não marca inventada, e frase serve para ser entendida: em português, para a lituana, seria ruído — exatamente o que "Translator Hub" era. O nome era a única coisa da tela fora da língua de quem lê, num app cujo princípio é mostrar tudo na língua dela.
*   **As oito formas:** `Aqui se diz` · `Aquí se dice` · `Here they say` · `Ici on dit` · `Qui si dice` · `Тут кажуть` · `Čia sako` · `هنا يقولون`.
*   **Onde não dá para traduzir, vale o espanhol.** Manifesto do PWA, rótulo do iPhone e nome do APK são resolvidos na instalação, não em tempo de execução: só cabe uma forma, e é `Aquí se dice` (12 caracteres, cabe no rótulo do Android). Espanhol porque é a língua do país onde toda usuária está, e a única que os quatro públicos têm em comum — o português seria legível para um só deles. Mora em `APP_NAME`, em `constants.ts`.
*   **A aba do navegador acompanha:** o `<title>` do `index.html` é só o texto inicial, antes de o React montar; daí em diante o `App.tsx` reescreve `document.title` com `t('hubTitle')`, junto do `lang` que o `useCountryPair` já mantém.
*   **`shareTitle` foi reescrito, não substituído.** Era frase conjugada com o nome dentro — "Compartilhe **o** Translator Hub" — e "Compartilhe o Aqui se diz" não é português. Virou ação sem o nome ("Compartilhe o app"); o nome continua saindo no `shareMessage`, que é o texto que chega em terceiros.
*   **O `appId` mudou agora porque agora é de graça.** Trocar o `appId` de um app publicado cria um app diferente na loja e mata as atualizações de quem já instalou. Como `android/` e `ios/` ainda não existem no repositório, nada foi publicado — depois seria irreversível.
*   **O que NÃO mudou, e por quê.** A URL da Vercel: está codificada nos pixels do QR de `public/qr-share.svg` e em links já distribuídos; trocar mata o que já saiu por aí. E a chave `th_schemaVersion`: o prefixo vem de *Translator Hub*, mas ela marca que a migração v1→v2 já rodou — renomear faria todo aparelho instalado parecer "nunca migrado" e a migração re-rodaria sobre dados migrados.
*   ⚠️ **O ícone continua dizendo "tradutor" sem usar palavras.** É um balão de fala com um globo dentro — o pictograma universal de tradução. Não tem letra nenhuma, então o rename não obrigou a mexer, mas a imagem contradiz o nome novo. Fica como assunto à parte.
*   `tests/share.test.tsx` varre o código e as configurações atrás do nome antigo, e confere que as oito formas continuam diferentes entre si. Documentação e testes ficam de fora: lá o nome antigo aparece contando a história, e "Segunda Auditoria Translator Hub" é o nome de uma auditoria, não do app.

### Passada de acabamento (Emil Kowalski): retorno de toque

*   **O diagnóstico foi bom e ruim ao mesmo tempo.** O sistema já estava limpo nos erros grandes que essa escola aponta: zero `transition: all`, zero `ease-in`, zero entrada a partir de `scale(0)`, `hoverOnlyWhenSupported` ligado no Tailwind, movimento reduzido tratado do jeito certo (vira opacidade, não some), e as três curvas custom — `--ease-out`, `--ease-in-out`, `--ease-drawer` — já no `index.css`.
*   **O buraco era um só, e era grande: retorno de toque.** De 129 botões, quase metade não reagia ao dedo. E os que faltavam eram os mais tocados: os dois do cabeçalho de **toda tela dos dez módulos**, o card do catálogo, o botão de áudio de **cada item da lista** (83 dos 140 botões do Supermercado), as linhas das listas de frases de sete módulos, as abas de subcategoria e as duas abas de baixo do catálogo.
*   **A escala é por tamanho de alvo, e isso é o miolo da regra:** `scale-90` em botão só de ícone, `scale-95` em chip, `scale-[0.97]`–`[0.98]` em cartão ou linha de largura inteira. Cinco por cento numa faixa que ocupa a tela toda lê como a tela pulando; num chip de 60px, 5% é sutil.
*   **Exceção declarada:** trilhos de duas posições e abas de modo ficaram de fora. Neles a troca de estado **já é** o retorno — a pastilha branca pula para o outro lado no mesmo instante. Somar escala ali seria animar por animar, que é exatamente o que a escola manda não fazer.
*   **Um caso de conflito de estado:** o botão de busca por voz cresce 10% enquanto ouve. O retorno de toque entrou só no ramo parado, senão as duas escalas brigariam.
*   **Dois achados de brinde, dentro do `TranslationItem`:** a área expansível tinha `tap ease-in-out`, e `.tap` não transiciona `max-height` — a classe não animava nada, e ainda substituía a curva custom pela fraca do Tailwind nas propriedades que ele de fato transiciona. Saiu.
*   **Ficou em aberto, e é o defeito 8.16:** os painéis entram deslizando e saem secos. Animar a saída exige manter o componente montado por uns 200ms depois do fechar, em quatro folhas. É a próxima da lista nessa linha.

### Passada de direção visual: a frase vira o herói

*   **O diagnóstico frio.** O app é fundo cinza-claro, cartões brancos arredondados, e a **pilha de fontes do sistema, sem uma linha de tipografia própria**. É exatamente o visual que qualquer PWA feito com Tailwind produz. E num app cujo produto É a palavra, não ter voz tipográfica é a maior omissão que existe.
*   **O que dava para consertar sem pedir nada a ninguém:** a frase estava em `text-xl` — 20px — em nove dos dez módulos. O herói de toda tela, menor que o corpo de texto de um site de notícias, para um público que lê de óculos, de pé, no corredor do supermercado.
*   **A ideia, e ela é do conteúdo:** o tamanho da frase sai do comprimento da própria frase. Comando curto fica grande e confiante ("Me duele la cabeza." em 30px); especificação longa fica calma e legível. Não dava para só aumentar: a Maquiagem com todas as dimensões escolhidas produz **131 caracteres**, e a 30px isso viraria sete linhas empurrando a tela inteira. Medido na tela: 40 caracteres → 24px, 131 → 18px.
*   **Contar caracteres vale como medida** porque a frase falada é sempre em alfabeto latino — ucraniano, árabe e lituano são `originOnly` e nunca podem ser destino. A glosa, essa sim pode ser cirílica ou árabe, e por isso fica em tamanho fixo: o `index.css` já a aumenta nesses dois idiomas.
*   **O cartão virou um componente só**, `components/PhraseCard.tsx`, com um slot para as variações que existem de verdade: a pergunta do "Onde está?", o preço curto dos Números, o aviso da Maquiagem. Some mais uma duplicação — ElderCare e Limpeza tinham cópias locais idênticas.
*   **Uma tentativa que foi medida e desfeita.** A glosa ganhou `text-white/75` para virar glosa de verdade em vez de segunda frase. Medido: 3,2–3,4:1 sobre a cor dos módulos, **abaixo dos 4,5 exigidos**, e só voltaria a passar perto de 95% de opacidade — que é branco. Voltou ao branco cheio: a hierarquia já está feita pelo tamanho (30 contra 14) e pelo peso, e a opacidade era acessório. Acessório que reprova em contraste sai.
*   ⚠️ **O que fica aberto, e é a maior alavanca que sobrou: o app não tem fonte própria.** Uma face de display resolveria mais do que qualquer outra mudança visual — e há um encaixe bom com a arquitetura: como a frase falada é sempre latina, bastaria um subconjunto **Latin-only** no papel de display, com a pilha do sistema seguindo no corpo e nos alfabetos não latinos. O custo é real e é do usuário: um woff2 auto-hospedado pesa uns 30–80KB num app offline-first feito para telefone barato e dado pré-pago, então é decisão de produto, não de código.

### Recorte do lançamento (temporário, 23/9/2026)

*   **Decisão do dono, para as primeiras pessoas testarem:** "Eu falo" só aceita português do Brasil; "Estou em" só aceita Estados Unidos, França e Espanha — por país, não por idioma: Reino Unido, Chile e Argentina ficam de fora; Supermercado e Farmácia ficam fechados no hub para todo mundo, e por link direto também.
*   **Nada foi tirado.** O que está fora do recorte continua na tela, desativado: bandeira apagada no painel, ladrilho cinza com "Em breve" no hub. Os dados, os módulos e as traduções estão intactos.
*   **Tudo mora em `lancamento.ts`**, em três funções. Para abrir de novo, basta afrouxá-las lá; nenhum outro arquivo guarda a lista.
*   **Escolha salva de antes não se perde.** Quem tinha "Estou em" Itália cai em Espanha enquanto o recorte valer, mas o valor continua gravado e volta sozinho quando o recorte cair — a mesma regra que `useCountryPair` já usava para código desconhecido.
*   `tests/lancamento.test.tsx` tranca o recorte. `tests/voiceUi.test.tsx` o desliga por `vi.mock`, porque testa a regra de voz com destinos que o recorte fecha (Brasil, Itália).

### Próximos passos previstos
*   Etapa 2: Supermercado e Farmácia em `uk`/`ar` (1.333 itens, chaves `ua` e `ma` em cada item). Revisar com falante nativo, especialmente remédios. Farmácia precisa de lista de marcas por país de origem.
*   Trocar o texto fixo "PROIBIDO" nos dados da farmácia por um código neutro (ex.: `BANNED`).
*   Levar o piso de 14px aos outros dez módulos: hoje só Cuidar de idosos e Limpeza da casa o seguem, e os outros somam 120 ocorrências abaixo disso.
*   Revisar com falante nativo o conteúdo dos dois módulos de trabalho, na ordem de risco listada em cada seção acima.
