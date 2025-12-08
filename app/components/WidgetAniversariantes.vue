<template>
  <div class="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-2xl">{{ emoji }}</span>
      <h3 class="text-lg font-semibold text-white">Aniversariantes de {{ capitalize(mesNome) }}</h3>
    </div>
    <div v-if="aniversariantes?.length" class="space-y-3">
      <div v-for="aniv in aniversariantes.slice(0, 5)" :key="aniv.id" class="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" :class="badgeClass">{{ aniv.dia }}</div>
          <span class="text-gray-200">{{ aniv.nome }}</span>
        </div>
        <span class="text-gray-500 text-sm">dia {{ aniv.dia }}</span>
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-500">
      <Icon name="heroicons:cake" class="mx-auto mb-2 opacity-50" size="32" />
      <p>Nenhum aniversariante {{ tipo === 'atual' ? 'este' : 'no próximo' }} mês</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  aniversariantes: { id: string; nome: string; dia: number }[]
  mesNome: string
  tipo: 'atual' | 'proximo'
}>()

const emoji = computed(() => props.tipo === 'atual' ? '🎂' : '📅')
const badgeClass = computed(() => props.tipo === 'atual' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400')
const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
</script>
