<template>
  <div class="mb-8">
    <h2 class="text-2xl font-bold text-slate-800">
      Olá, {{ nome || 'Colaborador' }}!
    </h2>
    <p class="text-slate-600 mt-1">
      {{ cargo || 'Colaborador' }}
      <span v-if="departamento"> • {{ departamento }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  nome?: string
  cargo?: string
  departamento?: string
}

defineProps<Props>()
</script>
