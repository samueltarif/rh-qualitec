<template>
  <UIModal v-model="isOpen" size="2xl">
    <template #header>
      <div>
        <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Icon name="heroicons:gift" class="text-blue-700" size="24" />
          Gerar 13º Salário
        </h3>
        <p class="text-sm text-gray-500 mt-1">Selecione os colaboradores e a parcela do 13º salário</p>
      </div>
    </template>

    <div class="space-y-6">
      <Modal13SalarioFiltros v-model:parcela="filtros.parcela" v-model:ano="filtros.ano" />

      <div v-if="loading" class="text-center py-8">
        <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-3" size="40" />
        <p class="text-gray-600">Carregando colaboradores...</p>
      </div>

      <div v-else-if="colaboradores.length > 0" class="space-y-4">
        <Modal13SalarioAcoesMassa 
          :todos-selecionados="todosSelecionados"
          :total-selecionados="colaboradoresSelecionados.length"
          :total-colaboradores="colaboradores.length"
          :mostrar-filtros="mostrarFiltros"
          v-model:busca="busca"
          v-model:filtro-status="filtroStatus"
          @toggle-todos="toggleTodos"
          @toggle-filtros="mostrarFiltros = !mostrarFiltros"
        />

        <Modal13SalarioTabela 
          :colaboradores="colaboradoresFiltrados"
          :selecionados="selecionados"
          :todos-selecionados="todosSelecionados"
          :parcela="filtros.parcela"
          @toggle-colaborador="toggleColaborador"
          @toggle-todos="toggleTodos"
        />

        <Modal13SalarioResumo 
          :total-selecionados="colaboradoresSelecionados.length"
          :valor-total="totalSelecionados"
          :parcela="filtros.parcela"
        />
      </div>

      <UIEmptyState 
        v-else
        icon="heroicons:users"
        title="Nenhum colaborador encontrado"
        description="Não há colaboradores ativos para gerar 13º salário"
      />
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <UIButton theme="admin" variant="secondary" @click="fechar">Cancelar</UIButton>
        <div class="flex gap-3">
          <UIButton 
            theme="admin" 
            variant="success" 
            icon-left="heroicons:document-text"
            @click="handleGerarHolerites"
            :disabled="colaboradoresSelecionados.length === 0 || gerando"
          >
            {{ gerando ? 'Gerando...' : 'Gerar Holerites' }}
          </UIButton>
          <UIButton 
            theme="admin" 
            variant="primary" 
            icon-left="heroicons:envelope"
            @click="handleGerarEEnviar"
            :disabled="colaboradoresSelecionados.length === 0 || gerando"
          >
            {{ gerando ? 'Processando...' : 'Gerar e Enviar por Email' }}
          </UIButton>
        </div>
      </div>
    </template>
  </UIModal>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; 'sucesso': [] }>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const {
  loading, gerando, colaboradores, selecionados, mostrarFiltros, busca, filtroStatus, filtros,
  colaboradoresFiltrados, colaboradoresSelecionados, todosSelecionados, totalSelecionados,
  toggleColaborador, toggleTodos, carregarColaboradores, gerarHolerites, gerarEEnviar, resetar,
} = useModal13Salario()

const handleGerarHolerites = async () => {
  if (await gerarHolerites()) {
    emit('sucesso')
    fechar()
  }
}

const handleGerarEEnviar = async () => {
  if (await gerarEEnviar()) {
    emit('sucesso')
    fechar()
  }
}

const fechar = () => {
  isOpen.value = false
  resetar()
}

watch(isOpen, (value) => { if (value) carregarColaboradores() })
</script>
