<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-800">{{ isEditing ? 'Editar Colaborador' : 'Novo Colaborador' }}</h3>
        <button class="p-2 hover:bg-gray-100 rounded-lg" @click="$emit('close')">
          <Icon name="heroicons:x-mark" size="24" />
        </button>
      </div>

      <form class="p-6" @submit.prevent="$emit('submit')">
        <!-- Tabs -->
        <div class="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          <button type="button" v-for="tab in tabs" :key="tab.id"
            class="px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
            :class="activeTab === tab.id ? 'border-red-700 text-red-700' : 'border-transparent text-gray-500 hover:text-gray-700'"
            @click="$emit('update:active-tab', tab.id)">
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Contents -->
        <colaborador-form-resumo v-show="activeTab === 'resumo'" :form="form" :cargos="cargos" :departamentos="departamentos" :gestores="gestores" />
        <colaborador-form-dados-pessoais v-show="activeTab === 'pessoais'" :model-value="form" @update:model-value="$emit('update:form', $event)" />
        <colaborador-form-acesso v-show="activeTab === 'acesso'" :model-value="form" @update:model-value="$emit('update:form', $event)" />
        <colaborador-form-documentos v-show="activeTab === 'documentos'" :model-value="form" @update:model-value="$emit('update:form', $event)" />
        <colaborador-form-profissional v-show="activeTab === 'profissionais'" :model-value="form" @update:model-value="$emit('update:form', $event)" :cargos="cargos" :departamentos="departamentos" :gestores="gestores" :jornadas="jornadas" />
        <colaborador-form-endereco v-show="activeTab === 'endereco'" :model-value="form" @update:model-value="$emit('update:form', $event)" :buscando-cep="buscandoCep" @buscar-cep="$emit('buscar-cep')" />
        <colaborador-form-bancario v-show="activeTab === 'bancarios'" :model-value="form" @update:model-value="$emit('update:form', $event)" />
        <colaborador-form-beneficios v-show="activeTab === 'beneficios'" :model-value="form" @update:model-value="$emit('update:form', $event)" />
        <colaborador-form-emergencia v-show="activeTab === 'emergencia'" :model-value="form" @update:model-value="$emit('update:form', $event)" />
        <colaborador-form-observacoes v-show="activeTab === 'observacoes'" :model-value="form" @update:model-value="$emit('update:form', $event)" />

        <!-- Botões -->
        <div class="flex gap-3 mt-8 pt-6 border-t border-gray-200">
          <UIButton type="button" theme="admin" variant="secondary" full-width @click="$emit('close')">Cancelar</UIButton>
          <UIButton type="submit" theme="admin" variant="primary" full-width :disabled="saving">
            {{ saving ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Colaborador') }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isEditing: boolean
  form: Record<string, any>
  saving: boolean
  activeTab: string
  cargos: Array<{ id: string; nome: string; nivel: string }>
  departamentos: Array<{ id: string; nome: string }>
  gestores: Array<{ id: string; nome: string }>
  jornadas: Array<{ id: string; nome: string; tipo: string }>
  buscandoCep: boolean
}>()

defineEmits<{
  close: []
  submit: []
  'update:form': [value: Record<string, any>]
  'update:active-tab': [value: string]
  'buscar-cep': []
}>()

const tabs = [
  { id: 'resumo', label: '📋 Resumo' },
  { id: 'pessoais', label: 'Dados Pessoais' },
  { id: 'acesso', label: '🔑 Acesso ao Sistema' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'profissionais', label: 'Profissionais' },
  { id: 'endereco', label: 'Endereço' },
  { id: 'bancarios', label: 'Dados Bancários' },
  { id: 'beneficios', label: 'Benefícios' },
  { id: 'emergencia', label: 'Contato Emergência' },
  { id: 'observacoes', label: 'Observações RH' },
]
</script>
