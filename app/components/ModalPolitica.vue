<template>
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900">
          {{ politica ? 'Editar Política' : 'Nova Política' }}
        </h2>
        <button 
          @click="$emit('close')" 
          class="text-gray-400 hover:text-gray-600 transition-colors"
          type="button"
        >
          <Icon name="mdi:close" size="28" />
        </button>
      </div>

      <form @submit.prevent="salvar" class="flex-1 overflow-y-auto p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Código *
            </label>
            <input
              v-model="form.codigo"
              type="text"
              required
              placeholder="LGPD_001"
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tipo *
            </label>
            <select v-model="form.tipo" required class="input">
              <option value="">Selecione...</option>
              <option value="lgpd">LGPD</option>
              <option value="termo_uso">Termo de Uso</option>
              <option value="politica_interna">Política Interna</option>
              <option value="codigo_conduta">Código de Conduta</option>
              <option value="regulamento">Regulamento</option>
              <option value="outro">Outro</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            v-model="form.titulo"
            type="text"
            required
            placeholder="Política de Privacidade e Proteção de Dados"
            class="input"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            v-model="form.descricao"
            rows="2"
            placeholder="Breve descrição da política"
            class="input"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select v-model="form.categoria" class="input">
              <option value="">Selecione...</option>
              <option value="privacidade">Privacidade</option>
              <option value="seguranca">Segurança</option>
              <option value="rh">RH</option>
              <option value="ti">TI</option>
              <option value="financeiro">Financeiro</option>
              <option value="operacional">Operacional</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Versão *
            </label>
            <input
              v-model="form.versao"
              type="text"
              required
              placeholder="1.0"
              class="input"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Data de Vigência *
            </label>
            <input
              v-model="form.data_vigencia"
              type="date"
              required
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Data de Expiração
            </label>
            <input
              v-model="form.data_expiracao"
              type="date"
              class="input"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Conteúdo HTML *
          </label>
          <textarea
            v-model="form.conteudo_html"
            rows="10"
            required
            placeholder="<h2>Título</h2><p>Conteúdo da política...</p>"
            class="input font-mono text-sm"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Resumo
          </label>
          <textarea
            v-model="form.resumo"
            rows="3"
            placeholder="Resumo executivo da política"
            class="input"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select v-model="form.status" class="input">
              <option value="rascunho">Rascunho</option>
              <option value="em_revisao">Em Revisão</option>
              <option value="aprovado">Aprovado</option>
              <option value="publicado">Publicado</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Prazo para Aceite (dias)
            </label>
            <input
              v-model.number="form.prazo_aceite_dias"
              type="number"
              min="1"
              placeholder="30"
              class="input"
            />
          </div>
        </div>

        <div class="flex items-center gap-6">
          <div class="flex items-center">
            <input
              v-model="form.publicado"
              type="checkbox"
              id="publicado"
              class="checkbox"
            />
            <label for="publicado" class="ml-2 text-sm text-gray-700">
              Publicado
            </label>
          </div>

          <div class="flex items-center">
            <input
              v-model="form.obrigatorio_aceite"
              type="checkbox"
              id="obrigatorio"
              class="checkbox"
            />
            <label for="obrigatorio" class="ml-2 text-sm text-gray-700">
              Obrigatório Aceite
            </label>
          </div>

          <div class="flex items-center">
            <input
              v-model="form.aplica_todos_colaboradores"
              type="checkbox"
              id="todos"
              class="checkbox"
            />
            <label for="todos" class="ml-2 text-sm text-gray-700">
              Aplica a Todos
            </label>
          </div>
        </div>

        <div class="flex items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button 
            type="button" 
            @click="navigateTo('/configuracoes')" 
            class="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Icon name="mdi:arrow-left" size="20" />
            Voltar para Configurações
          </button>
          
          <div class="flex gap-3">
            <button 
              type="button" 
              @click="$emit('close')" 
              class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              :disabled="salvando"
            >
              <Icon name="mdi:content-save" size="20" />
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  politica?: any
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const salvando = ref(false)

const form = ref({
  codigo: '',
  titulo: '',
  descricao: '',
  tipo: '',
  categoria: '',
  conteudo_html: '',
  conteudo_texto: '',
  resumo: '',
  versao: '1.0',
  data_vigencia: new Date().toISOString().split('T')[0],
  data_expiracao: null,
  status: 'rascunho',
  publicado: false,
  obrigatorio_aceite: false,
  aplica_todos_colaboradores: true,
  prazo_aceite_dias: 30,
  empresa_id: '00000000-0000-0000-0000-000000000000' // Será substituído
})

onMounted(() => {
  if (props.politica) {
    form.value = {
      ...form.value,
      ...props.politica
    }
  }
})

async function salvar() {
  salvando.value = true
  try {
    if (props.politica) {
      await $fetch(`/api/politicas/${props.politica.id}`, {
        method: 'PUT',
        body: form.value
      })
      alert('Política atualizada com sucesso!')
    } else {
      await $fetch('/api/politicas', {
        method: 'POST',
        body: form.value
      })
      alert('Política criada com sucesso!')
    }
    emit('saved')
    emit('close')
  } catch (error: any) {
    console.error('Erro ao salvar política:', error)
    const mensagem = error?.data?.message || error?.message || 'Erro ao salvar política'
    alert(`Erro: ${mensagem}`)
  } finally {
    salvando.value = false
  }
}
</script>
