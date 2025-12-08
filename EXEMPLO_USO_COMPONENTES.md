# 📘 Guia de Uso dos Componentes - Exemplos Práticos

## 🎯 Exemplo Completo: Página de Ponto

### Estrutura Visual da Página

```
┌─────────────────────────────────────────────────────────────┐
│  CardHorasTrabalhadasHeader                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🕐  Horas Trabalhadas Hoje: 5h38                     │  │
│  │      • Contagem em tempo real                         │  │
│  │      Entrada: 07:30:00  |  Intervalo: 12:00-13:15    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CardRegistroPonto                                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  👆 Registro de Ponto              [Bater Ponto] 🟧  │  │
│  │     sexta-feira, 05 de dezembro de 2025 às 14:22     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TabNavigation                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [Meu Ponto] [Solicitações] [Documentos] [Comunicados]│  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  FilterBar                                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Mês: [Dezembro ▼]  Ano: [2025 ▼]  [🔍 Buscar]      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TablePonto                                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ DATA  │ ENTRADA │ INT.ENT │ INT.SAÍ │ SAÍDA │ TOTAL  │  │
│  ├───────┼─────────┼─────────┼─────────┼───────┼────────┤  │
│  │ 05/12 │  07:30  │  12:00  │  13:15  │ --:-- │ 5h38   │  │
│  │       │         │         │         │       │ Normal │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Grid de CardResumo (4 colunas)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Dias     │ │ Horas    │ │ Intervalo│ │ Faltas   │     │
│  │ Trab.    │ │ Trab.    │ │          │ │          │     │
│  │    1     │ │   5h38   │ │   1h15   │ │    0     │     │
│  │  (azul)  │ │ (verde)  │ │(amarelo) │ │(vermelho)│     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Código da Página Completa

```vue
<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- 1. Header Verde com Horas -->
      <CardHorasTrabalhadasHeader
        titulo="Horas Trabalhadas Hoje"
        :horas="horasTrabalhadas.horas"
        :minutos="horasTrabalhadas.minutos"
        :entrada="registroAtual.entrada"
        :intervalo="registroAtual.intervalo"
        :tempo-real="true"
        mensagem-tempo-real="Contagem em tempo real"
      />

      <!-- 2. Card de Registro -->
      <CardRegistroPonto
        titulo="Registro de Ponto"
        :subtitulo="dataAtualFormatada"
        texto-botao="Bater Ponto"
        @bater-ponto="handleBaterPonto"
      />

      <!-- 3. Navegação por Abas -->
      <TabNavigation
        :tabs="tabs"
        :model-value="abaAtiva"
        @change="abaAtiva = $event"
      />

      <!-- 4. Conteúdo da Aba "Meu Ponto" -->
      <div v-if="abaAtiva === 'meu-ponto'">
        
        <!-- 4.1 Filtros -->
        <FilterBar
          v-model:mes="filtros.mes"
          v-model:ano="filtros.ano"
          @buscar="buscarRegistros"
        />

        <!-- 4.2 Tabela -->
        <div class="mt-6">
          <TablePonto :registros="registros" />
        </div>

        <!-- 4.3 Cards de Resumo -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <CardResumo
            titulo="Dias Trabalhados"
            :valor="resumo.diasTrabalhados"
            variant="blue"
          />
          <CardResumo
            titulo="Horas Trabalhadas"
            :valor="resumo.horasTrabalhadas"
            variant="green"
          />
          <CardResumo
            titulo="Intervalo"
            :valor="resumo.intervalo"
            variant="yellow"
          />
          <CardResumo
            titulo="Faltas"
            :valor="resumo.faltas"
            variant="red"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
// Estado reativo
const abaAtiva = ref('meu-ponto')
const filtros = ref({ mes: '12', ano: '2025' })

const horasTrabalhadas = ref({ horas: 5, minutos: 38 })
const registroAtual = ref({
  entrada: '07:30:00',
  intervalo: '12:00:00 - 13:15:00'
})

const resumo = ref({
  diasTrabalhados: '1',
  horasTrabalhadas: '5h38',
  intervalo: '1h15',
  faltas: '0'
})

const registros = ref([
  {
    data: 'sex., 05/12',
    entrada: '07:30',
    intervaloEntrada: '12:00',
    intervaloSaida: '13:15',
    saida: '--:--',
    total: '5h38',
    status: 'normal' as const,
    statusMensagem: 'Contagem em tempo real'
  }
])

// Configuração das abas
const tabs = [
  { id: 'meu-ponto', label: 'Meu Ponto', icon: IconFingerprint },
  { id: 'solicitacoes', label: 'Solicitações', icon: IconDocument },
  { id: 'documentos', label: 'Documentos', icon: IconDocument },
  { id: 'comunicados', label: 'Comunicados', icon: IconBell },
  { id: 'perfil', label: 'Meu Perfil', icon: IconUser }
]

// Computed
const dataAtualFormatada = computed(() => {
  const now = new Date()
  return `sexta-feira, ${now.getDate()} de dezembro de ${now.getFullYear()} às ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
})

// Métodos
const handleBaterPonto = () => {
  console.log('Registrando ponto...')
  // Chamar API de registro
}

const buscarRegistros = () => {
  console.log('Buscando registros:', filtros.value)
  // Chamar API de busca
}
</script>
```

---

## 🔧 Exemplos de Uso Individual

### 1. CardHorasTrabalhadasHeader

```vue
<!-- Exemplo básico -->
<CardHorasTrabalhadasHeader
  :horas="8"
  :minutos="30"
  entrada="08:00:00"
  intervalo="12:00:00 - 13:00:00"
/>

<!-- Com tempo real desativado -->
<CardHorasTrabalhadasHeader
  :horas="8"
  :minutos="0"
  entrada="08:00:00"
  intervalo="12:00:00 - 13:00:00"
  :tempo-real="false"
/>

<!-- Customizado -->
<CardHorasTrabalhadasHeader
  titulo="Horas do Mês"
  :horas="160"
  :minutos="45"
  entrada="Variável"
  intervalo="1h por dia"
  label-entrada="Primeira entrada"
  label-intervalo="Média de intervalo"
/>
```

### 2. CardRegistroPonto

```vue
<!-- Padrão -->
<CardRegistroPonto @bater-ponto="registrar" />

<!-- Customizado -->
<CardRegistroPonto
  titulo="Marcar Presença"
  subtitulo="Clique para registrar sua entrada"
  texto-botao="Registrar Agora"
  @bater-ponto="handleRegistro"
/>
```

### 3. TabNavigation

```vue
<!-- Com ícones -->
<TabNavigation
  :tabs="[
    { id: 'tab1', label: 'Ponto', icon: IconClock },
    { id: 'tab2', label: 'Perfil', icon: IconUser }
  ]"
  v-model="abaAtiva"
  @change="handleTabChange"
/>

<!-- Sem ícones -->
<TabNavigation
  :tabs="[
    { id: 'tab1', label: 'Visão Geral' },
    { id: 'tab2', label: 'Detalhes' },
    { id: 'tab3', label: 'Histórico' }
  ]"
  v-model="abaAtiva"
/>
```

### 4. FilterBar

```vue
<!-- Padrão -->
<FilterBar
  v-model:mes="mes"
  v-model:ano="ano"
  @buscar="buscar"
/>

<!-- Com anos customizados -->
<FilterBar
  v-model:mes="mes"
  v-model:ano="ano"
  :anos="['2020', '2021', '2022', '2023', '2024', '2025']"
  @buscar="buscar"
/>
```

### 5. TablePonto

```vue
<!-- Tabela completa -->
<TablePonto
  :registros="[
    {
      data: 'seg., 01/12',
      entrada: '08:00',
      intervaloEntrada: '12:00',
      intervaloSaida: '13:00',
      saida: '17:00',
      total: '8h00',
      status: 'normal'
    },
    {
      data: 'ter., 02/12',
      entrada: '08:15',
      intervaloEntrada: '12:00',
      intervaloSaida: '13:00',
      saida: '17:00',
      total: '7h45',
      status: 'alerta',
      statusMensagem: 'Entrada atrasada'
    }
  ]"
/>

<!-- Tabela vazia -->
<TablePonto :registros="[]" />
```

### 6. StatusBadge

```vue
<!-- Normal -->
<StatusBadge status="normal" />

<!-- Com mensagem -->
<StatusBadge 
  status="alerta" 
  mensagem="Segundo intervalo incompleto" 
/>

<!-- Falta -->
<StatusBadge 
  status="falta" 
  mensagem="Falta horário de retorno" 
/>
```

### 7. CardResumo

```vue
<!-- Grid de resumos -->
<div class="grid grid-cols-4 gap-4">
  <CardResumo
    titulo="Total de Horas"
    valor="160h"
    variant="blue"
  />
  <CardResumo
    titulo="Horas Extras"
    valor="12h30"
    variant="green"
  />
  <CardResumo
    titulo="Atrasos"
    valor="2h15"
    variant="yellow"
  />
  <CardResumo
    titulo="Faltas"
    valor="3"
    variant="red"
  />
</div>
```

### 8. Ícones

```vue
<!-- Tamanhos diferentes -->
<IconClock class="w-4 h-4" />
<IconClock class="w-6 h-6" />
<IconClock class="w-8 h-8" />

<!-- Com cores -->
<IconClock class="w-6 h-6 text-blue-500" />
<IconBell class="w-6 h-6 text-yellow-500" />
<IconUser class="w-6 h-6 text-green-500" />

<!-- Em botões -->
<button class="flex items-center space-x-2">
  <IconFingerprint class="w-5 h-5" />
  <span>Registrar</span>
</button>
```

---

## 🎨 Variantes de Cores

### CardResumo Variants

```vue
<!-- Azul - Informação -->
<CardResumo variant="blue" titulo="Info" valor="100" />

<!-- Verde - Sucesso -->
<CardResumo variant="green" titulo="Sucesso" valor="95%" />

<!-- Amarelo - Atenção -->
<CardResumo variant="yellow" titulo="Atenção" valor="5" />

<!-- Vermelho - Erro/Alerta -->
<CardResumo variant="red" titulo="Crítico" valor="2" />
```

### StatusBadge Status

```vue
<!-- Verde - Normal -->
<StatusBadge status="normal" />

<!-- Amarelo - Alerta -->
<StatusBadge status="alerta" />

<!-- Vermelho - Falta -->
<StatusBadge status="falta" />
```

---

## 🚀 Dicas de Uso

### 1. Responsividade

```vue
<!-- Grid responsivo -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <CardResumo ... />
  <CardResumo ... />
  <CardResumo ... />
  <CardResumo ... />
</div>
```

### 2. Espaçamento

```vue
<!-- Container com espaçamento -->
<div class="space-y-6">
  <CardHorasTrabalhadasHeader ... />
  <CardRegistroPonto ... />
  <TabNavigation ... />
</div>
```

### 3. Loading States

```vue
<!-- Adicione loading aos componentes -->
<TablePonto 
  v-if="!loading"
  :registros="registros" 
/>
<div v-else class="text-center py-8">
  <p>Carregando...</p>
</div>
```

### 4. Tratamento de Erros

```vue
<TablePonto 
  v-if="!error"
  :registros="registros" 
/>
<div v-else class="bg-red-50 p-4 rounded">
  <p class="text-red-800">{{ error }}</p>
</div>
```

---

## 📱 Exemplo Mobile-First

```vue
<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <div class="max-w-7xl mx-auto space-y-4 md:space-y-6">
      
      <!-- Header responsivo -->
      <CardHorasTrabalhadasHeader
        class="text-sm md:text-base"
        :horas="5"
        :minutos="38"
      />

      <!-- Grid responsivo -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <CardResumo titulo="Dias" valor="1" variant="blue" />
        <CardResumo titulo="Horas" valor="5h38" variant="green" />
        <CardResumo titulo="Intervalo" valor="1h15" variant="yellow" />
        <CardResumo titulo="Faltas" valor="0" variant="red" />
      </div>

      <!-- Tabela com scroll horizontal em mobile -->
      <div class="overflow-x-auto">
        <TablePonto :registros="registros" />
      </div>

    </div>
  </div>
</template>
```

---

## ✅ Checklist de Implementação

- [ ] Importar componentes necessários
- [ ] Configurar estado reativo
- [ ] Implementar handlers de eventos
- [ ] Adicionar tratamento de erros
- [ ] Testar responsividade
- [ ] Validar acessibilidade
- [ ] Otimizar performance
- [ ] Documentar uso específico

---

Todos os componentes estão prontos para uso! 🎉
