<template>
  <UIModal :model-value="aberto" @update:model-value="$emit('update:aberto', $event)" size="xl">
    <template #header>
      <h3 class="text-xl font-bold text-gray-800">Editar Folha - {{ dados?.nome }}</h3>
      <p class="text-sm text-gray-500">{{ nomeMes }}/{{ ano }}</p>
    </template>

    <div v-if="dados" class="space-y-6">
      <!-- Dados do Colaborador -->
      <FolhaDadosColaboradorSection :dados="dados" />

      <!-- Layout com 2 colunas: Formulário + Resumo -->
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Coluna Esquerda: Formulário (2/3) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Proventos -->
          <FolhaFormProventos 
            :model-value="proventos"
            @update:model-value="$emit('update:proventos', $event)"
            @change="$emit('recalcular')"
          />

          <!-- Descontos -->
          <FolhaFormDescontos 
            :model-value="descontos"
            @update:model-value="$emit('update:descontos', $event)"
            @change="$emit('recalcular')"
          />

          <!-- Benefícios -->
          <FolhaBeneficiosSection 
            :model-value="beneficios"
            @update:model-value="$emit('update:beneficios', $event)"
            @change="$emit('recalcular')"
          />

          <!-- Impostos -->
          <FolhaFormImpostos 
            :model-value="impostos"
            :inss-calculado="resumo.inss_calculado"
            :irrf-calculado="resumo.irrf_calculado"
            @update:model-value="$emit('update:impostos', $event)"
            @change="$emit('recalcular')"
          />

          <!-- Itens Personalizados -->
          <FolhaItensPersonalizados 
            :model-value="itensPersonalizados"
            @update:model-value="$emit('update:itensPersonalizados', $event)"
            @change="$emit('recalcular')"
          />
        </div>

        <!-- Coluna Direita: Resumo em Tempo Real (1/3) -->
        <div class="lg:col-span-1">
          <FolhaResumoTempoReal :resumo="resumo" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UIButton theme="admin" variant="secondary" @click="$emit('fechar')">
          Cancelar
        </UIButton>
        <UIButton theme="admin" variant="primary" @click="$emit('salvar')">
          Salvar Alterações
        </UIButton>
      </div>
    </template>
  </UIModal>
</template>

<script setup lang="ts">
interface Dados {
  nome: string
  cpf: string
  cargo: string
  salario_base: number
  dependentes: number
  horas_contratadas: number
}

interface Proventos {
  horas_extras_50: number
  horas_extras_100: number
  bonus: number
  comissoes: number
  adicional_insalubridade: number
  adicional_periculosidade: number
  adicional_noturno: number
  outros_proventos: number
}

interface Descontos {
  adiantamento: number
  emprestimos: number
  faltas_horas: number
  atrasos_horas: number
  outros_descontos: number
}

interface Beneficios {
  vale_transporte: number
  vale_refeicao: number
  vale_alimentacao: number
  plano_saude: number
  plano_odontologico: number
  seguro_vida: number
  auxilio_creche: number
  auxilio_educacao: number
  auxilio_combustivel: number
  outros_beneficios: number
}

interface Impostos {
  inss_manual: number | null
  irrf_manual: number | null
}

interface ItemPersonalizado {
  tipo: 'provento' | 'desconto'
  codigo: string
  descricao: string
  referencia: string
  valor: number
}

interface Resumo {
  salario_base: number
  total_proventos: number
  salario_bruto: number
  inss: number
  irrf: number
  outros_descontos: number
  total_descontos: number
  salario_liquido: number
  fgts: number
  total_beneficios: number
  inss_calculado: number
  irrf_calculado: number
}

defineProps<{
  aberto: boolean
  dados: Dados | null
  proventos: Proventos
  descontos: Descontos
  beneficios: Beneficios
  impostos: Impostos
  itensPersonalizados: ItemPersonalizado[]
  resumo: Resumo
  nomeMes: string
  ano: string
}>()

defineEmits<{
  'update:aberto': [value: boolean]
  'update:proventos': [value: Proventos]
  'update:descontos': [value: Descontos]
  'update:beneficios': [value: Beneficios]
  'update:impostos': [value: Impostos]
  'update:itensPersonalizados': [value: ItemPersonalizado[]]
  recalcular: []
  fechar: []
  salvar: []
}>()
</script>
