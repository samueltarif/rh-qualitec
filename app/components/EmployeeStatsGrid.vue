<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
    <EmployeeStatCard
      icon="heroicons:clock"
      label="Banco de Horas"
      short-label="Banco"
      :value="stats?.banco_horas || '00:00'"
      color="blue"
    />
    <EmployeeStatCard
      icon="heroicons:sun"
      label="Dias de Férias"
      short-label="Férias"
      :value="stats?.dias_ferias || 0"
      color="amber"
    />
    <EmployeeStatCard
      icon="heroicons:document-text"
      label="Solicitações"
      short-label="Solic."
      :value="stats?.solicitacoes_pendentes || 0"
      color="purple"
    />
    <EmployeeStatCard
      icon="heroicons:folder-open"
      label="Docs Novos"
      short-label="Docs"
      :value="stats?.documentos_novos || 0"
      color="green"
    />
    <EmployeeStatCard
      icon="heroicons:bell"
      label="Comunicados"
      short-label="Avisos"
      :value="stats?.comunicados_nao_lidos || 0"
      color="red"
      class="col-span-2 sm:col-span-1"
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
