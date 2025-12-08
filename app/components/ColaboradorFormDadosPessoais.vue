<template>
  <div class="space-y-4">
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <p class="text-sm text-blue-800"><strong>Apenas 2 campos obrigatórios:</strong> Nome e CPF</p>
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
        <UIInput :model-value="modelValue.nome" @update:model-value="update('nome', $event)" type="text" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
        <UIInput :model-value="modelValue.cpf" @update:model-value="update('cpf', $event)" type="text" placeholder="000.000.000-00" required />
      </div>
    </div>
    <div class="grid md:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
        <UIInput :model-value="modelValue.matricula" @update:model-value="update('matricula', $event)" type="text" placeholder="Ex: 001234" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
        <UIInput :model-value="modelValue.data_nascimento" @update:model-value="update('data_nascimento', $event)" type="date" />
      </div>
      <div>
        <UISelect :model-value="modelValue.sexo" @update:model-value="update('sexo', $event)" label="Sexo">
          <option value="">Selecione</option>
          <option value="M">Masculino</option>
          <option value="F">Feminino</option>
          <option value="Outro">Outro</option>
        </UISelect>
      </div>
      <div>
        <UISelect :model-value="modelValue.estado_civil" @update:model-value="update('estado_civil', $event)" label="Estado Civil">
          <option value="">Selecione</option>
          <option value="Solteiro(a)">Solteiro(a)</option>
          <option value="Casado(a)">Casado(a)</option>
          <option value="Divorciado(a)">Divorciado(a)</option>
          <option value="Viúvo(a)">Viúvo(a)</option>
          <option value="União Estável">União Estável</option>
        </UISelect>
      </div>
    </div>
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nacionalidade</label>
        <UIInput :model-value="modelValue.nacionalidade" @update:model-value="update('nacionalidade', $event)" type="text" placeholder="Ex: Brasileiro" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Naturalidade</label>
        <UIInput :model-value="modelValue.naturalidade" @update:model-value="update('naturalidade', $event)" type="text" placeholder="Ex: São Paulo - SP" />
      </div>
      <div>
        <UISelect :model-value="modelValue.escolaridade" @update:model-value="update('escolaridade', $event)" label="Escolaridade">
          <option value="">Selecione</option>
          <option value="Fundamental">Ensino Fundamental</option>
          <option value="Medio">Ensino Médio</option>
          <option value="Tecnico">Técnico</option>
          <option value="Superior">Superior</option>
          <option value="Pos_Graduacao">Pós-Graduação</option>
          <option value="Mestrado">Mestrado</option>
          <option value="Doutorado">Doutorado</option>
        </UISelect>
      </div>
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Mãe</label>
        <UIInput :model-value="modelValue.nome_mae" @update:model-value="update('nome_mae', $event)" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Pai</label>
        <UIInput :model-value="modelValue.nome_pai" @update:model-value="update('nome_pai', $event)" type="text" />
      </div>
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email Corporativo</label>
        <UIInput :model-value="modelValue.email_corporativo" @update:model-value="update('email_corporativo', $event)" type="email" placeholder="funcionario@empresa.com.br" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Telefone/Celular</label>
        <UIInput :model-value="modelValue.celular" @update:model-value="update('celular', $event)" type="tel" placeholder="(00) 00000-0000" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: Record<string, any> }>()
const emit = defineEmits<{ 'update:modelValue': [value: Record<string, any>] }>()
const update = (key: string, value: any) => emit('update:modelValue', { ...props.modelValue, [key]: value })
</script>
