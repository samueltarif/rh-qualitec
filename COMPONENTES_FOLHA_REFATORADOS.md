# 📦 Componentes de Folha de Pagamento - Refatorados

## 🎯 Visão Geral

Sistema modular de componentes para gerenciamento de folha de pagamento, com separação clara de responsabilidades e alta reutilização.

---

## 📁 Estrutura de Componentes

### 1. **FolhaDetalhamentoColaboradores** ⭐ NOVO
**Arquivo**: `app/components/FolhaDetalhamentoColaboradores.vue`

Tabela completa de detalhamento por colaborador com:
- ✅ Exibição de todos os dados da folha
- ✅ Formatação de valores (moeda e CPF)
- ✅ Linha de totais
- ✅ Botões de ação (Editar, Gerar, Email)
- ✅ Exportação para Excel
- ✅ Estados de loading individuais

**Uso**:
```vue
<FolhaDetalhamentoColaboradores 
  :folha="folha.folha"
  :totais="folha.totais"
  :mes="filtros.mes"
  :ano="filtros.ano"
  :loading-acoes="loadingAcoes"
  :loading-emails="loadingEmails"
  @editar="abrirModalEdicao"
  @gerar-holerite="gerarHoleriteIndividual"
  @enviar-email="enviarHoleritePorEmail"
/>
```

**Documentação**: `COMPONENTE_DETALHAMENTO_COLABORADORES.md`

---

### 2. **FolhaResumoDetalhadoCard**
**Arquivo**: `app/components/FolhaResumoDetalhadoCard.vue`

Card com resumo detalhado dos totais da folha:
- Total de proventos
- Total de descontos
- Salário líquido
- FGTS
- Custo total da empresa

**Uso**:
```vue
<FolhaResumoDetalhadoCard 
  :titulo="`${nomeMes(mes)}/${ano}`"
  :totais="folha.totais"
  mostrar-detalhes
/>
```

---

### 3. **FolhaAcoesRapidasCalculos**
**Arquivo**: `app/components/FolhaAcoesRapidasCalculos.vue`

Botões de ações rápidas para cálculos especiais:
- Adiantamento salarial
- 13º salário
- Rescisão contratual
- Férias

**Uso**:
```vue
<FolhaAcoesRapidasCalculos 
  @abrir-modal-adiantamento="abrirModalAdiantamento"
  @abrir-modal-13-salario="abrirModal13Salario"
  @abrir-modal-rescisao="abrirModalRescisao"
/>
```

---

### 4. **FolhaDadosColaboradorSection**
**Arquivo**: `app/components/FolhaDadosColaboradorSection.vue`

Seção com dados básicos do colaborador no modal de edição:
- Nome e CPF
- Cargo
- Salário base
- Dependentes
- Horas contratadas

**Uso**:
```vue
<FolhaDadosColaboradorSection :dados="modalEdicao.dados" />
```

---

### 5. **FolhaBeneficiosSection**
**Arquivo**: `app/components/FolhaBeneficiosSection.vue`

Formulário de benefícios com v-model:
- Vale transporte
- Vale refeição
- Vale alimentação
- Plano de saúde
- Plano odontológico
- Seguro de vida
- Auxílios diversos

**Uso**:
```vue
<FolhaBeneficiosSection 
  v-model="beneficiosData"
  @change="recalcularResumo"
/>
```

---

## 🔄 Fluxo de Dados

### Página Principal → Componentes
```
folha-pagamento.vue
  ├─ FolhaResumoDetalhadoCard (totais)
  ├─ FolhaAcoesRapidasCalculos (eventos)
  └─ FolhaDetalhamentoColaboradores (folha + eventos)
       ├─ Tabela de colaboradores
       ├─ Botões de ação
       └─ Exportação Excel
```

### Modal de Edição → Componentes
```
Modal de Edição
  ├─ FolhaDadosColaboradorSection (dados básicos)
  ├─ Formulário de Proventos
  ├─ Formulário de Descontos
  ├─ FolhaBeneficiosSection (benefícios)
  └─ Resumo em Tempo Real
```

---

## 📊 Tipos de Dados

### ColaboradorFolha
```typescript
interface ColaboradorFolha {
  colaborador_id: number
  nome: string
  cpf: string
  salario_bruto: number
  inss: number
  irrf: number
  adiantamento?: number
  fgts: number
  total_descontos: number
  salario_liquido: number
}
```

### TotaisFolha
```typescript
interface TotaisFolha {
  total_colaboradores: number
  total_salario_bruto: number
  total_inss: number
  total_irrf: number
  total_adiantamento?: number
  total_fgts: number
  total_descontos: number
  total_salario_liquido: number
  custo_empresa: number
}
```

---

## 🎨 Padrões de Design

### 1. **Componentes Apresentacionais**
- Recebem dados via props
- Emitem eventos para ações
- Não fazem chamadas de API
- Focados em UI/UX

### 2. **Componentes Inteligentes**
- Gerenciam estado
- Fazem chamadas de API
- Coordenam componentes filhos
- Exemplo: `folha-pagamento.vue`

### 3. **Composição**
- Componentes pequenos e focados
- Reutilizáveis em diferentes contextos
- Fácil de testar isoladamente

---

## 🚀 Benefícios da Arquitetura

### ✅ Manutenibilidade
- Código organizado e modular
- Fácil localizar e corrigir bugs
- Alterações isoladas

### ✅ Reutilização
- Componentes usados em múltiplas páginas
- Menos código duplicado
- Consistência visual

### ✅ Testabilidade
- Componentes isolados
- Testes unitários simples
- Mocks facilitados

### ✅ Performance
- Renderização otimizada
- Loading states granulares
- Lazy loading possível

### ✅ Escalabilidade
- Fácil adicionar novos componentes
- Fácil adicionar novas features
- Arquitetura preparada para crescimento

---

## 📝 Exemplo Completo

### Página de Folha de Pagamento
```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header>...</header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Filtros -->
      <div class="card mb-8">...</div>

      <!-- Loading -->
      <div v-if="loading">...</div>

      <!-- Resultado -->
      <template v-else-if="folha">
        <!-- Cards de Totais -->
        <div class="grid md:grid-cols-4 gap-6 mb-8">...</div>

        <!-- Resumo Detalhado -->
        <FolhaResumoDetalhadoCard 
          :titulo="`${nomeMes(filtros.mes)}/${filtros.ano}`"
          :totais="folha.totais"
          mostrar-detalhes
          class="mb-8"
        />

        <!-- Ações Rápidas -->
        <FolhaAcoesRapidasCalculos 
          @abrir-modal-adiantamento="abrirModalAdiantamento"
          @abrir-modal-13-salario="abrirModal13Salario"
          @abrir-modal-rescisao="abrirModalRescisao"
          class="mb-8"
        />

        <!-- Tabela de Colaboradores -->
        <FolhaDetalhamentoColaboradores 
          :folha="folha.folha"
          :totais="folha.totais"
          :mes="filtros.mes"
          :ano="filtros.ano"
          :loading-acoes="loadingAcoes"
          :loading-emails="loadingEmails"
          @editar="abrirModalEdicao"
          @gerar-holerite="gerarHoleriteIndividual"
          @enviar-email="enviarHoleritePorEmail"
        />

        <!-- Observações -->
        <div class="card mt-8">...</div>
      </template>

      <!-- Empty State -->
      <div v-else>...</div>
    </div>

    <!-- Modals -->
    <Modal13Salario v-model="modal13Aberto" />
    <ModalAdiantamento :show="modalAdiantamento.aberto" />
    <ModalGerenciarHolerites v-model="modalGerenciarHolerites" />
    <UIModal v-model="modalEdicao.aberto">...</UIModal>
  </div>
</template>

<script setup lang="ts">
// Lógica da página
// Gerenciamento de estado
// Chamadas de API
// Handlers de eventos
</script>
```

---

## 🔧 Próximos Passos

### Melhorias Planejadas

1. **Filtros Avançados**
   - Busca por nome/CPF
   - Filtro por faixa salarial
   - Ordenação por colunas

2. **Paginação**
   - Para folhas grandes
   - Controle de itens por página

3. **Seleção Múltipla**
   - Checkbox para seleção
   - Ações em lote

4. **Visualizações Alternativas**
   - Modo cards (mobile)
   - Modo compacto
   - Gráficos e dashboards

5. **Exportações Adicionais**
   - PDF com layout profissional
   - CSV para importação
   - JSON para APIs

---

## 📚 Documentação Relacionada

- `COMPONENTE_DETALHAMENTO_COLABORADORES.md` - Detalhes do novo componente
- `COMPONENTES_FOLHA_PAGAMENTO.md` - Visão geral dos componentes
- `COMPONENTE_BENEFICIOS_FOLHA.md` - Componente de benefícios
- `COMPONENTE_DADOS_COLABORADOR_FOLHA.md` - Componente de dados

---

## ✅ Status da Refatoração

- [x] Criar FolhaDetalhamentoColaboradores
- [x] Refatorar página principal
- [x] Mover função exportarExcel
- [x] Testar funcionalidades
- [x] Documentar componente
- [x] Verificar erros de sintaxe
- [ ] Adicionar testes unitários
- [ ] Adicionar storybook
- [ ] Otimizar performance

---

**Data**: 07/12/2024  
**Status**: ✅ Refatoração Concluída  
**Versão**: 2.0
