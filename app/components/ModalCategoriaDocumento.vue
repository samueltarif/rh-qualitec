<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="fechar">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">
          {{ categoria ? 'Editar Categoria' : 'Nova Categoria' }}
        </h2>
        <button 
          type="button"
          @click="fechar" 
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Icon name="heroicons:x-mark" size="20" class="text-gray-500" />
        </button>
      </div>

      <!-- Body -->
      <form @submit.prevent="salvar" class="flex-1 overflow-y-auto">
        <div class="px-6 py-6 space-y-5">
          <!-- Nome -->
          <div>
            <label for="nome" class="block text-sm font-medium text-gray-700 mb-1">
              Nome <span class="text-red-500">*</span>
            </label>
            <input
              id="nome"
              v-model="form.nome"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Ex: Admissão"
              required
              maxlength="100"
            >
          </div>

          <!-- Descrição -->
          <div>
            <label for="descricao" class="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="descricao"
              v-model="form.descricao"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="Breve descrição da categoria"
              maxlength="500"
            ></textarea>
          </div>

          <!-- Cor e Ícone -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Cor -->
            <div>
              <label for="cor" class="block text-sm font-medium text-gray-700 mb-1">
                Cor
              </label>
              <select
                id="cor"
                v-model="form.cor"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="blue">🔵 Azul</option>
                <option value="green">🟢 Verde</option>
                <option value="purple">🟣 Roxo</option>
                <option value="amber">🟡 Âmbar</option>
                <option value="red">🔴 Vermelho</option>
                <option value="indigo">🔵 Índigo</option>
                <option value="cyan">🔵 Ciano</option>
                <option value="pink">🩷 Rosa</option>
                <option value="emerald">💚 Esmeralda</option>
                <option value="orange">🟠 Laranja</option>
                <option value="slate">⚫ Cinza</option>
                <option value="teal">🩵 Verde-azulado</option>
              </select>
            </div>

            <!-- Ícone -->
            <div>
              <label for="icone" class="block text-sm font-medium text-gray-700 mb-1">
                Ícone
              </label>
              <select
                id="icone"
                v-model="form.icone"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="heroicons:document-text">📄 Documento</option>
                <option value="heroicons:user-plus">👤 Usuário +</option>
                <option value="heroicons:identification">🪪 ID</option>
                <option value="heroicons:heart">❤️ Coração</option>
                <option value="heroicons:briefcase">💼 Maleta</option>
                <option value="heroicons:sun">☀️ Sol</option>
                <option value="heroicons:clock">🕐 Relógio</option>
                <option value="heroicons:exclamation-triangle">⚠️ Alerta</option>
                <option value="heroicons:gift">🎁 Presente</option>
                <option value="heroicons:academic-cap">🎓 Formatura</option>
                <option value="heroicons:folder">📁 Pasta</option>
              </select>
            </div>
          </div>

          <!-- Ordem e Ativo -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Ordem -->
            <div>
              <label for="ordem" class="block text-sm font-medium text-gray-700 mb-1">
                Ordem de Exibição
              </label>
              <input
                id="ordem"
                v-model.number="form.ordem"
                type="number"
                min="0"
                max="999"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
              >
              <p class="text-xs text-gray-500 mt-1">Menor número aparece primeiro</p>
            </div>

            <!-- Ativo -->
            <div class="flex items-center pt-6">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  id="ativo"
                  v-model="form.ativo"
                  type="checkbox"
                  class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                >
                <span class="text-sm font-medium text-gray-700">Categoria ativa</span>
              </label>
            </div>
          </div>

          <!-- Preview -->
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p class="text-xs font-medium text-gray-500 mb-2">Preview:</p>
            <div class="flex items-center gap-3">
              <div 
                class="w-12 h-12 rounded-lg flex items-center justify-center"
                :style="{ backgroundColor: getCorFundo(form.cor) }"
              >
                <Icon :name="form.icone" :style="{ color: getCorIcone(form.cor) }" size="24" />
              </div>
              <div>
                <p class="font-semibold text-gray-800">{{ form.nome || 'Nome da categoria' }}</p>
                <p class="text-sm text-gray-600">{{ form.descricao || 'Descrição da categoria' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            @click="fechar"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 transition-colors"
            :disabled="!form.nome.trim()"
          >
            {{ categoria ? 'Salvar Alterações' : 'Criar Categoria' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CategoriaDocumento {
  id?: string
  nome: string
  descricao: string
  cor: string
  icone: string
  ordem: number
  ativo: boolean
}

interface Props {
  categoria?: CategoriaDocumento | null
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: Omit<CategoriaDocumento, 'id'>): void
}

const props = withDefaults(defineProps<Props>(), {
  categoria: null
})

const emit = defineEmits<Emits>()

// Mapa de cores
const coresMap: Record<string, { fundo: string, icone: string }> = {
  blue: { fundo: '#DBEAFE', icone: '#2563EB' },
  green: { fundo: '#D1FAE5', icone: '#059669' },
  purple: { fundo: '#E9D5FF', icone: '#9333EA' },
  amber: { fundo: '#FEF3C7', icone: '#D97706' },
  red: { fundo: '#FEE2E2', icone: '#DC2626' },
  indigo: { fundo: '#E0E7FF', icone: '#4F46E5' },
  cyan: { fundo: '#CFFAFE', icone: '#0891B2' },
  pink: { fundo: '#FCE7F3', icone: '#DB2777' },
  emerald: { fundo: '#D1FAE5', icone: '#10B981' },
  orange: { fundo: '#FFEDD5', icone: '#EA580C' },
  slate: { fundo: '#F1F5F9', icone: '#475569' },
  teal: { fundo: '#CCFBF1', icone: '#0D9488' },
}

const getCorFundo = (cor: string): string => coresMap[cor]?.fundo || coresMap.blue.fundo
const getCorIcone = (cor: string): string => coresMap[cor]?.icone || coresMap.blue.icone

// Form state
const form = reactive<Omit<CategoriaDocumento, 'id'>>({
  nome: props.categoria?.nome || '',
  descricao: props.categoria?.descricao || '',
  cor: props.categoria?.cor || 'blue',
  icone: props.categoria?.icone || 'heroicons:document-text',
  ordem: props.categoria?.ordem ?? 0,
  ativo: props.categoria?.ativo ?? true,
})

// Métodos
const fechar = () => {
  emit('close')
}

const salvar = () => {
  // Validação
  if (!form.nome.trim()) {
    alert('O nome da categoria é obrigatório')
    return
  }

  // Emitir dados
  emit('save', {
    nome: form.nome.trim(),
    descricao: form.descricao.trim(),
    cor: form.cor,
    icone: form.icone,
    ordem: form.ordem,
    ativo: form.ativo,
  })
}

// Fechar com ESC
onMounted(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') fechar()
  }
  window.addEventListener('keydown', handleEsc)
  onUnmounted(() => window.removeEventListener('keydown', handleEsc))
})
</script>
