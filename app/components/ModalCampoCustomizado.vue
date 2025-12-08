<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800">
          {{ campo ? 'Editar Campo' : 'Novo Campo Customizado' }}
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <Icon name="heroicons:x-mark" size="24" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="salvar" class="p-6 space-y-4">
        <!-- Entidade e Nome -->
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Entidade *</label>
            <UISelect v-model="form.entidade" required :disabled="!!campo">
              <option value="">Selecione</option>
              <option value="colaborador">Colaborador</option>
              <option value="empresa">Empresa</option>
              <option value="documento">Documento</option>
            </UISelect>
            <p class="text-xs text-gray-500 mt-1">Onde o campo será usado</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Campo *</label>
            <UIInput v-model="form.nome" required :disabled="!!campo" placeholder="ex: nome_social" />
            <p class="text-xs text-gray-500 mt-1">Identificador único (sem espaços)</p>
          </div>
        </div>

        <!-- Label e Descrição -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rótulo *</label>
          <UIInput v-model="form.label" required placeholder="ex: Nome Social" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea 
            v-model="form.descricao" 
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Descrição do campo..."
          ></textarea>
        </div>

        <!-- Tipo e Grupo -->
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Campo *</label>
            <UISelect v-model="form.tipo_campo" required>
              <option value="">Selecione</option>
              <option value="texto">Texto</option>
              <option value="textarea">Texto Longo</option>
              <option value="numero">Número</option>
              <option value="data">Data</option>
              <option value="email">E-mail</option>
              <option value="telefone">Telefone</option>
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="select">Seleção (Dropdown)</option>
              <option value="checkbox">Checkbox</option>
            </UISelect>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
            <UIInput v-model="form.grupo" placeholder="ex: Dados Pessoais" />
            <p class="text-xs text-gray-500 mt-1">Para organizar campos</p>
          </div>
        </div>

        <!-- Opções (para select) -->
        <div v-if="form.tipo_campo === 'select'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Opções *</label>
          <textarea 
            v-model="opcoesTexto" 
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Uma opção por linha&#10;Opção 1&#10;Opção 2&#10;Opção 3"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">Digite uma opção por linha</p>
        </div>

        <!-- Validação -->
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor Padrão</label>
            <UIInput v-model="form.valor_padrao" placeholder="Valor inicial" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Máscara</label>
            <UIInput v-model="form.mascara" placeholder="ex: 000.000.000-00" />
          </div>
        </div>

        <!-- Ordem -->
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ordem de Exibição</label>
            <UIInput v-model.number="form.ordem" type="number" min="0" />
          </div>
        </div>

        <!-- Checkboxes -->
        <div class="space-y-2">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.obrigatorio" class="rounded text-red-600 focus:ring-red-500">
            <span class="text-sm text-gray-700">Campo obrigatório</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.visivel" class="rounded text-red-600 focus:ring-red-500">
            <span class="text-sm text-gray-700">Visível</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.editavel" class="rounded text-red-600 focus:ring-red-500">
            <span class="text-sm text-gray-700">Editável</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.ativo" class="rounded text-red-600 focus:ring-red-500">
            <span class="text-sm text-gray-700">Ativo</span>
          </label>
        </div>

        <!-- Botões -->
        <div class="flex gap-4 pt-4">
          <UIButton type="button" @click="$emit('close')" theme="admin" variant="secondary" full-width>
            Cancelar
          </UIButton>
          <UIButton type="submit" theme="admin" variant="primary" full-width :disabled="saving">
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  campo?: any
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const saving = ref(false)
const opcoesTexto = ref('')

const form = ref({
  id: '',
  nome: '',
  label: '',
  descricao: '',
  entidade: 'colaborador',
  tipo_campo: 'texto',
  opcoes: null,
  obrigatorio: false,
  valor_padrao: '',
  mascara: '',
  ordem: 0,
  grupo: '',
  visivel: true,
  editavel: true,
  ativo: true,
})

// Carregar dados do campo
onMounted(() => {
  if (props.campo) {
    form.value = { ...form.value, ...props.campo }
    
    // Converter opções JSON para texto
    if (props.campo.opcoes && Array.isArray(props.campo.opcoes)) {
      opcoesTexto.value = props.campo.opcoes.join('\n')
    }
  }
})

// Salvar
const salvar = async () => {
  // Validar nome do campo (sem espaços, apenas letras, números e underscore)
  if (!/^[a-z0-9_]+$/.test(form.value.nome)) {
    alert('Nome do campo inválido. Use apenas letras minúsculas, números e underscore (_)')
    return
  }

  // Converter opções de texto para array
  if (form.value.tipo_campo === 'select' && opcoesTexto.value) {
    form.value.opcoes = opcoesTexto.value
      .split('\n')
      .map(o => o.trim())
      .filter(o => o.length > 0)
    
    if (form.value.opcoes.length === 0) {
      alert('Adicione pelo menos uma opção para campos de seleção')
      return
    }
  }

  saving.value = true
  try {
    if (props.campo) {
      // Atualizar
      await $fetch(`/api/campos-customizados/${props.campo.id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      // Criar
      await $fetch('/api/campos-customizados', {
        method: 'POST',
        body: form.value
      })
    }

    alert('✅ Campo salvo com sucesso!')
    emit('saved')
    emit('close')
  } catch (error: any) {
    console.error('Erro ao salvar:', error)
    alert(`Erro ao salvar: ${error.data?.message || error.message || 'Erro desconhecido'}`)
  } finally {
    saving.value = false
  }
}
</script>
