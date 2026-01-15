<template>
  <UiCard padding="p-6">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <!-- Avatar -->
        <div class="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
          <span class="text-primary-700 font-bold text-2xl">
            {{ funcionario.nome_completo.charAt(0) }}
          </span>
        </div>
        
        <!-- Informações -->
        <div>
          <h3 class="text-xl font-bold text-gray-800">{{ funcionario.nome_completo }}</h3>
          <p class="text-lg text-gray-600">{{ funcionario.cargo }} - {{ funcionario.departamento }}</p>
          <p class="text-gray-500">{{ funcionario.email_login }}</p>
          <p class="text-sm text-gray-400">CPF: {{ funcionario.cpf }}</p>
          <p class="text-sm text-gray-400">Admissão: {{ formatarData(funcionario.data_admissao) }}</p>
          
          <!-- Badges -->
          <div class="flex gap-2 mt-2">
            <UiBadge :variant="funcionario.status === 'ativo' ? 'success' : 'gray'">
              {{ funcionario.status === 'ativo' ? 'Ativo' : 'Inativo' }}
            </UiBadge>
            
            <UiBadge :variant="funcionario.tipo_acesso === 'admin' ? 'warning' : 'info'">
              {{ funcionario.tipo_acesso === 'admin' ? 'Administrador' : 'Funcionário' }}
            </UiBadge>
            
            <UiBadge variant="gray">
              {{ funcionario.telefone }}
            </UiBadge>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="flex gap-2">
        <UiButton variant="ghost" @click="$emit('edit', funcionario)">
          ✏️ Editar
        </UiButton>
        
        <UiButton variant="ghost" @click="verHolerites">
          📄 Holerites
        </UiButton>
        
        <UiButton 
          variant="ghost" 
          @click="enviarCredenciais"
          :disabled="enviandoEmail"
        >
          {{ enviandoEmail ? '📧 Enviando...' : '🔑 Login' }}
        </UiButton>
        
        <UiButton 
          :variant="funcionario.status === 'ativo' ? 'danger' : 'success'"
          @click="$emit('toggle-status', funcionario)"
        >
          {{ funcionario.status === 'ativo' ? '🚫 Inativar' : '✓ Ativar' }}
        </UiButton>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
interface Props {
  funcionario: {
    id: number
    nome_completo: string
    cpf: string
    cargo: string
    departamento: string
    status: string
    tipo_acesso: string
    email_login: string
    telefone: string
    data_admissao: string
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [funcionario: any]
  'toggle-status': [funcionario: any]
  'email-enviado': [mensagem: string]
  'email-erro': [mensagem: string]
}>()

const enviandoEmail = ref(false)

const verHolerites = () => {
  // Navegar para página de holerites do funcionário
  navigateTo('/admin/holerites')
}

const enviarCredenciais = async () => {
  if (enviandoEmail.value) return
  
  enviandoEmail.value = true
  
  try {
    console.log('📧 Enviando credenciais para funcionário ID:', props.funcionario.id)
    
    await $fetch('/api/funcionarios/enviar-acesso', {
      method: 'POST',
      body: {
        funcionario_id: props.funcionario.id
      }
    })
    
    emit('email-enviado', `Credenciais enviadas com sucesso para ${props.funcionario.email_login}!`)
  } catch (error: any) {
    console.error('❌ Erro ao enviar credenciais:', error)
    emit('email-erro', error.data?.message || 'Erro ao enviar credenciais. Verifique se o funcionário possui email cadastrado.')
  } finally {
    enviandoEmail.value = false
  }
}

const formatarData = (data: string) => {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR')
}
</script>