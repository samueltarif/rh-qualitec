<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[80vh] overflow-y-auto">
      <h3 class="text-xl font-bold text-gray-800 mb-2">Gerenciar Gestores</h3>
      <p class="text-sm text-gray-600 mb-6">Cargo: <strong>{{ cargo?.nome }}</strong></p>

      <!-- Gestores Vinculados -->
      <div class="mb-6">
        <h4 class="font-semibold text-gray-800 mb-3">Gestores Vinculados</h4>
        <div v-if="cargo?.gestores && cargo.gestores.length > 0" class="space-y-2">
          <div v-for="gestor in cargo.gestores" :key="gestor.id" class="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {{ getInitials(gestor.colaborador?.nome || '') }}
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ gestor.colaborador?.nome }}</p>
                <p class="text-xs text-gray-500">{{ gestor.colaborador?.email_corporativo || '-' }}</p>
              </div>
            </div>
            <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remover" @click="$emit('remove', gestor.id)">
              <Icon name="heroicons:x-mark" size="18" />
            </button>
          </div>
        </div>
        <div v-else class="text-center py-6 text-gray-500">
          <Icon name="heroicons:user-group" class="mx-auto mb-2 text-gray-300" size="48" />
          <p>Nenhum gestor vinculado</p>
        </div>
      </div>

      <!-- Adicionar Gestor -->
      <div class="mb-6">
        <h4 class="font-semibold text-gray-800 mb-3">Adicionar Gestor</h4>
        <div class="flex gap-3">
          <UISelect v-model="selectedId" class="flex-1" :disabled="loadingColaboradores">
            <option value="">{{ loadingColaboradores ? 'Carregando...' : 'Selecione um funcionário' }}</option>
            <option v-for="col in colaboradores" :key="col.id" :value="col.id">{{ col.nome }}</option>
          </UISelect>
          <UIButton theme="admin" variant="primary" icon-left="heroicons:plus" :disabled="!selectedId || saving" @click="handleAdd">
            {{ saving ? 'Adicionando...' : 'Adicionar' }}
          </UIButton>
        </div>
      </div>

      <div class="flex justify-end">
        <UIButton theme="admin" variant="secondary" @click="$emit('close')">Fechar</UIButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  cargo: { id: string; nome: string; gestores?: Array<{ id: string; colaborador?: { nome: string; email_corporativo?: string } }> } | null
  colaboradores: Array<{ id: string; nome: string }>
  loadingColaboradores: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  close: []
  add: [colaboradorId: string]
  remove: [gestorId: string]
}>()

const selectedId = ref('')

const getInitials = (nome: string) => {
  if (!nome) return '?'
  const names = nome.split(' ')
  return names.length === 1 ? names[0].substring(0, 2).toUpperCase() : (names[0][0] + names[names.length - 1][0]).toUpperCase()
}

const handleAdd = () => {
  if (selectedId.value) {
    emit('add', selectedId.value)
    selectedId.value = ''
  }
}
</script>
