<template>
  <UIModal v-model="isOpen" size="md">
    <div class="p-6">
      <!-- Ícone de Aviso -->
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="heroicons:exclamation-triangle" class="text-red-600" size="32" />
      </div>

      <!-- Título -->
      <h3 class="text-xl font-bold text-gray-800 text-center mb-2">
        Confirmar Exclusão
      </h3>

      <!-- Mensagem -->
      <p class="text-gray-600 text-center mb-6">
        Tem certeza que deseja excluir este holerite? Esta ação não pode ser desfeita.
      </p>

      <!-- Detalhes do Holerite -->
      <div v-if="holerite" class="bg-gray-50 rounded-lg p-4 mb-6">
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Colaborador:</span>
            <span class="text-sm font-semibold text-gray-800">{{ holerite.nome_colaborador }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Período:</span>
            <span class="text-sm font-semibold text-gray-800">{{ nomeMes(holerite.mes) }}/{{ holerite.ano }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Valor:</span>
            <span class="text-sm font-semibold text-green-600">{{ formatCurrency(holerite.salario_liquido) }}</span>
          </div>
          <div v-if="holerite.tipo === 'decimo_terceiro'" class="flex justify-between">
            <span class="text-sm text-gray-600">Tipo:</span>
            <span class="text-sm font-semibold text-purple-600">13º Salário - {{ holerite.parcela_13 }}ª Parcela</span>
          </div>
        </div>
      </div>

      <!-- Aviso -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div class="flex gap-3">
          <Icon name="heroicons:information-circle" class="text-yellow-600 flex-shrink-0" size="20" />
          <div class="text-sm text-yellow-800">
            <p class="font-semibold mb-1">Atenção:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>O holerite será permanentemente excluído</li>
              <li>Você precisará gerar novamente se necessário</li>
              <li>Esta ação será registrada no log</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Botões -->
      <div class="flex gap-3">
        <UIButton
          variant="secondary"
          @click="isOpen = false"
          class="flex-1"
        >
          Cancelar
        </UIButton>
        <UIButton
          variant="danger"
          @click="emit('confirmar')"
          :disabled="loading"
          class="flex-1"
        >
          <Icon v-if="loading" name="heroicons:arrow-path" class="animate-spin mr-2" size="16" />
          {{ loading ? 'Excluindo...' : 'Excluir' }}
        </UIButton>
      </div>
    </div>
  </UIModal>
</template>

<script setup lang="ts">
interface Holerite {
  id: string
  mes: number
  ano: number
  nome_colaborador: string
  salario_liquido: number
  tipo?: string
  parcela_13?: string
}

interface Props {
  show: boolean
  holerite: Holerite | null
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'confirmar'])

const isOpen = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) emit('close')
  }
})

const nomeMes = (mes: number) => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return meses[mes - 1]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}
</script>
