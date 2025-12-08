<template>
  <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
    <EmployeeStatCard
      icon="heroicons:clock"
      label="Banco de Horas"
      :value="stats?.banco_horas || '00:00'"
      color="blue"
    />
    <EmployeeStatCard
      icon="heroicons:sun"
      label="Dias de Férias"
      :value="stats?.dias_ferias || 0"
      color="amber"
    />
    <EmployeeStatCard
      icon="heroicons:document-text"
      label="Solicitações"
      :value="stats?.solicitacoes_pendentes || 0"
      color="purple"
    />
    <EmployeeStatCard
      icon="heroicons:folder-open"
      label="Docs Novos"
      :value="stats?.documentos_novos || 0"
      color="green"
    />
    <EmployeeStatCard
      icon="heroicons:bell"
      label="Comunicados"
      :value="stats?.comunicados_nao_lidos || 0"
      color="red"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  stats?: {
    banco_horas?: string
    dias_ferias?: number
    solicitacoes_pendentes?: number
    documentos_novos?: number
    comunicados_nao_lidos?: number
  }
}

defineProps<Props>()
</script>
