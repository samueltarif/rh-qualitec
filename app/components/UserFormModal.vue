<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
        <h3 class="text-xl font-bold text-gray-800">{{ isEditing ? 'Editar Usuário' : 'Novo Usuário' }}</h3>
        <button class="p-2 hover:bg-gray-100 rounded-lg" @click="$emit('close')">
          <Icon name="heroicons:x-mark" size="24" />
        </button>
      </div>

      <form class="p-6" @submit.prevent="$emit('submit')">
        <div class="space-y-4">
          <!-- Nome -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <UIInput :model-value="form.nome" @update:model-value="update('nome', $event)" type="text" required />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <UIInput :model-value="form.email" @update:model-value="update('email', $event)" type="email" required />
          </div>

          <!-- Senha (apenas ao criar) -->
          <div v-if="!isEditing">
            <label class="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
            <UIInput :model-value="form.password" @update:model-value="update('password', $event)" type="password" required />
            <p class="text-xs text-gray-500 mt-1">
              Mínimo 6 caracteres
              <span v-if="form.password === 'Qualitec@2025'" class="text-green-600 font-medium ml-2">
                ✓ Senha padrão aplicada
              </span>
            </p>
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Acesso *</label>
            <UISelect :model-value="form.role" @update:model-value="update('role', $event)" required>
              <option value="">Selecione</option>
              <option value="admin">Administrador</option>
              <option value="funcionario">Funcionário</option>
            </UISelect>
          </div>

          <!-- Colaborador (opcional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Este usuário É qual colaborador? (opcional)
            </label>
            <div class="space-y-2">
              <UISelect v-model="selectedColaboradorId">
                <option value="">Nenhum - Criar usuário sem vínculo</option>
                <option v-for="col in colaboradores" :key="col.id" :value="col.id">
                  {{ col.nome }}{{ col.email_corporativo ? ` (${col.email_corporativo})` : '' }}
                </option>
              </UISelect>
              
              <!-- Botão de Autopreencher -->
              <button
                v-if="selectedColaboradorId"
                type="button"
                @click="autoPreencherColaborador"
                class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="heroicons:sparkles" size="18" />
                Autopreencher com dados deste colaborador
              </button>
            </div>
            <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p class="text-xs text-blue-800">
                <Icon name="heroicons:information-circle" size="14" class="inline" />
                <strong>O que significa?</strong><br>
                Vincule se este usuário do sistema É um colaborador já cadastrado no RH.<br>
                Exemplo: Criar login para "Silvana" → Selecione o colaborador "Silvana"
              </p>
            </div>
            <div class="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p class="text-xs text-amber-800">
                <Icon name="heroicons:light-bulb" size="14" class="inline" />
                <strong>Hierarquia (quem responde a quem):</strong><br>
                Configure no cadastro do Colaborador, no campo "Gestor Direto"
              </p>
            </div>
          </div>

          <!-- Status -->
          <div class="flex items-center gap-2">
            <input type="checkbox" :checked="form.ativo" @change="update('ativo', ($event.target as HTMLInputElement).checked)" class="w-4 h-4 text-red-700 border-gray-300 rounded focus:ring-red-500">
            <label class="text-sm font-medium text-gray-700">Usuário ativo</label>
          </div>
        </div>

        <!-- Botões -->
        <div class="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <UIButton type="button" theme="admin" variant="secondary" full-width @click="$emit('close')">Cancelar</UIButton>
          <UIButton type="submit" theme="admin" variant="primary" full-width :disabled="saving">
            {{ saving ? 'Salvando...' : (isEditing ? 'Salvar' : 'Criar Usuário') }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isEditing: boolean
  form: Record<string, any>
  saving: boolean
  colaboradores: Array<{ id: string; nome: string; email_corporativo?: string }>
}>()

const emit = defineEmits<{
  close: []
  submit: []
  'update:form': [value: Record<string, any>]
}>()

const selectedColaboradorId = ref('')

const update = (key: string, value: any) => {
  emit('update:form', { ...props.form, [key]: value })
}

const autoPreencherColaborador = () => {
  if (!selectedColaboradorId.value) return
  
  const colaborador = props.colaboradores.find(c => c.id === selectedColaboradorId.value)
  if (!colaborador) return
  
  // Preencher todos os campos
  const updatedForm = { ...props.form }
  
  // Nome
  updatedForm.nome = colaborador.nome
  
  // Email (usar email corporativo se existir)
  if (colaborador.email_corporativo) {
    updatedForm.email = colaborador.email_corporativo
  }
  
  // Senha padrão: Qualitec@2025
  updatedForm.password = 'Qualitec@2025'
  
  // Vincular colaborador
  updatedForm.colaborador_id = colaborador.id
  
  // Tipo de acesso padrão: funcionario
  if (!updatedForm.role) {
    updatedForm.role = 'funcionario'
  }
  
  // Emitir atualização completa
  emit('update:form', updatedForm)
  
  // Mostrar mensagem de sucesso
  alert('✅ Dados preenchidos automaticamente!\n\nSenha padrão: Qualitec@2025\n\nRevise os dados e clique em "Criar Usuário".')
}
</script>
