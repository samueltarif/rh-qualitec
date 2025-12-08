<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Locais de Ponto</h1>
        <p class="text-gray-600 mt-1">Configure os locais permitidos para registro de ponto</p>
      </div>
      <button
        @click="abrirModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Novo Local
      </button>
    </div>

    <!-- Lista de locais -->
    <div class="grid gap-4">
      <div
        v-for="local in locais"
        :key="local.id"
        class="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-semibold text-gray-900">{{ local.nome }}</h3>
              <span
                v-if="local.ativo"
                class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded"
              >
                Ativo
              </span>
              <span
                v-else
                class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
              >
                Inativo
              </span>
            </div>
            <p v-if="local.descricao" class="text-gray-600 mt-2">{{ local.descricao }}</p>
            
            <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Latitude:</span>
                <span class="ml-2 font-mono text-gray-900">{{ local.latitude }}</span>
              </div>
              <div>
                <span class="text-gray-500">Longitude:</span>
                <span class="ml-2 font-mono text-gray-900">{{ local.longitude }}</span>
              </div>
              <div>
                <span class="text-gray-500">Raio permitido:</span>
                <span class="ml-2 font-semibold text-blue-600">{{ local.raio_metros }}m</span>
              </div>
            </div>
          </div>
          
          <div class="flex gap-2">
            <button
              @click="abrirModal(local)"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Editar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="excluirLocal(local.id)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              title="Excluir"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="modalAberto"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="fecharModal"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 class="text-xl font-bold mb-4">
          {{ localEditando ? 'Editar Local' : 'Novo Local' }}
        </h2>
        
        <form @submit.prevent="salvarLocal" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              v-model="form.nome"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              v-model="form.descricao"
              rows="2"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                v-model.number="form.latitude"
                type="number"
                step="0.00000001"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                v-model.number="form.longitude"
                type="number"
                step="0.00000001"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Raio permitido (metros)</label>
            <input
              v-model.number="form.raio_metros"
              type="number"
              min="10"
              max="5000"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-sm text-gray-500 mt-1">Distância máxima permitida para bater ponto</p>
          </div>
          
          <div class="flex items-center">
            <input
              v-model="form.ativo"
              type="checkbox"
              id="ativo"
              class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label for="ativo" class="ml-2 text-sm text-gray-700">Local ativo</label>
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="fecharModal"
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const locais = ref<any[]>([])
const modalAberto = ref(false)
const localEditando = ref<any>(null)
const form = ref({
  nome: '',
  descricao: '',
  latitude: 0,
  longitude: 0,
  raio_metros: 100,
  ativo: true
})

const carregarLocais = async () => {
  const { data } = await useFetch('/api/locais-ponto')
  if (data.value) {
    locais.value = data.value
  }
}

const abrirModal = (local?: any) => {
  if (local) {
    localEditando.value = local
    form.value = { ...local }
  } else {
    localEditando.value = null
    form.value = {
      nome: '',
      descricao: '',
      latitude: 0,
      longitude: 0,
      raio_metros: 100,
      ativo: true
    }
  }
  modalAberto.value = true
}

const fecharModal = () => {
  modalAberto.value = false
  localEditando.value = null
}

const salvarLocal = async () => {
  try {
    const endpoint = localEditando.value
      ? `/api/locais-ponto/${localEditando.value.id}`
      : '/api/locais-ponto'
    
    const method = localEditando.value ? 'PUT' : 'POST'
    
    await useFetch(endpoint, {
      method,
      body: form.value
    })
    
    await carregarLocais()
    fecharModal()
  } catch (error) {
    console.error('Erro ao salvar local:', error)
  }
}

const excluirLocal = async (id: string) => {
  if (!confirm('Deseja realmente excluir este local?')) return
  
  try {
    await useFetch(`/api/locais-ponto/${id}`, {
      method: 'DELETE'
    })
    
    await carregarLocais()
  } catch (error) {
    console.error('Erro ao excluir local:', error)
  }
}

onMounted(() => {
  carregarLocais()
})
</script>
