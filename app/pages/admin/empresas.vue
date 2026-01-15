<template>
  <div>
    <UiPageHeader title="Empresas" description="Gerencie todas as empresas do sistema">
      <UiButton size="lg" icon="➕" @click="abrirModal()">
        Nova Empresa
      </UiButton>
    </UiPageHeader>

    <!-- Lista de Empresas -->
    <div class="space-y-4">
      <UiCard v-for="empresa in empresas" :key="empresa.id" padding="p-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
              <img v-if="empresa.logo_url" :src="empresa.logo_url" :alt="empresa.nome" class="w-full h-full object-cover rounded-xl" />
              <span v-else class="text-primary-700 font-bold text-2xl">{{ empresa.nome.charAt(0) }}</span>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">{{ empresa.nome }}</h3>
              <p v-if="empresa.nome_fantasia" class="text-lg text-gray-600">{{ empresa.nome_fantasia }}</p>
              <p class="text-gray-500">CNPJ: {{ empresa.cnpj }}</p>
              <p v-if="empresa.inscricao_estadual" class="text-sm text-gray-400">IE: {{ empresa.inscricao_estadual }}</p>
              <p class="text-sm text-gray-400">{{ empresa.endereco_completo || formatarEnderecoCompleto(empresa) }}</p>
              <div class="flex gap-2 mt-2">
                <UiBadge variant="info">{{ empresa.funcionarios_count }} funcionários</UiBadge>
                <UiBadge v-if="empresa.situacao_cadastral" :variant="empresa.situacao_cadastral === 'ATIVA' ? 'success' : 'warning'">
                  {{ empresa.situacao_cadastral }}
                </UiBadge>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <UiButton variant="ghost" @click="abrirModal(empresa)">✏️ Editar</UiButton>
            <UiButton variant="ghost" @click="verFuncionarios(empresa)">👥 Funcionários</UiButton>
            <UiButton 
              variant="danger"
              @click="deletar(empresa)"
            >
              🗑️ Excluir
            </UiButton>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Modal de Cadastro/Edição -->
    <UiModal 
      v-model="modalAberto" 
      :title="empresaEditando ? 'Editar Empresa' : 'Nova Empresa'"
      max-width="max-w-2xl"
    >
      <form @submit.prevent="salvarEmpresaForm" class="space-y-6">
        <!-- Dados da Empresa -->
        <div>
          <h3 class="text-lg font-bold text-gray-800 mb-4">🏢 Dados da Empresa</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- CNPJ -->
            <div class="md:col-span-2">
              <UiInputCNPJ 
                v-model="form.cnpj" 
                label="CNPJ" 
                required 
                @dados-encontrados="preencherDadosEmpresa"
              />
            </div>
            
            <!-- Nome Empresarial e Nome Fantasia -->
            <UiInput v-model="form.nome" label="Nome Empresarial (Razão Social)" required />
            <UiInput v-model="form.nome_fantasia" label="Nome Fantasia" />
            
            <!-- Inscrição Estadual e Situação -->
            <UiInput v-model="form.inscricao_estadual" label="Inscrição Estadual" />
            <UiInput v-model="form.situacao_cadastral" label="Situação Cadastral" disabled />
            
            <!-- Endereço detalhado -->
            <div class="md:col-span-2">
              <h4 class="text-md font-semibold text-gray-700 mb-3 mt-4">📍 Endereço</h4>
            </div>
            
            <UiInput v-model="form.logradouro" label="Logradouro" placeholder="Rua, Avenida, etc." />
            <UiInput v-model="form.numero" label="Número" placeholder="123" />
            <UiInput v-model="form.complemento" label="Complemento" placeholder="Sala, Andar, etc." />
            <UiInput v-model="form.bairro" label="Bairro" />
            <UiInput v-model="form.municipio" label="Município" />
            <UiSelect v-model="form.uf" :options="ufOptions" label="UF" placeholder="Selecione..." />
            <UiInput v-model="form.cep" label="CEP" placeholder="00000-000" />
            
            <!-- Contatos -->
            <div class="md:col-span-2">
              <h4 class="text-md font-semibold text-gray-700 mb-3 mt-4">📞 Contatos</h4>
            </div>
            
            <UiInput v-model="form.telefone" label="Telefone" placeholder="(11) 3333-4444" />
            <UiInput v-model="form.email_holerites" type="email" label="Email para Holerites" placeholder="rh@empresa.com" />
            
            <!-- Logo -->
            <div class="md:col-span-2">
              <h4 class="text-md font-semibold text-gray-700 mb-3 mt-4">🖼️ Logo da Empresa</h4>
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                  <img v-if="form.logo_url" :src="form.logo_url" :alt="form.nome" class="w-full h-full object-cover rounded-xl" />
                  <span v-else class="text-gray-400 text-2xl">🏢</span>
                </div>
                <div class="flex-1">
                  <UiInput v-model="form.logo_url" label="URL da Logo" placeholder="https://exemplo.com/logo.png" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Configurações Iniciais -->
        <div>
          <h3 class="text-lg font-bold text-gray-800 mb-4">⚙️ Configurações Iniciais</h3>
          <div class="space-y-4">
            <UiCheckbox v-model="form.mostrar_logo" label="Mostrar logo nos holerites" />
            <UiCheckbox v-model="form.mostrar_endereco" label="Mostrar endereço nos holerites" />
            <UiCheckbox v-model="form.mostrar_cnpj" label="Mostrar CNPJ nos holerites" />
          </div>
        </div>

        <!-- Botões -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <UiButton variant="secondary" @click="modalAberto = false">Cancelar</UiButton>
          <UiButton type="submit" icon="💾">Salvar Empresa</UiButton>
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
import { useEmpresas } from '~/composables/useEmpresas'

definePageMeta({ middleware: ['auth', 'admin'] })

const { empresas, loading, carregarEmpresas, salvarEmpresa, deletarEmpresa } = useEmpresas()

const modalAberto = ref(false)
const empresaEditando = ref<any>(null)
const mostrarNotificacao = ref(false)
const notificacao = ref({
  title: '',
  message: '',
  variant: 'success' as 'success' | 'error' | 'warning' | 'info'
})

const form = ref({
  // Dados principais
  nome: '',
  nome_fantasia: '',
  cnpj: '',
  inscricao_estadual: '',
  
  // Endereço detalhado
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  municipio: '',
  uf: '',
  cep: '',
  
  // Contatos
  telefone: '',
  email_holerites: '',
  
  // Informações cadastrais
  situacao_cadastral: '',
  atividade_principal: '',
  natureza_juridica: '',
  porte: '',
  capital_social: '',
  data_abertura: '',
  
  // Sistema
  logo_url: '',
  mostrar_logo: true,
  mostrar_endereco: true,
  mostrar_cnpj: true
})

// Carregar empresas ao montar o componente
onMounted(() => {
  carregarEmpresas()
})

// Opções de UF
const ufOptions = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
]

const abrirModal = (empresa?: any) => {
  if (empresa) {
    empresaEditando.value = empresa
    Object.assign(form.value, empresa)
  } else {
    empresaEditando.value = null
    form.value = {
      // Dados principais
      nome: '', nome_fantasia: '', cnpj: '', inscricao_estadual: '',
      // Endereço
      logradouro: '', numero: '', complemento: '', bairro: '', municipio: '', uf: '', cep: '',
      // Contatos
      telefone: '', email_holerites: '',
      // Informações cadastrais
      situacao_cadastral: '', atividade_principal: '', natureza_juridica: '', porte: '', capital_social: '', data_abertura: '',
      // Sistema
      logo_url: '', mostrar_logo: true, mostrar_endereco: true, mostrar_cnpj: true
    }
  }
  modalAberto.value = true
}

const salvarEmpresaForm = async () => {
  const dadosEmpresa = empresaEditando.value ? { ...form.value, id: empresaEditando.value.id } : form.value
  const resultado = await salvarEmpresa(dadosEmpresa)
  
  notificacao.value = {
    title: resultado.success ? 'Sucesso!' : 'Erro!',
    message: resultado.message,
    variant: resultado.success ? 'success' : 'error'
  }
  mostrarNotificacao.value = true
  
  if (resultado.success) {
    modalAberto.value = false
  }
}

const deletar = async (empresa: any) => {
  if (!confirm(`Tem certeza que deseja excluir a empresa "${empresa.nome}"? Esta ação não pode ser desfeita.`)) {
    return
  }

  const resultado = await deletarEmpresa(empresa.id)
  
  notificacao.value = {
    title: resultado.success ? 'Sucesso!' : 'Erro!',
    message: resultado.message,
    variant: resultado.success ? 'success' : 'error'
  }
  mostrarNotificacao.value = true
}

const verFuncionarios = (empresa: any) => {
  navigateTo(`/admin/funcionarios?empresa=${empresa.id}`)
}

const formatarEnderecoCompleto = (empresa: any) => {
  const partes = []
  
  if (empresa.logradouro) partes.push(empresa.logradouro)
  if (empresa.numero) partes.push(empresa.numero)
  if (empresa.complemento) partes.push(empresa.complemento)
  if (empresa.bairro) partes.push(empresa.bairro)
  if (empresa.municipio) partes.push(empresa.municipio)
  if (empresa.uf) partes.push(empresa.uf)
  if (empresa.cep) partes.push(`CEP: ${empresa.cep}`)
  
  return partes.join(', ') || empresa.endereco || 'Endereço não informado'
}

const preencherDadosEmpresa = (dados: any) => {
  // Preencher automaticamente os campos com os dados da consulta
  
  // Dados principais
  if (dados.nome && !form.value.nome) {
    form.value.nome = dados.nome
  }
  
  if (dados.nome_fantasia && !form.value.nome_fantasia) {
    form.value.nome_fantasia = dados.nome_fantasia
  }
  
  if (dados.inscricao_estadual && !form.value.inscricao_estadual) {
    form.value.inscricao_estadual = dados.inscricao_estadual
  }
  
  // Endereço detalhado
  if (dados.logradouro && !form.value.logradouro) {
    form.value.logradouro = dados.logradouro
  }
  
  if (dados.numero && !form.value.numero) {
    form.value.numero = dados.numero
  }
  
  if (dados.complemento && !form.value.complemento) {
    form.value.complemento = dados.complemento
  }
  
  if (dados.bairro && !form.value.bairro) {
    form.value.bairro = dados.bairro
  }
  
  if (dados.municipio && !form.value.municipio) {
    form.value.municipio = dados.municipio
  }
  
  if (dados.uf && !form.value.uf) {
    form.value.uf = dados.uf
  }
  
  if (dados.cep && !form.value.cep) {
    form.value.cep = dados.cep
  }
  
  // Contatos
  if (dados.telefone && !form.value.telefone) {
    form.value.telefone = dados.telefone
  }
  
  if (dados.email && !form.value.email_holerites) {
    form.value.email_holerites = dados.email
  }
  
  // Informações cadastrais
  if (dados.situacao_cadastral) {
    form.value.situacao_cadastral = dados.situacao_cadastral
  }
  
  if (dados.atividade_principal && !form.value.atividade_principal) {
    form.value.atividade_principal = dados.atividade_principal
  }
  
  if (dados.natureza_juridica && !form.value.natureza_juridica) {
    form.value.natureza_juridica = dados.natureza_juridica
  }
  
  if (dados.porte && !form.value.porte) {
    form.value.porte = dados.porte
  }
  
  if (dados.capital_social && !form.value.capital_social) {
    form.value.capital_social = dados.capital_social
  }
  
  if (dados.data_abertura && !form.value.data_abertura) {
    form.value.data_abertura = dados.data_abertura
  }
  
  // Formatar CNPJ
  form.value.cnpj = dados.cnpj
  
  // Mostrar notificação de sucesso
  notificacao.value = {
    title: 'Dados encontrados!',
    message: `Empresa: ${dados.nome} - ${dados.situacao_cadastral}`,
    variant: 'success'
  }
  mostrarNotificacao.value = true
}
</script>