<template>
  <div class="card overflow-hidden">
    <div class="overflow-x-auto max-h-96">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200 sticky top-0">
          <tr>
            <th class="px-4 py-3 text-left">
              <UICheckbox 
                :model-value="todosSelecionados"
                @update:model-value="$emit('toggle-todos')"
                label="Selecionar todos"
                class="sr-only"
              />
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Colaborador</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">CPF</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Meses</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Salário Base</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Valor 13º</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr 
            v-for="colab in colaboradores" 
            :key="colab.id"
            class="hover:bg-gray-50 cursor-pointer"
            @click="$emit('toggle-colaborador', colab.id)"
          >
            <td class="px-4 py-3">
              <UICheckbox 
                :model-value="selecionados.includes(colab.id)"
                @update:model-value="$emit('toggle-colaborador', colab.id)"
                :label="`Selecionar ${colab.nome}`"
                class="sr-only"
              />
            </td>
            <td class="px-4 py-3">
              <p class="font-medium text-gray-800">{{ colab.nome }}</p>
              <p class="text-xs text-gray-500">{{ colab.matricula || 'Sem matrícula' }}</p>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ formatCPF(colab.cpf) }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ colab.status || '-' }}</td>
            <td class="px-4 py-3 text-center">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ colab.meses_trabalhados || 12 }}/12
              </span>
            </td>
            <td class="px-4 py-3 text-right font-medium text-gray-800">{{ formatCurrency(colab.salario_base) }}</td>
            <td class="px-4 py-3 text-right font-bold text-green-700">
              {{ formatCurrency(calcularValor(colab)) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Colaborador {
  id: number
  nome: string
  cpf: string
  status?: string
  matricula?: string
  salario_base: number
  meses_trabalhados?: number
}

const props = defineProps<{
  colaboradores: Colaborador[]
  selecionados: number[]
  todosSelecionados: boolean
  parcela: '1' | '2' | 'integral'
}>()

defineEmits<{
  'toggle-colaborador': [id: number]
  'toggle-todos': []
}>()

const { calcularValor13 } = use13SalarioCalculos()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const formatCPF = (cpf: string) => {
  if (!cpf) return '-'
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const calcularValor = (colab: Colaborador) => {
  return calcularValor13(colab.salario_base, colab.meses_trabalhados || 12, props.parcela)
}
</script>
