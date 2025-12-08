<template>
  <div
    class="card hover:shadow-md transition-shadow"
    :class="{ 'opacity-60': alerta.status === 'resolvido' || alerta.status === 'ignorado' }"
  >
    <div class="flex items-start gap-4">
      <div 
        class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-100"
      >
        <Icon :name="alerta.tipo_alerta?.icone || 'heroicons:bell'" class="text-amber-600" size="20" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h4 class="font-semibold text-gray-800">{{ alerta.titulo }}</h4>
          <span class="px-2 py-0.5 rounded text-xs" :class="corPrioridade">
            {{ alerta.prioridade }}
          </span>
        </div>
        <p class="text-sm text-gray-600 mb-2">{{ alerta.mensagem }}</p>
        <div class="flex items-center gap-4 text-xs text-gray-500">
          <span v-if="alerta.colaborador">
            <Icon name="heroicons:user" class="inline mr-1" />
            {{ alerta.colaborador.nome }}
          </span>
          <span v-if="alerta.data_vencimento">
            <Icon name="heroicons:calendar" class="inline mr-1" />
            {{ formatDate(alerta.data_vencimento) }}
          </span>
          <span>
            <Icon name="heroicons:clock" class="inline mr-1" />
            {{ formatDate(alerta.created_at) }}
          </span>
        </div>
      </div>
      <div class="flex gap-2">
        <button 
          v-if="alerta.status === 'pendente'"
          @click="$emit('marcar', 'lido')"
          class="btn-icon"
          title="Marcar como lido"
        >
          <Icon name="heroicons:eye" size="18" />
        </button>
        <button 
          v-if="alerta.status !== 'resolvido'"
          @click="$emit('marcar', 'resolvido')"
          class="btn-icon text-green-600 hover:bg-green-50"
          title="Marcar como resolvido"
        >
          <Icon name="heroicons:check-circle" size="18" />
        </button>
        <button 
          v-if="alerta.status === 'pendente'"
          @click="$emit('marcar', 'ignorado')"
          class="btn-icon text-gray-400 hover:bg-gray-100"
          title="Ignorar"
        >
          <Icon name="heroicons:x-mark" size="18" />
        </button>
        <button 
          @click="$emit('excluir')"
          class="btn-icon text-red-600 hover:bg-red-50"
          title="Excluir"
        >
          <Icon name="heroicons:trash" size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Alerta {
  id: string
  titulo: string
  mensagem: string
  prioridade: string
  status: string
  data_vencimento?: string
  created_at: string
  tipo_alerta?: { icone: string; cor: string }
  colaborador?: { nome: string }
}

const props = defineProps<{
  alerta: Alerta
}>()

defineEmits<{
  marcar: [status: string]
  excluir: []
}>()

const corPrioridade = computed(() => {
  const cores: Record<string, string> = {
    critica: 'bg-red-100 text-red-700',
    alta: 'bg-orange-100 text-orange-700',
    media: 'bg-amber-100 text-amber-700',
    baixa: 'bg-blue-100 text-blue-700',
  }
  return cores[props.alerta.prioridade] || cores.media
})

const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR')
</script>
