<template>
  <div>
    <UiPageHeader title="Meus Dados" description="Visualize e atualize suas informações pessoais" />

    <!-- Loading -->
    <div v-if="carregando" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Carregando seus dados...</p>
      </div>
    </div>

    <!-- Conteúdo -->
    <div v-else>
    <!-- Foto e Dados Básicos -->
    <UiCard class="mb-6">
      <div class="flex flex-col md:flex-row items-start gap-6">
        <div class="flex flex-col items-center">
          <UiAvatar :name="user?.nome || ''" size="xl" />
          <UiButton variant="ghost" class="mt-4">📷 Alterar Foto</UiButton>
        </div>
        <div class="flex-1 w-full">
          <h2 class="text-2xl font-bold text-gray-800 mb-1">{{ user?.nome }}</h2>
          <p class="text-lg text-gray-500 mb-4">{{ user?.cargo }} - {{ user?.departamento }}</p>
          <div class="flex flex-wrap gap-3">
            <UiBadge variant="success">✓ Funcionário Ativo</UiBadge>
            <UiBadge variant="info">📅 Desde Jan/2023</UiBadge>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- Dados Pessoais -->
    <UiCard title="👤 Dados Pessoais" class="mb-6">
      <template #header>
        <UiButton variant="ghost" @click="editandoDadosPessoais = !editandoDadosPessoais">
          {{ editandoDadosPessoais ? '✕ Cancelar' : '✏️ Editar' }}
        </UiButton>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UiInput v-model="dadosPessoais.nome" label="Nome Completo" :disabled="!editandoDadosPessoais" />
        <UiInput v-model="dadosPessoais.cpf" label="CPF" disabled hint="Este campo não pode ser alterado" />
        <UiInput v-model="dadosPessoais.dataNascimento" type="date" label="Data de Nascimento" :disabled="!editandoDadosPessoais" />
        <UiInput v-model="dadosPessoais.telefone" label="Telefone" :disabled="!editandoDadosPessoais" />
        <div class="md:col-span-2">
          <UiInput v-model="dadosPessoais.endereco" label="Endereço" :disabled="!editandoDadosPessoais" />
        </div>
      </div>

      <div v-if="editandoDadosPessoais" class="mt-6 flex justify-end">
        <UiButton icon="💾" @click="salvarDadosPessoais" :disabled="salvando">
          {{ salvando ? 'Salvando...' : 'Salvar Alterações' }}
        </UiButton>
      </div>
    </UiCard>

    <!-- Dados Profissionais -->
    <UiCard title="💼 Dados Profissionais" class="mb-6">
      <template #header>
        <div class="flex items-center gap-2">
          <span v-if="!isAdmin" class="text-sm text-gray-500">(somente visualização)</span>
          <UiButton v-if="isAdmin" variant="ghost" @click="editandoDadosProfissionais = !editandoDadosProfissionais">
            {{ editandoDadosProfissionais ? '✕ Cancelar' : '✏️ Editar' }}
          </UiButton>
        </div>
      </template>

      <UiAlert v-if="!isAdmin" variant="warning" class="mb-6">
        Estes dados são gerenciados pelo RH e não podem ser alterados por você.
      </UiAlert>
      
      <UiAlert v-else variant="info" class="mb-6">
        Como administrador, você pode editar seus próprios dados profissionais.
      </UiAlert>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-if="!isAdmin || !editandoDadosProfissionais">
          <label class="block text-sm font-medium text-gray-500 mb-1">Cargo</label>
          <p class="text-lg font-semibold text-gray-800 p-3 bg-gray-50 rounded-xl">{{ obterNomeCargo(dadosProfissionais.cargo) || user?.cargo }}</p>
        </div>
        <UiSelect 
          v-else
          v-model="dadosProfissionais.cargo" 
          :options="cargosOptions"
          label="Cargo"
          placeholder="Selecione um cargo..."
        />
        
        <div v-if="!isAdmin || !editandoDadosProfissionais">
          <label class="block text-sm font-medium text-gray-500 mb-1">Departamento</label>
          <p class="text-lg font-semibold text-gray-800 p-3 bg-gray-50 rounded-xl">{{ obterNomeDepartamento(dadosProfissionais.departamento) || user?.departamento }}</p>
        </div>
        <UiSelect 
          v-else
          v-model="dadosProfissionais.departamento" 
          :options="departamentosOptions"
          label="Departamento"
          placeholder="Selecione um departamento..."
        />
        
        <div v-if="!isAdmin || !editandoDadosProfissionais">
          <label class="block text-sm font-medium text-gray-500 mb-1">Data de Admissão</label>
          <p class="text-lg font-semibold text-gray-800 p-3 bg-gray-50 rounded-xl">{{ formatarData(dadosProfissionais.dataAdmissao) }}</p>
        </div>
        <UiInput 
          v-else
          v-model="dadosProfissionais.dataAdmissao" 
          type="date"
          label="Data de Admissão" 
        />
        
        <div v-if="!isAdmin || !editandoDadosProfissionais">
          <label class="block text-sm font-medium text-gray-500 mb-1">Tipo de Contrato</label>
          <p class="text-lg font-semibold text-gray-800 p-3 bg-gray-50 rounded-xl">{{ dadosProfissionais.tipoContrato }}</p>
        </div>
        <UiSelect 
          v-else
          v-model="dadosProfissionais.tipoContrato" 
          :options="tipoContratoOptions"
          label="Tipo de Contrato" 
        />
        
        <div v-if="!isAdmin || !editandoDadosProfissionais">
          <label class="block text-sm font-medium text-gray-500 mb-1">Carga Horária</label>
          <p class="text-lg font-semibold text-gray-800 p-3 bg-gray-50 rounded-xl">{{ dadosProfissionais.cargaHoraria }}</p>
        </div>
        <UiInput 
          v-else
          v-model="dadosProfissionais.cargaHoraria" 
          label="Carga Horária" 
          placeholder="44 horas semanais"
        />
        
        <div v-if="!isAdmin || !editandoDadosProfissionais">
          <label class="block text-sm font-medium text-gray-500 mb-1">Empresa</label>
          <p class="text-lg font-semibold text-gray-800 p-3 bg-gray-50 rounded-xl">{{ obterNomeEmpresa(dadosProfissionais.empresa) }}</p>
        </div>
        <UiSelect 
          v-else
          v-model="dadosProfissionais.empresa" 
          :options="empresasOptions"
          label="Empresa"
          placeholder="Selecione uma empresa..."
        />
      </div>
      
      <div v-if="isAdmin && editandoDadosProfissionais" class="mt-6 flex justify-end">
        <UiButton icon="💾" @click="salvarDadosProfissionais" :disabled="salvando">
          {{ salvando ? 'Salvando...' : 'Salvar Alterações' }}
        </UiButton>
      </div>
    </UiCard>

    <!-- Forma de Pagamento -->
    <UiCard title="💳 Forma de Recebimento do Salário">
      <template #header>
        <UiButton variant="ghost" @click="editandoPagamento = !editandoPagamento">
          {{ editandoPagamento ? '✕ Cancelar' : '✏️ Editar' }}
        </UiButton>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UiSelect v-model="dadosBancarios.banco" :options="bancosOptions" label="Banco" :disabled="!editandoPagamento" />
        <UiSelect v-model="dadosBancarios.tipoConta" :options="tipoContaOptions" label="Tipo de Conta" :disabled="!editandoPagamento" />
        <UiInput v-model="dadosBancarios.agencia" label="Agência" :disabled="!editandoPagamento" />
        <UiInput v-model="dadosBancarios.conta" label="Conta" :disabled="!editandoPagamento" />
      </div>

      <div v-if="editandoPagamento" class="mt-6 flex justify-end">
        <UiButton icon="💾" @click="salvarDadosBancarios" :disabled="salvando">
          {{ salvando ? 'Salvando...' : 'Salvar Alterações' }}
        </UiButton>
      </div>
    </UiCard>

    <!-- Notificação -->
    <UiNotification 
      :show="mostrarNotificacao"
      :title="notificacao.title"
      :message="notificacao.message"
      :variant="notificacao.variant"
      @close="mostrarNotificacao = false"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user, isAdmin } = useAuth()

const editandoDadosPessoais = ref(false)
const editandoDadosProfissionais = ref(false)
const editandoPagamento = ref(false)
const salvando = ref(false)
const carregando = ref(true)
const mostrarNotificacao = ref(false)
const notificacao = ref({
  title: '',
  message: '',
  variant: 'success' as 'success' | 'error'
})

const dadosOriginais = ref<any>(null)

const dadosPessoais = ref({
  nome: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  endereco: '',
  email_pessoal: ''
})

const dadosProfissionais = ref({
  cargo: '',
  departamento: '',
  dataAdmissao: '',
  tipoContrato: '',
  cargaHoraria: '',
  empresa: ''
})

const dadosBancarios = ref({
  banco: '',
  tipoConta: '',
  agencia: '',
  conta: ''
})

const bancosOptions = [
  { value: '001', label: 'Banco do Brasil' },
  { value: '104', label: 'Caixa Econômica' },
  { value: '237', label: 'Bradesco' },
  { value: '341', label: 'Itaú' },
  { value: '033', label: 'Santander' },
  { value: '260', label: 'Nubank' }
]

const tipoContaOptions = [
  { value: 'corrente', label: 'Conta Corrente' },
  { value: 'poupanca', label: 'Conta Poupança' }
]

const tipoContratoOptions = [
  { value: 'CLT', label: 'CLT' },
  { value: 'PJ', label: 'PJ' },
  { value: 'Estagio', label: 'Estágio' },
  { value: 'Temporario', label: 'Temporário' }
]

// Carregar opções de cargos, departamentos e empresas
const cargosOptions = ref<Array<{ value: string; label: string }>>([])
const departamentosOptions = ref<Array<{ value: string; label: string }>>([])
const empresasOptions = ref<Array<{ value: string; label: string }>>([])

// Mapas para converter ID em nome
const cargosMap = ref<Record<string, string>>({})
const departamentosMap = ref<Record<string, string>>({})
const empresasMap = ref<Record<string, string>>({})

// Função para formatar data
const formatarData = (data: string) => {
  if (!data) return '--'
  const date = new Date(data)
  return date.toLocaleDateString('pt-BR')
}

// Funções para obter nomes
const obterNomeCargo = (id: string) => cargosMap.value[id] || id
const obterNomeDepartamento = (id: string) => departamentosMap.value[id] || id
const obterNomeEmpresa = (id: string) => empresasMap.value[id] || id

// Carregar dados do funcionário ao montar
onMounted(async () => {
  await carregarOpcoes()
  await carregarDados()
})

// Carregar opções de cargos, departamentos e empresas
const carregarOpcoes = async () => {
  try {
    // Carregar cargos
    const cargosRes: any = await $fetch('/api/cargos')
    if (cargosRes.success && cargosRes.data) {
      cargosOptions.value = cargosRes.data.map((c: any) => ({
        value: c.id.toString(),
        label: c.nome
      }))
      cargosRes.data.forEach((c: any) => {
        cargosMap.value[c.id.toString()] = c.nome
      })
    }

    // Carregar departamentos
    const deptosRes: any = await $fetch('/api/departamentos')
    if (deptosRes.success && deptosRes.data) {
      departamentosOptions.value = deptosRes.data.map((d: any) => ({
        value: d.id.toString(),
        label: d.nome
      }))
      deptosRes.data.forEach((d: any) => {
        departamentosMap.value[d.id.toString()] = d.nome
      })
    }

    // Carregar empresas
    const empresasRes: any = await $fetch('/api/empresas')
    if (empresasRes.success && empresasRes.data) {
      empresasOptions.value = empresasRes.data.map((e: any) => ({
        value: e.id.toString(),
        label: e.razao_social
      }))
      empresasRes.data.forEach((e: any) => {
        empresasMap.value[e.id.toString()] = e.razao_social
      })
    }
  } catch (error) {
    console.error('Erro ao carregar opções:', error)
  }
}

// Função para carregar dados do banco
const carregarDados = async () => {
  if (!user.value?.id) {
    mostrarMensagem('Erro!', 'Usuário não autenticado', 'error')
    return
  }

  carregando.value = true
  try {
    const response: any = await $fetch(`/api/funcionarios/meus-dados?userId=${user.value.id}`)
    
    if (response.success && response.data) {
      dadosOriginais.value = response.data
      
      // Preencher dados pessoais
      dadosPessoais.value = {
        nome: response.data.nome_completo || '',
        cpf: response.data.cpf || '',
        dataNascimento: response.data.data_nascimento || '',
        telefone: response.data.telefone || '',
        endereco: response.data.endereco || '',
        email_pessoal: response.data.email_pessoal || ''
      }
      
      // Preencher dados profissionais
      dadosProfissionais.value = {
        cargo: response.data.cargo_id || '',
        departamento: response.data.departamento_id || '',
        dataAdmissao: response.data.data_admissao || '',
        tipoContrato: response.data.tipo_contrato || 'CLT',
        cargaHoraria: response.data.carga_horaria || '44 horas semanais',
        empresa: response.data.empresa_id || ''
      }
      
      // Preencher dados bancários
      dadosBancarios.value = {
        banco: response.data.banco || '',
        tipoConta: response.data.tipo_conta || 'corrente',
        agencia: response.data.agencia || '',
        conta: response.data.conta || ''
      }
    }
  } catch (error: any) {
    console.error('Erro ao carregar dados:', error)
    mostrarMensagem('Erro!', 'Não foi possível carregar seus dados', 'error')
  } finally {
    carregando.value = false
  }
}

// Função para salvar dados pessoais
const salvarDadosPessoais = async () => {
  if (!user.value?.id) {
    mostrarMensagem('Erro!', 'Usuário não autenticado', 'error')
    return
  }

  salvando.value = true
  try {
    const response: any = await $fetch('/api/funcionarios/meus-dados', {
      method: 'PATCH',
      body: {
        userId: user.value.id,
        telefone: dadosPessoais.value.telefone,
        endereco: dadosPessoais.value.endereco,
        email_pessoal: dadosPessoais.value.email_pessoal
      }
    })
    
    if (response.success) {
      mostrarMensagem('Sucesso!', 'Dados pessoais atualizados com sucesso!', 'success')
      editandoDadosPessoais.value = false
      await carregarDados() // Recarregar dados
    }
  } catch (error: any) {
    console.error('Erro ao salvar dados pessoais:', error)
    mostrarMensagem('Erro!', error.data?.message || 'Não foi possível salvar os dados', 'error')
  } finally {
    salvando.value = false
  }
}

// Função para salvar dados profissionais (apenas admin)
const salvarDadosProfissionais = async () => {
  if (!user.value?.id) {
    mostrarMensagem('Erro!', 'Usuário não autenticado', 'error')
    return
  }

  if (!isAdmin.value) {
    mostrarMensagem('Erro!', 'Apenas administradores podem editar dados profissionais', 'error')
    return
  }

  salvando.value = true
  try {
    const response: any = await $fetch('/api/funcionarios/meus-dados', {
      method: 'PATCH',
      body: {
        userId: user.value.id,
        cargo_id: dadosProfissionais.value.cargo,
        departamento_id: dadosProfissionais.value.departamento,
        data_admissao: dadosProfissionais.value.dataAdmissao,
        tipo_contrato: dadosProfissionais.value.tipoContrato,
        carga_horaria: dadosProfissionais.value.cargaHoraria,
        empresa_id: dadosProfissionais.value.empresa
      }
    })
    
    if (response.success) {
      mostrarMensagem('Sucesso!', 'Dados profissionais atualizados com sucesso!', 'success')
      editandoDadosProfissionais.value = false
      await carregarDados() // Recarregar dados
    }
  } catch (error: any) {
    console.error('Erro ao salvar dados profissionais:', error)
    mostrarMensagem('Erro!', error.data?.message || 'Não foi possível salvar os dados', 'error')
  } finally {
    salvando.value = false
  }
}

// Função para salvar dados bancários
const salvarDadosBancarios = async () => {
  if (!user.value?.id) {
    mostrarMensagem('Erro!', 'Usuário não autenticado', 'error')
    return
  }

  salvando.value = true
  try {
    const response: any = await $fetch('/api/funcionarios/meus-dados', {
      method: 'PATCH',
      body: {
        userId: user.value.id,
        banco: dadosBancarios.value.banco,
        tipo_conta: dadosBancarios.value.tipoConta,
        agencia: dadosBancarios.value.agencia,
        conta: dadosBancarios.value.conta
      }
    })
    
    if (response.success) {
      mostrarMensagem('Sucesso!', 'Dados bancários atualizados com sucesso!', 'success')
      editandoPagamento.value = false
      await carregarDados() // Recarregar dados
    }
  } catch (error: any) {
    console.error('Erro ao salvar dados bancários:', error)
    mostrarMensagem('Erro!', error.data?.message || 'Não foi possível salvar os dados', 'error')
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
