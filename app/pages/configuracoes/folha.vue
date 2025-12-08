<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <NuxtLink to="/configuracoes" class="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors">
              <Icon name="heroicons:arrow-left" class="text-white" size="20" />
            </NuxtLink>
            <div>
              <h1 class="text-xl font-bold text-gray-800">Parâmetros de Folha</h1>
              <p class="text-sm text-gray-500">Configure alíquotas, benefícios e descontos</p>
            </div>
          </div>
          <UserProfileDropdown theme="admin" />
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-5xl mx-auto p-8">
      <!-- Loading -->
      <div v-if="loading" class="card text-center py-12">
        <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-4" size="48" />
        <p class="text-gray-600">Carregando parâmetros...</p>
      </div>

      <!-- Formulário -->
      <form v-else @submit.prevent="salvar" class="space-y-6">
        <!-- Alerta -->
        <div class="card bg-blue-50 border-2 border-blue-200">
          <div class="flex items-start gap-3">
            <Icon name="heroicons:information-circle" class="text-blue-600 flex-shrink-0" size="24" />
            <div>
              <h3 class="font-semibold text-blue-900 mb-1">Importante</h3>
              <p class="text-sm text-blue-800">
                Estes parâmetros são usados no cálculo automático da folha de pagamento.
                Mantenha-os atualizados conforme a legislação vigente.
              </p>
            </div>
          </div>
        </div>

        <!-- INSS - SEM DEDUÇÃO -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="heroicons:shield-check" class="text-blue-600" size="24" />
            INSS - Alíquotas Progressivas
          </h3>
          <div class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Faixa 1 - Até (R$)</label>
                <input v-model="form.inss_faixa1_ate" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="1320,00" @blur="normalizarNumero('inss_faixa1_ate')" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alíquota (%)</label>
                <input v-model="form.inss_faixa1_aliquota" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="7,5" @blur="normalizarNumero('inss_faixa1_aliquota')" />
              </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Faixa 2 - Até (R$)</label>
                <input v-model="form.inss_faixa2_ate" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="2571,29" @blur="normalizarNumero('inss_faixa2_ate')" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alíquota (%)</label>
                <input v-model="form.inss_faixa2_aliquota" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="9" @blur="normalizarNumero('inss_faixa2_aliquota')" />
              </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Faixa 3 - Até (R$)</label>
                <input v-model="form.inss_faixa3_ate" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="3856,94" @blur="normalizarNumero('inss_faixa3_ate')" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alíquota (%)</label>
                <input v-model="form.inss_faixa3_aliquota" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="12" @blur="normalizarNumero('inss_faixa3_aliquota')" />
              </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Faixa 4 - Até (R$) - Teto</label>
                <input v-model="form.inss_faixa4_ate" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="7507,49" @blur="normalizarNumero('inss_faixa4_ate')" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alíquota (%)</label>
                <input v-model="form.inss_faixa4_aliquota" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="14" @blur="normalizarNumero('inss_faixa4_aliquota')" />
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-2">💡 O INSS é calculado de forma progressiva sobre cada faixa salarial</p>
          </div>
        </div>

        <!-- IRRF - COM DEDUÇÃO -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="heroicons:document-text" class="text-purple-600" size="24" />
            IRRF - Imposto de Renda
          </h3>
          <div class="space-y-4">
            <!-- Faixa 1 - Isento -->
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Faixa 1 - Até (R$)</label>
                <input v-model="form.irrf_faixa1_ate" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="2112,00" @blur="normalizarNumero('irrf_faixa1_ate')" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alíquota (%)</label>
                <input v-model="form.irrf_faixa1_aliquota" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" placeholder="0" disabled />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Dedução (R$)</label>
                <input v-model="form.irrf_faixa1_deducao" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" placeholder="0" disabled />
              </div>
            </div>
            <!-- Faixa 2 -->
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Faixa 2 - Até (R$)</label>
                <input v-model="form.irrf_faixa2_ate" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="2826,65" @blur="normalizarNumero('irrf_faixa2_ate')" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alíquota (%)</label>
                <input v-model="form.irrf_faixa2_aliquota" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="7,5" @blur="normalizarNumero('irrf_faixa2_aliquota')" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Dedução (R$)</label>
                <input v-model="form.irrf_faixa2_deducao" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="158,40" @blur="normalizarNumero('irrf_faixa2_deducao')" />
              </div>
            </div>
            <!-- Faixa 3 -->
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Faixa 3 - Até (R$)</label>
                <input v-model="form.irrf_faixa3_ate" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="3751,05" @blur="normalizarNumero('irrf_faixa3_ate')" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alíquota (%)</label>
                <input v-model="form.irrf_faixa3_aliquota" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="15" @blur="normalizarNumero('irrf_faixa3_aliquota')" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Dedução (R$)</label>
                <input v-model="form.irrf_faixa3_deducao" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="370,40" @blur="normalizarNumero('irrf_faixa3_deducao')" />
              </div>
            </div>
            <!-- Faixa 4 -->
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Faixa 4 - Até (R$)</label>
                <input v-model="form.irrf_faixa4_ate" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="4664,68" @blur="normalizarNumero('irrf_faixa4_ate')" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alíquota (%)</label>
                <input v-model="form.irrf_faixa4_aliquota" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="22,5" @blur="normalizarNumero('irrf_faixa4_aliquota')" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Dedução (R$)</label>
                <input v-model="form.irrf_faixa4_deducao" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="651,73" @blur="normalizarNumero('irrf_faixa4_deducao')" />
              </div>
            </div>
            <!-- Faixa 5 -->
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Faixa 5 - Acima</label>
                <input value="Acima do valor anterior" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" disabled />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alíquota (%)</label>
                <input v-model="form.irrf_faixa5_aliquota" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="27,5" @blur="normalizarNumero('irrf_faixa5_aliquota')" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Dedução (R$)</label>
                <input v-model="form.irrf_faixa5_deducao" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="884,96" @blur="normalizarNumero('irrf_faixa5_deducao')" />
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-2">💡 A dedução é aplicada após o cálculo da alíquota sobre a base de cálculo</p>
          </div>
        </div>

        <!-- FGTS e Benefícios -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="heroicons:banknotes" class="text-green-600" size="24" />
            FGTS e Benefícios
          </h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">FGTS - Alíquota (%)</label>
              <input v-model="form.fgts_aliquota" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="8" @blur="normalizarNumero('fgts_aliquota')" />
              <p class="text-xs text-gray-500 mt-1">Padrão: 8% (pago pela empresa)</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Vale Transporte - Desconto Máximo (%)</label>
              <input v-model="form.vale_transporte_desconto_max" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="6" @blur="normalizarNumero('vale_transporte_desconto_max')" />
              <p class="text-xs text-gray-500 mt-1">Padrão: 6% do salário</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Vale Alimentação - Valor Padrão (R$)</label>
              <input v-model="form.vale_alimentacao_valor" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0,00" @blur="normalizarNumero('vale_alimentacao_valor')" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Vale Refeição - Valor Padrão (R$)</label>
              <input v-model="form.vale_refeicao_valor" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0,00" @blur="normalizarNumero('vale_refeicao_valor')" />
            </div>
          </div>
        </div>

        <!-- Salário Família -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="heroicons:user-group" class="text-amber-600" size="24" />
            Salário Família
          </h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor por Filho (R$)</label>
              <input v-model="form.salario_familia_valor" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="62,04" @blur="normalizarNumero('salario_familia_valor')" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Limite de Salário (R$)</label>
              <input v-model="form.salario_familia_limite" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="1819,26" @blur="normalizarNumero('salario_familia_limite')" />
              <p class="text-xs text-gray-500 mt-1">Salário máximo para ter direito</p>
            </div>
          </div>
        </div>

        <!-- Adiantamento Salarial -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="heroicons:banknotes" class="text-blue-600" size="24" />
            💰 Adiantamento Salarial
          </h3>
          <div class="space-y-4">
            <!-- Toggle Habilitar -->
            <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div class="flex-1">
                <h4 class="font-semibold text-blue-900">Habilitar Adiantamento Salarial</h4>
                <p class="text-sm text-blue-700 mt-1">
                  Permite gerar adiantamentos de salário para os colaboradores
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="form.adiantamento_habilitado" 
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Configurações (só aparecem se habilitado) -->
            <div v-if="form.adiantamento_habilitado" class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Percentual do Salário (%)
                </label>
                <input 
                  v-model="form.adiantamento_percentual" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                  placeholder="40" 
                  @blur="normalizarNumero('adiantamento_percentual')" 
                />
                <p class="text-xs text-gray-500 mt-1">Padrão: 40% do salário bruto</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Dia de Pagamento
                </label>
                <input 
                  v-model="form.adiantamento_dia_pagamento" 
                  type="number" 
                  min="1" 
                  max="31" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                  placeholder="20" 
                />
                <p class="text-xs text-gray-500 mt-1">Dia do mês para pagamento do adiantamento</p>
              </div>
            </div>

            <!-- Informações -->
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <div class="text-amber-600 text-xl">ℹ️</div>
                <div class="flex-1 text-sm text-amber-800">
                  <p class="font-semibold mb-2">Como funciona:</p>
                  <ul class="space-y-1 list-disc list-inside">
                    <li>O adiantamento é calculado sobre o <strong>salário bruto</strong></li>
                    <li><strong>Sem descontos</strong> de INSS, IRRF ou benefícios</li>
                    <li>Será <strong>descontado automaticamente</strong> no holerite mensal</li>
                    <li>Gere os adiantamentos em: <strong>Folha de Pagamento > Adiantamento Salarial</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botões -->
        <div class="flex gap-4">
          <NuxtLink to="/configuracoes" class="flex-1">
            <UIButton type="button" theme="admin" variant="secondary" full-width>
              Cancelar
            </UIButton>
          </NuxtLink>
          <UIButton type="submit" theme="admin" variant="primary" full-width :disabled="saving">
            {{ saving ? 'Salvando...' : 'Salvar Parâmetros' }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: false,
})

const loading = ref(true)
const saving = ref(false)

const form = ref<any>({
  id: null,
  // INSS - SEM DEDUÇÃO
  inss_faixa1_ate: 1320.00,
  inss_faixa1_aliquota: 7.5,
  inss_faixa2_ate: 2571.29,
  inss_faixa2_aliquota: 9.0,
  inss_faixa3_ate: 3856.94,
  inss_faixa3_aliquota: 12.0,
  inss_faixa4_ate: 7507.49,
  inss_faixa4_aliquota: 14.0,
  // IRRF - COM DEDUÇÃO
  irrf_faixa1_ate: 2112.00,
  irrf_faixa1_aliquota: 0.0,
  irrf_faixa1_deducao: 0.0,
  irrf_faixa2_ate: 2826.65,
  irrf_faixa2_aliquota: 7.5,
  irrf_faixa2_deducao: 158.40,
  irrf_faixa3_ate: 3751.05,
  irrf_faixa3_aliquota: 15.0,
  irrf_faixa3_deducao: 370.40,
  irrf_faixa4_ate: 4664.68,
  irrf_faixa4_aliquota: 22.5,
  irrf_faixa4_deducao: 651.73,
  irrf_faixa5_aliquota: 27.5,
  irrf_faixa5_deducao: 884.96,
  // FGTS e Benefícios
  fgts_aliquota: 8.0,
  vale_transporte_desconto_max: 6.0,
  vale_alimentacao_valor: 0.0,
  vale_refeicao_valor: 0.0,
  // Salário Família
  salario_familia_valor: 62.04,
  salario_familia_limite: 1819.26,
  // Adiantamento Salarial
  adiantamento_habilitado: false,
  adiantamento_percentual: 40,
  adiantamento_dia_pagamento: 20,
})

// Carregar dados
onMounted(async () => {
  try {
    const response = await $fetch<{ success: boolean; data: any }>('/api/parametros-folha')
    if (response.success && response.data) {
      form.value = { ...form.value, ...response.data }
    }
  } catch (error: any) {
    console.error('Erro ao carregar parâmetros:', error)
    alert('Erro ao carregar parâmetros de folha')
  } finally {
    loading.value = false
  }
})

// Normalizar número (aceita vírgula ou ponto)
const normalizarNumero = (campo: string) => {
  let valor = (form.value as any)[campo]
  if (typeof valor === 'string') {
    valor = valor.trim().replace(',', '.')
  }
  const numeroNormalizado = parseFloat(valor)
  if (!isNaN(numeroNormalizado)) {
    (form.value as any)[campo] = numeroNormalizado
  }
}

// Normalizar todos os campos numéricos antes de salvar
const normalizarTodosCampos = () => {
  const camposNumericos = [
    'inss_faixa1_ate', 'inss_faixa1_aliquota',
    'inss_faixa2_ate', 'inss_faixa2_aliquota',
    'inss_faixa3_ate', 'inss_faixa3_aliquota',
    'inss_faixa4_ate', 'inss_faixa4_aliquota',
    'irrf_faixa1_ate', 'irrf_faixa1_aliquota', 'irrf_faixa1_deducao',
    'irrf_faixa2_ate', 'irrf_faixa2_aliquota', 'irrf_faixa2_deducao',
    'irrf_faixa3_ate', 'irrf_faixa3_aliquota', 'irrf_faixa3_deducao',
    'irrf_faixa4_ate', 'irrf_faixa4_aliquota', 'irrf_faixa4_deducao',
    'irrf_faixa5_aliquota', 'irrf_faixa5_deducao',
    'fgts_aliquota', 'vale_transporte_desconto_max',
    'vale_alimentacao_valor', 'vale_refeicao_valor',
    'salario_familia_valor', 'salario_familia_limite',
    'adiantamento_percentual',
  ]
  camposNumericos.forEach(campo => normalizarNumero(campo))
}

// Salvar
const salvar = async () => {
  normalizarTodosCampos()
  
  if (!form.value.id) {
    alert('❌ Erro: ID dos parâmetros não encontrado. Recarregue a página.')
    return
  }
  
  saving.value = true
  try {
    const response = await $fetch<{ success: boolean; data: any }>('/api/parametros-folha', {
      method: 'PUT',
      body: form.value
    })

    if (response.success) {
      alert('✅ Parâmetros de folha atualizados com sucesso!')
      navigateTo('/configuracoes')
    }
  } catch (error: any) {
    console.error('Erro ao salvar:', error)
    alert(`Erro ao salvar: ${error.data?.message || error.message || 'Erro desconhecido'}`)
  } finally {
    saving.value = false
  }
}
</script>
