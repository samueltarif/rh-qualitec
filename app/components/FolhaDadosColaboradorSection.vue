<template>
  <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
      <Icon name="heroicons:user" size="18" />
      Dados do Colaborador
    </h4>
    
    <div class="grid md:grid-cols-3 gap-4 text-sm">
      <!-- Nome -->
      <div>
        <p class="text-gray-500 mb-1">Nome</p>
        <p class="font-medium text-gray-800">{{ dados.nome || '-' }}</p>
      </div>

      <!-- CPF -->
      <div>
        <p class="text-gray-500 mb-1">CPF</p>
        <p class="font-medium text-gray-800">{{ formatCPF(dados.cpf) }}</p>
      </div>

      <!-- Cargo -->
      <div>
        <p class="text-gray-500 mb-1">Cargo</p>
        <p class="font-medium text-gray-800" :class="{ 'text-amber-600': !dados.cargo || dados.cargo === '-' }">
          {{ dados.cargo || '-' }}
        </p>
      </div>

      <!-- Salário Base -->
      <div>
        <p class="text-gray-500 mb-1">Salário Base</p>
        <p class="font-medium text-gray-800">{{ formatCurrency(dados.salario_base) }}</p>
      </div>

      <!-- Dependentes -->
      <div>
        <p class="text-gray-500 mb-1">Dependentes</p>
        <p class="font-medium text-gray-800">{{ dados.dependentes || 0 }}</p>
      </div>

      <!-- Horas Contratadas -->
      <div>
        <p class="text-gray-500 mb-1">Horas Contratadas</p>
        <p class="font-medium text-gray-800">{{ dados.horas_contratadas || 220 }}h/mês</p>
      </div>
    </div>

    <!-- Informações Adicionais (Opcional) -->
    <div v-if="mostrarDetalhes" class="mt-4 pt-4 border-t border-gray-300">
      <div class="grid md:grid-cols-3 gap-4 text-sm">
        <!-- Departamento -->
        <div v-if="dados.departamento">
          <p class="text-gray-500 mb-1">Departamento</p>
          <p class="font-medium text-gray-800">{{ dados.departamento }}</p>
        </div>

        <!-- Data de Admissão -->
        <div v-if="dados.data_admissao">
          <p class="text-gray-500 mb-1">Data de Admissão</p>
          <p class="font-medium text-gray-800">{{ formatDate(dados.data_admissao) }}</p>
        </div>

        <!-- Matrícula -->
        <div v-if="dados.matricula">
          <p class="text-gray-500 mb-1">Matrícula</p>
          <p class="font-medium text-gray-800">{{ dados.matricula }}</p>
        </div>
      </div>
    </div>

    <!-- Alerta se cargo não estiver preenchido -->
    <div v-if="!dados.cargo || dados.cargo === '-'" class="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
      <p class="text-xs text-amber-800 flex items-start gap-2">
        <Icon name="heroicons:exclamation-triangle" size="16" class="mt-0.5 flex-shrink-0" />
        <span>
          <strong>Cargo não cadastrado.</strong> Atualize o cadastro do colaborador para incluir o cargo.
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DadosColaborador {
  nome: string
  cpf: string
  cargo?: string
  salario_base: number
  dependentes?: number
  horas_contratadas?: number
  departamento?: string
  data_admissao?: string
  matricula?: string
}

interface Props {
  dados: DadosColaborador
  mostrarDetalhes?: boolean
}

withDefaults(defineProps<Props>(), {
  mostrarDetalhes: false
})

// Formatar CPF
const formatCPF = (cpf: string) => {
  if (!cpf) return '-'
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// Formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}

// Formatar data
const formatDate = (date: string) => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('pt-BR')
  } catch {
    return date
  }
}
</script>
