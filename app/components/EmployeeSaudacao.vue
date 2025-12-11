<template>
  <div class="mb-4 sm:mb-6 lg:mb-8">
    <h2 class="text-xl sm:text-2xl font-bold text-slate-800">
      Olá, {{ primeiroNome || 'Colaborador' }}!
    </h2>
    <p class="text-sm sm:text-base text-slate-600 mt-0.5 sm:mt-1">
      {{ cargo || 'Colaborador' }}
      <span v-if="departamento" class="hidden sm:inline"> • {{ departamento }}</span>
    </p>
    <p v-if="departamento" class="text-xs text-slate-500 mt-0.5 sm:hidden">
      {{ departamento }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  nome?: string
  cargo?: string
  departamento?: string
}

const props = defineProps<Props>()

// Pegar apenas o primeiro nome para mobile
const primeiroNome = computed(() => {
  if (!props.nome) return 'Colaborador'
  return props.nome.split(' ')[0]
})
</script>
