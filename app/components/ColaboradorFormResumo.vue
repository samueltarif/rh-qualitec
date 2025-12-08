<template>
  <div class="space-y-6">
    <!-- Dados Pessoais -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Icon name="heroicons:user" size="18" />
        Dados Pessoais
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <div><span class="text-gray-500">Nome:</span> <span class="font-medium">{{ form.nome || '-' }}</span></div>
        <div><span class="text-gray-500">Email:</span> <span class="font-medium">{{ form.email_corporativo || '-' }}</span></div>
        <div><span class="text-gray-500">Telefone:</span> <span class="font-medium">{{ form.celular || '-' }}</span></div>
        <div><span class="text-gray-500">Data Nascimento:</span> <span class="font-medium">{{ formatDate(form.data_nascimento) }}</span></div>
        <div><span class="text-gray-500">Sexo:</span> <span class="font-medium">{{ formatSexo(form.sexo) }}</span></div>
        <div><span class="text-gray-500">Estado Civil:</span> <span class="font-medium">{{ form.estado_civil || '-' }}</span></div>
      </div>
    </div>

    <!-- Documentos -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Icon name="heroicons:document-text" size="18" />
        Documentos
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <div><span class="text-gray-500">CPF:</span> <span class="font-medium">{{ form.cpf || '-' }}</span></div>
        <div><span class="text-gray-500">RG:</span> <span class="font-medium">{{ form.rg || '-' }}</span></div>
        <div><span class="text-gray-500">PIS:</span> <span class="font-medium">{{ form.pis || '-' }}</span></div>
        <div><span class="text-gray-500">CNH:</span> <span class="font-medium">{{ form.cnh || '-' }}</span></div>
        <div><span class="text-gray-500">Categoria CNH:</span> <span class="font-medium">{{ form.cnh_categoria || '-' }}</span></div>
        <div><span class="text-gray-500">Validade CNH:</span> <span class="font-medium">{{ formatDate(form.cnh_validade) }}</span></div>
      </div>
    </div>

    <!-- Dados Profissionais -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Icon name="heroicons:briefcase" size="18" />
        Dados Profissionais
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <div><span class="text-gray-500">Matrícula:</span> <span class="font-medium">{{ form.matricula || '-' }}</span></div>
        <div><span class="text-gray-500">Cargo:</span> <span class="font-medium">{{ getCargoNome(form.cargo_id) }}</span></div>
        <div><span class="text-gray-500">Departamento:</span> <span class="font-medium">{{ getDepartamentoNome(form.departamento_id) }}</span></div>
        <div><span class="text-gray-500">Gestor:</span> <span class="font-medium">{{ getGestorNome(form.gestor_id) }}</span></div>
        <div><span class="text-gray-500">Data Admissão:</span> <span class="font-medium">{{ formatDate(form.data_admissao) }}</span></div>
        <div><span class="text-gray-500">Tipo Contrato:</span> <span class="font-medium">{{ formatTipoContrato(form.tipo_contrato) }}</span></div>
        <div><span class="text-gray-500">Salário:</span> <span class="font-medium">{{ formatCurrency(form.salario) }}</span></div>
        <div><span class="text-gray-500">Jornada:</span> <span class="font-medium">{{ form.jornada_trabalho || '-' }}</span></div>
        <div><span class="text-gray-500">Status:</span> <span class="font-medium">{{ formatStatus(form.status) }}</span></div>
      </div>
    </div>

    <!-- Endereço -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Icon name="heroicons:map-pin" size="18" />
        Endereço
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <div><span class="text-gray-500">CEP:</span> <span class="font-medium">{{ form.cep || '-' }}</span></div>
        <div class="md:col-span-2"><span class="text-gray-500">Logradouro:</span> <span class="font-medium">{{ form.logradouro || '-' }}</span></div>
        <div><span class="text-gray-500">Número:</span> <span class="font-medium">{{ form.numero || '-' }}</span></div>
        <div><span class="text-gray-500">Complemento:</span> <span class="font-medium">{{ form.complemento || '-' }}</span></div>
        <div><span class="text-gray-500">Bairro:</span> <span class="font-medium">{{ form.bairro || '-' }}</span></div>
        <div><span class="text-gray-500">Cidade:</span> <span class="font-medium">{{ form.cidade || '-' }}</span></div>
        <div><span class="text-gray-500">Estado:</span> <span class="font-medium">{{ form.estado || '-' }}</span></div>
      </div>
    </div>

    <!-- Dados Bancários -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Icon name="heroicons:credit-card" size="18" />
        Dados Bancários
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        <div><span class="text-gray-500">Banco:</span> <span class="font-medium">{{ form.banco_nome || '-' }}</span></div>
        <div><span class="text-gray-500">Agência:</span> <span class="font-medium">{{ form.agencia || '-' }}</span></div>
        <div><span class="text-gray-500">Conta:</span> <span class="font-medium">{{ form.conta || '-' }}</span></div>
        <div><span class="text-gray-500">Tipo:</span> <span class="font-medium">{{ form.tipo_conta || '-' }}</span></div>
        <div><span class="text-gray-500">PIX:</span> <span class="font-medium">{{ form.pix || '-' }}</span></div>
      </div>
    </div>

    <!-- Benefícios -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Icon name="heroicons:gift" size="18" />
        Benefícios
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <div><span class="text-gray-500">Vale Transporte:</span> <span class="font-medium">{{ form.recebe_vt ? (form.valor_vt ? formatCurrency(form.valor_vt) : 'Sim') : 'Não' }}</span></div>
        <div><span class="text-gray-500">Vale Refeição:</span> <span class="font-medium">{{ form.recebe_vr ? (form.valor_vr ? formatCurrency(form.valor_vr) : 'Sim') : 'Não' }}</span></div>
        <div><span class="text-gray-500">Vale Alimentação:</span> <span class="font-medium">{{ form.recebe_va ? (form.valor_va ? formatCurrency(form.valor_va) : 'Sim') : 'Não' }}</span></div>
        <div><span class="text-gray-500">Plano Saúde:</span> <span class="font-medium">{{ form.plano_saude ? 'Sim' : 'Não' }}</span></div>
        <div><span class="text-gray-500">Plano Odontológico:</span> <span class="font-medium">{{ form.plano_odonto ? 'Sim' : 'Não' }}</span></div>
        <div><span class="text-gray-500">VA/VR Combinado:</span> <span class="font-medium">{{ form.recebe_va_vr ? (form.valor_va_vr ? formatCurrency(form.valor_va_vr) : 'Sim') : 'Não' }}</span></div>
      </div>
    </div>

    <!-- Contato de Emergência -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Icon name="heroicons:phone" size="18" />
        Contato de Emergência
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <div><span class="text-gray-500">Nome:</span> <span class="font-medium">{{ form.contato_emergencia_nome || '-' }}</span></div>
        <div><span class="text-gray-500">Parentesco:</span> <span class="font-medium">{{ form.contato_emergencia_parentesco || '-' }}</span></div>
        <div><span class="text-gray-500">Telefone:</span> <span class="font-medium">{{ form.contato_emergencia_telefone || '-' }}</span></div>
      </div>
    </div>

    <!-- Observações -->
    <div v-if="form.observacoes" class="bg-gray-50 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Icon name="heroicons:document-text" size="18" />
        Observações RH
      </h4>
      <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ form.observacoes }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  form: Record<string, any>
  cargos: Array<{ id: string; nome: string; nivel: string }>
  departamentos: Array<{ id: string; nome: string }>
  gestores: Array<{ id: string; nome: string }>
}>()

const formatDate = (date: string | null) => {
  if (!date) return '-'
  // Adiciona o timezone para evitar problemas de conversão
  const dateObj = new Date(date + 'T00:00:00')
  return dateObj.toLocaleDateString('pt-BR')
}

const formatCurrency = (value: number | null) => {
  if (!value) return '-'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatSexo = (sexo: string | null) => {
  const map: Record<string, string> = {
    'M': 'Masculino',
    'F': 'Feminino',
    'Outro': 'Outro'
  }
  return map[sexo || ''] || '-'
}

const formatTipoContrato = (tipo: string | null) => {
  if (!tipo) return '-'
  return tipo
}

const formatStatus = (status: string | null) => {
  if (!status) return '-'
  return status
}



const getCargoNome = (id: string | null) => {
  if (!id) return '-'
  const cargo = props.cargos.find(c => c.id === id)
  return cargo ? `${cargo.nome} (${cargo.nivel})` : '-'
}

const getDepartamentoNome = (id: string | null) => {
  if (!id) return '-'
  const dept = props.departamentos.find(d => d.id === id)
  return dept?.nome || '-'
}

const getGestorNome = (id: string | null) => {
  if (!id) return '-'
  const gestor = props.gestores.find(g => g.id === id)
  return gestor?.nome || '-'
}
</script>
