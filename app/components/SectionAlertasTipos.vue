<template>
  <div>
    <p class="text-gray-600 mb-6">Tipos de alertas disponíveis no sistema, organizados por categoria.</p>
    
    <div class="space-y-6">
      <div v-for="(tipos, categoria) in tiposPorCategoria" :key="categoria" class="card">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ nomeCategoria(categoria as string) }}</h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div 
            v-for="tipo in tipos" 
            :key="tipo.id"
            class="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
          >
            <div 
              class="w-8 h-8 rounded flex items-center justify-center"
              :class="`bg-${tipo.cor}-100`"
            >
              <Icon :name="tipo.icone" :class="`text-${tipo.cor}-600`" size="18" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-800 text-sm">{{ tipo.nome }}</p>
              <p class="text-xs text-gray-500 truncate">{{ tipo.descricao }}</p>
            </div>
            <span 
              class="px-2 py-0.5 rounded text-xs"
              :class="corPrioridade(tipo.prioridade)"
            >
              {{ tipo.prioridade }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  tiposAlertas: any[]
}>()

const tiposPorCategoria = computed(() => {
  const grupos: Record<string, any[]> = {}
  for (const tipo of props.tiposAlertas) {
    if (!grupos[tipo.categoria]) {
      grupos[tipo.categoria] = []
    }
    grupos[tipo.categoria].push(tipo)
  }
  return grupos
})

const nomeCategoria = (cat: string) => {
  const nomes: Record<string, string> = {
    documentos: 'Documentos',
    ferias: 'Férias',
    contratos: 'Contratos',
    saude: 'Saúde/Exames',
    ponto: 'Ponto',
    pessoal: 'Pessoal',
    afastamentos: 'Afastamentos',
    treinamentos: 'Treinamentos',
    folha: 'Folha de Pagamento',
    sistema: 'Sistema',
  }
  return nomes[cat] || cat
}

const corPrioridade = (prioridade: string) => {
  const cores: Record<string, string> = {
    critica: 'bg-red-100 text-red-700',
    alta: 'bg-orange-100 text-orange-700',
    media: 'bg-amber-100 text-amber-700',
    baixa: 'bg-blue-100 text-blue-700',
  }
  return cores[prioridade] || cores.media
}
</script>
