<template>
  <div class="min-h-screen bg-gray-50">
    <BasePageHeader title="Documentos RH" subtitle="Atestados, declarações e documentos diversos" backTo="/admin" theme="admin" />

    <div class="max-w-7xl mx-auto p-8">
      <CardDocumentosStats :stats="stats" />

      <!-- Filtros e Ações -->
      <div class="card mb-8">
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div class="flex flex-col md:flex-row gap-4 flex-1">
            <UISelect v-model="filters.colaborador" class="w-full md:w-64">
              <option value="">Todos os Colaboradores</option>
              <option v-for="col in colaboradores" :key="col.id" :value="col.id">{{ col.nome }}</option>
            </UISelect>
            <UISelect v-model="filters.tipo" class="w-full md:w-48">
              <option value="">Todos os Tipos</option>
              <option v-for="tipo in tiposDocumento" :key="tipo.value" :value="tipo.value">{{ tipo.label }}</option>
            </UISelect>
            <UISelect v-model="filters.status" class="w-full md:w-40">
              <option value="">Todos Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Rejeitado">Rejeitado</option>
            </UISelect>
          </div>
          <UIButton theme="admin" variant="primary" icon-left="heroicons:plus" @click="showModal = true">Novo Documento</UIButton>
        </div>
      </div>

      <div v-if="loading" class="card text-center py-12">
        <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-4" size="48" />
        <p class="text-gray-600">Carregando documentos...</p>
      </div>

      <TableDocumentosRH v-else-if="filteredDocumentos.length > 0" :documentos="filteredDocumentos" @aprovar="handleAprovar" @rejeitar="handleRejeitar" @excluir="handleDelete" />

      <div v-else class="card text-center py-12">
        <Icon name="heroicons:document-text" class="text-gray-300 mx-auto mb-4" size="64" />
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum documento encontrado</h3>
        <p class="text-gray-600 mb-6">Cadastre atestados, declarações e outros documentos</p>
        <UIButton theme="admin" variant="primary" icon-left="heroicons:plus" @click="showModal = true">Novo Documento</UIButton>
      </div>
    </div>

    <ModalDocumentoRH v-model="showModal" :colaboradores="colaboradores" :saving="saving" @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], layout: false })

const supabase = useSupabaseClient()
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const documentosRH = ref<any[]>([])
const colaboradores = ref<any[]>([])
const filters = ref({ colaborador: '', tipo: '', status: '' })

const tiposDocumento = [
  { value: 'Atestado', label: 'Atestado Médico' },
  { value: 'Declaracao_Horas', label: 'Declaração de Horas' },
  { value: 'Declaracao_Comparecimento', label: 'Declaração de Comparecimento' },
  { value: 'Licenca', label: 'Licença' },
  { value: 'Ferias', label: 'Férias' },
  { value: 'Advertencia', label: 'Advertência' },
  { value: 'Outros', label: 'Outros' },
]

const stats = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return {
    total: documentosRH.value.length,
    pendente: documentosRH.value.filter(d => d.status === 'Pendente').length,
    aprovado: documentosRH.value.filter(d => d.status === 'Aprovado').length,
    esteMes: documentosRH.value.filter(d => new Date(d.created_at) >= startOfMonth).length,
  }
})

const filteredDocumentos = computed(() => {
  let filtered = [...documentosRH.value]
  if (filters.value.colaborador) filtered = filtered.filter(d => d.colaborador_id === filters.value.colaborador)
  if (filters.value.tipo) filtered = filtered.filter(d => d.tipo === filters.value.tipo)
  if (filters.value.status) filtered = filtered.filter(d => d.status === filters.value.status)
  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const fetchDocumentos = async () => {
  loading.value = true
  try {
    const { data } = await (supabase as any).from('documentos_rh').select('*, colaborador:colaboradores(id, nome, cargo:cargos(nome))').order('created_at', { ascending: false })
    documentosRH.value = data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const fetchColaboradores = async () => {
  const { data } = await (supabase as any).from('colaboradores').select('id, nome').eq('status', 'Ativo').order('nome')
  colaboradores.value = data || []
}

const handleSubmit = async (form: any, file: File | null) => {
  saving.value = true
  try {
    let arquivoUrl = null
    if (file) {
      const fileName = `${Date.now()}_${file.name}`
      const filePath = `${form.colaborador_id}/rh/${fileName}`
      const { error: uploadError } = await supabase.storage.from('colaboradores-medicos').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('colaboradores-medicos').getPublicUrl(filePath)
      arquivoUrl = publicUrl
    }
    const { error } = await (supabase as any).from('documentos_rh').insert({ ...form, arquivo_url: arquivoUrl, status: 'Pendente' })
    if (error) throw error
    alert('Documento cadastrado com sucesso!')
    showModal.value = false
    await fetchDocumentos()
  } catch (e: any) { alert(`Erro: ${e.message}`) }
  finally { saving.value = false }
}

const handleAprovar = async (doc: any) => {
  if (!confirm('Aprovar este documento?')) return
  try {
    const { error } = await (supabase as any).from('documentos_rh').update({ status: 'Aprovado', updated_at: new Date().toISOString() }).eq('id', doc.id)
    if (error) throw error
    await fetchDocumentos()
  } catch (e: any) { alert(`Erro: ${e.message}`) }
}

const handleRejeitar = async (doc: any) => {
  const motivo = prompt('Motivo da rejeição:')
  if (!motivo) return
  try {
    const { error } = await (supabase as any).from('documentos_rh').update({ status: 'Rejeitado', observacoes: `${doc.observacoes || ''}\n[REJEITADO] ${motivo}`.trim(), updated_at: new Date().toISOString() }).eq('id', doc.id)
    if (error) throw error
    await fetchDocumentos()
  } catch (e: any) { alert(`Erro: ${e.message}`) }
}

const handleDelete = async (doc: any) => {
  if (!confirm('Excluir este documento?')) return
  try {
    const { error } = await (supabase as any).from('documentos_rh').delete().eq('id', doc.id)
    if (error) throw error
    await fetchDocumentos()
  } catch (e: any) { alert(`Erro: ${e.message}`) }
}

onMounted(() => Promise.all([fetchDocumentos(), fetchColaboradores()]))
</script>
