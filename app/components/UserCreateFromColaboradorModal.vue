<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
        <h3 class="text-xl font-bold text-gray-800">Criar Acesso ao Sistema</h3>
        <button class="p-2 hover:bg-gray-100 rounded-lg" @click="$emit('close')">
          <Icon name="heroicons:x-mark" size="24" />
        </button>
      </div>

      <form class="p-6" @submit.prevent="handleSubmit">
        <!-- Info Colaborador -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {{ getInitials(colaborador.nome) }}
            </div>
            <div>
              <p class="font-semibold text-gray-800">{{ colaborador.nome }}</p>
              <p class="text-sm text-gray-600">{{ colaborador.cpf }}</p>
              <p v-if="colaborador.cargo" class="text-xs text-gray-500">{{ colaborador.cargo.nome }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email de Login *</label>
            <UIInput 
              v-model="form.email" 
              type="email" 
              required 
              placeholder="usuario@qualitec.ind.br"
            />
            <p class="text-xs text-gray-500 mt-1">
              Este email será usado para fazer login no sistema
            </p>
          </div>

          <!-- Senha -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Senha Inicial *</label>
            <UIInput 
              v-model="form.password" 
              type="password" 
              required 
              placeholder="••••••••"
            />
            <p class="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso *</label>
            <UISelect v-model="form.role" required>
              <option value="funcionario">👤 Funcionário (Portal do Funcionário)</option>
              <option value="admin" :disabled="!isAdminEmail">
                👑 Administrador (Acesso Total)
                {{ !isAdminEmail ? ' - Apenas silvana@qualitec.ind.br' : '' }}
              </option>
            </UISelect>
          </div>

          <!-- Status -->
          <div class="flex items-center gap-2">
            <input 
              type="checkbox" 
              v-model="form.ativo" 
              class="w-4 h-4 text-red-700 border-gray-300 rounded focus:ring-red-500"
            >
            <label class="text-sm font-medium text-gray-700">Usuário ativo (pode fazer login)</label>
          </div>
        </div>

        <!-- Botões -->
        <div class="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <UIButton type="button" theme="admin" variant="secondary" full-width @click="$emit('close')">
            Cancelar
          </UIButton>
          <UIButton type="submit" theme="admin" variant="primary" full-width :disabled="saving">
            {{ saving ? 'Criando...' : 'Criar Acesso' }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  colaborador: any
}>()

const emit = defineEmits<{
  close: []
  save: [data: any]
}>()

const saving = ref(false)

const form = ref({
  email: props.colaborador.email_corporativo || '',
  password: '',
  role: 'funcionario' as 'admin' | 'funcionario',
  ativo: true,
})

const isAdminEmail = computed(() => {
  return form.value.email.toLowerCase() === 'silvana@qualitec.ind.br'
})

const getInitials = (nome: string) => {
  const names = nome.split(' ')
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase()
  }
  return (names[0][0] + names[names.length - 1][0]).toUpperCase()
}

const handleSubmit = async () => {
  if (!form.value.email || !form.value.password) {
    alert('❌ Email e senha são obrigatórios!')
    return
  }

  if (form.value.password.length < 6) {
    alert('❌ Senha deve ter no mínimo 6 caracteres!')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    alert('❌ Email inválido!')
    return
  }

  saving.value = true
  
  emit('save', {
    nome: props.colaborador.nome,
    email: form.value.email.toLowerCase().trim(),
    password: form.value.password,
    role: form.value.role,
    colaborador_id: props.colaborador.id,
    ativo: form.value.ativo,
  })
}

defineExpose({ saving })
</script>
