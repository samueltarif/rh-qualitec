<template>
  <div>
    <!-- Filtros -->
    <div class="flex flex-wrap items-center gap-4 mb-6">
      <select v-model="filtroTipo" class="px-3 py-2 border border-slate-300 rounded-lg text-sm">
        <option value="">Todos os tipos</option>
        <option value="holerite">Holerites</option>
        <option value="informe_rendimentos">Informe de Rendimentos</option>
        <option value="ferias">Férias</option>
        <option value="contrato">Contrato</option>
        <option value="certificado">Certificados</option>
        <option value="outros">Outros</option>
      </select>
      <select v-model="filtroAno" class="px-3 py-2 border border-slate-300 rounded-lg text-sm">
        <option value="">Todos os anos</option>
        <option v-for="a in anos" :key="a" :value="a">{{ a }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="heroicons:arrow-path" class="animate-spin text-slate-400" size="40" />
      <p class="text-slate-500 mt-2">Carregando documentos...</p>
    </div>

    <!-- Grid de Documentos -->
    <div v-else-if="documentosFiltrados.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="doc in documentosFiltrados"
        :key="doc.id"
        class="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start gap-3">
          <div :class="getIconClass(doc.tipo)" class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon :name="getIcon(doc.tipo)" size="24" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-slate-800 truncate">{{ doc.titulo }}</h4>
            <p class="text-sm text-slate-500">{{ getTipoLabel(doc.tipo) }}</p>
            <p v-if="doc.competencia" class="text-xs text-slate-400 mt-1">
              Competência: {{ formatCompetencia(doc.competencia) }}
            </p>
            <p class="text-xs text-slate-400">
              Disponível em {{ formatDate(doc.created_at) }}
            </p>
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <button
            v-if="doc.arquivo_url"
            @click="visualizar(doc)"
            class="flex-1 px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Icon name="heroicons:eye" size="16" class="mr-1" />
            Visualizar
          </button>
          <button
            v-if="doc.arquivo_url"
            @click="baixar(doc)"
            class="flex-1 px-3 py-2 bg-amber-500 text-slate-900 text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors"
          >
            <Icon name="heroicons:arrow-down-tray" size="16" class="mr-1" />
            Baixar
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <Icon name="heroicons:folder-open" class="text-slate-300 mx-auto" size="48" />
      <p class="text-slate-500 mt-2">Nenhum documento disponível</p>
      <p class="text-sm text-slate-400 mt-1">Seus holerites e documentos aparecerão aqui</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  documentos: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  refresh: []
}>()

const filtroTipo = ref('')
const filtroAno = ref('')

const anos = computed(() => {
  const anoAtual = new Date().getFullYear()
  return [anoAtual, anoAtual - 1, anoAtual - 2]
})

const documentosFiltrados = computed(() => {
  let result = props.documentos
  if (filtroTipo.value) {
    result = result.filter(d => d.tipo === filtroTipo.value)
  }
  if (filtroAno.value) {
    result = result.filter(d => d.competencia?.startsWith(filtroAno.value) || d.ano_referencia === parseInt(filtroAno.value))
  }
  return result
})

const getTipoLabel = (tipo: string) => {
  const tipos: Record<string, string> = {
    'holerite': 'Holerite',
    'informe_rendimentos': 'Informe de Rendimentos',
    'ferias': 'Recibo de Férias',
    'rescisao': 'Rescisão',
    'contrato': 'Contrato',
    'aditivo': 'Aditivo Contratual',
    'advertencia': 'Advertência',
    'certificado': 'Certificado',
    'outros': 'Outros'
  }
  return tipos[tipo] || tipo
}

const getIcon = (tipo: string) => {
  const icons: Record<string, string> = {
    'holerite': 'heroicons:banknotes',
    'informe_rendimentos': 'heroicons:document-chart-bar',
    'ferias': 'heroicons:sun',
    'contrato': 'heroicons:document-text',
    'certificado': 'heroicons:academic-cap',
  }
  return icons[tipo] || 'heroicons:document'
}

const getIconClass = (tipo: string) => {
  const classes: Record<string, string> = {
    'holerite': 'bg-green-100 text-green-600',
    'informe_rendimentos': 'bg-blue-100 text-blue-600',
    'ferias': 'bg-amber-100 text-amber-600',
    'contrato': 'bg-purple-100 text-purple-600',
    'certificado': 'bg-indigo-100 text-indigo-600',
  }
  return classes[tipo] || 'bg-slate-100 text-slate-600'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const formatCompetencia = (comp: string) => {
  if (!comp) return '-'
  const [ano, mes] = comp.split('-')
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${meses[parseInt(mes) - 1]}/${ano}`
}

const visualizar = (doc: any) => {
  if (doc.arquivo_url) {
    window.open(doc.arquivo_url, '_blank')
  }
}

const baixar = (doc: any) => {
  if (doc.arquivo_url) {
    const link = document.createElement('a')
    link.href = doc.arquivo_url
    link.download = doc.arquivo_nome || 'documento.pdf'
    link.click()
  }
}
</script>
