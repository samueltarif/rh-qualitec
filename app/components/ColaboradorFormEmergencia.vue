<template>
  <div class="space-y-6">
    <!-- Contato de Emergência 1 -->
    <div>
      <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Icon name="heroicons:user" size="18" />
        Contato de Emergência Principal
      </h4>
      <div class="grid md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <UIInput :model-value="modelValue.contato_emergencia_nome" @update:model-value="update('contato_emergencia_nome', $event)" type="text" placeholder="Nome completo" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Parentesco</label>
          <UISelect :model-value="modelValue.contato_emergencia_parentesco" @update:model-value="update('contato_emergencia_parentesco', $event)">
            <option value="">Selecione</option>
            <option value="Pai">Pai</option>
            <option value="Mãe">Mãe</option>
            <option value="Cônjuge">Cônjuge</option>
            <option value="Filho(a)">Filho(a)</option>
            <option value="Irmão(ã)">Irmão(ã)</option>
            <option value="Avô(ó)">Avô(ó)</option>
            <option value="Tio(a)">Tio(a)</option>
            <option value="Primo(a)">Primo(a)</option>
            <option value="Amigo(a)">Amigo(a)</option>
            <option value="Outro">Outro</option>
          </UISelect>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <UIInput :model-value="modelValue.contato_emergencia_telefone" @update:model-value="update('contato_emergencia_telefone', $event)" type="tel" placeholder="(00) 00000-0000" />
        </div>
      </div>
    </div>

    <!-- Contato de Emergência 2 -->
    <div>
      <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Icon name="heroicons:user" size="18" />
        Contato de Emergência 2 (Opcional)
      </h4>
      <div class="grid md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <UIInput :model-value="modelValue.contato_emergencia_2_nome" @update:model-value="update('contato_emergencia_2_nome', $event)" type="text" placeholder="Nome completo" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Parentesco</label>
          <UISelect :model-value="modelValue.contato_emergencia_2_parentesco" @update:model-value="update('contato_emergencia_2_parentesco', $event)">
            <option value="">Selecione</option>
            <option value="Pai">Pai</option>
            <option value="Mãe">Mãe</option>
            <option value="Cônjuge">Cônjuge</option>
            <option value="Filho(a)">Filho(a)</option>
            <option value="Irmão(ã)">Irmão(ã)</option>
            <option value="Avô(ó)">Avô(ó)</option>
            <option value="Tio(a)">Tio(a)</option>
            <option value="Primo(a)">Primo(a)</option>
            <option value="Amigo(a)">Amigo(a)</option>
            <option value="Outro">Outro</option>
          </UISelect>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <UIInput :model-value="modelValue.contato_emergencia_2_telefone" @update:model-value="update('contato_emergencia_2_telefone', $event)" type="tel" placeholder="(00) 00000-0000" />
        </div>
      </div>
    </div>

    <!-- Contato de Emergência 3 -->
    <div>
      <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Icon name="heroicons:user" size="18" />
        Contato de Emergência 3 (Opcional)
      </h4>
      <div class="grid md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <UIInput :model-value="modelValue.contato_emergencia_3_nome" @update:model-value="update('contato_emergencia_3_nome', $event)" type="text" placeholder="Nome completo" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Parentesco</label>
          <UISelect :model-value="modelValue.contato_emergencia_3_parentesco" @update:model-value="update('contato_emergencia_3_parentesco', $event)">
            <option value="">Selecione</option>
            <option value="Pai">Pai</option>
            <option value="Mãe">Mãe</option>
            <option value="Cônjuge">Cônjuge</option>
            <option value="Filho(a)">Filho(a)</option>
            <option value="Irmão(ã)">Irmão(ã)</option>
            <option value="Avô(ó)">Avô(ó)</option>
            <option value="Tio(a)">Tio(a)</option>
            <option value="Primo(a)">Primo(a)</option>
            <option value="Amigo(a)">Amigo(a)</option>
            <option value="Outro">Outro</option>
          </UISelect>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <UIInput :model-value="modelValue.contato_emergencia_3_telefone" @update:model-value="update('contato_emergencia_3_telefone', $event)" type="tel" placeholder="(00) 00000-0000" />
        </div>
      </div>
    </div>

    <!-- Email Alternativo -->
    <div>
      <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Icon name="heroicons:envelope" size="18" />
        Email Alternativo
      </h4>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <UIInput :model-value="modelValue.email_alternativo" @update:model-value="update('email_alternativo', $event)" type="email" placeholder="email@exemplo.com" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: Record<string, any> }>()
const emit = defineEmits<{ 'update:modelValue': [value: Record<string, any>] }>()

const update = (key: string, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
