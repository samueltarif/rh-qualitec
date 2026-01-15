<template>
  <div>
    <UiPageHeader title="Benefícios" description="Gerencie os benefícios oferecidos aos funcionários">
      <UiButton size="lg" icon="➕" @click="abrirModal()">
        Novo Benefício
      </UiButton>
    </UiPageHeader>

    <!-- Explicação -->
    <UiAlert variant="info" class="mb-6">
      Os benefícios cadastrados aqui podem ter um valor de desconto em folha. 
      Quando houver desconto, ele aparecerá automaticamente no holerite do funcionário.
    </UiAlert>

    <!-- Lista -->
    <div v-if="carregando" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Carregando benefícios...</p>
      </div>
    </div>

    <div v-else-if="beneficios.length === 0" class="text-center py-12">
      <p class="text-gray-500 mb-4">Nenhum benefício cadastrado</p>
      <UiButton @click="abrirModal()">➕ Criar Primeiro Benefício</UiButton>
    </div>

    <div v-else class="space-y-4">
      <UiCard v-for="beneficio in beneficios" :key="beneficio.id" padding="p-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              {{ beneficio.icone }}
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">{{ beneficio.nome }}</h3>
              <p class="text-gray-500">{{ beneficio.descricao }}</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div class="flex gap-6">
              <div class="text-center">
                <p class="text-sm text-gray-500">Valor</p>
                <p class="text-lg font-bold text-green-600">{{ formatarMoeda(beneficio.valor) }}</p>
              </div>
              <div class="text-center">
                <p class="text-sm text-gray-500">Desconto</p>
                <p class="text-lg font-bold" :class="beneficio.desconto > 0 ? 'text-red-600' : 'text-gray-400'">
                  {{ beneficio.desconto > 0 ? formatarMoeda(beneficio.desconto) : 'Sem desconto' }}
                </p>
              </div>
            </div>
            <UiButton variant="ghost" @click="abrirModal(beneficio)">✏️ Editar</UiButton>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Modal -->
    <UiModal v-model="modalAberto" :title="editando ? 'Editar Benefício' : 'Novo Benefício'">
      <form @submit.prevent="salvar" class="space-y-4">
        <UiInput v-model="form.nome" label="Nome do Benefício" required />
        <UiTextarea v-model="form.descricao" label="Descrição" :rows="2" />
        <div class="grid grid-cols-2 gap-4">
          <UiInput v-model="form.valor" type="number" label="Valor do Benefício (R$)" required />
          <UiInput v-model="form.desconto" type="number" label="Desconto em Folha (R$)" />
        </div>
        <UiInput v-model="form.icone" label="Ícone (emoji)" placeholder="🎁" />
        <UiAlert variant="warning" :show-icon="false" icon="💡">
          Se houver valor de desconto, ele será descontado automaticamente no holerite do funcionário.
        </UiAlert>
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
definePageMeta({ middleware: ['auth', 'admin'] })

const modalAberto = ref(false)
const editando = ref<any>(null)
const form = ref({ nome: '', descricao: '', valor: 0, desconto: 0, icone: '🎁' })
const carregando = ref(true)
const salvando = ref(false)
const mostrarNotificacao = ref(false)
const notificacao = ref({
  title: '',
  message: '',
  variant: 'success' as 'success' | 'error'
})

const beneficios = ref<any[]>([])

const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Carregar benefícios ao montar
onMounted(async () => {
  await carregarBeneficios()
})

// Carregar benefícios do banco
const carregarBeneficios = async () => {
  carregando.value = true
  try {
    const response: any = await $fetch('/api/beneficios')
    if (response.success && response.data) {
      beneficios.value = response.data
    }
  } catch (error) {
    console.error('Erro ao carregar benefícios:', error)
    mostrarMensagem('Erro!', 'Não foi possível carregar benefícios', 'error')
  } finally {
    carregando.value = false
  }
}

const abrirModal = (beneficio?: any) => {
  editando.value = beneficio || null
  form.value = beneficio 
    ? { nome: beneficio.nome, descricao: beneficio.descricao, valor: beneficio.valor, desconto: beneficio.desconto, icone: beneficio.icone }
    : { nome: '', descricao: '', valor: 0, desconto: 0, icone: '🎁' }
  modalAberto.value = true
}

const salvar = async () => {
  salvando.value = true
  try {
    const dados = editando.value 
      ? { ...form.value, id: editando.value.id }
      : form.value

    const response: any = await $fetch('/api/beneficios/criar', {
      method: 'POST',
      body: dados
    })

    if (response.success) {
      mostrarMensagem('Sucesso!', response.message, 'success')
      modalAberto.value = false
      await carregarBeneficios() // Recarregar lista
    }
  } catch (error: any) {
    console.error('Erro ao salvar benefício:', error)
    mostrarMensagem('Erro!', error.data?.message || 'Não foi possível salvar o benefício', 'error')
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
