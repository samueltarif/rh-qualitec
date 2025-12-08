<template>
  <div class="space-y-4">
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Banco</label>
        <UIInput :model-value="modelValue.banco_nome" @update:model-value="update('banco_nome', $event)" type="text" placeholder="Nome do banco" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Código do Banco</label>
        <UIInput :model-value="modelValue.banco_codigo" @update:model-value="update('banco_codigo', $event)" type="text" placeholder="000" />
      </div>
    </div>
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Agência</label>
        <UIInput :model-value="modelValue.agencia" @update:model-value="update('agencia', $event)" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Conta</label>
        <UIInput :model-value="modelValue.conta" @update:model-value="update('conta', $event)" type="text" />
      </div>
      <div>
        <UISelect :model-value="modelValue.tipo_conta" @update:model-value="update('tipo_conta', $event)" label="Tipo de Conta">
          <option value="">Selecione</option>
          <option value="corrente">Corrente</option>
          <option value="poupanca">Poupança</option>
          <option value="salario">Salário</option>
        </UISelect>
      </div>
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Chave PIX</label>
        <UIInput :model-value="modelValue.pix" @update:model-value="update('pix', $event)" type="text" placeholder="CPF, email, telefone ou chave aleatória" />
      </div>
      <div>
        <UISelect :model-value="modelValue.pix_chave" @update:model-value="update('pix_chave', $event)" label="Tipo da Chave PIX">
          <option value="">Selecione</option>
          <option value="cpf">CPF</option>
          <option value="email">Email</option>
          <option value="telefone">Telefone</option>
          <option value="aleatoria">Chave Aleatória</option>
        </UISelect>
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
