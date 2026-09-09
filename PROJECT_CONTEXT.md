
# 📘 Manual do Imigrante (Translator Hub) - Contexto do Projeto

**IMPORTANTE:** Cole este arquivo no início de um novo chat para restaurar o contexto do desenvolvimento.

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
*   Áudio usa só a voz do sistema (`speechSynthesis`), sem endpoint não oficial do Google.
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
*   Nenhum dos três depende do catálogo: funcionam em ucraniano e árabe.

### Próximos passos previstos
*   Etapa 2: Supermercado e Farmácia em `uk`/`ar` (1.351 itens, chaves `ua` e `ma` em cada item). Revisar com falante nativo, especialmente remédios. Farmácia precisa de lista de marcas por país de origem.
*   Trocar o texto fixo "PROIBIDO" nos dados da farmácia por um código neutro (ex.: `BANNED`).
