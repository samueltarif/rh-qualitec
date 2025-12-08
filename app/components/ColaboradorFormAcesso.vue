<template>
  <div class="space-y-4">
    <!-- Info -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <Icon name="heroicons:information-circle" class="text-blue-600 mt-0.5" size="20" />
        <div class="flex-1">
          <h4 class="font-semibold text-blue-900 mb-1">Criar Acesso ao Sistema</h4>
          <p class="text-sm text-blue-800">
            Marque a opção abaixo para criar automaticamente um usuário de acesso ao sistema para este colaborador.
            O colaborador poderá fazer login e acessar o portal do funcionário.
          </p>
        </div>
      </div>
    </div>

    <!-- Toggle Criar Usuário -->
    <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
      <input 
        type="checkbox" 
        :checked="modelValue.criar_usuario"
        @change="update('criar_usuario', ($event.target as HTMLInputElement).checked)"
        class="w-5 h-5 text-red-700 border-gray-300 rounded focus:ring-red-500"
      >
      <div class="flex-1">
        <label class="text-sm font-semibold text-gray-800 cursor-pointer">
          Criar usuário de acesso ao sistema
        </label>
        <p class="text-xs text-gray-600 mt-0.5">
          O colaborador receberá credenciais para acessar o portal
        </p>
      </div>
    </div>

    <!-- Campos de Usuário (aparecem quando checkbox marcado) -->
    <div v-if="modelValue.criar_usuario" class="space-y-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50/30">
      <h4 class="font-semibold text-gray-800 flex items-center gap-2">
        <Icon name="heroicons:key" size="20" />
        Dados de Acesso
      </h4>

      <!-- Email de Login -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Email de Login *
          <span class="text-xs text-gray-500 font-normal ml-1">(será usado para fazer login)</span>
        </label>
        <UIInput 
          :model-value="modelValue.usuario_email || modelValue.email_corporativo"
          @update:model-value="update('usuario_email', $event)"
          type="email" 
          placeholder="usuario@qualitec.ind.br"
          :required="modelValue.criar_usuario"
        />
        <p class="text-xs text-gray-600 mt-1">
          💡 Sugestão: use o email corporativo do colaborador
        </p>
      </div>

      <!-- Senha Inicial -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Senha Inicial *
          <span class="text-xs text-gray-500 font-normal ml-1">(mínimo 6 caracteres)</span>
        </label>
        <UIInput 
          :model-value="modelValue.usuario_senha"
          @update:model-value="update('usuario_senha', $event)"
          type="password" 
          placeholder="••••••••"
          :required="modelValue.criar_usuario"
        />
        <p class="text-xs text-gray-600 mt-1">
          🔒 O colaborador poderá alterar a senha após o primeiro login
        </p>
      </div>

      <!-- Nível de Acesso -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso *</label>
        <UISelect 
          :model-value="modelValue.usuario_role || 'funcionario'"
          @update:model-value="update('usuario_role', $event)"
          :required="modelValue.criar_usuario"
        >
          <option value="funcionario">👤 Funcionário (Portal do Funcionário)</option>
          <option value="admin" :disabled="!isAdminEmail">
            👑 Administrador (Acesso Total)
            {{ !isAdminEmail ? ' - Apenas silvana@qualitec.ind.br' : '' }}
          </option>
        </UISelect>
        <p v-if="modelValue.usuario_role === 'admin' && !isAdminEmail" class="text-xs text-amber-600 mt-1">
          ⚠️ Apenas silvana@qualitec.ind.br pode ter perfil de administrador
        </p>
      </div>

      <!-- Status do Usuário -->
      <div class="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
        <input 
          type="checkbox" 
          :checked="modelValue.usuario_ativo !== false"
          @change="update('usuario_ativo', ($event.target as HTMLInputElement).checked)"
          class="w-4 h-4 text-red-700 border-gray-300 rounded focus:ring-red-500"
        >
        <label class="text-sm font-medium text-gray-700">
          Usuário ativo (pode fazer login imediatamente)
        </label>
      </div>

      <!-- Resumo -->
      <div class="bg-green-50 border border-green-200 rounded-lg p-3">
        <p class="text-sm text-green-800">
          ✅ Ao salvar, será criado:
        </p>
        <ul class="text-xs text-green-700 mt-2 space-y-1 ml-4">
          <li>• Colaborador na tabela de RH</li>
          <li>• Usuário vinculado para acesso ao sistema</li>
          <li>• Credenciais prontas para uso</li>
        </ul>
      </div>
    </div>

    <!-- Info quando não criar usuário -->
    <div v-else class="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <p class="text-sm text-gray-600">
        ℹ️ Você poderá criar o acesso ao sistema posteriormente na página de <strong>Gestão de Usuários</strong>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ 
  modelValue: Record<string, any> 
}>()

const emit = defineEmits<{ 
  'update:modelValue': [value: Record<string, any>] 
}>()

const update = (key: string, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

// Verificar se o email permite ser admin
const isAdminEmail = computed(() => {
  const email = props.modelValue.usuario_email || props.modelValue.email_corporativo || ''
  return email.toLowerCase() === 'silvana@qualitec.ind.br'
})

// Auto-preencher email de login com email corporativo
watch(() => props.modelValue.email_corporativo, (newEmail) => {
  if (newEmail && !props.modelValue.usuario_email) {
    update('usuario_email', newEmail)
  }
})
</script>
