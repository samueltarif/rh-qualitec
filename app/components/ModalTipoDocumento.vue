<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 flex items-center justify-center" @click.self="fechar">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" @click.stop>
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-800">{{ tipo ? 'Editar Tipo de Documento' : 'Novo Tipo de Documento' }}</h2>
          <button type="button" @click="fechar" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <Icon name="heroicons:x-mark" size="20" class="text-gray-500" />
          </button>
        </div>

        <form @submit.prevent="salvar" class="flex-1 overflow-y-auto">
          <div class="px-6 py-6 space-y-6">
            <FormTipoDocumentoBasico :form="form" :categorias="categorias" :erros="erros" />
            <FormTipoDocumentoCampos :form="form" />
            <FormTipoDocumentoValidade :form="form" :erros="erros" />

            <section class="space-y-4">
              <h3 class="font-semibold text-gray-700 border-b pb-2">Configurações Gerais</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ordem de Exibição</label>
                  <input v-model.number="form.ordem" type="number" min="0" max="999" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" placeholder="0" />
                  <p class="text-xs text-gray-500 mt-1">Menor número aparece primeiro</p>
                </div>
                <div class="flex items-center pt-6">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input v-model="form.ativo" type="checkbox" class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                    <span class="text-sm font-medium text-gray-700">Tipo ativo</span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          <div class="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p v-if="temErros" class="text-sm text-red-600">Corrija os erros antes de salvar</p>
            <div class="flex items-center gap-3 ml-auto">
              <button type="button" @click="fechar" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800" :disabled="temErros || !form.nome.trim() || !form.categoria_id">
                {{ tipo ? 'Salvar Alterações' : 'Criar Tipo' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface TipoDocumento {
  id?: string; categoria_id: string; nome: string; descricao: string; requer_periodo: boolean; requer_horas: boolean
  requer_aprovacao: boolean; requer_arquivo: boolean; tem_validade: boolean; dias_validade: number | null
  notificar_vencimento: boolean; dias_aviso_vencimento: number | null; ativo: boolean; ordem: number
}

const props = withDefaults(defineProps<{ tipo?: TipoDocumento | null; categorias: any[] }>(), { tipo: null })
const emit = defineEmits<{ (e: 'close'): void; (e: 'save', data: Omit<TipoDocumento, 'id'>): void }>()

const form = reactive<Omit<TipoDocumento, 'id'>>({
  categoria_id: props.tipo?.categoria_id || '', nome: props.tipo?.nome || '', descricao: props.tipo?.descricao || '',
  requer_periodo: props.tipo?.requer_periodo || false, requer_horas: props.tipo?.requer_horas || false,
  requer_aprovacao: props.tipo?.requer_aprovacao || false, requer_arquivo: props.tipo?.requer_arquivo !== undefined ? props.tipo.requer_arquivo : true,
  tem_validade: props.tipo?.tem_validade || false, dias_validade: props.tipo?.dias_validade || null,
  notificar_vencimento: props.tipo?.notificar_vencimento || false, dias_aviso_vencimento: props.tipo?.dias_aviso_vencimento || 30,
  ativo: props.tipo?.ativo !== undefined ? props.tipo.ativo : true, ordem: props.tipo?.ordem ?? 0,
})

const erros = reactive({ categoria_id: '', nome: '', dias_validade: '' })
const temErros = computed(() => !!(erros.categoria_id || erros.nome || erros.dias_validade))

const validar = (): boolean => {
  let valido = true
  erros.categoria_id = !form.categoria_id ? 'Selecione uma categoria' : ''
  erros.nome = !form.nome?.trim() ? 'Nome é obrigatório' : form.nome.trim().length < 3 ? 'Nome deve ter pelo menos 3 caracteres' : ''
  erros.dias_validade = form.tem_validade && (!form.dias_validade || form.dias_validade < 1) ? 'Informe um número maior que 0' : ''
  return !erros.categoria_id && !erros.nome && !erros.dias_validade
}

const fechar = () => emit('close')

const salvar = () => {
  if (!validar()) return
  emit('save', {
    ...form, nome: form.nome.trim(), descricao: form.descricao.trim(),
    dias_validade: form.tem_validade ? form.dias_validade : null,
    notificar_vencimento: form.tem_validade ? form.notificar_vencimento : false,
    dias_aviso_vencimento: (form.tem_validade && form.notificar_vencimento) ? form.dias_aviso_vencimento : null,
  })
}

watch(() => form.nome, () => { if (erros.nome) validar() })
watch(() => form.categoria_id, () => { if (erros.categoria_id) validar() })
watch(() => form.dias_validade, () => { if (form.tem_validade) validar() })

onMounted(() => {
  document.body.style.overflow = 'hidden'
  const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar() }
  window.addEventListener('keydown', handleEsc)
  onUnmounted(() => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleEsc) })
})
</script>
