<template>
  <div>
    <UiPageHeader title="Departamentos" description="Organize os setores da empresa">
      <UiButton size="lg" icon="➕" @click="abrirModal()">
        Novo Departamento
      </UiButton>
    </UiPageHeader>

    <!-- Lista -->
    <div v-if="carregando" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Carregando departamentos...</p>
      </div>
    </div>

    <div v-else-if="departamentos.length === 0" class="text-center py-12">
      <p class="text-gray-500 mb-4">Nenhum departamento cadastrado</p>
      <UiButton @click="abrirModal()">➕ Criar Primeiro Departamento</UiButton>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UiCard v-for="dept in departamentos" :key="dept.id" padding="p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
            <svg class="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <UiButton variant="ghost" size="sm" @click="abrirModal(dept)">✏️ Editar</UiButton>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-1">{{ dept.nome }}</h3>
        <p class="text-gray-500 mb-3">{{ dept.descricao }}</p>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          Responsável: {{ dept.responsavel }}
        </div>
        <div class="mt-3 pt-3 border-t border-gray-100">
          <span class="text-sm text-gray-500">{{ dept.funcionarios }} funcionários</span>
        </div>
      </UiCard>
    </div>

    <!-- Modal -->
    <UiModal v-model="modalAberto" :title="editando ? 'Editar Departamento' : 'Novo Departamento'">
      <form @submit.prevent="salvar" class="space-y-4">
        <UiInput v-model="form.nome" label="Nome do Departamento" required />
        <UiTextarea v-model="form.descricao" label="Descrição" />
        <UiSelect v-model="form.responsavel" :options="responsaveisOptions" label="Responsável" placeholder="Selecione..." />
        <div class="flex justify-end gap-3 pt-4">
          <UiButton variant="secondary" @click="modalAberto = false">Cancelar</UiButton>
          <UiButton type="submit" icon="💾" :disabled="salvando">
            {{ salvando ? 'Salvando...' : 'Salvar' }}
          </UiButton>
        </div>
      </form>
    </UiModal>

    <!-- Notificação -->
    <UiNotification 
      :show="mostrarNotificacao"
      :title="notificacao.title"
      :message="notificacao.message"
      :variant="notificacao.variant"
      @close="mostrarNotificacao = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin'

definePageMeta({ middleware: ['auth', 'admin'] })

const { nomeAdmin, buscarAdmin } = useAdmin()

const modalAberto = ref(false)
const editando = ref<any>(null)
const form = ref({ nome: '', descricao: '', responsavel: '' })
const carregando = ref(true)
const salvando = ref(false)
const mostrarNotificacao = ref(false)
const notificacao = ref({
  title: '',
  message: '',
  variant: 'success' as 'success' | 'error'
})

interface Departamento {
  id: string
  nome: string
  descricao: string
  responsavel: string
  funcionarios: number
}

const departamentos = ref<Departamento[]>([])

const responsaveisOptions = computed(() => [
  { value: nomeAdmin.value, label: `${nomeAdmin.value} (Admin) ⭐` },
  // Outros responsáveis serão carregados da API
])

// Carregar departamentos e admin ao montar
onMounted(async () => {
  await buscarAdmin()
  await carregarDepartamentos()
})

// Carregar departamentos do banco
const carregarDepartamentos = async () => {
  carregando.value = true
  try {
    const response: any = await $fetch('/api/departamentos')
    if (response.success && response.data) {
      departamentos.value = response.data.map((d: any) => ({
        ...d,
        funcionarios: 0 // TODO: Contar funcionários por departamento
      }))
    }
  } catch (error) {
    console.error('Erro ao carregar departamentos:', error)
    mostrarMensagem('Erro!', 'Não foi possível carregar departamentos', 'error')
  } finally {
    carregando.value = false
  }
}

const abrirModal = (dept?: any) => {
  editando.value = dept || null
  // Se for novo departamento, sugerir a admin como responsável
  form.value = dept 
    ? { nome: dept.nome, descricao: dept.descricao, responsavel: dept.responsavel } 
    : { nome: '', descricao: '', responsavel: nomeAdmin.value }
  modalAberto.value = true
}

const salvar = async () => {
  salvando.value = true
  try {
    const dados = editando.value 
      ? { ...form.value, id: editando.value.id }
      : form.value

    const response: any = await $fetch('/api/departamentos/criar', {
      method: 'POST',
      body: dados
    })

    if (response.success) {
      mostrarMensagem('Sucesso!', response.message, 'success')
      modalAberto.value = false
      await carregarDepartamentos() // Recarregar lista
    }
  } catch (error: any) {
    console.error('Erro ao salvar departamento:', error)
    mostrarMensagem('Erro!', error.data?.message || 'Não foi possível salvar o departamento', 'error')
  } finally {
    salvando.value = false
  }
}

// Função auxiliar para mostrar mensagens
const mostrarMensagem = (title: string, message: string, variant: 'success' | 'error') => {
  notificacao.value = { title, message, variant }
  mostrarNotificacao.value = true
  
  setTimeout(() => {
    mostrarNotificacao.value = false
  }, 5000)
}
</script>
