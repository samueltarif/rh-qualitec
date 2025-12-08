<template>
  <UIModal :model-value="aberto" @update:model-value="$emit('update:aberto', $event)" size="xl">
    <template #header>
      <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Icon name="heroicons:shield-check" class="text-blue-600" size="24" />
        Auditoria de Impostos - Correção de Divergências
      </h3>
      <p class="text-sm text-gray-500">Verifica e corrige cálculos de INSS e IRRF entre módulos</p>
    </template>

    <div class="space-y-6">
      <!-- Formulário de Entrada -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="font-semibold text-blue-800 mb-3">Dados para Auditoria</h4>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ID do Colaborador
            </label>
            <UIInput 
              v-model="form.colaborador_id" 
              type="number"
              placeholder="Ex: 1"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Salário Bruto
            </label>
            <UIInput 
              v-model="form.salario_bruto" 
              type="number"
              step="0.01"
              placeholder="Ex: 3000.00"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              INSS (para auditoria IRRF)
            </label>
            <UIInput 
              v-model="form.inss" 
              type="number"
              step="0.01"
              placeholder="Ex: 270.00"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Dependentes
            </label>
            <UIInput 
              v-model="form.dependentes" 
              type="number"
              placeholder="Ex: 2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Mês (opcional)
            </label>
            <UIInput 
              v-model="form.mes" 
              placeholder="Ex: 01"
              maxlength="2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Ano (opcional)
            </label>
            <UIInput 
              v-model="form.ano" 
              placeholder="Ex: 2024"
              maxlength="4"
            />
          </div>
        </div>
        <div class="mt-4 flex gap-3">
          <UIButton 
            theme="admin" 
            variant="primary"
            @click="executarAuditoriaINSS"
            :disabled="loading || !form.colaborador_id || !form.salario_bruto"
            :loading="loading && tipoAuditoria === 'inss'"
          >
            <Icon name="heroicons:magnifying-glass" size="16" />
            Auditoria INSS
          </UIButton>
          <UIButton 
            theme="admin" 
            variant="secondary"
            @click="executarAuditoriaIRRF"
            :disabled="loading || !form.colaborador_id || !form.salario_bruto || !form.inss"
            :loading="loading && tipoAuditoria === 'irrf'"
          >
            <Icon name="heroicons:magnifying-glass" size="16" />
            Auditoria IRRF
          </UIButton>
        </div>
      </div>

      <!-- Resultados da Auditoria -->
      <div v-if="resultado" class="space-y-4">
        <!-- Status Geral -->
        <div :class="[
          'border rounded-lg p-4',
          resultado.divergencias_encontradas 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        ]">
          <div class="flex items-center gap-2 mb-2">
            <Icon 
              :name="resultado.divergencias_encontradas ? 'heroicons:exclamation-triangle' : 'heroicons:check-circle'"
              :class="resultado.divergencias_encontradas ? 'text-red-600' : 'text-green-600'"
              size="20"
            />
            <h4 :class="[
              'font-semibold',
              resultado.divergencias_encontradas ? 'text-red-800' : 'text-green-800'
            ]">
              {{ resultado.divergencias_encontradas ? 'Divergências Encontradas' : 'Cálculos Corretos' }}
            </h4>
          </div>
          <p :class="resultado.divergencias_encontradas ? 'text-red-700' : 'text-green-700'">
            {{ resultado.message }}
          </p>
        </div>

        <!-- Valor Correto -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="font-semibold text-blue-800 mb-3">
            Cálculo Oficial do {{ resultado.tipo || 'INSS' }}
          </h4>
          <div class="text-2xl font-bold text-blue-900 mb-3">
            {{ formatCurrency(resultado.valor_correto) }}
          </div>
          
          <!-- Detalhes do Cálculo -->
          <div class="space-y-2">
            <h5 class="font-medium text-blue-700">
              {{ resultado.tipo === 'IRRF' ? 'Detalhamento do Cálculo:' : 'Detalhamento por Faixas:' }}
            </h5>
            <div v-for="(detalhe, index) in resultado.detalhes_calculo" :key="index" class="text-sm">
              <!-- INSS -->
              <div v-if="resultado.tipo !== 'IRRF' && detalhe.observacao" class="text-orange-600 font-medium">
                ⚠️ {{ detalhe.observacao }}
              </div>
              <div v-else-if="resultado.tipo !== 'IRRF'" class="text-blue-600">
                <strong>Faixa {{ detalhe.faixa }}:</strong> {{ detalhe.descricao }}
                <br>
                <span class="ml-4">
                  R$ {{ detalhe.base_calculo.toFixed(2) }} × {{ (detalhe.aliquota * 100).toFixed(1) }}% = 
                  <strong>R$ {{ detalhe.valor_contribuicao.toFixed(2) }}</strong>
                </span>
              </div>
              
              <!-- IRRF -->
              <div v-else-if="detalhe.tipo === 'base_calculo'" class="text-blue-600">
                <strong>Base de Cálculo:</strong>
                <div class="ml-4 space-y-1">
                  <div>Salário Bruto: R$ {{ detalhe.salario_bruto.toFixed(2) }}</div>
                  <div>(-) INSS: R$ {{ detalhe.inss_descontado.toFixed(2) }}</div>
                  <div>(-) Dependentes ({{ detalhe.dependentes }} × R$ 189,59): R$ {{ detalhe.deducao_dependentes.toFixed(2) }}</div>
                  <div><strong>= Base IRRF: R$ {{ detalhe.base_calculo.toFixed(2) }}</strong></div>
                </div>
              </div>
              <div v-else-if="detalhe.tipo === 'isencao'" class="text-green-600">
                <strong>{{ detalhe.descricao }}</strong>
                <div class="ml-4">Base (R$ {{ detalhe.base_calculo.toFixed(2) }}) ≤ Limite (R$ {{ detalhe.limite_isencao.toFixed(2) }})</div>
              </div>
              <div v-else-if="detalhe.tipo === 'calculo'" class="text-blue-600">
                <strong>{{ detalhe.faixa_aplicada }}</strong>
                <div class="ml-4">
                  Base: R$ {{ detalhe.base_calculo.toFixed(2) }} → IRRF: R$ {{ detalhe.irrf_final.toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Divergências Encontradas -->
        <div v-if="resultado.divergencias && resultado.divergencias.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 class="font-semibold text-yellow-800 mb-3">Divergências por Módulo</h4>
          <div class="space-y-3">
            <div v-for="(div, index) in resultado.divergencias" :key="index" class="bg-white rounded p-3 border">
              <div class="flex items-center justify-between mb-2">
                <h5 class="font-medium text-gray-800">{{ div.modulo }}</h5>
                <span v-if="div.periodo" class="text-sm text-gray-500">{{ div.periodo }}</span>
              </div>
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">Valor Atual:</span>
                  <div class="font-semibold text-red-600">{{ formatCurrency(div.valor_atual) }}</div>
                </div>
                <div>
                  <span class="text-gray-600">Valor Correto:</span>
                  <div class="font-semibold text-green-600">{{ formatCurrency(div.valor_correto) }}</div>
                </div>
                <div>
                  <span class="text-gray-600">Diferença:</span>
                  <div :class="[
                    'font-semibold',
                    div.diferenca > 0 ? 'text-red-600' : 'text-blue-600'
                  ]">
                    {{ div.diferenca > 0 ? '+' : '' }}{{ formatCurrency(Math.abs(div.diferenca)) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Correções Aplicadas -->
        <div v-if="resultado.correcoes_aplicadas && resultado.correcoes_aplicadas.length > 0" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 class="font-semibold text-green-800 mb-3">Correções Aplicadas</h4>
          <div class="space-y-3">
            <div v-for="(corr, index) in resultado.correcoes_aplicadas" :key="index" class="bg-white rounded p-3 border">
              <div class="flex items-center justify-between mb-2">
                <h5 class="font-medium text-gray-800">{{ corr.modulo }}</h5>
                <span v-if="corr.periodo" class="text-sm text-gray-500">{{ corr.periodo }}</span>
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">INSS:</span>
                  <span>
                    <span class="text-red-600">{{ formatCurrency(corr.valor_anterior) }}</span>
                    →
                    <span class="text-green-600 font-semibold">{{ formatCurrency(corr.valor_corrigido) }}</span>
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Total Descontos:</span>
                  <span>
                    <span class="text-red-600">{{ formatCurrency(corr.total_descontos_anterior) }}</span>
                    →
                    <span class="text-green-600 font-semibold">{{ formatCurrency(corr.total_descontos_corrigido) }}</span>
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Salário Líquido:</span>
                  <span>
                    <span class="text-red-600">{{ formatCurrency(corr.salario_liquido_anterior) }}</span>
                    →
                    <span class="text-green-600 font-semibold">{{ formatCurrency(corr.salario_liquido_corrigido) }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Valores Antes da Correção -->
        <div v-if="resultado.valores_antes" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 class="font-semibold text-gray-800 mb-3">Valores Encontrados nos Módulos</h4>
          <div class="grid md:grid-cols-2 gap-4">
            <div v-for="(valor, modulo) in resultado.valores_antes" :key="modulo" class="flex justify-between">
              <span class="text-gray-600 capitalize">{{ modulo.replace('_', ' ') }}:</span>
              <span class="font-semibold">{{ formatCurrency(valor) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-flex items-center gap-2 text-blue-600">
          <Icon name="heroicons:arrow-path" class="animate-spin" size="20" />
          Executando auditoria...
        </div>
      </div>

      <!-- Erro -->
      <div v-if="erro" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center gap-2 text-red-800">
          <Icon name="heroicons:exclamation-triangle" size="20" />
          <span class="font-semibold">Erro na Auditoria</span>
        </div>
        <p class="text-red-700 mt-1">{{ erro }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UIButton theme="admin" variant="secondary" @click="$emit('fechar')">
          Fechar
        </UIButton>
        <UIButton 
          v-if="resultado && resultado.divergencias_encontradas"
          theme="admin" 
          variant="primary"
          @click="resultado.tipo === 'IRRF' ? executarAuditoriaIRRF() : executarAuditoriaINSS()"
          :loading="loading"
        >
          <Icon name="heroicons:arrow-path" size="16" />
          Executar Novamente
        </UIButton>
      </div>
    </template>
  </UIModal>
</template>

<script setup lang="ts">
interface Props {
  aberto: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:aberto': [value: boolean]
  fechar: []
}>()

const form = ref({
  colaborador_id: '',
  salario_bruto: '',
  inss: '',
  dependentes: '0',
  mes: '',
  ano: '',
})

const loading = ref(false)
const tipoAuditoria = ref('')
const resultado = ref<any>(null)
const erro = ref('')

const executarAuditoriaINSS = async () => {
  if (!form.value.colaborador_id || !form.value.salario_bruto) {
    erro.value = 'ID do colaborador e salário bruto são obrigatórios'
    return
  }

  loading.value = true
  tipoAuditoria.value = 'inss'
  erro.value = ''
  resultado.value = null

  try {
    const response = await $fetch('/api/auditoria/corrigir-inss', {
      method: 'POST',
      body: {
        colaborador_id: parseInt(form.value.colaborador_id),
        salario_bruto: parseFloat(form.value.salario_bruto),
        mes: form.value.mes || '01',
        ano: form.value.ano || '2024',
      }
    })

    resultado.value = { ...response, tipo: 'INSS' }
  } catch (error: any) {
    erro.value = error.data?.message || error.message || 'Erro ao executar auditoria de INSS'
  } finally {
    loading.value = false
    tipoAuditoria.value = ''
  }
}

const executarAuditoriaIRRF = async () => {
  if (!form.value.colaborador_id || !form.value.salario_bruto || !form.value.inss) {
    erro.value = 'ID do colaborador, salário bruto e INSS são obrigatórios para auditoria de IRRF'
    return
  }

  loading.value = true
  tipoAuditoria.value = 'irrf'
  erro.value = ''
  resultado.value = null

  try {
    const response = await $fetch('/api/auditoria/corrigir-irrf', {
      method: 'POST',
      body: {
        colaborador_id: parseInt(form.value.colaborador_id),
        salario_bruto: parseFloat(form.value.salario_bruto),
        inss: parseFloat(form.value.inss),
        dependentes: parseInt(form.value.dependentes) || 0,
        mes: form.value.mes || '01',
        ano: form.value.ano || '2024',
      }
    })

    resultado.value = { ...response, tipo: 'IRRF' }
  } catch (error: any) {
    erro.value = error.data?.message || error.message || 'Erro ao executar auditoria de IRRF'
  } finally {
    loading.value = false
    tipoAuditoria.value = ''
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}
</script>