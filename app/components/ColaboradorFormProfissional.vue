<template>
  <div class="space-y-4">
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
        <UISelect :model-value="modelValue.cargo_id" @update:model-value="update('cargo_id', $event)">
          <option value="">Selecione</option>
          <option v-for="cargo in cargos" :key="cargo.id" :value="cargo.id">
            {{ cargo.nome }} ({{ cargo.nivel === 'gestao' ? 'Gestão' : 'Operacional' }})
          </option>
        </UISelect>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
        <UISelect :model-value="modelValue.departamento_id" @update:model-value="update('departamento_id', $event)">
          <option value="">Selecione</option>
          <option v-for="dep in departamentos" :key="dep.id" :value="dep.id">{{ dep.nome }}</option>
        </UISelect>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Jornada/Escala *
          <span class="text-xs text-gray-500">(Define dias de trabalho)</span>
        </label>
        <UISelect :model-value="modelValue.jornada_id" @update:model-value="update('jornada_id', $event)">
          <option value="">Selecione</option>
          <option v-for="jornada in jornadas" :key="jornada.id" :value="jornada.id">
            {{ jornada.nome }} - {{ jornada.tipo }}
          </option>
        </UISelect>
        <p class="text-xs text-gray-500 mt-1">
          A jornada define os dias que o colaborador deve trabalhar
        </p>
      </div>
    </div>
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Gestor Direto</label>
        <UISelect :model-value="modelValue.gestor_id" @update:model-value="update('gestor_id', $event)">
          <option value="">Selecione</option>
          <option v-for="gestor in gestores" :key="gestor.id" :value="gestor.id">{{ gestor.nome }}</option>
        </UISelect>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
        <UIInput :model-value="modelValue.unidade" @update:model-value="update('unidade', $event)" type="text" placeholder="Ex: Matriz, Filial 1" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Setor</label>
        <UIInput :model-value="modelValue.setor" @update:model-value="update('setor', $event)" type="text" placeholder="Ex: Produção, Vendas" />
      </div>
    </div>
    <div class="grid md:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Contrato</label>
        <UISelect :model-value="modelValue.tipo_contrato" @update:model-value="update('tipo_contrato', $event)">
          <option value="">Selecione</option>
          <option value="CLT">CLT</option>
          <option value="PJ">PJ</option>
          <option value="Estagiário">Estágio</option>
          <option value="Temporário">Temporário</option>
          <option value="Aprendiz">Aprendiz</option>
        </UISelect>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Jornada (horas/semana)</label>
        <UIInput :model-value="modelValue.jornada_trabalho" @update:model-value="update('jornada_trabalho', $event)" type="text" placeholder="44" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Carga Horária</label>
        <UIInput :model-value="modelValue.carga_horaria" @update:model-value="update('carga_horaria', Number($event))" type="number" placeholder="44" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Local de Trabalho</label>
        <UISelect :model-value="modelValue.local_trabalho" @update:model-value="update('local_trabalho', $event)">
          <option value="">Selecione</option>
          <option value="Presencial">Presencial</option>
          <option value="Remoto">Remoto</option>
          <option value="Híbrido">Híbrido</option>
        </UISelect>
      </div>
    </div>
    <div class="grid md:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Salário (R$)</label>
        <UIInput :model-value="modelValue.salario" @update:model-value="update('salario', Number($event))" type="number" step="0.01" min="0" placeholder="0.00" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Salário Base (R$)</label>
        <UIInput :model-value="modelValue.salario_base" @update:model-value="update('salario_base', Number($event))" type="number" step="0.01" min="0" placeholder="0.00" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Data de Admissão</label>
        <UIInput :model-value="modelValue.data_admissao" @update:model-value="update('data_admissao', $event)" type="date" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Regime de Pagamento</label>
        <UISelect :model-value="modelValue.regime_pagamento" @update:model-value="update('regime_pagamento', $event)">
          <option value="">Selecione</option>
          <option value="mensal">Mensal</option>
          <option value="quinzenal">Quinzenal</option>
          <option value="por_dia">Por Dia</option>
        </UISelect>
      </div>
    </div>
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <UISelect :model-value="modelValue.status" @update:model-value="update('status', $event)">
          <option value="Ativo">Ativo</option>
          <option value="Ferias">Férias</option>
          <option value="Afastado">Afastado</option>
          <option value="Desligado">Desligado</option>
        </UISelect>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Qtd. Dependentes</label>
        <UIInput :model-value="modelValue.qtd_dependentes" @update:model-value="update('qtd_dependentes', Number($event))" type="number" min="0" />
      </div>
    </div>
    
    <!-- Campos de Desligamento -->
    <div v-if="modelValue.status === 'Desligado'" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
      <h4 class="font-medium text-red-800 mb-3">Dados do Desligamento</h4>
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data de Desligamento</label>
          <UIInput :model-value="modelValue.data_desligamento" @update:model-value="update('data_desligamento', $event)" type="date" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Motivo do Desligamento</label>
          <UIInput :model-value="modelValue.motivo_desligamento" @update:model-value="update('motivo_desligamento', $event)" type="text" placeholder="Ex: Pedido de demissão" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: Record<string, any>
  cargos: Array<{ id: string; nome: string; nivel: string }>
  departamentos: Array<{ id: string; nome: string }>
  gestores: Array<{ id: string; nome: string }>
  jornadas: Array<{ id: string; nome: string; tipo: string }>
}>()

const emit = defineEmits<{ 'update:modelValue': [value: Record<string, any>] }>()

const update = (key: string, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
