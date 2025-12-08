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
              <h1 class="text-xl font-bold text-gray-800">Dados da Empresa</h1>
              <p class="text-sm text-gray-500">Configure as informações da empresa</p>
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
        <p class="text-gray-600">Carregando dados...</p>
      </div>

      <!-- Formulário -->
      <form v-else @submit.prevent="salvar" class="space-y-6">
        <!-- Identificação -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="heroicons:building-office-2" class="text-blue-600" size="24" />
            Identificação
          </h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Razão Social *</label>
              <UIInput v-model="form.razao_social" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
              <UIInput v-model="form.nome_fantasia" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
              <UIInput v-model="form.cnpj" required placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
              <UIInput v-model="form.inscricao_estadual" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Inscrição Municipal</label>
              <UIInput v-model="form.inscricao_municipal" />
            </div>
          </div>
        </div>

        <!-- Endereço -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="heroicons:map-pin" class="text-green-600" size="24" />
            Endereço
          </h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <UIInput v-model="form.cep" placeholder="00000-000" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
              <UIInput v-model="form.logradouro" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <UIInput v-model="form.numero" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
              <UIInput v-model="form.complemento" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
              <UIInput v-model="form.bairro" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <UIInput v-model="form.cidade" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <UISelect v-model="form.estado">
                <option value="">Selecione</option>
                <option v-for="uf in estados" :key="uf" :value="uf">{{ uf }}</option>
              </UISelect>
            </div>
          </div>
        </div>

        <!-- Contatos -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="heroicons:phone" class="text-purple-600" size="24" />
            Contatos
          </h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <UIInput v-model="form.telefone" placeholder="(00) 0000-0000" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Celular</label>
              <UIInput v-model="form.celular" placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <UIInput v-model="form.email" type="email" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Site</label>
              <UIInput v-model="form.site" placeholder="https://..." />
            </div>
          </div>
        </div>

        <!-- Dados Bancários -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="heroicons:banknotes" class="text-amber-600" size="24" />
            Dados Bancários
          </h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Código do Banco</label>
              <UIInput v-model="form.banco_codigo" placeholder="000" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Banco</label>
              <UIInput v-model="form.banco_nome" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Agência</label>
              <UIInput v-model="form.agencia" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Conta</label>
              <UIInput v-model="form.conta" />
            </div>
          </div>
        </div>

        <!-- Responsável Legal -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="heroicons:user-circle" class="text-red-600" size="24" />
            Responsável Legal
          </h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <UIInput v-model="form.responsavel_nome" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <UIInput v-model="form.responsavel_cpf" placeholder="000.000.000-00" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
              <UIInput v-model="form.responsavel_cargo" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <UIInput v-model="form.responsavel_email" type="email" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <UIInput v-model="form.responsavel_telefone" />
            </div>
          </div>
        </div>

        <!-- Configurações Fiscais -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="heroicons:document-text" class="text-indigo-600" size="24" />
            Configurações Fiscais
          </h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Regime Tributário</label>
              <UISelect v-model="form.regime_tributario">
                <option value="">Selecione</option>
                <option value="Simples Nacional">Simples Nacional</option>
                <option value="Lucro Presumido">Lucro Presumido</option>
                <option value="Lucro Real">Lucro Real</option>
              </UISelect>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Porte da Empresa</label>
              <UISelect v-model="form.porte_empresa">
                <option value="">Selecione</option>
                <option value="MEI">MEI - Microempreendedor Individual</option>
                <option value="ME">ME - Microempresa</option>
                <option value="EPP">EPP - Empresa de Pequeno Porte</option>
                <option value="Médio Porte">Médio Porte</option>
                <option value="Grande Porte">Grande Porte</option>
              </UISelect>
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
            {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
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

const form = ref({
  id: '',
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  inscricao_estadual: '',
  inscricao_municipal: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  telefone: '',
  celular: '',
  email: '',
  site: '',
  banco_codigo: '',
  banco_nome: '',
  agencia: '',
  conta: '',
  responsavel_nome: '',
  responsavel_cpf: '',
  responsavel_cargo: '',
  responsavel_email: '',
  responsavel_telefone: '',
  regime_tributario: '',
  porte_empresa: '',
})

const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

// Carregar dados
onMounted(async () => {
  try {
    const response = await $fetch<{ success: boolean; data: any }>('/api/empresa')
    if (response.success) {
      form.value = { ...form.value, ...response.data }
    }
  } catch (error: any) {
    console.error('Erro ao carregar dados:', error)
    alert('Erro ao carregar dados da empresa')
  } finally {
    loading.value = false
  }
})

// Salvar
const salvar = async () => {
  if (!form.value.razao_social || !form.value.cnpj) {
    alert('Preencha os campos obrigatórios')
    return
  }

  saving.value = true
  try {
    const response = await $fetch<{ success: boolean; data: any }>('/api/empresa', {
      method: 'PUT',
      body: form.value
    })

    if (response.success) {
      alert('✅ Dados da empresa atualizados com sucesso!')
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
