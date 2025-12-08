<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
          <Icon name="heroicons:user-plus" class="text-amber-600" size="24" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">Colaboradores sem Acesso</h3>
          <p class="text-sm text-gray-600">{{ colaboradoresSemAcesso.length }} colaboradores sem usuário</p>
        </div>
      </div>
      <button 
        @click="expanded = !expanded"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Icon 
          :name="expanded ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" 
          size="20" 
          class="text-gray-600"
        />
      </button>
    </div>

    <div v-if="expanded && colaboradoresSemAcesso.length > 0" class="space-y-2">
      <div 
        v-for="colaborador in colaboradoresSemAcesso" 
        :key="colaborador.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {{ getInitials(colaborador.nome) }}
          </div>
          <div>
            <p class="font-medium text-gray-800">{{ colaborador.nome }}</p>
            <p class="text-xs text-gray-600">
              {{ colaborador.email_corporativo || 'Sem email' }}
              <span v-if="colaborador.cargo" class="ml-2">• {{ colaborador.cargo.nome }}</span>
            </p>
          </div>
        </div>
        <button
          @click="$emit('criar-acesso', colaborador)"
          class="px-3 py-1.5 bg-red-700 text-white text-sm font-medium rounded-lg hover:bg-red-800 transition-colors flex items-center gap-2"
        >
          <Icon name="heroicons:key" size="16" />
          Criar Acesso
        </button>
      </div>
    </div>

    <div v-else-if="expanded" class="text-center py-6 text-gray-500">
      <Icon name="heroicons:check-circle" class="mx-auto mb-2 text-green-500" size="32" />
      <p class="text-sm">Todos os colaboradores ativos têm acesso ao sistema</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  colaboradoresSemAcesso: Array<any>
}>()

defineEmits<{
  'criar-acesso': [colaborador: any]
}>()

const expanded = ref(true)

const getInitials = (nome: string) => {
  const names = nome.split(' ')
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase()
  }
  return (names[0][0] + names[names.length - 1][0]).toUpperCase()
}
</script>
