<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="avatarClass">
          <Icon name="heroicons:user" :class="avatarIconClass" size="20" />
        </div>
        <div>
          <h4 class="font-semibold text-gray-800">{{ solicitacao.colaborador_nome }}</h4>
          <p class="text-sm text-gray-500">{{ solicitacao.cargo || 'Colaborador' }}</p>
        </div>
      </div>
      <UIBadge :variant="statusVariant">{{ statusLabel }}</UIBadge>
    </div>

    <div class="space-y-2 mb-4">
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <Icon name="heroicons:calendar" size="16" class="text-gray-400" />
        <span>{{ formatDate(solicitacao.data_inicio) }} a {{ formatDate(solicitacao.data_fim) }}</span>
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <Icon name="heroicons:clock" size="16" class="text-gray-400" />
        <span>{{ solicitacao.dias_solicitados }} dias</span>
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <Icon name="heroicons:tag" size="16" class="text-gray-400" />
        <span>{{ tipoLabel }}</span>
      </div>
    </div>

    <!-- Opções extras -->
    <div v-if="solicitacao.vender_dias || solicitacao.adiantamento_13" class="flex flex-wrap gap-2 mb-4">
      <span v-if="solicitacao.vender_dias" class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
        Venda {{ solicitacao.dias_venda }} dias
      </span>
      <span v-if="solicitacao.adiantamento_13" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
        Adiant. 13º
      </span>
    </div>

    <!-- Motivo rejeição -->
    <div v-if="solicitacao.status === 'rejeitada' && solicitacao.motivo_rejeicao" class="bg-red-50 rounded-lg p-3 mb-4">
      <p class="text-xs text-red-600 font-medium mb-1">Motivo da rejeição:</p>
      <p class="text-sm text-red-700">{{ solicitacao.motivo_rejeicao }}</p>
    </div>

    <!-- Ações -->
    <div class="flex gap-2 pt-4 border-t border-gray-100">
      <UIButton
        v-if="solicitacao.status === 'pendente' && showApprovalActions"
        theme="admin"
        variant="success"
        size="sm"
        @click="$emit('aprovar', solicitacao)"
      >
        <Icon name="heroicons:check" size="16" />
      </UIButton>
      <UIButton
        v-if="solicitacao.status === 'pendente' && showApprovalActions"
        theme="admin"
        variant="danger"
        size="sm"
        @click="$emit('rejeitar', solicitacao)"
      >
        <Icon name="heroicons:x-mark" size="16" />
      </UIButton>
      <UIButton theme="admin" variant="ghost" size="sm" @click="$emit('detalhes', solicitacao)">
        <Icon name="heroicons:eye" size="16" />
      </UIButton>
      <UIButton
        v-if="solicitacao.status === 'pendente' && showEditAction"
        theme="admin"
        variant="ghost"
        size="sm"
        @click="$emit('editar', solicitacao)"
      >
        <Icon name="heroicons:pencil" size="16" />
      </UIButton>
      <UIButton
        v-if="solicitacao.status === 'pendente' && showCancelAction"
        theme="admin"
        variant="ghost"
        size="sm"
        @click="$emit('cancelar', solicitacao)"
      >
        <Icon name="heroicons:trash" size="16" class="text-red-500" />
      </UIButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Solicitacao {
  id: string
  colaborador_nome: string
  cargo?: string
  data_inicio: string
  data_fim: string
  dias_solicitados: number
  tipo: string
  status: string
  vender_dias: boolean
  dias_venda: number
  adiantamento_13: boolean
  motivo_rejeicao?: string
}

interface Props {
  solicitacao: Solicitacao
  showApprovalActions?: boolean
  showEditAction?: boolean
  showCancelAction?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showApprovalActions: false,
  showEditAction: false,
  showCancelAction: false,
})

defineEmits<{
  'aprovar': [solicitacao: Solicitacao]
  'rejeitar': [solicitacao: Solicitacao]
  'detalhes': [solicitacao: Solicitacao]
  'editar': [solicitacao: Solicitacao]
  'cancelar': [solicitacao: Solicitacao]
}>()

const statusVariant = computed(() => {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pendente: 'warning',
    aprovada: 'success',
    rejeitada: 'danger',
    cancelada: 'default',
    em_gozo: 'info',
    concluida: 'success',
  }
  return variants[props.solicitacao.status] || 'default'
})

const statusLabel = computed(() => {
  const labels: Record<string, string> = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    rejeitada: 'Rejeitada',
    cancelada: 'Cancelada',
    em_gozo: 'Em Gozo',
    concluida: 'Concluída',
  }
  return labels[props.solicitacao.status] || props.solicitacao.status
})

const tipoLabel = computed(() => {
  const tipos: Record<string, string> = {
    normal: 'Normal',
    fracionada: 'Fracionada',
    abono_pecuniario: 'Com Abono Pecuniário',
    coletiva: 'Coletiva',
  }
  return tipos[props.solicitacao.tipo] || 'Normal'
})

const avatarClass = computed(() => {
  const classes: Record<string, string> = {
    pendente: 'bg-amber-100',
    aprovada: 'bg-green-100',
    rejeitada: 'bg-red-100',
    cancelada: 'bg-gray-100',
    em_gozo: 'bg-blue-100',
    concluida: 'bg-green-100',
  }
  return classes[props.solicitacao.status] || 'bg-gray-100'
})

const avatarIconClass = computed(() => {
  const classes: Record<string, string> = {
    pendente: 'text-amber-600',
    aprovada: 'text-green-600',
    rejeitada: 'text-red-600',
    cancelada: 'text-gray-600',
    em_gozo: 'text-blue-600',
    concluida: 'text-green-600',
  }
  return classes[props.solicitacao.status] || 'text-gray-600'
})

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}
</script>
