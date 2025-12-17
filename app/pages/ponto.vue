<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <NuxtLink to="/admin" class="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors">
              <Icon name="heroicons:arrow-left" class="text-white" size="20" />
            </NuxtLink>
            <div>
              <h1 class="text-xl font-bold text-gray-800">Ponto Eletronico</h1>
              <p class="text-sm text-gray-500">Gestao de registros de ponto</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <UIButton variant="outline" icon-left="heroicons:arrow-down-tray" size="sm" @click="exportarRelatorio">Exportar</UIButton>
            <UIButton variant="outline" icon-left="heroicons:document-text" size="sm" @click="abrirModalAssinaturas">Assinaturas</UIButton>
            <UIButton icon-left="heroicons:plus" size="sm" @click="abrirModalNovo">Novo Registro</UIButton>
            <UserProfileDropdown theme="admin" />
          </div>
        </div>
      </div>
    </header>
    <div class="max-w-7xl mx-auto p-8">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:users" class="text-blue-600" size="20" />
            </div>
            <div>
              <p class="text-xs text-gray-500">Registros Hoje</p>
              <p class="text-xl font-bold text-gray-800">{{ stats.totalHoje }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:calendar" class="text-green-600" size="20" />
            </div>
            <div>
              <p class="text-xs text-gray-500">Total do Mes</p>
              <p class="text-xl font-bold text-gray-800">{{ stats.totalMes }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:exclamation-triangle" class="text-amber-600" size="20" />
            </div>
            <div>
              <p class="text-xs text-gray-500">Pendentes</p>
              <p class="text-xl font-bold text-gray-800">{{ stats.pendentes }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:x-circle" class="text-red-600" size="20" />
            </div>
            <div>
              <p class="text-xs text-gray-500">Faltas</p>
              <p class="text-xl font-bold text-gray-800">{{ stats.faltas || 0 }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:clock" class="text-purple-600" size="20" />
            </div>
            <div>
              <p class="text-xs text-gray-500">Hora Atual</p>
              <p class="text-xl font-bold text-gray-800 font-mono">{{ horaAtual }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Mes:</label>
            <select v-model="filtros.mes" @change="buscarRegistros" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option v-for="m in 12" :key="m" :value="m">{{ meses[m-1] }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Ano:</label>
            <select v-model="filtros.ano" @change="buscarRegistros" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option v-for="a in anos" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Colaborador:</label>
            <select v-model="filtros.colaboradorId" @change="buscarRegistros" class="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[200px]">
              <option value="">Todos</option>
              <option v-for="c in colaboradores" :key="c.id" :value="c.id">{{ c.nome }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Status:</label>
            <select v-model="filtros.status" @change="buscarRegistros" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Todos</option>
              <option value="Normal">Normal</option>
              <option value="Falta">Falta</option>
              <option value="Atestado">Atestado</option>
            </select>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Colaborador</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Data</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Entrada</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Intervalo Entrada</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Intervalo Saida</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Saida</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Horas</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acoes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="loading" class="text-center">
                <td colspan="9" class="px-4 py-12">
                  <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto" size="32" />
                  <p class="text-gray-500 mt-2">Carregando...</p>
                </td>
              </tr>
              <tr v-else-if="registros.length === 0" class="text-center">
                <td colspan="9" class="px-4 py-12">
                  <Icon name="heroicons:clock" class="text-gray-300 mx-auto" size="48" />
                  <p class="text-gray-500 mt-2">Nenhum registro encontrado</p>
                </td>
              </tr>
              <tr v-for="r in registros" :key="r.id" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Icon name="heroicons:user" class="text-gray-500" size="16" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-800">{{ r.colaborador?.nome || 'N/A' }}</p>
                      <p class="text-xs text-gray-500">{{ r.colaborador?.departamento?.nome || '' }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <p class="text-sm text-gray-800">{{ formatarData(r.data) }}</p>
                  <p class="text-xs text-gray-500">{{ getDiaSemana(r.data) }}</p>
                </td>
                <td class="px-4 py-3 text-center text-sm font-mono" :class="r.entrada_1 ? 'text-green-600 font-medium' : 'text-gray-300'">
                  {{ formatarHora(r.entrada_1) }}
                </td>
                <td class="px-4 py-3 text-center text-sm font-mono" :class="r.saida_1 ? 'text-amber-600' : 'text-gray-300'">
                  {{ formatarHora(r.saida_1) }}
                </td>
                <td class="px-4 py-3 text-center text-sm font-mono" :class="r.entrada_2 ? 'text-blue-600' : 'text-gray-300'">
                  {{ formatarHora(r.entrada_2) }}
                </td>
                <td class="px-4 py-3 text-center text-sm font-mono" :class="r.saida_2 ? 'text-red-600 font-medium' : 'text-gray-300'">
                  {{ formatarHora(r.saida_2) }}
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex flex-col items-center gap-1">
                    <span 
                      class="text-sm font-mono font-medium" 
                      :class="{
                        'text-green-600 animate-pulse': estaEmAndamento(r),
                        'text-green-600': !estaEmAndamento(r) && calcularHoras(r) >= 8,
                        'text-gray-600': !estaEmAndamento(r) && calcularHoras(r) < 8
                      }"
                    >
                      {{ calcularHorasFormatado(r) }}
                    </span>
                    <div v-if="obterAvisos(r).length > 0" class="flex flex-wrap gap-1 justify-center max-w-[200px]">
                      <span 
                        v-for="(aviso, idx) in obterAvisos(r)" 
                        :key="idx"
                        class="text-xs px-2 py-0.5 rounded-full cursor-help"
                        :class="{
                          'bg-green-100 text-green-700': aviso.includes('⏱️'),
                          'bg-amber-100 text-amber-700': aviso.includes('⚠️'),
                          'bg-blue-100 text-blue-700': aviso.includes('ℹ️'),
                          'bg-red-100 text-red-700': aviso.includes('❌')
                        }"
                        :title="obterDetalhes(r)"
                      >
                        {{ aviso }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-1 text-xs font-medium rounded-full" :class="getStatusClass(r.status)">
                    {{ r.status || 'Normal' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <PontoActionButtons 
                    :registro="r"
                    @edit="editarRegistro"
                    @delete="excluirRegistro"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="registros.length > 0" class="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
          <span>{{ registros.length }} registro(s)</span>
          <span>Total: <strong>{{ calcularTotalHoras() }}</strong></span>
        </div>
      </div>
    </div>
    <UIModal v-model="showModal" :title="modoEdicao ? 'Editar Registro' : 'Novo Registro'" size="md">
      <div class="space-y-4">
        <div v-if="!modoEdicao">
          <label class="block text-sm font-medium text-gray-700 mb-1">Colaborador *</label>
          <select v-model="formEdicao.colaborador_id" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="">Selecione...</option>
            <option v-for="c in colaboradores" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </select>
        </div>
        <div v-else class="bg-gray-50 rounded-lg p-4">
          <p class="font-medium text-gray-800">{{ registroSelecionado?.colaborador?.nome }}</p>
          <p class="text-sm text-gray-500">{{ formatarData(registroSelecionado?.data) }}</p>
        </div>
        <div v-if="!modoEdicao">
          <label class="block text-sm font-medium text-gray-700 mb-1">Data *</label>
          <input type="date" v-model="formEdicao.data" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Entrada</label>
            <input type="time" v-model="formEdicao.entrada_1" @change="validarFormulario" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Saida Int.</label>
            <input type="time" v-model="formEdicao.saida_1" @change="validarFormulario" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            <p class="text-xs text-gray-500 mt-1">Horário de saída para intervalo</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Retorno</label>
            <input type="time" v-model="formEdicao.entrada_2" @change="validarFormulario" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            <p class="text-xs text-gray-500 mt-1">Horário de retorno do intervalo</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Saida</label>
            <input type="time" v-model="formEdicao.saida_2" @change="validarFormulario" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
        </div>
        
        <!-- Preview do cálculo -->
        <div v-if="previewCalculo" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start gap-2">
            <Icon name="heroicons:information-circle" class="text-blue-600 mt-0.5" size="20" />
            <div class="flex-1">
              <p class="text-sm font-medium text-blue-900 mb-2">Preview do Cálculo:</p>
              <p class="text-sm text-blue-800 font-mono mb-1">
                <strong>Horas Trabalhadas:</strong> {{ previewCalculo.horasFormatadas }}
              </p>
              <p class="text-sm text-blue-800 mb-2">
                <strong>Intervalo:</strong> {{ previewCalculo.intervaloFormatado }}
              </p>
              <div v-if="previewCalculo.avisos.length > 0" class="space-y-1">
                <p 
                  v-for="(aviso, idx) in previewCalculo.avisos" 
                  :key="idx"
                  class="text-xs px-2 py-1 rounded"
                  :class="{
                    'bg-amber-100 text-amber-800': aviso.includes('⚠️'),
                    'bg-blue-100 text-blue-800': aviso.includes('ℹ️'),
                    'bg-red-100 text-red-800': aviso.includes('❌')
                  }"
                >
                  {{ aviso }}
                </p>
              </div>
              <details class="mt-2">
                <summary class="text-xs text-blue-700 cursor-pointer hover:text-blue-800">Ver detalhes do cálculo</summary>
                <pre class="text-xs text-blue-800 mt-2 whitespace-pre-wrap">{{ previewCalculo.detalhes }}</pre>
              </details>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="formEdicao.status" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="Normal">Normal</option>
            <option value="Falta">Falta</option>
            <option value="Atestado">Atestado</option>
            <option value="Ajustado">Ajustado</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Justificativa</label>
          <textarea v-model="formEdicao.justificativa" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UIButton variant="outline" @click="showModal = false">Cancelar</UIButton>
          <UIButton @click="salvarRegistro" :loading="salvando">{{ modoEdicao ? 'Salvar' : 'Criar' }}</UIButton>
        </div>
      </template>
    </UIModal>

    <!-- Modal de Assinaturas -->
    <UIModal v-model="showModalAssinaturas" title="Gerenciar Assinaturas de Ponto" size="lg">
      <div class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start gap-2">
            <Icon name="heroicons:information-circle" class="text-blue-600 mt-0.5" size="20" />
            <div>
              <p class="text-sm font-medium text-blue-900 mb-1">Como funciona:</p>
              <ul class="text-sm text-blue-800 space-y-1">
                <li>• Colaboradores podem baixar ponto dos últimos 30 dias</li>
                <li>• Após assinar, o histórico fica bloqueado até o próximo período</li>
                <li>• Você pode zerar a assinatura para liberar novo download</li>
                <li>• Útil quando colaborador assina antes do prazo (ex: dia 20 ao invés do dia 5)</li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="assinaturas.length === 0" class="text-center py-8">
          <Icon name="heroicons:document-text" class="text-gray-300 mx-auto mb-2" size="48" />
          <p class="text-gray-500">Nenhuma assinatura encontrada</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="assinatura in assinaturas" :key="assinatura.id" class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:user" class="text-gray-500" size="20" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-800">{{ assinatura.colaborador?.nome || 'N/A' }}</p>
                    <p class="text-sm text-gray-500">{{ assinatura.colaborador?.departamento?.nome || '' }}</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Data da Assinatura:</span>
                    <p class="font-medium">{{ formatarData(assinatura.data_assinatura) }}</p>
                  </div>
                  <div>
                    <span class="text-gray-500">Período:</span>
                    <p class="font-medium">{{ meses[assinatura.mes - 1] }}/{{ assinatura.ano }}</p>
                  </div>
                  <div>
                    <span class="text-gray-500">IP:</span>
                    <p class="font-medium font-mono text-xs">{{ assinatura.ip_assinatura || 'N/A' }}</p>
                  </div>
                  <div>
                    <span class="text-gray-500">Criado em:</span>
                    <p class="font-medium">{{ formatarData(assinatura.created_at) }}</p>
                  </div>
                </div>

                <div v-if="assinatura.hash_assinatura" class="mt-2">
                  <span class="text-gray-500 text-sm">Hash:</span>
                  <p class="font-mono text-xs text-gray-600 break-all">{{ assinatura.hash_assinatura }}</p>
                </div>
              </div>

              <div class="flex flex-col gap-2 ml-4">
                <button 
                  @click="zerarAssinatura(assinatura)"
                  class="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors"
                  title="Zerar assinatura - permite novo download"
                >
                  <Icon name="heroicons:arrow-path" size="16" class="inline mr-1" />
                  Zerar
                </button>
                <button 
                  @click="excluirAssinatura(assinatura)"
                  class="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                  title="Excluir assinatura permanentemente"
                >
                  <Icon name="heroicons:trash" size="16" class="inline mr-1" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end">
          <UIButton variant="outline" @click="showModalAssinaturas = false">Fechar</UIButton>
        </div>
      </template>
    </UIModal>
  </div>
</template>

<script setup lang="ts">
import { calcularHorasTrabalhadas, calcularTotalRegistros, formatarHora, registroEmAndamento } from '~/utils/pontoCalculos'
import { usePontoTempoReal } from '~/composables/usePontoTempoReal'

definePageMeta({ middleware: ['admin'], layout: false })

const meses = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const diasSemana = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']
const anoAtual = new Date().getFullYear()
const anos = [anoAtual - 1, anoAtual, anoAtual + 1]

const loading = ref(false)
const salvando = ref(false)
const showModal = ref(false)
const showModalAssinaturas = ref(false)
const modoEdicao = ref(false)
const horaAtual = ref('')
const registros = ref<any[]>([])
const colaboradores = ref<any[]>([])
const assinaturas = ref<any[]>([])
const registroSelecionado = ref<any>(null)
const stats = ref({ totalHoje: 0, totalMes: 0, pendentes: 0, faltas: 0 })
const filtros = ref({ 
  mes: new Date().getMonth() + 1, 
  ano: anoAtual, 
  colaboradorId: '', 
  status: '' 
})
const formEdicao = ref({ 
  colaborador_id: '', 
  data: new Date().toISOString().split('T')[0], 
  entrada_1: '', 
  saida_1: '', 
  entrada_2: '', 
  saida_2: '', 
  status: 'Normal', 
  justificativa: '' 
})

const previewCalculo = ref<any>(null)

// Usar composable de tempo real
const { calcularHoras: calcularHorasComTempoReal } = usePontoTempoReal(registros)

let intervalId: ReturnType<typeof setInterval>

onMounted(() => { 
  atualizarHora()
  intervalId = setInterval(atualizarHora, 1000)
  carregarDados() 
})

onUnmounted(() => { 
  if (intervalId) clearInterval(intervalId) 
})

const atualizarHora = () => { 
  horaAtual.value = new Date().toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  }) 
}

const carregarDados = async () => { 
  await Promise.all([buscarRegistros(), buscarColaboradores(), buscarStats()]) 
}

const abrirModalAssinaturas = async () => {
  await buscarAssinaturas()
  showModalAssinaturas.value = true
}

const buscarAssinaturas = async () => {
  try {
    assinaturas.value = await $fetch('/api/admin/assinaturas-ponto')
  } catch (e) {
    console.error('Erro ao buscar assinaturas:', e)
  }
}

const zerarAssinatura = async (assinatura: any) => {
  if (!confirm(`Zerar assinatura de ${assinatura.colaborador?.nome}?\n\nIsso permitirá que o colaborador baixe novamente os últimos 30 dias de ponto.`)) return
  
  try {
    await $fetch(`/api/admin/assinaturas-ponto/${assinatura.id}/zerar`, { method: 'POST' })
    await buscarAssinaturas()
    alert('Assinatura zerada com sucesso! O colaborador pode baixar o ponto novamente.')
  } catch (e: any) {
    alert(e.data?.message || 'Erro ao zerar assinatura')
  }
}

const excluirAssinatura = async (assinatura: any) => {
  if (!confirm(`Excluir permanentemente a assinatura de ${assinatura.colaborador?.nome}?`)) return
  
  try {
    await $fetch(`/api/admin/assinaturas-ponto/${assinatura.id}`, { method: 'DELETE' })
    await buscarAssinaturas()
    alert('Assinatura excluída com sucesso!')
  } catch (e: any) {
    alert(e.data?.message || 'Erro ao excluir assinatura')
  }
}

const buscarRegistros = async () => { 
  loading.value = true
  try { 
    const params = new URLSearchParams({ 
      mes: filtros.value.mes.toString(), 
      ano: filtros.value.ano.toString() 
    })
    if (filtros.value.colaboradorId) params.append('colaborador_id', filtros.value.colaboradorId)
    if (filtros.value.status) params.append('status', filtros.value.status)
    registros.value = await $fetch(`/api/ponto?${params}`) 
  } catch (e) { 
    console.error('Erro:', e) 
  } finally { 
    loading.value = false 
  } 
}

const buscarColaboradores = async () => { 
  try { 
    colaboradores.value = await $fetch('/api/colaboradores') 
  } catch (e) { 
    console.error('Erro:', e) 
  } 
}

const buscarStats = async () => { 
  try { 
    stats.value = await $fetch('/api/ponto/stats') as any 
  } catch (e) { 
    console.error('Erro:', e) 
  } 
}

const abrirModalNovo = () => { 
  modoEdicao.value = false
  registroSelecionado.value = null
  formEdicao.value = { 
    colaborador_id: '', 
    data: new Date().toISOString().split('T')[0], 
    entrada_1: '', 
    saida_1: '', 
    entrada_2: '', 
    saida_2: '', 
    status: 'Normal', 
    justificativa: '' 
  }
  previewCalculo.value = null
  showModal.value = true 
}

const editarRegistro = (registro: any) => { 
  modoEdicao.value = true
  registroSelecionado.value = registro
  formEdicao.value = { 
    colaborador_id: registro.colaborador_id, 
    data: registro.data, 
    entrada_1: registro.entrada_1 || '', 
    saida_1: registro.saida_1 || '', 
    entrada_2: registro.entrada_2 || '', 
    saida_2: registro.saida_2 || '', 
    status: registro.status || 'Normal', 
    justificativa: registro.justificativa || '' 
  }
  validarFormulario()
  showModal.value = true 
}

const validarFormulario = () => {
  // Calcular preview em tempo real
  previewCalculo.value = calcularHorasTrabalhadas(formEdicao.value)
}

const salvarRegistro = async () => { 
  salvando.value = true
  try { 
    if (modoEdicao.value && registroSelecionado.value) { 
      await $fetch(`/api/ponto/${registroSelecionado.value.id}`, { 
        method: 'PUT', 
        body: formEdicao.value 
      }) 
    } else { 
      await $fetch('/api/ponto', { 
        method: 'POST', 
        body: formEdicao.value 
      }) 
    }
    showModal.value = false
    await buscarRegistros()
    await buscarStats() 
  } catch (e: any) { 
    alert(e.data?.message || e.message || 'Erro ao salvar') 
  } finally { 
    salvando.value = false 
  } 
}

const excluirRegistro = async (registro: any) => { 
  if (!confirm(`Excluir registro de ${registro.colaborador?.nome}?`)) return
  try { 
    await $fetch(`/api/ponto/${registro.id}`, { method: 'DELETE' })
    
    // Remover imediatamente da lista local para feedback visual instantâneo
    const index = registros.value.findIndex(r => r.id === registro.id)
    if (index > -1) {
      registros.value.splice(index, 1)
    }
    
    // Recarregar dados do servidor para garantir sincronização
    await Promise.all([buscarRegistros(), buscarStats()])
    
    // Mostrar feedback de sucesso
    alert('Registro excluído com sucesso!')
  } catch (e: any) { 
    console.error('Erro ao excluir registro:', e)
    alert(e.data?.message || e.message || 'Erro ao excluir registro') 
    
    // Em caso de erro, recarregar dados para garantir consistência
    await buscarRegistros()
  } 
}

const exportarRelatorio = () => { 
  const headers = ['Colaborador', 'Data', 'Entrada', 'Saida Int.', 'Retorno', 'Saida', 'Horas', 'Status']
  const rows = registros.value.map(r => [
    r.colaborador?.nome || '', 
    formatarData(r.data), 
    r.entrada_1 || '', 
    r.saida_1 || '', 
    r.entrada_2 || '', 
    r.saida_2 || '', 
    calcularHorasFormatado(r), 
    r.status || 'Normal'
  ])
  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `ponto_${meses[filtros.value.mes - 1]}_${filtros.value.ano}.csv`
  link.click() 
}

const calcularHoras = (r: any): number => { 
  const resultado = calcularHorasComTempoReal(r)
  return resultado.totalMinutos / 60
}

const calcularHorasFormatado = (r: any): string => { 
  const resultado = calcularHorasComTempoReal(r)
  return resultado.horasFormatadas
}

const obterAvisos = (r: any) => {
  const resultado = calcularHorasComTempoReal(r)
  return resultado.avisos
}

const obterDetalhes = (r: any) => {
  const resultado = calcularHorasComTempoReal(r)
  return resultado.detalhes
}

const estaEmAndamento = (r: any) => {
  return registroEmAndamento(r)
}

const calcularTotalHoras = (): string => { 
  // Calcular total usando tempo real para registros em andamento
  let totalMinutos = 0
  
  registros.value.forEach(r => {
    const resultado = calcularHorasComTempoReal(r)
    totalMinutos += resultado.totalMinutos
  })
  
  const horas = Math.floor(totalMinutos / 60)
  const minutos = totalMinutos % 60
  return `${horas}h ${minutos}min`
}

const formatarData = (d: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '-'

const getDiaSemana = (d: string) => d ? diasSemana[new Date(d + 'T00:00:00').getDay()] : ''

const getStatusClass = (s: string) => { 
  const c: Record<string, string> = { 
    'Normal': 'bg-green-100 text-green-700', 
    'Falta': 'bg-red-100 text-red-700', 
    'Atestado': 'bg-blue-100 text-blue-700', 
    'Ferias': 'bg-amber-100 text-amber-700', 
    'Folga': 'bg-purple-100 text-purple-700', 
    'Ajustado': 'bg-gray-100 text-gray-700' 
  }
  return c[s] || 'bg-gray-100 text-gray-700' 
}
</script>
