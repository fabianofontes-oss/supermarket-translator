
# 📘 Manual do Imigrante (Translator Hub) - Contexto do Projeto

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

### Próximos passos previstos
*   Etapa 2: Supermercado e Farmácia em `uk`/`ar` (1.333 itens, chaves `ua` e `ma` em cada item). Revisar com falante nativo, especialmente remédios. Farmácia precisa de lista de marcas por país de origem.
*   Trocar o texto fixo "PROIBIDO" nos dados da farmácia por um código neutro (ex.: `BANNED`).
