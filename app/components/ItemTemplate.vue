<template>
  <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <h4 class="font-semibold text-gray-800 mb-1">{{ template.nome }}</h4>
        <p class="text-sm text-gray-600 mb-2">{{ template.descricao }}</p>
        <div class="flex items-center gap-3 text-xs text-gray-500">
          <span class="flex items-center gap-1">
            <Icon name="heroicons:tag" size="14" />
            {{ formatarTipo(template.tipo_entidade) }}
          </span>
          <span class="flex items-center gap-1">
            <Icon name="heroicons:document" size="14" />
            {{ template.formato?.toUpperCase() }}
          </span>
          <span class="flex items-center gap-1">
            <Icon name="heroicons:list-bullet" size="14" />
            {{ template.campos_mapeamento?.length || 0 }} campos
          </span>
        </div>
      </div>
      <span class="px-2 py-1 text-xs font-medium rounded-full" :class="template.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
        {{ template.ativo ? 'Ativo' : 'Inativo' }}
      </span>
    </div>

    <div class="flex gap-2">
      <UIButton @click="$emit('editar', template)" theme="admin" variant="secondary" size="sm" class="flex-1">
        <Icon name="heroicons:pencil" class="mr-1" size="14" />Editar
      </UIButton>
      <UIButton @click="$emit('baixar', template)" theme="admin" variant="secondary" size="sm" class="flex-1">
        <Icon name="heroicons:arrow-down-tray" class="mr-1" size="14" />Baixar
      </UIButton>
      <button @click="$emit('excluir', template.id)" class="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
        <Icon name="heroicons:trash" size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  template: {
    id: string
    nome: string
    descricao: string
    tipo_entidade: string
    formato: string
    campos_mapeamento: any[]
    ativo: boolean
  }
}>()

defineEmits<{
  editar: [template: any]
  baixar: [template: any]
  excluir: [id: string]
}>()

const formatarTipo = (tipo: string) => {
  const tipos: Record<string, string> = {
    colaboradores: 'Colaboradores', usuarios: 'Usuários', ferias: 'Férias',
    documentos: 'Documentos', ponto: 'Ponto', folha: 'Folha',
  }
  return tipos[tipo] || tipo
}
</script>
