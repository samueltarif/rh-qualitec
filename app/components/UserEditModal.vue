<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
        <h3 class="text-xl font-bold text-gray-800">Editar Usuário</h3>
        <button class="p-2 hover:bg-gray-100 rounded-lg" @click="$emit('close')">
          <Icon name="heroicons:x-mark" size="24" />
        </button>
      </div>

      <form class="p-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Nome -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <UIInput v-model="form.nome" type="text" required />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <UIInput v-model="form.email" type="email" required />
          </div>

          <!-- Nova Senha (opcional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nova Senha (deixe vazio para manter)</label>
            <UIInput v-model="form.password" type="password" placeholder="••••••••" />
            <p class="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso *</label>
            <UISelect v-model="form.role" required>
              <option value="funcionario">Funcionário</option>
              <option value="admin" :disabled="form.email !== 'silvana@qualitec.ind.br'">
                Administrador {{ form.email !== 'silvana@qualitec.ind.br' ? '(apenas silvana@qualitec.ind.br)' : '' }}
              </option>
            </UISelect>
            <p v-if="form.role === 'admin' && form.email !== 'silvana@qualitec.ind.br'" class="text-xs text-amber-600 mt-1">
              ⚠️ Apenas silvana@qualitec.ind.br pode ser admin
            </p>
          </div>

          <!-- Colaborador (opcional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Vincular a Colaborador</label>
            <UISelect v-model="form.colaborador_id">
              <option value="">Nenhum vínculo</option>
              <option v-for="col in colaboradores" :key="col.id" :value="col.id">
                {{ col.nome }}{{ col.email_corporativo ? ` (${col.email_corporativo})` : '' }}
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
            <label class="text-sm font-medium text-gray-700">Usuário ativo</label>
          </div>
        </div>

        <!-- Botões -->
        <div class="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <UIButton type="button" theme="admin" variant="secondary" full-width @click="$emit('close')">
            Cancelar
          </UIButton>
          <UIButton type="submit" theme="admin" variant="primary" full-width :disabled="saving">
            {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: string
  nome: string
  email: string
  role: 'admin' | 'funcionario'
  colaborador_id?: string
  ativo: boolean
}

const props = defineProps<{
  user: User
  colaboradores: Array<{ id: string; nome: string; email_corporativo?: string }>
}>()

const emit = defineEmits<{
  close: []
  save: [data: any]
}>()

const saving = ref(false)

const form = ref({
  nome: props.user.nome,
  email: props.user.email,
  password: '',
  role: props.user.role,
  colaborador_id: props.user.colaborador_id || '',
  ativo: props.user.ativo,
})

const handleSubmit = async () => {
  // Validações
  if (!form.value.nome || !form.value.email) {
    alert('❌ Nome e email são obrigatórios!')
    return
  }

  if (form.value.password && form.value.password.length < 6) {
    alert('❌ Senha deve ter no mínimo 6 caracteres!')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    alert('❌ Email inválido!')
    return
  }

  saving.value = true
  
  const updateData: any = {
    nome: form.value.nome,
    email: form.value.email.toLowerCase().trim(),
    role: form.value.role,
    colaborador_id: form.value.colaborador_id || null,
    ativo: form.value.ativo,
  }

  // Só incluir senha se foi preenchida
  if (form.value.password) {
    updateData.password = form.value.password
  }

  emit('save', updateData)
}

// Expor saving para o pai poder controlar
defineExpose({ saving })
</script>
