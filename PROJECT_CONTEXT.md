
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
