<template>
  <div class="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <Icon name="heroicons:bolt" class="text-yellow-400" size="24" />
      Ações Rápidas
    </h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <template v-for="acao in acoes" :key="acao.to">
        <!-- Card especial para Ponto -->
        <CardPonto 
          v-if="acao.to === '/ponto'"
          :registros-pendentes="pontoStats.pendentes"
          :ultimo-registro="pontoStats.ultimoRegistro"
        />
        <!-- Cards genéricos para outras ações -->
        <CardAcaoRapida 
          v-else
          :to="acao.to"
          :icon="acao.icon"
          :label="acao.label"
          :classes="acao.classes"
          :icon-class="acao.iconClass"
        />
      </template>
      <CardAlteracoesDados />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const acoes = [
  { to: '/colaboradores', icon: 'heroicons:user-group', label: 'Colaboradores', classes: 'bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30 hover:border-blue-400/50', iconClass: 'text-blue-400' },
  { to: '/departamentos', icon: 'heroicons:building-office', label: 'Departamentos', classes: 'bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border-cyan-500/30 hover:border-cyan-400/50', iconClass: 'text-cyan-400' },
  { to: '/cargos', icon: 'heroicons:briefcase', label: 'Cargos', classes: 'bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30 hover:border-purple-400/50', iconClass: 'text-purple-400' },
  { to: '/users', icon: 'heroicons:users', label: 'Usuários', classes: 'bg-gradient-to-br from-red-600/20 to-red-800/20 border-red-500/30 hover:border-red-400/50', iconClass: 'text-red-400' },
  { to: '/admin/solicitacoes', icon: 'heroicons:document-text', label: 'Solicitações', classes: 'bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30 hover:border-orange-400/50', iconClass: 'text-orange-400' },
  { to: '/ferias', icon: 'heroicons:sun', label: 'Férias', classes: 'bg-gradient-to-br from-amber-600/20 to-amber-800/20 border-amber-500/30 hover:border-amber-400/50', iconClass: 'text-amber-400' },
  { to: '/ponto', icon: 'heroicons:clock', label: 'Ponto', classes: 'bg-gradient-to-br from-pink-600/20 to-pink-800/20 border-pink-500/30 hover:border-pink-400/50', iconClass: 'text-pink-400' },
  { to: '/folha-pagamento', icon: 'heroicons:calculator', label: 'Folha Pagamento', classes: 'bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border-emerald-500/30 hover:border-emerald-400/50', iconClass: 'text-emerald-400' },
  { to: '/documentos-rh', icon: 'heroicons:folder-open', label: 'Documentos RH', classes: 'bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30 hover:border-green-400/50', iconClass: 'text-green-400' },
  { to: '/configuracoes', icon: 'heroicons:cog-6-tooth', label: 'Configurações', classes: 'bg-gradient-to-br from-gray-600/20 to-gray-800/20 border-gray-500/30 hover:border-gray-400/50', iconClass: 'text-gray-400' },
]

// Estado do ponto
const pontoStats = ref({
  pendentes: 0,
  ultimoRegistro: null as { tipo: 'entrada' | 'saida' | 'intervalo_inicio' | 'intervalo_fim', horario: string } | null
})

// Carrega estatísticas do ponto
const carregarPontoStats = async () => {
  try {
    const { data } = await useFetch('/api/ponto/stats')
    if (data.value) {
      pontoStats.value = data.value
    }
  } catch (error) {
    console.error('Erro ao carregar stats do ponto:', error)
  }
}

onMounted(() => {
  carregarPontoStats()
})
</script>
