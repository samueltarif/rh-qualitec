<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">📄 Gestão de Holerites</h1>
        <p class="text-gray-600">Gerencie e envie holerites para os funcionários</p>
      </div>
      
      <div class="flex gap-3">
        <UiButton 
          variant="secondary" 
          @click="mostrarModalGerar = true"
          :disabled="loading"
        >
          🤖 Gerar Automático
        </UiButton>
        
        <UiButton 
          @click="enviarTodosHolerites"
          :disabled="loading || holerites.length === 0"
        >
          📧 Enviar Todos
        </UiButton>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white p-4 rounded-xl border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UiSelect 
          v-model="filtros.empresa" 
          :options="empresasOptions" 
          label="Empresa" 
          placeholder="Todas as empresas"
        />
        
        <UiSelect 
          v-model="filtros.mes" 
          :options="mesesOptions" 
          label="Mês/Ano" 
          placeholder="Selecione o período"
        />
        
        <UiSelect 
          v-model="filtros.status" 
          :options="statusOptions" 
          label="Status" 
          placeholder="Todos os status"
        />
        
        <div class="flex items-end">
          <UiButton 
            variant="secondary" 
            @click="aplicarFiltros"
            class="w-full"
          >
            🔍 Filtrar
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Lista de Holerites -->
    <div class="bg-white rounded-xl border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Holerites Gerados</h2>
        <p class="text-sm text-gray-600">{{ holerites.length }} holerite(s) encontrado(s)</p>
      </div>
      
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Carregando holerites...</p>
      </div>
      
      <div v-else-if="holerites.length === 0" class="p-8">
        <UiEmptyState 
          title="Nenhum holerite encontrado"
          description="Gere holerites automáticos ou ajuste os filtros"
          icon="document"
        />
      </div>
      
      <div v-else class="divide-y divide-gray-200">
        <div 
          v-for="holerite in holerites" 
          :key="holerite.id"
          class="p-6 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-semibold">{{ holerite.funcionario.nome_completo.charAt(0) }}</span>
              </div>
              
              <div>
                <h3 class="font-semibold text-gray-900">{{ holerite.funcionario.nome_completo }}</h3>
                <p class="text-sm text-gray-600">{{ holerite.funcionario.cargo || 'Cargo não definido' }}</p>
                <p class="text-xs text-gray-500">{{ holerite.funcionario.empresa || 'Empresa não definida' }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="font-semibold text-gray-900">{{ formatarMoeda(holerite.salario_liquido) }}</p>
                <p class="text-sm text-gray-600">{{ formatarPeriodo(holerite.periodo_inicio, holerite.periodo_fim) }}</p>
                <span 
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    holerite.status === 'enviado' ? 'bg-green-100 text-green-800' :
                    holerite.status === 'gerado' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ getStatusLabel(holerite.status) }}
                </span>
              </div>
              
              <div class="flex gap-2">
                <UiButton 
                  variant="secondary" 
                  size="sm"
                  @click="visualizarHolerite(holerite)"
                >
                  👁️ Ver
                </UiButton>
                
                <UiButton 
                  variant="secondary" 
                  size="sm"
                  @click="editarHolerite(holerite)"
                >
                  ✏️ Editar
                </UiButton>
                
                <UiButton 
                  size="sm"
                  @click="enviarHolerite(holerite)"
                  :disabled="holerite.status === 'enviado'"
                >
                  📧 Enviar
                </UiButton>
                
                <UiButton 
                  variant="danger" 
                  size="sm"
                  @click="excluirHolerite(holerite)"
                >
                  🗑️ Excluir
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Visualização -->
    <UiModal 
      v-model="modalVisualizacao" 
      title="Visualizar Holerite"
      max-width="max-w-3xl"
    >
      <HoleriteModal 
        v-if="holeriteSelecionado" 
        :holerite="holeriteSelecionado"
        @close="modalVisualizacao = false"
      />
    </UiModal>

    <!-- Modal de Edição -->
    <UiModal 
      v-model="modalEdicao" 
      title="Editar Holerite"
      max-width="max-w-4xl"
    >
      <HoleriteEditForm
        v-if="holeriteSelecionado"
        :holerite="holeriteSelecionado"
        @save="salvarEdicaoHolerite"
        @cancel="modalEdicao = false"
      />
    </UiModal>

    <!-- Modal de Geração -->
    <UiModal 
      v-model="mostrarModalGerar" 
      title="Gerar Holerites Automáticos"
      max-width="max-w-lg"
    >
      <div class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-800">
            <strong>📋 O que será feito:</strong><br>
            • Gerar holerites para todos os funcionários ativos<br>
            • Período: Primeira quinzena do mês atual<br>
            • Cálculos automáticos de INSS, IRRF e descontos
          </p>
        </div>

        <div class="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <input 
            type="checkbox" 
            id="recriar" 
            v-model="opcoesGeracao.recriar"
            class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          >
          <label for="recriar" class="text-sm text-yellow-800 cursor-pointer">
            <strong>🔄 Recriar holerites existentes</strong><br>
            <span class="text-xs">Se marcado, holerites já gerados para este período serão excluídos e recriados</span>
          </label>
        </div>

        <div class="flex gap-3 justify-end pt-4 border-t">
          <UiButton 
            variant="secondary" 
            @click="mostrarModalGerar = false"
          >
            Cancelar
          </UiButton>
          <UiButton 
            @click="confirmarGeracaoHolerites"
            :disabled="loading"
          >
            {{ loading ? 'Gerando...' : '✓ Confirmar Geração' }}
          </UiButton>
        </div>
      </div>
    </UiModal>

    <!-- Notificação -->
    <UiNotification 
      v-if="mostrarNotificacao" 
      :show="mostrarNotificacao"
      :title="notificacao.title" 
      :message="notificacao.message" 
      :variant="notificacao.variant" 
      @close="mostrarNotificacao = false"
    />
  </div>
</template>

<script setup lang="ts">
// Imports
import HoleriteModal from '~/components/holerites/HoleriteModal.vue'
import HoleriteEditForm from '~/components/holerites/HoleriteEditForm.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

// Interfaces
interface Funcionario {
  nome_completo: string
  cargo: string
  empresa: string
}

interface Holerite {
  id: number
  funcionario_id: number
  funcionario: Funcionario
  periodo_inicio: string
  periodo_fim: string
  salario_base: number
  salario_liquido: number
  status: 'gerado' | 'enviado' | 'visualizado'
  bonus?: number
  horas_extras?: number
  adicional_noturno?: number
  adicional_periculosidade?: number
  adicional_insalubridade?: number
  comissoes?: number
  inss?: number
  irrf?: number
  vale_transporte?: number
  vale_refeicao_desconto?: number
  plano_saude?: number
  plano_odontologico?: number
  adiantamento?: number
  faltas?: number
  horas_trabalhadas?: number
  data_pagamento?: string
  observacoes?: string
}

interface Notificacao {
  title: string
  message: string
  variant: 'success' | 'error' | 'warning' | 'info'
}

// Estados
const loading = ref(false)
const holerites = ref<Holerite[]>([])
const modalVisualizacao = ref(false)
const modalEdicao = ref(false)
const mostrarModalGerar = ref(false)
const holeriteSelecionado = ref<Holerite | null>(null)
const mostrarNotificacao = ref(false)
const notificacao = ref<Notificacao>({ title: '', message: '', variant: 'info' })
const empresas = ref<any[]>([])

// Opções de geração
const opcoesGeracao = ref({
  recriar: false
})

// Filtros
const filtros = ref({
  empresa: '',
  mes: '',
  status: ''
})

// Opções para os selects
const empresasOptions = computed(() => [
  { value: '', label: 'Todas as empresas' },
  ...empresas.value.map(e => ({
    value: e.id.toString(),
    label: e.nome_fantasia
  }))
])

const mesesOptions = computed(() => {
  const opcoes = [{ value: '', label: 'Todos os períodos' }]
  const hoje = new Date()
  
  for (let i = 0; i < 12; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const valor = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
    const label = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    opcoes.push({ value: valor, label })
  }
  
  return opcoes
})

const statusOptions = computed(() => [
  { value: '', label: 'Todos os status' },
  { value: 'gerado', label: 'Gerado' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'visualizado', label: 'Visualizado' }
])

// Funções
const carregarHolerites = async () => {
  loading.value = true
  try {
    // Buscar holerites da API
    const params: any = {}
    
    if (filtros.value.empresa) params.empresa = filtros.value.empresa
    if (filtros.value.mes) params.mes = filtros.value.mes
    if (filtros.value.status) params.status = filtros.value.status
    
    const data = await $fetch('/api/holerites', { params })
    holerites.value = data as Holerite[]
  } catch (error) {
    console.error('Erro ao carregar holerites:', error)
    notificacao.value = {
      title: 'Erro!',
      message: 'Erro ao carregar holerites do banco de dados',
      variant: 'error'
    }
    mostrarNotificacao.value = true
  } finally {
    loading.value = false
  }
}

const gerarHoleritesAutomaticos = async () => {
  loading.value = true
  try {
    // Chamar API para gerar holerites
    const resultado: any = await $fetch('/api/holerites/gerar', {
      method: 'POST',
      body: {
        // Período atual (primeira quinzena do mês)
        periodo_inicio: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
        periodo_fim: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-15`,
        recriar: opcoesGeracao.value.recriar
      }
    })
    
    notificacao.value = {
      title: 'Sucesso!',
      message: resultado.message || 'Holerites gerados com sucesso',
      variant: 'success'
    }
    mostrarNotificacao.value = true
    
    // Recarregar lista
    await carregarHolerites()
  } catch (error: any) {
    notificacao.value = {
      title: 'Erro!',
      message: error.data?.message || 'Erro ao gerar holerites automaticamente',
      variant: 'error'
    }
    mostrarNotificacao.value = true
  } finally {
    loading.value = false
  }
}

const confirmarGeracaoHolerites = async () => {
  mostrarModalGerar.value = false
  await gerarHoleritesAutomaticos()
}

const enviarTodosHolerites = async () => {
  loading.value = true
  try {
    // Simular envio em massa
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    notificacao.value = {
      title: 'Sucesso!',
      message: `${holerites.value.length} holerites enviados por email`,
      variant: 'success'
    }
    mostrarNotificacao.value = true
    
    // Atualizar status dos holerites
    holerites.value.forEach(h => h.status = 'enviado')
  } catch (error) {
    notificacao.value = {
      title: 'Erro!',
      message: 'Erro ao enviar holerites',
      variant: 'error'
    }
    mostrarNotificacao.value = true
  } finally {
    loading.value = false
  }
}

const visualizarHolerite = (holerite: Holerite) => {
  holeriteSelecionado.value = holerite
  modalVisualizacao.value = true
}

const editarHolerite = (holerite: Holerite) => {
  holeriteSelecionado.value = { ...holerite }
  modalEdicao.value = true
}

const enviarHolerite = async (holerite: Holerite) => {
  try {
    loading.value = true
    
    // Chamar API para enviar email
    const resultado: any = await $fetch(`/api/holerites/${holerite.id}/enviar-email`, {
      method: 'POST'
    })
    
    // Atualizar status do holerite
    holerite.status = 'enviado'
    
    notificacao.value = {
      title: 'Enviado!',
      message: `Holerite enviado para ${holerite.funcionario.nome_completo} (${resultado.email})`,
      variant: 'success'
    }
    mostrarNotificacao.value = true
    
    // Recarregar lista
    await carregarHolerites()
  } catch (error: any) {
    notificacao.value = {
      title: 'Erro!',
      message: error.data?.message || 'Erro ao enviar holerite',
      variant: 'error'
    }
    mostrarNotificacao.value = true
  } finally {
    loading.value = false
  }
}

const salvarEdicaoHolerite = async (dadosAtualizados: any) => {
  if (!holeriteSelecionado.value) return
  
  try {
    loading.value = true
    
    // Chamar API para atualizar
    const resultado: any = await $fetch(`/api/holerites/${holeriteSelecionado.value.id}`, {
      method: 'PATCH',
      body: dadosAtualizados
    })
    
    modalEdicao.value = false
    
    notificacao.value = {
      title: 'Salvo!',
      message: 'Holerite atualizado com sucesso',
      variant: 'success'
    }
    mostrarNotificacao.value = true
    
    // Recarregar lista para garantir dados atualizados
    await carregarHolerites()
  } catch (error: any) {
    notificacao.value = {
      title: 'Erro!',
      message: error.data?.message || 'Erro ao salvar alterações',
      variant: 'error'
    }
    mostrarNotificacao.value = true
  } finally {
    loading.value = false
  }
}

const aplicarFiltros = () => {
  // Implementar filtros
  carregarHolerites()
}

const excluirHolerite = async (holerite: Holerite) => {
  // Confirmar exclusão
  if (!confirm(`Tem certeza que deseja excluir o holerite de ${holerite.funcionario.nome_completo}?\n\nEsta ação não pode ser desfeita.`)) {
    return
  }
  
  try {
    loading.value = true
    
    // Chamar API para excluir
    await $fetch(`/api/holerites/${holerite.id}`, {
      method: 'DELETE'
    })
    
    notificacao.value = {
      title: 'Excluído!',
      message: `Holerite de ${holerite.funcionario.nome_completo} excluído com sucesso`,
      variant: 'success'
    }
    mostrarNotificacao.value = true
    
    // Recarregar lista
    await carregarHolerites()
  } catch (error: any) {
    notificacao.value = {
      title: 'Erro!',
      message: error.data?.message || 'Erro ao excluir holerite',
      variant: 'error'
    }
    mostrarNotificacao.value = true
  } finally {
    loading.value = false
  }
}

// Funções de formatação
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

const formatarPeriodo = (inicio: string, fim: string) => {
  const dataInicio = new Date(inicio).toLocaleDateString('pt-BR')
  const dataFim = new Date(fim).toLocaleDateString('pt-BR')
  return `${dataInicio} - ${dataFim}`
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    gerado: 'Gerado',
    enviado: 'Enviado',
    visualizado: 'Visualizado'
  }
  return labels[status] || status
}

// Carregar dados ao montar
onMounted(async () => {
  // Carregar empresas
  try {
    const data: any = await $fetch('/api/empresas')
    if (Array.isArray(data)) {
      empresas.value = data
    }
  } catch (error) {
    console.error('Erro ao carregar empresas:', error)
  }
  
  // Carregar holerites
  carregarHolerites()
})
</script>