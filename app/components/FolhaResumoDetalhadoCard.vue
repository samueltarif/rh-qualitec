<template>
  <div class="card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Icon name="heroicons:document-chart-bar" class="text-red-700" size="24" />
      Resumo da Folha - {{ titulo }}
    </h3>
    
    <div class="grid md:grid-cols-3 gap-6">
      <!-- Total Salário Bruto -->
      <div class="group hover:scale-105 transition-transform">
        <p class="text-sm text-gray-600 mb-1 flex items-center gap-1">
          <span>💰</span>
          <span>Total Salário Bruto</span>
        </p>
        <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(totais.total_salario_bruto) }}</p>
      </div>

      <!-- INSS (Colaboradores) -->
      <div class="group hover:scale-105 transition-transform">
        <p class="text-sm text-gray-600 mb-1 flex items-center gap-1">
          <span>📊</span>
          <span>INSS (Colaboradores)</span>
        </p>
        <p class="text-2xl font-bold text-blue-700">{{ formatCurrency(totais.total_inss) }}</p>
      </div>

      <!-- IRRF -->
      <div class="group hover:scale-105 transition-transform">
        <p class="text-sm text-gray-600 mb-1 flex items-center gap-1">
          <span>📋</span>
          <span>IRRF</span>
        </p>
        <p class="text-2xl font-bold text-purple-700">{{ formatCurrency(totais.total_irrf) }}</p>
      </div>

      <!-- FGTS (Empresa) -->
      <div class="group hover:scale-105 transition-transform">
        <p class="text-sm text-gray-600 mb-1 flex items-center gap-1">
          <span>🏦</span>
          <span>FGTS (Empresa)</span>
        </p>
        <p class="text-2xl font-bold text-green-700">{{ formatCurrency(totais.total_fgts) }}</p>
      </div>

      <!-- Total Benefícios -->
      <div v-if="totais.total_beneficios" class="group hover:scale-105 transition-transform">
        <p class="text-sm text-gray-600 mb-1 flex items-center gap-1">
          <span>🎁</span>
          <span>Total Benefícios</span>
        </p>
        <p class="text-2xl font-bold text-amber-700">{{ formatCurrency(totais.total_beneficios) }}</p>
      </div>

      <!-- Total Adiantamentos (Descontados) -->
      <div v-if="totais.total_adiantamento && totais.total_adiantamento > 0" class="group hover:scale-105 transition-transform">
        <p class="text-sm text-gray-600 mb-1 flex items-center gap-1">
          <span>💳</span>
          <span>Adiantamentos (Mês Anterior)</span>
        </p>
        <p class="text-2xl font-bold text-orange-700">{{ formatCurrency(totais.total_adiantamento) }}</p>
      </div>

      <!-- Total Descontos -->
      <div class="group hover:scale-105 transition-transform">
        <p class="text-sm text-gray-600 mb-1 flex items-center gap-1">
          <span>➖</span>
          <span>Total Descontos</span>
        </p>
        <p class="text-2xl font-bold text-red-700">{{ formatCurrency(totais.total_descontos) }}</p>
      </div>

      <!-- Custo Total Empresa (Destaque) -->
      <div class="bg-white/50 rounded-lg p-4 border-2 border-red-300 group hover:scale-105 transition-transform">
        <p class="text-sm text-gray-600 mb-1 flex items-center gap-1">
          <span>💼</span>
          <span>Custo Total Empresa</span>
        </p>
        <p class="text-3xl font-bold text-red-800">{{ formatCurrency(totais.custo_empresa) }}</p>
      </div>
    </div>

    <!-- Informações Adicionais (Opcional) -->
    <div v-if="mostrarDetalhes" class="mt-6 pt-4 border-t border-red-300">
      <div class="grid md:grid-cols-2 gap-4 text-sm">
        <!-- Salário Líquido Total -->
        <div class="bg-white/30 rounded-lg p-3">
          <p class="text-gray-600 mb-1">💵 Total Salário Líquido</p>
          <p class="text-xl font-bold text-green-800">{{ formatCurrency(totais.total_salario_liquido) }}</p>
        </div>

        <!-- Número de Colaboradores -->
        <div class="bg-white/30 rounded-lg p-3">
          <p class="text-gray-600 mb-1">👥 Total de Colaboradores</p>
          <p class="text-xl font-bold text-gray-800">{{ totais.total_colaboradores }}</p>
        </div>
      </div>
    </div>

    <!-- Breakdown Percentual (Opcional) -->
    <div v-if="mostrarPercentuais" class="mt-6 pt-4 border-t border-red-300">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">Composição dos Custos</h4>
      <div class="space-y-2">
        <!-- Salário Bruto -->
        <div class="flex items-center gap-3">
          <div class="flex-1">
            <div class="flex justify-between text-xs mb-1">
              <span class="text-gray-600">Salário Bruto</span>
              <span class="font-semibold text-gray-800">{{ calcularPercentual(totais.total_salario_bruto, totais.custo_empresa) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-gray-600 h-2 rounded-full transition-all duration-500"
                :style="{ width: calcularPercentual(totais.total_salario_bruto, totais.custo_empresa) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- FGTS -->
        <div class="flex items-center gap-3">
          <div class="flex-1">
            <div class="flex justify-between text-xs mb-1">
              <span class="text-gray-600">FGTS</span>
              <span class="font-semibold text-green-700">{{ calcularPercentual(totais.total_fgts, totais.custo_empresa) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-green-600 h-2 rounded-full transition-all duration-500"
                :style="{ width: calcularPercentual(totais.total_fgts, totais.custo_empresa) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Benefícios -->
        <div v-if="totais.total_beneficios" class="flex items-center gap-3">
          <div class="flex-1">
            <div class="flex justify-between text-xs mb-1">
              <span class="text-gray-600">Benefícios</span>
              <span class="font-semibold text-amber-700">{{ calcularPercentual(totais.total_beneficios, totais.custo_empresa) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-amber-600 h-2 rounded-full transition-all duration-500"
                :style="{ width: calcularPercentual(totais.total_beneficios, totais.custo_empresa) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TotaisFolha {
  total_colaboradores: number
  total_salario_bruto: number
  total_inss: number
  total_irrf: number
  total_fgts: number
  total_beneficios?: number
  total_adiantamento?: number
  total_descontos: number
  total_salario_liquido: number
  custo_empresa: number
}

interface Props {
  titulo: string
  totais: TotaisFolha
  mostrarDetalhes?: boolean
  mostrarPercentuais?: boolean
}

withDefaults(defineProps<Props>(), {
  mostrarDetalhes: false,
  mostrarPercentuais: false
})

// Formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}

// Calcular percentual
const calcularPercentual = (valor: number, total: number) => {
  if (!total || total === 0) return 0
  return ((valor / total) * 100).toFixed(1)
}
</script>
