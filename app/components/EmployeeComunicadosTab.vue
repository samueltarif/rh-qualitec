<template>
  <div>
    <!-- Lista de Comunicados -->
    <div v-if="comunicados.length > 0" class="space-y-4">
      <div
        v-for="com in comunicados"
        :key="com.id"
        :class="[
          'border rounded-xl p-4 transition-all cursor-pointer',
          com.lido 
            ? 'bg-white border-slate-200 hover:shadow-md' 
            : 'bg-amber-50 border-amber-200 hover:shadow-md'
        ]"
        @click="abrirComunicado(com)"
      >
        <div class="flex items-start gap-4">
          <div :class="[
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            getTipoClass(com.tipo)
          ]">
            <Icon :name="getTipoIcon(com.tipo)" size="20" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span :class="getTipoBadgeClass(com.tipo)" class="px-2 py-0.5 text-xs font-medium rounded-full">
                {{ getTipoLabel(com.tipo) }}
              </span>
              <span v-if="!com.lido" class="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500 text-white">
                Novo
              </span>
            </div>
            <h4 class="font-semibold text-slate-800">{{ com.titulo }}</h4>
            <p class="text-sm text-slate-600 mt-1 line-clamp-2">{{ com.conteudo }}</p>
            <p class="text-xs text-slate-400 mt-2">
              Publicado por {{ com.publicado?.nome || 'RH' }} em {{ formatDate(com.data_publicacao) }}
            </p>
          </div>
          <Icon name="heroicons:chevron-right" class="text-slate-400 flex-shrink-0" size="20" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <Icon name="heroicons:bell" class="text-slate-300 mx-auto" size="48" />
      <p class="text-slate-500 mt-2">Nenhum comunicado disponível</p>
      <p class="text-sm text-slate-400 mt-1">Os comunicados da empresa aparecerão aqui</p>
    </div>

    <!-- Modal de Comunicado -->
    <UIModal v-model="showModal" :title="comunicadoSelecionado?.titulo || 'Comunicado'" size="lg">
      <div v-if="comunicadoSelecionado">
        <div class="flex items-center gap-2 mb-4">
          <span :class="getTipoBadgeClass(comunicadoSelecionado.tipo)" class="px-2 py-1 text-xs font-medium rounded-full">
            {{ getTipoLabel(comunicadoSelecionado.tipo) }}
          </span>
          <span class="text-sm text-slate-500">
            {{ formatDate(comunicadoSelecionado.data_publicacao) }}
          </span>
        </div>
        <div class="prose prose-slate max-w-none">
          <p class="whitespace-pre-wrap">{{ comunicadoSelecionado.conteudo }}</p>
        </div>
        <div class="mt-6 pt-4 border-t border-slate-200">
          <p class="text-sm text-slate-500">
            Publicado por {{ comunicadoSelecionado.publicado?.nome || 'RH' }}
          </p>
        </div>
      </div>
      <template #footer>
        <button @click="showModal = false" class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
          Fechar
        </button>
      </template>
    </UIModal>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  comunicados: any[]
}>()

const emit = defineEmits<{
  ler: [id: string]
}>()

const showModal = ref(false)
const comunicadoSelecionado = ref<any>(null)

const abrirComunicado = (com: any) => {
  comunicadoSelecionado.value = com
  showModal.value = true
  if (!com.lido) {
    emit('ler', com.id)
  }
}

const getTipoLabel = (tipo: string) => {
  const tipos: Record<string, string> = {
    'Informativo': 'Informativo',
    'Importante': 'Importante',
    'Urgente': 'Urgente',
    'Evento': 'Evento',
    'Beneficio': 'Benefício'
  }
  return tipos[tipo] || tipo
}

const getTipoIcon = (tipo: string) => {
  const icons: Record<string, string> = {
    'Informativo': 'heroicons:information-circle',
    'Importante': 'heroicons:exclamation-circle',
    'Urgente': 'heroicons:exclamation-triangle',
    'Evento': 'heroicons:calendar',
    'Beneficio': 'heroicons:gift'
  }
  return icons[tipo] || 'heroicons:megaphone'
}

const getTipoClass = (tipo: string) => {
  const classes: Record<string, string> = {
    'Informativo': 'bg-blue-100 text-blue-600',
    'Importante': 'bg-amber-100 text-amber-600',
    'Urgente': 'bg-red-100 text-red-600',
    'Evento': 'bg-purple-100 text-purple-600',
    'Beneficio': 'bg-green-100 text-green-600'
  }
  return classes[tipo] || 'bg-slate-100 text-slate-600'
}

const getTipoBadgeClass = (tipo: string) => {
  const classes: Record<string, string> = {
    'Informativo': 'bg-blue-100 text-blue-700',
    'Importante': 'bg-amber-100 text-amber-700',
    'Urgente': 'bg-red-100 text-red-700',
    'Evento': 'bg-purple-100 text-purple-700',
    'Beneficio': 'bg-green-100 text-green-700'
  }
  return classes[tipo] || 'bg-slate-100 text-slate-700'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}
</script>
