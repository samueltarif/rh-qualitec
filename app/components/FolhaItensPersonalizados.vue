<template>
  <div class="card">
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-purple-700 flex items-center gap-2">
        <Icon name="heroicons:sparkles" size="18" />
        Itens Personalizados
      </h4>
      <UIButton 
        variant="secondary" 
        size="sm"
        @click="adicionarItem"
      >
        <Icon name="heroicons:plus" size="16" />
        Adicionar Item
      </UIButton>
    </div>

    <div v-if="itens.length === 0" class="text-center py-6 text-gray-500 text-sm">
      <Icon name="heroicons:inbox" size="32" class="mx-auto mb-2 opacity-50" />
      <p>Nenhum item personalizado adicionado</p>
      <p class="text-xs mt-1">Clique em "Adicionar Item" para criar proventos ou descontos customizados</p>
    </div>

    <div v-else class="space-y-3">
      <div 
        v-for="(item, index) in itens" 
        :key="index"
        class="border border-gray-200 rounded-lg p-3 bg-gray-50"
      >
        <div class="flex items-start gap-3">
          <!-- Tipo -->
          <div class="flex-shrink-0 w-32">
            <label class="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
            <select
              :value="item.tipo"
              @change="atualizarItem(index, 'tipo', ($event.target as HTMLSelectElement).value)"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="provento">Provento</option>
              <option value="desconto">Desconto</option>
            </select>
          </div>

          <!-- Código -->
          <div class="flex-shrink-0 w-24">
            <label class="block text-xs font-medium text-gray-700 mb-1">Código</label>
            <input
              type="text"
              :value="item.codigo"
              @input="atualizarItem(index, 'codigo', ($event.target as HTMLInputElement).value)"
              placeholder="Ex: 105"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Descrição -->
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
            <input
              type="text"
              :value="item.descricao"
              @input="atualizarItem(index, 'descricao', ($event.target as HTMLInputElement).value)"
              placeholder="Ex: BONIFICAÇÃO ESPECIAL"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Referência -->
          <div class="flex-shrink-0 w-28">
            <label class="block text-xs font-medium text-gray-700 mb-1">Referência</label>
            <input
              type="text"
              :value="item.referencia"
              @input="atualizarItem(index, 'referencia', ($event.target as HTMLInputElement).value)"
              placeholder="Ex: 1,00"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Valor -->
          <div class="flex-shrink-0 w-32">
            <label class="block text-xs font-medium text-gray-700 mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              :value="item.valor"
              @input="atualizarItem(index, 'valor', parseFloat(($event.target as HTMLInputElement).value) || 0)"
              placeholder="0,00"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Botão Remover -->
          <div class="flex-shrink-0 pt-6">
            <button
              @click="removerItem(index)"
              class="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Remover item"
            >
              <Icon name="heroicons:trash" size="18" />
            </button>
          </div>
        </div>

        <!-- Preview do item -->
        <div class="mt-2 pt-2 border-t border-gray-200">
          <div class="flex items-center gap-2 text-xs">
            <span 
              :class="[
                'px-2 py-0.5 rounded-full font-medium',
                item.tipo === 'provento' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              ]"
            >
              {{ item.tipo === 'provento' ? 'Provento' : 'Desconto' }}
            </span>
            <span class="text-gray-500">•</span>
            <span class="font-mono text-gray-600">{{ item.codigo || '---' }}</span>
            <span class="text-gray-500">•</span>
            <span class="text-gray-700">{{ item.descricao || 'Sem descrição' }}</span>
            <span class="text-gray-500">•</span>
            <span class="text-gray-600">Ref: {{ item.referencia || '---' }}</span>
            <span class="text-gray-500">•</span>
            <span class="font-semibold text-gray-900">R$ {{ formatCurrency(item.valor) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumo -->
    <div v-if="itens.length > 0" class="mt-4 pt-4 border-t border-gray-200">
      <div class="grid grid-cols-3 gap-4 text-sm">
        <div class="text-center">
          <p class="text-gray-500 text-xs mb-1">Total Proventos</p>
          <p class="font-semibold text-green-700">R$ {{ formatCurrency(totalProventos) }}</p>
        </div>
        <div class="text-center">
          <p class="text-gray-500 text-xs mb-1">Total Descontos</p>
          <p class="font-semibold text-red-700">R$ {{ formatCurrency(totalDescontos) }}</p>
        </div>
        <div class="text-center">
          <p class="text-gray-500 text-xs mb-1">Total de Itens</p>
          <p class="font-semibold text-gray-900">{{ itens.length }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ItemPersonalizado {
  tipo: 'provento' | 'desconto'
  codigo: string
  descricao: string
  referencia: string
  valor: number
}

const props = defineProps<{
  modelValue: ItemPersonalizado[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ItemPersonalizado[]]
  change: []
}>()

const itens = computed(() => props.modelValue || [])

const totalProventos = computed(() => {
  return itens.value
    .filter(item => item.tipo === 'provento')
    .reduce((sum, item) => sum + (item.valor || 0), 0)
})

const totalDescontos = computed(() => {
  return itens.value
    .filter(item => item.tipo === 'desconto')
    .reduce((sum, item) => sum + (item.valor || 0), 0)
})

const adicionarItem = () => {
  const novosItens = [
    ...itens.value,
    {
      tipo: 'provento' as const,
      codigo: '',
      descricao: '',
      referencia: '',
      valor: 0
    }
  ]
  emit('update:modelValue', novosItens)
  emit('change')
}

const atualizarItem = (index: number, campo: keyof ItemPersonalizado, valor: any) => {
  const novosItens = [...itens.value]
  novosItens[index] = {
    ...novosItens[index],
    [campo]: valor
  }
  emit('update:modelValue', novosItens)
  emit('change')
}

const removerItem = (index: number) => {
  const novosItens = itens.value.filter((_, i) => i !== index)
  emit('update:modelValue', novosItens)
  emit('change')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)
}
</script>
