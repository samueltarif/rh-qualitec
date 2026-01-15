<template>
  <div>
    <UiPageHeader title="Folha de Pagamento" description="Gere e gerencie os holerites dos funcionários">
      <UiButton size="lg" variant="success" icon="📄" @click="gerarFolha">
        Gerar Folha do Mês
      </UiButton>
    </UiPageHeader>

    <!-- Filtros -->
    <UiCard padding="p-6" class="mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <UiSelect v-model="mesAno" :options="mesesOptions" label="Mês/Ano" />
        </div>
        <div class="flex-1">
          <UiSelect v-model="filtroStatus" :options="statusOptions" label="Status" placeholder="Todos" />
        </div>
        <div class="flex items-end gap-2">
          <UiButton :disabled="selecionados.length === 0" icon="📧" @click="enviarSelecionados">
            Enviar Selecionados
          </UiButton>
        </div>
      </div>
    </UiCard>

    <!-- Resumo -->
    <FolhaResumo 
      v-if="holerites.length > 0"
      :total-bruto="totalBruto" 
      :total-i-n-s-s="totalINSS" 
      :total-i-r-r-f="totalIRRF" 
      :total-liquido="totalLiquido" 
    />

    <!-- Estado Vazio -->
    <UiEmptyState
      v-if="holerites.length === 0"
      icon="📄"
      title="Nenhum holerite gerado"
      description="Clique em 'Gerar Folha do Mês' para criar os holerites dos funcionários"
    />

    <!-- Lista de Holerites -->
    <UiCard v-if="holerites.length > 0" padding="p-0" class="overflow-hidden">
      <div class="p-4 border-b bg-gray-50 flex items-center gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            :checked="todosSelecionados"
            class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            @change="toggleTodos"
          />
          <span class="text-sm font-medium text-gray-600">Selecionar todos</span>
        </label>
        <span class="text-sm text-gray-500">{{ selecionados.length }} selecionado(s)</span>
      </div>

      <div class="divide-y divide-gray-100">
        <FolhaHoleriteItem 
          v-for="holerite in holeritesFiltrados" 
          :key="holerite.id"
          :holerite="holerite"
          :selected="selecionados.includes(holerite.id)"
          @toggle="toggleSelecionado"
          @edit="editarHolerite"
          @email="enviarEmail"
          @download="baixarPDF"
        />
      </div>
    </UiCard>

    <!-- Informações sobre Cálculos -->
    <UiCard class="mt-8" title="📊 Regras de Cálculo (Brasil 2026)">
      <template #header>
        <UiBadge variant="success">✓ Atualizadas</UiBadge>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-700">
        <div class="bg-blue-50 rounded-xl p-4">
          <h4 class="font-semibold mb-2">INSS (Tabela Progressiva)</h4>
          <ul class="text-sm space-y-1">
            <li>• Até R$ 1.518,00: 7,5%</li>
            <li>• De R$ 1.518,01 a R$ 2.793,88: 9%</li>
            <li>• De R$ 2.793,89 a R$ 4.190,83: 12%</li>
            <li>• De R$ 4.190,84 a R$ 8.157,41: 14%</li>
          </ul>
        </div>
        <div class="bg-blue-50 rounded-xl p-4">
          <h4 class="font-semibold mb-2">IRRF (Base = Bruto - INSS)</h4>
          <ul class="text-sm space-y-1">
            <li>• Até R$ 2.259,20: Isento</li>
            <li>• De R$ 2.259,21 a R$ 2.826,65: 7,5%</li>
            <li>• De R$ 2.826,66 a R$ 3.751,05: 15%</li>
            <li>• De R$ 3.751,06 a R$ 4.664,68: 22,5%</li>
            <li>• Acima de R$ 4.664,68: 27,5%</li>
          </ul>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const mesAno = ref('01/2026')
const filtroStatus = ref('')
const selecionados = ref<number[]>([])

const mesesOptions = [
  { value: '01/2026', label: 'Janeiro/2026' },
  { value: '12/2025', label: 'Dezembro/2025' },
  { value: '11/2025', label: 'Novembro/2025' }
]

const statusOptions = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Enviado', label: 'Enviado' },
  { value: 'Pago', label: 'Pago' }
]

const holerites = ref([
  // Dados serão carregados da API do Supabase quando gerar a folha
])

const holeritesFiltrados = computed(() => {
  if (!filtroStatus.value) return holerites.value
  return holerites.value.filter(h => h.status === filtroStatus.value)
})

// Calcular totais dinamicamente
const totalBruto = computed(() => 
  holerites.value.reduce((sum, h) => sum + h.bruto, 0)
)

const totalINSS = computed(() => 
  holerites.value.reduce((sum, h) => sum + (h.descontos * 0.4), 0) // Aproximação
)

const totalIRRF = computed(() => 
  holerites.value.reduce((sum, h) => sum + (h.descontos * 0.3), 0) // Aproximação
)

const totalLiquido = computed(() => 
  holerites.value.reduce((sum, h) => sum + h.liquido, 0)
)

const todosSelecionados = computed(() => 
  selecionados.value.length === holeritesFiltrados.value.length && holeritesFiltrados.value.length > 0
)

const toggleTodos = () => {
  selecionados.value = todosSelecionados.value ? [] : holeritesFiltrados.value.map(h => h.id)
}

const toggleSelecionado = (id: number) => {
  const index = selecionados.value.indexOf(id)
  if (index > -1) selecionados.value.splice(index, 1)
  else selecionados.value.push(id)
}

const gerarFolha = () => alert('Folha de pagamento gerada com sucesso!')
const enviarSelecionados = () => { alert(`${selecionados.value.length} holerite(s) enviado(s)!`); selecionados.value = [] }
const editarHolerite = (h: any) => alert(`Editar holerite de ${h.funcionario}`)
const enviarEmail = (h: any) => { alert(`Email enviado para ${h.funcionario}!`); h.status = 'Enviado' }
const baixarPDF = (h: any) => alert(`Download do PDF de ${h.funcionario}`)
</script>
