<template>
  <!-- Overlay escuro -->
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <!-- Modal centralizado -->
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header com botão fechar -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900">
          {{ template ? 'Editar Template' : 'Novo Template' }}
        </h2>
        <button 
          @click="$emit('close')" 
          class="text-gray-400 hover:text-gray-600 transition-colors"
          type="button"
        >
          <Icon name="mdi:close" size="28" />
        </button>
      </div>

      <!-- Corpo do modal com scroll -->
      <form @submit.prevent="salvar" class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- Aviso para templates do sistema -->
        <div v-if="template?.sistema" class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Icon name="mdi:information" class="text-blue-600 flex-shrink-0 mt-0.5" size="20" />
          <div class="text-sm text-blue-800">
            <strong>Template do Sistema:</strong> O código e categoria não podem ser alterados. Você pode editar o conteúdo, assunto e outras configurações.
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Código *
            </label>
            <input
              v-model="form.codigo"
              type="text"
              required
              :disabled="template?.sistema"
              placeholder="bem_vindo"
              class="input"
            />
            <p class="text-xs text-gray-500 mt-1">
              Identificador único (sem espaços)
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nome *
            </label>
            <input
              v-model="form.nome"
              type="text"
              required
              placeholder="Boas-vindas"
              class="input"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            v-model="form.descricao"
            rows="2"
            placeholder="Descrição do template"
            class="input"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select v-model="form.categoria" required class="input">
              <option value="">Selecione...</option>
              <option value="sistema">Sistema</option>
              <option value="rh">RH</option>
              <option value="folha">Folha de Pagamento</option>
              <option value="ferias">Férias</option>
              <option value="ponto">Ponto</option>
              <option value="documentos">Documentos</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <select v-model="form.prioridade" class="input">
              <option value="baixa">Baixa</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Assunto *
          </label>
          <input
            v-model="form.assunto"
            type="text"
            required
            placeholder="Bem-vindo à {{nome_empresa}}!"
            class="input"
          />
          <p class="text-xs text-gray-500 mt-1">
            Use {{variavel}} para inserir dados dinâmicos
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Corpo HTML *
          </label>
          <textarea
            v-model="form.corpo_html"
            rows="8"
            required
            placeholder="<h2>Olá {{nome_colaborador}}!</h2><p>Conteúdo do e-mail...</p>"
            class="input font-mono text-sm"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Corpo Texto (opcional)
          </label>
          <textarea
            v-model="form.corpo_texto"
            rows="4"
            placeholder="Versão em texto puro do e-mail"
            class="input"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Variáveis Disponíveis
          </label>
          <div class="space-y-2">
            <div
              v-for="(variavel, index) in form.variaveis_disponiveis"
              :key="index"
              class="flex gap-2"
            >
              <input
                v-model="variavel.nome"
                type="text"
                placeholder="nome_variavel"
                class="input flex-1"
              />
              <input
                v-model="variavel.descricao"
                type="text"
                placeholder="Descrição"
                class="input flex-1"
              />
              <button
                type="button"
                @click="removerVariavel(index)"
                class="btn-icon text-red-600"
              >
                <Icon name="mdi:delete" />
              </button>
            </div>
            <button
              type="button"
              @click="adicionarVariavel"
              class="btn-secondary text-sm"
            >
              <Icon name="mdi:plus" class="mr-1" />
              Adicionar Variável
            </button>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center">
            <input
              v-model="form.ativo"
              type="checkbox"
              id="template_ativo"
              class="checkbox"
            />
            <label for="template_ativo" class="ml-2 text-sm text-gray-700">
              Ativo
            </label>
          </div>

          <div class="flex items-center">
            <input
              v-model="form.requer_confirmacao_leitura"
              type="checkbox"
              id="confirmacao_leitura"
              class="checkbox"
            />
            <label for="confirmacao_leitura" class="ml-2 text-sm text-gray-700">
              Requer confirmação de leitura
            </label>
          </div>
        </div>

        <!-- Footer fixo -->
        <div class="flex items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button 
            type="button" 
            @click="voltarConfiguracoes" 
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
  template?: any
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const salvando = ref(false)

const form = ref({
  codigo: '',
  nome: '',
  descricao: '',
  categoria: '',
  assunto: '',
  corpo_html: '',
  corpo_texto: '',
  prioridade: 'normal',
  variaveis_disponiveis: [] as Array<{ nome: string; descricao: string }>,
  ativo: true,
  requer_confirmacao_leitura: false
})

onMounted(() => {
  if (props.template) {
    form.value = {
      ...form.value,
      ...props.template,
      variaveis_disponiveis: props.template.variaveis_disponiveis || []
    }
  }
})

function adicionarVariavel() {
  form.value.variaveis_disponiveis.push({ nome: '', descricao: '' })
}

function removerVariavel(index: number) {
  form.value.variaveis_disponiveis.splice(index, 1)
}

function voltarConfiguracoes() {
  navigateTo('/configuracoes')
}

async function salvar() {
  salvando.value = true
  try {
    if (props.template) {
      await $fetch(`/api/email/templates/${props.template.id}`, {
        method: 'PUT',
        body: form.value
      })
      alert('Template atualizado com sucesso!')
    } else {
      await $fetch('/api/email/templates', {
        method: 'POST',
        body: form.value
      })
      alert('Template criado com sucesso!')
    }
    emit('saved')
    emit('close')
  } catch (error: any) {
    console.error('Erro ao salvar template:', error)
    const mensagem = error?.data?.message || error?.message || 'Erro ao salvar template'
    alert(`Erro: ${mensagem}`)
  } finally {
    salvando.value = false
  }
}
</script>
