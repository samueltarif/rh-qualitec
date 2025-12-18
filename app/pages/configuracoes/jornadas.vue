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
              <h1 class="text-xl font-bold text-gray-800">Jornadas de Trabalho</h1>
              <p class="text-sm text-gray-500">Configure horários, escalas e turnos</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button @click="abrirModal()" class="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors flex items-center gap-2">
              <Icon name="heroicons:plus" size="20" />
              Nova Jornada
            </button>
            <UserProfileDropdown theme="admin" />
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Loading -->
      <div v-if="loading" class="card text-center py-12">
        <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-4" size="48" />
        <p class="text-gray-600">Carregando jornadas...</p>
      </div>

      <!-- Lista de Jornadas -->
      <div v-else class="space-y-6">
        <!-- Info -->
        <div class="card bg-blue-50 border-2 border-blue-200">
          <div class="flex items-start gap-3">
            <Icon name="heroicons:information-circle" class="text-blue-600 flex-shrink-0" size="24" />
            <div>
              <h3 class="font-semibold text-blue-900 mb-1">Sobre Jornadas de Trabalho</h3>
              <p class="text-sm text-blue-800">
                As jornadas configuradas aqui serão vinculadas aos colaboradores e usadas para controle de ponto e cálculo de horas extras.
              </p>
            </div>
          </div>
        </div>

        <!-- Grid de Jornadas -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="jornada in jornadas" 
            :key="jornada.id"
            class="card hover:shadow-lg transition-shadow cursor-pointer relative"
            @click="abrirModal(jornada)"
          >
            <!-- Badge Padrão -->
            <span v-if="jornada.padrao" class="absolute top-3 right-3 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Padrão
            </span>
            
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" :class="getTipoColor(jornada.tipo)">
                <Icon :name="getTipoIcon(jornada.tipo)" class="text-white" size="24" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-gray-800 truncate">{{ jornada.nome }}</h3>
                <p class="text-sm text-gray-500 mb-2">{{ jornada.codigo }}</p>
                
                <div class="space-y-1 text-sm text-gray-600">
                  <div class="flex items-center gap-2">
                    <Icon name="heroicons:clock" size="16" class="text-gray-400" />
                    <span>{{ jornada.hora_entrada?.slice(0,5) }} - {{ jornada.hora_saida?.slice(0,5) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Icon name="heroicons:calendar-days" size="16" class="text-gray-400" />
                    <span>{{ jornada.carga_horaria_semanal }}h/semana</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vazio -->
        <div v-if="jornadas.length === 0" class="card text-center py-12">
          <Icon name="heroicons:clock" class="text-gray-300 mx-auto mb-4" size="64" />
          <h3 class="text-lg font-semibold text-gray-600 mb-2">Nenhuma jornada cadastrada</h3>
          <p class="text-gray-500 mb-4">Crie sua primeira jornada de trabalho</p>
          <button @click="abrirModal()" class="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800">
            Nova Jornada
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-800">
              {{ editando ? 'Editar Jornada' : 'Nova Jornada' }}
            </h2>
            <button @click="fecharModal()" class="text-gray-400 hover:text-gray-600">
              <Icon name="heroicons:x-mark" size="24" />
            </button>
          </div>
        </div>
        
        <form @submit.prevent="salvar" class="p-6 space-y-6">
          <!-- Identificação -->
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input v-model="form.nome" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: Comercial Padrão" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input v-model="form.codigo" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ex: COM-44" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea v-model="form.descricao" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Descrição da jornada"></textarea>
          </div>

          <!-- Tipo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Jornada</label>
            <select v-model="form.tipo" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="padrao">Padrão (CLT)</option>
              <option value="escala">Escala</option>
              <option value="12x36">12x36</option>
              <option value="6x1">6x1</option>
              <option value="5x2">5x2</option>
              <option value="flexivel">Flexível</option>
              <option value="parcial">Meio Período</option>
              <option value="noturno">Noturno</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          <!-- Carga Horária -->
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Carga Horária Semanal (h)</label>
              <input v-model="form.carga_horaria_semanal" type="number" step="0.5" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Carga Horária Diária (h)</label>
              <input v-model="form.carga_horaria_diaria" type="number" step="0.5" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <!-- Horários -->
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Entrada</label>
              <input v-model="form.hora_entrada" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Saída</label>
              <input v-model="form.hora_saida" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Início Intervalo</label>
              <input v-model="form.hora_intervalo_inicio" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fim Intervalo</label>
              <input v-model="form.hora_intervalo_fim" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <!-- Tolerância -->
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tolerância Entrada (min)</label>
              <input v-model="form.tolerancia_entrada_minutos" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tolerância Saída (min)</label>
              <input v-model="form.tolerancia_saida_minutos" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <!-- Dias da Semana -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Dias de Trabalho</label>
            <div class="flex flex-wrap gap-2">
              <label v-for="(label, dia) in diasSemana" :key="dia" class="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer" :class="form.dias_trabalho[dia] ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'">
                <input type="checkbox" v-model="form.dias_trabalho[dia]" class="rounded text-red-600" />
                <span class="text-sm">{{ label }}</span>
              </label>
            </div>
          </div>

          <!-- Hora Extra -->
          <div class="space-y-4">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="form.permite_hora_extra" class="rounded text-red-600" />
              <span class="text-sm font-medium text-gray-700">Permite Hora Extra</span>
            </label>
            
            <div v-if="form.permite_hora_extra" class="grid md:grid-cols-2 gap-4 pl-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">% Hora Extra 50%</label>
                <input v-model="form.percentual_hora_extra_50" type="number" step="0.1" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">% Hora Extra 100%</label>
                <input v-model="form.percentual_hora_extra_100" type="number" step="0.1" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>

          <!-- Adicional Noturno -->
          <div class="space-y-4">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="form.adicional_noturno" class="rounded text-red-600" />
              <span class="text-sm font-medium text-gray-700">Adicional Noturno</span>
            </label>
            
            <div v-if="form.adicional_noturno" class="grid md:grid-cols-3 gap-4 pl-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Início Noturno</label>
                <input v-model="form.hora_inicio_noturno" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fim Noturno</label>
                <input v-model="form.hora_fim_noturno" type="time" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">% Adicional</label>
                <input v-model="form.percentual_adicional_noturno" type="number" step="0.1" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>

          <!-- Padrão -->
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.padrao" class="rounded text-red-600" />
            <span class="text-sm font-medium text-gray-700">Definir como jornada padrão da empresa</span>
          </label>

          <!-- Botões -->
          <div class="flex gap-4 pt-4 border-t">
            <button v-if="editando" type="button" @click="excluir" class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
              Excluir
            </button>
            <div class="flex-1"></div>
            <button type="button" @click="fecharModal()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50">
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
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
const showModal = ref(false)
const editando = ref(false)
const jornadas = ref<any[]>([])

const diasSemana = {
  domingo: 'Dom',
  segunda: 'Seg',
  terca: 'Ter',
  quarta: 'Qua',
  quinta: 'Qui',
  sexta: 'Sex',
  sabado: 'Sáb'
}

const formInicial = {
  id: null,
  nome: '',
  descricao: '',
  codigo: '',
  tipo: 'padrao',
  carga_horaria_semanal: 44,
  carga_horaria_diaria: 8,
  hora_entrada: '08:00',
  hora_saida: '17:00',
  hora_intervalo_inicio: '12:00',
  hora_intervalo_fim: '13:00',
  tolerancia_entrada_minutos: 10,
  tolerancia_saida_minutos: 10,
  dias_trabalho: {
    domingo: false,
    segunda: true,
    terca: true,
    quarta: true,
    quinta: true,
    sexta: true,
    sabado: false
  },
  permite_hora_extra: true,
  percentual_hora_extra_50: 50,
  percentual_hora_extra_100: 100,
  adicional_noturno: false,
  hora_inicio_noturno: '22:00',
  hora_fim_noturno: '05:00',
  percentual_adicional_noturno: 20,
  padrao: false
}

const form = ref({ ...formInicial })

const getTipoColor = (tipo: string) => {
  const colors: Record<string, string> = {
    padrao: 'bg-blue-500',
    escala: 'bg-purple-500',
    '12x36': 'bg-orange-500',
    '6x1': 'bg-amber-500',
    '5x2': 'bg-green-500',
    flexivel: 'bg-cyan-500',
    parcial: 'bg-pink-500',
    noturno: 'bg-indigo-500',
    personalizado: 'bg-gray-500'
  }
  return colors[tipo] || 'bg-gray-500'
}

const getTipoIcon = (tipo: string) => {
  const icons: Record<string, string> = {
    padrao: 'heroicons:clock',
    escala: 'heroicons:calendar-days',
    '12x36': 'heroicons:arrow-path',
    '6x1': 'heroicons:calendar',
    '5x2': 'heroicons:calendar',
    flexivel: 'heroicons:adjustments-horizontal',
    parcial: 'heroicons:sun',
    noturno: 'heroicons:moon',
    personalizado: 'heroicons:cog-6-tooth'
  }
  return icons[tipo] || 'heroicons:clock'
}

// Carregar jornadas
const carregarJornadas = async () => {
  try {
    const response = await $fetch<{ success: boolean; data: any[] }>('/api/jornadas')
    if (response.success) {
      jornadas.value = response.data
    }
  } catch (error) {
    console.error('Erro ao carregar jornadas:', error)
  } finally {
    loading.value = false
  }
}

onMounted(carregarJornadas)

const abrirModal = (jornada?: any) => {
  if (jornada) {
    editando.value = true
    form.value = { 
      ...formInicial, 
      ...jornada,
      dias_trabalho: jornada.dias_trabalho || formInicial.dias_trabalho
    }
  } else {
    editando.value = false
    form.value = { ...formInicial, dias_trabalho: { ...formInicial.dias_trabalho } }
  }
  showModal.value = true
}

const fecharModal = () => {
  showModal.value = false
  editando.value = false
  form.value = { ...formInicial, dias_trabalho: { ...formInicial.dias_trabalho } }
}

const salvar = async () => {
  const toast = useToast()
  
  saving.value = true
  try {
    if (editando.value && form.value.id) {
      await $fetch(`/api/jornadas/${form.value.id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $fetch('/api/jornadas', {
        method: 'POST',
        body: form.value
      })
    }
    await carregarJornadas()
    fecharModal()
    
    toast.success(
      editando.value ? 'Jornada atualizada!' : 'Jornada criada!',
      editando.value 
        ? `A jornada "${form.value.nome}" foi atualizada com sucesso.`
        : `A jornada "${form.value.nome}" foi criada com sucesso.`
    )
  } catch (error: any) {
    toast.error(
      'Erro ao salvar jornada',
      error.data?.message || error.message || 'Não foi possível salvar a jornada.'
    )
  } finally {
    saving.value = false
  }
}

const excluir = async () => {
  const toast = useToast()
  
  if (!confirm('Deseja realmente excluir esta jornada?')) return
  
  try {
    await $fetch(`/api/jornadas/${form.value.id}`, { method: 'DELETE' })
    await carregarJornadas()
    fecharModal()
    
    toast.success(
      'Jornada excluída!',
      `A jornada "${form.value.nome}" foi excluída com sucesso.`
    )
  } catch (error: any) {
    toast.error(
      'Erro ao excluir jornada',
      error.data?.message || error.message || 'Não foi possível excluir a jornada.'
    )
  }
}
</script>
