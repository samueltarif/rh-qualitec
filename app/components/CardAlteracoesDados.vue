<template>
  <div>
    <button 
      @click="showModal = true"
      class="w-full text-left p-4 rounded-xl border transition-all group relative cursor-pointer bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-500/30 hover:border-yellow-400/50"
    >
      <!-- Badge de notificação -->
      <span 
        v-if="pendentes > 0" 
        class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse"
      >
        {{ pendentes > 99 ? '99+' : pendentes }}
      </span>
      <Icon name="heroicons:banknotes" class="text-yellow-400 mb-2 group-hover:scale-110 transition-transform" size="28" />
      <p class="text-white font-medium">Alterações Dados</p>
    </button>

    <ModalAlteracoesDados v-model="showModal" @close="handleModalClose" />
  </div>
</template>

<script setup lang="ts">
const pendentes = ref(0)
const showModal = ref(false)

const fetchStats = async () => {
  try {
    const data = await $fetch<{ pendentes: number }>('/api/admin/alteracoes-dados/stats')
    pendentes.value = data.pendentes || 0
  } catch (e) {
    console.error('Erro ao buscar stats de alterações:', e)
  }
}

const handleModalClose = () => {
  fetchStats()
}

onMounted(fetchStats)
</script>
