<template>
  <div>
    <div v-if="perfil?.colaborador" class="space-y-6">
      <!-- Foto e Info Principal -->
      <div class="flex flex-col md:flex-row items-start gap-6">
        <div class="w-32 h-32 bg-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
          <img v-if="perfil.colaborador.foto_url" :src="perfil.colaborador.foto_url" :alt="perfil.colaborador.nome" class="w-full h-full object-cover"/>
          <Icon v-else name="heroicons:user" class="text-slate-400" size="48" />
        </div>
        <div class="flex-1">
          <h3 class="text-2xl font-bold text-slate-800">{{ perfil.colaborador.nome }}</h3>
          <p class="text-lg text-slate-600">{{ perfil.colaborador.cargo?.nome || '-' }}</p>
          <p class="text-slate-500">{{ perfil.colaborador.departamento?.nome || '-' }}</p>
          <div class="flex items-center gap-4 mt-3">
            <span class="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">{{ perfil.colaborador.status || 'Ativo' }}</span>
            <span v-if="perfil.colaborador.matricula" class="text-sm text-slate-500">Matrícula: {{ perfil.colaborador.matricula }}</span>
          </div>
        </div>
      </div>

      <!-- Dados Pessoais -->
      <div class="bg-slate-50 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Icon name="heroicons:user-circle" class="text-slate-600" size="20" />
            Dados Pessoais
          </h4>
          <button @click="showEditDadosPessoais = true" class="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
            <Icon name="heroicons:pencil" size="16" />Editar
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><p class="text-xs text-slate-500 uppercase font-medium">CPF</p><p class="text-slate-800">{{ formatCPF(perfil.colaborador.cpf) }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">RG</p><p class="text-slate-800">{{ perfil.colaborador.rg || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">PIS</p><p class="text-slate-800">{{ perfil.colaborador.pis || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Data de Nascimento</p><p class="text-slate-800">{{ formatDate(perfil.colaborador.data_nascimento) }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Sexo</p><p class="text-slate-800">{{ formatSexo(perfil.colaborador.sexo) }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Estado Civil</p><p class="text-slate-800">{{ formatEstadoCivil(perfil.colaborador.estado_civil) }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Telefone</p><p class="text-slate-800">{{ perfil.colaborador.telefone || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Email Corporativo</p><p class="text-slate-800">{{ perfil.colaborador.email_corporativo || '-' }}</p></div>
        </div>
      </div>

      <!-- Documentos -->
      <div class="bg-slate-50 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Icon name="heroicons:document-text" class="text-slate-600" size="20" />
            Documentos
          </h4>
          <button @click="showEditDocumentos = true" class="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
            <Icon name="heroicons:pencil" size="16" />Editar
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><p class="text-xs text-slate-500 uppercase font-medium">CNH</p><p class="text-slate-800">{{ perfil.colaborador.cnh || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Categoria CNH</p><p class="text-slate-800">{{ perfil.colaborador.cnh_categoria || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Validade CNH</p><p class="text-slate-800">{{ formatDate(perfil.colaborador.cnh_validade) }}</p></div>
        </div>
      </div>

      <!-- Dados Profissionais (somente leitura) -->
      <div class="bg-slate-50 rounded-xl p-6">
        <h4 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Icon name="heroicons:briefcase" class="text-slate-600" size="20" />
          Dados Profissionais
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><p class="text-xs text-slate-500 uppercase font-medium">Matrícula</p><p class="text-slate-800">{{ perfil.colaborador.matricula || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Cargo</p><p class="text-slate-800">{{ perfil.colaborador.cargo?.nome || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Departamento</p><p class="text-slate-800">{{ perfil.colaborador.departamento?.nome || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Data de Admissão</p><p class="text-slate-800">{{ formatDate(perfil.colaborador.data_admissao) }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Tipo de Contrato</p><p class="text-slate-800">{{ perfil.colaborador.tipo_contrato || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Jornada</p><p class="text-slate-800">{{ perfil.colaborador.jornada?.nome || perfil.colaborador.carga_horaria + 'h semanais' || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Salário</p><p class="text-slate-800">{{ formatCurrency(perfil.colaborador.salario) }}</p></div>
        </div>
      </div>

      <!-- Endereço -->
      <div class="bg-slate-50 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Icon name="heroicons:map-pin" class="text-slate-600" size="20" />
            Endereço
          </h4>
          <button @click="showEditEndereco = true" class="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
            <Icon name="heroicons:pencil" size="16" />Editar
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><p class="text-xs text-slate-500 uppercase font-medium">CEP</p><p class="text-slate-800">{{ perfil.colaborador.cep || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Logradouro</p><p class="text-slate-800">{{ perfil.colaborador.logradouro || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Número</p><p class="text-slate-800">{{ perfil.colaborador.numero || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Complemento</p><p class="text-slate-800">{{ perfil.colaborador.complemento || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Bairro</p><p class="text-slate-800">{{ perfil.colaborador.bairro || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Cidade</p><p class="text-slate-800">{{ perfil.colaborador.cidade || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Estado</p><p class="text-slate-800">{{ perfil.colaborador.estado || '-' }}</p></div>
        </div>
      </div>

      <!-- Dados Bancários -->
      <div class="bg-slate-50 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Icon name="heroicons:banknotes" class="text-slate-600" size="20" />
            Dados Bancários
            <span class="text-xs font-normal text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Requer aprovação</span>
          </h4>
          <button @click="showEditDadosBancarios = true" class="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
            <Icon name="heroicons:pencil" size="16" />Editar
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><p class="text-xs text-slate-500 uppercase font-medium">Banco</p><p class="text-slate-800">{{ perfil.colaborador.banco_nome || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Agência</p><p class="text-slate-800">{{ perfil.colaborador.agencia || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Conta</p><p class="text-slate-800">{{ perfil.colaborador.conta || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Tipo de Conta</p><p class="text-slate-800">{{ perfil.colaborador.tipo_conta || '-' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">PIX</p><p class="text-slate-800">{{ perfil.colaborador.pix || '-' }}</p></div>
        </div>
      </div>

      <!-- Benefícios (somente leitura) -->
      <div class="bg-slate-50 rounded-xl p-6">
        <h4 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Icon name="heroicons:gift" class="text-slate-600" size="20" />
          Benefícios
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><p class="text-xs text-slate-500 uppercase font-medium">Vale Transporte</p><p class="text-slate-800">{{ perfil.colaborador.recebe_vt ? formatCurrency(perfil.colaborador.valor_vt) : 'Não' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Vale Alimentação</p><p class="text-slate-800">{{ perfil.colaborador.recebe_va ? formatCurrency(perfil.colaborador.valor_va) : 'Não' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Vale Refeição</p><p class="text-slate-800">{{ perfil.colaborador.recebe_vr ? formatCurrency(perfil.colaborador.valor_vr) : 'Não' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Plano de Saúde</p><p class="text-slate-800">{{ perfil.colaborador.plano_saude ? 'Sim' : 'Não' }}</p></div>
          <div><p class="text-xs text-slate-500 uppercase font-medium">Plano Odontológico</p><p class="text-slate-800">{{ perfil.colaborador.plano_odonto ? 'Sim' : 'Não' }}</p></div>
        </div>
      </div>

      <!-- Contatos de Emergência -->
      <div class="bg-slate-50 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Icon name="heroicons:phone" class="text-slate-600" size="20" />
            Contatos de Emergência
          </h4>
          <button @click="showEditContatoEmergencia = true" class="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
            <Icon name="heroicons:pencil" size="16" />Editar
          </button>
        </div>
        <!-- Contato 1 -->
        <div v-if="perfil.colaborador.contato_emergencia_nome" class="mb-4 p-3 bg-white rounded-lg">
          <p class="text-xs text-slate-500 uppercase font-medium mb-1">Contato Principal</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div><span class="text-slate-600">{{ perfil.colaborador.contato_emergencia_nome }}</span></div>
            <div><span class="text-slate-500">{{ perfil.colaborador.contato_emergencia_parentesco || '-' }}</span></div>
            <div><span class="text-slate-500">{{ perfil.colaborador.contato_emergencia_telefone || '-' }}</span></div>
          </div>
        </div>
        <!-- Contato 2 -->
        <div v-if="perfil.colaborador.contato_emergencia_2_nome" class="mb-4 p-3 bg-white rounded-lg">
          <p class="text-xs text-slate-500 uppercase font-medium mb-1">Contato 2</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div><span class="text-slate-600">{{ perfil.colaborador.contato_emergencia_2_nome }}</span></div>
            <div><span class="text-slate-500">{{ perfil.colaborador.contato_emergencia_2_parentesco || '-' }}</span></div>
            <div><span class="text-slate-500">{{ perfil.colaborador.contato_emergencia_2_telefone || '-' }}</span></div>
          </div>
        </div>
        <!-- Contato 3 -->
        <div v-if="perfil.colaborador.contato_emergencia_3_nome" class="p-3 bg-white rounded-lg">
          <p class="text-xs text-slate-500 uppercase font-medium mb-1">Contato 3</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div><span class="text-slate-600">{{ perfil.colaborador.contato_emergencia_3_nome }}</span></div>
            <div><span class="text-slate-500">{{ perfil.colaborador.contato_emergencia_3_parentesco || '-' }}</span></div>
            <div><span class="text-slate-500">{{ perfil.colaborador.contato_emergencia_3_telefone || '-' }}</span></div>
          </div>
        </div>
        <p v-if="!perfil.colaborador.contato_emergencia_nome" class="text-slate-500 text-sm">Nenhum contato de emergência cadastrado</p>
      </div>
    </div>

    <!-- Sem Colaborador Vinculado -->
    <div v-else class="text-center py-12">
      <Icon name="heroicons:user-circle" class="text-slate-300 mx-auto" size="64" />
      <h3 class="text-lg font-semibold text-slate-800 mt-4">Perfil não vinculado</h3>
      <p class="text-slate-500 mt-2">Seu usuário ainda não está vinculado a um cadastro de colaborador.</p>
      <p class="text-sm text-slate-400 mt-1">Entre em contato com o RH para regularizar seu cadastro.</p>
    </div>

    <!-- Modais de Edição -->
    <EmployeeEditDadosPessoaisModal v-model="showEditDadosPessoais" :colaborador="perfil?.colaborador" @saved="$emit('refresh')" />
    <EmployeeEditDocumentosModal v-model="showEditDocumentos" :colaborador="perfil?.colaborador" @saved="$emit('refresh')" />
    <EmployeeEditEnderecoModal v-model="showEditEndereco" :colaborador="perfil?.colaborador" @saved="$emit('refresh')" />
    <EmployeeEditDadosBancariosModal v-model="showEditDadosBancarios" :colaborador="perfil?.colaborador" @saved="$emit('refresh')" />
    <EmployeeEditContatoEmergenciaModal v-model="showEditContatoEmergencia" :colaborador="perfil?.colaborador" @saved="$emit('refresh')" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ perfil: any }>()
defineEmits(['refresh'])

const showEditDadosPessoais = ref(false)
const showEditDocumentos = ref(false)
const showEditEndereco = ref(false)
const showEditDadosBancarios = ref(false)
const showEditContatoEmergencia = ref(false)

const formatDate = (date: string) => {
  if (!date) return '-'
  const [year, month, day] = date.split('T')[0].split('-')
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('pt-BR')
}

const formatCPF = (cpf: string) => {
  if (!cpf) return '-'
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const formatCurrency = (value: number) => {
  if (!value && value !== 0) return '-'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatSexo = (sexo: string) => {
  const map: Record<string, string> = {
    'M': 'Masculino',
    'F': 'Feminino',
    'Outro': 'Outro'
  }
  return map[sexo] || '-'
}

const formatEstadoCivil = (estado: string) => {
  // O enum já está no formato correto com parênteses
  return estado || '-'
}
</script>
